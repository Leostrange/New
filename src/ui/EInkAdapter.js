/**
 * @file EInkAdapter.js
 * @description Адаптер для оптимизации интерфейса под E-Ink устройства
 * @module ui/EInkAdapter
 */

/**
 * Класс для адаптации интерфейса под E-Ink устройства
 */
class EInkAdapter {
  /**
   * Создает экземпляр адаптера для E-Ink устройств
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
    
    // Флаги состояния
    this.isInitialized = false;
    this.isEInkDevice = false;
    this.isEInkModeEnabled = false;
    this.refreshMode = 'normal'; // 'normal', 'fast', 'quality'
    
    // Настройки обновления экрана
    this.refreshInterval = this.config.refreshInterval || 1000; // мс
    this.refreshTimer = null;
    this.pendingRefresh = false;
    
    // Зарегистрированные компоненты
    this.components = new Map();
    
    // Привязка методов к контексту
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleRefreshTick = this.handleRefreshTick.bind(this);
  }
  
  /**
   * Инициализирует адаптер для E-Ink устройств
   * @returns {EInkAdapter} Экземпляр адаптера
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('EInkAdapter: already initialized');
      return this;
    }
    
    this.logger.info('EInkAdapter: initializing');
    
    // Определяем, является ли устройство E-Ink
    this.detectEInkDevice();
    
    // Загружаем сохраненные настройки
    this.loadSettings();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Запускаем таймер обновления, если E-Ink режим включен
    if (this.isEInkModeEnabled) {
      this.startRefreshTimer();
    }
    
    // Применяем E-Ink стили, если режим включен
    if (this.isEInkModeEnabled) {
      this.applyEInkStyles();
    }
    
    this.isInitialized = true;
    this.eventEmitter.emit('einkAdapter:initialized', {
      isEInkDevice: this.isEInkDevice,
      isEInkModeEnabled: this.isEInkModeEnabled,
      refreshMode: this.refreshMode
    });
    
    return this;
  }
  
  /**
   * Определяет, является ли устройство E-Ink
   * @private
   */
  detectEInkDevice() {
    // Проверяем, есть ли принудительный режим в конфигурации
    if (this.config.forceEInkMode !== undefined) {
      this.isEInkDevice = Boolean(this.config.forceEInkMode);
      this.logger.debug(`EInkAdapter: forced E-Ink mode: ${this.isEInkDevice}`);
      return;
    }
    
    // Проверяем User Agent на наличие известных E-Ink устройств
    const userAgent = navigator.userAgent.toLowerCase();
    const eInkDevices = [
      'kindle',
      'nook',
      'kobo',
      'pocketbook',
      'tolino',
      'boox',
      'likebook',
      'remarkable',
      'e-ink',
      'eink'
    ];
    
    // Проверяем, содержит ли User Agent упоминание E-Ink устройств
    this.isEInkDevice = eInkDevices.some(device => userAgent.includes(device));
    
    // Проверяем наличие специальных медиа-запросов для E-Ink
    if (!this.isEInkDevice && window.matchMedia) {
      // Проверяем поддержку монохромных экранов
      if (window.matchMedia('(monochrome)').matches) {
        this.isEInkDevice = true;
      }
      
      // Проверяем низкую частоту обновления экрана
      if (window.matchMedia('(update-frequency: slow)').matches) {
        this.isEInkDevice = true;
      }
    }
    
    // Проверяем наличие специальных API для E-Ink устройств
    if (!this.isEInkDevice && window.navigator && window.navigator.epubReadingSystem) {
      this.isEInkDevice = true;
    }
    
    this.logger.debug(`EInkAdapter: detected E-Ink device: ${this.isEInkDevice}`);
  }
  
  /**
   * Загружает сохраненные настройки
   * @private
   */
  loadSettings() {
    try {
      // Загружаем настройку включения E-Ink режима
      const savedEInkMode = this.storage.getItem('eink_mode_enabled');
      if (savedEInkMode !== null) {
        this.isEInkModeEnabled = savedEInkMode === 'true';
      } else {
        // Если настройка не сохранена, используем значение по умолчанию
        this.isEInkModeEnabled = this.isEInkDevice || Boolean(this.config.defaultEInkMode);
      }
      
      // Загружаем настройку режима обновления
      const savedRefreshMode = this.storage.getItem('eink_refresh_mode');
      if (savedRefreshMode !== null && ['normal', 'fast', 'quality'].includes(savedRefreshMode)) {
        this.refreshMode = savedRefreshMode;
      } else {
        // Если настройка не сохранена, используем значение по умолчанию
        this.refreshMode = this.config.defaultRefreshMode || 'normal';
      }
      
      this.logger.debug(`EInkAdapter: loaded settings - mode: ${this.isEInkModeEnabled}, refresh: ${this.refreshMode}`);
    } catch (error) {
      this.logger.error('EInkAdapter: error loading settings', error);
      
      // Используем значения по умолчанию
      this.isEInkModeEnabled = this.isEInkDevice || Boolean(this.config.defaultEInkMode);
      this.refreshMode = this.config.defaultRefreshMode || 'normal';
    }
  }
  
