const supertest = require('supertest')
const app = require('../app')
const api = supertest(app)
const mongoose = require('mongoose')
const Blog = require('../models/blog')
const helper = require('./test_helper')
const UserModel = require('../models/user')
const bcrypt = require('bcrypt')

let auth = {}

describe('when there is initially some blogs saved', () => {
  beforeEach(async () => {
    await Blog.deleteMany({})

    /*
    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => blog.save())
    await Promise.all(promiseArray)
    */
    for (let blog of helper.initialBlogs) {
      let blogObject = new Blog(blog)
      await blogObject.save()
    }
  })

  test('blogs are returned as json', async () => {
    await api
      .get('/api/blogs')
      .expect(200)
      .expect('Content-Type', /application\/json/)
  })

  test('All blogs are returned', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body.length).toBe(helper.initialBlogs.length)
  })

  test('the first blog is about React patterns', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].title).toBe('React patterns')
  })

  test('blog has a property id', async () => {
    const response = await api.get('/api/blogs')

    expect(response.body[0].id).toBeDefined()
  })

  describe('viewing a specific blog', () => {
    test('succeeds with a valid id', async () => {
      const blogsAtStart = await helper.blogsInDb()

      const blogToView = blogsAtStart[0]
      // console.log(blogToView)

      const resultBlog = await api
        .get(`/api/blogs/${blogToView.id}`)
        .expect(200)
        .expect('Content-Type', /application\/json/)

      // console.log(resultBlog.body)

      expect(resultBlog.body.title).toEqual(blogToView.title)
    })

    test('fails with statuscode 404 if note does not exist', async () => {
      const validNonexistingId = await helper.nonExistingId()

      // console.log(validNonexistingId)

      await api
        .get(`/api/blogs/${validNonexistingId}`)
        .expect(404)
    })

    test('fails with statuscode 400 id is invalid', async () => {
      const invalidId = '5a3d5da59070081a82a3445'

      await api
        .get(`/api/blogs/${invalidId}`)
        .expect(400)
    })
  })

  describe('Addition of a new blog', () => {
    beforeEach(async () => {
      await UserModel.deleteMany({})
      //const user = new UserModel({ username: 'Petrimus', password: 'salaisuus' })
      const user = { username: 'Petrimus', password: 'salainen' }
      await api
        .post('/api/users')
        .send(user)

      const result = await api
        .post('/api/login')
        .send({
          username: 'Petrimus',
          password: 'salainen'
        })
      // console.log(result)

      auth.token = result.body.token
      // console.log(auth.token)

    })

    test('a valid blog can be added ', async () => {
      const newBlog = {
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', 'Bearer ' + auth.token)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      // console.log(blogsAtEnd)

      expect(blogsAtEnd.length).toBe(helper.initialBlogs.length + 1)

      const titles = blogsAtEnd.map(blog => blog.title)
      //console.log(titles)
      expect(titles).toContain('First class tests')
    })

    test('if likes is omitted, zero will be added', async () => {
      const newBlog =
      {
        title: 'Type wars',
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2016/05/01/TypeWars.html'
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', 'Bearer ' + auth.token)
        .expect(201)
        .expect('Content-Type', /application\/json/)

      const blogsAtEnd = await helper.blogsInDb()
      // console.log(blogsAtEnd)
      const likes = blogsAtEnd[blogsAtEnd.length - 1].likes
      // console.log(likes)

      expect(likes).toBe(0)
    })

    test('blog cannot be added with missing title', async () => {
      const newBlog = {
        author: 'Robert C. Martin',
        url: 'http://blog.cleancoder.com/uncle-bob/2017/05/05/TestDefinitions.htmll',
        likes: 10
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', 'Bearer ' + auth.token)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })

    test('blog cannot be added with missing url', async () => {
      const newBlog = {
        title: 'First class tests',
        author: 'Robert C. Martin',
        likes: 10
      }

      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', 'Bearer ' + auth.token)
        .expect(400)
        .expect('Content-Type', /application\/json/)
    })
  })

  describe('deletion of a blog', () => {
    beforeEach(async () => {
      await UserModel.deleteMany({})
      const passwordHash = await bcrypt.hash('salaisuus', 10)
      const user = new UserModel({
        username: 'Petrimus', name: 'Petri Palmu', passwordHash
      })
      await user.save()
      /* const user = { username: 'Petrimus', password: 'salainen' }
      await api
        .post('/api/users')
        .send(user)
*/
      const result = await api
        .post('/api/login')
        .send({
          username: 'Petrimus',
          password: 'salaisuus'
        })
      // console.log(result)

      auth.token = result.body.token
      // console.log(auth.token)
      await Blog.deleteMany({})
      const savedUser = await UserModel.find({ username: 'Petrimus' })
      // console.log('savedUser ', savedUser[0])

      const newBlog = new Blog({
        title: 'First class tests',
        author: 'Robert C. Martin',
        url: 'http://blogrouterjavajumbo.fi',
        likes: 10,
        user: savedUser[0]._id
      })
      // console.log('token ', auth.token)

      await newBlog.save()
      /*
      await api
        .post('/api/blogs')
        .send(newBlog)
        .set('Authorization', 'Bearer ' + auth.token)
        */
    })

    test('succeed with status code 204 if id is valid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      // console.log(blogToDelete)


      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'Bearer ' + auth.token)
        .expect(204)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length - 1)

      const titles = blogsAtEnd.map(blog => blog.title)

      expect(titles).not.toContain(blogToDelete.title)
    })

    test('failed with status code 401 if id is invalid', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToDelete = blogsAtStart[0]
      // console.log(blogToDelete)

      await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', 'bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InBhbG11cGUiLCJpZCI6IjVkMDc0NTVmYjBmODgxMDRkODJkMmNmMCIsImlhdCI6MTU2MDkyODMyNH0.Jeljp-atQQD5nRunJhu3QG6VLEC2ifB286IhlV5Aing')
        .expect(401)

      const blogsAtEnd = await helper.blogsInDb()
      expect(blogsAtEnd.length).toBe(blogsAtStart.length)

      const titles = blogsAtEnd.map(blog => blog.title)

      expect(titles).toContain(blogToDelete.title)
    })
  })

  describe('update a blog', () => {
    test('blog can be updated with correct information', async () => {
      const blogsAtStart = await helper.blogsInDb()
      const blogToBeUpdated = blogsAtStart[0]
      // console.log(blogToBeUpdated)

      const blogToChange = {
        title: blogToBeUpdated.title,
        author: blogToBeUpdated.author,
        url: blogToBeUpdated.url,
        likes: 111
      }

      await api
        .put(`/api/blogs/${blogToBeUpdated.id}`)
        .send(blogToChange)

      const blogsAtEnd = await helper.blogsInDb()
      const updatedBlog = blogsAtEnd[0]
      // console.log(updatedBlog)

      expect(updatedBlog.likes).toBe(111)
    })
  })
})

