/**
 * @file EInkIntegration.js
 * @description Интеграционный слой для адаптации интерфейса под E-Ink устройства
 * @module ui/EInkIntegration
 */

const EInkAdapter = require('./EInkAdapter');

/**
 * Класс для интеграции адаптации под E-Ink устройства с компонентами UI
 */
class EInkIntegration {
  /**
   * Создает экземпляр интегратора адаптации под E-Ink устройства
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
    
    // Адаптер для E-Ink устройств
    this.einkAdapter = null;
    
    // Флаги состояния
    this.isInitialized = false;
    
    // Зарегистрированные компоненты
    this.components = new Map();
    
    // Привязка методов к контексту
    this.handleModeChanged = this.handleModeChanged.bind(this);
    this.handleRefreshModeChanged = this.handleRefreshModeChanged.bind(this);
    this.handleFullRefreshComplete = this.handleFullRefreshComplete.bind(this);
  }
  
  /**
   * Инициализирует интегратор адаптации под E-Ink устройства
   * @returns {EInkIntegration} Экземпляр интегратора
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('EInkIntegration: already initialized');
      return this;
    }
    
    this.logger.info('EInkIntegration: initializing');
    
    // Создаем адаптер для E-Ink устройств
    this.einkAdapter = new EInkAdapter({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config.einkAdapter || {}
    });
    
    // Инициализируем адаптер
    this.einkAdapter.initialize();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Создаем элементы управления, если это указано в конфигурации
    if (this.config.createControls) {
      this.createControls();
    }
    
    this.isInitialized = true;
    this.eventEmitter.emit('einkIntegration:initialized');
    
    return this;
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения режима E-Ink
    this.eventEmitter.on('einkAdapter:modeChanged', this.handleModeChanged);
    
    // Обработчик изменения режима обновления
    this.eventEmitter.on('einkAdapter:refreshModeChanged', this.handleRefreshModeChanged);
    
    // Обработчик завершения полного обновления
    this.eventEmitter.on('einkAdapter:fullRefreshComplete', this.handleFullRefreshComplete);
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    this.eventEmitter.off('einkAdapter:modeChanged', this.handleModeChanged);
    this.eventEmitter.off('einkAdapter:refreshModeChanged', this.handleRefreshModeChanged);
    this.eventEmitter.off('einkAdapter:fullRefreshComplete', this.handleFullRefreshComplete);
  }
  
  /**
   * Обработчик изменения режима E-Ink
   * @param {Object} data - Данные события
   * @private
   */
  handleModeChanged(data) {
    this.logger.debug(`EInkIntegration: E-Ink mode changed to ${data.isEInkModeEnabled ? 'enabled' : 'disabled'}`);
    
    // Обновляем все зарегистрированные компоненты
    this.updateAllComponents();
    
    // Отправляем событие
    this.eventEmitter.emit('einkIntegration:modeChanged', data);
  }
  
  /**
   * Обработчик изменения режима обновления
   * @param {Object} data - Данные события
   * @private
   */
  handleRefreshModeChanged(data) {
    this.logger.debug(`EInkIntegration: refresh mode changed to ${data.refreshMode}`);
    
    // Обновляем все зарегистрированные компоненты
    this.updateAllComponents();
    
    // Отправляем событие
    this.eventEmitter.emit('einkIntegration:refreshModeChanged', data);
  }
  
  /**
   * Обработчик завершения полного обновления
   * @private
   */
  handleFullRefreshComplete() {
    this.logger.debug('EInkIntegration: full refresh completed');
    
    // Отправляем событие
    this.eventEmitter.emit('einkIntegration:fullRefreshComplete');
  }
  
