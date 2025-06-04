/**
 * AnnotationIntegration.js
 *
 * Модуль интеграции компонентов аннотаций с основным приложением Mr.Comic.
 * Обеспечивает связь между компонентами аннотаций и основным приложением.
 *
 * @version 1.0.0
 * @author Manus AI
 */

const AnnotationManager = require('./AnnotationManager');
const AnnotationExportImport = require('./AnnotationExportImport');
const AnnotationExportImportUI = require('./AnnotationExportImportUI');

class AnnotationIntegration {
  /**
   * Создает экземпляр интеграции компонентов аннотаций
   * @param {Object} app - Экземпляр основного приложения
   * @param {Object} options - Параметры инициализации
   */
  constructor(app, options = {}) {
    this.app = app;
    this.options = Object.assign({
      autoInit: true,
      storageKey: 'mr-comic-annotations'
    }, options);
    
    this.annotationManager = null;
    this.exportImport = null;
    this.exportImportUI = null;
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  /**
   * Инициализация интеграции
   */
  init() {
    this.initAnnotationManager();
    this.initExportImport();
    this.initExportImportUI();
    this.registerAppEvents();
  }
  
  /**
   * Инициализация менеджера аннотаций
   */
  initAnnotationManager() {
    this.annotationManager = new AnnotationManager({
      storageKey: this.options.storageKey,
      onChange: this.handleAnnotationsChange.bind(this)
    });
  }
  
  /**
   * Инициализация модуля экспорта/импорта
   */
  initExportImport() {
    this.exportImport = new AnnotationExportImport(this.annotationManager);
  }
  
  /**
   * Инициализация пользовательского интерфейса экспорта/импорта
   */
  initExportImportUI() {
    const theme = this.app.getTheme ? this.app.getTheme() : { mode: 'light' };
    const isEInkMode = this.app.isEInkMode ? this.app.isEInkMode() : false;
    
    this.exportImportUI = new AnnotationExportImportUI(this.annotationManager, {
      parentElement: document.body,
      theme: theme,
      isEInkMode: isEInkMode
    });
  }
  
  /**
   * Регистрация обработчиков событий приложения
   */
  registerAppEvents() {
    // Регистрация события изменения темы
    if (this.app.on && typeof this.app.on === 'function') {
      this.app.on('themeChanged', (theme) => {
        if (this.exportImportUI) {
          this.exportImportUI.updateTheme(theme);
        }
      });
      
      this.app.on('eInkModeChanged', (isEInkMode) => {
        if (this.exportImportUI) {
          this.exportImportUI.updateEInkMode(isEInkMode);
        }
      });
      
      this.app.on('documentOpened', (documentId) => {
        this.currentDocumentId = documentId;
      });
      
      this.app.on('documentClosed', () => {
        this.currentDocumentId = null;
      });
      
      this.app.on('pageChanged', (pageNumber) => {
        this.currentPageNumber = pageNumber;
      });
    }
    
    // Регистрация горячих клавиш
    document.addEventListener('keydown', (e) => {
      // Ctrl+E или Cmd+E для экспорта аннотаций
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        this.showExportDialog();
      }
      
      // Ctrl+I или Cmd+I для импорта аннотаций
      if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
        e.preventDefault();
        this.showImportDialog();
      }
    });
    
