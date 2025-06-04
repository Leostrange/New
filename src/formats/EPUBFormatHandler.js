/**
 * EPUBFormatHandler.js
 * 
 * Обработчик формата EPUB для интеграции с основным приложением.
 * Предоставляет интерфейс для работы с файлами EPUB в контексте приложения
 * и их отображения в WebView.
 */

const EPUBParser = require('./EPUBParser');
const { ExceptionHierarchy } = require('../exceptions/ExceptionHierarchy');
const { Logger } = require('../exceptions/Logger');

class EPUBFormatHandler {
    /**
     * Создает экземпляр обработчика формата EPUB.
     * @param {Object} options - Опции конфигурации обработчика.
     */
    constructor(options = {}) {
        this.options = {
            cacheEnabled: true,
            renderOptions: {
                fontScale: 1.0,
                lineHeight: 1.5,
                margins: { top: 10, right: 10, bottom: 10, left: 10 },
                theme: 'light' // 'light' или 'dark'
            },
            ...options
        };
        
        this.parser = null;
        this.currentFile = null;
        this.logger = new Logger('EPUBFormatHandler');
        this.webViewContent = null;
        this.currentChapterIndex = 0;
    }

    /**
     * Открывает файл EPUB для обработки.
     * @param {string} filePath - Путь к файлу EPUB.
     * @returns {Promise<boolean>} - Результат открытия файла.
     */
    async openFile(filePath) {
        try {
            this.logger.info(`Открытие файла EPUB: ${filePath}`);
            
            // Проверка валидности файла
            const isValid = await EPUBParser.isValidEPUB(filePath);
            if (!isValid) {
                this.logger.error(`Файл не является валидным EPUB: ${filePath}`);
                throw new ExceptionHierarchy.FormatException('Недействительный формат файла EPUB');
            }
            
            // Создание и инициализация парсера
            this.parser = new EPUBParser({
                extractImages: true,
                cacheResults: this.options.cacheEnabled
            });
            
            const initialized = await this.parser.initialize(filePath);
            if (!initialized) {
                this.logger.error(`Не удалось инициализировать парсер EPUB для файла: ${filePath}`);
                throw new ExceptionHierarchy.ParserException('Ошибка инициализации парсера EPUB');
            }
            
            this.currentFile = filePath;
            this.logger.info(`Файл EPUB успешно открыт: ${filePath}`);
            
            // Извлекаем главы для дальнейшего использования
            await this.parser.extractChapters();
            
            return true;
        } catch (error) {
            this.logger.error(`Ошибка при открытии файла EPUB: ${error.message}`, error);
            
            // Очистка ресурсов в случае ошибки
            if (this.parser) {
                this.parser.dispose();
                this.parser = null;
            }
            this.currentFile = null;
            
            throw error;
        }
    }

    /**
     * Получает метаданные из открытого файла EPUB.
     * @returns {Promise<Object>} - Объект с метаданными.
     */
    async getMetadata() {
        this._ensureFileOpen();
        
        try {
            return await this.parser.parseMetadata();
        } catch (error) {
            this.logger.error(`Ошибка при получении метаданных EPUB: ${error.message}`, error);
            throw new ExceptionHierarchy.DataExtractionException('Не удалось извлечь метаданные из файла EPUB');
        }
    }

    /**
     * Получает оглавление из открытого файла EPUB.
     * @returns {Promise<Array>} - Массив с элементами оглавления.
     */
    async getTOC() {
        this._ensureFileOpen();
        
        try {
            return await this.parser.extractTOC();
        } catch (error) {
            this.logger.error(`Ошибка при получении оглавления EPUB: ${error.message}`, error);
            throw new ExceptionHierarchy.DataExtractionException('Не удалось извлечь оглавление из файла EPUB');
        }
    }

    /**
     * Получает список глав из открытого файла EPUB.
     * @returns {Promise<Array>} - Массив с информацией о главах.
     */
    async getChapters() {
        this._ensureFileOpen();
        
        try {
            return this.parser.chapters;
        } catch (error) {
            this.logger.error(`Ошибка при получении списка глав EPUB: ${error.message}`, error);
            throw new ExceptionHierarchy.DataExtractionException('Не удалось получить список глав из файла EPUB');
        }
    }

