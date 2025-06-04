const mongoose = require('mongoose');

const themeSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 500
  },
  version: {
    type: String,
    required: true,
    default: '1.0.0'
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  previewImageUrl: {
    type: String,
    required: true
  },
  authorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    average: {
      type: Number,
      default: 0
    },
    count: {
      type: Number,
      default: 0
    }
  },
  downloads: {
    type: Number,
    default: 0
  },
  themeData: {
    colors: {
      primary: String,
      secondary: String,
      accent: String,
      background: String,
      text: String
    },
    fonts: {
      main: String,
      headers: String,
      size: String
    },
    elements: {
      cornerRadius: Number,
      iconStyle: String,
      buttonStyle: String
    }
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

// Индексы для быстрого поиска
themeSchema.index({ name: 'text', description: 'text', tags: 'text' });
themeSchema.index({ authorId: 1 });
themeSchema.index({ 'rating.average': -1 });
themeSchema.index({ downloads: -1 });
themeSchema.index({ createdAt: -1 });

const Theme = mongoose.model('Theme', themeSchema);

module.exports = Theme;