    // Добавление кнопок в панель инструментов, если доступно
    if (this.app.addToolbarButton && typeof this.app.addToolbarButton === 'function') {
      this.app.addToolbarButton({
        id: 'export-annotations-button',
        icon: 'export',
        tooltip: 'Экспорт аннотаций',
        onClick: () => this.showExportDialog()
      });
      
      this.app.addToolbarButton({
        id: 'import-annotations-button',
        icon: 'import',
        tooltip: 'Импорт аннотаций',
        onClick: () => this.showImportDialog()
      });
    }
  }
  
  /**
   * Обработчик изменения аннотаций
   * @param {Array} annotations - Обновленный массив аннотаций
   */
  handleAnnotationsChange(annotations) {
    // Уведомляем приложение об изменении аннотаций
    if (this.app.emit && typeof this.app.emit === 'function') {
      this.app.emit('annotationsChanged', annotations);
    }
  }
  
  /**
   * Отображение диалогового окна экспорта аннотаций
   * @param {Array} annotations - Массив аннотаций для экспорта (если не указан, используются все аннотации)
   */
  showExportDialog(annotations) {
    if (this.exportImportUI) {
      this.exportImportUI.showExportDialog(annotations);
    }
  }
  
  /**
   * Отображение диалогового окна импорта аннотаций
   */
  showImportDialog() {
    if (this.exportImportUI) {
      this.exportImportUI.showImportDialog();
    }
  }
  
  /**
   * Получение всех аннотаций
   * @returns {Array} Массив аннотаций
   */
  getAllAnnotations() {
    return this.annotationManager ? this.annotationManager.getAllAnnotations() : [];
  }
  
  /**
   * Получение аннотаций для текущего документа
   * @returns {Array} Массив аннотаций для текущего документа
   */
  getCurrentDocumentAnnotations() {
    if (!this.annotationManager || !this.currentDocumentId) {
      return [];
    }
    
    return this.annotationManager.getAnnotationsByDocument(this.currentDocumentId);
  }
  
  /**
   * Получение аннотаций для текущей страницы
   * @returns {Array} Массив аннотаций для текущей страницы
   */
  getCurrentPageAnnotations() {
    if (!this.annotationManager || !this.currentDocumentId || !this.currentPageNumber) {
      return [];
    }
    
    return this.annotationManager.getAnnotationsByPage(this.currentDocumentId, this.currentPageNumber);
  }
  
  /**
   * Добавление новой аннотации
   * @param {Object} annotationData - Данные аннотации
   * @returns {Object} Созданная аннотация
   */
  addAnnotation(annotationData) {
    if (!this.annotationManager) {
      return null;
    }
    
    // Добавляем информацию о текущем документе и странице, если не указаны
    const data = { ...annotationData };
    
    if (!data.documentId && this.currentDocumentId) {
      data.documentId = this.currentDocumentId;
    }
    
    if (!data.pageNumber && this.currentPageNumber) {
      data.pageNumber = this.currentPageNumber;
    }
    
    return this.annotationManager.addAnnotation(data);
  }
  
  /**
   * Обновление аннотации
   * @param {string} id - ID аннотации
   * @param {Object} annotationData - Новые данные аннотации
   * @returns {Object|null} Обновленная аннотация или null, если аннотация не найдена
   */
  updateAnnotation(id, annotationData) {
    return this.annotationManager ? this.annotationManager.updateAnnotation(id, annotationData) : null;
  }
  
  /**
   * Удаление аннотации
   * @param {string} id - ID аннотации
   * @returns {boolean} Результат операции
   */
  deleteAnnotation(id) {
    return this.annotationManager ? this.annotationManager.deleteAnnotation(id) : false;
  }
  
  /**
   * Экспорт аннотаций в указанном формате
   * @param {string} format - Формат экспорта ('json', 'csv', 'txt')
   * @param {Array} annotations - Массив аннотаций для экспорта
   * @returns {string} Экспортированные данные
   */
  exportAnnotations(format, annotations) {
    return this.exportImport ? this.exportImport.export(format, annotations) : '';
  }
  
  /**
   * Импорт аннотаций из указанного формата
   * @param {string} format - Формат импорта ('json', 'csv')
   * @param {string} data - Данные для импорта
   * @param {Object} options - Параметры импорта
   * @returns {Object} Результат импорта
   */
  importAnnotations(format, data, options) {
    return this.exportImport ? this.exportImport.import(format, data, options) : { success: false, count: 0, errors: ['Модуль экспорта/импорта не инициализирован'] };
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnnotationIntegration;
}
