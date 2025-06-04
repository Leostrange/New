const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
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
  value: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  }
}, {
  timestamps: true
});

// Составной уникальный индекс для предотвращения дублирования оценок
ratingSchema.index({ themeId: 1, userId: 1 }, { unique: true });

const Rating = mongoose.model('Rating', ratingSchema);

module.exports = Rating;