  /**
   * Сохраняет настройки
   * @private
   */
  saveSettings() {
    try {
      this.storage.setItem('eink_mode_enabled', String(this.isEInkModeEnabled));
      this.storage.setItem('eink_refresh_mode', this.refreshMode);
      
      this.logger.debug('EInkAdapter: settings saved');
    } catch (error) {
      this.logger.error('EInkAdapter: error saving settings', error);
    }
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения размера окна
    window.addEventListener('resize', this.handleWindowResize);
    
    // Обработчик изменения ориентации экрана
    if (window.matchMedia) {
      const orientationQuery = window.matchMedia('(orientation: portrait)');
      if (orientationQuery.addEventListener) {
        orientationQuery.addEventListener('change', this.handleWindowResize);
      } else if (orientationQuery.addListener) {
        // Для старых браузеров
        orientationQuery.addListener(this.handleWindowResize);
      }
    }
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    window.removeEventListener('resize', this.handleWindowResize);
    
    if (window.matchMedia) {
      const orientationQuery = window.matchMedia('(orientation: portrait)');
      if (orientationQuery.removeEventListener) {
        orientationQuery.removeEventListener('change', this.handleWindowResize);
      } else if (orientationQuery.removeListener) {
        // Для старых браузеров
        orientationQuery.removeListener(this.handleWindowResize);
      }
    }
  }
  
  /**
   * Обработчик изменения размера окна
   * @private
   */
  handleWindowResize() {
    if (!this.isInitialized || !this.isEInkModeEnabled) {
      return;
    }
    
    // Планируем обновление компонентов
    this.scheduleRefresh();
    
    this.logger.debug('EInkAdapter: window resize detected, refresh scheduled');
  }
  
  /**
   * Запускает таймер обновления
   * @private
   */
  startRefreshTimer() {
    // Останавливаем существующий таймер, если он есть
    this.stopRefreshTimer();
    
    // Определяем интервал обновления в зависимости от режима
    let interval = this.refreshInterval;
    switch (this.refreshMode) {
      case 'fast':
        interval = Math.max(100, interval / 2);
        break;
      case 'quality':
        interval = interval * 2;
        break;
    }
    
    // Запускаем новый таймер
    this.refreshTimer = setInterval(this.handleRefreshTick, interval);
    
    this.logger.debug(`EInkAdapter: refresh timer started with interval ${interval}ms`);
  }
  
  /**
   * Останавливает таймер обновления
   * @private
   */
  stopRefreshTimer() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
      
