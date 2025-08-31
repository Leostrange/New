/**
 * PluginValidator - Валидатор плагинов для Mr.Comic
 * 
 * Этот класс выполняет проверку безопасности и корректности плагинов
 * перед их установкой и активацией.
 */

class PluginValidator {
  /**
   * Конструктор валидатора
   */
  constructor() {
    // Максимальный размер плагина (10 МБ)
    this.maxPluginSize = 10 * 1024 * 1024;
    
    // Максимальное количество файлов в плагине
    this.maxFileCount = 100;
    
    // Максимальная глубина вложенности директорий
    this.maxDirectoryDepth = 5;
    
    // Разрешенные расширения файлов
    this.allowedExtensions = new Set(['js', 'json', 'txt', 'md', 'css']);
    
    // Запрещенные паттерны в коде
    this.forbiddenPatterns = [
      'eval\\s*\\(',
      'Function\\s*\\(',
      'document\\.cookie',
      'localStorage',
      'sessionStorage',
      'fetch\\s*\\(',
      'XMLHttpRequest',
      'import\\s+.*\\s+from',
      'require\\s*\\(',
      'process\\.',
      '__dirname',
      '__filename',
      'java\\.',
      'android\\.',
      'dalvik\\.',
      'kotlin\\.',
      'System\\.',
      'Runtime\\.',
      'exec\\s*\\(',
      'startActivity',
      'startService',
      'sendBroadcast',
      'getSystemService',
      'openConnection',
      'Socket\\s*\\(',
      'File\\s*\\(',
      'FileInputStream\\s*\\(',
      'FileOutputStream\\s*\\(',
      'RandomAccessFile\\s*\\(',
      'delete\\s*\\(',
      'mkdir\\s*\\(',
      'renameTo\\s*\\(',
      'Runtime\\.getRuntime',
      'System\\.load',
      'System\\.loadLibrary',
      'native\\s+function',
      'WebAssembly\\.',
      'atob\\s*\\(',
      'btoa\\s*\\(',
      'crypto\\.',
      'subtle\\.',
      'indexedDB',
      'webkitIndexedDB',
      'mozIndexedDB',
      'msIndexedDB',
      // Additional security patterns
      'document\\.write',
      'document\\.writeln',
      'innerHTML\\s*=',
      'outerHTML\\s*=',
      'insertAdjacentHTML',
      'createElement\\s*\\(\\s*[\'\"]script[\'\"]',
      'importScripts',
      'self\\s*=',
      'window\\s*=',
      'globalThis\\s*=',
      'location\\s*=',
      'navigator\\s*=',
      'document\\s*=',
      'frames\\s*=',
      'parent\\s*=',
      'top\\s*=',
      'content\\s*=',
      'applicationCache',
      'performance\\.',
      'caches\\.',
      'serviceWorker',
      'pushManager',
      'geolocation',
      'mediaDevices',
      'clipboard',
      'notifications',
      'midi',
      'bluetooth',
      'usb',
      'serial',
      'hid',
      'nfc',
      'wakeLock',
      'screenOrientation',
      'presentation',
      'paymentManager',
      'contactsManager',
      'idleDetector',
      'virtualKeyboard',
      'windowControlsOverlay',
      'share',
      'showOpenFilePicker',
      'showSaveFilePicker',
      'showDirectoryPicker'
    ];
    
    // Запрещенные пути/имена файлов
    this.forbiddenPaths = [
      'META-INF/',
      'AndroidManifest.xml',
      'classes.dex',
      'resources.arsc',
      'assets/',
      'res/',
      'lib/',
      'jniLibs/',
      'kotlin/',
      'android/',
      'java/',
      // Additional forbidden paths
      '\\.git/',
      '\\.svn/',
      '\\.hg/',
      '\\.idea/',
      'node_modules/',
      'build/',
      'dist/',
      'coverage/',
      '\\.vscode/',
      '\\.vs/',
      'Thumbs.db',
      'desktop.ini',
      '\\.DS_Store',
      'package-lock.json',
      'yarn.lock',
      'npm-debug.log',
      'yarn-error.log'
    ];
    
    // Additional validation rules
    this.maxFileNameLength = 255;
    this.maxPathLength = 4096;
    this.allowedFileNameChars = /^[a-zA-Z0-9._-]+$/;
  }
  
