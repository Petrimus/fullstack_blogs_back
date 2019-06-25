const blogsRouter = require('express').Router()
const BlogModel = require('../models/blog')
const UserModel = require('../models/user')
const jwt = require('jsonwebtoken')


blogsRouter.get('/', async (request, response) => {
  // console.log(request)

  const blogs = await BlogModel
    .find({}).populate('user', { username: 1, name: 1 })

  response.json(blogs.map(blog => blog.toJSON()))
})

blogsRouter.get('/:id', async (request, response, next) => {
  try {
    const foundBlog = await BlogModel.findById(request.params.id)
    if (foundBlog) {
      response.json(foundBlog.toJSON())
    } else {
      response.status(404).end()
    }
  } catch (exception) {
    next(exception)
  }

  /*
    BlogModel.findById(request.params.id)
      .then(blog => {
        if (blog) {
          response.json(blog.toJSON())
        } else {
          response.status(404).end()
        }
      })
      .catch(error => next(error))
      */
})

blogsRouter.post('/', async (request, response, next) => {
  const body = request.body

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    const user = await UserModel.findById(decodedToken.id)

    if (body.title === undefined || body.url === undefined) {
      return response.status(400).json({ error: 'title or url missing' })
    }

    const blogModel = new BlogModel({
      title: body.title,
      author: body.author,
      url: body.url,
      likes: body.likes || 0,
      user: user._id
    })

    const savedBlog = await blogModel.save()
    user.blogs = user.blogs.concat(savedBlog._id)
    await user.save()
    const savedAndFormattedBlog = savedBlog.toJSON()
    response.status(201).json(savedAndFormattedBlog)
  } catch (exception) {
    next(exception)
  }
})

/*
  blogModel.save()
    .then(savedBlog => savedBlog.toJSON())
    .then(savedAndFormattedBlog => {
      response.status(201).json(savedAndFormattedBlog)
    })
    .catch(error => next(error))
})
*/

blogsRouter.delete('/:id', async (request, response, next) => {

  try {
    const decodedToken = jwt.verify(request.token, process.env.SECRET)
    if (!request.token || !decodedToken.id) {
      return response.status(401).json({ error: 'token missing or invalid' })
    }

    // console.log(request.param.id)

    const blog = await BlogModel.findById(request.params.id)
    // console.log(blog)
    // console.log(decodedToken.id)

    if (blog.user.toString() !== decodedToken.id) {
      return response.status(401).json({ error: 'wrong user' })
    }

    await BlogModel.findByIdAndRemove(request.params.id)
    response.status(204).end()
  } catch (exception) {
    next(exception)
  }

  /*
    BlogModel.findByIdAndRemove(request.params.id)
      .then(() => {
        response.status(204).end()
      })
      .catch(error => next(error))
      */
})

blogsRouter.put('/:id', async (request, response, next) => {
  const body = request.body

  const blogToChange = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  }

  try {
    const savedUpdatedBlog = await BlogModel.findByIdAndUpdate(request.params.id, blogToChange, { new: true })
    response.json(savedUpdatedBlog.toJSON())
  } catch (exception) {
    next(exception)
  }
  /*
  BlogModel
    .findByIdAndUpdate(request.params.id, blogToChange, { new: true })
    .then(updatedBlog => {
      response.json(updatedBlog.toJSON())
    })
    .catch(error => next(error))
    */
})

module.exports = blogsRouter