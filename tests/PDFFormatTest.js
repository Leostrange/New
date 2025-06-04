/**
 * PDFFormatTest.js
 * 
 * Тесты для проверки функциональности обработки PDF-файлов
 */

import { describe, it, expect, beforeEach, afterEach } from 'jest';
import PDFParser from '../src/formats/PDFParser';
import PDFParserWithFallback from '../src/formats/PDFParserWithFallback';
import PDFFormatHandler from '../src/formats/PDFFormatHandler';

// Мок для pdf.js
jest.mock('pdfjs-dist', () => {
  return {
    getDocument: jest.fn().mockImplementation((data) => {
      // Проверяем, является ли data тестовым PDF или поврежденным PDF
      const isCorrupted = data.toString().includes('corrupted');
      
      if (isCorrupted) {
        return {
          promise: Promise.reject(new Error('Поврежденный PDF'))
        };
      }
      
      return {
        promise: Promise.resolve({
          numPages: 3,
          isEncrypted: data.toString().includes('encrypted'),
          getMetadata: () => Promise.resolve({
            info: {
              Title: 'Test PDF',
              Author: 'Mr.Comic',
              CreationDate: 'D:20250603000000Z'
            }
          }),
          getPage: (pageNum) => Promise.resolve({
            getTextContent: () => Promise.resolve({
              items: [
                { str: `Текст страницы ${pageNum}, часть 1`, transform: [0, 0, 0, 0, 0, 100] },
                { str: `Текст страницы ${pageNum}, часть 2`, transform: [0, 0, 0, 0, 0, 80] }
              ]
            }),
            getViewport: ({ scale }) => ({ width: 595 * scale, height: 842 * scale })
          }),
          destroy: jest.fn()
        })
      };
    })
  };
});

// Мок для pdf-lib
jest.mock('pdf-lib', () => {
  return {
    PDFDocument: {
      load: jest.fn().mockImplementation((data) => {
        return Promise.resolve({
          getPageCount: () => 3,
          getPage: (index) => ({
            getSize: () => ({ width: 595, height: 842 })
          }),
          getTitle: () => 'Test PDF (pdf-lib)'
        });
      })
    }
  };
});

describe('PDFParser', () => {
  let parser;
  
  beforeEach(() => {
    parser = new PDFParser();
  });
  
  afterEach(() => {
    parser.close();
  });
  
  it('должен успешно загружать PDF-документ', async () => {
    const testData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
    const result = await parser.loadDocument(testData);
    
    expect(result).toBe(true);
    expect(parser.pageCount).toBe(3);
    expect(parser.isEncrypted).toBe(false);
  });
  
  it('должен определять зашифрованные PDF', async () => {
    const encryptedData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37, 0x65, 0x6E, 0x63, 0x72, 0x79, 0x70, 0x74, 0x65, 0x64]); // %PDF-1.7encrypted
    const result = await parser.loadDocument(encryptedData);
    
    expect(result).toBe(true);
    expect(parser.isEncrypted).toBe(true);
  });
  
  it('должен извлекать текст из PDF', async () => {
    const testData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
    await parser.loadDocument(testData);
    
    const textContent = await parser.extractText();
    
    expect(textContent).toHaveLength(3); // 3 страницы
    expect(textContent[0].pageNum).toBe(1);
    expect(textContent[0].text).toContain('Текст страницы 1');
    expect(textContent[1].pageNum).toBe(2);
    expect(textContent[1].text).toContain('Текст страницы 2');
  });
  
  it('должен извлекать метаданные из PDF', async () => {
    const testData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
    await parser.loadDocument(testData);
    
    const metadata = parser.getMetadata();
    
    expect(metadata.info).toBeDefined();
    expect(metadata.info.Title).toBe('Test PDF');
    expect(metadata.info.Author).toBe('Mr.Comic');
  });
});

describe('PDFParserWithFallback', () => {
  let parser;
  
  beforeEach(() => {
    parser = new PDFParserWithFallback();
  });
  
  afterEach(() => {
    parser.close();
  });
  
  it('должен использовать fallback при ошибке загрузки', async () => {
    const corruptedData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x63, 0x6F, 0x72, 0x72, 0x75, 0x70, 0x74, 0x65, 0x64]); // %PDF-corrupted
    const result = await parser.loadDocument(corruptedData);
    
    const fallbackInfo = parser.getFallbackInfo();
    
    expect(fallbackInfo.attempted).toBe(true);
    expect(fallbackInfo.successful).toBe(true);
    expect(fallbackInfo.method).toBeDefined();
  });
  
  it('должен извлекать текст с использованием fallback при необходимости', async () => {
    const corruptedData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x63, 0x6F, 0x72, 0x72, 0x75, 0x70, 0x74, 0x65, 0x64]); // %PDF-corrupted
    await parser.loadDocument(corruptedData);
    
    const textContent = await parser.extractText();
    
    // Проверяем, что текст был извлечен (даже если это заглушка OCR)
    expect(textContent).toBeDefined();
    expect(Array.isArray(textContent)).toBe(true);
  });
});

describe('PDFFormatHandler', () => {
  let handler;
  
  beforeEach(() => {
    handler = new PDFFormatHandler();
  });
  
  afterEach(() => {
    handler.close();
  });
  
  it('должен определять PDF-файлы по сигнатуре', async () => {
    const pdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
    const nonPdfData = new Uint8Array([0x74, 0x65, 0x73, 0x74]); // test
    
    const isPdf = await handler.canHandle(pdfData);
    const isNotPdf = await handler.canHandle(nonPdfData);
    
    expect(isPdf).toBe(true);
    expect(isNotPdf).toBe(false);
  });
  
  it('должен загружать PDF и извлекать текст', async () => {
    const pdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
    
    const result = await handler.loadDocument(pdfData);
    expect(result).toBe(true);
    
    const pageCount = handler.getPageCount();
    expect(pageCount).toBe(3);
    
    const pageText = handler.getPageText(1);
    expect(pageText).toContain('Текст страницы 1');
    
    const allText = handler.getAllText();
    expect(allText).toContain('Текст страницы 1');
    expect(allText).toContain('Текст страницы 2');
    expect(allText).toContain('Текст страницы 3');
  });
  
  it('должен получать метаданные PDF', async () => {
    const pdfData = new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2D, 0x31, 0x2E, 0x37]); // %PDF-1.7
    
    await handler.loadDocument(pdfData);
    const metadata = handler.getMetadata();
    
    expect(metadata.info).toBeDefined();
    expect(metadata.info.Title).toBe('Test PDF');
  });
});
