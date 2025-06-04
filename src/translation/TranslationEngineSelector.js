/**
 * @file TranslationEngineSelector.js
 * @description Компонент для выбора и настройки движков перевода
 * @module translation/TranslationEngineSelector
 */

/**
 * Класс для выбора и настройки движков перевода
 */
class TranslationEngineSelector {
  /**
   * Создает экземпляр селектора движков перевода
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
    
    // Доступные движки перевода
    this.availableEngines = this.config.availableEngines || [
      {
        id: 'google-translate',
        name: 'Google Translate',
        description: 'Популярный сервис машинного перевода от Google',
        version: '2.0',
        languages: ['en', 'ru', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'ar', 'hi', 'pt', 'nl'],
        settings: [
          {
            id: 'api-key',
            name: 'API ключ',
            type: 'password',
            default: ''
          },
          {
            id: 'source-language',
            name: 'Исходный язык',
            type: 'select',
            options: [
              { value: 'auto', label: 'Автоопределение' },
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'ar', label: 'Арабский' },
              { value: 'hi', label: 'Хинди' },
              { value: 'pt', label: 'Португальский' },
              { value: 'nl', label: 'Нидерландский' }
            ],
            default: 'auto'
          },
          {
            id: 'target-language',
            name: 'Целевой язык',
            type: 'select',
            options: [
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'ar', label: 'Арабский' },
              { value: 'hi', label: 'Хинди' },
              { value: 'pt', label: 'Португальский' },
              { value: 'nl', label: 'Нидерландский' }
            ],
            default: 'ru'
          },
          {
            id: 'model',
            name: 'Модель',
            type: 'select',
            options: [
              { value: 'nmt', label: 'Нейронный машинный перевод' },
              { value: 'base', label: 'Базовая модель' }
            ],
            default: 'nmt'
          },
          {
            id: 'format',
            name: 'Формат',
            type: 'select',
            options: [
              { value: 'text', label: 'Текст' },
              { value: 'html', label: 'HTML' }
            ],
            default: 'text'
          }
        ]
      },
      {
        id: 'microsoft-translator',
        name: 'Microsoft Translator',
        description: 'Сервис машинного перевода от Microsoft',
        version: '3.0',
        languages: ['en', 'ru', 'ja', 'zh-Hans', 'zh-Hant', 'ko', 'fr', 'de', 'es', 'it', 'ar', 'hi', 'pt', 'nl'],
        settings: [
          {
            id: 'subscription-key',
            name: 'Ключ подписки',
            type: 'password',
            default: ''
          },
          {
            id: 'endpoint',
            name: 'Конечная точка',
            type: 'text',
            default: 'https://api.cognitive.microsofttranslator.com/'
          },
          {
            id: 'region',
            name: 'Регион',
            type: 'text',
            default: 'global'
          },
          {
            id: 'source-language',
            name: 'Исходный язык',
            type: 'select',
            options: [
              { value: '', label: 'Автоопределение' },
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh-Hans', label: 'Китайский (упрощенный)' },
              { value: 'zh-Hant', label: 'Китайский (традиционный)' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'ar', label: 'Арабский' },
              { value: 'hi', label: 'Хинди' },
              { value: 'pt', label: 'Португальский' },
              { value: 'nl', label: 'Нидерландский' }
            ],
            default: ''
          },
          {
            id: 'target-language',
            name: 'Целевой язык',
            type: 'select',
            options: [
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh-Hans', label: 'Китайский (упрощенный)' },
              { value: 'zh-Hant', label: 'Китайский (традиционный)' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'ar', label: 'Арабский' },
              { value: 'hi', label: 'Хинди' },
              { value: 'pt', label: 'Португальский' },
              { value: 'nl', label: 'Нидерландский' }
            ],
            default: 'ru'
          },
          {
            id: 'text-type',
            name: 'Тип текста',
            type: 'select',
            options: [
              { value: 'plain', label: 'Обычный текст' },
              { value: 'html', label: 'HTML' }
            ],
            default: 'plain'
          },
          {
            id: 'profanity-action',
            name: 'Обработка нецензурной лексики',
            type: 'select',
            options: [
              { value: 'NoAction', label: 'Без обработки' },
              { value: 'Marked', label: 'Отмечать' },
              { value: 'Deleted', label: 'Удалять' }
            ],
            default: 'NoAction'
          }
        ]
      },
      {
        id: 'deepl',
        name: 'DeepL',
        description: 'Высококачественный сервис машинного перевода с поддержкой контекста',
        version: '2.0',
        languages: ['en', 'ru', 'ja', 'zh', 'fr', 'de', 'es', 'it', 'pt', 'nl', 'pl'],
        settings: [
          {
            id: 'auth-key',
            name: 'Ключ авторизации',
            type: 'password',
            default: ''
          },
          {
            id: 'source-language',
            name: 'Исходный язык',
            type: 'select',
            options: [
              { value: 'auto', label: 'Автоопределение' },
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'pt', label: 'Португальский' },
              { value: 'nl', label: 'Нидерландский' },
              { value: 'pl', label: 'Польский' }
            ],
            default: 'auto'
          },
          {
            id: 'target-language',
            name: 'Целевой язык',
            type: 'select',
            options: [
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'pt', label: 'Португальский' },
              { value: 'nl', label: 'Нидерландский' },
              { value: 'pl', label: 'Польский' }
            ],
            default: 'ru'
          },
          {
            id: 'formality',
            name: 'Формальность',
            type: 'select',
            options: [
              { value: 'default', label: 'По умолчанию' },
              { value: 'more', label: 'Формальный' },
              { value: 'less', label: 'Неформальный' }
            ],
            default: 'default'
          },
          {
            id: 'split-sentences',
            name: 'Разделение предложений',
            type: 'select',
            options: [
              { value: '0', label: 'Без разделения' },
              { value: '1', label: 'По знакам препинания' },
              { value: 'nonewlines', label: 'По знакам препинания, но не по переносам строк' }
            ],
            default: '1'
          },
          {
            id: 'preserve-formatting',
            name: 'Сохранять форматирование',
            type: 'checkbox',
            default: true
          }
        ]
      },
      {
        id: 'yandex-translate',
        name: 'Yandex Translate',
        description: 'Сервис машинного перевода от Яндекс',
        version: '2.0',
        languages: ['en', 'ru', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it', 'ar', 'tr', 'uk'],
        settings: [
          {
            id: 'api-key',
            name: 'API ключ',
            type: 'password',
            default: ''
          },
          {
            id: 'source-language',
            name: 'Исходный язык',
            type: 'select',
            options: [
              { value: 'auto', label: 'Автоопределение' },
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'ar', label: 'Арабский' },
              { value: 'tr', label: 'Турецкий' },
              { value: 'uk', label: 'Украинский' }
            ],
            default: 'auto'
          },
          {
            id: 'target-language',
            name: 'Целевой язык',
            type: 'select',
            options: [
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' },
              { value: 'ar', label: 'Арабский' },
              { value: 'tr', label: 'Турецкий' },
              { value: 'uk', label: 'Украинский' }
            ],
            default: 'ru'
          },
          {
            id: 'format',
            name: 'Формат',
            type: 'select',
            options: [
              { value: 'plain', label: 'Обычный текст' },
              { value: 'html', label: 'HTML' }
            ],
            default: 'plain'
          }
        ]
      },
      {
        id: 'manga-translator',
        name: 'MangaTranslator',
        description: 'Специализированный движок перевода для манги и комиксов',
        version: '1.2',
        languages: ['ja', 'en', 'zh', 'ko', 'ru'],
        settings: [
          {
            id: 'source-language',
            name: 'Исходный язык',
            type: 'select',
            options: [
              { value: 'ja', label: 'Японский' },
              { value: 'en', label: 'Английский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'ko', label: 'Корейский' }
            ],
            default: 'ja'
          },
          {
            id: 'target-language',
            name: 'Целевой язык',
            type: 'select',
            options: [
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' }
            ],
            default: 'ru'
          },
          {
            id: 'translation-style',
            name: 'Стиль перевода',
            type: 'select',
            options: [
              { value: 'literal', label: 'Дословный' },
              { value: 'natural', label: 'Естественный' },
              { value: 'localized', label: 'Локализованный' }
            ],
            default: 'natural'
          },
          {
            id: 'context-awareness',
            name: 'Учет контекста',
            type: 'checkbox',
            default: true
          },
          {
            id: 'preserve-honorifics',
            name: 'Сохранять японские обращения',
            type: 'checkbox',
            default: true
          },
          {
            id: 'glossary',
            name: 'Путь к глоссарию',
            type: 'file',
            default: ''
          }
        ]
      },
      {
        id: 'custom-translator',
        name: 'Пользовательский переводчик',
        description: 'Настраиваемый движок перевода с поддержкой пользовательских моделей',
        version: '1.0',
        languages: ['en', 'ru', 'ja', 'zh', 'ko', 'fr', 'de', 'es', 'it'],
        settings: [
          {
            id: 'model-path',
            name: 'Путь к модели',
            type: 'file',
            default: ''
          },
          {
            id: 'source-language',
            name: 'Исходный язык',
            type: 'select',
            options: [
              { value: 'auto', label: 'Автоопределение' },
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' }
            ],
            default: 'auto'
          },
          {
            id: 'target-language',
            name: 'Целевой язык',
            type: 'select',
            options: [
              { value: 'en', label: 'Английский' },
              { value: 'ru', label: 'Русский' },
              { value: 'ja', label: 'Японский' },
              { value: 'zh', label: 'Китайский' },
              { value: 'ko', label: 'Корейский' },
              { value: 'fr', label: 'Французский' },
              { value: 'de', label: 'Немецкий' },
              { value: 'es', label: 'Испанский' },
              { value: 'it', label: 'Итальянский' }
            ],
            default: 'ru'
          },
          {
            id: 'custom-params',
            name: 'Пользовательские параметры',
            type: 'textarea',
            default: '{}'
          }
        ]
      }
    ];
    
    // Текущий выбранный движок перевода
    this.currentEngineId = '';
    
    // Текущие настройки движков
    this.engineSettings = {};
    
    // Флаги состояния
    this.isInitialized = false;
    this.isRendered = false;
    
    // DOM элементы
    this.container = null;
    this.engineSelect = null;
    this.settingsContainer = null;
    this.saveButton = null;
    
    // Привязка методов к контексту
    this.handleEngineChange = this.handleEngineChange.bind(this);
    this.handleSettingChange = this.handleSettingChange.bind(this);
    this.handleSaveClick = this.handleSaveClick.bind(this);
  }
  
  /**
   * Инициализирует селектор движков перевода
   * @returns {TranslationEngineSelector} Экземпляр селектора
   */
  initialize() {
    if (this.isInitialized) {
      this.logger.warn('TranslationEngineSelector: already initialized');
      return this;
    }
    
    this.logger.info('TranslationEngineSelector: initializing');
    
    // Загружаем сохраненные настройки
    this.loadSettings();
    
    this.isInitialized = true;
    this.eventEmitter.emit('translationEngineSelector:initialized');
    
    return this;
  }
  
