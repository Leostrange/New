/**
 * @file TabletAdapter.js
 * @description Адаптер интерфейса для планшетных устройств
 * @module ui/TabletAdapter
 */

/**
 * Класс для адаптации интерфейса под планшетные устройства
 */
class TabletAdapter {
  /**
   * Создает экземпляр адаптера для планшетов
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = this.mergeConfig(options.config || {});
    
    // Флаги состояния
    this.isInitialized = false;
    this.isTablet = false;
    this.currentOrientation = null;
    
    // Зарегистрированные компоненты
    this.components = new Map();
    
    // Привязка методов к контексту
    this.handleResize = this.handleResize.bind(this);
    this.handleOrientationChange = this.handleOrientationChange.bind(this);
  }
  
  /**
   * Объединяет пользовательскую конфигурацию с конфигурацией по умолчанию
   * @param {Object} userConfig - Пользовательская конфигурация
   * @returns {Object} Объединенная конфигурация
   * @private
   */
  mergeConfig(userConfig) {
    const defaultConfig = {
      // Общие настройки
      tabletBreakpoint: 768, // Ширина экрана, при которой устройство считается планшетом
      largeTabletBreakpoint: 1024, // Ширина экрана для больших планшетов
      
      // Настройки макетов
      layouts: {
        default: 'stack', // Стандартный макет для мобильных устройств
        tablet: 'split', // Макет для планшетов
        largeTablet: 'grid' // Макет для больших планшетов
      },
      
      // Настройки элементов управления
      controls: {
        touchTargetSize: 44, // Минимальный размер области касания (в пикселях)
        spacing: 16, // Расстояние между элементами управления
        floatingActionButton: true, // Использовать плавающую кнопку действия
        swipeNavigation: true // Использовать навигацию свайпами
      },
      
      // Настройки для отладки
      debug: false
    };
    
    return { ...defaultConfig, ...userConfig };
  }
  
  /**
   * Инициализирует адаптер для планшетов
   * @returns {TabletAdapter} Экземпляр адаптера
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('TabletAdapter: already initialized');
      return this;
    }
    
    this.logger.info('TabletAdapter: initializing');
    
    // Определяем тип устройства
    this.detectDeviceType();
    
    // Определяем ориентацию экрана
    this.detectOrientation();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Добавляем метатег для корректного масштабирования на мобильных устройствах
    this.addViewportMeta();
    
    // Добавляем базовые стили для адаптивного дизайна
    this.addBaseStyles();
    
    this.isInitialized = true;
    this.eventEmitter.emit('tabletAdapter:initialized', {
      isTablet: this.isTablet,
      orientation: this.currentOrientation
    });
    
    return this;
  }
  
  /**
   * Определяет тип устройства
   * @private
   */
  detectDeviceType() {
    const width = window.innerWidth;
    const isTablet = width >= this.config.tabletBreakpoint && width < 1200;
    const isLargeTablet = width >= this.config.largeTabletBreakpoint && width < 1200;
    
    // Дополнительные проверки для определения планшета
    const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream;
    const isAndroidTablet = /Android/.test(navigator.userAgent) && !/Mobile/.test(navigator.userAgent);
    const isWindowsTablet = /Windows/.test(navigator.userAgent) && isTouch;
    
    // Определяем, является ли устройство планшетом
    this.isTablet = isTablet || isLargeTablet || isIOS || isAndroidTablet || isWindowsTablet;
    this.isLargeTablet = isLargeTablet;
    
    this.logger.debug(`TabletAdapter: device detected as ${this.isTablet ? (this.isLargeTablet ? 'large tablet' : 'tablet') : 'non-tablet'}`);
    
    return this.isTablet;
  }
  
  /**
   * Определяет ориентацию экрана
   * @private
   */
  detectOrientation() {
    const width = window.innerWidth;
    const height = window.innerHeight;
    
    const oldOrientation = this.currentOrientation;
    this.currentOrientation = width > height ? 'landscape' : 'portrait';
    
    if (oldOrientation !== this.currentOrientation) {
      this.logger.debug(`TabletAdapter: orientation changed to ${this.currentOrientation}`);
      
      if (this.isInitialized) {
        this.eventEmitter.emit('tabletAdapter:orientationChanged', {
          orientation: this.currentOrientation
        });
      }
    }
    
    return this.currentOrientation;
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения размера окна
    window.addEventListener('resize', this.handleResize);
    
    // Обработчик изменения ориентации экрана
    if ('onorientationchange' in window) {
      window.addEventListener('orientationchange', this.handleOrientationChange);
    }
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    window.removeEventListener('resize', this.handleResize);
    
    if ('onorientationchange' in window) {
      window.removeEventListener('orientationchange', this.handleOrientationChange);
    }
  }
  
