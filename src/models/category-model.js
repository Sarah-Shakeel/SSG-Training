const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    parent_id: {
        type: mongoose.Types.ObjectId,
		default : null
    },
    title: {
        type: String,
        required: true,
        unique: true,
        minlength: 3,
        maxlength: 15
    },
    description: {
        type: String
    },
    slug: {
        type: String
    }
})

categorySchema.virtual('blogs', {
    ref: 'Blog',
    localField: 'parent_id',
    foreignField: 'category_id'
  })

const Category = mongoose.model('Category', categorySchema)

module.exports = Category;