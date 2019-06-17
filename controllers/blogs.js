const blogsRouter = require('express').Router()
const BlogModel = require('../models/blog')

blogsRouter.get('/', async (request, response) => {
  const blogs = await BlogModel.find({})

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

  if (body.title === undefined || body.url === undefined) {
    return response.status(400).json({ error: 'title or url missing' })
  }

  const blogModel = new BlogModel({
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes || 0
  })

  try {
    const savedBlog = await blogModel.save()
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