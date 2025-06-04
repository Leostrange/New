/**
 * @file ThemeManager.js
 * @description Менеджер тем для приложения Mr.Comic, включая ночной режим
 * @module ui/ThemeManager
 */

/**
 * Класс для управления темами пользовательского интерфейса
 */
class ThemeManager {
  /**
   * Создает экземпляр менеджера тем
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.config - Конфигурация тем
   * @param {Object} options.storage - Хранилище настроек
   */
  constructor(options = {}) {
    this.eventEmitter = options.eventEmitter || {
      emit: () => {},
      on: () => {},
      off: () => {}
    };
    this.logger = options.logger || console;
    this.config = this.mergeConfig(options.config || {});
    this.storage = options.storage || {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {}
    };
    
    // Текущая тема
    this.currentTheme = null;
    
    // Доступные темы
    this.themes = new Map();
    
    // Флаги состояния
    this.isInitialized = false;
    this.isAutoModeEnabled = false;
    
    // Привязка методов к контексту
    this.handleSystemThemeChange = this.handleSystemThemeChange.bind(this);
    this.handleAutoModeChange = this.handleAutoModeChange.bind(this);
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
      defaultTheme: 'light',
      storageKey: 'mrcomic_theme',
      autoModeStorageKey: 'mrcomic_theme_auto_mode',
      
      // Настройки автоматического режима
      autoMode: {
        enabled: true,
        startDarkTime: '20:00', // Время начала темной темы (вечер)
        startLightTime: '07:00', // Время начала светлой темы (утро)
        checkInterval: 60000, // Интервал проверки времени (1 минута)
        respectSystemPreference: true // Учитывать системные настройки
      },
      
      // Настройки для отладки
      debug: false
    };
    
