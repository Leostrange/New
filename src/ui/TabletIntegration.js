/**
 * @file TabletIntegration.js
 * @description Интеграционный слой для адаптации интерфейса под планшетные устройства
 * @module ui/TabletIntegration
 */

const TabletAdapter = require('./TabletAdapter');

/**
 * Класс для интеграции адаптации под планшеты с компонентами UI
 */
class TabletIntegration {
  /**
   * Создает экземпляр интегратора адаптации под планшеты
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
    
    // Адаптер для планшетов
    this.tabletAdapter = null;
    
    // Флаги состояния
    this.isInitialized = false;
    
    // Зарегистрированные компоненты
    this.components = new Map();
    
    // Привязка методов к контексту
    this.handleDeviceTypeChanged = this.handleDeviceTypeChanged.bind(this);
    this.handleOrientationChanged = this.handleOrientationChanged.bind(this);
  }
  
  /**
   * Инициализирует интегратор адаптации под планшеты
   * @returns {TabletIntegration} Экземпляр интегратора
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('TabletIntegration: already initialized');
      return this;
    }
    
    this.logger.info('TabletIntegration: initializing');
    
    // Создаем адаптер для планшетов
    this.tabletAdapter = new TabletAdapter({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config.tabletAdapter || {}
    });
    
    // Инициализируем адаптер
    this.tabletAdapter.initialize();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Создаем элементы управления, если это указано в конфигурации
    if (this.config.createControls) {
      this.createControls();
    }
    
    this.isInitialized = true;
    this.eventEmitter.emit('tabletIntegration:initialized');
    
    return this;
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения типа устройства
    this.eventEmitter.on('tabletAdapter:deviceTypeChanged', this.handleDeviceTypeChanged);
    
    // Обработчик изменения ориентации экрана
    this.eventEmitter.on('tabletAdapter:orientationChanged', this.handleOrientationChanged);
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    this.eventEmitter.off('tabletAdapter:deviceTypeChanged', this.handleDeviceTypeChanged);
    this.eventEmitter.off('tabletAdapter:orientationChanged', this.handleOrientationChanged);
  }
  
  /**
   * Обработчик изменения типа устройства
   * @param {Object} data - Данные события
   * @private
   */
  handleDeviceTypeChanged(data) {
    this.logger.debug(`TabletIntegration: device type changed to ${data.isTablet ? (data.isLargeTablet ? 'large tablet' : 'tablet') : 'non-tablet'}`);
    
    // Обновляем все зарегистрированные компоненты
    this.updateAllComponents();
    
    // Отправляем событие
    this.eventEmitter.emit('tabletIntegration:deviceTypeChanged', data);
  }
  
  /**
   * Обработчик изменения ориентации экрана
   * @param {Object} data - Данные события
   * @private
   */
  handleOrientationChanged(data) {
    this.logger.debug(`TabletIntegration: orientation changed to ${data.orientation}`);
    
    // Обновляем все зарегистрированные компоненты
    this.updateAllComponents();
    
    // Отправляем событие
    this.eventEmitter.emit('tabletIntegration:orientationChanged', data);
  }
  
