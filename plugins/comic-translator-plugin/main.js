/**
 * Плагин переводчика комиксов для MrComic
 * Автоматическое распознавание и перевод текста в комиксах
 */

class ComicTranslatorPlugin {
    constructor() {
        this.name = 'Comic Translator';
        this.version = '1.2.0';
        this.settings = {
            sourceLanguage: 'auto', // Автоопределение
            targetLanguage: 'ru',   // Русский
            ocrEngine: 'tesseract', // tesseract, google, azure
            translationEngine: 'google', // google, yandex, deepl, offline
            autoTranslate: false,
            preserveFormatting: true,
            showOriginalText: true,
            translationQuality: 'balanced', // fast, balanced, high
            textDetectionSensitivity: 0.7
        };
        
        this.supportedLanguages = {
            'en': 'English',
            'ru': 'Русский',
            'ja': '日本語',
            'ko': '한국어',
            'zh': '中文',
            'fr': 'Français',
            'de': 'Deutsch',
            'es': 'Español',
            'it': 'Italiano'
        };
        
        this.translationCache = new Map();
        this.init();
    }
    
    /**
     * Инициализация плагина
     */
    init() {
        if (typeof window.MrComicPlugin !== 'undefined') {
            window.MrComicPlugin.log('Comic Translator Plugin initialized');
            this.registerCommands();
            this.loadSettings();
            this.setupUI();
        }
    }
    
    /**
     * Регистрация команд плагина
     */
    registerCommands() {
        window.plugin = {
            executeCommand: (command, params) => {
                return this.handleCommand(command, params);
            }
        };
    }
    
