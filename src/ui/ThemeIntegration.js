/**
 * @file ThemeIntegration.js
 * @description Интеграционный слой для связи системы тем с компонентами UI
 * @module ui/ThemeIntegration
 */

const ThemeManager = require('./ThemeManager');

/**
 * Класс для интеграции системы тем с компонентами UI
 */
class ThemeIntegration {
  /**
   * Создает экземпляр интегратора тем
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
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };
    
    // Менеджер тем
    this.themeManager = null;
    
    // Зарегистрированные компоненты
    this.components = new Map();
    
    // Флаг инициализации
    this.isInitialized = false;
    
    // Привязка методов к контексту
    this.handleThemeChanged = this.handleThemeChanged.bind(this);
    this.handleAutoModeChanged = this.handleAutoModeChanged.bind(this);
  }
  
  /**
   * Инициализирует интегратор тем
   * @returns {ThemeIntegration} Экземпляр интегратора тем
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('ThemeIntegration: already initialized');
      return this;
    }
    
    this.logger.info('ThemeIntegration: initializing');
    
    // Создаем менеджер тем
    this.themeManager = new ThemeManager({
      eventEmitter: this.eventEmitter,
      logger: this.logger,
      config: this.config.themeManager,
      storage: this.storage
    });
    
    // Инициализируем менеджер тем
    this.themeManager.initialize();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Создаем элементы управления темами
    this.createThemeControls();
    
    this.isInitialized = true;
    this.eventEmitter.emit('themeIntegration:initialized');
    
    return this;
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения темы
    this.eventEmitter.on('themeManager:themeChanged', this.handleThemeChanged);
    
    // Обработчик изменения автоматического режима
    this.eventEmitter.on('themeManager:autoModeChanged', this.handleAutoModeChanged);
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    this.eventEmitter.off('themeManager:themeChanged', this.handleThemeChanged);
    this.eventEmitter.off('themeManager:autoModeChanged', this.handleAutoModeChanged);
  }
  
  /**
   * Обработчик изменения темы
   * @param {Object} data - Данные события
   * @private
   */
  handleThemeChanged(data) {
    // Обновляем все зарегистрированные компоненты
    for (const [id, component] of this.components) {
      this.updateComponentTheme(id, component, data.theme);
    }
    
    // Обновляем элементы управления темами
    this.updateThemeControls();
  }
  
  /**
   * Обработчик изменения автоматического режима
   * @param {Object} data - Данные события
   * @private
   */
  handleAutoModeChanged(data) {
    // Обновляем элементы управления темами
    this.updateThemeControls();
  }
  
