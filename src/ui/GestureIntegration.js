/**
 * @file GestureIntegration.js
 * @description Интеграция системы жестов с компонентами пользовательского интерфейса
 * @module ui/GestureIntegration
 */

const GestureManager = require('./GestureManager');

/**
 * Класс для интеграции системы жестов с компонентами UI
 */
class GestureIntegration {
  /**
   * Создает экземпляр интегратора жестов
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация приложения
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter;
    this.logger = options.logger || console;
    this.config = options.config || {};
    
    this.gestureManagers = new Map(); // Карта менеджеров жестов для разных компонентов
    this.defaultGestureOptions = {
      enabled: true,
      preventDefaultEvents: true,
      passiveEvents: false,
      visualFeedback: this.config.debug || false
    };
    
    this.isInitialized = false;
    this.componentGestureHandlers = new Map(); // Карта обработчиков жестов для компонентов
  }
  
  /**
   * Инициализирует интегратор жестов
   * @returns {GestureIntegration} Экземпляр интегратора
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('GestureIntegration: already initialized');
      return this;
    }
    
    this.logger.info('GestureIntegration: initializing');
    
    // Регистрируем обработчики событий
    this.registerEventListeners();
    
    // Создаем глобальные CSS-переменные для жестов
    this.createGlobalGestureVariables();
    
    this.isInitialized = true;
    this.eventEmitter.emit('gestureIntegration:initialized');
    
    return this;
  }
  
  /**
   * Регистрирует обработчики событий
   * @private
   */
  registerEventListeners() {
    // Обработчик события изменения настроек жестов
    this.eventEmitter.on('settings:gestures:changed', (settings) => {
      this.updateGestureSettings(settings);
    });
    
    // Обработчик события изменения устройства ввода
    this.eventEmitter.on('input:device:changed', (deviceInfo) => {
      this.adaptGesturesToDevice(deviceInfo);
    });
    
    // Обработчик события изменения доступности
    this.eventEmitter.on('accessibility:changed', (accessibilityInfo) => {
      this.adaptGesturesToAccessibility(accessibilityInfo);
    });
  }
  
  /**
   * Создает глобальные CSS-переменные для жестов
   * @private
   */
  createGlobalGestureVariables() {
    // Создаем стилевой элемент для глобальных переменных
    const styleElement = document.createElement('style');
    styleElement.textContent = `
      :root {
        --gesture-feedback-color: rgba(0, 120, 255, 0.5);
        --gesture-feedback-size: 48px;
        --gesture-feedback-opacity: 0.7;
        --gesture-animation-duration: 300ms;
      }
      
      /* Адаптация под различные устройства */
      @media (max-width: 768px) {
        :root {
          --gesture-feedback-size: 64px;
        }
      }
      
      /* Поддержка предпочтений пользователя по анимации */
      @media (prefers-reduced-motion: reduce) {
        :root {
          --gesture-animation-duration: 0ms;
        }
      }
      
      /* Стили для визуальной обратной связи */
      .gesture-feedback {
        position: absolute;
        pointer-events: none;
        z-index: 9999;
        width: var(--gesture-feedback-size);
        height: var(--gesture-feedback-size);
        border-radius: 50%;
        background-color: var(--gesture-feedback-color);
        opacity: var(--gesture-feedback-opacity);
        transform: translate(-50%, -50%) scale(0);
        transition: transform var(--gesture-animation-duration) ease-out, opacity var(--gesture-animation-duration) ease-out;
      }
      
      .gesture-feedback.active {
        transform: translate(-50%, -50%) scale(1);
      }
      
      .gesture-feedback.fade-out {
        opacity: 0;
      }
    `;
    document.head.appendChild(styleElement);
  }
  
  /**
   * Создает менеджер жестов для компонента
   * @param {string} componentId - Идентификатор компонента
   * @param {HTMLElement} rootElement - Корневой элемент компонента
   * @param {Object} options - Дополнительные параметры жестов
   * @returns {GestureManager} Созданный менеджер жестов
   */
  createGestureManager(componentId, rootElement, options = {}) {
    if (this.gestureManagers.has(componentId)) {
      this.logger.warn(`GestureIntegration: gesture manager for component "${componentId}" already exists`);
      return this.gestureManagers.get(componentId);
    }
    
    const gestureOptions = {
      ...this.defaultGestureOptions,
      ...options,
      rootElement,
      eventEmitter: this.eventEmitter,
      logger: this.logger
    };
    
    const gestureManager = new GestureManager(gestureOptions);
    gestureManager.initialize();
    this.gestureManagers.set(componentId, gestureManager);
    
    this.logger.info(`GestureIntegration: created gesture manager for component "${componentId}"`);
    this.eventEmitter.emit('gestureIntegration:managerCreated', { componentId, gestureManager });
    
    return gestureManager;
  }
  