  /**
   * Обработчик изменения размера окна
   * @private
   */
  handleResize() {
    // Определяем тип устройства
    const wasTablet = this.isTablet;
    const wasLargeTablet = this.isLargeTablet;
    this.detectDeviceType();
    
    // Если тип устройства изменился, отправляем событие
    if (wasTablet !== this.isTablet || wasLargeTablet !== this.isLargeTablet) {
      this.eventEmitter.emit('tabletAdapter:deviceTypeChanged', {
        isTablet: this.isTablet,
        isLargeTablet: this.isLargeTablet
      });
      
      // Обновляем все зарегистрированные компоненты
      this.updateAllComponents();
    }
    
    // Определяем ориентацию экрана
    this.detectOrientation();
  }
  
  /**
   * Обработчик изменения ориентации экрана
   * @private
   */
  handleOrientationChange() {
    // Небольшая задержка для корректного определения новых размеров
    setTimeout(() => {
      // Определяем ориентацию экрана
      this.detectOrientation();
      
      // Обновляем все зарегистрированные компоненты
      this.updateAllComponents();
    }, 100);
  }
  
  /**
   * Добавляет метатег для корректного масштабирования на мобильных устройствах
   * @private
   */
  addViewportMeta() {
    // Проверяем, существует ли уже метатег viewport
    let viewportMeta = document.querySelector('meta[name="viewport"]');
    
    if (!viewportMeta) {
      // Создаем новый метатег viewport
      viewportMeta = document.createElement('meta');
      viewportMeta.name = 'viewport';
      document.head.appendChild(viewportMeta);
    }
    
    // Устанавливаем содержимое метатега
    viewportMeta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
  }
  
  /**
   * Добавляет базовые стили для адаптивного дизайна
   * @private
   */
  addBaseStyles() {
    // Проверяем, существует ли уже элемент стилей
    let styleElement = document.getElementById('tablet-adapter-styles');
    
    if (!styleElement) {
      // Создаем новый элемент стилей
      styleElement = document.createElement('style');
      styleElement.id = 'tablet-adapter-styles';
      document.head.appendChild(styleElement);
    }
    
    // Устанавливаем содержимое стилей
    styleElement.textContent = `
      /* Базовые стили для адаптивного дизайна */
      * {
        box-sizing: border-box;
      }
      
      html, body {
        margin: 0;
        padding: 0;
        width: 100%;
        height: 100%;
        overflow-x: hidden;
      }
      
      /* Стили для планшетов */
      @media (min-width: ${this.config.tabletBreakpoint}px) {
        .tablet-hidden {
          display: none !important;
        }
        
        .tablet-visible {
          display: block !important;
        }
        
        .tablet-flex {
          display: flex !important;
        }
        
        .tablet-grid {
          display: grid !important;
        }
        
        /* Макет с разделением */
        .layout-split {
          display: flex;
          flex-direction: row;
        }
        
        .layout-split > .sidebar {
          width: 320px;
          flex-shrink: 0;
        }
        
        .layout-split > .content {
          flex-grow: 1;
        }
      }
      
      /* Стили для больших планшетов */
      @media (min-width: ${this.config.largeTabletBreakpoint}px) {
        .large-tablet-hidden {
          display: none !important;
        }
        
        .large-tablet-visible {
          display: block !important;
        }
        
        .large-tablet-flex {
          display: flex !important;
        }
        
        .large-tablet-grid {
          display: grid !important;
        }
        
        /* Макет с сеткой */
        .layout-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 20px;
        }
      }
      
      /* Стили для портретной ориентации на планшетах */
      @media (min-width: ${this.config.tabletBreakpoint}px) and (orientation: portrait) {
        .tablet-portrait-hidden {
          display: none !important;
        }
        
        .tablet-portrait-visible {
          display: block !important;
        }
      }
      
      /* Стили для альбомной ориентации на планшетах */
      @media (min-width: ${this.config.tabletBreakpoint}px) and (orientation: landscape) {
        .tablet-landscape-hidden {
          display: none !important;
        }
        
        .tablet-landscape-visible {
          display: block !important;
        }
      }
      
      /* Стили для элементов управления на сенсорных устройствах */
      @media (pointer: coarse) {
        button, .button, .clickable, a, input[type="button"], input[type="submit"] {
          min-height: ${this.config.controls.touchTargetSize}px;
          min-width: ${this.config.controls.touchTargetSize}px;
          padding: ${this.config.controls.spacing / 2}px;
          margin: ${this.config.controls.spacing / 2}px;
        }
        
        input, select, textarea {
          min-height: ${this.config.controls.touchTargetSize}px;
          padding: ${this.config.controls.spacing / 2}px;
        }
      }
    `;
  }
  
