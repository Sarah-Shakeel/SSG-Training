const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken')

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        default: 2,
        validate(value) {
            if(value < 0) {
                throw new Error('Enter a valid age!');
            }
        }
    },
    email: {
        type: String,
        unique: true,
        required: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if(!validator.isEmail(value)) {
                throw new Error('Enter a valid email!');
            }
        }
    },
    password: {
        type: String,
        required: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if(value.toLowerCase().includes('password')) {
                throw new Error('Password cannot contain "password"!');
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
    const user = await User.findOne ({email: email});
    console.log(user);
    if(!user) {
        console.log('There is no user with this email id!')
        throw new Error('Unable to Login!');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if(!isMatch) {
        console.log('Apparently it is saying that there is no match!')
        throw new Error('Unable to Login');
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