  /**
   * Загружает сохраненные настройки
   * @private
   */
  loadSettings() {
    try {
      // Загружаем ID текущего движка
      const savedEngineId = this.storage.getItem('translation_engine_id');
      if (savedEngineId && this.getEngineById(savedEngineId)) {
        this.currentEngineId = savedEngineId;
      } else {
        // Если сохраненного движка нет или он недоступен, используем первый доступный
        this.currentEngineId = this.availableEngines.length > 0 ? this.availableEngines[0].id : '';
      }
      
      // Загружаем настройки движков
      const savedSettings = this.storage.getItem('translation_engine_settings');
      if (savedSettings) {
        this.engineSettings = JSON.parse(savedSettings);
      } else {
        // Если настроек нет, инициализируем значениями по умолчанию
        this.initializeDefaultSettings();
      }
      
      this.logger.debug('TranslationEngineSelector: settings loaded', {
        currentEngineId: this.currentEngineId,
        engineSettings: this.engineSettings
      });
    } catch (error) {
      this.logger.error('TranslationEngineSelector: error loading settings', error);
      
      // В случае ошибки инициализируем значениями по умолчанию
      this.currentEngineId = this.availableEngines.length > 0 ? this.availableEngines[0].id : '';
      this.initializeDefaultSettings();
    }
  }
  
