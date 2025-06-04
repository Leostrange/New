/**
 * EPUBFormatTest.js
 * 
 * Тесты для проверки функциональности обработки формата EPUB и его отображения в WebView.
 * Проверяет корректность работы EPUBParser, EPUBFormatHandler и EPUBWebViewIntegration.
 */

const assert = require('assert');
const path = require('path');
const fs = require('fs');
const EPUBParser = require('../src/formats/EPUBParser');
const EPUBFormatHandler = require('../src/formats/EPUBFormatHandler');
const EPUBWebViewIntegration = require('../src/formats/EPUBWebViewIntegration');
const { ExceptionHierarchy } = require('../src/exceptions/ExceptionHierarchy');

// Пути к тестовым файлам
const TEST_FILES_DIR = path.join(__dirname, 'test_files');
const VALID_EPUB_FILE = path.join(TEST_FILES_DIR, 'valid_sample.epub');
const INVALID_EPUB_FILE = path.join(TEST_FILES_DIR, 'invalid_sample.epub');
const CORRUPTED_EPUB_FILE = path.join(TEST_FILES_DIR, 'corrupted_sample.epub');

// Мок для WebView
class MockWebView {
    constructor() {
        this.content = null;
        this.url = null;
        this.settings = {
            LOAD_DEFAULT: 'LOAD_DEFAULT',
            LOAD_NO_CACHE: 'LOAD_NO_CACHE',
            javaScriptEnabled: false,
            supportZoom: false,
            builtInZoomControls: false,
            displayZoomControls: false,
            cacheMode: 'LOAD_DEFAULT',
            standardFontFamily: 'sans-serif',
            defaultFontSize: 16,
            defaultFixedFontSize: 14
        };
        this.javascriptInterfaces = {};
        this.onPageFinishedCallback = null;
        this.onErrorCallback = null;
    }

    loadDataWithBaseURL(baseUrl, data, mimeType, encoding, historyUrl) {
        this.content = data;
        if (this.onPageFinishedCallback) {
            setTimeout(() => this.onPageFinishedCallback(), 10);
        }
    }

    loadUrl(url) {
        this.url = url;
        if (this.onPageFinishedCallback) {
            setTimeout(() => this.onPageFinishedCallback(), 10);
        }
    }

    getSettings() {
        return this.settings;
    }

    setOnPageFinishedListener(callback) {
        this.onPageFinishedCallback = callback;
    }

    setOnErrorListener(callback) {
        this.onErrorCallback = callback;
    }

    addJavascriptInterface(interface, name) {
        this.javascriptInterfaces[name] = interface;
    }

    evaluateJavaScript(script) {
        // Имитация выполнения JavaScript
        return Promise.resolve(true);
    }
}

// Создание тестовых файлов, если они не существуют
function setupTestFiles() {
    if (!fs.existsSync(TEST_FILES_DIR)) {
        fs.mkdirSync(TEST_FILES_DIR, { recursive: true });
    }
    
    // Создание валидного тестового файла EPUB, если он не существует
    if (!fs.existsSync(VALID_EPUB_FILE)) {
        // Создаем минимальный валидный EPUB файл для тестирования
        const validEpubHeader = Buffer.from([
            0x50, 0x4B, 0x03, 0x04, // ZIP сигнатура
            // Дополнительные байты заголовка...
        ]);
        fs.writeFileSync(VALID_EPUB_FILE, validEpubHeader);
    }
    
    // Создание невалидного тестового файла, если он не существует
    if (!fs.existsSync(INVALID_EPUB_FILE)) {
        // Создаем файл с неверной сигнатурой
        const invalidContent = Buffer.from('This is not an EPUB file');
        fs.writeFileSync(INVALID_EPUB_FILE, invalidContent);
    }
    
    // Создание поврежденного тестового файла, если он не существует
    if (!fs.existsSync(CORRUPTED_EPUB_FILE)) {
        // Создаем файл с правильной сигнатурой, но поврежденной структурой
        const corruptedEpubHeader = Buffer.from([
            0x50, 0x4B, 0x03, 0x04, // ZIP сигнатура
            0xFF, 0xFF, 0xFF, 0xFF, // Неверные данные
            // Поврежденные данные...
        ]);
        fs.writeFileSync(CORRUPTED_EPUB_FILE, corruptedEpubHeader);
    }
}