    /**
     * Обработка команд
     */
    handleCommand(command, params) {
        try {
            switch (command) {
                case 'translate_page':
                    return this.translateCurrentPage(params.options);
                    
                case 'translate_text':
                    return this.translateText(params.text, params.options);
                    
                case 'detect_text':
                    return this.detectTextInImage(params.imagePath, params.options);
                    
                case 'batch_translate':
                    return this.batchTranslatePages(params.pages, params.options);
                    
                case 'toggle_translation':
                    return this.toggleTranslationDisplay();
                    
                case 'get_supported_languages':
                    return this.getSupportedLanguages();
                    
                case 'get_settings':
                    return this.getSettings();
                    
                case 'update_settings':
                    return this.updateSettings(params.settings);
                    
                case 'clear_cache':
                    return this.clearTranslationCache();
                    
                default:
                    throw new Error(`Unknown command: ${command}`);
            }
        } catch (error) {
            window.MrComicPlugin.log(`Error executing command ${command}: ${error.message}`);
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * Перевод текущей страницы
     */
    async translateCurrentPage(options = {}) {
        if (!window.MrComicPlugin.hasPermission('READER_CONTROL')) {
            throw new Error('No permission to control reader');
        }
        
        // Получение пути к текущему изображению
        const currentImagePath = window.MrComicPlugin.executeSystemCommand('get_current_page_path');
        
        if (!currentImagePath) {
            throw new Error('No current page to translate');
        }
        
        window.MrComicPlugin.log(`Translating page: ${currentImagePath}`);
        
        // 1. Обнаружение текста
        const detectionResult = await this.detectTextInImage(currentImagePath, options);
        
        if (!detectionResult.success || detectionResult.textBlocks.length === 0) {
            return {
                success: true,
                message: 'No text detected on this page',
                textBlocks: []
            };
        }
        
        // 2. Перевод обнаруженного текста
        const translationResults = [];
        
        for (const textBlock of detectionResult.textBlocks) {
            const translationResult = await this.translateText(textBlock.text, options);
            
            translationResults.push({
                ...textBlock,
                originalText: textBlock.text,
                translatedText: translationResult.success ? translationResult.translatedText : textBlock.text,
                confidence: translationResult.confidence || 0.5
            });
        }
        
        // 3. Отображение переводов в UI
        if (window.MrComicPlugin.hasPermission('UI_MODIFICATION')) {
            this.displayTranslations(translationResults);
        }
        
        return {
            success: true,
            textBlocks: translationResults,
            sourceLanguage: detectionResult.detectedLanguage,
            targetLanguage: this.settings.targetLanguage
        };
    }
    
    /**
     * Перевод текста
     */
    async translateText(text, options = {}) {
        const settings = { ...this.settings, ...options };
        
        // Проверка кэша
        const cacheKey = `${text}:${settings.sourceLanguage}:${settings.targetLanguage}`;
        if (this.translationCache.has(cacheKey)) {
            return {
                success: true,
                originalText: text,
                translatedText: this.translationCache.get(cacheKey),
                fromCache: true
            };
        }
        
        // Если исходный и целевой языки одинаковы
        if (settings.sourceLanguage === settings.targetLanguage) {
            return {
                success: true,
                originalText: text,
                translatedText: text,
                confidence: 1.0
            };
        }
        
        try {
            // Вызов службы перевода
            const translationResult = await this.callTranslationService(
                text, 
                settings.sourceLanguage, 
                settings.targetLanguage,
                settings.translationEngine
            );
            
            // Сохранение в кэш
            this.translationCache.set(cacheKey, translationResult.translatedText);
            
            return {
                success: true,
                originalText: text,
                translatedText: translationResult.translatedText,
                confidence: translationResult.confidence,
                detectedLanguage: translationResult.detectedLanguage
            };
            
        } catch (error) {
            window.MrComicPlugin.log(`Translation error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                originalText: text,
                translatedText: text // Возвращаем исходный текст при ошибке
            };
        }
    }
    
    /**
     * Обнаружение текста в изображении
     */
    async detectTextInImage(imagePath, options = {}) {
        if (!window.MrComicPlugin.hasPermission('READ_FILES')) {
            throw new Error('No permission to read files');
        }
        
        const settings = { ...this.settings, ...options };
        
        try {
            // Вызов OCR службы
            const ocrResult = await this.callOCRService(imagePath, settings.ocrEngine);
            
            return {
                success: true,
                textBlocks: ocrResult.textBlocks,
                detectedLanguage: ocrResult.detectedLanguage,
                confidence: ocrResult.confidence
            };
            
        } catch (error) {
            window.MrComicPlugin.log(`OCR error: ${error.message}`);
            return {
                success: false,
                error: error.message,
                textBlocks: []
            };
        }
    }
    
    /**
     * Пакетный перевод страниц
     */
    async batchTranslatePages(pages, options = {}) {
        const results = [];
        let successCount = 0;
        
        for (let i = 0; i < pages.length; i++) {
            try {
                // Обновление прогресса
                window.MrComicPlugin.executeSystemCommand('update_progress', {
                    current: i + 1,
                    total: pages.length,
                    status: `Translating page ${i + 1}/${pages.length}`
                });
                
                const result = await this.translateCurrentPage(options);
                results.push({
                    page: pages[i],
                    result: result
                });
                
                if (result.success) {
                    successCount++;
                }
                
            } catch (error) {
                results.push({
                    page: pages[i],
                    result: {
                        success: false,
                        error: error.message
                    }
                });
            }
        }
        
        return {
            success: true,
            results: results,
            summary: {
                total: pages.length,
                successful: successCount,
                failed: pages.length - successCount
            }
        };
    }
    
    /**
     * Переключение отображения переводов
     */
    toggleTranslationDisplay() {
        if (!window.MrComicPlugin.hasPermission('UI_MODIFICATION')) {
            throw new Error('No permission to modify UI');
        }
        
        // Переключение видимости переводов
        window.MrComicPlugin.executeSystemCommand('toggle_translation_overlay');
        
        return {
            success: true,
            message: 'Translation display toggled'
        };
    }
    
    /**
     * Получение поддерживаемых языков
     */
    getSupportedLanguages() {
        return {
            success: true,
            languages: this.supportedLanguages
        };
    }
    
    /**
     * Загрузка настроек
     */
    loadSettings() {
        const savedSettings = window.MrComicPlugin.getPluginData('settings');
        if (savedSettings) {
            this.settings = { ...this.settings, ...savedSettings };
        }
    }
    
    /**
     * Получение настроек
     */
    getSettings() {
        return {
            success: true,
            settings: this.settings
        };
    }
    
    /**
     * Обновление настроек
     */
    updateSettings(newSettings) {
        this.settings = { ...this.settings, ...newSettings };
        window.MrComicPlugin.setPluginData('settings', this.settings);
        
        return {
            success: true,
            settings: this.settings
        };
    }
    
    /**
     * Очистка кэша переводов
     */
    clearTranslationCache() {
        this.translationCache.clear();
        
        return {
            success: true,
            message: 'Translation cache cleared'
        };
    }
    
    /**
     * Настройка пользовательского интерфейса
     */
    setupUI() {
        if (!window.MrComicPlugin.hasPermission('UI_MODIFICATION')) {
            return;
        }
        
        // Добавление кнопки перевода в интерфейс читалки
        window.MrComicPlugin.executeSystemCommand('add_toolbar_button', {
            id: 'translate-button',
            icon: 'translate',
            tooltip: 'Перевести страницу',
            onClick: () => this.translateCurrentPage()
        });
        
        // Добавление панели настроек
        window.MrComicPlugin.executeSystemCommand('add_settings_panel', {
            id: 'translation-settings',
            title: 'Настройки перевода',
            component: 'TranslationSettingsPanel'
        });
    }
    
    /**
     * Отображение переводов в UI
     */
    displayTranslations(textBlocks) {
        if (!window.MrComicPlugin.hasPermission('UI_MODIFICATION')) {
            return;
        }
        
        // Создание оверлея с переводами
        window.MrComicPlugin.executeSystemCommand('create_translation_overlay', {
            textBlocks: textBlocks,
            showOriginal: this.settings.showOriginalText,
            preserveFormatting: this.settings.preserveFormatting
        });
    }
    
    /**
     * Вызов службы OCR
     */
    async callOCRService(imagePath, engine) {
        // Симуляция OCR обработки
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    textBlocks: [
                        {
                            text: "Sample manga text",
                            x: 100,
                            y: 50,
                            width: 200,
                            height: 30,
                            confidence: 0.85
                        },
                        {
                            text: "Another text block",
                            x: 150,
                            y: 200,
                            width: 180,
                            height: 25,
                            confidence: 0.92
                        }
                    ],
                    detectedLanguage: 'en',
                    confidence: 0.88
                });
            }, 1000);
        });
    }
    
    /**
     * Вызов службы перевода
     */
    async callTranslationService(text, sourceLanguage, targetLanguage, engine) {
        // Проверка доступа к сети
        if (!window.MrComicPlugin.hasPermission('NETWORK_ACCESS') && engine !== 'offline') {
            throw new Error('Network access required for online translation');
        }
        
        // Симуляция перевода
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    translatedText: `[Переведено] ${text}`,
                    confidence: 0.85,
                    detectedLanguage: sourceLanguage === 'auto' ? 'en' : sourceLanguage
                });
            }, 500);
        });
    }
}

// Инициализация плагина
const comicTranslator = new ComicTranslatorPlugin();

// Экспорт для использования в других частях системы
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ComicTranslatorPlugin;
}