  /**
   * Создает элементы управления
   * @private
   */
  createControls() {
    // Создаем контейнер для элементов управления
    let controlsContainer = document.getElementById('tablet-integration-controls');
    
    if (!controlsContainer) {
      controlsContainer = document.createElement('div');
      controlsContainer.id = 'tablet-integration-controls';
      document.body.appendChild(controlsContainer);
      
      // Добавляем стили для контейнера
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        #tablet-integration-controls {
          position: fixed;
          bottom: 20px;
          left: 20px;
          z-index: 1000;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        
        .tablet-control {
          background-color: var(--color-backgroundAlt, #f5f5f5);
          border: 1px solid var(--color-border, #dddddd);
          border-radius: 5px;
          padding: 10px;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
        }
        
        .tablet-control-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
        }
        
        .tablet-control-title {
          font-weight: bold;
          margin: 0;
        }
        
        .tablet-control-toggle {
          background: none;
          border: none;
          cursor: pointer;
          font-size: 1.2em;
        }
        
        .tablet-control-content {
          display: flex;
          flex-direction: column;
          gap: 5px;
        }
        
        .tablet-control-option {
          display: flex;
          align-items: center;
          gap: 5px;
        }
        
        .tablet-control-option label {
          flex-grow: 1;
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    // Создаем элемент управления для эмуляции устройства
    const deviceControl = document.createElement('div');
    deviceControl.className = 'tablet-control';
    deviceControl.innerHTML = `
      <div class="tablet-control-header">
        <h4 class="tablet-control-title">Эмуляция устройства</h4>
        <button class="tablet-control-toggle" id="device-control-toggle">−</button>
      </div>
      <div class="tablet-control-content" id="device-control-content">
        <div class="tablet-control-option">
          <input type="radio" id="device-desktop" name="device-type" value="desktop">
          <label for="device-desktop">Десктоп</label>
        </div>
        <div class="tablet-control-option">
          <input type="radio" id="device-tablet" name="device-type" value="tablet">
          <label for="device-tablet">Планшет</label>
        </div>
        <div class="tablet-control-option">
          <input type="radio" id="device-large-tablet" name="device-type" value="large-tablet">
          <label for="device-large-tablet">Большой планшет</label>
        </div>
        <div class="tablet-control-option">
          <input type="radio" id="device-mobile" name="device-type" value="mobile">
          <label for="device-mobile">Мобильный</label>
        </div>
      </div>
    `;
    controlsContainer.appendChild(deviceControl);
    
    // Создаем элемент управления для эмуляции ориентации
    const orientationControl = document.createElement('div');
    orientationControl.className = 'tablet-control';
    orientationControl.innerHTML = `
      <div class="tablet-control-header">
        <h4 class="tablet-control-title">Эмуляция ориентации</h4>
        <button class="tablet-control-toggle" id="orientation-control-toggle">−</button>
      </div>
      <div class="tablet-control-content" id="orientation-control-content">
        <div class="tablet-control-option">
          <input type="radio" id="orientation-auto" name="orientation-type" value="auto" checked>
          <label for="orientation-auto">Автоматически</label>
        </div>
        <div class="tablet-control-option">
          <input type="radio" id="orientation-portrait" name="orientation-type" value="portrait">
          <label for="orientation-portrait">Портретная</label>
        </div>
        <div class="tablet-control-option">
          <input type="radio" id="orientation-landscape" name="orientation-type" value="landscape">
          <label for="orientation-landscape">Альбомная</label>
        </div>
      </div>
    `;
    controlsContainer.appendChild(orientationControl);
    
    // Добавляем обработчики событий для элементов управления
    
    // Переключение видимости содержимого элементов управления
    document.getElementById('device-control-toggle').addEventListener('click', function() {
      const content = document.getElementById('device-control-content');
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'flex';
      this.textContent = isVisible ? '+' : '−';
    });
    
    document.getElementById('orientation-control-toggle').addEventListener('click', function() {
      const content = document.getElementById('orientation-control-content');
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'flex';
      this.textContent = isVisible ? '+' : '−';
    });
    
    // Обработчики изменения типа устройства
    document.getElementById('device-desktop').addEventListener('change', () => {
      if (document.getElementById('device-desktop').checked) {
        this.emulateDeviceType('desktop');
      }
    });
    
    document.getElementById('device-tablet').addEventListener('change', () => {
      if (document.getElementById('device-tablet').checked) {
        this.emulateDeviceType('tablet');
      }
    });
    
    document.getElementById('device-large-tablet').addEventListener('change', () => {
      if (document.getElementById('device-large-tablet').checked) {
        this.emulateDeviceType('large-tablet');
      }
    });
    
    document.getElementById('device-mobile').addEventListener('change', () => {
      if (document.getElementById('device-mobile').checked) {
        this.emulateDeviceType('mobile');
      }
    });
    
    // Обработчики изменения ориентации
    document.getElementById('orientation-auto').addEventListener('change', () => {
      if (document.getElementById('orientation-auto').checked) {
        this.emulateOrientation('auto');
      }
    });
    
    document.getElementById('orientation-portrait').addEventListener('change', () => {
      if (document.getElementById('orientation-portrait').checked) {
        this.emulateOrientation('portrait');
      }
    });
    
    document.getElementById('orientation-landscape').addEventListener('change', () => {
      if (document.getElementById('orientation-landscape').checked) {
        this.emulateOrientation('landscape');
      }
    });
  }
  
  /**
   * Эмулирует тип устройства
   * @param {string} deviceType - Тип устройства ('desktop', 'tablet', 'large-tablet', 'mobile')
   */
  emulateDeviceType(deviceType) {
    // Здесь должна быть реализация эмуляции типа устройства
    // Это может быть реализовано через изменение размера окна или через специальные флаги
    
    this.logger.info(`TabletIntegration: emulating device type "${deviceType}"`);
    
    // Отправляем событие
    this.eventEmitter.emit('tabletIntegration:deviceTypeEmulated', { deviceType });
  }
  
  /**
   * Эмулирует ориентацию экрана
   * @param {string} orientation - Ориентация экрана ('auto', 'portrait', 'landscape')
   */
  emulateOrientation(orientation) {
    // Здесь должна быть реализация эмуляции ориентации экрана
    // Это может быть реализовано через изменение размера окна или через специальные флаги
    
    this.logger.info(`TabletIntegration: emulating orientation "${orientation}"`);
    
    // Отправляем событие
    this.eventEmitter.emit('tabletIntegration:orientationEmulated', { orientation });
  }
  
  /**
   * Регистрирует компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} component - Компонент
   * @param {string} type - Тип компонента
   * @returns {TabletIntegration} Экземпляр интегратора
   */
  registerComponent(id, component, type = 'generic') {
    if (!this.isInitialized) {
      this.logger.warn('TabletIntegration: not initialized');
      return this;
    }
    
    this.components.set(id, { component, type });
    
    // Регистрируем компонент в адаптере для планшетов
    this.tabletAdapter.registerComponent(id, component, type);
    
    this.logger.debug(`TabletIntegration: registered component "${id}" of type "${type}"`);
    
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
    
    // Если компонент имеет метод updateTabletLayout, вызываем его
    if (component.updateTabletLayout && typeof component.updateTabletLayout === 'function') {
      component.updateTabletLayout({
        isTablet: this.tabletAdapter.isTabletDevice(),
        isLargeTablet: this.tabletAdapter.isLargeTabletDevice(),
        orientation: this.tabletAdapter.getOrientation(),
        layout: this.tabletAdapter.getCurrentLayout()
      });
    }
  }
  
  /**
   * Получает адаптер для планшетов
   * @returns {TabletAdapter} Адаптер для планшетов
   */
  getTabletAdapter() {
    return this.tabletAdapter;
  }
  
  /**
   * Проверяет, является ли устройство планшетом
   * @returns {boolean} true, если устройство является планшетом
   */
  isTabletDevice() {
    return this.tabletAdapter.isTabletDevice();
  }
  
  /**
   * Проверяет, является ли устройство большим планшетом
   * @returns {boolean} true, если устройство является большим планшетом
   */
  isLargeTabletDevice() {
    return this.tabletAdapter.isLargeTabletDevice();
  }
  
  /**
   * Получает текущую ориентацию экрана
   * @returns {string} Текущая ориентация экрана ('portrait' или 'landscape')
   */
  getOrientation() {
    return this.tabletAdapter.getOrientation();
  }
  
  /**
   * Получает текущий макет
   * @returns {string} Название текущего макета
   */
  getCurrentLayout() {
    return this.tabletAdapter.getCurrentLayout();
  }
  
  /**
   * Показывает или скрывает плавающую кнопку действия
   * @param {boolean} show - Флаг отображения
   * @param {Object} options - Параметры кнопки
   * @returns {Element|null} Элемент кнопки или null, если кнопка не поддерживается
   */
  toggleFloatingActionButton(show, options = {}) {
    return this.tabletAdapter.toggleFloatingActionButton(show, options);
  }
  
  /**
   * Обновляет конфигурацию интегратора
   * @param {Object} config - Новая конфигурация
   * @returns {TabletIntegration} Экземпляр интегратора
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    
    // Обновляем конфигурацию адаптера для планшетов
    if (this.tabletAdapter) {
      this.tabletAdapter.updateConfig(this.config.tabletAdapter || {});
    }
    
    this.logger.info('TabletIntegration: config updated');
    this.eventEmitter.emit('tabletIntegration:configUpdated', { config: { ...this.config } });
    
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
    this.logger.info('TabletIntegration: destroying');
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Уничтожаем адаптер для планшетов
    if (this.tabletAdapter) {
      this.tabletAdapter.destroy();
      this.tabletAdapter = null;
    }
    
    // Удаляем элементы управления
    const controlsContainer = document.getElementById('tablet-integration-controls');
    if (controlsContainer) {
      controlsContainer.remove();
    }
    
    // Очищаем карту компонентов
    this.components.clear();
    
    this.isInitialized = false;
    
    this.eventEmitter.emit('tabletIntegration:destroyed');
    
    this.logger.info('TabletIntegration: destroyed');
  }
}

module.exports = TabletIntegration;
