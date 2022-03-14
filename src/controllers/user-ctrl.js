const db = require('../db/mongoose')
const User = require('../models/user-model')
const _ = require('lodash')
const {consumerForgotPasswordEmail, sendEmail} = require('../services/mail-service')
const userVerification = require('../models/userVerification-model')

const signUpEmailNotification = (email) => {
    return Promise.resolve(sendEmail(email, "Sign up", "Welcome on board!"))
}

const forgotPassword = async (email) => {
    let consumer = await _fetchConsumerByEmail(email)
    console.log(consumer)
    if (_.isEmpty(consumer.resetToken)) {
        consumer.resetToken = "" + Date.now()
    }
    consumer.resetTokenTime = new Date().toISOString()
    await consumer.save()
    consumerForgotPasswordEmail(email, consumer.resetToken)
    return true
}

const _fetchConsumerByEmail = async (email) => {
    let existingConsumer = await User.findOne({email})
    if (existingConsumer) {
        return existingConsumer
    }
    throw new Error(`No user exists with email ${email}`)
    // throw new Error({message: "No consumer exist with email " + email, status: HttpStatus.NOT_FOUND})
}

const resetForgetPassword = (password, confirmPassword) => {
    if (password != confirmPassword) {
        throw new Error(`Password don't match. Kindly try again`)
    }
    
}

const resetPassword = async (resetToken) => {
    console.log("sssssssssssssssssssssssssssssssssssssssssssssssss")
    let consumer = await _fetchConsumerByResetToken(resetToken)
    console.log(consumer)
    let resetTokenDate = new Date(consumer.resetTokenTime)
    const currentDate = new Date()
    if (resetTokenDate.getFullYear() !== currentDate.getFullYear() ||
        resetTokenDate.getMonth() !== currentDate.getMonth() ||
        resetTokenDate.getDate() !== currentDate.getDate()) {
        return {isValid: false}
    }
    console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
    return {isValid: true, resetToken: consumer.resetToken}
}

const _fetchConsumerByResetToken = async (resetToken) => {
    let existingConsumer = await User.findOne({resetToken})
    if (existingConsumer) {
        return existingConsumer
    }
    throw new ApiError({message: "No consumer exists ", http_status_code: 404})
}

module.exports = {
    signUpEmailNotification,
    resetForgetPassword,
    forgotPassword,
    resetPassword
}