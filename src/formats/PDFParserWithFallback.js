/**
 * PDFParserWithFallback.js
 * 
 * Расширенная версия PDFParser с поддержкой fallback-обработки
 */

import PDFParser from './PDFParser';
import { FormatParserFallbackManager } from './FormatParserFallbackManager';

class PDFParserWithFallback extends PDFParser {
  /**
   * Создает экземпляр PDFParserWithFallback
   * @param {Object} options - Настройки парсера
   */
  constructor(options = {}) {
    super(options);
    
    this.fallbackManager = new FormatParserFallbackManager();
    this.fallbackAttempted = false;
    this.fallbackSuccessful = false;
    this.fallbackMethod = null;
  }

  /**
   * Загружает PDF-файл с поддержкой fallback-обработки
   * @param {ArrayBuffer|Uint8Array} data - Бинарные данные PDF-файла
   * @returns {Promise<boolean>} - Результат загрузки
   */
  async loadDocument(data) {
    try {
      // Сначала пробуем стандартный метод загрузки
      const result = await super.loadDocument(data);
      
      if (result) {
        return true;
      }
      
      // Если стандартный метод не сработал, пробуем fallback
      return await this.attemptFallbackLoad(data);
    } catch (error) {
      console.error('Ошибка при загрузке PDF:', error);
      
      // В случае ошибки пробуем fallback
      return await this.attemptFallbackLoad(data);
    }
  }

  /**
   * Пытается загрузить документ с использованием fallback-методов
   * @param {ArrayBuffer|Uint8Array} data - Бинарные данные PDF-файла
   * @returns {Promise<boolean>} - Результат загрузки
   */
  async attemptFallbackLoad(data) {
    this.fallbackAttempted = true;
    
    // Регистрируем fallback-методы
    this.fallbackManager.registerMethod('pdfjs-legacy', async (data) => {
      try {
        const pdfjs = await import('pdfjs-dist/legacy/build/pdf');
        const loadingTask = pdfjs.getDocument(data);
        this.document = await loadingTask.promise;
        this.pageCount = this.document.numPages;
        this.metadata = await this.document.getMetadata();
        this.isEncrypted = this.document.isEncrypted;
        return true;
      } catch (e) {
        console.error('Fallback pdfjs-legacy failed:', e);
        return false;
      }
    });
    
    this.fallbackManager.registerMethod('pdf-lib', async (data) => {
      try {
        const { PDFDocument } = await import('pdf-lib');
        const pdfDoc = await PDFDocument.load(data);
        
        // Создаем минимальную совместимость с интерфейсом pdfjs
        this.document = {
          numPages: pdfDoc.getPageCount(),
          getPage: async (pageNum) => {
            const page = pdfDoc.getPage(pageNum - 1);
            return {
              getTextContent: async () => {
                // pdf-lib не имеет прямого метода извлечения текста
                // Это заглушка, которая возвращает пустой контент
                return { items: [] };
              },
              getViewport: ({ scale }) => {
                const { width, height } = page.getSize();
                return { width: width * scale, height: height * scale };
              }
            };
          },
          getMetadata: async () => {
            return {
              info: pdfDoc.getTitle() ? { Title: pdfDoc.getTitle() } : {}
            };
          },
          isEncrypted: false,
          destroy: () => {}
        };
        
        this.pageCount = this.document.numPages;
        this.metadata = await this.document.getMetadata();
        this.isEncrypted = this.document.isEncrypted;
        
        return true;
      } catch (e) {
        console.error('Fallback pdf-lib failed:', e);
        return false;
      }
    });
    
    // Пробуем все зарегистрированные методы
    const result = await this.fallbackManager.tryMethods(data);
    
    if (result.success) {
      this.fallbackSuccessful = true;
      this.fallbackMethod = result.method;
      return true;
    }
    
    return false;
  }

  /**
   * Извлекает текст из PDF-документа с поддержкой fallback
   * @param {Object} options - Опции извлечения
   * @returns {Promise<Array<{pageNum: number, text: string}>>} - Массив объектов с текстом по страницам
   */
  async extractText(options = {}) {
    try {
      // Сначала пробуем стандартный метод извлечения
      return await super.extractText(options);
    } catch (error) {
      console.error('Ошибка при извлечении текста:', error);
      
      // Если стандартный метод не сработал, используем OCR как fallback
      if (this.fallbackSuccessful && this.fallbackMethod === 'pdf-lib') {
        // pdf-lib не поддерживает извлечение текста, используем OCR
        return await this.extractTextWithOCR(options);
      }
      
      // Возвращаем пустой результат в случае ошибки
      const startPage = options.startPage || 1;
      const endPage = options.endPage || this.pageCount;
      
      const emptyResult = [];
      for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
        emptyResult.push({
          pageNum,
          text: '',
          error: 'Не удалось извлечь текст'
        });
      }
      
      return emptyResult;
    }
  }

  /**
   * Извлекает текст с использованием OCR
   * @param {Object} options - Опции извлечения
   * @returns {Promise<Array<{pageNum: number, text: string}>>} - Массив объектов с текстом по страницам
   */
  async extractTextWithOCR(options = {}) {
    // Заглушка для OCR
    // В реальной реализации здесь был бы код для рендеринга страниц и использования Tesseract.js
    
    console.warn('OCR extraction not implemented yet');
    
    const startPage = options.startPage || 1;
    const endPage = options.endPage || this.pageCount;
    
    const result = [];
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      result.push({
        pageNum,
        text: `[OCR placeholder for page ${pageNum}]`,
        usingOCR: true
      });
    }
    
    return result;
  }

  /**
   * Получает информацию о использованных fallback-методах
   * @returns {Object} - Информация о fallback
   */
  getFallbackInfo() {
    return {
      attempted: this.fallbackAttempted,
      successful: this.fallbackSuccessful,
      method: this.fallbackMethod
    };
  }
}

export default PDFParserWithFallback;
