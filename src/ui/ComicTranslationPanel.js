// ComicTranslationPanel.js
// UI-компонент для перевода и отображения перевода страниц комикса

const OcrManager = require('../ocr/OcrManager');
const TranslationManager = require('../translation/TranslationManager');
const OverlayRenderer = require('./OverlayRenderer');
const TranslationCacheManager = require('../cache/TranslationCacheManager');

class ComicTranslationPanel {
    /**
     * @param {Object} options
     * @param {HTMLElement} options.container - DOM-элемент для рендера
     * @param {HTMLImageElement|HTMLCanvasElement} options.pageImage - Изображение страницы
     * @param {string} options.pageId - Уникальный id страницы
     * @param {Object} options.ocrConfig
     * @param {Object} options.translationConfig
     */
    constructor(options) {
        this.container = options.container;
        this.pageImage = options.pageImage;
        this.pageId = options.pageId;
        this.ocrConfig = options.ocrConfig || {};
        this.translationConfig = options.translationConfig || {};
        this.ocrManager = new OcrManager({ ocrConfig: this.ocrConfig });
        this.translationManager = new TranslationManager(this.translationConfig);
        this.cacheManager = new TranslationCacheManager();
        this.overlayOptions = {
            font: 'bold 18px Segoe UI, Arial, sans-serif',
            textColor: '#222',
            bgColor: 'rgba(255,255,255,0.92)',
            padding: 6
        };
        this.state = {
            loading: false,
            progress: 0,
            error: '',
            bubbles: [],
            translated: [],
            overlayMode: 'translation', // translation | both | original
            autoTranslate: false,
            alwaysShowCache: true,
            cache: null,
            showOverlay: false,
            manualEdit: {} // {bubbleIdx: 'текст'}
        };
        this._render();
        this._init();
    }

    async _init() {
        // Проверяем кэш
        const cache = await this.cacheManager.loadPage(this.pageId);
        if (cache && this.state.alwaysShowCache) {
            this.state.cache = cache;
            this.state.showOverlay = true;
            this._render();
        } else if (this.state.autoTranslate) {
            this._handleTranslate();
        }
    }

