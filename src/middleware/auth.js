const jwt = require('jsonwebtoken')
const User = require('./../models/user-model')

const auth = async (req, res, next) => {
    try{
        
        const token = req.header('Authorization').replace('Bearer ','')
        // console.log("here is the token", token)
        const decoded = jwt.verify(token, "ThisIsMyJsonWebToken")
        // console.log('This is my decoded constant variable', decoded)
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token})
        // console.log('This is the user', user)

        if(!user) {
            throw new Error()
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