/**
 * @file EngineSelectionIntegration.js
 * @description Интеграционный модуль для выбора движков OCR и перевода
 * @module ui/EngineSelectionIntegration
 */

const OCREngineSelector = require('../ocr/OCREngineSelector');
const TranslationEngineSelector = require('../translation/TranslationEngineSelector');

/**
 * Класс для интеграции селекторов движков OCR и перевода в пользовательский интерфейс
 */
class EngineSelectionIntegration {
  /**
   * Создает экземпляр интеграции селекторов движков
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация
   * @param {Object} options.storage - Хранилище настроек
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = options.config || {};
    this.storage = options.storage || {
      getItem: (key) => localStorage.getItem(key),
      setItem: (key, value) => localStorage.setItem(key, value),
      removeItem: (key) => localStorage.removeItem(key)
    };
    
    // Создаем экземпляры селекторов
    this.ocrEngineSelector = new OCREngineSelector({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config.ocr || {},
      storage: this.storage
    });
    
    this.translationEngineSelector = new TranslationEngineSelector({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config.translation || {},
      storage: this.storage
    });
    
    // Флаги состояния
    this.isInitialized = false;
    this.isRendered = false;
    
    // DOM элементы
    this.container = null;
    this.tabsContainer = null;
    this.contentContainer = null;
    this.ocrTabButton = null;
    this.translationTabButton = null;
    this.ocrContentContainer = null;
    this.translationContentContainer = null;
    
    // Привязка методов к контексту
    this.handleTabClick = this.handleTabClick.bind(this);
  }
  
  /**
   * Инициализирует интеграцию селекторов движков
   * @returns {EngineSelectionIntegration} Экземпляр интеграции
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('EngineSelectionIntegration: already initialized');
      return this;
    }
    
    this.logger.info('EngineSelectionIntegration: initializing');
    
    // Инициализируем селекторы
    this.ocrEngineSelector.initialize();
    this.translationEngineSelector.initialize();
    
    // Подписываемся на события изменения настроек
    this.eventEmitter.on('ocrEngineSelector:settingsChanged', this.handleOCRSettingsChanged.bind(this));
    this.eventEmitter.on('translationEngineSelector:settingsChanged', this.handleTranslationSettingsChanged.bind(this));
    
    this.isInitialized = true;
    this.eventEmitter.emit('engineSelectionIntegration:initialized');
    
    return this;
  }
  
  /**
   * Обработчик изменения настроек OCR
   * @param {Object} data - Данные о изменении настроек
   * @private
   */
  handleOCRSettingsChanged(data) {
    this.logger.debug('EngineSelectionIntegration: OCR settings changed', data);
    
    // Отправляем событие об изменении настроек OCR
    this.eventEmitter.emit('engineSelectionIntegration:ocrSettingsChanged', data);
  }
  
  /**
   * Обработчик изменения настроек перевода
   * @param {Object} data - Данные о изменении настроек
   * @private
   */
  handleTranslationSettingsChanged(data) {
    this.logger.debug('EngineSelectionIntegration: Translation settings changed', data);
    
    // Отправляем событие об изменении настроек перевода
    this.eventEmitter.emit('engineSelectionIntegration:translationSettingsChanged', data);
  }
  
  /**
   * Рендерит интеграцию селекторов движков в указанный контейнер
   * @param {HTMLElement} container - Контейнер для рендеринга
   * @returns {EngineSelectionIntegration} Экземпляр интеграции
   */
  render(container) {
    if (!this.isInitialized) {
      this.logger.warn('EngineSelectionIntegration: not initialized');
      return this;
    }
    
    if (!container) {
      this.logger.error('EngineSelectionIntegration: container is required');
      return this;
    }
    
    this.container = container;
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    // Создаем основной контейнер
    const integrationContainer = document.createElement('div');
    integrationContainer.className = 'engine-selection-integration';
    
    // Создаем заголовок
    const header = document.createElement('h2');
    header.textContent = 'Настройки OCR и перевода';
    integrationContainer.appendChild(header);
    
    // Создаем контейнер для вкладок
    this.tabsContainer = document.createElement('div');
    this.tabsContainer.className = 'tabs-container';
    
    // Создаем вкладки
    this.ocrTabButton = document.createElement('button');
    this.ocrTabButton.className = 'tab-button active';
    this.ocrTabButton.textContent = 'OCR';
    this.ocrTabButton.dataset.tab = 'ocr';
    this.ocrTabButton.addEventListener('click', this.handleTabClick);
    
    this.translationTabButton = document.createElement('button');
    this.translationTabButton.className = 'tab-button';
    this.translationTabButton.textContent = 'Перевод';
    this.translationTabButton.dataset.tab = 'translation';
    this.translationTabButton.addEventListener('click', this.handleTabClick);
    
    this.tabsContainer.appendChild(this.ocrTabButton);
    this.tabsContainer.appendChild(this.translationTabButton);
    
    integrationContainer.appendChild(this.tabsContainer);
    
    // Создаем контейнер для содержимого вкладок
    this.contentContainer = document.createElement('div');
    this.contentContainer.className = 'content-container';
    
    // Создаем контейнеры для содержимого каждой вкладки
    this.ocrContentContainer = document.createElement('div');
    this.ocrContentContainer.className = 'tab-content active';
    this.ocrContentContainer.dataset.tab = 'ocr';
    
    this.translationContentContainer = document.createElement('div');
    this.translationContentContainer.className = 'tab-content';
    this.translationContentContainer.dataset.tab = 'translation';
    
    this.contentContainer.appendChild(this.ocrContentContainer);
    this.contentContainer.appendChild(this.translationContentContainer);
    
    integrationContainer.appendChild(this.contentContainer);
    
    // Добавляем созданный контейнер в основной контейнер
    this.container.appendChild(integrationContainer);
    
    // Рендерим селекторы в соответствующие контейнеры
    this.ocrEngineSelector.render(this.ocrContentContainer);
    this.translationEngineSelector.render(this.translationContentContainer);
    
    this.isRendered = true;
    
    return this;
  }
  
