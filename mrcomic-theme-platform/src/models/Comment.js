const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  themeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment',
    default: null
  },
  content: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  likes: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }]
}, {
  timestamps: true
});

// Индексы для быстрого поиска
commentSchema.index({ themeId: 1, createdAt: -1 });
commentSchema.index({ parentId: 1 });

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;
