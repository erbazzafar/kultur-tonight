const bcrypt = require('bcryptjs')
const { default: prisma } = require('../prismaClient')
const jwt = require('jsonwebtoken')
const sendEmail = require('../sendGrid/sendMail')
const otpEmail = require('../Services/otpEmail')
const welcomeEmail = require('../Services/welcomeEmail')

/**
 * Signup API
 * 1. Validate fields
 * 2. Validate referral code if provided
 * 3. Hash password & create user (otpVerified = false)
 * 4. Send OTP (console log for now)
 */

function generateReferralCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let result = 'REF'
    for (let i = 0; i < 9; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return result
}

async function findUser(id) {
    const user = await prisma.user.findUnique({
        where: {
            id: id
        }
    })
    if (!user) {
        return res.status(404).json({ status: 'fail', message: 'User not found!!' })
    }
    return user
}

const userSignUp = async (req, res) => {
    try {
        const { firstName, lastName, email, password, postCode, referral } = req.body

        // ✅ 1. Required fields
        if (!firstName || !lastName || !email || !password || !postCode) {
            return res.status(400).json({ status: 'fail', message: 'All fields are required' })
        }

        // ✅ 2. Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email }
        })

        if (existingUser) {
            return res.status(400).json({ status: 'fail', message: 'User already exists' })
        }

        let referralCodeRecord = null
        if (referral) {
            // ✅ 3. Validate referral code length
            if (referral.length !== 12) {
                return res.status(400).json({ status: 'fail', message: 'Referral code must be 12 characters long' })
            }

            // ✅ 4. Validate referral code exists
            referralCodeRecord = await prisma.referralCode.findUnique({
                where: { code: referral }
            })
            console.log("----------Referral code record------:", referralCodeRecord);
            if (!referralCodeRecord) {
                return res.status(400).json({ status: 'fail', message: 'Invalid referral code' })
            }
        }

        // ✅ 5. Hash password
        const hashedPassword = await bcrypt.hash(password, 10)

        // ✅ 6. Generate OTP
        const newOtp = Math.floor(100000 + Math.random() * 900000) // 6 digit
        console.log(`OTP for ${email} =>`, newOtp) // Later send via email service

        // ✅ 7. Create new user (no referral code generated yet)
        const newUser = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password: hashedPassword,
                postCode,
                otp: newOtp,
                otpVerified: false
            }
        })

        // ✅ 8. If referral provided → store temp relation
        if (referralCodeRecord) {
            console.log("Referral code record found:", referralCodeRecord);
            await prisma.referralUsage.create({
                data: {
                    referralCodeId: referralCodeRecord.id,
                    usedById: newUser.id,
                    referredById: referralCodeRecord.ownerId
                }
            })
        }

        await sendEmail(
            email,
            'Your OTP Code',
            otpEmail(newOtp, firstName)
        )

        return res.status(200).json({
            status: 'ok',
            message: 'User registered. Please verify OTP sent to your email.'
        })
    } catch (error) {
        console.error('Error in userSignUp:', error)
        return res.status(500).json({ status: 'fail', message: 'Server Error' })
    }
}

const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body

        if (!email || !otp) {
            return res.status(400).json({ status: 'fail', message: 'Email and OTP are required' })
        }

        const user = await prisma.user.findUnique({
            where: { email },
            include: {
                usedReferral: {
                    include: { referralCode: true }  // pull referralCode details
                }
            }
        });

        if (!user) {
            return res.status(404).json({ status: 'fail', message: 'User not found' })
        }

        if (user.otpVerified) {
            return res.status(400).json({ status: 'fail', message: 'User already verified' })
        }

        if (user.otp !== parseInt(otp)) {
            return res.status(400).json({ status: 'fail', message: 'Invalid OTP' })
        }

        // ✅ Create referral code in required format
        const newCode = generateReferralCode()

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                otpVerified: true,
                otp: null,
                referralCode: {
                    create: { code: newCode }
                }
            },
            include: { referralCode: true }
        })

        console.log("before incremention");


        if (user.usedReferral && user.usedReferral.referralCode) {
            console.log("iin between incremention");

            console.log("Incrementing count for referralCodeId:", user.usedReferral.referralCode.id);

            await prisma.referralCode.update({
                where: { id: user.usedReferral.referralCode.id },
                data: { count: { increment: 1 } }
            });
        }

        console.log("after incremention");

        const token = jwt.sign(
            { id: updatedUser.id },
            process.env.JWT_SECRET_KEY,
            { expiresIn: '1d' }
        )

        await sendEmail(
            updatedUser.email, 
            'Welcome to Kultur Tonight', 
            welcomeEmail(updatedUser.firstName, updatedUser.referralCode.code)
        )

        return res.status(200).json({
            status: 'ok',
            message: 'OTP verified successfully',
            data: {
                userId: updatedUser.id,
                email: updatedUser.email,
                referralCode: updatedUser.referralCode.code
            },
            token
        })
    } catch (error) {
        console.error('Error in verifyOtp:', error)
        return res.status(500).json({ status: 'fail', message: 'Server Error' })
    }
}