    return { ...defaultConfig, ...userConfig };
  }
  
  /**
   * Инициализирует менеджер тем
   * @returns {ThemeManager} Экземпляр менеджера тем
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('ThemeManager: already initialized');
      return this;
    }
    
    this.logger.info('ThemeManager: initializing');
    
    // Регистрируем стандартные темы
    this.registerDefaultThemes();
    
    // Добавляем обработчики событий
    this.addEventListeners();
    
    // Загружаем сохраненные настройки
    this.loadSettings();
    
    // Применяем начальную тему
    this.applyInitialTheme();
    
    this.isInitialized = true;
    this.eventEmitter.emit('themeManager:initialized');
    
    return this;
  }
  
  /**
   * Регистрирует стандартные темы
   * @private
   */
  registerDefaultThemes() {
    // Светлая тема (по умолчанию)
    this.registerTheme('light', {
      name: 'Светлая',
      isDark: false,
      colors: {
        // Основные цвета
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#e74c3c',
        
        // Цвета фона
        background: '#ffffff',
        backgroundAlt: '#f5f5f5',
        backgroundElevated: '#ffffff',
        
        // Цвета текста
        text: '#333333',
        textSecondary: '#666666',
        textMuted: '#999999',
        textInverse: '#ffffff',
        
        // Цвета границ
        border: '#dddddd',
        borderLight: '#eeeeee',
        borderDark: '#cccccc',
        
        // Цвета состояний
        success: '#2ecc71',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db',
        
        // Цвета компонентов
        card: '#ffffff',
        toolbar: '#ffffff',
        sidebar: '#f5f5f5',
        modal: '#ffffff',
        tooltip: '#333333',
        
        // Цвета кнопок
        buttonPrimary: '#3498db',
        buttonSecondary: '#95a5a6',
        buttonDanger: '#e74c3c',
        buttonSuccess: '#2ecc71',
        
        // Цвета для комиксов
        comicBackground: '#ffffff',
        comicPanel: '#f9f9f9',
        comicBorder: '#dddddd',
        comicText: '#333333',
        comicBubble: '#ffffff',
        
        // Цвета для редактора
        editorBackground: '#ffffff',
        editorToolbar: '#f5f5f5',
        editorSelection: 'rgba(52, 152, 219, 0.3)',
        editorCursor: '#3498db',
        editorGrid: 'rgba(0, 0, 0, 0.1)'
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'Consolas, monospace',
        comic: 'Comic Sans MS, cursive'
      },
      shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.12)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.1)',
        large: '0 10px 20px rgba(0, 0, 0, 0.08)'
      },
      transitions: {
        fast: '0.15s ease',
        normal: '0.3s ease',
        slow: '0.5s ease'
      },
      borderRadius: {
        small: '3px',
        medium: '5px',
        large: '10px',
        round: '50%'
      }
    });
    
    // Темная тема (ночной режим)
    this.registerTheme('dark', {
      name: 'Темная',
      isDark: true,
      colors: {
        // Основные цвета
        primary: '#3498db',
        secondary: '#2ecc71',
        accent: '#e74c3c',
        
        // Цвета фона
        background: '#121212',
        backgroundAlt: '#1e1e1e',
        backgroundElevated: '#2d2d2d',
        
        // Цвета текста
        text: '#f5f5f5',
        textSecondary: '#cccccc',
        textMuted: '#999999',
        textInverse: '#333333',
        
        // Цвета границ
        border: '#444444',
        borderLight: '#555555',
        borderDark: '#333333',
        
        // Цвета состояний
        success: '#2ecc71',
        warning: '#f39c12',
        error: '#e74c3c',
        info: '#3498db',
        
        // Цвета компонентов
        card: '#2d2d2d',
        toolbar: '#1e1e1e',
        sidebar: '#1e1e1e',
        modal: '#2d2d2d',
        tooltip: '#f5f5f5',
        
        // Цвета кнопок
        buttonPrimary: '#3498db',
        buttonSecondary: '#95a5a6',
        buttonDanger: '#e74c3c',
        buttonSuccess: '#2ecc71',
        
        // Цвета для комиксов
        comicBackground: '#121212',
        comicPanel: '#1e1e1e',
        comicBorder: '#444444',
        comicText: '#f5f5f5',
        comicBubble: '#2d2d2d',
        
        // Цвета для редактора
        editorBackground: '#1e1e1e',
        editorToolbar: '#2d2d2d',
        editorSelection: 'rgba(52, 152, 219, 0.5)',
        editorCursor: '#3498db',
        editorGrid: 'rgba(255, 255, 255, 0.1)'
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'Consolas, monospace',
        comic: 'Comic Sans MS, cursive'
      },
      shadows: {
        small: '0 1px 3px rgba(0, 0, 0, 0.3)',
        medium: '0 4px 6px rgba(0, 0, 0, 0.25)',
        large: '0 10px 20px rgba(0, 0, 0, 0.2)'
      },
      transitions: {
        fast: '0.15s ease',
        normal: '0.3s ease',
        slow: '0.5s ease'
      },
      borderRadius: {
        small: '3px',
        medium: '5px',
        large: '10px',
        round: '50%'
      }
    });
    
    // Высококонтрастная тема
    this.registerTheme('high-contrast', {
      name: 'Высокий контраст',
      isDark: true,
      colors: {
        // Основные цвета
        primary: '#ffff00',
        secondary: '#00ff00',
        accent: '#ff0000',
        
        // Цвета фона
        background: '#000000',
        backgroundAlt: '#0a0a0a',
        backgroundElevated: '#1a1a1a',
        
        // Цвета текста
        text: '#ffffff',
        textSecondary: '#ffffff',
        textMuted: '#cccccc',
        textInverse: '#000000',
        
        // Цвета границ
        border: '#ffffff',
        borderLight: '#cccccc',
        borderDark: '#ffffff',
        
        // Цвета состояний
        success: '#00ff00',
        warning: '#ffff00',
        error: '#ff0000',
        info: '#00ffff',
        
        // Цвета компонентов
        card: '#000000',
        toolbar: '#000000',
        sidebar: '#000000',
        modal: '#000000',
        tooltip: '#ffffff',
        
        // Цвета кнопок
        buttonPrimary: '#ffff00',
        buttonSecondary: '#cccccc',
        buttonDanger: '#ff0000',
        buttonSuccess: '#00ff00',
        
        // Цвета для комиксов
        comicBackground: '#000000',
        comicPanel: '#0a0a0a',
        comicBorder: '#ffffff',
        comicText: '#ffffff',
        comicBubble: '#1a1a1a',
        
        // Цвета для редактора
        editorBackground: '#000000',
        editorToolbar: '#1a1a1a',
        editorSelection: 'rgba(255, 255, 0, 0.5)',
        editorCursor: '#ffff00',
        editorGrid: 'rgba(255, 255, 255, 0.3)'
      },
      fonts: {
        primary: 'Arial, sans-serif',
        secondary: 'Georgia, serif',
        monospace: 'Consolas, monospace',
        comic: 'Comic Sans MS, cursive'
      },
      shadows: {
        small: '0 0 0 1px #ffffff',
        medium: '0 0 0 2px #ffffff',
        large: '0 0 0 3px #ffffff'
      },
      transitions: {
        fast: '0.15s ease',
        normal: '0.3s ease',
        slow: '0.5s ease'
      },
      borderRadius: {
        small: '0',
        medium: '0',
        large: '0',
        round: '50%'
      }
    });
    
    // Сепия (для чтения)
    this.registerTheme('sepia', {
      name: 'Сепия',
      isDark: false,
      colors: {
        // Основные цвета
        primary: '#8b4513',
        secondary: '#a0522d',
        accent: '#cd853f',
        
        // Цвета фона
        background: '#f5f5dc',
        backgroundAlt: '#ebe6d5',
        backgroundElevated: '#f8f4e3',
        
        // Цвета текста
        text: '#5d4037',
        textSecondary: '#795548',
        textMuted: '#a1887f',
        textInverse: '#f5f5dc',
        
        // Цвета границ
        border: '#d7ceb2',
        borderLight: '#e8e0cb',
        borderDark: '#c2b280',
        
        // Цвета состояний
        success: '#2e7d32',
        warning: '#ff8f00',
        error: '#c62828',
        info: '#1565c0',
        
        // Цвета компонентов
        card: '#f8f4e3',
        toolbar: '#ebe6d5',
        sidebar: '#ebe6d5',
        modal: '#f8f4e3',
        tooltip: '#5d4037',
        
        // Цвета кнопок
        buttonPrimary: '#8b4513',
        buttonSecondary: '#a1887f',
        buttonDanger: '#c62828',
        buttonSuccess: '#2e7d32',
        
        // Цвета для комиксов
        comicBackground: '#f5f5dc',
        comicPanel: '#f8f4e3',
        comicBorder: '#d7ceb2',
        comicText: '#5d4037',
        comicBubble: '#f8f4e3',
        
        // Цвета для редактора
        editorBackground: '#f5f5dc',
        editorToolbar: '#ebe6d5',
        editorSelection: 'rgba(139, 69, 19, 0.3)',
        editorCursor: '#8b4513',
        editorGrid: 'rgba(139, 69, 19, 0.1)'
      },
      fonts: {
        primary: 'Georgia, serif',
        secondary: 'Times New Roman, serif',
        monospace: 'Consolas, monospace',
        comic: 'Comic Sans MS, cursive'
      },
      shadows: {
        small: '0 1px 3px rgba(139, 69, 19, 0.12)',
        medium: '0 4px 6px rgba(139, 69, 19, 0.1)',
        large: '0 10px 20px rgba(139, 69, 19, 0.08)'
      },
      transitions: {
        fast: '0.15s ease',
        normal: '0.3s ease',
        slow: '0.5s ease'
      },
      borderRadius: {
        small: '3px',
        medium: '5px',
        large: '10px',
        round: '50%'
      }
    });
    
    // E-Ink тема (для устройств с электронными чернилами)
    this.registerTheme('e-ink', {
      name: 'E-Ink',
      isDark: false,
      colors: {
        // Основные цвета
        primary: '#000000',
        secondary: '#333333',
        accent: '#666666',
        
        // Цвета фона
        background: '#ffffff',
        backgroundAlt: '#f8f8f8',
        backgroundElevated: '#ffffff',
        
        // Цвета текста
        text: '#000000',
        textSecondary: '#333333',
        textMuted: '#666666',
        textInverse: '#ffffff',
        
        // Цвета границ
        border: '#cccccc',
        borderLight: '#eeeeee',
        borderDark: '#999999',
        
        // Цвета состояний
        success: '#000000',
        warning: '#333333',
        error: '#000000',
        info: '#333333',
        
        // Цвета компонентов
        card: '#ffffff',
        toolbar: '#f8f8f8',
        sidebar: '#f8f8f8',
        modal: '#ffffff',
        tooltip: '#000000',
        
        // Цвета кнопок
        buttonPrimary: '#000000',
        buttonSecondary: '#666666',
        buttonDanger: '#000000',
        buttonSuccess: '#000000',
        
        // Цвета для комиксов
        comicBackground: '#ffffff',
        comicPanel: '#ffffff',
        comicBorder: '#cccccc',
        comicText: '#000000',
        comicBubble: '#ffffff',
        
        // Цвета для редактора
        editorBackground: '#ffffff',
        editorToolbar: '#f8f8f8',
        editorSelection: 'rgba(0, 0, 0, 0.1)',
        editorCursor: '#000000',
        editorGrid: 'rgba(0, 0, 0, 0.1)'
      },
      fonts: {
        primary: 'Georgia, serif',
        secondary: 'Arial, sans-serif',
        monospace: 'Consolas, monospace',
        comic: 'Comic Sans MS, cursive'
      },
      shadows: {
        small: 'none',
        medium: 'none',
        large: 'none'
      },
      transitions: {
        fast: 'none',
        normal: 'none',
        slow: 'none'
      },
      borderRadius: {
        small: '0',
        medium: '0',
        large: '0',
        round: '50%'
      }
    });
  }
  
  /**
   * Добавляет обработчики событий
   * @private
   */
  addEventListeners() {
    // Обработчик изменения системной темы
    if (window.matchMedia) {
      this.systemDarkModeMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      
      if (this.systemDarkModeMediaQuery.addEventListener) {
        this.systemDarkModeMediaQuery.addEventListener('change', this.handleSystemThemeChange);
      } else if (this.systemDarkModeMediaQuery.addListener) {
        // Для старых браузеров
        this.systemDarkModeMediaQuery.addListener(this.handleSystemThemeChange);
      }
    }
  }
  
  /**
   * Удаляет обработчики событий
   * @private
   */
  removeEventListeners() {
    if (this.systemDarkModeMediaQuery) {
      if (this.systemDarkModeMediaQuery.removeEventListener) {
        this.systemDarkModeMediaQuery.removeEventListener('change', this.handleSystemThemeChange);
      } else if (this.systemDarkModeMediaQuery.removeListener) {
        // Для старых браузеров
        this.systemDarkModeMediaQuery.removeListener(this.handleSystemThemeChange);
      }
    }
    
    if (this.autoModeInterval) {
      clearInterval(this.autoModeInterval);
      this.autoModeInterval = null;
    }
  }
  
  /**
   * Обработчик изменения системной темы
   * @param {MediaQueryListEvent|MediaQueryList} event - Событие или объект медиа-запроса
   * @private
   */
  handleSystemThemeChange(event) {
    const isDarkMode = event.matches;
    
    this.logger.info(`ThemeManager: system theme changed to ${isDarkMode ? 'dark' : 'light'}`);
    
    // Если включен автоматический режим и учет системных настроек
    if (this.isAutoModeEnabled && this.config.autoMode.respectSystemPreference) {
      this.setTheme(isDarkMode ? 'dark' : 'light');
    }
  }
  
  /**
   * Обработчик изменения автоматического режима
   * @private
   */
  handleAutoModeChange() {
    // Проверяем текущее время и выбираем соответствующую тему
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`;
    
    const startDarkTime = this.config.autoMode.startDarkTime;
    const startLightTime = this.config.autoMode.startLightTime;
    
    // Преобразуем время в минуты для сравнения
    const currentTimeMinutes = currentHour * 60 + currentMinute;
    const startDarkTimeMinutes = parseInt(startDarkTime.split(':')[0]) * 60 + parseInt(startDarkTime.split(':')[1]);
    const startLightTimeMinutes = parseInt(startLightTime.split(':')[0]) * 60 + parseInt(startLightTime.split(':')[1]);
    
    let shouldBeDark = false;
    
    // Если время начала темной темы меньше времени начала светлой темы
    // (например, темная: 20:00, светлая: 07:00)
    if (startDarkTimeMinutes < startLightTimeMinutes) {
      shouldBeDark = currentTimeMinutes >= startDarkTimeMinutes || currentTimeMinutes < startLightTimeMinutes;
    } else {
      // Если время начала темной темы больше времени начала светлой темы
      // (например, темная: 20:00, светлая: 07:00 следующего дня)
      shouldBeDark = currentTimeMinutes >= startDarkTimeMinutes && currentTimeMinutes < startLightTimeMinutes;
    }
    
    // Если включен учет системных настроек, проверяем их
    if (this.config.autoMode.respectSystemPreference && this.systemDarkModeMediaQuery) {
      const systemPrefersDark = this.systemDarkModeMediaQuery.matches;
      shouldBeDark = systemPrefersDark;
    }
    
    // Устанавливаем соответствующую тему
    this.setTheme(shouldBeDark ? 'dark' : 'light');
  }
  
  /**
   * Загружает сохраненные настройки
   * @private
   */
  loadSettings() {
    // Загружаем сохраненную тему
    const savedTheme = this.storage.getItem(this.config.storageKey);
    
    // Загружаем состояние автоматического режима
    const savedAutoMode = this.storage.getItem(this.config.autoModeStorageKey);
    
    if (savedAutoMode !== null) {
      this.isAutoModeEnabled = savedAutoMode === 'true';
    } else {
      this.isAutoModeEnabled = this.config.autoMode.enabled;
    }
    
    // Если включен автоматический режим, запускаем его
    if (this.isAutoModeEnabled) {
      this.startAutoMode();
    }
    
    // Возвращаем сохраненную тему или тему по умолчанию
    return savedTheme || this.config.defaultTheme;
  }
  
  /**
   * Сохраняет настройки
   * @param {string} theme - Название темы
   * @param {boolean} autoMode - Состояние автоматического режима
   * @private
   */
  saveSettings(theme, autoMode) {
    // Сохраняем тему
    if (theme) {
      this.storage.setItem(this.config.storageKey, theme);
    }
    
    // Сохраняем состояние автоматического режима
    if (autoMode !== undefined) {
      this.storage.setItem(this.config.autoModeStorageKey, autoMode.toString());
    }
  }
  
  /**
   * Применяет начальную тему
   * @private
   */
  applyInitialTheme() {
    // Если включен автоматический режим, применяем тему на основе времени или системных настроек
    if (this.isAutoModeEnabled) {
      this.handleAutoModeChange();
    } else {
      // Иначе применяем сохраненную тему или тему по умолчанию
      const initialTheme = this.loadSettings();
      this.setTheme(initialTheme);
    }
  }
  
  /**
   * Запускает автоматический режим
   * @returns {ThemeManager} Экземпляр менеджера тем
   */
  startAutoMode() {
    this.isAutoModeEnabled = true;
    
    // Сохраняем состояние автоматического режима
    this.saveSettings(null, true);
    
    // Применяем тему на основе времени или системных настроек
    this.handleAutoModeChange();
    
    // Запускаем интервал для проверки времени
    if (this.autoModeInterval) {
      clearInterval(this.autoModeInterval);
    }
    
    this.autoModeInterval = setInterval(() => {
      this.handleAutoModeChange();
    }, this.config.autoMode.checkInterval);
    
    this.logger.info('ThemeManager: auto mode started');
    this.eventEmitter.emit('themeManager:autoModeChanged', { enabled: true });
    
    return this;
  }
  
  /**
   * Останавливает автоматический режим
   * @returns {ThemeManager} Экземпляр менеджера тем
   */
  stopAutoMode() {
    this.isAutoModeEnabled = false;
    
    // Сохраняем состояние автоматического режима
    this.saveSettings(null, false);
    
    // Останавливаем интервал
    if (this.autoModeInterval) {
      clearInterval(this.autoModeInterval);
      this.autoModeInterval = null;
    }
    
    this.logger.info('ThemeManager: auto mode stopped');
    this.eventEmitter.emit('themeManager:autoModeChanged', { enabled: false });
    
    return this;
  }
  
  /**
   * Регистрирует тему
   * @param {string} id - Идентификатор темы
   * @param {Object} theme - Параметры темы
   * @returns {ThemeManager} Экземпляр менеджера тем
   */
  registerTheme(id, theme) {
    this.themes.set(id, theme);
    
    this.logger.debug(`ThemeManager: registered theme "${id}"`);
    
    return this;
  }
  
  /**
   * Получает тему по идентификатору
   * @param {string} id - Идентификатор темы
   * @returns {Object|null} Параметры темы или null, если тема не найдена
   */
  getTheme(id) {
    return this.themes.get(id) || null;
  }
  
  /**
   * Получает текущую тему
   * @returns {Object|null} Параметры текущей темы или null, если тема не установлена
   */
  getCurrentTheme() {
    if (!this.currentTheme) {
      return null;
    }
    
    return this.getTheme(this.currentTheme);
  }
  
  /**
   * Получает идентификатор текущей темы
   * @returns {string|null} Идентификатор текущей темы или null, если тема не установлена
   */
  getCurrentThemeId() {
    return this.currentTheme;
  }
  
  /**
   * Проверяет, является ли текущая тема темной
   * @returns {boolean} true, если текущая тема темная
   */
  isDarkTheme() {
    const theme = this.getCurrentTheme();
    return theme ? theme.isDark : false;
  }
  
  /**
   * Устанавливает тему
   * @param {string} id - Идентификатор темы
   * @returns {boolean} true, если тема была установлена
   */
  setTheme(id) {
    if (!this.isInitialized) {
      this.logger.warn('ThemeManager: not initialized');
      return false;
    }
    
    const theme = this.getTheme(id);
    
    if (!theme) {
      this.logger.error(`ThemeManager: theme "${id}" not found`);
      return false;
    }
    
    // Если тема уже установлена, ничего не делаем
    if (this.currentTheme === id) {
      return true;
    }
    
    // Сохраняем идентификатор текущей темы
    this.currentTheme = id;
    
    // Сохраняем настройки
    this.saveSettings(id);
    
    // Применяем тему
    this.applyTheme(theme);
    
    this.logger.info(`ThemeManager: theme set to "${id}"`);
    this.eventEmitter.emit('themeManager:themeChanged', { id, theme });
    
    return true;
  }
  
  /**
   * Переключает между светлой и темной темами
   * @returns {boolean} true, если тема была переключена
   */
  toggleTheme() {
    if (!this.isInitialized) {
      this.logger.warn('ThemeManager: not initialized');
      return false;
    }
    
    // Если включен автоматический режим, отключаем его
    if (this.isAutoModeEnabled) {
      this.stopAutoMode();
    }
    
    // Переключаем между светлой и темной темами
    const isDark = this.isDarkTheme();
    return this.setTheme(isDark ? 'light' : 'dark');
  }
  
  /**
   * Применяет тему
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyTheme(theme) {
    // Применяем CSS-переменные
    this.applyCSSVariables(theme);
    
    // Применяем класс темы к корневому элементу
    this.applyThemeClass(theme);
    
    // Применяем мета-тег для цвета темы в мобильных браузерах
    this.applyMetaThemeColor(theme);
  }
  
  /**
   * Применяет CSS-переменные
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyCSSVariables(theme) {
    const root = document.documentElement;
    
    // Применяем цвета
    for (const [key, value] of Object.entries(theme.colors)) {
      root.style.setProperty(`--color-${key}`, value);
    }
    
    // Применяем шрифты
    for (const [key, value] of Object.entries(theme.fonts)) {
      root.style.setProperty(`--font-${key}`, value);
    }
    
    // Применяем тени
    for (const [key, value] of Object.entries(theme.shadows)) {
      root.style.setProperty(`--shadow-${key}`, value);
    }
    
    // Применяем переходы
    for (const [key, value] of Object.entries(theme.transitions)) {
      root.style.setProperty(`--transition-${key}`, value);
    }
    
    // Применяем радиусы границ
    for (const [key, value] of Object.entries(theme.borderRadius)) {
      root.style.setProperty(`--border-radius-${key}`, value);
    }
  }
  
  /**
   * Применяет класс темы к корневому элементу
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyThemeClass(theme) {
    const root = document.documentElement;
    
    // Удаляем все классы тем
    for (const [id] of this.themes) {
      root.classList.remove(`theme-${id}`);
    }
    
    // Добавляем класс текущей темы
    root.classList.add(`theme-${this.currentTheme}`);
    
    // Добавляем или удаляем класс темной темы
    if (theme.isDark) {
      root.classList.add('theme-dark');
      root.classList.remove('theme-light');
    } else {
      root.classList.add('theme-light');
      root.classList.remove('theme-dark');
    }
  }
  
  /**
   * Применяет мета-тег для цвета темы в мобильных браузерах
   * @param {Object} theme - Параметры темы
   * @private
   */
  applyMetaThemeColor(theme) {
    // Находим или создаем мета-тег
    let metaThemeColor = document.querySelector('meta[name="theme-color"]');
    
    if (!metaThemeColor) {
      metaThemeColor = document.createElement('meta');
      metaThemeColor.name = 'theme-color';
      document.head.appendChild(metaThemeColor);
    }
    
    // Устанавливаем цвет темы
    metaThemeColor.content = theme.isDark ? theme.colors.backgroundElevated : theme.colors.primary;
  }
  
  /**
   * Получает список доступных тем
   * @returns {Array} Массив объектов с информацией о темах
   */
  getAvailableThemes() {
    const themes = [];
    
    for (const [id, theme] of this.themes) {
      themes.push({
        id,
        name: theme.name,
        isDark: theme.isDark
      });
    }
    
    return themes;
  }
  
  /**
   * Получает состояние автоматического режима
   * @returns {boolean} true, если автоматический режим включен
   */
  isAutoMode() {
    return this.isAutoModeEnabled;
  }
  
  /**
   * Включает или отключает автоматический режим
   * @param {boolean} enabled - Флаг включения
   * @returns {ThemeManager} Экземпляр менеджера тем
   */
  setAutoMode(enabled) {
    if (enabled) {
      this.startAutoMode();
    } else {
      this.stopAutoMode();
    }
    
    return this;
  }
  
  /**
   * Обновляет конфигурацию менеджера тем
   * @param {Object} config - Новая конфигурация
   * @returns {ThemeManager} Экземпляр менеджера тем
   */
  updateConfig(config) {
    this.config = this.mergeConfig(config);
    
    // Если изменились параметры автоматического режима и он включен,
    // перезапускаем его с новыми параметрами
    if (this.isAutoModeEnabled) {
      this.stopAutoMode();
      this.startAutoMode();
    }
    
    this.logger.info('ThemeManager: config updated');
    this.eventEmitter.emit('themeManager:configUpdated', { config: { ...this.config } });
    
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
   * Уничтожает менеджер тем и освобождает ресурсы
   */
  destroy() {
    this.logger.info('ThemeManager: destroying');
    
    // Удаляем обработчики событий
    this.removeEventListeners();
    
    // Очищаем карту тем
    this.themes.clear();
    
    this.isInitialized = false;
    
    this.eventEmitter.emit('themeManager:destroyed');
    
    this.logger.info('ThemeManager: destroyed');
  }
}

module.exports = ThemeManager;
