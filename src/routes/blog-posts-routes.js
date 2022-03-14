const express = require('express')
const router = express.Router()
const Blog = require("../models/blog-model")
const auth = require('../middleware/auth')

//CREATE POST
router.post("/post",auth, async (req, res) => {
  // console.log(req.body.description)
  const blog = new Blog({
    title: req.body.title,
    description: req.body.description,
    owner: req.user._id
      });
  try {
    const savedPost = await blog.save()
    res.status(200).send(savedPost);
  } catch (err) {
    res.status(400).send(err);
  }
});

//GET POST
router.get("/post/:id", auth, async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    res.status(200).send(post);
  } catch (err) {
    res.status(400).send(err);
  }
});

//GET ALL POSTS
// GET /tasks?completed=true
// GET /tasks?limit=10&skip=20
router.get("/post", auth, async (req, res) => {
  try {
      await req.user.populate({
          path:'blogs', 
          options: {
              limit: parseInt(req.query.limit),
              skip: parseInt(req.query.skip)
          }
  })
    res.send(req.user.blogs);
  } catch (err) {
    res.status(400).send(err.message);
  }
});

//UPDATE POST
router.put("/post/:id", async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        const updatedPost = await Blog.findByIdAndUpdate(
          req.params.id,
          {
            $set: req.body,
          },
          { new: true }
        );
        res.status(200).send(updatedPost);
      } catch (err) {
        res.status(400).send(err);
      }
    } else {
      res.status(401).send({message: "You can update only your post!"});
    }
  } catch (err) {
    res.status(500).send(err);
  }
});

//DELETE POST
router.delete("/post/:id", async (req, res) => {
  try {
    const post = await Blog.findById(req.params.id);
    if (post.username === req.body.username) {
      try {
        await post.delete();
        res.status(200).send({message: "Post has been deleted..."});
      } catch (err) {
        res.status(404).send({message:"Post not found"});
      }
    } else {
      res.status(401).send({message: "You can delete only your post!"});
    }
  } catch (err) {
    res.status(500).send(err);
  }
});


module.exports = router;