/**
 * @file AnimationIntegration.js
 * @description Интеграционный слой для системы анимаций приложения Mr.Comic
 * @module ui/AnimationIntegration
 */

const AnimationManager = require('./AnimationManager');

/**
 * Класс для интеграции системы анимаций с компонентами приложения
 */
class AnimationIntegration {
  /**
   * Создает экземпляр интегратора анимаций
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация анимаций
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = options.config || {};
    
    // Менеджер анимаций
    this.animationManager = null;
    
    // Карта компонентов
    this.components = new Map();
    
    // Карта анимаций компонентов
    this.componentAnimations = new Map();
    
    // Флаги состояния
    this.isInitialized = false;
    
    // Привязка методов к контексту
    this.handleThemeChange = this.handleThemeChange.bind(this);
    this.handleAccessibilityChange = this.handleAccessibilityChange.bind(this);
    this.handleDeviceChange = this.handleDeviceChange.bind(this);
  }
  
  /**
   * Инициализирует интегратор анимаций
   * @returns {AnimationIntegration} Экземпляр интегратора анимаций
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('AnimationIntegration: already initialized');
      return this;
    }
    
    this.logger.info('AnimationIntegration: initializing');
    
    // Создаем менеджер анимаций
    this.animationManager = new AnimationManager({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config
    });
    
    // Инициализируем менеджер анимаций
    this.animationManager.initialize();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Регистрируем предопределенные анимации компонентов
    this.registerComponentAnimations();
    
    this.isInitialized = true;
    this.eventEmitter.emit('animationIntegration:initialized');
    
    return this;
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения темы
    this.eventEmitter.on('theme:changed', this.handleThemeChange);
    
    // Обработчик изменения настроек доступности
    this.eventEmitter.on('accessibility:changed', this.handleAccessibilityChange);
    
    // Обработчик изменения устройства
    this.eventEmitter.on('device:changed', this.handleDeviceChange);
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    this.eventEmitter.off('theme:changed', this.handleThemeChange);
    this.eventEmitter.off('accessibility:changed', this.handleAccessibilityChange);
    this.eventEmitter.off('device:changed', this.handleDeviceChange);
  }
  
  /**
   * Обработчик изменения темы
   * @param {Object} event - Событие изменения темы
   * @private
   */
  handleThemeChange(event) {
    const { theme } = event;
    
    this.logger.info(`AnimationIntegration: theme changed to ${theme}`);
    
    // Обновляем анимации в зависимости от темы
    this.updateAnimationsForTheme(theme);
  }
  
  /**
   * Обработчик изменения настроек доступности
   * @param {Object} event - Событие изменения настроек доступности
   * @private
   */
  handleAccessibilityChange(event) {
    const { reducedMotion, highContrast, largeText } = event;
    
    this.logger.info(`AnimationIntegration: accessibility settings changed (reducedMotion: ${reducedMotion}, highContrast: ${highContrast}, largeText: ${largeText})`);
    
    // Обновляем конфигурацию анимаций в зависимости от настроек доступности
    if (this.animationManager) {
      this.animationManager.updateConfig({
        respectReducedMotion: true,
        reducedMotionDuration: reducedMotion ? 100 : 300
      });
    }
  }
  
  /**
   * Обработчик изменения устройства
   * @param {Object} event - Событие изменения устройства
   * @private
   */
  handleDeviceChange(event) {
    const { type, capabilities } = event;
    
    this.logger.info(`AnimationIntegration: device changed to ${type}`);
    
    // Обновляем анимации в зависимости от устройства
    this.updateAnimationsForDevice(type, capabilities);
  }
  
