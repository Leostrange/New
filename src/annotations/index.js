/**
 * index.js
 * 
 * Индексный файл для модуля аннотаций.
 * Экспортирует все компоненты модуля для использования в приложении.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const AnnotationManager = require('./AnnotationManager');
const AnnotationExportImport = require('./AnnotationExportImport');
const AnnotationExportImportUI = require('./AnnotationExportImportUI');
const AnnotationIntegration = require('./AnnotationIntegration');

// Экспортируем все компоненты
module.exports = {
  AnnotationManager,
  AnnotationExportImport,
  AnnotationExportImportUI,
  AnnotationIntegration
};