const getAllRferralCodes = async (req, res) => {
    try {
        const codes = await prisma.referralCode.findMany()
        if (!codes || codes.length === 0) {
            return res.status(404).json({ status: 'fail', message: 'No referral codes found' })
        }
        return res.status(200).json({ status: 'ok', data: codes })
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Server Error' })
    }
}

const getReferralUsages = async (req, res) => {
    try {
        const usages = await prisma.referralUsage.findMany({
            include: {
                referralCode: true,
                usedBy: true,
                referredBy: true
            }
        })
        return res.status(200).json({ status: 'ok', data: usages })
    } catch (error) {
        console.error('Error in getReferralUsages:', error)
        return res.status(500).json({ status: 'fail', message: 'Server Error' })
    }
}

const getUserReferralUsages = async (req, res) => {
    try {
        const userId = parseInt(req.params.id)

        if (!userId) {
            return res.status(400).json({ status: 'fail', message: 'Please provide the user Id' })
        }

        findUser(userId)

        const getUserCodeEntries = await prisma.referralUsage.findMany({
            where: {
                referredById: userId
            },
            include: {
                referralCode: true,
                usedBy: true,
            }
        })

        if (!getUserCodeEntries) {
            return res.status(404).json({ status: 'fail', message: 'User table not found' })
        }

        return res.status(200).json({ status: 'ok', message: 'User table found', data: getUserCodeEntries })


    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'fail', message: 'Server Error' })
    }
}

const getUserReferalCount = async (req, res) => {
    try {
        const userId = parseInt(req.params.id)

        if (!userId) {
            return res.status(400).json({ status: 'fail', message: 'Please provide the user Id' })
        }

        findUser(userId)

        const getCount = await prisma.referralCode.findFirst({
            where: {
                ownerId: userId
            }
        })

        if (!getCount) {
            return res.status(404).json({ status: 'fail', message: 'Referral Code not found for this User' })
        }

        return res.status(200).json({ status: 'ok', message: 'Referral Code Entry found', data: getCount })


    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Server Error' })
    }
}

const allUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany()

        if (users.length === 0 || !users) {
            return res.status(404).json({ status: 'fail', message: 'usern not found' })
        }

        return res.status(200).json({ status: 'ok', message: 'Users fetced successfully !!', data: users })
    } catch (error) {
        return res.status(500).json({ status: 'fail', message: 'Server Error !!' })
    }
}

const tableThroughCode = async (req, res) => {
    try {
        const {referralCode} = req.params
        if (!referralCode || referralCode.length !== 12) {
            return res.status(400).json({status: 'fail', message: 'Referral Code not correct'})
        }

        const findCode = await prisma.referralCode.findUnique({
            where: {
                code: referralCode
            }
        })

        if (!findCode) {
            return res.status(404).json({status: 'fail', message: 'Referral Code not found'})
        }

        const referalTable = await prisma.referralUsage.findMany ({
            where: {
                referralCodeId: parseInt(findCode.id)
            },
            include: {
                usedBy: true
            }
        })

        return res.status(200).json({status: 'ok', message: 'Success', data: referalTable})
        
    } catch (error) {
        console.error(error)
        return res.status(500).json({status: 'fail', message: 'Server Error'})
    }
}


module.exports = {
    userSignUp,
    verifyOtp,
    getReferralUsages,
    getAllRferralCodes,
    getUserReferralUsages,
    getUserReferalCount,
    allUsers,
    tableThroughCode
}