  /**
   * Регистрирует компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} component - Компонент
   * @param {string} type - Тип компонента
   * @returns {TabletAdapter} Экземпляр адаптера
   */
  registerComponent(id, component, type = 'generic') {
    if (!this.isInitialized) {
      this.logger.warn('TabletAdapter: not initialized');
      return this;
    }
    
    this.components.set(id, { component, type });
    
    // Применяем адаптацию к компоненту
    this.updateComponent(id, { component, type });
    
    this.logger.debug(`TabletAdapter: registered component "${id}" of type "${type}"`);
    
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
    
    // Если компонент имеет метод updateLayout, вызываем его
    if (component.updateLayout && typeof component.updateLayout === 'function') {
      component.updateLayout({
        isTablet: this.isTablet,
        isLargeTablet: this.isLargeTablet,
        orientation: this.currentOrientation
      });
      return;
    }
    
    // Если компонент является DOM-элементом
    if (component instanceof Element) {
      // Применяем специфичные для типа компонента адаптации
      switch (type) {
        case 'layout':
          this.updateLayoutComponent(component);
          break;
        case 'navigation':
          this.updateNavigationComponent(component);
          break;
        case 'content':
          this.updateContentComponent(component);
          break;
        case 'toolbar':
          this.updateToolbarComponent(component);
          break;
        case 'sidebar':
          this.updateSidebarComponent(component);
          break;
        case 'modal':
          this.updateModalComponent(component);
          break;
        case 'form':
          this.updateFormComponent(component);
          break;
        case 'comic':
          this.updateComicComponent(component);
          break;
        case 'editor':
          this.updateEditorComponent(component);
          break;
        default:
          // Для общих компонентов применяем базовые адаптации
          this.updateGenericComponent(component);
      }
    }
  }
  
