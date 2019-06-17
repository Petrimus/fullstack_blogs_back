// eslint-disable-next-line no-unused-vars
const dummy = (blogs) => {
  return 1
}

const totalLikes = (blogs) => {
  const totalSum = blogs.reduce((sum, blog) => {
    return sum + blog.likes
  }, 0)
  return totalSum
}

const favoriteBlog = (blogs) => {
  blogs.sort((b1, b2) => {
    return b2.likes - b1.likes
  })

  const returnBlog = {
    title: blogs[0].title,
    author: blogs[0].author,
    likes: blogs[0].likes
  }
  return returnBlog
}

const mostBlogs = (blogs) => {

  const list = blogs.reduce((blogCount, blog) => {
    const found = blogCount.filter(b => b.author === blog.author)

    if (found.length > 0) {
      found[0].blogs++
    } else {
      blogCount.push({
        author: blog.author,
        blogs: 1
      })
    }
    return blogCount
  }, [])

  var max = 0
  var toReturn = {}
  for (const obj of list) {
    if (obj.blogs > max) {
      max = obj.blogs
      toReturn = obj
    }
  }
  return toReturn
}

const mostLikes = (blogs) => {
  const list = blogs.reduce((blogCount, blog) => {
    const found = blogCount.filter(b => b.author === blog.author)

    if (found.length > 0) {
      found[0].likes = found[0].likes + blog.likes
    } else {
      blogCount.push({
        author: blog.author,
        likes: blog.likes
      })
    }
    return blogCount
  }, [])
  var max = 0
  var toReturn = {}
  for (const obj of list) {
    if (obj.likes > max) {
      max = obj.likes
      toReturn = obj
    }
  }
  return toReturn
}

module.exports = {
  dummy,
  totalLikes,
  favoriteBlog,
  mostBlogs,
  mostLikes
}