      this.logger.debug('EInkAdapter: refresh timer stopped');
    }
  }
  
  /**
   * Обработчик тика таймера обновления
   * @private
   */
  handleRefreshTick() {
    if (!this.isInitialized || !this.isEInkModeEnabled) {
      return;
    }
    
    // Если есть отложенное обновление, выполняем его
    if (this.pendingRefresh) {
      this.refreshComponents();
      this.pendingRefresh = false;
      
      this.logger.debug('EInkAdapter: pending refresh executed');
    }
  }
  
  /**
   * Планирует обновление компонентов
   * @private
   */
  scheduleRefresh() {
    this.pendingRefresh = true;
  }
  
  /**
   * Обновляет все зарегистрированные компоненты
   * @private
   */
  refreshComponents() {
    // Отправляем событие начала обновления
    this.eventEmitter.emit('einkAdapter:refreshStart');
    
    // Обновляем каждый компонент
    for (const [id, componentData] of this.components) {
      this.refreshComponent(id, componentData);
    }
    
    // Отправляем событие завершения обновления
    this.eventEmitter.emit('einkAdapter:refreshComplete');
  }
  
  /**
   * Обновляет компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} componentData - Данные компонента
   * @private
   */
  refreshComponent(id, componentData) {
    const { component, type } = componentData;
    
    // Если компонент имеет метод updateEInkDisplay, вызываем его
    if (component.updateEInkDisplay && typeof component.updateEInkDisplay === 'function') {
      component.updateEInkDisplay({
        isEInkMode: this.isEInkModeEnabled,
        refreshMode: this.refreshMode
      });
    }
  }
  
  /**
   * Применяет E-Ink стили к документу
   * @private
   */
  applyEInkStyles() {
    // Удаляем существующие стили, если они есть
    this.removeEInkStyles();
    
    // Создаем элемент стиля
    const styleElement = document.createElement('style');
    styleElement.id = 'eink-adapter-styles';
    
    // Определяем стили в зависимости от режима обновления
    let styles = '';
    
    // Базовые стили для всех режимов
    styles += `
      body {
        background-color: #ffffff !important;
        color: #000000 !important;
      }
      
      a, button, input, select, textarea {
        color: #000000 !important;
      }
      
      img, video, canvas {
        filter: grayscale(100%) !important;
      }
    `;
    
    // Дополнительные стили в зависимости от режима
    switch (this.refreshMode) {
      case 'fast':
        // Минимальные стили для быстрого обновления
        styles += `
          * {
            transition: none !important;
            animation: none !important;
          }
          
          img, video, canvas {
            filter: grayscale(100%) contrast(1.2) !important;
          }
        `;
        break;
        
      case 'normal':
        // Стандартные стили
        styles += `
          * {
            transition-duration: 0.1s !important;
            animation-duration: 0.1s !important;
          }
          
          img, video, canvas {
            filter: grayscale(100%) contrast(1.1) !important;
          }
        `;
        break;
        
      case 'quality':
        // Расширенные стили для качественного отображения
        styles += `
          * {
            transition-duration: 0.3s !important;
          }
          
          img, video, canvas {
            filter: grayscale(100%) contrast(1.05) brightness(1.05) !important;
          }
          
          text, h1, h2, h3, h4, h5, h6, p, span, div {
            text-rendering: optimizeLegibility !important;
          }
        `;
        break;
    }
    
    // Добавляем стили в документ
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    // Добавляем класс к body
    document.body.classList.add('eink-mode');
    
    this.logger.debug(`EInkAdapter: applied E-Ink styles with mode: ${this.refreshMode}`);
  }
  
  /**
   * Удаляет E-Ink стили из документа
   * @private
   */
  removeEInkStyles() {
    // Удаляем элемент стиля
    const styleElement = document.getElementById('eink-adapter-styles');
    if (styleElement) {
      styleElement.remove();
    }
    
    // Удаляем класс из body
    document.body.classList.remove('eink-mode');
    
    this.logger.debug('EInkAdapter: removed E-Ink styles');
  }
  
  /**
   * Регистрирует компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} component - Компонент
   * @param {string} type - Тип компонента
   * @returns {EInkAdapter} Экземпляр адаптера
   */
  registerComponent(id, component, type = 'generic') {
    if (!this.isInitialized) {
      this.logger.warn('EInkAdapter: not initialized');
      return this;
    }
    
    this.components.set(id, { component, type });
    
    // Если E-Ink режим включен, сразу обновляем компонент
    if (this.isEInkModeEnabled) {
      this.refreshComponent(id, { component, type });
    }
    
    this.logger.debug(`EInkAdapter: registered component "${id}" of type "${type}"`);
    
    return this;
  }
  
  /**
   * Включает или выключает E-Ink режим
   * @param {boolean} enable - Флаг включения режима
   * @returns {EInkAdapter} Экземпляр адаптера
   */
  toggleEInkMode(enable) {
    if (!this.isInitialized) {
      this.logger.warn('EInkAdapter: not initialized');
      return this;
    }
    
    const wasEnabled = this.isEInkModeEnabled;
    this.isEInkModeEnabled = enable;
    
    // Если состояние изменилось
    if (wasEnabled !== this.isEInkModeEnabled) {
      if (this.isEInkModeEnabled) {
        // Включаем E-Ink режим
        this.applyEInkStyles();
        this.startRefreshTimer();
        this.refreshComponents();
      } else {
        // Выключаем E-Ink режим
        this.removeEInkStyles();
        this.stopRefreshTimer();
      }
      
      // Сохраняем настройки
      this.saveSettings();
      
      // Отправляем событие
      this.eventEmitter.emit('einkAdapter:modeChanged', {
        isEInkModeEnabled: this.isEInkModeEnabled
      });
      
      this.logger.info(`EInkAdapter: E-Ink mode ${this.isEInkModeEnabled ? 'enabled' : 'disabled'}`);
    }
    
    return this;
  }
  
  /**
   * Устанавливает режим обновления
   * @param {string} mode - Режим обновления ('normal', 'fast', 'quality')
   * @returns {EInkAdapter} Экземпляр адаптера
   */
  setRefreshMode(mode) {
    if (!this.isInitialized) {
      this.logger.warn('EInkAdapter: not initialized');
      return this;
    }
    
    if (!['normal', 'fast', 'quality'].includes(mode)) {
      this.logger.error(`EInkAdapter: invalid refresh mode "${mode}"`);
      return this;
    }
    
    const previousMode = this.refreshMode;
    this.refreshMode = mode;
    
    // Если режим изменился
    if (previousMode !== this.refreshMode) {
      // Перезапускаем таймер обновления с новым интервалом
      if (this.isEInkModeEnabled) {
        this.startRefreshTimer();
      }
      
      // Обновляем стили, если E-Ink режим включен
      if (this.isEInkModeEnabled) {
        this.applyEInkStyles();
      }
      
      // Сохраняем настройки
      this.saveSettings();
      
      // Отправляем событие
      this.eventEmitter.emit('einkAdapter:refreshModeChanged', {
        refreshMode: this.refreshMode
      });
      
      this.logger.info(`EInkAdapter: refresh mode changed to "${this.refreshMode}"`);
    }
    
    return this;
  }
  
  /**
   * Выполняет полное обновление экрана
   * @returns {EInkAdapter} Экземпляр адаптера
   */
  forceFullRefresh() {
    if (!this.isInitialized || !this.isEInkModeEnabled) {
      this.logger.warn('EInkAdapter: not initialized or E-Ink mode disabled');
      return this;
    }
    
    // Отправляем событие начала полного обновления
    this.eventEmitter.emit('einkAdapter:fullRefreshStart');
    
    // Техника для принудительного полного обновления E-Ink экрана
    // Временно инвертируем цвета всего экрана, затем возвращаем обратно
    
    // Создаем временный элемент стиля
    const tempStyle = document.createElement('style');
    tempStyle.textContent = `
      body {
        filter: invert(100%) !important;
      }
    `;
    document.head.appendChild(tempStyle);
    
    // Через небольшую задержку удаляем инверсию
    setTimeout(() => {
      tempStyle.remove();
      
      // Обновляем все компоненты
      this.refreshComponents();
      
      // Отправляем событие завершения полного обновления
      this.eventEmitter.emit('einkAdapter:fullRefreshComplete');
      
      this.logger.info('EInkAdapter: full screen refresh completed');
    }, 100);
    
    return this;
  }
  
  /**
   * Проверяет, является ли устройство E-Ink
   * @returns {boolean} true, если устройство является E-Ink
   */
  isEInkDeviceDetected() {
    return this.isEInkDevice;
  }
  
  /**
   * Проверяет, включен ли E-Ink режим
   * @returns {boolean} true, если E-Ink режим включен
   */
  isEInkModeActive() {
    return this.isEInkModeEnabled;
  }
  
  /**
   * Получает текущий режим обновления
   * @returns {string} Текущий режим обновления ('normal', 'fast', 'quality')
   */
  getCurrentRefreshMode() {
    return this.refreshMode;
  }
  
  /**
   * Обновляет конфигурацию адаптера
   * @param {Object} config - Новая конфигурация
   * @returns {EInkAdapter} Экземпляр адаптера
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    
    // Обновляем интервал обновления, если он изменился
    if (config.refreshInterval !== undefined && this.refreshInterval !== config.refreshInterval) {
      this.refreshInterval = config.refreshInterval;
      
      // Перезапускаем таймер, если он активен
      if (this.isEInkModeEnabled && this.refreshTimer) {
        this.startRefreshTimer();
      }
    }
    
    this.logger.info('EInkAdapter: config updated');
    
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
   * Уничтожает адаптер и освобождает ресурсы
   */
  destroy() {
    this.logger.info('EInkAdapter: destroying');
    
    // Останавливаем таймер обновления
    this.stopRefreshTimer();
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Удаляем E-Ink стили
    if (this.isEInkModeEnabled) {
      this.removeEInkStyles();
    }
    
    // Очищаем карту компонентов
    this.components.clear();
    
    this.isInitialized = false;
    
    this.logger.info('EInkAdapter: destroyed');
  }
}

module.exports = EInkAdapter;
