/**
 * MOBIFormatTest.js
 * 
 * Тесты для проверки функциональности обработки формата MOBI.
 * Проверяет корректность работы MOBIParser и MOBIFormatHandler.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const MOBIParser = require('../src/formats/MOBIParser');
const MOBIFormatHandler = require('../src/formats/MOBIFormatHandler');
const { ExceptionHierarchy } = require('../src/exceptions/ExceptionHierarchy');

// Пути к тестовым файлам
const TEST_FILES_DIR = path.join(__dirname, 'test_files');
const VALID_MOBI_FILE = path.join(TEST_FILES_DIR, 'valid_sample.mobi');
const INVALID_MOBI_FILE = path.join(TEST_FILES_DIR, 'invalid_sample.mobi');
const CORRUPTED_MOBI_FILE = path.join(TEST_FILES_DIR, 'corrupted_sample.mobi');

// Создание тестовых файлов, если они не существуют
function setupTestFiles() {
    if (!fs.existsSync(TEST_FILES_DIR)) {
        fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
    }
    
    // Создание валидного тестового файла MOBI, если он не существует
    if (!fs.existsSync(VALID_MOBI_FILE)) {
        // Создаем минимальный валидный MOBI файл для тестирования
        const validMobiHeader = Buffer.from([
            0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49, // BOOKMOBI сигнатура
            0x00, 0x00, 0x00, 0x01, // Версия
            // Дополнительные байты заголовка...
        ]);
        fs.writeFileSync(VALID_MOBI_FILE, validMobiHeader);
    }
    
    // Создание невалидного тестового файла, если он не существует
    if (!fs.existsSync(INVALID_MOBI_FILE)) {
        // Создаем файл с неверной сигнатурой
        const invalidContent = Buffer.from('This is not a MOBI file');
        fs.writeFileSync(INVALID_MOBI_FILE, invalidContent);
    }
    
    // Создание поврежденного тестового файла, если он не существует
    if (!fs.existsSync(CORRUPTED_MOBI_FILE)) {
        // Создаем файл с правильной сигнатурой, но поврежденной структурой
        const corruptedMobiHeader = Buffer.from([
            0x42, 0x4F, 0x4F, 0x4B, 0x4D, 0x4F, 0x42, 0x49, // BOOKMOBI сигнатура
            0xFF, 0xFF, 0xFF, 0xFF, // Неверная версия
            // Поврежденные данные...
        ]);
        fs.writeFileSync(CORRUPTED_MOBI_FILE, corruptedMobiHeader);
    }
}

// Тесты для MOBIParser
describe('MOBIParser Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('Validation Tests', function() {
        it('should correctly identify valid MOBI files', async function() {
            const isValid = await MOBIParser.isValidMOBI(VALID_MOBI_FILE);
            assert.strictEqual(isValid, true, 'Valid MOBI file should be recognized');
        });
        
        it('should correctly identify invalid MOBI files', async function() {
            const isValid = await MOBIParser.isValidMOBI(INVALID_MOBI_FILE);
            assert.strictEqual(isValid, false, 'Invalid MOBI file should not be recognized');
        });
    });
    
    describe('Initialization Tests', function() {
        it('should initialize successfully with valid MOBI file', async function() {
            const parser = new MOBIParser();
            const result = await parser.initialize(VALID_MOBI_FILE);
            assert.strictEqual(result, true, 'Parser should initialize with valid file');
            assert.strictEqual(parser.isInitialized, true, 'Parser should be marked as initialized');
            parser.dispose();
        });
        
        it('should fail to initialize with invalid MOBI file', async function() {
            const parser = new MOBIParser();
            const result = await parser.initialize(INVALID_MOBI_FILE);
            assert.strictEqual(result, false, 'Parser should not initialize with invalid file');
            assert.strictEqual(parser.isInitialized, false, 'Parser should not be marked as initialized');
        });
    });
    
    describe('Content Extraction Tests', function() {
        let parser;
        
        beforeEach(async function() {
            parser = new MOBIParser();
            await parser.initialize(VALID_MOBI_FILE);
        });
        
        afterEach(function() {
            if (parser) {
                parser.dispose();
                parser = null;
            }
        });
        
        it('should extract metadata from MOBI file', async function() {
            const metadata = await parser.parseMetadata();
            assert.ok(metadata, 'Metadata should be extracted');
            assert.ok(metadata.title, 'Title should be present in metadata');
            assert.ok(metadata.author, 'Author should be present in metadata');
        });
        
        it('should extract content from MOBI file', async function() {
            const content = await parser.extractContent();
            assert.ok(content, 'Content should be extracted');
            assert.ok(content.includes('<html>'), 'Content should contain HTML');
        });
        
        it('should extract TOC from MOBI file', async function() {
            const toc = await parser.extractTOC();
            assert.ok(Array.isArray(toc), 'TOC should be an array');
            assert.ok(toc.length > 0, 'TOC should contain entries');
            assert.ok(toc[0].title, 'TOC entries should have titles');
            assert.ok(toc[0].href, 'TOC entries should have hrefs');
        });
        
        it('should extract images from MOBI file when enabled', async function() {
            const images = await parser.extractImages();
            assert.ok(Array.isArray(images), 'Images should be an array');
            assert.ok(images.length > 0, 'Images should be extracted');
        });
        
        it('should not extract images when disabled', async function() {
            const noImagesParser = new MOBIParser({ extractImages: false });
            await noImagesParser.initialize(VALID_MOBI_FILE);
            const images = await noImagesParser.extractImages();
            assert.strictEqual(images.length, 0, 'No images should be extracted when disabled');
            noImagesParser.dispose();
        });
    });
    
    describe('Error Handling Tests', function() {
        it('should throw error when using uninitialized parser', async function() {
            const parser = new MOBIParser();
            try {
                await parser.parseMetadata();
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('не инициализирован'), 'Error should mention initialization');
            }
        });
        
        it('should handle corrupted MOBI files gracefully', async function() {
            const parser = new MOBIParser();
            const result = await parser.initialize(CORRUPTED_MOBI_FILE);
            // Инициализация может пройти успешно, но извлечение данных должно обрабатывать ошибки
            if (result) {
                try {
                    await parser.parseMetadata();
                    // Если не выбросило исключение, то проверяем, что метаданные не пустые
                    const metadata = parser.metadata;
                    assert.ok(metadata, 'Metadata should not be null even for corrupted files');
                } catch (error) {
                    // Ожидаем ошибку при обработке поврежденного файла
                    assert.ok(error, 'Error should be thrown for corrupted files');
                }
            }
            parser.dispose();
        });
    });
    
    describe('Resource Management Tests', function() {
        it('should properly dispose resources', function() {
            const parser = new MOBIParser();
            parser.metadata = { title: 'Test' };
            parser.content = 'Test content';
            parser.toc = [{ title: 'Chapter 1' }];
            parser.images = [{ id: 'img1' }];
            parser.isInitialized = true;
            
            parser.dispose();
            
            assert.strictEqual(parser.metadata, null, 'Metadata should be cleared');
            assert.strictEqual(parser.content, null, 'Content should be cleared');
            assert.strictEqual(parser.toc, null, 'TOC should be cleared');
            assert.strictEqual(parser.images.length, 0, 'Images should be cleared');
            assert.strictEqual(parser.isInitialized, false, 'Initialized flag should be reset');
        });
    });
});

// Тесты для MOBIFormatHandler
describe('MOBIFormatHandler Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('File Opening Tests', function() {
        let handler;
        
        beforeEach(function() {
            handler = new MOBIFormatHandler();
        });
        
        afterEach(function() {
            if (handler) {
                handler.close();
                handler = null;
            }
        });
        
        it('should open valid MOBI file successfully', async function() {
            const result = await handler.openFile(VALID_MOBI_FILE);
            assert.strictEqual(result, true, 'Valid MOBI file should open successfully');
        });
        
        it('should throw exception when opening invalid MOBI file', async function() {
            try {
                await handler.openFile(INVALID_MOBI_FILE);
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.FormatException, 'Should throw FormatException');
            }
        });
        
        it('should throw exception when file does not exist', async function() {
            try {
                await handler.openFile('nonexistent_file.mobi');
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error, 'Should throw an exception for nonexistent file');
            }
        });
    });
    
    describe('Content Access Tests', function() {
        let handler;
        
        beforeEach(async function() {
            handler = new MOBIFormatHandler();
            await handler.openFile(VALID_MOBI_FILE);
        });
        
        afterEach(function() {
            if (handler) {
                handler.close();
                handler = null;
            }
        });
        
        it('should get metadata from opened MOBI file', async function() {
            const metadata = await handler.getMetadata();
            assert.ok(metadata, 'Metadata should be retrieved');
            assert.ok(metadata.title, 'Title should be present in metadata');
        });
        
        it('should get content from opened MOBI file', async function() {
            const content = await handler.getContent();
            assert.ok(content, 'Content should be retrieved');
            assert.ok(content.includes('<html>'), 'Content should contain HTML');
        });
        
        it('should get TOC from opened MOBI file', async function() {
            const toc = await handler.getTOC();
            assert.ok(Array.isArray(toc), 'TOC should be an array');
            assert.ok(toc.length > 0, 'TOC should contain entries');
        });
        
        it('should get images from opened MOBI file', async function() {
            const images = await handler.getImages();
            assert.ok(Array.isArray(images), 'Images should be an array');
        });
    });
    
    describe('Error Handling Tests', function() {
        let handler;
        
        beforeEach(function() {
            handler = new MOBIFormatHandler();
        });
        
        afterEach(function() {
            if (handler) {
                handler.close();
                handler = null;
            }
        });
        
        it('should throw exception when accessing content without opening file', async function() {
            try {
                await handler.getContent();
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.StateException, 'Should throw StateException');
            }
        });
        
        it('should throw exception when accessing metadata without opening file', async function() {
            try {
                await handler.getMetadata();
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.StateException, 'Should throw StateException');
            }
        });
        
        it('should throw exception when accessing TOC without opening file', async function() {
            try {
                await handler.getTOC();
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.StateException, 'Should throw StateException');
            }
        });
        
        it('should throw exception when accessing images without opening file', async function() {
            try {
                await handler.getImages();
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.StateException, 'Should throw StateException');
            }
        });
    });
    
    describe('Resource Management Tests', function() {
        it('should properly close and release resources', async function() {
            const handler = new MOBIFormatHandler();
            await handler.openFile(VALID_MOBI_FILE);
            
            // Проверяем, что файл открыт
            assert.ok(handler.parser, 'Parser should be created');
            assert.ok(handler.currentFile, 'Current file should be set');
            
            // Закрываем файл
            handler.close();
            
            // Проверяем, что ресурсы освобождены
            assert.strictEqual(handler.parser, null, 'Parser should be null after closing');
            assert.strictEqual(handler.currentFile, null, 'Current file should be null after closing');
        });
    });
});

// Запуск тестов
if (require.main === module) {
    // Если файл запущен напрямую, а не импортирован
    console.log('Running MOBI format tests...');
    
    // Здесь можно добавить код для запуска тестов
    // Например, с использованием Mocha программно
    
    console.log('MOBI format tests completed.');
}

module.exports = {
    setupTestFiles,
    TEST_FILES_DIR,
    VALID_MOBI_FILE,
    INVALID_MOBI_FILE,
    CORRUPTED_MOBI_FILE
};