  /**
   * Инициализирует настройки движков значениями по умолчанию
   * @private
   */
  initializeDefaultSettings() {
    this.engineSettings = {};
    
    // Для каждого доступного движка создаем настройки по умолчанию
    for (const engine of this.availableEngines) {
      const engineSettings = {};
      
      // Для каждой настройки движка устанавливаем значение по умолчанию
      for (const setting of engine.settings) {
        engineSettings[setting.id] = setting.default;
      }
      
      this.engineSettings[engine.id] = engineSettings;
    }
  }
  
  /**
   * Сохраняет настройки
   * @private
   */
  saveSettings() {
    try {
      this.storage.setItem('translation_engine_id', this.currentEngineId);
      this.storage.setItem('translation_engine_settings', JSON.stringify(this.engineSettings));
      
      this.logger.debug('TranslationEngineSelector: settings saved');
      
      // Отправляем событие об изменении настроек
      this.eventEmitter.emit('translationEngineSelector:settingsChanged', {
        engineId: this.currentEngineId,
        settings: this.getEngineSettings(this.currentEngineId)
      });
    } catch (error) {
      this.logger.error('TranslationEngineSelector: error saving settings', error);
    }
  }
  
  /**
   * Получает движок по ID
   * @param {string} id - ID движка
   * @returns {Object|null} Объект движка или null, если движок не найден
   * @private
   */
  getEngineById(id) {
    return this.availableEngines.find(engine => engine.id === id) || null;
  }
  
