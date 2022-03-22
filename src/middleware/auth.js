const jwt = require('jsonwebtoken')
const User = require('./../models/user-model')

const auth = async (req, res, next) => {
    try{
        
        const token = req.header('Authorization').replace('Bearer ','')
        const decoded = jwt.verify(token, "ThisIsMyJsonWebToken")
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})

        if(!user) {
            throw new Error('User not found!')
        }
        
        req.user = user
        next()
    }
    catch(error) {
        console.log('here is the error: ', error)
        res.status(400).send('Please authenticate')
    }
}

module.exports = auth