  /**
   * Получает менеджер жестов для компонента
   * @param {string} componentId - Идентификатор компонента
   * @returns {GestureManager|null} Менеджер жестов или null, если не найден
   */
  getGestureManager(componentId) {
    return this.gestureManagers.get(componentId) || null;
  }
  
  /**
   * Удаляет менеджер жестов для компонента
   * @param {string} componentId - Идентификатор компонента
   * @returns {boolean} true, если менеджер был удален
   */
  removeGestureManager(componentId) {
    if (!this.gestureManagers.has(componentId)) {
      return false;
    }
    
    const gestureManager = this.gestureManagers.get(componentId);
    gestureManager.destroy();
    this.gestureManagers.delete(componentId);
    
    this.logger.info(`GestureIntegration: removed gesture manager for component "${componentId}"`);
    this.eventEmitter.emit('gestureIntegration:managerRemoved', { componentId });
    
    return true;
  }
  
  /**
   * Регистрирует обработчик жеста для компонента
   * @param {string} componentId - Идентификатор компонента
   * @param {string} gestureType - Тип жеста
   * @param {Function} handler - Функция-обработчик
   * @returns {GestureIntegration} Экземпляр интегратора жестов
   */
  registerComponentGestureHandler(componentId, gestureType, handler) {
    if (typeof handler !== 'function') {
      this.logger.error(`GestureIntegration: handler for "${gestureType}" must be a function`);
      return this;
    }
    
    // Создаем карту обработчиков для компонента, если она не существует
    if (!this.componentGestureHandlers.has(componentId)) {
      this.componentGestureHandlers.set(componentId, new Map());
    }
    
    // Получаем карту обработчиков для компонента
    const componentHandlers = this.componentGestureHandlers.get(componentId);
    
    // Регистрируем обработчик
    componentHandlers.set(gestureType, handler);
    
    // Если менеджер жестов для компонента существует, регистрируем обработчик в нем
    const gestureManager = this.getGestureManager(componentId);
    if (gestureManager) {
      this.attachHandlerToManager(gestureManager, gestureType, handler);
    }
    
    this.logger.debug(`GestureIntegration: registered handler for "${gestureType}" in component "${componentId}"`);
    
    return this;
  }
  
  /**
   * Прикрепляет обработчик к менеджеру жестов
   * @param {GestureManager} gestureManager - Менеджер жестов
   * @param {string} gestureType - Тип жеста
   * @param {Function} handler - Функция-обработчик
   * @private
   */
  attachHandlerToManager(gestureManager, gestureType, handler) {
    // Создаем обертку для обработчика
    const wrappedHandler = (event) => {
      handler(event.gestureState, event.originalEvent, event.target);
    };
    
    // Регистрируем обработчик события в системе событий
    this.eventEmitter.on(`gesture:${gestureType}`, wrappedHandler);
  }
  
  /**
   * Удаляет обработчик жеста для компонента
   * @param {string} componentId - Идентификатор компонента
   * @param {string} gestureType - Тип жеста
   * @returns {boolean} true, если обработчик был удален
   */
  unregisterComponentGestureHandler(componentId, gestureType) {
    // Проверяем, существует ли карта обработчиков для компонента
    if (!this.componentGestureHandlers.has(componentId)) {
      return false;
    }
    
    // Получаем карту обработчиков для компонента
    const componentHandlers = this.componentGestureHandlers.get(componentId);
    
    // Удаляем обработчик
    const result = componentHandlers.delete(gestureType);
    
    if (result) {
      this.logger.debug(`GestureIntegration: unregistered handler for "${gestureType}" in component "${componentId}"`);
      
      // Если карта обработчиков пуста, удаляем ее
      if (componentHandlers.size === 0) {
        this.componentGestureHandlers.delete(componentId);
      }
    }
    
    return result;
  }
  
  /**
   * Обновляет настройки жестов
   * @param {Object} settings - Новые настройки
   */
  updateGestureSettings(settings) {
    // Обновляем настройки по умолчанию
    if (settings.enabled !== undefined) {
      this.defaultGestureOptions.enabled = settings.enabled;
    }
    
    if (settings.preventDefaultEvents !== undefined) {
      this.defaultGestureOptions.preventDefaultEvents = settings.preventDefaultEvents;
    }
    
    if (settings.passiveEvents !== undefined) {
      this.defaultGestureOptions.passiveEvents = settings.passiveEvents;
    }
    
    if (settings.visualFeedback !== undefined) {
      this.defaultGestureOptions.visualFeedback = settings.visualFeedback;
    }
    
    // Обновляем настройки для всех существующих менеджеров
    this.gestureManagers.forEach((manager, componentId) => {
      const config = { ...settings };
      
      manager.updateConfig(config);
      
      if (settings.visualFeedback !== undefined) {
        manager.setVisualFeedback(settings.visualFeedback);
      }
      
      if (settings.enabled !== undefined) {
        manager.setEnabled(settings.enabled);
      }
      
      if (settings.preventDefaultEvents !== undefined) {
        manager.setPreventDefaultEvents(settings.preventDefaultEvents);
      }
    });
    
    this.logger.info('GestureIntegration: updated gesture settings');
    this.eventEmitter.emit('gestureIntegration:settingsUpdated', settings);
  }
  