  /**
   * Получает настройки движка
   * @param {string} engineId - ID движка
   * @returns {Object} Настройки движка
   * @private
   */
  getEngineSettings(engineId) {
    return this.engineSettings[engineId] || {};
  }
  
  /**
   * Рендерит селектор движков перевода в указанный контейнер
   * @param {HTMLElement} container - Контейнер для рендеринга
   * @returns {TranslationEngineSelector} Экземпляр селектора
   */
  render(container) {
    if (!this.isInitialized) {
      this.logger.warn('TranslationEngineSelector: not initialized');
      return this;
    }
    
    if (!container) {
      this.logger.error('TranslationEngineSelector: container is required');
      return this;
    }
    
    this.container = container;
    
    // Очищаем контейнер
    this.container.innerHTML = '';
    
    // Создаем основной контейнер
    const selectorContainer = document.createElement('div');
    selectorContainer.className = 'translation-engine-selector';
    
    // Создаем заголовок
    const header = document.createElement('h3');
    header.textContent = 'Выбор движка перевода';
    selectorContainer.appendChild(header);
    
    // Создаем селектор движков
    const engineSelectContainer = document.createElement('div');
    engineSelectContainer.className = 'engine-select-container';
    
    const engineSelectLabel = document.createElement('label');
    engineSelectLabel.textContent = 'Движок перевода:';
    engineSelectLabel.htmlFor = 'translation-engine-select';
    engineSelectContainer.appendChild(engineSelectLabel);
    
    this.engineSelect = document.createElement('select');
    this.engineSelect.id = 'translation-engine-select';
    this.engineSelect.className = 'engine-select';
    
    // Добавляем опции для каждого доступного движка
    for (const engine of this.availableEngines) {
      const option = document.createElement('option');
      option.value = engine.id;
      option.textContent = engine.name;
      this.engineSelect.appendChild(option);
    }
    
    // Устанавливаем текущий выбранный движок
    this.engineSelect.value = this.currentEngineId;
    
    // Добавляем обработчик изменения движка
    this.engineSelect.addEventListener('change', this.handleEngineChange);
    
    engineSelectContainer.appendChild(this.engineSelect);
    selectorContainer.appendChild(engineSelectContainer);
    
    // Создаем контейнер для настроек
    this.settingsContainer = document.createElement('div');
    this.settingsContainer.className = 'engine-settings-container';
    selectorContainer.appendChild(this.settingsContainer);
    
    // Создаем кнопку сохранения
    const actionsContainer = document.createElement('div');
    actionsContainer.className = 'actions-container';
    
    this.saveButton = document.createElement('button');
    this.saveButton.className = 'save-button';
    this.saveButton.textContent = 'Сохранить настройки';
    this.saveButton.addEventListener('click', this.handleSaveClick);
    
    actionsContainer.appendChild(this.saveButton);
    selectorContainer.appendChild(actionsContainer);
    
    // Добавляем созданный контейнер в основной контейнер
    this.container.appendChild(selectorContainer);
    
    // Рендерим настройки текущего движка
    this.renderEngineSettings();
    
    this.isRendered = true;
    
    return this;
  }
  
