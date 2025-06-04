/**
 * index.js
 * 
 * Индексный файл для модуля резервного копирования.
 * Экспортирует все компоненты модуля для использования в приложении.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const BackupManager = require('./BackupManager');
const BackupUI = require('./BackupUI');
const BackupIntegration = require('./BackupIntegration');

// Экспортируем все компоненты
module.exports = {
  BackupManager,
  BackupUI,
  BackupIntegration
};