  /**
   * Адаптирует жесты к текущему устройству ввода
   * @param {Object} deviceInfo - Информация об устройстве ввода
   */
  adaptGesturesToDevice(deviceInfo) {
    // Адаптируем жесты в зависимости от устройства ввода
    const isTouchDevice = deviceInfo.type === 'touch';
    const isPenDevice = deviceInfo.type === 'pen';
    const isMouseDevice = deviceInfo.type === 'mouse';
    
    // Создаем или обновляем CSS-переменные для устройства
    document.documentElement.style.setProperty('--gesture-input-type', deviceInfo.type);
    
    // Настройки для различных типов устройств
    let deviceSettings = {};
    
    if (isTouchDevice) {
      deviceSettings = {
        tapMaxDistance: 15, // Увеличиваем для сенсорных устройств
        tapMaxDuration: 300,
        doubleTapDelay: 300,
        longPressDelay: 500,
        swipeMinDistance: 50, // Увеличиваем для сенсорных устройств
        swipeMinVelocity: 0.3,
        touchSensitivity: 1.0
      };
      
      document.documentElement.style.setProperty('--gesture-feedback-size', '64px');
    } else if (isPenDevice) {
      deviceSettings = {
        tapMaxDistance: 5, // Уменьшаем для пера
        tapMaxDuration: 300,
        doubleTapDelay: 300,
        longPressDelay: 500,
        swipeMinDistance: 30,
        swipeMinVelocity: 0.2,
        touchSensitivity: 1.2 // Увеличиваем чувствительность для пера
      };
      
      document.documentElement.style.setProperty('--gesture-feedback-size', '32px');
    } else if (isMouseDevice) {
      deviceSettings = {
        tapMaxDistance: 5, // Уменьшаем для мыши
        tapMaxDuration: 300,
        doubleTapDelay: 300,
        longPressDelay: 500,
        swipeMinDistance: 30,
        swipeMinVelocity: 0.2,
        mouseSensitivity: 1.0
      };
      
      document.documentElement.style.setProperty('--gesture-feedback-size', '24px');
    }
    
    // Обновляем настройки для всех менеджеров жестов
    this.gestureManagers.forEach((manager) => {
      manager.updateConfig(deviceSettings);
    });
    
    this.logger.info(`GestureIntegration: adapted gestures to ${deviceInfo.type} device`);
  }
  
  /**
   * Адаптирует жесты к настройкам доступности
   * @param {Object} accessibilityInfo - Информация о настройках доступности
   */
  adaptGesturesToAccessibility(accessibilityInfo) {
    // Адаптируем жесты в зависимости от настроек доступности
    const reducedMotion = accessibilityInfo.reducedMotion || false;
    const highContrast = accessibilityInfo.highContrast || false;
    const largeText = accessibilityInfo.largeText || false;
    
    // Настройки для различных параметров доступности
    let accessibilitySettings = {};
    
    if (reducedMotion) {
      accessibilitySettings.inertiaEnabled = false;
      document.documentElement.style.setProperty('--gesture-animation-duration', '0ms');
    } else {
      accessibilitySettings.inertiaEnabled = true;
      document.documentElement.style.setProperty('--gesture-animation-duration', '300ms');
    }
    
    if (highContrast) {
      document.documentElement.style.setProperty('--gesture-feedback-color', 'rgba(255, 255, 0, 0.8)');
      document.documentElement.style.setProperty('--gesture-feedback-opacity', '0.9');
    } else {
      document.documentElement.style.setProperty('--gesture-feedback-color', 'rgba(0, 120, 255, 0.5)');
      document.documentElement.style.setProperty('--gesture-feedback-opacity', '0.7');
    }
    
    if (largeText) {
      // Увеличиваем размеры для лучшей доступности
      accessibilitySettings.tapMaxDistance = 20;
      accessibilitySettings.swipeMinDistance = 60;
      document.documentElement.style.setProperty('--gesture-feedback-size', '80px');
    }
    
    // Обновляем настройки для всех менеджеров жестов
    this.gestureManagers.forEach((manager) => {
      manager.updateConfig(accessibilitySettings);
    });
    
    this.logger.info('GestureIntegration: adapted gestures to accessibility settings');
  }
  