// Тесты для EPUBParser
describe('EPUBParser Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('Validation Tests', function() {
        it('should correctly identify valid EPUB files', async function() {
            const isValid = await EPUBParser.isValidEPUB(VALID_EPUB_FILE);
            assert.strictEqual(isValid, true, 'Valid EPUB file should be recognized');
        });
        
        it('should correctly identify invalid EPUB files', async function() {
            const isValid = await EPUBParser.isValidEPUB(INVALID_EPUB_FILE);
            assert.strictEqual(isValid, false, 'Invalid EPUB file should not be recognized');
        });
    });
    
    describe('Initialization Tests', function() {
        it('should initialize successfully with valid EPUB file', async function() {
            const parser = new EPUBParser();
            const result = await parser.initialize(VALID_EPUB_FILE);
            assert.strictEqual(result, true, 'Parser should initialize with valid file');
            assert.strictEqual(parser.isInitialized, true, 'Parser should be marked as initialized');
            parser.dispose();
        });
        
        it('should fail to initialize with invalid EPUB file', async function() {
            const parser = new EPUBParser();
            const result = await parser.initialize(INVALID_EPUB_FILE);
            assert.strictEqual(result, false, 'Parser should not initialize with invalid file');
            assert.strictEqual(parser.isInitialized, false, 'Parser should not be marked as initialized');
        });
    });
    
    describe('Content Extraction Tests', function() {
        let parser;
        
        beforeEach(async function() {
            parser = new EPUBParser();
            await parser.initialize(VALID_EPUB_FILE);
        });
        
        afterEach(function() {
            if (parser) {
                parser.dispose();
                parser = null;
            }
        });
        
        it('should extract metadata from EPUB file', async function() {
            const metadata = await parser.parseMetadata();
            assert.ok(metadata, 'Metadata should be extracted');
            assert.ok(metadata.title, 'Title should be present in metadata');
            assert.ok(metadata.author, 'Author should be present in metadata');
        });
        
        it('should extract TOC from EPUB file', async function() {
            const toc = await parser.extractTOC();
            assert.ok(Array.isArray(toc), 'TOC should be an array');
            assert.ok(toc.length > 0, 'TOC should contain entries');
            assert.ok(toc[0].title, 'TOC entries should have titles');
            assert.ok(toc[0].href, 'TOC entries should have hrefs');
        });
        
        it('should extract chapters from EPUB file', async function() {
            const chapters = await parser.extractChapters();
            assert.ok(Array.isArray(chapters), 'Chapters should be an array');
            assert.ok(chapters.length > 0, 'Chapters should be extracted');
            assert.ok(chapters[0].id, 'Chapter should have ID');
            assert.ok(chapters[0].href, 'Chapter should have href');
            assert.ok(chapters[0].title, 'Chapter should have title');
        });
        
        it('should extract chapter content from EPUB file', async function() {
            const content = await parser.extractChapterContent(0);
            assert.ok(content, 'Chapter content should be extracted');
            assert.ok(content.includes('<html>'), 'Content should contain HTML');
        });
        
        it('should extract CSS files from EPUB file', async function() {
            const cssFiles = await parser.extractCSSFiles();
            assert.ok(Array.isArray(cssFiles), 'CSS files should be an array');
            assert.ok(cssFiles.length > 0, 'CSS files should be extracted');
            assert.ok(cssFiles[0].content, 'CSS file should have content');
        });
        
        it('should extract images from EPUB file when enabled', async function() {
            const images = await parser.extractImages();
            assert.ok(Array.isArray(images), 'Images should be an array');
            assert.ok(images.length > 0, 'Images should be extracted');
        });
        
        it('should not extract images when disabled', async function() {
            const noImagesParser = new EPUBParser({ extractImages: false });
            await noImagesParser.initialize(VALID_EPUB_FILE);
            const images = await noImagesParser.extractImages();
            assert.strictEqual(images.length, 0, 'No images should be extracted when disabled');
            noImagesParser.dispose();
        });
    });
    
    describe('Error Handling Tests', function() {
        it('should throw error when using uninitialized parser', async function() {
            const parser = new EPUBParser();
            try {
                await parser.parseMetadata();
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('не инициализирован'), 'Error should mention initialization');
            }
        });
        
        it('should handle corrupted EPUB files gracefully', async function() {
            const parser = new EPUBParser();
            const result = await parser.initialize(CORRUPTED_EPUB_FILE);
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
            const parser = new EPUBParser();
            parser.metadata = { title: 'Test' };
            parser.content = 'Test content';
            parser.toc = [{ title: 'Chapter 1' }];
            parser.images = [{ id: 'img1' }];
            parser.cssFiles = [{ id: 'style1' }];
            parser.chapters = [{ id: 'ch1' }];
            parser.isInitialized = true;
            
            parser.dispose();
            
            assert.strictEqual(parser.metadata, null, 'Metadata should be cleared');
            assert.strictEqual(parser.content, null, 'Content should be cleared');
            assert.strictEqual(parser.toc, null, 'TOC should be cleared');
            assert.strictEqual(parser.images.length, 0, 'Images should be cleared');
            assert.strictEqual(parser.cssFiles.length, 0, 'CSS files should be cleared');
            assert.strictEqual(parser.chapters.length, 0, 'Chapters should be cleared');
            assert.strictEqual(parser.isInitialized, false, 'Initialized flag should be reset');
        });
    });
});