  /**
   * Обновляет компонент макета
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateLayoutComponent(element) {
    // Удаляем все классы макетов
    element.classList.remove('layout-stack', 'layout-split', 'layout-grid');
    
    // Добавляем класс соответствующего макета
    if (this.isLargeTablet) {
      element.classList.add(`layout-${this.config.layouts.largeTablet}`);
    } else if (this.isTablet) {
      element.classList.add(`layout-${this.config.layouts.tablet}`);
    } else {
      element.classList.add(`layout-${this.config.layouts.default}`);
    }
    
    // Добавляем классы для текущей ориентации
    element.classList.remove('orientation-portrait', 'orientation-landscape');
    element.classList.add(`orientation-${this.currentOrientation}`);
  }
  
  /**
   * Обновляет компонент навигации
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateNavigationComponent(element) {
    // Адаптируем навигацию в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов в альбомной ориентации показываем полную навигацию
      if (this.currentOrientation === 'landscape') {
        element.classList.remove('navigation-compact');
        element.classList.add('navigation-full');
      } else {
        // Для планшетов в портретной ориентации используем компактную навигацию
        element.classList.remove('navigation-full');
        element.classList.add('navigation-compact');
      }
    } else {
      // Для мобильных устройств всегда используем компактную навигацию
      element.classList.remove('navigation-full');
      element.classList.add('navigation-compact');
    }
    
    // Если включена навигация свайпами, добавляем соответствующий класс
    if (this.config.controls.swipeNavigation) {
      element.classList.add('swipe-enabled');
    } else {
      element.classList.remove('swipe-enabled');
    }
  }
  
  /**
   * Обновляет компонент содержимого
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateContentComponent(element) {
    // Адаптируем содержимое в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов используем многоколоночный макет в альбомной ориентации
      if (this.currentOrientation === 'landscape' && this.isLargeTablet) {
        element.style.columnCount = '2';
        element.style.columnGap = '20px';
      } else {
        // В портретной ориентации используем одну колонку
        element.style.columnCount = '1';
      }
    } else {
      // Для мобильных устройств всегда используем одну колонку
      element.style.columnCount = '1';
    }
    
    // Настраиваем размер шрифта в зависимости от типа устройства
    if (this.isLargeTablet) {
      element.style.fontSize = '1.1em';
    } else if (this.isTablet) {
      element.style.fontSize = '1em';
    } else {
      element.style.fontSize = '0.9em';
    }
  }
  
  /**
   * Обновляет компонент панели инструментов
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateToolbarComponent(element) {
    // Адаптируем панель инструментов в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов показываем все элементы панели инструментов
      const toolbarItems = element.querySelectorAll('.toolbar-item');
      toolbarItems.forEach(item => {
        item.style.display = '';
      });
      
      // В альбомной ориентации добавляем дополнительные элементы
      if (this.currentOrientation === 'landscape') {
        const extraItems = element.querySelectorAll('.toolbar-item-extra');
        extraItems.forEach(item => {
          item.style.display = '';
        });
      } else {
        // В портретной ориентации скрываем дополнительные элементы
        const extraItems = element.querySelectorAll('.toolbar-item-extra');
        extraItems.forEach(item => {
          item.style.display = 'none';
        });
      }
    } else {
      // Для мобильных устройств скрываем некритичные элементы
      const nonEssentialItems = element.querySelectorAll('.toolbar-item:not(.essential)');
      nonEssentialItems.forEach(item => {
        item.style.display = 'none';
      });
    }
  }
  
  /**
   * Обновляет компонент боковой панели
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateSidebarComponent(element) {
    // Адаптируем боковую панель в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов в альбомной ориентации показываем боковую панель
      if (this.currentOrientation === 'landscape') {
        element.style.display = '';
        element.style.width = '320px';
        element.style.position = 'relative';
        element.style.transform = 'none';
      } else {
        // Для планшетов в портретной ориентации скрываем боковую панель по умолчанию
        element.style.display = 'none';
        element.style.width = '320px';
        element.style.position = 'absolute';
        element.style.transform = 'translateX(-100%)';
      }
    } else {
      // Для мобильных устройств скрываем боковую панель по умолчанию
      element.style.display = 'none';
      element.style.width = '100%';
      element.style.position = 'absolute';
      element.style.transform = 'translateX(-100%)';
    }
  }
  
  /**
   * Обновляет компонент модального окна
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateModalComponent(element) {
    // Адаптируем модальное окно в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов используем фиксированный размер модального окна
      element.style.width = '80%';
      element.style.maxWidth = '600px';
      element.style.height = 'auto';
      element.style.maxHeight = '80%';
    } else {
      // Для мобильных устройств модальное окно занимает почти весь экран
      element.style.width = '95%';
      element.style.maxWidth = 'none';
      element.style.height = 'auto';
      element.style.maxHeight = '90%';
    }
  }
  
  /**
   * Обновляет компонент формы
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateFormComponent(element) {
    // Адаптируем форму в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов используем двухколоночный макет в альбомной ориентации
      if (this.currentOrientation === 'landscape') {
        const formGroups = element.querySelectorAll('.form-group');
        formGroups.forEach(group => {
          group.style.display = 'inline-block';
          group.style.width = 'calc(50% - 10px)';
          group.style.marginRight = '10px';
        });
      } else {
        // В портретной ориентации используем одну колонку
        const formGroups = element.querySelectorAll('.form-group');
        formGroups.forEach(group => {
          group.style.display = 'block';
          group.style.width = '100%';
          group.style.marginRight = '0';
        });
      }
    } else {
      // Для мобильных устройств всегда используем одну колонку
      const formGroups = element.querySelectorAll('.form-group');
      formGroups.forEach(group => {
        group.style.display = 'block';
        group.style.width = '100%';
        group.style.marginRight = '0';
      });
    }
    
    // Увеличиваем размер элементов формы для сенсорных устройств
    const inputs = element.querySelectorAll('input, select, textarea, button');
    inputs.forEach(input => {
      input.style.minHeight = `${this.config.controls.touchTargetSize}px`;
      input.style.padding = `${this.config.controls.spacing / 2}px`;
    });
  }
  
  /**
   * Обновляет компонент комикса
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateComicComponent(element) {
    // Адаптируем комикс в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов в альбомной ориентации показываем несколько панелей в ряд
      if (this.currentOrientation === 'landscape') {
        element.style.display = 'grid';
        element.style.gridTemplateColumns = 'repeat(auto-fit, minmax(300px, 1fr))';
        element.style.gap = '20px';
      } else {
        // В портретной ориентации показываем одну панель в ряд
        element.style.display = 'flex';
        element.style.flexDirection = 'column';
        element.style.gap = '20px';
      }
    } else {
      // Для мобильных устройств всегда показываем одну панель в ряд
      element.style.display = 'flex';
      element.style.flexDirection = 'column';
      element.style.gap = '10px';
    }
    
    // Настраиваем размер шрифта в пузырях с текстом
    const bubbles = element.querySelectorAll('.comic-bubble');
    if (this.isLargeTablet) {
      bubbles.forEach(bubble => {
        bubble.style.fontSize = '1.1em';
      });
    } else if (this.isTablet) {
      bubbles.forEach(bubble => {
        bubble.style.fontSize = '1em';
      });
    } else {
      bubbles.forEach(bubble => {
        bubble.style.fontSize = '0.9em';
      });
    }
  }
  
  /**
   * Обновляет компонент редактора
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateEditorComponent(element) {
    // Адаптируем редактор в зависимости от типа устройства и ориентации
    if (this.isTablet) {
      // Для планшетов показываем все инструменты редактора
      const toolbarItems = element.querySelectorAll('.editor-toolbar-item');
      toolbarItems.forEach(item => {
        item.style.display = '';
      });
      
      // В альбомной ориентации используем горизонтальную панель инструментов
      if (this.currentOrientation === 'landscape') {
        const toolbar = element.querySelector('.editor-toolbar');
        if (toolbar) {
          toolbar.style.flexDirection = 'row';
          toolbar.style.height = 'auto';
          toolbar.style.width = '100%';
        }
        
        // Настраиваем область редактирования
        const editArea = element.querySelector('.editor-area');
        if (editArea) {
          editArea.style.height = 'calc(100% - 50px)';
          editArea.style.width = '100%';
        }
      } else {
        // В портретной ориентации используем вертикальную панель инструментов
        const toolbar = element.querySelector('.editor-toolbar');
        if (toolbar) {
          toolbar.style.flexDirection = 'column';
          toolbar.style.height = '100%';
          toolbar.style.width = 'auto';
        }
        
        // Настраиваем область редактирования
        const editArea = element.querySelector('.editor-area');
        if (editArea) {
          editArea.style.height = '100%';
          editArea.style.width = 'calc(100% - 50px)';
        }
      }
    } else {
      // Для мобильных устройств скрываем некритичные инструменты
      const nonEssentialItems = element.querySelectorAll('.editor-toolbar-item:not(.essential)');
      nonEssentialItems.forEach(item => {
        item.style.display = 'none';
      });
      
      // Используем горизонтальную панель инструментов
      const toolbar = element.querySelector('.editor-toolbar');
      if (toolbar) {
        toolbar.style.flexDirection = 'row';
        toolbar.style.height = 'auto';
        toolbar.style.width = '100%';
        toolbar.style.overflowX = 'auto';
        toolbar.style.overflowY = 'hidden';
      }
      
      // Настраиваем область редактирования
      const editArea = element.querySelector('.editor-area');
      if (editArea) {
        editArea.style.height = 'calc(100% - 50px)';
        editArea.style.width = '100%';
      }
    }
  }
  
  /**
   * Обновляет общий компонент
   * @param {Element} element - DOM-элемент
   * @private
   */
  updateGenericComponent(element) {
    // Применяем базовые адаптации для общих компонентов
    if (this.isTablet) {
      element.classList.add('tablet');
      
      if (this.isLargeTablet) {
        element.classList.add('large-tablet');
      } else {
        element.classList.remove('large-tablet');
      }
      
      // Добавляем классы для текущей ориентации
      element.classList.remove('tablet-portrait', 'tablet-landscape');
      element.classList.add(`tablet-${this.currentOrientation}`);
    } else {
      element.classList.remove('tablet', 'large-tablet', 'tablet-portrait', 'tablet-landscape');
    }
  }
  
