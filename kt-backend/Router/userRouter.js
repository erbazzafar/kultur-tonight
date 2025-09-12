const express = require('express');
const { userSignUp, verifyOtp, getReferralUsages, getAllRferralCodes, getUserReferralUsages, 
    getUserReferalCount, 
    allUsers,
    tableThroughCode} = require('../Controllers/userController');
const authMiddleware = require('../Authenticate/auth');

const userRouter = express.Router()


userRouter.post('/sign-up', userSignUp)
userRouter.post('/verify-otp', verifyOtp)
userRouter.get('/get-table', getReferralUsages)
userRouter.get('/getAll-codes', getAllRferralCodes)
userRouter.get('/userTable/:id', authMiddleware, getUserReferralUsages)
userRouter.get('/userReferalCode/:id', getUserReferalCount)
userRouter.get('/getAll', allUsers)
userRouter.get('/referalUsage/:referralCode', tableThroughCode)



module.exports = userRouter;