/**
 * index.js
 * 
 * Индексный файл для модуля синхронизации.
 * Экспортирует все компоненты модуля для использования в приложении.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const SyncManager = require('./SyncManager');
const SyncUI = require('./SyncUI');
const SyncIntegration = require('./SyncIntegration');

// Экспортируем все компоненты
module.exports = {
  SyncManager,
  SyncUI,
  SyncIntegration
};
