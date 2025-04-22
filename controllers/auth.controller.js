const crypto = require('crypto')
const User = require('../models/User.models')
const asyncHandler = require('../middleware/async.middleware')
const ErrorResponse = require('../utils/errorResponse.utils')
const sendEmail = require('../utils/sendEmail.utils')

// @desc      Register
// @route     Post /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, _next) => {
    const {
        username,
        email,
        password,
        phone,
        role
    } = req.body;

    //Create User
    const user = await User.create({
        username,
        email,
        password,
        phone,
        role
    })

const option = {
    email: email,
    subject: "registration",
    message: "welcome to eecommerce"
}

sendEmail(option);

console.log("sendTokenResponse");
    sendTokenResponse(user, 200, res)
    
})


// @desc      Login
// @route     Post /api/v1/auth/login
// @access    Public
exports.login = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body

    // Validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400))
    }

    // Check User
    const user = await User.findOne({ email }).select('+password')

    if (!user) {
        return next(new ErrorResponse('User not found', 404))
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password)

    if (!isMatch) {
        return next(new ErrorResponse('Invalid Credentials', 400))
    }

    if (user.status === 'Banned') {
        return next(new ErrorResponse('You are blocked by admin!!!', 400))
    }

    sendTokenResponse(user, 200, res)
})


// @desc      forgotpassword
// @route     Get /api/v1/auth/forgotpassword
// @access    Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    const user = await User.findOne({ email: req.body.email })

    if (!user) {
        return next(new ErrorResponse('There is no user with that email', 404))
    }

    // get Reset token
    const resetToken = user.getResetPasswordToken()

    // console.log(resetToken)

    await user.save({ validateBeforeSave: false })

    const resetUrl = `http://localhost:5000/reset-password/${resetToken}`

    const message = `You are receiving this email because you (or someone else) has requested the reset of a password. Please open this url: \n\n ${resetUrl}`

    try {
        await sendEmail({
            email: user.email,
            subject: 'Password reset token',
            message
        })

        res.status(200).json({ success: true, message: "Email Sent!" })
    } catch (err) {
        user.resetPasswordToken = undefined
        user.resetPasswordExpire = undefined

        await user.save({ validateBeforeSave: false })

        return next(new ErrorResponse('Email could not be sent', 500))
    }

    // sendTokenResponse(user, 200, res)
})

// @desc      reset password
// @route     Get /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
    // Get hashed token
    const resetPasswordToken = crypto
        .createHash('sha256')
        .update(req.params.resettoken)
        .digest('hex')

    const user = await User.findOne({ resetPasswordToken: resetPasswordToken, resetPasswordExpire: { $gt: Date.now() } })

    if (!user) {
        return next(new ErrorResponse('Invalid token or Token Expired', 400))
    }

    // Set new password
    user.password = req.body.password
    user.resetPasswordToken = undefined
    user.resetPasswordExpire = undefined

    await user.save()

    res.status(200).json({ success: true, message: "Password updated successfully." })
})


// Token Response
const sendTokenResponse = (user, statusCode, res, req) => {
    // Create token
    const token = user.getSignedJwtToken();
    res.status(statusCode).json({ statusCode, data: { token } })
}

