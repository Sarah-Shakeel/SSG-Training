const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')
const BusinessError = require('../errors/business-error');
const { MISSING_DATA, FORBIDDEN, BAD_REQUEST, NOT_FOUND } = require('../errors/error-types');

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true,
        minlength: 4,
        maxlength: 15
        },
    age: {
        type: Number,
        default: 10,
        validate(value) {
            if(value < 0) {
                throw new BusinessError(BAD_REQUEST, 'Enter a valid age!');
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: [true, "Email must be required!"],
        trim: true,
        lowercase: true,
        // validate(value) {
        //     if(!validator.isEmail(value)) {
        //         throw new BusinessError(BAD_REQUEST, 'Enter a valid email!');
        //     }
        // }
        validate: {
            validator: function (value) {
                return validator.isEmail(value);
            },
            message: ({value}) => `${value} is not a valid email`
        },
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new BusinessError(FORBIDDEN, 'Password cannot contain "password"!');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    resetToken: {
        type: String
    },
    resetTokenTime: {
        type: String,
        
    }
})

userSchema.virtual('blogs', {
    ref: 'Blog',
    localField: '_id',
    foreignField: 'owner'
})

userSchema.methods.toJSON = function () {
    const user = this
    const userObject = user.toObject()

    delete userObject.password
    delete userObject.tokens

    return userObject
}

userSchema.methods.generateAuthToken = async function () {
    const user = this
    const token = jwt.sign({_id: user._id.toString()}, 'ThisIsMyJsonWebToken')

    user.tokens = user.tokens.concat({ token })
    await user.save()
    return token
}

userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({email: email});
    console.log(user);
    if(!user) {
        console.log('There is no user with this email id!')
        throw new BusinessError(NOT_FOUND, 'There is no user with this email id!');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        console.log('Apparently it is saying that there is no match!')
        throw new BusinessError(BAD_REQUEST, `Apparently it is saying that password doesn't match!`);
    }
    return user;
}

// Hash the plain text password before saving it
userSchema.pre('save', async function(next) {
    const user = this;

    if(user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, 8);
    }
    next();
})

// Creating a model
const User = mongoose.model('User', userSchema)

module.exports = User;