    /**
     * Подготавливает содержимое для отображения в WebView.
     * @param {number} chapterIndex - Индекс главы для отображения.
     * @returns {Promise<string>} - HTML-содержимое для WebView.
     */
    async prepareWebViewContent(chapterIndex = 0) {
        this._ensureFileOpen();
        
        try {
            // Сохраняем текущий индекс главы
            this.currentChapterIndex = chapterIndex;
            
            // Получаем содержимое главы
            const chapterContent = await this.parser.extractChapterContent(chapterIndex);
            
            // Получаем CSS файлы
            const cssFiles = await this.parser.extractCSSFiles();
            
            // Формируем полное HTML-содержимое для WebView
            // Включаем CSS и применяем настройки темы
            const theme = this.options.renderOptions.theme;
            const fontScale = this.options.renderOptions.fontScale;
            const lineHeight = this.options.renderOptions.lineHeight;
            
            // Создаем базовый HTML с инъекцией CSS и настройками
            this.webViewContent = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="utf-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <style>
                        body {
                            font-size: ${fontScale}em;
                            line-height: ${lineHeight};
                            margin: ${this.options.renderOptions.margins.top}px ${this.options.renderOptions.margins.right}px ${this.options.renderOptions.margins.bottom}px ${this.options.renderOptions.margins.left}px;
                            ${theme === 'dark' ? 'background-color: #222; color: #eee;' : 'background-color: #fff; color: #222;'}
                        }
                        
                        /* Встраиваем CSS из EPUB */
                        ${cssFiles.map(css => css.content).join('\n')}
                        
                        /* Переопределения для темы */
                        ${theme === 'dark' ? `
                            a { color: #9af; }
                            img { filter: brightness(0.8); }
                        ` : ''}
                    </style>
                </head>
                <body>
                    ${chapterContent}
                    <script>
                        // Скрипт для обработки навигации и взаимодействия
                        document.addEventListener('DOMContentLoaded', function() {
                            // Обработка внутренних ссылок
                            document.querySelectorAll('a').forEach(function(link) {
                                link.addEventListener('click', function(e) {
                                    const href = this.getAttribute('href');
                                    if (href && href.startsWith('#')) {
                                        // Внутренняя навигация
                                        e.preventDefault();
                                        const target = document.querySelector(href);
                                        if (target) {
                                            target.scrollIntoView({ behavior: 'smooth' });
                                        }
                                    }
                                });
                            });
                        });
                    </script>
                </body>
                </html>
            `;
            
            return this.webViewContent;
        } catch (error) {
            this.logger.error(`Ошибка при подготовке содержимого для WebView: ${error.message}`, error);
            throw new ExceptionHierarchy.RenderingException('Не удалось подготовить содержимое EPUB для WebView');
        }
    }

    /**
     * Переходит к следующей главе.
     * @returns {Promise<string|null>} - HTML-содержимое следующей главы или null, если это последняя глава.
     */
    async navigateToNextChapter() {
        this._ensureFileOpen();
        
        try {
            if (this.currentChapterIndex < this.parser.chapters.length - 1) {
                this.currentChapterIndex++;
                return await this.prepareWebViewContent(this.currentChapterIndex);
            }
            return null; // Достигнут конец книги
        } catch (error) {
            this.logger.error(`Ошибка при переходе к следующей главе: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * Переходит к предыдущей главе.
     * @returns {Promise<string|null>} - HTML-содержимое предыдущей главы или null, если это первая глава.
     */
    async navigateToPreviousChapter() {
        this._ensureFileOpen();
        
        try {
            if (this.currentChapterIndex > 0) {
                this.currentChapterIndex--;
                return await this.prepareWebViewContent(this.currentChapterIndex);
            }
            return null; // Достигнуто начало книги
        } catch (error) {
            this.logger.error(`Ошибка при переходе к предыдущей главе: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * Переходит к указанной главе по индексу.
     * @param {number} chapterIndex - Индекс главы.
     * @returns {Promise<string>} - HTML-содержимое указанной главы.
     */
    async navigateToChapter(chapterIndex) {
        this._ensureFileOpen();
        
        try {
            if (chapterIndex < 0 || chapterIndex >= this.parser.chapters.length) {
                throw new Error(`Индекс главы вне диапазона: ${chapterIndex}`);
            }
            
            return await this.prepareWebViewContent(chapterIndex);
        } catch (error) {
            this.logger.error(`Ошибка при переходе к главе ${chapterIndex}: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * Обновляет настройки отображения и перерендерит текущую главу.
     * @param {Object} renderOptions - Новые настройки отображения.
     * @returns {Promise<string>} - Обновленное HTML-содержимое.
     */
    async updateRenderOptions(renderOptions) {
        this._ensureFileOpen();
        
        try {
            // Обновляем настройки
            this.options.renderOptions = {
                ...this.options.renderOptions,
                ...renderOptions
            };
            
            // Перерендерим текущую главу с новыми настройками
            return await this.prepareWebViewContent(this.currentChapterIndex);
        } catch (error) {
            this.logger.error(`Ошибка при обновлении настроек отображения: ${error.message}`, error);
            throw error;
        }
    }

    /**
     * Проверяет, открыт ли файл, и выбрасывает исключение, если нет.
     * @private
     */
    _ensureFileOpen() {
        if (!this.parser || !this.currentFile) {
            throw new ExceptionHierarchy.StateException('Файл EPUB не открыт. Вызовите openFile() перед использованием других методов.');
        }
    }

    /**
     * Закрывает текущий файл и освобождает ресурсы.
     */
    close() {
        if (this.parser) {
            this.parser.dispose();
            this.parser = null;
        }
        this.currentFile = null;
        this.webViewContent = null;
        this.currentChapterIndex = 0;
        this.logger.info('Файл EPUB закрыт');
    }
}

module.exports = EPUBFormatHandler;