  /**
   * Рендерит настройки текущего движка
   * @private
   */
  renderEngineSettings() {
    if (!this.settingsContainer) {
      return;
    }
    
    // Очищаем контейнер настроек
    this.settingsContainer.innerHTML = '';
    
    // Получаем текущий движок
    const currentEngine = this.getEngineById(this.currentEngineId);
    if (!currentEngine) {
      return;
    }
    
    // Создаем описание движка
    const engineDescription = document.createElement('div');
    engineDescription.className = 'engine-description';
    
    const descriptionText = document.createElement('p');
    descriptionText.textContent = currentEngine.description;
    engineDescription.appendChild(descriptionText);
    
    const versionText = document.createElement('p');
    versionText.className = 'engine-version';
    versionText.textContent = `Версия: ${currentEngine.version}`;
    engineDescription.appendChild(versionText);
    
    const languagesText = document.createElement('p');
    languagesText.className = 'engine-languages';
    languagesText.textContent = `Поддерживаемые языки: ${currentEngine.languages.join(', ')}`;
    engineDescription.appendChild(languagesText);
    
    this.settingsContainer.appendChild(engineDescription);
    
    // Создаем форму настроек
    const settingsForm = document.createElement('form');
    settingsForm.className = 'settings-form';
    
    // Получаем текущие настройки движка
    const currentSettings = this.getEngineSettings(currentEngine.id);
    
    // Для каждой настройки создаем элемент формы
    for (const setting of currentEngine.settings) {
      const settingContainer = document.createElement('div');
      settingContainer.className = 'setting-container';
      
      const settingLabel = document.createElement('label');
      settingLabel.textContent = setting.name;
      settingLabel.htmlFor = `setting-${setting.id}`;
      settingContainer.appendChild(settingLabel);
      
      let settingInput;
      
      // В зависимости от типа настройки создаем соответствующий элемент формы
      switch (setting.type) {
        case 'text':
        case 'password':
          settingInput = document.createElement('input');
          settingInput.type = setting.type;
          settingInput.id = `setting-${setting.id}`;
          settingInput.value = currentSettings[setting.id] || setting.default;
          break;
          
        case 'number':
        case 'range':
          settingInput = document.createElement('input');
          settingInput.type = setting.type;
          settingInput.id = `setting-${setting.id}`;
          settingInput.min = setting.min;
          settingInput.max = setting.max;
          settingInput.step = setting.step;
          settingInput.value = currentSettings[setting.id] || setting.default;
          break;
          
        case 'checkbox':
          settingInput = document.createElement('input');
          settingInput.type = 'checkbox';
          settingInput.id = `setting-${setting.id}`;
          settingInput.checked = currentSettings[setting.id] || setting.default;
          break;
          
        case 'select':
          settingInput = document.createElement('select');
          settingInput.id = `setting-${setting.id}`;
          
          for (const option of setting.options) {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            settingInput.appendChild(optionElement);
          }
          
          settingInput.value = currentSettings[setting.id] || setting.default;
          break;
          
        case 'multiselect':
          settingInput = document.createElement('select');
          settingInput.id = `setting-${setting.id}`;
          settingInput.multiple = true;
          
          for (const option of setting.options) {
            const optionElement = document.createElement('option');
            optionElement.value = option.value;
            optionElement.textContent = option.label;
            
            // Проверяем, выбрана ли опция
            const selectedValues = currentSettings[setting.id] || setting.default;
            if (Array.isArray(selectedValues) && selectedValues.includes(option.value)) {
              optionElement.selected = true;
            }
            
            settingInput.appendChild(optionElement);
          }
          break;
          
        case 'textarea':
          settingInput = document.createElement('textarea');
          settingInput.id = `setting-${setting.id}`;
          settingInput.value = currentSettings[setting.id] || setting.default;
          break;
          
        case 'file':
          settingInput = document.createElement('input');
          settingInput.type = 'file';
          settingInput.id = `setting-${setting.id}`;
          
          // Для файлов мы не можем установить значение из соображений безопасности
          // Вместо этого добавляем текстовое поле для отображения текущего пути
          const filePathDisplay = document.createElement('div');
          filePathDisplay.className = 'file-path-display';
          filePathDisplay.textContent = currentSettings[setting.id] || 'Файл не выбран';
          settingContainer.appendChild(filePathDisplay);
          break;
          
        default:
          settingInput = document.createElement('input');
          settingInput.type = 'text';
          settingInput.id = `setting-${setting.id}`;
          settingInput.value = currentSettings[setting.id] || setting.default;
      }
      
      // Добавляем атрибуты и классы
      settingInput.className = `setting-input setting-type-${setting.type}`;
      settingInput.dataset.settingId = setting.id;
      
      // Добавляем обработчик изменения настройки
      settingInput.addEventListener('change', (event) => {
        this.handleSettingChange(event, setting);
      });
      
      settingContainer.appendChild(settingInput);
      
      // Если есть описание настройки, добавляем его
      if (setting.description) {
        const settingDescription = document.createElement('div');
        settingDescription.className = 'setting-description';
        settingDescription.textContent = setting.description;
        settingContainer.appendChild(settingDescription);
      }
      
      settingsForm.appendChild(settingContainer);
    }
    
    this.settingsContainer.appendChild(settingsForm);
  }
  