  /**
   * Создает элементы управления темами
   * @private
   */
  createThemeControls() {
    // Проверяем, нужно ли создавать элементы управления
    if (!this.config.createControls) {
      return;
    }
    
    // Находим или создаем контейнер для элементов управления
    let container = document.querySelector(this.config.controlsContainer || '#theme-controls');
    
    if (!container) {
      container = document.createElement('div');
      container.id = 'theme-controls';
      container.className = 'theme-controls';
      document.body.appendChild(container);
    }
    
    // Очищаем контейнер
    container.innerHTML = '';
    
    // Создаем переключатель темы
    const themeToggle = document.createElement('button');
    themeToggle.id = 'theme-toggle';
    themeToggle.className = 'theme-toggle';
    themeToggle.setAttribute('aria-label', 'Переключить тему');
    themeToggle.innerHTML = this.themeManager.isDarkTheme() ? 
      '<span class="theme-toggle-icon">☀️</span>' : 
      '<span class="theme-toggle-icon">🌙</span>';
    
    themeToggle.addEventListener('click', () => {
      this.themeManager.toggleTheme();
    });
    
    container.appendChild(themeToggle);
    
    // Создаем переключатель автоматического режима
    const autoModeToggle = document.createElement('button');
    autoModeToggle.id = 'auto-mode-toggle';
    autoModeToggle.className = 'auto-mode-toggle';
    autoModeToggle.setAttribute('aria-label', 'Автоматический режим');
    autoModeToggle.innerHTML = this.themeManager.isAutoMode() ? 
      '<span class="auto-mode-toggle-icon">🔄</span>' : 
      '<span class="auto-mode-toggle-icon">⚙️</span>';
    
    autoModeToggle.addEventListener('click', () => {
      this.themeManager.setAutoMode(!this.themeManager.isAutoMode());
    });
    
    container.appendChild(autoModeToggle);
    
    // Создаем выпадающий список тем
    const themeSelect = document.createElement('select');
    themeSelect.id = 'theme-select';
    themeSelect.className = 'theme-select';
    themeSelect.setAttribute('aria-label', 'Выбрать тему');
    
    // Добавляем опции для каждой темы
    const availableThemes = this.themeManager.getAvailableThemes();
    const currentThemeId = this.themeManager.getCurrentThemeId();
    
    for (const theme of availableThemes) {
      const option = document.createElement('option');
      option.value = theme.id;
      option.textContent = theme.name;
      option.selected = theme.id === currentThemeId;
      themeSelect.appendChild(option);
    }
    
    themeSelect.addEventListener('change', () => {
      this.themeManager.setTheme(themeSelect.value);
    });
    
    container.appendChild(themeSelect);
    
    // Добавляем стили для элементов управления
    const style = document.createElement('style');
    style.textContent = `
      .theme-controls {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 5px;
      }
      
      .theme-toggle, .auto-mode-toggle {
        background: none;
        border: none;
        cursor: pointer;
        font-size: 1.5rem;
        padding: 5px;
        border-radius: var(--border-radius-medium, 5px);
        transition: background-color var(--transition-fast, 0.15s ease);
      }
      
      .theme-toggle:hover, .auto-mode-toggle:hover {
        background-color: var(--color-backgroundAlt, #f5f5f5);
      }
      
      .theme-select {
        padding: 5px;
        border-radius: var(--border-radius-small, 3px);
        border: 1px solid var(--color-border, #dddddd);
        background-color: var(--color-background, #ffffff);
        color: var(--color-text, #333333);
      }
    `;
    
    document.head.appendChild(style);
    
    // Сохраняем ссылки на элементы управления
    this.controls = {
      container,
      themeToggle,
      autoModeToggle,
      themeSelect
    };
  }
  
  /**
   * Обновляет элементы управления темами
   * @private
   */
  updateThemeControls() {
    if (!this.controls) {
      return;
    }
    
    const { themeToggle, autoModeToggle, themeSelect } = this.controls;
    
    // Обновляем переключатель темы
    if (themeToggle) {
      themeToggle.innerHTML = this.themeManager.isDarkTheme() ? 
        '<span class="theme-toggle-icon">☀️</span>' : 
        '<span class="theme-toggle-icon">🌙</span>';
    }
    
    // Обновляем переключатель автоматического режима
    if (autoModeToggle) {
      autoModeToggle.innerHTML = this.themeManager.isAutoMode() ? 
        '<span class="auto-mode-toggle-icon">🔄</span>' : 
        '<span class="auto-mode-toggle-icon">⚙️</span>';
    }
    
    // Обновляем выпадающий список тем
    if (themeSelect) {
      const currentThemeId = this.themeManager.getCurrentThemeId();
      
      for (const option of themeSelect.options) {
        option.selected = option.value === currentThemeId;
      }
    }
  }
  
  /**
   * Регистрирует компонент
   * @param {string} id - Идентификатор компонента
   * @param {Object} component - Компонент
   * @param {string} type - Тип компонента
   * @returns {ThemeIntegration} Экземпляр интегратора тем
   */
  registerComponent(id, component, type = 'generic') {
    if (!this.isInitialized) {
      this.logger.warn('ThemeIntegration: not initialized');
      return this;
    }
    
    this.components.set(id, { component, type });
    
    // Применяем текущую тему к компоненту
    const currentTheme = this.themeManager.getCurrentTheme();
    
    if (currentTheme) {
      this.updateComponentTheme(id, { component, type }, currentTheme);
    }
    
    this.logger.debug(`ThemeIntegration: registered component "${id}" of type "${type}"`);
    
    return this;
  }
  
