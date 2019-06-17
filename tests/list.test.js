const listHelper = require('../tests/list_helper')
const blogLists = require('../tests/blogs_list')

test('dummy returns one', () => {
  const blogs = []
  const result = listHelper.dummy(blogs)
  expect(result).toBe(1)
})

describe('total likes', () => {
  test('empty list is zero', () => {

    const blogs = []
    const result = listHelper.totalLikes(blogs)
    expect(result).toBe(0)
  })

  test('when list has one blog equals likes of that', () => {
    const result = listHelper.totalLikes(blogLists.oneBlog)
    expect(result).toBe(5)
  })

  test('larger list likes are calculated right', () => {
    const result = listHelper.totalLikes(blogLists.manyBlogs)
    expect(result).toBe(36)
  })

})

describe('blogs with most', () => {
  test('blog with most likes', () => {
    const result = listHelper.favoriteBlog(blogLists.manyBlogs)
    expect(result).toEqual({
      title: 'Canonical string reduction',
      author: 'Edsger W. Dijkstra',
      likes: 12
    })
  })

  test('mostBlog methods return correct object', () => {
    const result = listHelper.mostBlogs(blogLists.manyBlogs)
    expect(result).toEqual({
      author: 'Robert C. Martin',
      blogs: 3
    })
  })

  test('mostLikes method return author with most likes', () => {
    const result = listHelper.mostLikes(blogLists.manyBlogs)
    expect(result).toEqual({
      author: 'Edsger W. Dijkstra',
      likes: 17
    })
  })
})