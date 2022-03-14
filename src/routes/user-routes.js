const express = require('express')
const router = express.Router()
const User = require("../models/user-model")
const auth = require('../middleware/auth')
const userCtrl = require('../controllers/user-ctrl')
const userVerification = require('../models/userVerification-model')
const nodemailer = require('nodemailer')
const {v4: uuidV4} = require('uuid')
const path = require('path')
const multer = require('multer')
// const views = require('../views/reset-password.html')

// Signing up a user
router.post('/user', async (req,res) => {
    const user = new User(req.body);
// Saving / Adding user by async-await
    try {
        console.log('This is the user', user)
        await user.save();
//  generating auth token on signing up a user
        const token = await user.generateAuthToken()
        res.status(201).send({user, token});
    } catch (e) {
        res.status(400).send(e);
    }
})


//Logging in a user
router.get('/user/login', async (req,res) => {
    try{
        const user = await User.findByCredentials(req.body.email, req.body.password);
//  generating auth token on logging in a user
        const token = await user.generateAuthToken()
        res.send({user, token});
    }
    catch(e) {
        res.status(400).send('There was a problem finding the user!');
    }
})

const upload = multer({
    dest: 'avatars'
})

router.post('/users/me/avatar', upload.single('avatar'), (req,res) => {
    res.send()
})

//Endpoint for Sign up email notification
router.get('/user/sign-up-email-notification/:email', (req, res) => {
     userCtrl.signUpEmailNotification(req.params.email).then(() => {
        res.status(200).send({_message: "Sign up email notification sent!"})
    }).catch((error) => {
        console.log(error)
        res.status(400).send(error)
    })
})

// When a user forgets password (email sending service)
router.get('/user/forget-password/:email', (req, res) => {
    userCtrl.forgotPassword(req.params.email)
        .then(() => {
            res.status(200).send({ _message: "Link to reset password has been sent to your email" })
        }).catch((e) => {
            res.status(404).send({ error: e.message })
        //ApiErrors.sendErrorResponse(res, error)
    })
})

// router.get('/user/reset-forget-password', (req, res) => {
//     userCtrl.resetForgetPassword(req.body.email, req.body.password, req.body.confirmPassword)
//     .then(() => {
//         res.status(200).send({ _message: "Password is changed" })
//     }).catch((e) => {
//         res.status(400).send({ error: e.message })
//     })
// })

// Reset password
router.get("/user/reset-password/:resetToken", (req, res) => {
    // console.log(`I'm here before rest password function`)
    userCtrl.resetPassword(req.params.resetToken)
    // console.log("req.params.resetToken", req.params.resetToken)
        .then((result) => {
            // console.log("aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
            if (result.isValid) {
                console.log("bbbbbbbbbbbbbbbbb")
                res.render("reset-password", {resetToken: result.resetToken})
            } 
            else {
                console.log('Token is expired')
                res.render("expired")
            }
        })
        .catch((error) => {
            console.log('This is the error => ', error)
            res.status(400).send({error})
        //ApiErrors.sendErrorResponse(res, error)
    })
})

// // fetch post detail
// router.get('/user/post-detail', (req, res) => {
//     userCtrl.getPostDetail(req.params.email).then((data) => {
//        res.status(200).send(data)
//    }).catch((error) => {
//        console.log(error)
//        res.status(400).send(error)
//    })
// })

// // Listing API with pagination
// router.get('/user/post-listing-and search', (req, res) => {
//     userCtrl.postListingAndSearch(req.params.email).then(() => {
//        res.status(200).send({_message: "Sign up email notification sent!"})
//    }).catch((error) => {
//        console.log(error)
//        res.status(400).send(error)
//    })
// })

// endpoints for resource updation
router.patch('/update-user/:id', auth,  async (req,res) => {
    
    const updates = Object.keys(req.body);
    const allowedUpdates = ['name', 'age', 'email', 'password'];
    const isValidOperation = updates.every((update)  => {
        return allowedUpdates.includes(update);
    })
    if(!isValidOperation) {
        return res.status(400).send({ error: 'Invalid Updates!'});
    }
    try {

        const user = await User.findById(req.params.id);
        updates.forEach((update) => {
            user[update] = req.body[update];
        })

    // middleware is executing here in below line
        await user.save()

        //const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if(!user) {
            return res.status(404).send();
        }
        res.send(user);
    } catch (error) {
        res.status(400).send(error);
    }
})

//endpoint for resource deletion
router.delete("/delete-user/:id", auth,  async (req,res) => {
    try {
    const user = await User.findByIdAndDelete(req.params.id);
    
        if(!user) {
        return res.status(404).send();
        }
     res.send(user);

    } catch (error) {
        res.status(500).send(error);
    }
})

module.exports = router