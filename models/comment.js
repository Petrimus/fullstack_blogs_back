const mongoose = require('mongoose')
mongoose.set('useFindAndModify', false)

const commentSchema = mongoose.Schema({
  content: {
    type: String,
    required: true,
    minlength: 5
  }
})

commentSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id
    delete returnedObject._id
    delete returnedObject.__v
  }
})

const Comment = mongoose.model('Comment', commentSchema)

module.exports = Comment