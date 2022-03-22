const router = require("express").Router();
const Category = require("../models/category-model");
const categoryCtrl = require("../controllers/category-ctrl")
const auth = require('../middleware/auth')
const HttpResponseHandler = require('../errors/handlers/http-error-response-handler')

// Create Category
router.post("/category", async (req, res) => {
  categoryCtrl.createCategory(req.body).then((category) => {
    res.status(200).send({category})
  }).catch((e) => {
    new HttpResponseHandler(res).handleError(e)
  })
})


// Get All Categories
router.get("/category", async (req, res) => {
    categoryCtrl.fetchAllCategories(req.query, req.user).then((category) => {
      res.status(200).send({category});
  }).catch((e) => {
      console.log(e)
      new HttpResponseHandler(res).handleError(e)
  })
  });

// Update Category
router.patch('/category/:id', async (req,res) => {
    categoryCtrl.updateCategory(req.params.id, req.body).then((blog) => {
        res.status(200).send({blog})
    }).catch((e) => {
        console.log(e)
        new HttpResponseHandler(res).handleError(e)
      })
})
    
// Deleting Category
router.delete('/category/:id', async (req,res) => {
    categoryCtrl.deleteCategory(req.params.id).then((category) => {
        res.status(200).send({category})
    }).catch((e) => {
        console.log(e)
        new HttpResponseHandler(res).handleError(e)
    })
})    

module.exports = router;