// Тесты для EPUBFormatHandler
describe('EPUBFormatHandler Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('File Opening Tests', function() {
        let handler;
        
        beforeEach(function() {
            handler = new EPUBFormatHandler();
        });
        
        afterEach(function() {
            if (handler) {
                handler.close();
                handler = null;
            }
        });
        
        it('should open valid EPUB file successfully', async function() {
            const result = await handler.openFile(VALID_EPUB_FILE);
            assert.strictEqual(result, true, 'Valid EPUB file should open successfully');
        });
        
        it('should throw exception when opening invalid EPUB file', async function() {
            try {
                await handler.openFile(INVALID_EPUB_FILE);
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.FormatException, 'Should throw FormatException');
            }
        });
        
        it('should throw exception when file does not exist', async function() {
            try {
                await handler.openFile('nonexistent_file.epub');
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error, 'Should throw an exception for nonexistent file');
            }
        });
    });
    
    describe('Content Access Tests', function() {
        let handler;
        
        beforeEach(async function() {
            handler = new EPUBFormatHandler();
            await handler.openFile(VALID_EPUB_FILE);
        });
        
        afterEach(function() {
            if (handler) {
                handler.close();
                handler = null;
            }
        });
        
        it('should get metadata from opened EPUB file', async function() {
            const metadata = await handler.getMetadata();
            assert.ok(metadata, 'Metadata should be retrieved');
            assert.ok(metadata.title, 'Title should be present in metadata');
        });
        
        it('should get TOC from opened EPUB file', async function() {
            const toc = await handler.getTOC();
            assert.ok(Array.isArray(toc), 'TOC should be an array');
            assert.ok(toc.length > 0, 'TOC should contain entries');
        });
        
        it('should get chapters from opened EPUB file', async function() {
            const chapters = await handler.getChapters();
            assert.ok(Array.isArray(chapters), 'Chapters should be an array');
            assert.ok(chapters.length > 0, 'Chapters should be retrieved');
        });
        
        it('should prepare WebView content', async function() {
            const content = await handler.prepareWebViewContent();
            assert.ok(content, 'WebView content should be prepared');
            assert.ok(content.includes('<html>'), 'Content should contain HTML');
            assert.ok(content.includes('<style>'), 'Content should contain styles');
            assert.ok(content.includes('<script>'), 'Content should contain script');
        });
        
        it('should navigate between chapters', async function() {
            // Переход к следующей главе
            const nextContent = await handler.navigateToNextChapter();
            assert.ok(nextContent, 'Should navigate to next chapter');
            
            // Переход к предыдущей главе
            const prevContent = await handler.navigateToPreviousChapter();
            assert.ok(prevContent, 'Should navigate to previous chapter');
            
            // Переход к конкретной главе
            const specificContent = await handler.navigateToChapter(0);
            assert.ok(specificContent, 'Should navigate to specific chapter');
        });
        
        it('should update render options', async function() {
            const newOptions = {
                fontScale: 1.2,
                lineHeight: 1.8,
                theme: 'dark'
            };
            
            const content = await handler.updateRenderOptions(newOptions);
            assert.ok(content, 'Should update render options and return content');
            assert.strictEqual(handler.options.renderOptions.fontScale, 1.2, 'Font scale should be updated');
            assert.strictEqual(handler.options.renderOptions.lineHeight, 1.8, 'Line height should be updated');
            assert.strictEqual(handler.options.renderOptions.theme, 'dark', 'Theme should be updated');
        });
    });
    
    describe('Error Handling Tests', function() {
        let handler;
        
        beforeEach(function() {
            handler = new EPUBFormatHandler();
        });
        
        afterEach(function() {
            if (handler) {
                handler.close();
                handler = null;
            }
        });
        
        it('should throw exception when accessing content without opening file', async function() {
            try {
                await handler.prepareWebViewContent();
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
        
        it('should throw exception when navigating without opening file', async function() {
            try {
                await handler.navigateToNextChapter();
                assert.fail('Should have thrown an exception');
            } catch (error) {
                assert.ok(error instanceof ExceptionHierarchy.StateException, 'Should throw StateException');
            }
        });
    });
    
    describe('Resource Management Tests', function() {
        it('should properly close and release resources', async function() {
            const handler = new EPUBFormatHandler();
            await handler.openFile(VALID_EPUB_FILE);
            
            // Проверяем, что файл открыт
            assert.ok(handler.parser, 'Parser should be created');
            assert.ok(handler.currentFile, 'Current file should be set');
            
            // Закрываем файл
            handler.close();
            
            // Проверяем, что ресурсы освобождены
            assert.strictEqual(handler.parser, null, 'Parser should be null after closing');
            assert.strictEqual(handler.currentFile, null, 'Current file should be null after closing');
            assert.strictEqual(handler.webViewContent, null, 'WebView content should be null after closing');
        });
    });
});

// Тесты для EPUBWebViewIntegration
describe('EPUBWebViewIntegration Tests', function() {
    before(function() {
        setupTestFiles();
    });
    
    describe('Initialization Tests', function() {
        it('should throw error when WebView not provided', function() {
            try {
                new EPUBWebViewIntegration(null);
                assert.fail('Should have thrown an error');
            } catch (error) {
                assert.ok(error.message.includes('WebView не предоставлен'), 'Error should mention WebView');
            }
        });
        
        it('should initialize with WebView', function() {
            const webView = new MockWebView();
            const integration = new EPUBWebViewIntegration(webView);
            
            assert.ok(integration.webView, 'WebView should be set');
            assert.ok(integration.handler, 'Handler should be created');
            assert.ok(integration.logger, 'Logger should be created');
            assert.strictEqual(integration.isLoaded, false, 'isLoaded should be false initially');
            assert.strictEqual(integration.currentFilePath, null, 'currentFilePath should be null initially');
        });
    });
    
    describe('Loading Tests', function() {
        let webView;
        let integration;
        
        beforeEach(function() {
            webView = new MockWebView();
            integration = new EPUBWebViewIntegration(webView);
        });
        
        afterEach(function() {
            if (integration) {
                integration.close();
                integration = null;
            }
        });
        
        it('should load EPUB file into WebView', async function() {
            const result = await integration.loadEPUB(VALID_EPUB_FILE);
            assert.strictEqual(result, true, 'Should successfully load EPUB');
            assert.ok(webView.content, 'WebView should have content');
        });
        
        it('should configure WebView settings for EPUB', async function() {
            await integration.loadEPUB(VALID_EPUB_FILE);
            
            // Проверяем, что настройки WebView сконфигурированы
            assert.strictEqual(webView.settings.javaScriptEnabled, true, 'JavaScript should be enabled');
            assert.strictEqual(webView.settings.supportZoom, true, 'Zoom should be supported');
            assert.strictEqual(webView.settings.builtInZoomControls, true, 'Built-in zoom controls should be enabled');
            assert.strictEqual(webView.settings.displayZoomControls, false, 'Display zoom controls should be disabled');
        });
        
        it('should inject JavaScript interface', async function() {
            await integration.loadEPUB(VALID_EPUB_FILE);
            
            // Проверяем, что JavaScript интерфейс добавлен
            assert.ok(webView.javascriptInterfaces['EPUBReader'], 'JavaScript interface should be added');
            assert.ok(typeof webView.javascriptInterfaces['EPUBReader'].navigateToNextChapter === 'function', 'Should have navigation methods');
        });
        
        it('should handle page finished event', async function() {
            const loadPromise = integration.loadEPUB(VALID_EPUB_FILE);
            
            // Имитируем завершение загрузки страницы
            if (webView.onPageFinishedCallback) {
                webView.onPageFinishedCallback();
            }
            
            await loadPromise;
            assert.strictEqual(integration.isLoaded, true, 'isLoaded should be true after page finished');
        });
    });
    
    describe('Navigation Tests', function() {
        let webView;
        let integration;
        
        beforeEach(async function() {
            webView = new MockWebView();
            integration = new EPUBWebViewIntegration(webView);
            await integration.loadEPUB(VALID_EPUB_FILE);
        });
        
        afterEach(function() {
            if (integration) {
                integration.close();
                integration = null;
            }
        });
        
        it('should navigate to next chapter', async function() {
            const result = await integration.navigateToNextChapter();
            assert.strictEqual(result, true, 'Should navigate to next chapter');
            assert.ok(webView.content, 'WebView should have updated content');
        });
        
        it('should navigate to previous chapter', async function() {
            // Сначала переходим к следующей главе
            await integration.navigateToNextChapter();
            
            // Затем возвращаемся к предыдущей
            const result = await integration.navigateToPreviousChapter();
            assert.strictEqual(result, true, 'Should navigate to previous chapter');
            assert.ok(webView.content, 'WebView should have updated content');
        });
        
        it('should navigate to specific chapter', async function() {
            const result = await integration.navigateToChapter(0);
            assert.strictEqual(result, true, 'Should navigate to specific chapter');
            assert.ok(webView.content, 'WebView should have updated content');
        });
    });
    
    describe('Rendering Options Tests', function() {
        let webView;
        let integration;
        
        beforeEach(async function() {
            webView = new MockWebView();
            integration = new EPUBWebViewIntegration(webView);
            await integration.loadEPUB(VALID_EPUB_FILE);
        });
        
        afterEach(function() {
            if (integration) {
                integration.close();
                integration = null;
            }
        });
        
        it('should update render options', async function() {
            const result = await integration.updateRenderOptions({
                fontScale: 1.5,
                lineHeight: 2.0,
                theme: 'dark'
            });
            
            assert.strictEqual(result, true, 'Should update render options');
            assert.ok(webView.content, 'WebView should have updated content');
            assert.strictEqual(integration.options.renderOptions.fontScale, 1.5, 'Font scale should be updated');
            assert.strictEqual(integration.options.renderOptions.lineHeight, 2.0, 'Line height should be updated');
            assert.strictEqual(integration.options.renderOptions.theme, 'dark', 'Theme should be updated');
        });
        
        it('should toggle theme', async function() {
            // Изначально тема светлая
            assert.strictEqual(integration.options.renderOptions.theme, 'light', 'Initial theme should be light');
            
            // Переключаем на темную
            const result1 = await integration.toggleTheme();
            assert.strictEqual(result1, true, 'Should toggle theme to dark');
            assert.strictEqual(integration.options.renderOptions.theme, 'dark', 'Theme should be dark after toggle');
            
            // Переключаем обратно на светлую
            const result2 = await integration.toggleTheme();
            assert.strictEqual(result2, true, 'Should toggle theme to light');
            assert.strictEqual(integration.options.renderOptions.theme, 'light', 'Theme should be light after toggle');
        });
        
        it('should change font size', async function() {
            // Изначальный размер шрифта
            assert.strictEqual(integration.options.renderOptions.fontScale, 1.0, 'Initial font scale should be 1.0');
            
            // Увеличиваем размер
            const result1 = await integration.changeFontSize(1.2);
            assert.strictEqual(result1, true, 'Should increase font size');
            assert.strictEqual(integration.options.renderOptions.fontScale, 1.2, 'Font scale should be increased');
            
            // Уменьшаем размер
            const result2 = await integration.changeFontSize(0.8);
            assert.strictEqual(result2, true, 'Should decrease font size');
            assert.strictEqual(integration.options.renderOptions.fontScale, 0.96, 'Font scale should be decreased');
        });
    });
    
    describe('Resource Management Tests', function() {
        it('should properly close and release resources', async function() {
            const webView = new MockWebView();
            const integration = new EPUBWebViewIntegration(webView);
            await integration.loadEPUB(VALID_EPUB_FILE);
            
            // Проверяем, что файл загружен
            assert.ok(integration.handler, 'Handler should be created');
            assert.ok(integration.currentFilePath, 'Current file path should be set');
            assert.strictEqual(integration.isLoaded, true, 'isLoaded should be true');
            
            // Закрываем интеграцию
            integration.close();
            
            // Проверяем, что ресурсы освобождены
            assert.strictEqual(integration.isLoaded, false, 'isLoaded should be false after closing');
            assert.strictEqual(integration.currentFilePath, null, 'currentFilePath should be null after closing');
            assert.strictEqual(webView.url, 'about:blank', 'WebView should be cleared');
        });
    });
});

// Запуск тестов
if (require.main === module) {
    // Если файл запущен напрямую, а не импортирован
    console.log('Running EPUB format tests...');
    
    // Здесь можно добавить код для запуска тестов
    // Например, с использованием Mocha программно
    
    console.log('EPUB format tests completed.');
}

module.exports = {
    setupTestFiles,
    TEST_FILES_DIR,
    VALID_EPUB_FILE,
    INVALID_EPUB_FILE,
    CORRUPTED_EPUB_FILE,
    MockWebView
};