  /**
   * Обновляет анимации в зависимости от темы
   * @param {string} theme - Название темы
   * @private
   */
  updateAnimationsForTheme(theme) {
    // Обновляем конфигурацию анимаций в зависимости от темы
    switch (theme) {
      case 'dark':
        // Для темной темы можно использовать более плавные анимации
        if (this.animationManager) {
          this.animationManager.updateConfig({
            defaultEasing: 'ease-in-out',
            defaultDuration: 400
          });
        }
        break;
      
      case 'light':
        // Для светлой темы можно использовать более быстрые анимации
        if (this.animationManager) {
          this.animationManager.updateConfig({
            defaultEasing: 'ease-out',
            defaultDuration: 300
          });
        }
        break;
      
      case 'high-contrast':
        // Для высококонтрастной темы можно использовать более простые анимации
        if (this.animationManager) {
          this.animationManager.updateConfig({
            defaultEasing: 'linear',
            defaultDuration: 200
          });
        }
        break;
      
      default:
        // Для других тем используем настройки по умолчанию
        if (this.animationManager) {
          this.animationManager.updateConfig({
            defaultEasing: 'ease',
            defaultDuration: 300
          });
        }
    }
  }
  
  /**
   * Обновляет анимации в зависимости от устройства
   * @param {string} deviceType - Тип устройства
   * @param {Object} capabilities - Возможности устройства
   * @private
   */
  updateAnimationsForDevice(deviceType, capabilities = {}) {
    // Обновляем конфигурацию анимаций в зависимости от устройства
    switch (deviceType) {
      case 'mobile':
        // Для мобильных устройств можно использовать более простые анимации
        if (this.animationManager) {
          this.animationManager.updateConfig({
            useGPU: true,
            throttleRAF: true,
            defaultDuration: 250
          });
        }
        break;
      
      case 'tablet':
        // Для планшетов можно использовать стандартные анимации
        if (this.animationManager) {
          this.animationManager.updateConfig({
            useGPU: true,
            throttleRAF: false,
            defaultDuration: 300
          });
        }
        break;
      
      case 'desktop':
        // Для десктопов можно использовать более сложные анимации
        if (this.animationManager) {
          this.animationManager.updateConfig({
            useGPU: true,
            throttleRAF: false,
            defaultDuration: 300
          });
        }
        break;
      
      case 'e-ink':
        // Для E-Ink устройств нужно минимизировать анимации
        if (this.animationManager) {
          this.animationManager.updateConfig({
            enabled: capabilities.supportsAnimation !== false,
            useGPU: false,
            defaultDuration: 100,
            defaultEasing: 'linear'
          });
        }
        break;
      
      default:
        // Для других устройств используем настройки по умолчанию
        if (this.animationManager) {
          this.animationManager.updateConfig({
            useGPU: true,
            throttleRAF: false,
            defaultDuration: 300
          });
        }
    }
  }
  
