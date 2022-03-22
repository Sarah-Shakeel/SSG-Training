const db = require('../db/mongoose')
const User = require('../models/user-model')
const _ = require('lodash')
const {consumerForgotPasswordEmail, sendEmail} = require('../services/mail-service')
const { validate } = require('../models/user-model')
const BusinessError = require('../errors/business-error');
const {NOT_FOUND, MISSING_DATA, FORBIDDEN, BAD_REQUEST, MISSING_ATTRIBUTES, DUPLICATE_DATA } = require('../errors/error-types');

const signUp = async (body) => {
    await checkDuplicateEmail(body) 
    const user = new User(body)
    await validateModel(user)
    await user.save();
//generating auth token on signing up a user
    const token = await user.generateAuthToken()
    signUpEmailNotification(user.email)
    return {user,token}
}


const checkDuplicateEmail = async (body) => {
    if (body.email) {
        const userInfo = await User.findOne({ email: body.email })
        if (userInfo)
            throw new BusinessError(DUPLICATE_DATA, "Email already exist!")
    }
}


const validateModel = async (model) => {
    try {
        await model.validate();

    const obj = model.toObject();
    delete obj._id;

    return obj;
    } 
    catch ({errors}) {
    const errorsList = Object.keys(errors).map(field => {
        return {
            key: field,
            value: errors[field].message
        }
    });

    throw new BusinessError(MISSING_ATTRIBUTES, "Invalid data provided", errorsList);
    }
}

const signUpEmailNotification = (email) => {
    return Promise.resolve(sendEmail(email, "Sign up", "Welcome on board!"))
}

function ValidateEmail(input) {
    return !!input.match(/^[a-zA-Z0-9.!#$%&'+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)$/)
}

const logIn = async (email, password) => {
    if(ValidateEmail(email)) {
        const user = await User.findByCredentials(email, password);
        //  generating auth token on logging in a user
        const token = await user.generateAuthToken()
        return {user, token}
    }
    throw new BusinessError(BAD_REQUEST, "Enter a valid email!")
}

const fetchAllUsers = async ({ skip=0, limit=0 }) => {
    if(skip>=0){
        await user.populate({
            path:'users', 
            options: {
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
    })
    return users
    }
    else if (skip < 0 || limit < 0) {
        return new BusinessError(BAD_REQUEST, 'Limit or Skip value must be non-negative')
    }
}

const forgotPassword = async (email) => {
    let consumer = await _fetchConsumerByEmail(email)
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

const updateUser = async (id, body) => {
    const updates = Object.keys(body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every((update)  => {
        return allowedUpdates.includes(update);
    })
    if(!isValidOperation) {
        return new BusinessError(BAD_REQUEST, 'Invalid Updates!');
    }
    const user = await User.findById(id);
    updates.forEach((update) => {
        user[update] = body[update];
    })
    await validateModel(user)
    await user.save()
    if(!user) {
        return new BusinessError(NOT_FOUND, "User not found")
    }
    return user
}

const deleteUser = async (id) => {
    const user = await User.findByIdAndDelete(id);
        if(!user) {
            return new BusinessError(NOT_FOUND, "User not found")
        }
        return user
}

module.exports = {
    signUp,
    logIn,
    forgotPassword,
    fetchAllUsers,
    updateUser,
    deleteUser
}