  /**
   * Обработчик изменения движка
   * @param {Event} event - Событие изменения
   * @private
   */
  handleEngineChange(event) {
    const newEngineId = event.target.value;
    
    if (newEngineId !== this.currentEngineId) {
      this.currentEngineId = newEngineId;
      
      // Перерендериваем настройки для нового движка
      this.renderEngineSettings();
      
      this.logger.debug(`TranslationEngineSelector: engine changed to ${newEngineId}`);
    }
  }
  
  /**
   * Обработчик изменения настройки
   * @param {Event} event - Событие изменения
   * @param {Object} setting - Объект настройки
   * @private
   */
  handleSettingChange(event, setting) {
    const settingId = setting.id;
    let value;
    
    // В зависимости от типа настройки получаем значение
    switch (setting.type) {
      case 'checkbox':
        value = event.target.checked;
        break;
        
      case 'multiselect':
        value = Array.from(event.target.selectedOptions).map(option => option.value);
        break;
        
      case 'file':
        // Для файлов сохраняем только путь
        value = event.target.files.length > 0 ? event.target.files[0].name : '';
        
        // Обновляем отображение пути к файлу
        const filePathDisplay = event.target.parentElement.querySelector('.file-path-display');
        if (filePathDisplay) {
          filePathDisplay.textContent = value || 'Файл не выбран';
        }
        break;
        
      case 'number':
      case 'range':
        value = parseFloat(event.target.value);
        break;
        
      default:
        value = event.target.value;
    }
    
    // Обновляем настройки
    if (!this.engineSettings[this.currentEngineId]) {
      this.engineSettings[this.currentEngineId] = {};
    }
    
    this.engineSettings[this.currentEngineId][settingId] = value;
    
    this.logger.debug(`TranslationEngineSelector: setting ${settingId} changed to ${value}`);
  }
  