  /**
   * Обновляет тему компонента
   * @param {string} id - Идентификатор компонента
   * @param {Object} componentData - Данные компонента
   * @param {Object} theme - Параметры темы
   * @private
   */
  updateComponentTheme(id, componentData, theme) {
    const { component, type } = componentData;
    
    // Если компонент имеет метод updateTheme, вызываем его
    if (component.updateTheme && typeof component.updateTheme === 'function') {
      component.updateTheme(theme);
      return;
    }
    
    // Если компонент является DOM-элементом
    if (component instanceof Element) {
      // Удаляем все классы тем
      component.classList.remove('theme-light', 'theme-dark');
      
      // Добавляем класс текущей темы
      component.classList.add(theme.isDark ? 'theme-dark' : 'theme-light');
      
      // Добавляем специфичные для типа компонента классы
      switch (type) {
        case 'toolbar':
          this.applyToolbarTheme(component, theme);
          break;
        case 'sidebar':
          this.applySidebarTheme(component, theme);
          break;
        case 'modal':
          this.applyModalTheme(component, theme);
          break;
        case 'card':
          this.applyCardTheme(component, theme);
          break;
        case 'button':
          this.applyButtonTheme(component, theme);
          break;
        case 'input':
          this.applyInputTheme(component, theme);
          break;
        case 'comic':
          this.applyComicTheme(component, theme);
          break;
        case 'editor':
          this.applyEditorTheme(component, theme);
          break;
        default:
          // Для общих компонентов применяем базовые стили
          this.applyGenericTheme(component, theme);
      }
    }
  }
  
  /**
   * Применяет тему к панели инструментов
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyToolbarTheme(element, theme) {
    element.style.backgroundColor = theme.colors.toolbar;
    element.style.color = theme.colors.text;
    element.style.borderBottom = `1px solid ${theme.colors.border}`;
    element.style.boxShadow = theme.shadows.small;
  }
  
  /**
   * Применяет тему к боковой панели
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applySidebarTheme(element, theme) {
    element.style.backgroundColor = theme.colors.sidebar;
    element.style.color = theme.colors.text;
    element.style.borderRight = `1px solid ${theme.colors.border}`;
  }
  
  /**
   * Применяет тему к модальному окну
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyModalTheme(element, theme) {
    element.style.backgroundColor = theme.colors.modal;
    element.style.color = theme.colors.text;
    element.style.border = `1px solid ${theme.colors.border}`;
    element.style.boxShadow = theme.shadows.large;
  }
  
  /**
   * Применяет тему к карточке
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyCardTheme(element, theme) {
    element.style.backgroundColor = theme.colors.card;
    element.style.color = theme.colors.text;
    element.style.border = `1px solid ${theme.colors.border}`;
    element.style.boxShadow = theme.shadows.small;
  }
  
  /**
   * Применяет тему к кнопке
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyButtonTheme(element, theme) {
    // Определяем тип кнопки по классам
    const isPrimary = element.classList.contains('primary');
    const isDanger = element.classList.contains('danger');
    const isSuccess = element.classList.contains('success');
    
    if (isPrimary) {
      element.style.backgroundColor = theme.colors.buttonPrimary;
      element.style.color = theme.colors.textInverse;
    } else if (isDanger) {
      element.style.backgroundColor = theme.colors.buttonDanger;
      element.style.color = theme.colors.textInverse;
    } else if (isSuccess) {
      element.style.backgroundColor = theme.colors.buttonSuccess;
      element.style.color = theme.colors.textInverse;
    } else {
      element.style.backgroundColor = theme.colors.buttonSecondary;
      element.style.color = theme.colors.text;
    }
    
    element.style.border = 'none';
    element.style.borderRadius = theme.borderRadius.small;
    element.style.transition = theme.transitions.fast;
  }
  
  /**
   * Применяет тему к полю ввода
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyInputTheme(element, theme) {
    element.style.backgroundColor = theme.isDark ? theme.colors.backgroundElevated : theme.colors.background;
    element.style.color = theme.colors.text;
    element.style.border = `1px solid ${theme.colors.border}`;
    element.style.borderRadius = theme.borderRadius.small;
  }
  
  /**
   * Применяет тему к комиксу
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyComicTheme(element, theme) {
    element.style.backgroundColor = theme.colors.comicBackground;
    element.style.color = theme.colors.comicText;
    
    // Применяем стили к панелям комикса
    const panels = element.querySelectorAll('.comic-panel');
    panels.forEach(panel => {
      panel.style.backgroundColor = theme.colors.comicPanel;
      panel.style.border = `1px solid ${theme.colors.comicBorder}`;
    });
    
    // Применяем стили к пузырям с текстом
    const bubbles = element.querySelectorAll('.comic-bubble');
    bubbles.forEach(bubble => {
      bubble.style.backgroundColor = theme.colors.comicBubble;
      bubble.style.color = theme.colors.comicText;
      bubble.style.border = `1px solid ${theme.colors.comicBorder}`;
    });
  }
  
  /**
   * Применяет тему к редактору
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyEditorTheme(element, theme) {
    element.style.backgroundColor = theme.colors.editorBackground;
    element.style.color = theme.colors.text;
    
    // Применяем стили к панели инструментов редактора
    const toolbar = element.querySelector('.editor-toolbar');
    if (toolbar) {
      toolbar.style.backgroundColor = theme.colors.editorToolbar;
      toolbar.style.borderBottom = `1px solid ${theme.colors.border}`;
    }
    
    // Применяем стили к области редактирования
    const editArea = element.querySelector('.editor-area');
    if (editArea) {
      editArea.style.backgroundColor = theme.colors.editorBackground;
      editArea.style.color = theme.colors.text;
    }
  }
  
  /**
   * Применяет базовые стили к общим компонентам
   * @param {Element} element - DOM-элемент
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyGenericTheme(element, theme) {
    element.style.backgroundColor = theme.colors.background;
    element.style.color = theme.colors.text;
  }
  
  /**
   * Получает менеджер тем
   * @returns {ThemeManager} Экземпляр менеджера тем
   */
  getThemeManager() {
    return this.themeManager;
  }
  