    _render() {
        if (!this.container) return;
        this.container.innerHTML = '';
        // Кнопки управления
        const btnPanel = document.createElement('div');
        btnPanel.className = 'ctp-btn-panel';
        // Перевести
        const btnTranslate = document.createElement('button');
        btnTranslate.textContent = 'Перевести страницу';
        btnTranslate.disabled = this.state.loading;
        btnTranslate.onclick = () => this._handleTranslate();
        btnPanel.appendChild(btnTranslate);
        // Показать перевод
        const btnShow = document.createElement('button');
        btnShow.textContent = this.state.showOverlay ? 'Скрыть перевод' : 'Показать перевод';
        btnShow.onclick = () => { this.state.showOverlay = !this.state.showOverlay; this._render(); };
        btnPanel.appendChild(btnShow);
        // Сохранить в кэш
        const btnSave = document.createElement('button');
        btnSave.textContent = 'Сохранить в кэш';
        btnSave.disabled = this.state.loading || !!this.state.cache;
        btnSave.onclick = () => this._handleSaveCache();
        btnPanel.appendChild(btnSave);
        // Очистить кэш
        const btnClear = document.createElement('button');
        btnClear.textContent = 'Очистить кэш';
        btnClear.disabled = this.state.loading || !this.state.cache;
        btnClear.onclick = () => this._handleClearCache();
        btnPanel.appendChild(btnClear);
        this.container.appendChild(btnPanel);
        // Переключатели
        const switches = document.createElement('div');
        switches.className = 'ctp-switches';
        // Автоперевод
        const autoSwitch = document.createElement('label');
        autoSwitch.innerHTML = `<input type="checkbox" ${this.state.autoTranslate ? 'checked' : ''}> Автоперевод при открытии`;
        autoSwitch.querySelector('input').onchange = (e) => { this.state.autoTranslate = e.target.checked; };
        switches.appendChild(autoSwitch);
        // Всегда показывать кэш
        const cacheSwitch = document.createElement('label');
        cacheSwitch.innerHTML = `<input type="checkbox" ${this.state.alwaysShowCache ? 'checked' : ''}> Всегда показывать перевод из кэша`;
        cacheSwitch.querySelector('input').onchange = (e) => { this.state.alwaysShowCache = e.target.checked; };
        switches.appendChild(cacheSwitch);
        this.container.appendChild(switches);
        // Overlay-настройки (collapsible)
        const overlayPanel = document.createElement('details');
        overlayPanel.innerHTML = `<summary>Настройки Overlay</summary>`;
        // Шрифт
        const fontInput = document.createElement('input');
        fontInput.type = 'text';
        fontInput.value = this.overlayOptions.font;
        fontInput.onchange = (e) => { this.overlayOptions.font = e.target.value; this._render(); };
        overlayPanel.appendChild(document.createTextNode('Шрифт: '));
        overlayPanel.appendChild(fontInput);
        // Цвет текста
        const colorInput = document.createElement('input');
        colorInput.type = 'color';
        colorInput.value = '#222222';
        colorInput.onchange = (e) => { this.overlayOptions.textColor = e.target.value; this._render(); };
        overlayPanel.appendChild(document.createTextNode(' Цвет: '));
        overlayPanel.appendChild(colorInput);
        // Прозрачность
        const alphaInput = document.createElement('input');
        alphaInput.type = 'range';
        alphaInput.min = 0.5; alphaInput.max = 1; alphaInput.step = 0.01;
        alphaInput.value = parseFloat(this.overlayOptions.bgColor.split(',')[3] || 0.92);
        alphaInput.oninput = (e) => {
            const alpha = parseFloat(e.target.value);
            this.overlayOptions.bgColor = `rgba(255,255,255,${alpha})`;
            this._render();
        };
        overlayPanel.appendChild(document.createTextNode(' Прозрачность: '));
        overlayPanel.appendChild(alphaInput);
        // Режим отображения
        const modeSelect = document.createElement('select');
        ['translation','both','original'].forEach(mode => {
            const opt = document.createElement('option');
            opt.value = mode;
            opt.textContent = {
                translation: 'Только перевод',
                both: 'Оригинал + перевод',
                original: 'Только оригинал'
            }[mode];
            if (this.state.overlayMode === mode) opt.selected = true;
            modeSelect.appendChild(opt);
        });
        modeSelect.onchange = (e) => { this.state.overlayMode = e.target.value; this._render(); };
        overlayPanel.appendChild(document.createTextNode(' Режим: '));
        overlayPanel.appendChild(modeSelect);
        this.container.appendChild(overlayPanel);
        // Прогресс-бар
        if (this.state.loading) {
            const progress = document.createElement('div');
            progress.className = 'ctp-progress';
            progress.innerHTML = `<div style="width:${Math.round(this.state.progress*100)}%"></div>`;
            this.container.appendChild(progress);
        }
        // Ошибки/snackbar
        if (this.state.error) {
            const snackbar = document.createElement('div');
            snackbar.className = 'ctp-snackbar';
            snackbar.textContent = this.state.error;
            this.container.appendChild(snackbar);
        }
        // Canvas с переводом
        if (this.state.showOverlay && (this.state.translated.length || this.state.cache)) {
            let overlayCanvas;
            if (this.state.cache && this.state.cache.overlayImage) {
                overlayCanvas = document.createElement('img');
                overlayCanvas.src = this.state.cache.overlayImage;
                overlayCanvas.style.maxWidth = '100%';
            } else {
                overlayCanvas = OverlayRenderer.renderTranslationOverlay(
                    this.pageImage,
                    this.state.translated.map((b,i)=>({
                        ...b,
                        translatedText: this.state.manualEdit[i] ?? b.translatedText
                    })),
                    this.overlayOptions
                );
            }
            this.container.appendChild(overlayCanvas);
        }
        // Редактирование перевода (если есть bubbles)
        if (this.state.translated.length) {
            const editPanel = document.createElement('div');
            editPanel.className = 'ctp-edit-panel';
            this.state.translated.forEach((bubble, i) => {
                const row = document.createElement('div');
                row.style.marginBottom = '6px';
                row.innerHTML = `<b>Облачко #${i+1}</b> <br> <span style="color:#888">${bubble.text}</span><br>`;
                const input = document.createElement('input');
                input.type = 'text';
                input.value = this.state.manualEdit[i] ?? bubble.translatedText;
                input.style.width = '80%';
                input.onchange = (e) => { this.state.manualEdit[i] = e.target.value; this._render(); };
                row.appendChild(input);
                editPanel.appendChild(row);
            });
            this.container.appendChild(editPanel);
        }
    }

    async _handleTranslate() {
        this.state.loading = true;
        this.state.progress = 0.1;
        this.state.error = '';
        this._render();
        try {
            // 1. OCR
            const bubbles = await this.ocrManager.recognizeBubbles(this.pageImage, { ocr: this.ocrConfig });
            this.state.progress = 0.5;
            this._render();
            // 2. Перевод
            const translated = await this.translationManager.translateBubbles(bubbles);
            this.state.progress = 0.9;
            this.state.bubbles = bubbles;
            this.state.translated = translated;
            this.state.loading = false;
            this.state.showOverlay = true;
            this._render();
        } catch (e) {
            this.state.loading = false;
            this.state.error = 'Ошибка перевода: ' + (e.message || e);
            this._render();
        }
    }

    async _handleSaveCache() {
        // Сохраняем overlay и структуру bubbles
        const overlayCanvas = OverlayRenderer.renderTranslationOverlay(
            this.pageImage,
            this.state.translated.map((b,i)=>({
                ...b,
                translatedText: this.state.manualEdit[i] ?? b.translatedText
            })),
            this.overlayOptions
        );
        const overlayImage = overlayCanvas.toDataURL('image/png');
        const cacheObj = {
            pageId: this.pageId,
            overlayImage,
            bubbles: this.state.translated.map((b,i)=>({
                ...b,
                translatedText: this.state.manualEdit[i] ?? b.translatedText
            }))
        };
        await this.cacheManager.savePage(this.pageId, cacheObj);
        this.state.cache = cacheObj;
        this._render();
    }

    async _handleClearCache() {
        await this.cacheManager.clearPage(this.pageId);
        this.state.cache = null;
        this._render();
    }
}

module.exports = ComicTranslationPanel; 