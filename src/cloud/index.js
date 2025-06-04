/**
 * index.js
 * 
 * Индексный файл для модуля облачной интеграции.
 * Экспортирует все компоненты модуля для использования в приложении.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const GoogleDriveManager = require('./GoogleDriveManager');
const GoogleDriveUI = require('./GoogleDriveUI');
const GoogleDriveIntegration = require('./GoogleDriveIntegration');

// Экспортируем все компоненты
module.exports = {
  GoogleDriveManager,
  GoogleDriveUI,
  GoogleDriveIntegration
};
