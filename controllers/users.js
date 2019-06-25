const bcrypt = require('bcrypt')
const usersRouter = require('express').Router()
const UserModel = require('../models/user')

usersRouter.post('/', async (request, response, next) => {

  try {
    const body = request.body
    const isUnique = await UserModel.find({ username: body.username })

    if (isUnique.length > 0) {
      return response.status(400).json({ error: 'username must be unique' })
    }

    if (body.username.length < 3 || body.password.length < 3) {
      return response.status(400).json({
        error: 'username and password must contain atleast 3 characters'
      })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new UserModel({
      username: body.username,
      name: body.name,
      passwordHash
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch (exception) {
    next(exception)
  }
})

usersRouter.get('/', async (request, response, next) => {

  try {
    const users = await UserModel
      .find({}).populate('blogs', { title: 1, url: 1, likes: 1 })

    response.json(users.map(blog => blog.toJSON()))
  } catch (exception) {
    next(exception)
  }
})

module.exports = usersRouter