  /**
   * Показывает или скрывает плавающую кнопку действия
   * @param {boolean} show - Флаг отображения
   * @param {Object} options - Параметры кнопки
   * @returns {Element|null} Элемент кнопки или null, если кнопка не поддерживается
   */
  toggleFloatingActionButton(show, options = {}) {
    if (!this.config.controls.floatingActionButton) {
      return null;
    }
    
    // Находим или создаем плавающую кнопку действия
    let fab = document.getElementById('tablet-adapter-fab');
    
    if (!fab && show) {
      // Создаем новую кнопку
      fab = document.createElement('button');
      fab.id = 'tablet-adapter-fab';
      fab.className = 'floating-action-button';
      document.body.appendChild(fab);
      
      // Добавляем стили для кнопки
      const styleElement = document.createElement('style');
      styleElement.textContent = `
        .floating-action-button {
          position: fixed;
          bottom: 20px;
          right: 20px;
          width: 56px;
          height: 56px;
          border-radius: 50%;
          background-color: var(--color-primary, #3498db);
          color: var(--color-textInverse, #ffffff);
          border: none;
          box-shadow: 0 2px 5px rgba(0, 0, 0, 0.2);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 24px;
          cursor: pointer;
          z-index: 1000;
          transition: all 0.3s ease;
        }
        
        .floating-action-button:hover {
          transform: scale(1.1);
          box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3);
        }
      `;
      document.head.appendChild(styleElement);
    }
    
    if (fab) {
      // Обновляем параметры кнопки
      if (show) {
        fab.style.display = 'flex';
        
        if (options.icon) {
          fab.innerHTML = options.icon;
        }
        
        if (options.backgroundColor) {
          fab.style.backgroundColor = options.backgroundColor;
        }
        
        if (options.color) {
          fab.style.color = options.color;
        }
        
        if (options.position) {
          if (options.position === 'left') {
            fab.style.right = 'auto';
            fab.style.left = '20px';
          } else {
            fab.style.left = 'auto';
            fab.style.right = '20px';
          }
        }
        
        if (options.onClick && typeof options.onClick === 'function') {
          // Удаляем предыдущий обработчик
          fab.removeEventListener('click', this._fabClickHandler);
          
          // Сохраняем новый обработчик
          this._fabClickHandler = options.onClick;
          
          // Добавляем новый обработчик
          fab.addEventListener('click', this._fabClickHandler);
        }
      } else {
        fab.style.display = 'none';
      }
    }
    
    return fab;
  }
  
