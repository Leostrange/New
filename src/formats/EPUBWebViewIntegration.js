/**
 * EPUBWebViewIntegration.js
 * 
 * Компонент для интеграции EPUB с WebView.
 * Обеспечивает отображение EPUB файлов в WebView и взаимодействие с ними.
 */

const EPUBFormatHandler = require('./EPUBFormatHandler');
const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class EPUBWebViewIntegration {
    /**
     * Создает экземпляр интеграции EPUB с WebView.
     * @param {Object} webView - Экземпляр WebView для отображения контента.
     * @param {Object} options - Опции конфигурации.
     */
    constructor(webView, options = {}) {
        if (!webView) {
            throw new Error('WebView не предоставлен для интеграции EPUB');
        }
        
        this.webView = webView;
        this.options = {
            enableJavaScript: true,
            enableZoom: true,
            cacheEnabled: true,
            renderOptions: {
                fontScale: 1.0,
                lineHeight: 1.5,
                margins: { top: 10, right: 10, bottom: 10, left: 10 },
                theme: 'light' // 'light' или 'dark'
            },
            ...options
        };
        
        this.handler = new EPUBFormatHandler(this.options);
        this.logger = new Logger('EPUBWebViewIntegration');
        this.isLoaded = false;
        this.currentFilePath = null;
        
        // Инициализация обработчиков событий WebView
        this._setupWebViewEventHandlers();
    }

    /**
     * Настраивает обработчики событий WebView.
     * @private
     */
    _setupWebViewEventHandlers() {
        // Обработчик завершения загрузки страницы
        this.webView.setOnPageFinishedListener(() => {
            this.isLoaded = true;
            this.logger.info('WebView завершил загрузку EPUB контента');
            
            // Инжектируем JavaScript для обработки жестов и навигации
            if (this.options.enableJavaScript) {
                this._injectNavigationHandlers();
            }
        });
        
        // Обработчик ошибок загрузки
        this.webView.setOnErrorListener((error) => {
            this.isLoaded = false;
            this.logger.error(`Ошибка загрузки EPUB в WebView: ${error.message}`, error);
        });
    }

    /**
     * Инжектирует JavaScript-обработчики для навигации и взаимодействия.
     * @private
     */
    _injectNavigationHandlers() {
        const script = `
            // Обработчик свайпов для навигации между главами
            let touchStartX = 0;
            let touchEndX = 0;
            
            document.addEventListener('touchstart', function(e) {
                touchStartX = e.changedTouches[0].screenX;
            }, false);
            
            document.addEventListener('touchend', function(e) {
                touchEndX = e.changedTouches[0].screenX;
                handleSwipe();
            }, false);
            
            function handleSwipe() {
                const threshold = 100; // Минимальное расстояние для свайпа
                
                if (touchEndX < touchStartX - threshold) {
                    // Свайп влево - следующая глава
                    window.EPUBReader.navigateToNextChapter();
                }
                
                if (touchEndX > touchStartX + threshold) {
                    // Свайп вправо - предыдущая глава
                    window.EPUBReader.navigateToPreviousChapter();
                }
            }
            
            // Обработчик для внутренних ссылок
            document.querySelectorAll('a[href^="#"]').forEach(function(link) {
                link.addEventListener('click', function(e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href').substring(1);
                    const targetElement = document.getElementById(targetId);
                    
                    if (targetElement) {
                        targetElement.scrollIntoView({ behavior: 'smooth' });
                    }
                });
            });
            
            // Сообщаем о готовности JavaScript
            window.EPUBReader.onJavaScriptLoaded();
        `;
        
        this.webView.evaluateJavaScript(script);
    }

    /**
     * Загружает EPUB файл в WebView.
     * @param {string} filePath - Путь к файлу EPUB.
     * @returns {Promise<boolean>} - Результат загрузки.
     */
    async loadEPUB(filePath) {
        try {
            this.logger.info(`Загрузка EPUB файла в WebView: ${filePath}`);
            this.isLoaded = false;
            this.currentFilePath = filePath;
            
            // Открываем файл через обработчик
            await this.handler.openFile(filePath);
            
            // Подготавливаем содержимое для WebView
            const content = await this.handler.prepareWebViewContent();
            
            // Загружаем содержимое в WebView
            this.webView.loadDataWithBaseURL('file:///android_asset/', content, 'text/html', 'UTF-8', null);
            
            // Настраиваем WebView для EPUB
            this._configureWebViewForEPUB();
            
            return true;
        } catch (error) {
            this.logger.error(`Ошибка загрузки EPUB в WebView: ${error.message}`, error);
            this.isLoaded = false;
            throw error;
        }
    }

    /**
     * Настраивает WebView для оптимального отображения EPUB.
     * @private
     */
    _configureWebViewForEPUB() {
        // Настройки WebView для EPUB
        const settings = this.webView.getSettings();
        
        // Включаем JavaScript, если требуется
        settings.setJavaScriptEnabled(this.options.enableJavaScript);
        
        // Настраиваем масштабирование
        settings.setSupportZoom(this.options.enableZoom);
        settings.setBuiltInZoomControls(this.options.enableZoom);
        settings.setDisplayZoomControls(false); // Скрываем стандартные контролы зума
        
        // Настраиваем кэширование
        if (this.options.cacheEnabled) {
            settings.setCacheMode(settings.LOAD_DEFAULT);
        } else {
            settings.setCacheMode(settings.LOAD_NO_CACHE);
        }
        
        // Оптимизация отображения текста
        settings.setStandardFontFamily("sans-serif");
        settings.setDefaultFontSize(16);
        settings.setDefaultFixedFontSize(14);
        
        // Настраиваем интерфейс JavaScript для взаимодействия с нативным кодом
        this.webView.addJavascriptInterface({
            navigateToNextChapter: () => {
                this.navigateToNextChapter();
            },
            navigateToPreviousChapter: () => {
                this.navigateToPreviousChapter();
            },
            onJavaScriptLoaded: () => {
                this.logger.info('JavaScript для EPUB WebView успешно загружен');
            }
        }, "EPUBReader");
    }

    /**
     * Переходит к следующей главе.
     * @returns {Promise<boolean>} - Успешность перехода.
     */
    async navigateToNextChapter() {
        try {
            const content = await this.handler.navigateToNextChapter();
            if (content) {
                this.webView.loadDataWithBaseURL('file:///android_asset/', content, 'text/html', 'UTF-8', null);
                return true;
            }
            return false; // Достигнут конец книги
        } catch (error) {
            this.logger.error(`Ошибка при переходе к следующей главе: ${error.message}`, error);
            return false;
        }
    }

    /**
     * Переходит к предыдущей главе.
     * @returns {Promise<boolean>} - Успешность перехода.
     */
    async navigateToPreviousChapter() {
        try {
            const content = await this.handler.navigateToPreviousChapter();
            if (content) {
                this.webView.loadDataWithBaseURL('file:///android_asset/', content, 'text/html', 'UTF-8', null);
                return true;
            }
            return false; // Достигнуто начало книги
        } catch (error) {
            this.logger.error(`Ошибка при переходе к предыдущей главе: ${error.message}`, error);
            return false;
        }
    }

    /**
     * Переходит к указанной главе по индексу.
     * @param {number} chapterIndex - Индекс главы.
     * @returns {Promise<boolean>} - Успешность перехода.
     */
    async navigateToChapter(chapterIndex) {
        try {
            const content = await this.handler.navigateToChapter(chapterIndex);
            if (content) {
                this.webView.loadDataWithBaseURL('file:///android_asset/', content, 'text/html', 'UTF-8', null);
                return true;
            }
            return false;
        } catch (error) {
            this.logger.error(`Ошибка при переходе к главе ${chapterIndex}: ${error.message}`, error);
            return false;
        }
    }

    /**
     * Получает оглавление текущего EPUB файла.
     * @returns {Promise<Array>} - Массив с элементами оглавления.
     */
    async getTOC() {
        try {
            return await this.handler.getTOC();
        } catch (error) {
            this.logger.error(`Ошибка при получении оглавления: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * Обновляет настройки отображения EPUB.
     * @param {Object} renderOptions - Новые настройки отображения.
     * @returns {Promise<boolean>} - Успешность обновления.
     */
    async updateRenderOptions(renderOptions) {
        try {
            const content = await this.handler.updateRenderOptions(renderOptions);
            if (content) {
                this.webView.loadDataWithBaseURL('file:///android_asset/', content, 'text/html', 'UTF-8', null);
                return true;
            }
            return false;
        } catch (error) {
            this.logger.error(`Ошибка при обновлении настроек отображения: ${error.message}`, error);
            return false;
        }
    }

    /**
     * Переключает тему отображения (светлая/темная).
     * @returns {Promise<boolean>} - Успешность переключения.
     */
    async toggleTheme() {
        try {
            const currentTheme = this.options.renderOptions.theme;
            const newTheme = currentTheme === 'light' ? 'dark' : 'light';
            
            return await this.updateRenderOptions({ theme: newTheme });
        } catch (error) {
            this.logger.error(`Ошибка при переключении темы: ${error.message}`, error);
            return false;
        }
    }

    /**
     * Изменяет размер шрифта.
     * @param {number} scaleFactor - Коэффициент изменения (>1 - увеличение, <1 - уменьшение).
     * @returns {Promise<boolean>} - Успешность изменения.
     */
    async changeFontSize(scaleFactor) {
        try {
            const currentScale = this.options.renderOptions.fontScale;
            const newScale = Math.max(0.5, Math.min(2.0, currentScale * scaleFactor));
            
            return await this.updateRenderOptions({ fontScale: newScale });
        } catch (error) {
            this.logger.error(`Ошибка при изменении размера шрифта: ${error.message}`, error);
            return false;
        }
    }

    /**
     * Закрывает текущий EPUB файл и освобождает ресурсы.
     */
    close() {
        if (this.handler) {
            this.handler.close();
        }
        
        this.isLoaded = false;
        this.currentFilePath = null;
        this.webView.loadUrl("about:blank");
        this.logger.info('EPUB WebView интеграция закрыта');
    }
}

module.exports = EPUBWebViewIntegration;
