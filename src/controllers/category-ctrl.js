const Category = require('../models/category-model')
const BusinessError = require('../errors/business-error')
const { NOT_FOUND, MISSING_DATA, FORBIDDEN, BAD_REQUEST, MISSING_ATTRIBUTES, DUPLICATE_DATA } = require('../errors/error-types');

const createCategory = async (body) => {
    const category = new Category(body)
    await category.save()
    return category
}

const fetchAllCategories = async ({ skip=0, limit=0 }) => {
    if(skip>=0){
        await user.populate({
            path:'categories', 
            options: {
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
        })
    return user.categories
    }
    else if (skip < 0 || limit < 0) {
        return new BusinessError(BAD_REQUEST, 'Limit or Skip value must be non-negative')
    }
}

const updateCategory = async (id, body) => {
    const category = await Category.findById(id);
    const updates = Object.keys(body)
    const allowedUpdates = ('title')
    const isValidOperation = updates.every((update)  => {
        return allowedUpdates.includes(update);
    })
    if(!isValidOperation) {
        throw new BusinessError(BAD_REQUEST, "Invalid updates!");
    }

    if(!category){
        throw new BusinessError(NOT_FOUND, `Category with this id doesn't exist`)
    }  
    else{
        updates.forEach((update) => {
            category[update] = body[update];
        })
        return category.save()
    }
}

const deleteCategory = async (_id) => {
    const category = await Category.findById(_id);
    if(!category) {
        return new BusinessError(NOT_FOUND, 'Category not found')
    }
    return category.delete()
}

module.exports = {
    createCategory,
    fetchAllCategories,
    updateCategory,
    deleteCategory
}