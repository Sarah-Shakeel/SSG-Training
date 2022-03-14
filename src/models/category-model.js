const mongoose = require('mongoose')

const categorySchema = mongoose.Schema({
    parent_id: {
        type: mongoose.Types.ObjectId,
		default : null
    },
    title: {
        type: String
    },
    description: {
        type: String,
        // ask about limit or no limit
    }
})

const Category = mongoose.model('Category', categorySchema)

module.exports = Category;