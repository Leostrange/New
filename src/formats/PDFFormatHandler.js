/**
 * PDFFormatHandler.js
 * 
 * Обработчик формата PDF для интеграции с основным приложением
 */

import PDFParser from './PDFParser';

class PDFFormatHandler {
  /**
   * Создает экземпляр PDFFormatHandler
   * @param {Object} options - Настройки обработчика
   * @param {boolean} options.extractText - Извлекать ли текст из PDF
   * @param {boolean} options.renderPages - Рендерить ли страницы PDF
   * @param {boolean} options.preserveFormatting - Сохранять ли форматирование текста
   */
  constructor(options = {}) {
    this.options = {
      extractText: true,
      renderPages: true,
      preserveFormatting: true,
      ...options
    };
    
    this.parser = new PDFParser({
      preserveFormatting: this.options.preserveFormatting,
      extractImages: false,
      dpi: 300
    });
    
    this.document = null;
    this.textContent = [];
    this.metadata = {};
  }

  /**
   * Проверяет, является ли файл PDF-документом
   * @param {ArrayBuffer|Uint8Array} data - Бинарные данные файла
   * @returns {Promise<boolean>} - true, если файл является PDF
   */
  async canHandle(data) {
    // Проверяем сигнатуру PDF (%PDF-)
    if (data instanceof ArrayBuffer) {
      data = new Uint8Array(data);
    }
    
    if (!(data instanceof Uint8Array)) {
      return false;
    }
    
    const signature = [0x25, 0x50, 0x44, 0x46, 0x2D]; // %PDF-
    
    if (data.length < signature.length) {
      return false;
    }
    
    for (let i = 0; i < signature.length; i++) {
      if (data[i] !== signature[i]) {
        return false;
      }
    }
    
    return true;
  }

  /**
   * Загружает PDF-документ
   * @param {ArrayBuffer|Uint8Array} data - Бинарные данные PDF-файла
   * @returns {Promise<boolean>} - Результат загрузки
   */
  async loadDocument(data) {
    try {
      const result = await this.parser.loadDocument(data);
      
      if (result) {
        this.document = data;
        this.metadata = this.parser.getMetadata();
        
        if (this.options.extractText) {
          this.textContent = await this.parser.extractText();
        }
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при загрузке PDF:', error);
      return false;
    }
  }

  /**
   * Получает количество страниц в документе
   * @returns {number} - Количество страниц
   */
  getPageCount() {
    return this.parser.pageCount || 0;
  }

  /**
   * Получает текст со страницы
   * @param {number} pageNum - Номер страницы (с 1)
   * @returns {string} - Текст страницы
   */
  getPageText(pageNum) {
    const page = this.textContent.find(p => p.pageNum === pageNum);
    return page ? page.text : '';
  }

  /**
   * Получает весь текст документа
   * @returns {string} - Полный текст документа
   */
  getAllText() {
    return this.textContent.map(page => page.text).join('\n\n');
  }

  /**
   * Рендерит страницу PDF в canvas
   * @param {number} pageNum - Номер страницы (с 1)
   * @param {HTMLCanvasElement} canvas - Canvas для рендеринга
   * @param {number} scale - Масштаб рендеринга
   * @returns {Promise<void>}
   */
  async renderPage(pageNum, canvas, scale = 1.0) {
    if (!this.options.renderPages) {
      throw new Error('Рендеринг страниц отключен');
    }
    
    return this.parser.renderPage(pageNum, canvas, scale);
  }

  /**
   * Получает метаданные документа
   * @returns {Object} - Метаданные
   */
  getMetadata() {
    return this.metadata;
  }

  /**
   * Проверяет, защищен ли документ паролем
   * @returns {boolean} - true, если документ зашифрован
   */
  isPasswordProtected() {
    return this.parser.isPasswordProtected();
  }

  /**
   * Закрывает документ и освобождает ресурсы
   */
  close() {
    this.parser.close();
    this.document = null;
    this.textContent = [];
    this.metadata = {};
  }
}

export default PDFFormatHandler;