  /**
   * Создает элементы управления
   * @private
   */
  createControls() {
    // Создаем контейнер для элементов управления
    let controlsContainer = document.getElementById('eink-integration-controls');
    
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.id = 'eink-integration-controls';
      document.body.appendChild(controlsContainer);
      
      // Добавляем стили для контейнера
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        #eink-integration-controls {
          position: fixed;
          bottom: 20px;
          right: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .eink-control {
          background-color: var(--color-backgroundAlt, #f5f5f5);
          border: 1px solid var(--color-border, #dddddd);
          border-radius: 5px;
          padding: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .eink-control-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .eink-control-title {
          font-weight: bold;
          margin: 0;
        }
        
        .eink-control-toggle {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2em;
        }
        
        .eink-control-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .eink-control-option {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .eink-control-option label {
          flex-grow: 1;
        }
        
        .eink-control-actions {
          display: flex;
          justify-content: flex-end;
          margin-top: 10px;
        }
        
        .eink-control-button {
          padding: 5px 10px;
          background-color: var(--color-primary, #3498db);
          color: white;
          border: none;
          border-radius: 3px;
          cursor: pointer;
        }
        
        .eink-control-button:hover {
          background-color: var(--color-primaryDark, #2980b9);
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Создаем элемент управления для E-Ink режима
    const einkControl = document.createElement('div');
    einkControl.className = 'eink-control';
    einkControl.innerHTML = `
      <div class="eink-control-header">
        <h4 class="eink-control-title">Режим E-Ink</h4>
        <button class="eink-control-toggle" id="eink-control-toggle">−</button>
      </div>
      <div class="eink-control-content" id="eink-control-content">
        <div class="eink-control-option">
          <input type="checkbox" id="eink-mode-toggle" ${this.einkAdapter.isEInkModeActive() ? 'checked' : ''}>
          <label for="eink-mode-toggle">Включить режим E-Ink</label>
        </div>
        
        <div class="eink-control-option">
          <label for="eink-refresh-mode">Режим обновления:</label>
          <select id="eink-refresh-mode">
            <option value="normal" ${this.einkAdapter.getCurrentRefreshMode() === 'normal' ? 'selected' : ''}>Нормальный</option>
            <option value="fast" ${this.einkAdapter.getCurrentRefreshMode() === 'fast' ? 'selected' : ''}>Быстрый</option>
            <option value="quality" ${this.einkAdapter.getCurrentRefreshMode() === 'quality' ? 'selected' : ''}>Качественный</option>
          </select>
        </div>
        
        <div class="eink-control-actions">
          <button id="eink-full-refresh-btn" class="eink-control-button">Полное обновление</button>
        </div>
      </div>
    `;
    controlsContainer.appendChild(einkControl);
    
    // Добавляем обработчики событий для элементов управления
    
    // Переключение видимости содержимого элемента управления
    document.getElementById('eink-control-toggle').addEventListener('click', function() {
      const content = document.getElementById('eink-control-content');
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'flex';
      this.textContent = isVisible ? '+' : '−';
    });
    
    // Обработчик переключения режима E-Ink
    document.getElementById('eink-mode-toggle').addEventListener('change', () => {
      const isChecked = document.getElementById('eink-mode-toggle').checked;
      this.einkAdapter.toggleEInkMode(isChecked);
    });
    
    // Обработчик изменения режима обновления
    document.getElementById('eink-refresh-mode').addEventListener('change', () => {
      const selectedMode = document.getElementById('eink-refresh-mode').value;
      this.einkAdapter.setRefreshMode(selectedMode);
    });
    
    // Обработчик кнопки полного обновления
    document.getElementById('eink-full-refresh-btn').addEventListener('click', () => {
      this.einkAdapter.forceFullRefresh();
    });
  }
  
  /**
   * Регистрирует компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} component - Компонент
   * @param {string} type - Тип компонента
   * @returns {EInkIntegration} Экземпляр интегратора
   */
  registerComponent(id, component, type = 'generic') {
    if (!this.isInitialized) {
      this.logger.warn('EInkIntegration: not initialized');
      return this;
    }
    
    this.components.set(id, { component, type });
    
    // Регистрируем компонент в адаптере для E-Ink устройств
    this.einkAdapter.registerComponent(id, component, type);
    
    this.logger.debug(`EInkIntegration: registered component "${id}" of type "${type}"`);
    
    return this;
  }
  
  /**
   * Обновляет все зарегистрированные компоненты
   * @private
   */
  updateAllComponents() {
    for (const [id, componentData] of this.components) {
      this.updateComponent(id, componentData);
    }
  }
  
  /**
   * Обновляет компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} componentData - Данные компонента
   * @private
   */
  updateComponent(id, componentData) {
    const { component, type } = componentData;
    
    // Если компонент имеет метод updateEInkDisplay, вызываем его
    if (component.updateEInkDisplay && typeof component.updateEInkDisplay === 'function') {
      component.updateEInkDisplay({
        isEInkMode: this.einkAdapter.isEInkModeActive(),
        refreshMode: this.einkAdapter.getCurrentRefreshMode()
      });
    }
  }
  
  /**
   * Получает адаптер для E-Ink устройств
   * @returns {EInkAdapter} Адаптер для E-Ink устройств
   */
  getEInkAdapter() {
    return this.einkAdapter;
  }
  
  /**
   * Проверяет, является ли устройство E-Ink
   * @returns {boolean} true, если устройство является E-Ink
   */
  isEInkDevice() {
    return this.einkAdapter.isEInkDeviceDetected();
  }
  
  /**
   * Проверяет, включен ли E-Ink режим
   * @returns {boolean} true, если E-Ink режим включен
   */
  isEInkModeEnabled() {
    return this.einkAdapter.isEInkModeActive();
  }
  
  /**
   * Получает текущий режим обновления
   * @returns {string} Текущий режим обновления ('normal', 'fast', 'quality')
   */
  getRefreshMode() {
    return this.einkAdapter.getCurrentRefreshMode();
  }
  
  /**
   * Включает или выключает E-Ink режим
   * @param {boolean} enable - Флаг включения режима
   * @returns {EInkIntegration} Экземпляр интегратора
   */
  toggleEInkMode(enable) {
    if (!this.isInitialized) {
      this.logger.warn('EInkIntegration: not initialized');
      return this;
    }
    
    this.einkAdapter.toggleEInkMode(enable);
    
    return this;
  }
  
  /**
   * Устанавливает режим обновления
   * @param {string} mode - Режим обновления ('normal', 'fast', 'quality')
   * @returns {EInkIntegration} Экземпляр интегратора
   */
  setRefreshMode(mode) {
    if (!this.isInitialized) {
      this.logger.warn('EInkIntegration: not initialized');
      return this;
    }
    
    this.einkAdapter.setRefreshMode(mode);
    
    return this;
  }
  
  /**
   * Выполняет полное обновление экрана
   * @returns {EInkIntegration} Экземпляр интегратора
   */
  forceFullRefresh() {
    if (!this.isInitialized) {
      this.logger.warn('EInkIntegration: not initialized');
      return this;
    }
    
    this.einkAdapter.forceFullRefresh();
    
    return this;
  }
  
  /**
   * Обновляет конфигурацию интегратора
   * @param {Object} config - Новая конфигурация
   * @returns {EInkIntegration} Экземпляр интегратора
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    
    // Обновляем конфигурацию адаптера для E-Ink устройств
    if (this.einkAdapter) {
      this.einkAdapter.updateConfig(this.config.einkAdapter || {});
    }
    
    this.logger.info('EInkIntegration: config updated');
    this.eventEmitter.emit('einkIntegration:configUpdated', { config: { ...this.config } });
    
    return this;
  }
  
  /**
   * Получает текущую конфигурацию
   * @returns {Object} Текущая конфигурация
   */
  getConfig() {
    return { ...this.config };
  }
  
  /**
   * Уничтожает интегратор и освобождает ресурсы
   */
  destroy() {
    this.logger.info('EInkIntegration: destroying');
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Уничтожаем адаптер для E-Ink устройств
    if (this.einkAdapter) {
      this.einkAdapter.destroy();
      this.einkAdapter = null;
    }
    
    // Удаляем элементы управления
    const controlsContainer = document.getElementById('eink-integration-controls');
    if (controlsContainer) {
      controlsContainer.remove();
    }
    
    // Очищаем карту компонентов
    this.components.clear();
    
    this.isInitialized = false;
    
    this.eventEmitter.emit('einkIntegration:destroyed');
    
    this.logger.info('EInkIntegration: destroyed');
  }
}

module.exports = EInkIntegration;
