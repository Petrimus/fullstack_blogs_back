const testingRouter = require('express').Router()
const BlogModel = require('../models/blog')
const UserModel = require('../models/user')
const CommentModel = require('../models/comment')

testingRouter.post('/reset', async (request, response) => {
  await BlogModel.deleteMany({})
  await UserModel.deleteMany({})
  await CommentModel.deleteMany({})

  response.status(204).end()
})

module.exports = testingRouter