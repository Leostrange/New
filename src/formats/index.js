/**
 * index.js
 * 
 * Экспорт всех обработчиков форматов
 */

// Импорт обработчиков форматов
import MOBIParser from './MOBIParser';
import MOBIParserWithFallback from './MOBIParserWithFallback';
import MOBIFormatHandler from './MOBIFormatHandler';

import EPUBParser from './EPUBParser';
import EPUBParserWithFallback from './EPUBParserWithFallback';
import EPUBFormatHandler from './EPUBFormatHandler';
import EPUBWebViewIntegration from './EPUBWebViewIntegration';

import PDFParser from './PDFParser';
import PDFParserWithFallback from './PDFParserWithFallback';
import PDFFormatHandler from './PDFFormatHandler';

import { FormatParserFallbackManager } from './FormatParserFallbackManager';

import CBZFormatHandler from './CBZFormatHandler';
import CBRFormatHandler from './CBRFormatHandler';

// Класс для управления форматами
class FormatManager {
  constructor() {
    this.handlers = [];
    this.registerDefaultHandlers();
  }

  /**
   * Регистрирует обработчик формата
   * @param {Object} handler - Обработчик формата
   */
  registerHandler(handler) {
    this.handlers.push(handler);
  }

  /**
   * Регистрирует стандартные обработчики форматов
   */
  registerDefaultHandlers() {
    // Регистрация обработчика MOBI
    this.registerHandler(new MOBIFormatHandler());
    
    // Регистрация обработчика EPUB
    this.registerHandler(new EPUBFormatHandler());
    
    // Регистрация обработчика PDF
    this.registerHandler(new PDFFormatHandler());
    
    // Регистрация обработчика CBZ
    this.registerHandler(new CBZFormatHandler());
    
    // Регистрация обработчика CBR
    this.registerHandler(new CBRFormatHandler());
  }

  /**
   * Определяет подходящий обработчик для файла
   * @param {ArrayBuffer|Uint8Array} data - Бинарные данные файла
   * @returns {Promise<Object|null>} - Подходящий обработчик или null
   */
  async detectHandler(data) {
    for (const handler of this.handlers) {
      try {
        const canHandle = await handler.canHandle(data);
        if (canHandle) {
          return handler;
        }
      } catch (error) {
        console.error('Ошибка при проверке обработчика:', error);
      }
    }
    
    return null;
  }

  /**
   * Загружает файл с использованием подходящего обработчика
   * @param {ArrayBuffer|Uint8Array} data - Бинарные данные файла
   * @returns {Promise<{handler: Object, success: boolean}>} - Результат загрузки
   */
  async loadFile(data) {
    const handler = await this.detectHandler(data);
    
    if (!handler) {
      return { handler: null, success: false };
    }
    
    const success = await handler.loadDocument(data);
    return { handler, success };
  }
}

// Экспорт классов и функций
export {
  MOBIParser,
  MOBIParserWithFallback,
  MOBIFormatHandler,
  
  EPUBParser,
  EPUBParserWithFallback,
  EPUBFormatHandler,
  EPUBWebViewIntegration,
  
  PDFParser,
  PDFParserWithFallback,
  PDFFormatHandler,
  
  CBZFormatHandler,
  CBRFormatHandler,
  
  FormatParserFallbackManager,
  FormatManager
};

// Экспорт по умолчанию
export default FormatManager;
