/**
 * AnnotationExportImportUI.js
 *
 * Пользовательский интерфейс для экспорта и импорта аннотаций.
 * Предоставляет диалоговые окна и элементы управления для работы с аннотациями.
 *
 * @version 1.0.0
 * @author Manus AI
 */

const AnnotationExportImport = require('./AnnotationExportImport');

class AnnotationExportImportUI {
  /**
   * Создает экземпляр пользовательского интерфейса для экспорта/импорта аннотаций
   * @param {Object} annotationManager - Экземпляр менеджера аннотаций
   * @param {Object} options - Параметры инициализации
   */
  constructor(annotationManager, options = {}) {
    this.annotationManager = annotationManager;
    this.exportImport = new AnnotationExportImport(annotationManager);
    
    this.options = Object.assign({
      parentElement: document.body,
      theme: { mode: 'light' },
      isEInkMode: false
    }, options);
    
    this.theme = this.options.theme;
    this.isEInkMode = this.options.isEInkMode;
    
    this.init();
  }
  
  /**
   * Инициализация пользовательского интерфейса
   */
  init() {
    this.createStyles();
    this.registerHotkeys();
  }
  
  /**
   * Создание стилей компонента
   */
  createStyles() {
    const styleId = 'annotation-export-import-ui-styles';
    
    // Проверяем, не добавлены ли уже стили
    if (document.getElementById(styleId)) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    
    const isDarkMode = this.theme.mode === 'dark';
    const isEInkMode = this.isEInkMode;
    
    const bgColor = isDarkMode ? '#222' : (isEInkMode ? '#fff' : '#f5f5f5');
    const textColor = isDarkMode ? '#eee' : (isEInkMode ? '#000' : '#333');
    const borderColor = isDarkMode ? '#444' : (isEInkMode ? '#000' : '#ddd');
    const overlayColor = isDarkMode ? 'rgba(0, 0, 0, 0.7)' : 'rgba(0, 0, 0, 0.5)';
    
    style.textContent = `
      .annotation-dialog-overlay {
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: ${overlayColor};
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 9999;
      }
      
      .annotation-dialog {
        background-color: ${bgColor};
        color: ${textColor};
        border-radius: 4px;
        box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
        width: 90%;
        max-width: 500px;
        max-height: 90vh;
        display: flex;
        flex-direction: column;
        overflow: hidden;
        transition: ${isEInkMode ? 'none' : 'all 0.2s ease'};
      }
      
      .annotation-dialog-header {
        padding: 16px;
        border-bottom: 1px solid ${borderColor};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .annotation-dialog-title {
        margin: 0;
        font-size: 18px;
        font-weight: 600;
      }
      
      .annotation-dialog-close {
        background: none;
        border: none;
        font-size: 20px;
        cursor: pointer;
        color: ${textColor};
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      
      .annotation-dialog-content {
        padding: 16px;
        overflow-y: auto;
        flex: 1;
      }
      
      .annotation-dialog-footer {
        padding: 16px;
        border-top: 1px solid ${borderColor};
        display: flex;
        justify-content: flex-end;
        gap: 8px;
      }
      
      .annotation-button {
        padding: 8px 16px;
        border-radius: 4px;
        border: 1px solid ${borderColor};
        background-color: ${isDarkMode ? '#333' : '#f0f0f0'};
        color: ${textColor};
        cursor: pointer;
        font-size: 14px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .annotation-button:hover {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
      }
      
      .annotation-button.primary {
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: white;
        border-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .annotation-button.primary:hover {
        background-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .annotation-form-group {
        margin-bottom: 16px;
      }
      
      .annotation-form-label {
        display: block;
        margin-bottom: 8px;
        font-weight: 500;
      }
      
      .annotation-form-input,
      .annotation-form-select,
      .annotation-form-textarea {
        width: 100%;
        padding: 8px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#fff'};
        color: ${textColor};
        font-size: 14px;
      }
      
      .annotation-form-textarea {
        min-height: 150px;
        font-family: monospace;
      }
      
      .annotation-form-checkbox {
        margin-right: 8px;
      }
      
      .annotation-form-help {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
        margin-top: 4px;
      }
      
      .annotation-message {
        padding: 12px;
        margin-bottom: 16px;
        border-radius: 4px;
        font-size: 14px;
      }
      
      .annotation-message.success {
        background-color: ${isDarkMode ? '#143d14' : '#d4edda'};
        color: ${isDarkMode ? '#8fd48f' : '#155724'};
        border: 1px solid ${isDarkMode ? '#1e541e' : '#c3e6cb'};
      }
      
      .annotation-message.error {
        background-color: ${isDarkMode ? '#4d1a1a' : '#f8d7da'};
        color: ${isDarkMode ? '#f5a9a9' : '#721c24'};
        border: 1px solid ${isDarkMode ? '#692424' : '#f5c6cb'};
      }
      
      .annotation-message.warning {
        background-color: ${isDarkMode ? '#4d3d10' : '#fff3cd'};
        color: ${isDarkMode ? '#f5d88f' : '#856404'};
        border: 1px solid ${isDarkMode ? '#6d5616' : '#ffeeba'};
      }
      
      .annotation-message.info {
        background-color: ${isDarkMode ? '#1a3c4d' : '#d1ecf1'};
        color: ${isDarkMode ? '#8fc5d4' : '#0c5460'};
        border: 1px solid ${isDarkMode ? '#245669' : '#bee5eb'};
      }
      
      @media (max-width: 768px) {
        .annotation-dialog {
          width: 95%;
          max-width: none;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Регистрация горячих клавиш
   */
  registerHotkeys() {
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
  }
  
  /**
   * Отображение диалогового окна экспорта аннотаций
   * @param {Array} annotations - Массив аннотаций для экспорта (если не указан, используются все аннотации)
   */
  showExportDialog(annotations) {
    const allAnnotations = this.annotationManager.getAllAnnotations();
    const annotationsToExport = annotations || allAnnotations;
    
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'annotation-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'annotation-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'annotation-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'annotation-dialog-title';
    title.textContent = 'Экспорт аннотаций';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'annotation-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'annotation-dialog-content';
    
    // Информация о количестве аннотаций
    const infoMessage = document.createElement('div');
    infoMessage.className = 'annotation-message info';
    infoMessage.textContent = `Количество аннотаций для экспорта: ${annotationsToExport.length}`;
    
    // Форма экспорта
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleExport(form, annotationsToExport);
    });
    
    // Выбор формата
    const formatGroup = document.createElement('div');
    formatGroup.className = 'annotation-form-group';
    
    const formatLabel = document.createElement('label');
    formatLabel.className = 'annotation-form-label';
    formatLabel.textContent = 'Формат экспорта:';
    
    const formatSelect = document.createElement('select');
    formatSelect.className = 'annotation-form-select';
    formatSelect.name = 'format';
    
    const formats = [
      { value: 'json', text: 'JSON (полные данные)' },
      { value: 'csv', text: 'CSV (табличный формат)' },
      { value: 'txt', text: 'TXT (текстовый формат)' }
    ];
    
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format.value;
      option.textContent = format.text;
      formatSelect.appendChild(option);
    });
    
    formatGroup.appendChild(formatLabel);
    formatGroup.appendChild(formatSelect);
    
    // Предпросмотр
    const previewGroup = document.createElement('div');
    previewGroup.className = 'annotation-form-group';
    
    const previewLabel = document.createElement('label');
    previewLabel.className = 'annotation-form-label';
    previewLabel.textContent = 'Предпросмотр:';
    
    const previewTextarea = document.createElement('textarea');
    previewTextarea.className = 'annotation-form-textarea';
    previewTextarea.readOnly = true;
    
    previewGroup.appendChild(previewLabel);
    previewGroup.appendChild(previewTextarea);
    
    // Обновление предпросмотра при изменении формата
    formatSelect.addEventListener('change', () => {
      const format = formatSelect.value;
      try {
        const exportData = this.exportImport.export(format, annotationsToExport);
        previewTextarea.value = exportData;
      } catch (error) {
        previewTextarea.value = `Ошибка при создании предпросмотра: ${error.message}`;
      }
    });
    
    // Инициализация предпросмотра
    formatSelect.dispatchEvent(new Event('change'));
    
    form.appendChild(infoMessage);
    form.appendChild(formatGroup);
    form.appendChild(previewGroup);
    
    content.appendChild(form);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'annotation-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'annotation-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const exportButton = document.createElement('button');
    exportButton.className = 'annotation-button primary';
    exportButton.type = 'submit';
    exportButton.textContent = 'Экспортировать';
    exportButton.addEventListener('click', () => {
      form.dispatchEvent(new Event('submit'));
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(exportButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Обработка экспорта аннотаций
   * @param {HTMLFormElement} form - Форма экспорта
   * @param {Array} annotations - Массив аннотаций для экспорта
   */
  handleExport(form, annotations) {
    const format = form.format.value;
    
    try {
      const exportData = this.exportImport.export(format, annotations);
      
      // Создаем ссылку для скачивания
      const blob = new Blob([exportData], { type: this.getMimeType(format) });
      const url = URL.createObjectURL(blob);
      
      const downloadLink = document.createElement('a');
      downloadLink.href = url;
      downloadLink.download = `annotations_export_${new Date().toISOString().slice(0, 10)}.${format}`;
      downloadLink.style.display = 'none';
      
      document.body.appendChild(downloadLink);
      downloadLink.click();
      
      // Очистка
      setTimeout(() => {
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
      }, 100);
      
      // Закрываем диалог
      const overlay = document.querySelector('.annotation-dialog-overlay');
      if (overlay) {
        document.body.removeChild(overlay);
      }
    } catch (error) {
      console.error('Ошибка при экспорте аннотаций:', error);
      
      // Показываем сообщение об ошибке
      const content = form.closest('.annotation-dialog-content');
      
      const errorMessage = document.createElement('div');
      errorMessage.className = 'annotation-message error';
      errorMessage.textContent = `Ошибка при экспорте: ${error.message}`;
      
      content.insertBefore(errorMessage, form);
      
      // Удаляем сообщение через 5 секунд
      setTimeout(() => {
        if (errorMessage.parentNode) {
          errorMessage.parentNode.removeChild(errorMessage);
        }
      }, 5000);
    }
  }
  
  /**
   * Отображение диалогового окна импорта аннотаций
   */
  showImportDialog() {
    // Создаем оверлей
    const overlay = document.createElement('div');
    overlay.className = 'annotation-dialog-overlay';
    
    // Создаем диалоговое окно
    const dialog = document.createElement('div');
    dialog.className = 'annotation-dialog';
    
    // Заголовок
    const header = document.createElement('div');
    header.className = 'annotation-dialog-header';
    
    const title = document.createElement('h2');
    title.className = 'annotation-dialog-title';
    title.textContent = 'Импорт аннотаций';
    
    const closeButton = document.createElement('button');
    closeButton.className = 'annotation-dialog-close';
    closeButton.innerHTML = '&times;';
    closeButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    header.appendChild(title);
    header.appendChild(closeButton);
    
    // Содержимое
    const content = document.createElement('div');
    content.className = 'annotation-dialog-content';
    
    // Форма импорта
    const form = document.createElement('form');
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleImport(form);
    });
    
    // Выбор формата
    const formatGroup = document.createElement('div');
    formatGroup.className = 'annotation-form-group';
    
    const formatLabel = document.createElement('label');
    formatLabel.className = 'annotation-form-label';
    formatLabel.textContent = 'Формат импорта:';
    
    const formatSelect = document.createElement('select');
    formatSelect.className = 'annotation-form-select';
    formatSelect.name = 'format';
    
    const formats = [
      { value: 'auto', text: 'Автоопределение' },
      { value: 'json', text: 'JSON' },
      { value: 'csv', text: 'CSV' }
    ];
    
    formats.forEach(format => {
      const option = document.createElement('option');
      option.value = format.value;
      option.textContent = format.text;
      formatSelect.appendChild(option);
    });
    
    formatGroup.appendChild(formatLabel);
    formatGroup.appendChild(formatSelect);
    
    // Данные для импорта
    const dataGroup = document.createElement('div');
    dataGroup.className = 'annotation-form-group';
    
    const dataLabel = document.createElement('label');
    dataLabel.className = 'annotation-form-label';
    dataLabel.textContent = 'Данные для импорта:';
    
    const dataTextarea = document.createElement('textarea');
    dataTextarea.className = 'annotation-form-textarea';
    dataTextarea.name = 'data';
    dataTextarea.placeholder = 'Вставьте данные для импорта или перетащите файл сюда';
    
    const dataHelp = document.createElement('div');
    dataHelp.className = 'annotation-form-help';
    dataHelp.textContent = 'Вы можете вставить данные напрямую или перетащить файл в поле выше.';
    
    dataGroup.appendChild(dataLabel);
    dataGroup.appendChild(dataTextarea);
    dataGroup.appendChild(dataHelp);
    
    // Опции импорта
    const optionsGroup = document.createElement('div');
    optionsGroup.className = 'annotation-form-group';
    
    const optionsLabel = document.createElement('label');
    optionsLabel.className = 'annotation-form-label';
    optionsLabel.textContent = 'Опции импорта:';
    
    const replaceOption = document.createElement('div');
    
    const replaceCheckbox = document.createElement('input');
    replaceCheckbox.type = 'checkbox';
    replaceCheckbox.className = 'annotation-form-checkbox';
    replaceCheckbox.name = 'replace';
    replaceCheckbox.id = 'replace-checkbox';
    
    const replaceLabel = document.createElement('label');
    replaceLabel.htmlFor = 'replace-checkbox';
    replaceLabel.textContent = 'Заменить существующие аннотации';
    
    replaceOption.appendChild(replaceCheckbox);
    replaceOption.appendChild(replaceLabel);
    
    const skipOption = document.createElement('div');
    
    const skipCheckbox = document.createElement('input');
    skipCheckbox.type = 'checkbox';
    skipCheckbox.className = 'annotation-form-checkbox';
    skipCheckbox.name = 'skipDuplicates';
    skipCheckbox.id = 'skip-checkbox';
    skipCheckbox.checked = true;
    
    const skipLabel = document.createElement('label');
    skipLabel.htmlFor = 'skip-checkbox';
    skipLabel.textContent = 'Пропускать дубликаты';
    
    skipOption.appendChild(skipCheckbox);
    skipOption.appendChild(skipLabel);
    
    optionsGroup.appendChild(optionsLabel);
    optionsGroup.appendChild(replaceOption);
    optionsGroup.appendChild(skipOption);
    
    form.appendChild(formatGroup);
    form.appendChild(dataGroup);
    form.appendChild(optionsGroup);
    
    // Обработка перетаскивания файлов
    dataTextarea.addEventListener('dragover', (e) => {
      e.preventDefault();
      dataTextarea.style.borderColor = '#007bff';
    });
    
    dataTextarea.addEventListener('dragleave', () => {
      dataTextarea.style.borderColor = '';
    });
    
    dataTextarea.addEventListener('drop', (e) => {
      e.preventDefault();
      dataTextarea.style.borderColor = '';
      
      const file = e.dataTransfer.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          dataTextarea.value = event.target.result;
          
          // Автоопределение формата
          if (formatSelect.value === 'auto') {
            const detectedFormat = this.exportImport.detectFormat(dataTextarea.value);
            
            for (let i = 0; i < formatSelect.options.length; i++) {
              if (formatSelect.options[i].value === detectedFormat) {
                formatSelect.selectedIndex = i;
                break;
              }
            }
          }
        };
        reader.readAsText(file);
      }
    });
    
    content.appendChild(form);
    
    // Футер
    const footer = document.createElement('div');
    footer.className = 'annotation-dialog-footer';
    
    const cancelButton = document.createElement('button');
    cancelButton.className = 'annotation-button';
    cancelButton.type = 'button';
    cancelButton.textContent = 'Отмена';
    cancelButton.addEventListener('click', () => {
      document.body.removeChild(overlay);
    });
    
    const importButton = document.createElement('button');
    importButton.className = 'annotation-button primary';
    importButton.type = 'submit';
    importButton.textContent = 'Импортировать';
    importButton.addEventListener('click', () => {
      form.dispatchEvent(new Event('submit'));
    });
    
    footer.appendChild(cancelButton);
    footer.appendChild(importButton);
    
    // Собираем диалог
    dialog.appendChild(header);
    dialog.appendChild(content);
    dialog.appendChild(footer);
    
    overlay.appendChild(dialog);
    document.body.appendChild(overlay);
  }
  
  /**
   * Обработка импорта аннотаций
   * @param {HTMLFormElement} form - Форма импорта
   */
  handleImport(form) {
    const format = form.format.value;
    const data = form.data.value;
    const replace = form.replace.checked;
    const skipDuplicates = form.skipDuplicates.checked;
    
    if (!data) {
      this.showImportMessage(form, 'error', 'Данные для импорта не указаны');
      return;
    }
    
    try {
      // Определяем формат, если выбрано автоопределение
      let actualFormat = format;
      if (format === 'auto') {
        actualFormat = this.exportImport.detectFormat(data);
        if (actualFormat === 'unknown') {
          this.showImportMessage(form, 'error', 'Не удалось определить формат данных');
          return;
        }
      }
      
      // Импортируем данные
      const result = this.exportImport.import(actualFormat, data, {
        replace,
        skipDuplicates
      });
      
      if (result.success) {
        // Показываем сообщение об успехе
        this.showImportMessage(form, 'success', `Импорт успешно завершен. Импортировано аннотаций: ${result.count}`);
        
        // Закрываем диалог через 2 секунды
        setTimeout(() => {
          const overlay = document.querySelector('.annotation-dialog-overlay');
          if (overlay) {
            document.body.removeChild(overlay);
          }
        }, 2000);
      } else {
        // Показываем сообщение об ошибке
        const errorMessage = result.errors.join('\n');
        this.showImportMessage(form, 'error', `Ошибка при импорте: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Ошибка при импорте аннотаций:', error);
      this.showImportMessage(form, 'error', `Ошибка при импорте: ${error.message}`);
    }
  }
  
  /**
   * Отображение сообщения при импорте
   * @param {HTMLFormElement} form - Форма импорта
   * @param {string} type - Тип сообщения ('success', 'error', 'warning', 'info')
   * @param {string} text - Текст сообщения
   */
  showImportMessage(form, type, text) {
    // Удаляем предыдущие сообщения
    const previousMessages = form.querySelectorAll('.annotation-message');
    previousMessages.forEach(message => {
      message.parentNode.removeChild(message);
    });
    
    // Создаем новое сообщение
    const message = document.createElement('div');
    message.className = `annotation-message ${type}`;
    message.textContent = text;
    
    // Добавляем сообщение в начало формы
    form.insertBefore(message, form.firstChild);
    
    // Удаляем сообщение через 5 секунд, если это не сообщение об успехе
    if (type !== 'success') {
      setTimeout(() => {
        if (message.parentNode) {
          message.parentNode.removeChild(message);
        }
      }, 5000);
    }
  }
  
  /**
   * Получение MIME-типа для формата экспорта
   * @param {string} format - Формат экспорта
   * @returns {string} MIME-тип
   */
  getMimeType(format) {
    switch (format.toLowerCase()) {
      case 'json':
        return 'application/json';
      case 'csv':
        return 'text/csv';
      case 'txt':
        return 'text/plain';
      default:
        return 'text/plain';
    }
  }
  
  /**
   * Обновление темы оформления
   * @param {Object} theme - Новые настройки темы
   */
  updateTheme(theme) {
    this.theme = theme || { mode: 'light' };
    this.createStyles();
  }
  
  /**
   * Обновление режима E-Ink
   * @param {boolean} isEInkMode - Флаг режима E-Ink
   */
  updateEInkMode(isEInkMode) {
    this.isEInkMode = isEInkMode;
    this.createStyles();
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnnotationExportImportUI;
}