  /**
   * Обработчик нажатия на вкладку
   * @param {Event} event - Событие нажатия
   * @private
   */
  handleTabClick(event) {
    const tabName = event.target.dataset.tab;
    
    // Деактивируем все вкладки и контейнеры
    const tabButtons = this.tabsContainer.querySelectorAll('.tab-button');
    const tabContents = this.contentContainer.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
      button.classList.remove('active');
    });
    
    tabContents.forEach(content => {
      content.classList.remove('active');
    });
    
    // Активируем выбранную вкладку и контейнер
    event.target.classList.add('active');
    const activeContent = this.contentContainer.querySelector(`.tab-content[data-tab="${tabName}"]`);
    if (activeContent) {
      activeContent.classList.add('active');
    }
    
    this.logger.debug(`EngineSelectionIntegration: tab changed to ${tabName}`);
  }
  
  /**
   * Получает текущие настройки OCR и перевода
   * @returns {Object} Объект с текущими настройками
   */
  getCurrentSettings() {
    return {
      ocr: this.ocrEngineSelector.getCurrentEngine(),
      translation: this.translationEngineSelector.getCurrentEngine()
    };
  }
  
  /**
   * Устанавливает текущий движок OCR
   * @param {string} engineId - ID движка OCR
   * @returns {boolean} true, если движок успешно установлен
   */
  setCurrentOCREngine(engineId) {
    return this.ocrEngineSelector.setCurrentEngine(engineId);
  }
  
  /**
   * Устанавливает текущий движок перевода
   * @param {string} engineId - ID движка перевода
   * @returns {boolean} true, если движок успешно установлен
   */
  setCurrentTranslationEngine(engineId) {
    return this.translationEngineSelector.setCurrentEngine(engineId);
  }
  
  /**
   * Обновляет настройки движка OCR
   * @param {string} engineId - ID движка OCR
   * @param {Object} settings - Новые настройки
   * @returns {boolean} true, если настройки успешно обновлены
   */
  updateOCREngineSettings(engineId, settings) {
    return this.ocrEngineSelector.updateEngineSettings(engineId, settings);
  }
  
  /**
   * Обновляет настройки движка перевода
   * @param {string} engineId - ID движка перевода
   * @param {Object} settings - Новые настройки
   * @returns {boolean} true, если настройки успешно обновлены
   */
  updateTranslationEngineSettings(engineId, settings) {
    return this.translationEngineSelector.updateEngineSettings(engineId, settings);
  }
  
  /**
   * Добавляет новый движок OCR
   * @param {Object} engine - Объект с информацией о движке
   * @returns {boolean} true, если движок успешно добавлен
   */
  addOCREngine(engine) {
    return this.ocrEngineSelector.addEngine(engine);
  }
  
  /**
   * Добавляет новый движок перевода
   * @param {Object} engine - Объект с информацией о движке
   * @returns {boolean} true, если движок успешно добавлен
   */
  addTranslationEngine(engine) {
    return this.translationEngineSelector.addEngine(engine);
  }
  
  /**
   * Удаляет движок OCR
   * @param {string} engineId - ID движка OCR
   * @returns {boolean} true, если движок успешно удален
   */
  removeOCREngine(engineId) {
    return this.ocrEngineSelector.removeEngine(engineId);
  }
  
  /**
   * Удаляет движок перевода
   * @param {string} engineId - ID движка перевода
   * @returns {boolean} true, если движок успешно удален
   */
  removeTranslationEngine(engineId) {
    return this.translationEngineSelector.removeEngine(engineId);
  }
  
  /**
   * Обновляет список доступных движков OCR
   * @param {Array} engines - Массив объектов с информацией о движках
   * @returns {boolean} true, если список успешно обновлен
   */
  updateAvailableOCREngines(engines) {
    return this.ocrEngineSelector.updateAvailableEngines(engines);
  }
  
  /**
   * Обновляет список доступных движков перевода
   * @param {Array} engines - Массив объектов с информацией о движках
   * @returns {boolean} true, если список успешно обновлен
   */
  updateAvailableTranslationEngines(engines) {
    return this.translationEngineSelector.updateAvailableEngines(engines);
  }
  
  /**
   * Уничтожает интеграцию селекторов движков и освобождает ресурсы
   */
  destroy() {
    this.logger.info('EngineSelectionIntegration: destroying');
    
    // Отписываемся от событий
    this.eventEmitter.off('ocrEngineSelector:settingsChanged', this.handleOCRSettingsChanged);
    this.eventEmitter.off('translationEngineSelector:settingsChanged', this.handleTranslationSettingsChanged);
    
    // Удаляем обработчики событий
    if (this.isRendered) {
      if (this.ocrTabButton) {
        this.ocrTabButton.removeEventListener('click', this.handleTabClick);
      }
      
      if (this.translationTabButton) {
        this.translationTabButton.removeEventListener('click', this.handleTabClick);
      }
    }
    
    // Уничтожаем селекторы
    this.ocrEngineSelector.destroy();
    this.translationEngineSelector.destroy();
    
    // Очищаем контейнер
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.isInitialized = false;
    this.isRendered = false;
    
    this.logger.info('EngineSelectionIntegration: destroyed');
  }
}

module.exports = EngineSelectionIntegration;