describe('when there is initially one user at db', () => {
  beforeEach(async () => {
    await UserModel.deleteMany({})
    const user = new UserModel({ username: 'root', password: 'sekret' })
    await user.save()
  })

  test('creation succeeds with a fresh username', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'palmupe',
      name: 'Petri Palmu',
      password: 'salainen',
    }

    await api
      .post('/api/users')
      .send(newUser)
      .expect(201)
      .expect('Content-Type', /application\/json/)

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length + 1)

    const usernames = usersAtEnd.map(u => u.username)
    expect(usernames).toContain(newUser.username)
  })

  test('creation fails with proper statuscode and message if username already taken', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'root',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username must be unique')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })

  test('creation fail if username or password is less than 3 characters', async () => {
    const usersAtStart = await helper.usersInDb()

    const newUser = {
      username: 'ro',
      name: 'Superuser',
      password: 'salainen',
    }

    const result = await api
      .post('/api/users')
      .send(newUser)
      .expect(400)
      .expect('Content-Type', /application\/json/)

    expect(result.body.error).toContain('username and password must contain atleast 3 characters')

    const usersAtEnd = await helper.usersInDb()
    expect(usersAtEnd.length).toBe(usersAtStart.length)
  })
})

afterAll(() => {
  mongoose.connection.close()
})