  /**
   * Получает текущую тему
   * @returns {Object|null} Параметры текущей темы или null, если тема не установлена
   */
  getCurrentTheme() {
    return this.themeManager ? this.themeManager.getCurrentTheme() : null;
  }
  
  /**
   * Устанавливает тему
   * @param {string} id - Идентификатор темы
   * @returns {boolean} true, если тема была установлена
   */
  setTheme(id) {
    return this.themeManager ? this.themeManager.setTheme(id) : false;
  }
  
  /**
   * Переключает между светлой и темной темами
   * @returns {boolean} true, если тема была переключена
   */
  toggleTheme() {
    return this.themeManager ? this.themeManager.toggleTheme() : false;
  }
  
  /**
   * Включает или отключает автоматический режим
   * @param {boolean} enabled - Флаг включения
   * @returns {ThemeIntegration} Экземпляр интегратора тем
   */
  setAutoMode(enabled) {
    if (this.themeManager) {
      this.themeManager.setAutoMode(enabled);
    }
    
    return this;
  }
  
  /**
   * Обновляет конфигурацию
   * @param {Object} config - Новая конфигурация
   * @returns {ThemeIntegration} Экземпляр интегратора тем
   */
  updateConfig(config) {
    this.config = { ...this.config, ...config };
    
    if (this.themeManager && config.themeManager) {
      this.themeManager.updateConfig(config.themeManager);
    }
    
    return this;
  }
  
  /**
   * Уничтожает интегратор тем и освобождает ресурсы
   */
  destroy() {
    this.logger.info('ThemeIntegration: destroying');
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Уничтожаем менеджер тем
    if (this.themeManager) {
      this.themeManager.destroy();
      this.themeManager = null;
    }
    
    // Очищаем карту компонентов
    this.components.clear();
    
    // Удаляем элементы управления
    if (this.controls && this.controls.container) {
      this.controls.container.innerHTML = '';
    }
    
    this.isInitialized = false;
    
    this.eventEmitter.emit('themeIntegration:destroyed');
    
    this.logger.info('ThemeIntegration: destroyed');
  }
}

module.exports = ThemeIntegration;