  /**
   * Регистрирует предопределенные анимации компонентов
   * @private
   */
  registerComponentAnimations() {
    // Анимации для панели инструментов
    this.registerComponentAnimation('toolbar', 'show', {
      properties: {
        transform: { from: 'translateY(-100%)', to: 'translateY(0)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('toolbar', 'hide', {
      properties: {
        transform: { from: 'translateY(0)', to: 'translateY(-100%)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации для боковой панели
    this.registerComponentAnimation('sidebar', 'show', {
      properties: {
        transform: { from: 'translateX(-100%)', to: 'translateX(0)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('sidebar', 'hide', {
      properties: {
        transform: { from: 'translateX(0)', to: 'translateX(-100%)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации для модальных окон
    this.registerComponentAnimation('modal', 'show', {
      properties: {
        transform: { from: 'scale(0.8)', to: 'scale(1)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('modal', 'hide', {
      properties: {
        transform: { from: 'scale(1)', to: 'scale(0.8)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации для всплывающих подсказок
    this.registerComponentAnimation('tooltip', 'show', {
      properties: {
        transform: { from: 'scale(0.8)', to: 'scale(1)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 200,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('tooltip', 'hide', {
      properties: {
        transform: { from: 'scale(1)', to: 'scale(0.8)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 200,
      easing: 'ease-in'
    });
    
    // Анимации для уведомлений
    this.registerComponentAnimation('notification', 'show', {
      properties: {
        transform: { from: 'translateY(-20px)', to: 'translateY(0)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('notification', 'hide', {
      properties: {
        transform: { from: 'translateY(0)', to: 'translateY(-20px)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации для списков
    this.registerComponentAnimation('list-item', 'add', {
      properties: {
        transform: { from: 'translateX(-20px)', to: 'translateX(0)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('list-item', 'remove', {
      properties: {
        transform: { from: 'translateX(0)', to: 'translateX(20px)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации для карточек
    this.registerComponentAnimation('card', 'expand', {
      properties: {
        height: { from: '0px', to: 'auto' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('card', 'collapse', {
      properties: {
        height: { from: 'auto', to: '0px' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации для вкладок
    this.registerComponentAnimation('tab', 'activate', {
      properties: {
        transform: { from: 'translateY(10px)', to: 'translateY(0)' },
        opacity: { from: 0.5, to: 1 }
      },
      duration: 200,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('tab', 'deactivate', {
      properties: {
        opacity: { from: 1, to: 0.5 }
      },
      duration: 200,
      easing: 'ease-in'
    });
    
    // Анимации для кнопок
    this.registerComponentAnimation('button', 'hover', {
      properties: {
        transform: { from: 'scale(1)', to: 'scale(1.05)' }
      },
      duration: 200,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('button', 'active', {
      properties: {
        transform: { from: 'scale(1.05)', to: 'scale(0.95)' }
      },
      duration: 100,
      easing: 'ease-in'
    });
    
    this.registerComponentAnimation('button', 'release', {
      properties: {
        transform: { from: 'scale(0.95)', to: 'scale(1)' }
      },
      duration: 200,
      easing: 'ease-out'
    });
    
    // Анимации для переходов между страницами
    this.registerComponentAnimation('page', 'enter', {
      properties: {
        transform: { from: 'translateX(100%)', to: 'translateX(0)' },
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('page', 'exit', {
      properties: {
        transform: { from: 'translateX(0)', to: 'translateX(-100%)' },
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
    
    // Анимации для загрузки контента
    this.registerComponentAnimation('content', 'load', {
      properties: {
        opacity: { from: 0, to: 1 }
      },
      duration: 300,
      easing: 'ease-out'
    });
    
    this.registerComponentAnimation('content', 'unload', {
      properties: {
        opacity: { from: 1, to: 0 }
      },
      duration: 300,
      easing: 'ease-in'
    });
  }
  
  /**
   * Регистрирует анимацию компонента
   * @param {string} componentType - Тип компонента
   * @param {string} animationType - Тип анимации
   * @param {Object} options - Параметры анимации
   * @returns {AnimationIntegration} Экземпляр интегратора анимаций
   */
  registerComponentAnimation(componentType, animationType, options) {
    const key = `${componentType}:${animationType}`;
    
    this.componentAnimations.set(key, options);
    
    this.logger.debug(`AnimationIntegration: registered animation "${key}"`);
    
    return this;
  }
  
  /**
   * Получает анимацию компонента
   * @param {string} componentType - Тип компонента
   * @param {string} animationType - Тип анимации
   * @returns {Object|null} Параметры анимации или null, если анимация не найдена
   */
  getComponentAnimation(componentType, animationType) {
    const key = `${componentType}:${animationType}`;
    
    return this.componentAnimations.get(key) || null;
  }
  
  /**
   * Регистрирует компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} component - Компонент
   * @param {string} type - Тип компонента
   * @returns {AnimationIntegration} Экземпляр интегратора анимаций
   */
  registerComponent(id, component, type) {
    this.components.set(id, { component, type });
    
    this.logger.debug(`AnimationIntegration: registered component "${id}" of type "${type}"`);
    
    return this;
  }
  
  /**
   * Удаляет компонент
   * @param {string} id - Идентификатор компонента
   * @returns {boolean} true, если компонент был удален
   */
  unregisterComponent(id) {
    const result = this.components.delete(id);
    
    if (result) {
      this.logger.debug(`AnimationIntegration: unregistered component "${id}"`);
    }
    
    return result;
  }
  
  /**
   * Анимирует компонент
   * @param {string} id - Идентификатор компонента
   * @param {string} animationType - Тип анимации
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string|null} Идентификатор анимации или null, если анимация не удалась
   */
  animateComponent(id, animationType, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return null;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return null;
    }
    
    const componentData = this.components.get(id);
    
    if (!componentData) {
      this.logger.error(`AnimationIntegration: component "${id}" not found`);
      return null;
    }
    
    const { component, type } = componentData;
    
    // Получаем анимацию компонента
    const animation = this.getComponentAnimation(type, animationType);
    
    if (!animation) {
      this.logger.error(`AnimationIntegration: animation "${type}:${animationType}" not found`);
      return null;
    }
    
    // Анимируем компонент
    return this.animationManager.animate(component.element || component, animation, options);
  }
  
  /**
   * Создает переход между компонентами
   * @param {string} fromId - Идентификатор исходного компонента
   * @param {string} toId - Идентификатор целевого компонента
   * @param {string} transitionType - Тип перехода
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string|null} Идентификатор анимации или null, если анимация не удалась
   */
  transition(fromId, toId, transitionType, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return null;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return null;
    }
    
    const fromComponentData = this.components.get(fromId);
    const toComponentData = this.components.get(toId);
    
    if (!fromComponentData) {
      this.logger.error(`AnimationIntegration: component "${fromId}" not found`);
      return null;
    }
    
    if (!toComponentData) {
      this.logger.error(`AnimationIntegration: component "${toId}" not found`);
      return null;
    }
    
    const fromElement = fromComponentData.component.element || fromComponentData.component;
    const toElement = toComponentData.component.element || toComponentData.component;
    
    // Создаем переход
    return this.animationManager.transition(fromElement, toElement, transitionType, options);
  }
  
  /**
   * Создает анимацию отклика на действие пользователя
   * @param {string} id - Идентификатор компонента
   * @param {string} feedbackType - Тип отклика
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string|null} Идентификатор анимации или null, если анимация не удалась
   */
  feedback(id, feedbackType, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return null;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return null;
    }
    
    const componentData = this.components.get(id);
    
    if (!componentData) {
      this.logger.error(`AnimationIntegration: component "${id}" not found`);
      return null;
    }
    
    const element = componentData.component.element || componentData.component;
    
    // Создаем анимацию отклика
    return this.animationManager.feedback(element, feedbackType, options);
  }
  
  /**
   * Создает анимацию эффекта волны (ripple)
   * @param {string} id - Идентификатор компонента
   * @param {number} x - Координата X относительно элемента
   * @param {number} y - Координата Y относительно элемента
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {string|null} Идентификатор анимации или null, если анимация не удалась
   */
  ripple(id, x, y, options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return null;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return null;
    }
    
    const componentData = this.components.get(id);
    
    if (!componentData) {
      this.logger.error(`AnimationIntegration: component "${id}" not found`);
      return null;
    }
    
    const element = componentData.component.element || componentData.component;
    
    // Создаем анимацию эффекта волны
    return this.animationManager.ripple(element, x, y, options);
  }
  
  /**
   * Создает анимацию загрузки
   * @param {string} id - Идентификатор компонента
   * @param {string} [type='spinner'] - Тип анимации загрузки
   * @param {Object} [options={}] - Дополнительные параметры
   * @returns {Object|null} Объект с методами управления анимацией или null, если анимация не удалась
   */
  loading(id, type = 'spinner', options = {}) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return null;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return null;
    }
    
    const componentData = this.components.get(id);
    
    if (!componentData) {
      this.logger.error(`AnimationIntegration: component "${id}" not found`);
      return null;
    }
    
    const element = componentData.component.element || componentData.component;
    
    // Создаем анимацию загрузки
    return this.animationManager.loading(element, type, options);
  }
  
  /**
   * Останавливает анимацию
   * @param {string} animationId - Идентификатор анимации
   * @param {boolean} [jumpToEnd=false] - Флаг перехода к концу анимации
   * @returns {boolean} true, если анимация была остановлена
   */
  stop(animationId, jumpToEnd = false) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return false;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return false;
    }
    
    return this.animationManager.stop(animationId, jumpToEnd);
  }
  
  /**
   * Останавливает все анимации компонента
   * @param {string} id - Идентификатор компонента
   * @param {boolean} [jumpToEnd=false] - Флаг перехода к концу анимации
   * @returns {number} Количество остановленных анимаций
   */
  stopAll(id, jumpToEnd = false) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return 0;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return 0;
    }
    
    const componentData = this.components.get(id);
    
    if (!componentData) {
      this.logger.error(`AnimationIntegration: component "${id}" not found`);
      return 0;
    }
    
    const element = componentData.component.element || componentData.component;
    
    return this.animationManager.stopAll(element, jumpToEnd);
  }
  
  /**
   * Приостанавливает все анимации
   */
  pause() {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return;
    }
    
    this.animationManager.pause();
  }
  
  /**
   * Возобновляет все анимации
   */
  resume() {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return;
    }
    
    this.animationManager.resume();
  }
  
  /**
   * Включает или отключает анимации
   * @param {boolean} enabled - Флаг включения
   * @returns {AnimationIntegration} Экземпляр интегратора анимаций
   */
  setEnabled(enabled) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return this;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return this;
    }
    
    this.animationManager.setEnabled(enabled);
    
    return this;
  }
  
  /**
   * Включает или отключает режим отладки
   * @param {boolean} debug - Флаг включения
   * @returns {AnimationIntegration} Экземпляр интегратора анимаций
   */
  setDebug(debug) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return this;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return this;
    }
    
    this.animationManager.setDebug(debug);
    
    return this;
  }
  
  /**
   * Обновляет конфигурацию интегратора анимаций
   * @param {Object} config - Новая конфигурация
   * @returns {AnimationIntegration} Экземпляр интегратора анимаций
   */
  updateConfig(config) {
    if (!this.isInitialized) {
      this.logger.warn('AnimationIntegration: not initialized');
      return this;
    }
    
    if (!this.animationManager) {
      this.logger.error('AnimationIntegration: animation manager not available');
      return this;
    }
    
    this.config = { ...this.config, ...config };
    
    this.animationManager.updateConfig(this.config);
    
    this.logger.info('AnimationIntegration: config updated');
    this.eventEmitter.emit('animationIntegration:configUpdated', { config: { ...this.config } });
    
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
   * Получает количество зарегистрированных компонентов
   * @returns {number} Количество зарегистрированных компонентов
   */
  getComponentCount() {
    return this.components.size;
  }
  
  /**
   * Получает количество зарегистрированных анимаций компонентов
   * @returns {number} Количество зарегистрированных анимаций компонентов
   */
  getComponentAnimationCount() {
    return this.componentAnimations.size;
  }
  
  /**
   * Получает количество активных анимаций
   * @returns {number} Количество активных анимаций
   */
  getActiveCount() {
    if (!this.isInitialized || !this.animationManager) {
      return 0;
    }
    
    return this.animationManager.getActiveCount();
  }
  
  /**
   * Уничтожает интегратор анимаций и освобождает ресурсы
   */
  destroy() {
    this.logger.info('AnimationIntegration: destroying');
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Уничтожаем менеджер анимаций
    if (this.animationManager) {
      this.animationManager.destroy();
      this.animationManager = null;
    }
    
    // Очищаем карты
    this.components.clear();
    this.componentAnimations.clear();
    
    this.isInitialized = false;
    
    this.eventEmitter.emit('animationIntegration:destroyed');
    
    this.logger.info('AnimationIntegration: destroyed');
  }
}

module.exports = AnimationIntegration;
