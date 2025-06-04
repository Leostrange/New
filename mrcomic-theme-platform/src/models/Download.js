const mongoose = require('mongoose');

const downloadSchema = new mongoose.Schema({
  themeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Theme',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Может быть анонимная загрузка
  },
  deviceInfo: {
    model: String,
    os: String,
    appVersion: String
  },
  downloadedAt: {
    type: Date,
    default: Date.now
  }
});

// Индексы для аналитики
downloadSchema.index({ themeId: 1 });
downloadSchema.index({ downloadedAt: -1 });
downloadSchema.index({ 'deviceInfo.os': 1 });

const Download = mongoose.model('Download', downloadSchema);

module.exports = Download;