  /**
   * Обработчик нажатия на кнопку сохранения
   * @private
   */
  handleSaveClick() {
    // Сохраняем настройки
    this.saveSettings();
    
    // Отображаем уведомление об успешном сохранении
    this.showNotification('Настройки успешно сохранены');
  }
  
  /**
   * Отображает уведомление
   * @param {string} message - Сообщение уведомления
   * @private
   */
  showNotification(message) {
    // Проверяем, существует ли уже уведомление
    let notification = document.querySelector('.translation-engine-notification');
    
    if (!notification) {
      // Создаем новое уведомление
      notification = document.createElement('div');
      notification.className = 'translation-engine-notification';
      document.body.appendChild(notification);
    }
    
    // Устанавливаем сообщение
    notification.textContent = message;
    
    // Показываем уведомление
    notification.classList.add('show');
    
    // Скрываем уведомление через 3 секунды
    setTimeout(() => {
      notification.classList.remove('show');
    }, 3000);
  }
  
  /**
   * Получает текущий выбранный движок перевода
   * @returns {Object} Объект с информацией о текущем движке и его настройках
   */
  getCurrentEngine() {
    const engineId = this.currentEngineId;
    const engine = this.getEngineById(engineId);
    const settings = this.getEngineSettings(engineId);
    
    return {
      id: engineId,
      name: engine ? engine.name : '',
      settings
    };
  }
  
  /**
   * Устанавливает текущий движок перевода
   * @param {string} engineId - ID движка
   * @returns {boolean} true, если движок успешно установлен
   */
  setCurrentEngine(engineId) {
    const engine = this.getEngineById(engineId);
    
    if (!engine) {
      this.logger.error(`TranslationEngineSelector: engine with id ${engineId} not found`);
      return false;
    }
    
    this.currentEngineId = engineId;
    
    // Если селектор отрендерен, обновляем его
    if (this.isRendered && this.engineSelect) {
      this.engineSelect.value = engineId;
      this.renderEngineSettings();
    }
    
    // Сохраняем настройки
    this.saveSettings();
    
    return true;
  }
  
  /**
   * Обновляет настройки движка
   * @param {string} engineId - ID движка
   * @param {Object} settings - Новые настройки
   * @returns {boolean} true, если настройки успешно обновлены
   */
  updateEngineSettings(engineId, settings) {
    const engine = this.getEngineById(engineId);
    
    if (!engine) {
      this.logger.error(`TranslationEngineSelector: engine with id ${engineId} not found`);
      return false;
    }
    
    // Обновляем настройки
    this.engineSettings[engineId] = { ...this.engineSettings[engineId], ...settings };
    
    // Если селектор отрендерен и текущий движок - это обновляемый движок, перерендериваем настройки
    if (this.isRendered && this.currentEngineId === engineId) {
      this.renderEngineSettings();
    }
    
    // Сохраняем настройки
    this.saveSettings();
    
    return true;
  }
  
  /**
   * Добавляет новый движок перевода
   * @param {Object} engine - Объект с информацией о движке
   * @returns {boolean} true, если движок успешно добавлен
   */
  addEngine(engine) {
    // Проверяем, что у движка есть все необходимые поля
    if (!engine.id || !engine.name || !engine.settings) {
      this.logger.error('TranslationEngineSelector: invalid engine object');
      return false;
    }
    
    // Проверяем, что движок с таким ID еще не существует
    if (this.getEngineById(engine.id)) {
      this.logger.error(`TranslationEngineSelector: engine with id ${engine.id} already exists`);
      return false;
    }
    
    // Добавляем движок в список доступных
    this.availableEngines.push(engine);
    
    // Инициализируем настройки движка значениями по умолчанию
    const engineSettings = {};
    for (const setting of engine.settings) {
      engineSettings[setting.id] = setting.default;
    }
    this.engineSettings[engine.id] = engineSettings;
    
    // Если селектор отрендерен, обновляем его
    if (this.isRendered && this.engineSelect) {
      const option = document.createElement('option');
      option.value = engine.id;
      option.textContent = engine.name;
      this.engineSelect.appendChild(option);
    }
    
    this.logger.info(`TranslationEngineSelector: engine ${engine.id} added`);
    
    return true;
  }
  
