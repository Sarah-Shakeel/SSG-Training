const express = require('express')
const router = express.Router()
const Blog = require("../models/blog-model")
const blogCtrl = require('../controllers/blog-ctrl')
const auth = require('../middleware/auth')
const multer = require('multer')
const HttpResponseHandler = require('../errors/handlers/http-error-response-handler')

//CREATE POST
router.post("/post", auth, async (req, res) => {
  blogCtrl.createBlog(req.body, req.user).then(({blog}) => {
    res.status(201).send({blog});
}).catch((e) => {
    console.log(e)
    new HttpResponseHandler(res).handleError(e)
})
})

//GET POST
router.get("/post/:id", auth, async (req, res) => {
  blogCtrl.fetchBlog(req.params.id, req.user).then((blog) => {
    res.status(200).send({blog});
}).catch((e) => {
    console.log(e)
    new HttpResponseHandler(res).handleError(e)
})
});

//GET ALL POSTS
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
router.get("/post", auth, async (req, res) => {
  blogCtrl.fetchAllBlogs(req.query, req.user).then((blog) => {
    res.status(200).send({blog});
}).catch((e) => {
    console.log(e)
    new HttpResponseHandler(res).handleError(e)
})
});

//UPDATE POST
router.put("/post/:id",auth, async (req, res) => {
  blogCtrl.updateBlog(req.params.id, req.body, req.user).then((blog) => {
    res.status(200).send({blog})
}).catch((e) => {
    console.log(e)
    new HttpResponseHandler(res).handleError(e)
  })
})

//DELETE POST
router.delete("/post/:id", auth, async (req, res) => {
  console.log(`This is after auth function`)
  blogCtrl.deleteBlog(req.params.id, req.user).then((blog) => {
    console.log(`I'm in then of delete post.`)
    res.status(200).send({blog})
}).catch((e) => {
    console.log(e)
    new HttpResponseHandler(res).handleError(e)
})
});

// Upload Image
const upload = multer({
  dest: 'images'
})
router.post('/post/me/image', upload.single('image'), (req,res) => {
  res.send({message: "Image is uploaded successfully"})
})
module.exports = router;