  /**
   * Создает глобальный менеджер жестов для всего приложения
   * @param {HTMLElement} rootElement - Корневой элемент приложения
   * @returns {GestureManager} Глобальный менеджер жестов
   */
  createGlobalGestureManager(rootElement) {
    // Создаем глобальный менеджер жестов
    const globalManager = this.createGestureManager('global', rootElement, {
      visualFeedback: this.defaultGestureOptions.visualFeedback
    });
    
    this.logger.info('GestureIntegration: created global gesture manager');
    
    return globalManager;
  }
  
  /**
   * Регистрирует стандартные обработчики жестов для компонента
   * @param {string} componentId - Идентификатор компонента
   * @param {Object} handlers - Объект с обработчиками жестов
   * @returns {GestureIntegration} Экземпляр интегратора жестов
   */
  registerStandardGestureHandlers(componentId, handlers = {}) {
    // Регистрируем обработчики для стандартных жестов
    const standardGestures = [
      'tap',
      'doubletap',
      'longpress',
      'swipe',
      'pinch',
      'rotate',
      'pan',
      'wheel'
    ];
    
    standardGestures.forEach((gestureType) => {
      if (typeof handlers[gestureType] === 'function') {
        this.registerComponentGestureHandler(componentId, gestureType, handlers[gestureType]);
      }
    });
    
    return this;
  }
  
  /**
   * Создает визуальную обратную связь для жеста
   * @param {number} x - Координата X
   * @param {number} y - Координата Y
   * @param {string} type - Тип жеста
   */
  createVisualFeedback(x, y, type) {
    // Создаем элемент для визуальной обратной связи
    const feedback = document.createElement('div');
    feedback.className = 'gesture-feedback';
    feedback.style.left = `${x}px`;
    feedback.style.top = `${y}px`;
    
    // Добавляем специфические стили в зависимости от типа жеста
    switch (type) {
      case 'tap':
        feedback.style.backgroundColor = 'rgba(0, 120, 255, 0.5)';
        break;
      case 'doubletap':
        feedback.style.backgroundColor = 'rgba(0, 200, 0, 0.5)';
        break;
      case 'longpress':
        feedback.style.backgroundColor = 'rgba(255, 120, 0, 0.5)';
        break;
      case 'swipe':
        feedback.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
        break;
      default:
        feedback.style.backgroundColor = 'rgba(150, 150, 150, 0.5)';
    }
    
    // Добавляем элемент в DOM
    document.body.appendChild(feedback);
    
    // Активируем анимацию
    setTimeout(() => {
      feedback.classList.add('active');
    }, 10);
    
    // Удаляем элемент после завершения анимации
    setTimeout(() => {
      feedback.classList.add('fade-out');
      setTimeout(() => {
        if (document.body.contains(feedback)) {
          document.body.removeChild(feedback);
        }
      }, 300);
    }, 500);
  }
  
  /**
   * Включает или отключает жесты
   * @param {boolean} enabled - Флаг включения
   * @returns {GestureIntegration} Экземпляр интегратора жестов
   */
  setEnabled(enabled) {
    this.defaultGestureOptions.enabled = !!enabled;
    
    // Обновляем настройки для всех менеджеров
    this.gestureManagers.forEach((manager) => {
      manager.setEnabled(enabled);
    });
    
    this.logger.info(`GestureIntegration: ${enabled ? 'enabled' : 'disabled'}`);
    this.eventEmitter.emit('gestureIntegration:enabledChanged', { enabled });
    
    return this;
  }
  
  /**
   * Включает или отключает визуальную обратную связь
   * @param {boolean} enabled - Флаг включения
   * @returns {GestureIntegration} Экземпляр интегратора жестов
   */
  setVisualFeedback(enabled) {
    this.defaultGestureOptions.visualFeedback = !!enabled;
    
    // Обновляем настройки для всех менеджеров
    this.gestureManagers.forEach((manager) => {
      manager.setVisualFeedback(enabled);
    });
    
    this.logger.info(`GestureIntegration: visual feedback ${enabled ? 'enabled' : 'disabled'}`);
    
    return this;
  }
  
  /**
   * Уничтожает интегратор жестов и все связанные ресурсы
   */
  destroy() {
    // Удаляем все менеджеры жестов
    this.gestureManagers.forEach((manager) => {
      manager.destroy();
    });
    this.gestureManagers.clear();
    
    // Удаляем обработчики событий
    this.eventEmitter.removeAllListeners('settings:gestures:changed');
    this.eventEmitter.removeAllListeners('input:device:changed');
    this.eventEmitter.removeAllListeners('accessibility:changed');
    
    // Очищаем карту обработчиков жестов для компонентов
    this.componentGestureHandlers.clear();
    
    this.isInitialized = false;
    this.logger.info('GestureIntegration: destroyed');
  }
}

module.exports = GestureIntegration;