  /**
   * Получает текущий макет
   * @returns {string} Название текущего макета
   */
  getCurrentLayout() {
    if (this.isLargeTablet) {
      return this.config.layouts.largeTablet;
    } else if (this.isTablet) {
      return this.config.layouts.tablet;
    } else {
      return this.config.layouts.default;
    }
  }
  
  /**
   * Проверяет, является ли устройство планшетом
   * @returns {boolean} true, если устройство является планшетом
   */
  isTabletDevice() {
    return this.isTablet;
  }
  
  /**
   * Проверяет, является ли устройство большим планшетом
   * @returns {boolean} true, если устройство является большим планшетом
   */
  isLargeTabletDevice() {
    return this.isLargeTablet;
  }
  
  /**
   * Получает текущую ориентацию экрана
   * @returns {string} Текущая ориентация экрана ('portrait' или 'landscape')
   */
  getOrientation() {
    return this.currentOrientation;
  }
  
  /**
   * Обновляет конфигурацию адаптера
   * @param {Object} config - Новая конфигурация
   * @returns {TabletAdapter} Экземпляр адаптера
   */
  updateConfig(config) {
    this.config = this.mergeConfig(config);
    
    // Обновляем базовые стили
    this.addBaseStyles();
    
    // Обновляем все зарегистрированные компоненты
    this.updateAllComponents();
    
    this.logger.info('TabletAdapter: config updated');
    this.eventEmitter.emit('tabletAdapter:configUpdated', { config: { ...this.config } });
    
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
    this.logger.info('TabletAdapter: destroying');
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Удаляем плавающую кнопку действия
    this.toggleFloatingActionButton(false);
    
    // Очищаем карту компонентов
    this.components.clear();
    
    this.isInitialized = false;
    
    this.eventEmitter.emit('tabletAdapter:destroyed');
    
    this.logger.info('TabletAdapter: destroyed');
  }
}

module.exports = TabletAdapter;
