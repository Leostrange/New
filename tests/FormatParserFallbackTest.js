/**
 * FormatParserFallbackTest.js
 * 
 * Тесты для проверки функциональности fallback-обработчиков для парсеров форматов.
 * Проверяет корректность работы FormatParserFallbackManager и его интеграцию с парсерами MOBI и EPUB.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const FormatParserFallbackManager = require('../src/formats/FormatParserFallbackManager');
const MOBIParserWithFallback = require('../src/formats/MOBIParserWithFallback');
const EPUBParserWithFallback = require('../src/formats/EPUBParserWithFallback');
const { ExceptionHierarchy } = require('../src/exceptions/ExceptionHierarchy');

// Пути к тестовым файлам
const TEST_FILES_DIR = path.join(__dirname, 'test_files');
const VALID_MOBI_FILE = path.join(TEST_FILES_DIR, 'valid_sample.mobi');
const INVALID_MOBI_FILE = path.join(TEST_FILES_DIR, 'invalid_sample.mobi');
const CORRUPTED_MOBI_FILE = path.join(TEST_FILES_DIR, 'corrupted_sample.mobi');
const VALID_EPUB_FILE = path.join(TEST_FILES_DIR, 'valid_sample.epub');
const INVALID_EPUB_FILE = path.join(TEST_FILES_DIR, 'invalid_sample.epub');
const CORRUPTED_EPUB_FILE = path.join(TEST_FILES_DIR, 'corrupted_sample.epub');

// Создание тестовых файлов, если они не существуют
function setupTestFiles() {
    if (!fs.existsSync(TEST_FILES_DIR)) {
        fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
    }
    
    // Создание валидного тестового файла MOBI, если он не существует
    if (!fs.existsSync(VALID_MOBI_FILE)) {
        // Создаем минимальный валидный MOBI файл для тестирования
        const validMobiHeader = Buffer.alloc(68);
        // Заполняем сигнатуру "BOOKMOBI" на смещении 0x3C (60)
        Buffer.from('BOOKMOBI').copy(validMobiHeader, 60);
        fs.writeFileSync(VALID_MOBI_FILE, validMobiHeader);
    }
    
    // Создание невалидного тестового файла MOBI, если он не существует
    if (!fs.existsSync(INVALID_MOBI_FILE)) {
        // Создаем файл с неверной сигнатурой
        const invalidContent = Buffer.from('This is not a MOBI file');
        fs.writeFileSync(INVALID_MOBI_FILE, invalidContent);
    }
    
    // Создание поврежденного тестового файла MOBI, если он не существует
    if (!fs.existsSync(CORRUPTED_MOBI_FILE)) {
        // Создаем файл с правильной сигнатурой, но поврежденной структурой
        const corruptedMobiHeader = Buffer.alloc(68);
        Buffer.from('BOOKMOBI').copy(corruptedMobiHeader, 60);
        // Добавляем неверные данные
        Buffer.from('CORRUPTED').copy(corruptedMobiHeader, 0);
        fs.writeFileSync(CORRUPTED_MOBI_FILE, corruptedMobiHeader);
    }
    
    // Создание валидного тестового файла EPUB, если он не существует
    if (!fs.existsSync(VALID_EPUB_FILE)) {
        // Создаем минимальный валидный EPUB файл для тестирования (ZIP сигнатура)
        const validEpubHeader = Buffer.from([
            0x50, 0x4B, 0x03, 0x04, // ZIP сигнатура
            // Дополнительные байты заголовка...
            0x14, 0x00, 0x00, 0x00, 0x08, 0x00, 0x00, 0x00, 0x00, 0x00,
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        fs.writeFileSync(VALID_EPUB_FILE, validEpubHeader);
    }
    
    // Создание невалидного тестового файла EPUB, если он не существует
    if (!fs.existsSync(INVALID_EPUB_FILE)) {
        // Создаем файл с неверной сигнатурой
        const invalidContent = Buffer.from('This is not an EPUB file');
        fs.writeFileSync(INVALID_EPUB_FILE, invalidContent);
    }
    
    // Создание поврежденного тестового файла EPUB, если он не существует
    if (!fs.existsSync(CORRUPTED_EPUB_FILE)) {
        // Создаем файл с правильной сигнатурой, но поврежденной структурой
        const corruptedEpubHeader = Buffer.from([
            0x50, 0x4B, 0x03, 0x04, // ZIP сигнатура
            0xFF, 0xFF, 0xFF, 0xFF, // Неверные данные
            // Поврежденные данные...
            0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00
        ]);
        fs.writeFileSync(CORRUPTED_EPUB_FILE, corruptedEpubHeader);
    }
}

// Тесты для FormatParserFallbackManager
describe('FormatParserFallbackManager Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('Initialization Tests', function() {
        it('should initialize with default options', function() {
            const manager = new FormatParserFallbackManager();
            assert.strictEqual(manager.options.enableFallbacks, true, 'Fallbacks should be enabled by default');
            assert.strictEqual(manager.options.maxRecoveryAttempts, 3, 'Default max recovery attempts should be 3');
            assert.strictEqual(manager.options.logFailedAttempts, true, 'Failed attempts logging should be enabled by default');
        });
        
        it('should initialize with custom options', function() {
            const manager = new FormatParserFallbackManager({
                enableFallbacks: false,
                maxRecoveryAttempts: 5,
                logFailedAttempts: false
            });
            assert.strictEqual(manager.options.enableFallbacks, false, 'Fallbacks should be disabled');
            assert.strictEqual(manager.options.maxRecoveryAttempts, 5, 'Max recovery attempts should be 5');
            assert.strictEqual(manager.options.logFailedAttempts, false, 'Failed attempts logging should be disabled');
        });
    });
    
    describe('Strategy Registration Tests', function() {
        it('should register and retrieve fallback strategies', function() {
            const manager = new FormatParserFallbackManager();
            
            // Регистрируем новую стратегию
            manager.registerFallbackStrategy('test_strategy', async () => {
                return { success: true, data: 'test data' };
            });
            
            // Проверяем, что стратегия зарегистрирована
            assert.ok(manager.fallbackStrategies.has('test_strategy'), 'Strategy should be registered');
        });
        
        it('should throw error when registering invalid strategy', function() {
            const manager = new FormatParserFallbackManager();
            
            try {
                manager.registerFallbackStrategy('invalid_strategy', 'not a function');
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('должна быть функцией'), 'Error should mention function requirement');
            }
        });
    });
    
    describe('Strategy Application Tests', function() {
        it('should apply registered fallback strategy', async function() {
            const manager = new FormatParserFallbackManager();
            
            // Регистрируем тестовую стратегию
            manager.registerFallbackStrategy('test_strategy', async (context) => {
                return { success: true, data: context.testData };
            });
            
            // Применяем стратегию
            const result = await manager.applyFallbackStrategy('test_strategy', { testData: 'test value' });
            
            assert.ok(result, 'Result should be returned');
            assert.strictEqual(result.success, true, 'Result should indicate success');
            assert.strictEqual(result.data, 'test value', 'Result should contain context data');
        });
        
        it('should throw error when applying non-existent strategy', async function() {
            const manager = new FormatParserFallbackManager();
            
            try {
                await manager.applyFallbackStrategy('non_existent_strategy');
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('не найдена'), 'Error should mention strategy not found');
            }
        });
        
        it('should throw error when fallbacks are disabled', async function() {
            const manager = new FormatParserFallbackManager({ enableFallbacks: false });
            
            // Регистрируем тестовую стратегию
            manager.registerFallbackStrategy('test_strategy', async () => {
                return { success: true };
            });
            
            try {
                await manager.applyFallbackStrategy('test_strategy');
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('отключены'), 'Error should mention fallbacks disabled');
            }
        });
        
        it('should respect max recovery attempts', async function() {
            const manager = new FormatParserFallbackManager({ maxRecoveryAttempts: 2 });
            
            // Регистрируем стратегию, которая всегда выбрасывает исключение
            manager.registerFallbackStrategy('failing_strategy', async () => {
                throw new Error('Strategy always fails');
            });
            
            try {
                await manager.applyFallbackStrategy('failing_strategy', { filePath: 'test.file' });
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.RecoveryException, 'Should throw RecoveryException');
                assert.ok(error.message.includes('Превышено максимальное количество попыток'), 'Error should mention max attempts exceeded');
            }
            
            // Проверяем, что счетчик попыток увеличился
            const attemptKey = 'failing_strategy:test.file';
            assert.strictEqual(manager.recoveryAttempts.get(attemptKey), 2, 'Recovery attempts counter should be 2');
        });
    });
    
    describe('Recovery Attempts Management Tests', function() {
        it('should reset recovery attempts for specific error type and file', function() {
            const manager = new FormatParserFallbackManager();
            
            // Устанавливаем счетчик попыток
            const attemptKey = 'test_error:test.file';
            manager.recoveryAttempts.set(attemptKey, 2);
            
            // Сбрасываем счетчик
            manager.resetRecoveryAttempts('test_error', 'test.file');
            
            // Проверяем, что счетчик сброшен
            assert.strictEqual(manager.recoveryAttempts.has(attemptKey), false, 'Recovery attempts counter should be reset');
        });
        
        it('should reset all recovery attempts', function() {
            const manager = new FormatParserFallbackManager();
            
            // Устанавливаем несколько счетчиков попыток
            manager.recoveryAttempts.set('error1:file1', 1);
            manager.recoveryAttempts.set('error2:file2', 2);
            
            // Сбрасываем все счетчики
            manager.resetAllRecoveryAttempts();
            
            // Проверяем, что все счетчики сброшены
            assert.strictEqual(manager.recoveryAttempts.size, 0, 'All recovery attempts counters should be reset');
        });
    });
    
    describe('Format Detection Tests', function() {
        it('should detect MOBI format from buffer', async function() {
            const manager = new FormatParserFallbackManager();
            const buffer = fs.readFileSync(VALID_MOBI_FILE);
            
            const result = await manager.applyFallbackStrategy('format_detection', { fileBuffer: buffer });
            
            assert.strictEqual(result.detectedFormat, 'mobi', 'Should detect MOBI format');
            assert.ok(result.confidence > 0.7, 'Confidence should be high');
        });
        
        it('should detect EPUB format from buffer', async function() {
            const manager = new FormatParserFallbackManager();
            const buffer = fs.readFileSync(VALID_EPUB_FILE);
            
            const result = await manager.applyFallbackStrategy('format_detection', { fileBuffer: buffer });
            
            assert.strictEqual(result.detectedFormat, 'epub', 'Should detect EPUB format');
            assert.ok(result.confidence > 0.7, 'Confidence should be high');
        });
        
        it('should guess format for unknown file', async function() {
            const manager = new FormatParserFallbackManager();
            const buffer = Buffer.from('<!DOCTYPE html><html><body>Test</body></html>');
            
            const result = await manager.applyFallbackStrategy('format_detection', { fileBuffer: buffer });
            
            assert.strictEqual(result.detectedFormat, 'html', 'Should guess HTML format');
            assert.ok(result.confidence <= 0.7, 'Confidence should be lower');
        });
    });
    
    describe('Content Generation Tests', function() {
        it('should generate metadata from filename', async function() {
            const manager = new FormatParserFallbackManager();
            
            const result = await manager.applyFallbackStrategy('metadata_extraction', { 
                filePath: '/path/to/test_book.mobi',
                format: 'mobi'
            });
            
            assert.strictEqual(result.title, 'test_book', 'Title should be extracted from filename');
            assert.strictEqual(result.author, 'Unknown Author', 'Author should be set to unknown');
            assert.ok(result.generatedByFallback, 'Should be marked as generated by fallback');
        });
        
        it('should generate error content for content extraction', async function() {
            const manager = new FormatParserFallbackManager();
            
            const result = await manager.applyFallbackStrategy('content_extraction', { 
                filePath: '/path/to/test_book.mobi',
                format: 'mobi',
                error: new Error('Test error')
            });
            
            assert.ok(result.includes('<html>'), 'Should generate HTML content');
            assert.ok(result.includes('Не удалось извлечь содержимое файла'), 'Should include error message');
            assert.ok(result.includes('test_book'), 'Should include filename');
            assert.ok(result.includes('Test error'), 'Should include error message');
        });
        
        it('should generate empty TOC for TOC extraction', async function() {
            const manager = new FormatParserFallbackManager();
            
            const result = await manager.applyFallbackStrategy('toc_extraction', { 
                filePath: '/path/to/test_book.mobi',
                format: 'mobi'
            });
            
            assert.ok(Array.isArray(result), 'Should return array');
            assert.strictEqual(result.length, 1, 'Should have one entry');
            assert.strictEqual(result[0].title, 'Содержимое недоступно', 'Should have default title');
        });
        
        it('should generate empty images array for image extraction', async function() {
            const manager = new FormatParserFallbackManager();
            
            const result = await manager.applyFallbackStrategy('image_extraction', { 
                filePath: '/path/to/test_book.mobi',
                format: 'mobi'
            });
            
            assert.ok(Array.isArray(result), 'Should return array');
            assert.strictEqual(result.length, 0, 'Should be empty');
        });
    });
});

// Тесты для MOBIParserWithFallback
describe('MOBIParserWithFallback Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('Initialization Tests', function() {
        it('should initialize with valid MOBI file', async function() {
            const parser = new MOBIParserWithFallback();
            const result = await parser.initialize(VALID_MOBI_FILE);
            
            assert.strictEqual(result, true, 'Should initialize successfully');
            assert.strictEqual(parser.isInitialized, true, 'Should be marked as initialized');
            assert.strictEqual(parser.usingFallback, false, 'Should not use fallback for valid file');
            
            parser.dispose();
        });
        
        it('should initialize with invalid MOBI file using fallback', async function() {
            const parser = new MOBIParserWithFallback();
            const result = await parser.initialize(INVALID_MOBI_FILE);
            
            assert.strictEqual(result, true, 'Should initialize with fallback');
            assert.strictEqual(parser.isInitialized, true, 'Should be marked as initialized');
            assert.strictEqual(parser.usingFallback, true, 'Should use fallback for invalid file');
            
            parser.dispose();
        });
        
        it('should initialize with corrupted MOBI file using fallback', async function() {
            const parser = new MOBIParserWithFallback();
            const result = await parser.initialize(CORRUPTED_MOBI_FILE);
            
            assert.strictEqual(result, true, 'Should initialize with fallback');
            assert.strictEqual(parser.isInitialized, true, 'Should be marked as initialized');
            assert.strictEqual(parser.usingFallback, true, 'Should use fallback for corrupted file');
            
            parser.dispose();
        });
    });
    
    describe('Content Extraction Tests', function() {
        it('should extract metadata from invalid file using fallback', async function() {
            const parser = new MOBIParserWithFallback();
            await parser.initialize(INVALID_MOBI_FILE);
            
            const metadata = await parser.parseMetadata();
            
            assert.ok(metadata, 'Should return metadata');
            assert.ok(metadata.title, 'Should have title');
            assert.ok(metadata.generatedByFallback, 'Should be marked as generated by fallback');
            
            parser.dispose();
        });
        
        it('should extract TOC from invalid file using fallback', async function() {
            const parser = new MOBIParserWithFallback();
            await parser.initialize(INVALID_MOBI_FILE);
            
            const toc = await parser.extractTOC();
            
            assert.ok(Array.isArray(toc), 'Should return array');
            assert.ok(toc.length > 0, 'Should have entries');
            
            parser.dispose();
        });
        
        it('should extract content from invalid file using fallback', async function() {
            const parser = new MOBIParserWithFallback();
            await parser.initialize(INVALID_MOBI_FILE);
            
            const content = await parser.extractContent();
            
            assert.ok(content, 'Should return content');
            assert.ok(content.includes('<html>'), 'Should return HTML content');
            assert.ok(content.includes('Не удалось извлечь содержимое файла'), 'Should include error message');
            
            parser.dispose();
        });
        
        it('should extract empty images array from invalid file using fallback', async function() {
            const parser = new MOBIParserWithFallback();
            await parser.initialize(INVALID_MOBI_FILE);
            
            const images = await parser.extractImages();
            
            assert.ok(Array.isArray(images), 'Should return array');
            assert.strictEqual(images.length, 0, 'Should be empty');
            
            parser.dispose();
        });
    });
    
    describe('Static Methods Tests', function() {
        it('should validate MOBI file with fallback', async function() {
            const isValid = await MOBIParserWithFallback.isValidMOBI(VALID_MOBI_FILE);
            assert.strictEqual(isValid, true, 'Valid file should be recognized');
        });
        
        it('should invalidate non-MOBI file with fallback', async function() {
            const isValid = await MOBIParserWithFallback.isValidMOBI(INVALID_MOBI_FILE);
            assert.strictEqual(isValid, false, 'Invalid file should not be recognized');
        });
    });
    
    describe('Resource Management Tests', function() {
        it('should properly dispose resources and reset recovery attempts', function() {
            const parser = new MOBIParserWithFallback();
            parser.usingFallback = true;
            parser.filePath = 'test.mobi';
            
            // Имитируем счетчики попыток восстановления
            parser.fallbackManager.recoveryAttempts.set('format_detection:test.mobi', 1);
            parser.fallbackManager.recoveryAttempts.set('metadata_extraction:test.mobi', 1);
            
            parser.dispose();
            
            assert.strictEqual(parser.usingFallback, false, 'usingFallback flag should be reset');
            assert.strictEqual(parser.fallbackManager.recoveryAttempts.has('format_detection:test.mobi'), false, 'Recovery attempts should be reset');
            assert.strictEqual(parser.fallbackManager.recoveryAttempts.has('metadata_extraction:test.mobi'), false, 'Recovery attempts should be reset');
        });
    });
});

// Тесты для EPUBParserWithFallback
describe('EPUBParserWithFallback Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('Initialization Tests', function() {
        it('should initialize with valid EPUB file', async function() {
            const parser = new EPUBParserWithFallback();
            const result = await parser.initialize(VALID_EPUB_FILE);
            
            assert.strictEqual(result, true, 'Should initialize successfully');
            assert.strictEqual(parser.isInitialized, true, 'Should be marked as initialized');
            assert.strictEqual(parser.usingFallback, false, 'Should not use fallback for valid file');
            
            parser.dispose();
        });
        
        it('should initialize with invalid EPUB file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            const result = await parser.initialize(INVALID_EPUB_FILE);
            
            assert.strictEqual(result, true, 'Should initialize with fallback');
            assert.strictEqual(parser.isInitialized, true, 'Should be marked as initialized');
            assert.strictEqual(parser.usingFallback, true, 'Should use fallback for invalid file');
            
            parser.dispose();
        });
        
        it('should initialize with corrupted EPUB file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            const result = await parser.initialize(CORRUPTED_EPUB_FILE);
            
            assert.strictEqual(result, true, 'Should initialize with fallback');
            assert.strictEqual(parser.isInitialized, true, 'Should be marked as initialized');
            assert.strictEqual(parser.usingFallback, true, 'Should use fallback for corrupted file');
            
            parser.dispose();
        });
    });
    
    describe('Content Extraction Tests', function() {
        it('should extract metadata from invalid file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            await parser.initialize(INVALID_EPUB_FILE);
            
            const metadata = await parser.parseMetadata();
            
            assert.ok(metadata, 'Should return metadata');
            assert.ok(metadata.title, 'Should have title');
            assert.ok(metadata.generatedByFallback, 'Should be marked as generated by fallback');
            
            parser.dispose();
        });
        
        it('should extract TOC from invalid file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            await parser.initialize(INVALID_EPUB_FILE);
            
            const toc = await parser.extractTOC();
            
            assert.ok(Array.isArray(toc), 'Should return array');
            assert.ok(toc.length > 0, 'Should have entries');
            
            parser.dispose();
        });
        
        it('should extract chapters from invalid file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            await parser.initialize(INVALID_EPUB_FILE);
            
            const chapters = await parser.extractChapters();
            
            assert.ok(Array.isArray(chapters), 'Should return array');
            assert.ok(chapters.length > 0, 'Should have entries');
            assert.ok(chapters[0].id, 'Chapter should have ID');
            assert.ok(chapters[0].title, 'Chapter should have title');
            
            parser.dispose();
        });
        
        it('should extract chapter content from invalid file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            await parser.initialize(INVALID_EPUB_FILE);
            
            // Сначала получаем главы
            await parser.extractChapters();
            
            const content = await parser.extractChapterContent(0);
            
            assert.ok(content, 'Should return content');
            assert.ok(content.includes('<html>'), 'Should return HTML content');
            assert.ok(content.includes('Не удалось извлечь содержимое файла'), 'Should include error message');
            
            parser.dispose();
        });
        
        it('should extract CSS files from invalid file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            await parser.initialize(INVALID_EPUB_FILE);
            
            const cssFiles = await parser.extractCSSFiles();
            
            assert.ok(Array.isArray(cssFiles), 'Should return array');
            assert.ok(cssFiles.length > 0, 'Should have entries');
            assert.ok(cssFiles[0].content, 'CSS file should have content');
            
            parser.dispose();
        });
        
        it('should extract empty images array from invalid file using fallback', async function() {
            const parser = new EPUBParserWithFallback();
            await parser.initialize(INVALID_EPUB_FILE);
            
            const images = await parser.extractImages();
            
            assert.ok(Array.isArray(images), 'Should return array');
            assert.strictEqual(images.length, 0, 'Should be empty');
            
            parser.dispose();
        });
    });
    
    describe('Static Methods Tests', function() {
        it('should validate EPUB file with fallback', async function() {
            const isValid = await EPUBParserWithFallback.isValidEPUB(VALID_EPUB_FILE);
            assert.strictEqual(isValid, true, 'Valid file should be recognized');
        });
        
        it('should invalidate non-EPUB file with fallback', async function() {
            const isValid = await EPUBParserWithFallback.isValidEPUB(INVALID_EPUB_FILE);
            assert.strictEqual(isValid, false, 'Invalid file should not be recognized');
        });
    });
    
    describe('Resource Management Tests', function() {
        it('should properly dispose resources and reset recovery attempts', function() {
            const parser = new EPUBParserWithFallback();
            parser.usingFallback = true;
            parser.filePath = 'test.epub';
            
            // Имитируем счетчики попыток восстановления
            parser.fallbackManager.recoveryAttempts.set('format_detection:test.epub', 1);
            parser.fallbackManager.recoveryAttempts.set('metadata_extraction:test.epub', 1);
            
            parser.dispose();
            
            assert.strictEqual(parser.usingFallback, false, 'usingFallback flag should be reset');
            assert.strictEqual(parser.filePath, null, 'filePath should be reset');
            assert.strictEqual(parser.fallbackManager.recoveryAttempts.has('format_detection:test.epub'), false, 'Recovery attempts should be reset');
            assert.strictEqual(parser.fallbackManager.recoveryAttempts.has('metadata_extraction:test.epub'), false, 'Recovery attempts should be reset');
        });
    });
});

// Запуск тестов
if (require.main === module) {
    // Если файл запущен напрямую, а не импортирован
    console.log('Running Format Parser Fallback tests...');
    
    // Здесь можно добавить код для запуска тестов
    // Например, с использованием Mocha программно
    
    console.log('Format Parser Fallback tests completed.');
}

module.exports = {
    setupTestFiles,
    TEST_FILES_DIR,
    VALID_MOBI_FILE,
    INVALID_MOBI_FILE,
    CORRUPTED_MOBI_FILE,
    VALID_EPUB_FILE,
    INVALID_EPUB_FILE,
    CORRUPTED_EPUB_FILE
};
