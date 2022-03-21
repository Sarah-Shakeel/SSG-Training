const Blog = require('../models/blog-model')
const BusinessError = require('../errors/business-error')
const { MISSING_DATA, FORBIDDEN, BAD_REQUEST, MISSING_ATTRIBUTES, DUPLICATE_DATA, NOT_FOUND } = require('../errors/error-types');

const createBlog = async (body, user) => {
    await checkDuplicateBlog(body)
    const blog = new Blog({
        ...body,
        owner: user._id
    })
    console.log(`I'm here after checking duplicate title.`)
    await validateModel(blog)
    await blog.save()
    return {blog}
}

const checkDuplicateBlog = async (body) => {
    if (body.title) {
        console.log(body.title)
        const userInfo = await Blog.findOne({ title: body.title })
        if (userInfo) {
            throw new BusinessError(DUPLICATE_DATA, "Blog Title already exists. Choose another title for your blog!")
        }
        return userInfo
    }
}

const validateModel = async (model) => {
    try {
        await model.validate();

    const obj = model.toObject();
    delete obj._id;

    return obj;
    } 
    catch ({errors}) {
    const errorsList = Object.keys(errors).map(field => {
        return {
            key: field,
            value: errors[field].message
        }
    });

    throw new BusinessError(MISSING_ATTRIBUTES, "Invalid data provided", errorsList);
    }
}

const fetchBlog = async (_id, user) => {
    const blog = await Blog.findOne({_id, owner: user._id});
    if(!blog) {
        return new BusinessError(NOT_FOUND, 'Blog not found')
    }
    return blog
}

const fetchAllBlogs = async ({ skip=0, limit=0 }, user) => {
    if(skip>=0){
        await user.populate({
            path:'blogs', 
            options: {
                limit: parseInt(limit),
                skip: parseInt(skip)
            }
    })
    return user.blogs
    }
    else if (skip < 0 || limit < 0) {
        return new BusinessError(BAD_REQUEST, 'Limit or Skip value must be non-negative')
    }
}

const updateBlog = async (id, body, user) => {
    const blog = await Blog.findOne({id, owner: user._id});
    console.log(blog)
    const updates = Object.keys(body);
    const allowedUpdates = ['title', 'description'];
    const isValidOperation = updates.every((update)  => {
        return allowedUpdates.includes(update);
    })
    if(!isValidOperation) {
        throw new BusinessError(BAD_REQUEST, "Invalid updates!");
    }

    if(!blog){
        throw new BusinessError(NOT_FOUND, 'Blog not found')
    }  
    else{
        updates.forEach((update) => {
            blog[update] = body[update];
        })
        return blog.save()
    }
}

const deleteBlog = async (_id, user) => {
    const blog = await Blog.findOne({_id, owner: user._id});
        if(!blog) {
        return new BusinessError(NOT_FOUND, 'Blog not found')
        }
        return blog.delete()
    }

module.exports = {
    createBlog,
    updateBlog,
    fetchBlog,
    fetchAllBlogs,
    deleteBlog
}