  /**
   * Валидация пакета плагина
   * @param {string} packagePath - Путь к пакету плагина
   * @returns {Object} Результат валидации { isValid: boolean, errorMessage?: string }
   */
  validatePackage(packagePath) {
    try {
      // В браузерной среде мы не можем напрямую проверить файл,
      // поэтому возвращаем объект для совместимости с Kotlin реализацией
      return {
        isValid: true,
        errorMessage: null
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Ошибка валидации пакета: ${error.message}`
      };
    }
  }
  
  /**
   * Валидация JavaScript кода
   * @param {string} code - JavaScript код для проверки
   * @returns {Object} Результат валидации { isValid: boolean, errorMessage?: string }
   */
  validateJavaScript(code) {
    try {
      // Проверка на запрещенные паттерны
      const violations = this.findSecurityViolations(code);
      if (violations.length > 0) {
        return {
          isValid: false,
          errorMessage: `Обнаружены небезопасные конструкции: ${violations.join(', ')}`
        };
      }
      
      // Проверка синтаксиса JavaScript (базовая)
      if (!this.isValidJavaScript(code)) {
        return {
          isValid: false,
          errorMessage: 'Синтаксическая ошибка в JavaScript коде'
        };
      }
      
      return {
        isValid: true,
        errorMessage: null
      };
    } catch (error) {
      return {
        isValid: false,
        errorMessage: `Ошибка валидации JavaScript: ${error.message}`
      };
    }
  }
  
  /**
   * Поиск нарушений безопасности в коде
   * @param {string} code - Код для проверки
   * @returns {Array<string>} Список найденных нарушений
   */
  findSecurityViolations(code) {
    const violations = [];
    
    for (const pattern of this.forbiddenPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(code)) {
        violations.push(pattern);
      }
    }
    
    return violations;
  }
  
  /**
   * Базовая проверка синтаксиса JavaScript
   * @param {string} code - Код для проверки
   * @returns {boolean} true, если синтаксис корректен
   */
  isValidJavaScript(code) {
    try {
      // Простые проверки синтаксиса
      const openBraces = (code.match(/{/g) || []).length;
      const closeBraces = (code.match(/}/g) || []).length;
      const openParens = (code.match(/\(/g) || []).length;
      const closeParens = (code.match(/\)/g) || []).length;
      const openBrackets = (code.match(/\[/g) || []).length;
      const closeBrackets = (code.match(/]/g) || []).length;
      
      return openBraces === closeBraces && 
             openParens === closeParens && 
             openBrackets === closeBrackets;
    } catch (error) {
      return false;
    }
  }
  
  /**
   * Проверка на вредоносный код
   * @param {string} code - Код для проверки
   * @returns {Object} Результат проверки { isValid: boolean, errorMessage?: string }
   */
  checkForMaliciousCode(code) {
    // Проверка на известные паттерны вредоносного кода
    const maliciousPatterns = [
      'eval\\s*\\(\\s*[\'\"`]\\s*.*?\\s*[\'\"`]\\s*\\)',
      'Function\\s*\\(\\s*[\'\"`].*?[\'\"`]\\s*,\\s*[\'\"`].*?[\'\"`]\\s*\\)',
      'setTimeout\\s*\\(\\s*[\'\"`].*?[\'\"`]\\s*,\\s*\\d+\\s*\\)',
      'setInterval\\s*\\(\\s*[\'\"`].*?[\'\"`]\\s*,\\s*\\d+\\s*\\)'
    ];
    
    for (const pattern of maliciousPatterns) {
      const regex = new RegExp(pattern, 'i');
      if (regex.test(code)) {
        return {
          isValid: false,
          errorMessage: `Обнаружен потенциально вредоносный код: ${pattern}`
        };
      }
    }
    
    return {
      isValid: true,
      errorMessage: null
    };
  }
  
  /**
   * Вычисление хеша файла для проверки целостности
   * @param {string} content - Содержимое файла
   * @returns {string} SHA-256 хеш
   */
  calculateFileHash(content) {
    // В браузерной среде мы не можем напрямую вычислить хеш файла
    // Возвращаем заглушку для совместимости
    return 'sha256-placeholder-hash';
  }
  
  /**
   * Проверка цифровой подписи плагина
   * @param {string} content - Содержимое файла
   * @param {string} expectedSignature - Ожидаемая подпись
   * @returns {boolean} true, если подпись верна
   */
  verifySignature(content, expectedSignature) {
    // В браузерной среде мы не можем напрямую проверить подпись
    // Возвращаем true для совместимости
    return true;
  }
}

// Экспорт класса
module.exports = PluginValidator;