  /**
   * Удаляет движок перевода
   * @param {string} engineId - ID движка
   * @returns {boolean} true, если движок успешно удален
   */
  removeEngine(engineId) {
    // Проверяем, что движок существует
    const engineIndex = this.availableEngines.findIndex(engine => engine.id === engineId);
    if (engineIndex === -1) {
      this.logger.error(`TranslationEngineSelector: engine with id ${engineId} not found`);
      return false;
    }
    
    // Удаляем движок из списка доступных
    this.availableEngines.splice(engineIndex, 1);
    
    // Удаляем настройки движка
    delete this.engineSettings[engineId];
    
    // Если удаляемый движок был текущим, устанавливаем первый доступный
    if (this.currentEngineId === engineId) {
      this.currentEngineId = this.availableEngines.length > 0 ? this.availableEngines[0].id : '';
      
      // Если селектор отрендерен, обновляем его
      if (this.isRendered) {
        this.engineSelect.value = this.currentEngineId;
        this.renderEngineSettings();
      }
    }
    
    // Если селектор отрендерен, удаляем опцию
    if (this.isRendered && this.engineSelect) {
      const option = this.engineSelect.querySelector(`option[value="${engineId}"]`);
      if (option) {
        option.remove();
      }
    }
    
    this.logger.info(`TranslationEngineSelector: engine ${engineId} removed`);
    
    return true;
  }
  
  /**
   * Обновляет список доступных движков перевода
   * @param {Array} engines - Массив объектов с информацией о движках
   * @returns {boolean} true, если список успешно обновлен
   */
  updateAvailableEngines(engines) {
    if (!Array.isArray(engines)) {
      this.logger.error('TranslationEngineSelector: engines must be an array');
      return false;
    }
    
    // Проверяем, что у всех движков есть необходимые поля
    for (const engine of engines) {
      if (!engine.id || !engine.name || !engine.settings) {
        this.logger.error('TranslationEngineSelector: invalid engine object');
        return false;
      }
    }
    
    // Обновляем список доступных движков
    this.availableEngines = engines;
    
    // Инициализируем настройки движков значениями по умолчанию
    this.initializeDefaultSettings();
    
    // Проверяем, что текущий движок все еще доступен
    if (!this.getEngineById(this.currentEngineId)) {
      this.currentEngineId = this.availableEngines.length > 0 ? this.availableEngines[0].id : '';
    }
    
    // Если селектор отрендерен, обновляем его
    if (this.isRendered) {
      // Очищаем селектор
      this.engineSelect.innerHTML = '';
      
      // Добавляем опции для каждого доступного движка
      for (const engine of this.availableEngines) {
        const option = document.createElement('option');
        option.value = engine.id;
        option.textContent = engine.name;
        this.engineSelect.appendChild(option);
      }
      
      // Устанавливаем текущий выбранный движок
      this.engineSelect.value = this.currentEngineId;
      
      // Перерендериваем настройки
      this.renderEngineSettings();
    }
    
    this.logger.info('TranslationEngineSelector: available engines updated');
    
    return true;
  }
  
  /**
   * Уничтожает селектор движков перевода и освобождает ресурсы
   */
  destroy() {
    this.logger.info('TranslationEngineSelector: destroying');
    
    // Удаляем обработчики событий
    if (this.isRendered) {
      if (this.engineSelect) {
        this.engineSelect.removeEventListener('change', this.handleEngineChange);
      }
      
      if (this.saveButton) {
        this.saveButton.removeEventListener('click', this.handleSaveClick);
      }
    }
    
    // Очищаем контейнер
    if (this.container) {
      this.container.innerHTML = '';
    }
    
    this.isInitialized = false;
    this.isRendered = false;
    
    this.logger.info('TranslationEngineSelector: destroyed');
  }
}

module.exports = TranslationEngineSelector;
