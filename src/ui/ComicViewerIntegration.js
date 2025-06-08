// ComicViewerIntegration.js
// Интеграция ComicTranslationPanel в просмотрщик комиксов (SPA/PWA)

const ComicTranslationPanel = require('./ComicTranslationPanel');
const TranslationCacheManager = require('../cache/TranslationCacheManager');

class ComicViewerIntegration {
    /**
     * @param {Object} options
     * @param {function} options.getCurrentPageImage - функция, возвращающая HTMLImageElement/Canvas текущей страницы
     * @param {function} options.getChapterId - функция, возвращающая id текущей главы
     * @param {function} options.getPageIndex - функция, возвращающая индекс текущей страницы
     * @param {Array<HTMLImageElement|HTMLCanvasElement>} options.pages - массив всех страниц главы (для batch)
     * @param {HTMLElement} options.translationPanelContainer - контейнер для панели перевода
     * @param {Object} options.ocrConfig
     * @param {Object} options.translationConfig
     * @param {Object} options.theme
     * @param {Object} options.locale
     */
    constructor(options) {
        this.getCurrentPageImage = options.getCurrentPageImage;
        this.getChapterId = options.getChapterId;
        this.getPageIndex = options.getPageIndex;
        this.pages = options.pages || [];
        this.container = options.translationPanelContainer;
        this.ocrConfig = options.ocrConfig || {};
        this.translationConfig = options.translationConfig || {};
        this.theme = options.theme || {};
        this.locale = options.locale || {
            translate: 'Перевести страницу',
            show: 'Показать перевод',
            hide: 'Скрыть перевод',
            save: 'Сохранить в кэш',
            clear: 'Очистить кэш',
            batch: 'Перевести всю главу',
            export: 'Экспортировать перевод',
            progress: 'Прогресс',
            error: 'Ошибка',
            edit: 'Редактировать перевод',
            auto: 'Автоперевод при открытии',
            alwaysShow: 'Всегда показывать перевод из кэша'
        };
        this.cacheManager = new TranslationCacheManager();
        this.currentPanel = null;
        this._renderPanel();
    }

    // Вызывается при открытии/переключении страницы
    _renderPanel() {
        if (!this.container) return;
        this.container.innerHTML = '';
        const pageImage = this.getCurrentPageImage();
        const chapterId = this.getChapterId();
        const pageIndex = this.getPageIndex();
        const pageId = `${chapterId}-page${pageIndex}`;
        this.currentPanel = new ComicTranslationPanel({
            container: this.container,
            pageImage,
            pageId,
            ocrConfig: this.ocrConfig,
            translationConfig: this.translationConfig,
            theme: this.theme,
            locale: this.locale
        });
    }

    // Batch-перевод всей главы
    async translateWholeChapter() {
        for (let i = 0; i < this.pages.length; i++) {
            const pageId = `${this.getChapterId()}-page${i}`;
            const panel = new ComicTranslationPanel({
                container: document.createElement('div'), // временный контейнер
                pageImage: this.pages[i],
                pageId,
                ocrConfig: this.ocrConfig,
                translationConfig: this.translationConfig,
                theme: this.theme,
                locale: this.locale
            });
            await panel._handleTranslate();
            await panel._handleSaveCache();
        }
        alert('Глава переведена и сохранена в кэш!');
    }

    // Экспорт перевода одной страницы
    async exportTranslation(pageId) {
        const cache = await this.cacheManager.loadPage(pageId);
        if (cache) {
            const data = {
                pageId: cache.pageId,
                bubbles: cache.bubbles.map(b => ({
                    bbox: b.bbox,
                    original: b.text,
                    translated: b.translatedText
                }))
            };
            const blob = new Blob([JSON.stringify(data, null, 2)], {type: 'application/json'});
            const a = document.createElement('a');
            a.href = URL.createObjectURL(blob);
            a.download = `${pageId}-translation.json`;
            a.click();
        }
    }

    // Экспорт всех переводов главы
    async exportChapterTranslations() {
        const chapterId = this.getChapterId();
        const all = [];
        for (let i = 0; i < this.pages.length; i++) {
            const pageId = `${chapterId}-page${i}`;
            const cache = await this.cacheManager.loadPage(pageId);
            if (cache) {
                all.push({
                    pageId: cache.pageId,
                    bubbles: cache.bubbles.map(b => ({
                        bbox: b.bbox,
                        original: b.text,
                        translated: b.translatedText
                    }))
                });
            }
        }
        const blob = new Blob([JSON.stringify(all, null, 2)], {type: 'application/json'});
        const a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = `${chapterId}-translations.json`;
        a.click();
    }

    // Для SPA/PWA: вызывать при переходе между страницами
    onPageChange() {
        this._renderPanel();
    }
}

module.exports = ComicViewerIntegration; 