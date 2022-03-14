require('dotenv').config()
const express = require('express');
require('./src/db/mongoose');
const userRouter = require('./src/routes/user-routes');
const postRouter = require('./src/routes/blog-posts-routes')
const cors = require('cors')
const path = require('path')

const app = express();
const port = process.env.PORT || 4500;

const viewsForgetPasswordPath = path.join(__dirname, './src/views/reset-password.html');
const viewsSuccessMessagePath = path.join(__dirname, './src/views/reset-password-success-message.html');

app.use(cors())
app.use(express.json());
app.use(userRouter);
app.use(postRouter)

const multer = require('multer')
const upload = multer({
    dest: 'images'
})

app.post('/upload', upload.single('upload'), (req,res) => {
    res.send()
})


app.set('view engine', 'twig')
// app.set('views', viewsPath);
app.use('/forgetPassword', express.static(viewsForgetPasswordPath))
app.use('/forgetPassword/success_message', express.static(viewsSuccessMessagePath))

app.listen(port, () => {
    console.log('Server is up and running on port ' + port);
})



const jwt = require('jsonwebtoken')

const myFunction = async () => {
    const token = jwt.sign({_id: 'abc123'}, 'ThisIsMyJsonWebToken')
    // console.log(token)

    const data = jwt.verify(token, 'ThisIsMyJsonWebToken')  // this is the secret for verification method of JWT Library -> ThisIsMyJsonWebToken
//                                                             it should be same as given AnimationPlaybackEvent.
// console.log(data)
}

myFunction()


//using express middleware

// app.use((req,res,next) => {
//     console.log(req.method, req.path)
//     next()
// })

// app.use((req,res,next) => {
//     res.status(503).send('Service is currently down. Please co-operate.')
// })