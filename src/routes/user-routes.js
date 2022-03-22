const express = require('express')
const router = express.Router()
const User = require("../models/user-model")
const auth = require('../middleware/auth')
const userCtrl = require('../controllers/user-ctrl')
const nodemailer = require('nodemailer')
const {v4: uuidV4} = require('uuid')
const path = require('path')
const multer = require('multer')
const HttpResponseHandler = require('../errors/handlers/http-error-response-handler')
// const views = require('../views/reset-password.html')

// Signing up a user
router.post('/user', async (req,res) => {
    userCtrl.signUp(req.body).then(({user, token}) => {
        res.status(201).send({user, token});
    }).catch((e) => {
        console.log(e)
        new HttpResponseHandler(res).handleError(e)
    })
})

//Logging in a user
router.get('/user/login', async (req,res) => {
        userCtrl.logIn(req.body.email, req.body.password).then(({user, token}) => {
            res.status(200).send({user, token});
        }).catch((e) => {
            new HttpResponseHandler(res).handleError(e)
        })
})

//Uploading image through multer
const upload = multer({
    dest: 'avatars'
})
router.post('/users/me/avatar', upload.single('avatar'), (req,res) => {
    res.send()
})

// When a user forgets password (email sending service)
router.get('/user/forget-password/:email', (req, res) => {
    userCtrl.forgotPassword(req.params.email)
        .then(() => {
            res.status(200).send({ _message: "Link to reset password has been sent to your email" })
        }).catch((e) => {
            res.status(404).send({ error: e.message })
    })
})

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

//Fetching user profile
router.get('/user/profile', auth, async (req, res) => {
    res.send(req.user)
})

// Fetching all the users with pagination
router.get('/user/fetch-all-users', auth,  async (req,res) => {
    // destructure page and limit and set default values
    const { page , limit } = req.query;
  
    try {
      // execute query with page and limit values
      const users = await User.find()
        .limit(limit * 1)
        .skip((page - 1) * limit)
        .exec();
  
      // get total documents in the Posts collection 
      const count = await User.countDocuments();
  
      // return response with posts, total pages, and current page
      res.json({
        users,
        totalPages: Math.ceil(count / limit),
        currentPage: page
      });
    } catch (err) {
      console.error(err.message);
    }
  });

// router.get('/user/fetch-all-users', auth,  async (req,res) => {
//     // userCtrl.fetchAllUsers(req.query, req.user).then((user) => {
//     //     res.status(200).send({user})
//     // }).catch((e) => {
//     //     console.log(e)
//     //     new HttpResponseHandler(res).handleError(e)
//     // })
//     User.find({}).then((users) => {
//         res.send(users)
//     }).catch((e) => {
//         res.status(400).send()
//     })
// })

// endpoints for resource updation
router.patch('/user/update-user/:id', auth,  async (req,res) => {
    userCtrl.updateUser(req.params.id, req.body).then((user) => {
        res.status(200).send({user})
    }).catch((e) => {
        console.log(e)
        new HttpResponseHandler(res).handleError(e)
    })
})

//endpoint for resource deletion
router.delete("/user/delete-user/:id", auth,  async (req,res) => {
    userCtrl.deleteUser(req.params.id).then((user) => {
        res.status(200).send({user})
    }).catch((e) => {
        console.log(e)
        new HttpResponseHandler(res).handleError(e)
    })
})

module.exports = router