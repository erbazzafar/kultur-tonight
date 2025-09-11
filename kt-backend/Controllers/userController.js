const bcrypt = require('bcryptjs')
const { default: prisma } = require('../prismaClient')

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
        where: id
    })
    if (!user) {
        return res.status(404).json({status: 'fail', message: 'User not found!!'})
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
            await prisma.referralUsage.create({
                data: {
                    referralCodeId: referralCodeRecord.id,
                    usedById: newUser.id,          // the new user
                    referredById: referralCodeRecord.ownerId // the referrer
                }
            })
        }

        return res.status(201).json({
            status: 'ok',
            message: 'User registered. Please verify OTP sent to your email.',
            data: newUser
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
            include: { usedReferral: true }
        })

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

        if (user.usedReferral) {
            await prisma.referralCode.update({
                where: { id: user.usedReferral.referralCodeId },
                data: { count: { increment: 1 } }
            })
        }

        return res.status(200).json({
            status: 'ok',
            message: 'OTP verified successfully',
            data: {
                userId: updatedUser.id,
                email: updatedUser.email,
                referralCode: updatedUser.referralCode.code
            }
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
            return res.status(404).json({status: 'fail', message: 'No referral codes found' })
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
        const {id} = req.params
        const user = await prisma.user.findUnique({
            where: {
                id: parseInt(id)
            }
        })

        if (!user) {
            return res.status(404).json({status: 'fail', message: 'User not found !!'})
        }

        const getUserCodeEntries = await prisma.referralUsage.findMany({
            where: {
                referredById: parseInt(id)
            },
            include: {
                referralCode: true,
                usedBy: true,
            }
        })

        if (!getUserCodeEntries){
            return res.status(404).json({status: 'fail', message: 'User table not found'})
        } 

        return res.status(200).json({status: 'ok', message: 'User table found', data: getUserCodeEntries})


    } catch (error) {
        console.error(error)
        return res.status(500).json({ status: 'fail', message: 'Server Error' })
    }
}

const getUserReferalCount = async (req, res) => {
    try {
        const userId = parseInt(req.params.id)

        if (!userId) {
            return res.status(400).json({status: 'fail', message: 'Please provide the user Id'})
        }

        const user = findUser(userId)

        const getCount = await prisma.referralCode.findFirst({
            where: {
                ownerId: userId
            }
        })

        if (!getCount) {
            return res.status(404).json({status: 'fail', message: 'Referral Code not found for this User'})
        }

        return res.status(200).json({status: 'ok', message: 'Referral Code Entry found', data: getCount})


    } catch (error) {
        return res.status(500).json({status: 'fail', message: 'Server Error'})
    }
}

module.exports = {
    userSignUp,
    verifyOtp,
    getReferralUsages,
    getAllRferralCodes,
    getUserReferralUsages,
    getUserReferalCount
}