const mongoose = require('mongoose')

const userVerificationSchema = mongoose.Schema({
    userId: {
        type: String
    },
    uniqueString: {
        type: String
    },
    createdAt: {
        type: Date
    },
    expiresAt: {
        type: Date
    }
})

const userVerification = mongoose.model('userVerification', userVerificationSchema)

module.exports = userVerification;