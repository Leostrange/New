/**
 * PDFParser.js
 * 
 * Класс для обработки PDF-файлов и извлечения текста
 */

class PDFParser {
  /**
   * Создает экземпляр PDFParser
   * @param {Object} options - Настройки парсера
   * @param {boolean} options.preserveFormatting - Сохранять ли форматирование текста
   * @param {boolean} options.extractImages - Извлекать ли изображения
   * @param {number} options.dpi - Разрешение для рендеринга страниц (для OCR)
   */
  constructor(options = {}) {
    this.options = {
      preserveFormatting: true,
      extractImages: false,
      dpi: 300,
      ...options
    };
    
    this.document = null;
    this.pageCount = 0;
    this.metadata = {};
    this.isEncrypted = false;
  }

  /**
   * Загружает PDF-файл
   * @param {ArrayBuffer|Uint8Array} data - Бинарные данные PDF-файла
   * @returns {Promise<boolean>} - Результат загрузки
   */
  async loadDocument(data) {
    try {
      // Используем pdf.js для загрузки документа
      const pdfjs = await import('pdfjs-dist');
      const loadingTask = pdfjs.getDocument(data);
      
      this.document = await loadingTask.promise;
      this.pageCount = this.document.numPages;
      this.metadata = await this.document.getMetadata();
      this.isEncrypted = this.document.isEncrypted;
      
      return true;
    } catch (error) {
      console.error('Ошибка при загрузке PDF:', error);
      return false;
    }
  }

  /**
   * Извлекает текст из PDF-документа
   * @param {Object} options - Опции извлечения
   * @param {number} options.startPage - Начальная страница (с 1)
   * @param {number} options.endPage - Конечная страница
   * @returns {Promise<Array<{pageNum: number, text: string}>>} - Массив объектов с текстом по страницам
   */
  async extractText(options = {}) {
    if (!this.document) {
      throw new Error('Документ не загружен');
    }

    const startPage = options.startPage || 1;
    const endPage = options.endPage || this.pageCount;
    
    const textContent = [];
    
    for (let pageNum = startPage; pageNum <= endPage; pageNum++) {
      try {
        const page = await this.document.getPage(pageNum);
        const content = await page.getTextContent({
          normalizeWhitespace: !this.options.preserveFormatting,
          disableCombineTextItems: this.options.preserveFormatting
        });
        
        let pageText = '';
        let lastY = null;
        
        // Собираем текст со страницы, учитывая позиционирование
        for (const item of content.items) {
          if (this.options.preserveFormatting && lastY !== null && lastY !== item.transform[5]) {
            pageText += '\n';
          }
          
          pageText += item.str;
          
          if (this.options.preserveFormatting) {
            lastY = item.transform[5];
          }
        }
        
        textContent.push({
          pageNum,
          text: pageText
        });
      } catch (error) {
        console.error(`Ошибка при извлечении текста со страницы ${pageNum}:`, error);
        textContent.push({
          pageNum,
          text: '',
          error: error.message
        });
      }
    }
    
    return textContent;
  }

  /**
   * Извлекает метаданные PDF-документа
   * @returns {Object} - Метаданные документа
   */
  getMetadata() {
    if (!this.document) {
      throw new Error('Документ не загружен');
    }
    
    return this.metadata;
  }

  /**
   * Проверяет, защищен ли документ паролем
   * @returns {boolean} - true, если документ зашифрован
   */
  isPasswordProtected() {
    return this.isEncrypted;
  }

  /**
   * Рендерит страницу PDF в canvas
   * @param {number} pageNum - Номер страницы (с 1)
   * @param {HTMLCanvasElement} canvas - Canvas для рендеринга
   * @param {number} scale - Масштаб рендеринга
   * @returns {Promise<void>}
   */
  async renderPage(pageNum, canvas, scale = 1.0) {
    if (!this.document) {
      throw new Error('Документ не загружен');
    }
    
    try {
      const page = await this.document.getPage(pageNum);
      const viewport = page.getViewport({ scale });
      
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      
      const renderContext = {
        canvasContext: canvas.getContext('2d'),
        viewport
      };
      
      await page.render(renderContext).promise;
    } catch (error) {
      console.error(`Ошибка при рендеринге страницы ${pageNum}:`, error);
      throw error;
    }
  }

  /**
   * Закрывает документ и освобождает ресурсы
   */
  close() {
    if (this.document) {
      this.document.destroy();
      this.document = null;
      this.pageCount = 0;
      this.metadata = {};
      this.isEncrypted = false;
    }
  }
}

export default PDFParser;
