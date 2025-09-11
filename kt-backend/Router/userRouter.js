const express = require('express');
const { userSignUp, verifyOtp, getReferralUsages, getAllRferralCodes, getUserReferralUsages, 
    getUserReferalCount } = require('../Controllers/userController');

const userRouter = express.Router()


userRouter.post('/sign-up', userSignUp)
userRouter.post('/verify-otp', verifyOtp)
userRouter.get('/get-table', getReferralUsages)
userRouter.get('/getAll-codes', getAllRferralCodes)
userRouter.get('/userTable/:id', getUserReferralUsages)
userRouter.get('/userReferalCode/:id', getUserReferalCount)



module.exports = userRouter;