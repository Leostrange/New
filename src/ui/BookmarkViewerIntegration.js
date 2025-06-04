/**
 * BookmarkViewerIntegration.js
 * 
 * Модуль интеграции компонента BookmarkViewer с основным приложением Mr.Comic.
 * Обеспечивает связь между компонентом закладок и основным приложением.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const BookmarkViewer = require('./BookmarkViewer');

class BookmarkViewerIntegration {
  /**
   * Создает экземпляр интеграции просмотра закладок
   * @param {Object} app - Экземпляр основного приложения
   * @param {Object} options - Параметры инициализации
   */
  constructor(app, options = {}) {
    this.app = app;
    this.options = Object.assign({
      containerId: 'bookmark-viewer-container',
      autoInit: true,
      storageKey: 'mr-comic-bookmarks'
    }, options);
    
    this.bookmarkViewer = null;
    this.bookmarks = [];
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  /**
   * Инициализация интеграции
   */
  init() {
    this.loadBookmarks();
    this.createContainer();
    this.initBookmarkViewer();
    this.registerAppEvents();
  }
  
  /**
   * Создание контейнера для компонента
   */
  createContainer() {
    let container = document.getElementById(this.options.containerId);
    
    if (!container) {
      container = document.createElement('div');
      container.id = this.options.containerId;
      container.style.position = 'absolute';
      container.style.top = '60px';
      container.style.right = '20px';
      container.style.width = '350px';
      container.style.height = 'calc(100% - 120px)';
      container.style.zIndex = '1000';
      container.style.display = 'none';
      document.body.appendChild(container);
    }
    
    this.container = container;
  }
  
  /**
   * Инициализация компонента просмотра закладок
   */
  initBookmarkViewer() {
    const theme = this.app.getTheme ? this.app.getTheme() : { mode: 'light' };
    const isEInkMode = this.app.isEInkMode ? this.app.isEInkMode() : false;
    
    this.bookmarkViewer = new BookmarkViewer({
      container: this.container,
      bookmarks: this.bookmarks,
      theme: theme,
      isEInkMode: isEInkMode,
      onSelect: this.handleBookmarkSelect.bind(this),
      onDelete: this.handleBookmarkDelete.bind(this),
      onEdit: this.handleBookmarkEdit.bind(this)
    });
  }
  
  /**
   * Регистрация обработчиков событий приложения
   */
  registerAppEvents() {
    // Регистрация события изменения темы
    if (this.app.on && typeof this.app.on === 'function') {
      this.app.on('themeChanged', (theme) => {
        if (this.bookmarkViewer) {
          this.bookmarkViewer.updateTheme(theme);
        }
      });
      
      this.app.on('eInkModeChanged', (isEInkMode) => {
        if (this.bookmarkViewer) {
          this.bookmarkViewer.updateEInkMode(isEInkMode);
        }
      });
      
      this.app.on('documentClosed', () => {
        this.hideBookmarkViewer();
      });
    }
    
    // Регистрация горячих клавиш
    document.addEventListener('keydown', (e) => {
      // Ctrl+B или Cmd+B для открытия/закрытия просмотра закладок
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleBookmarkViewer();
      }
    });
    
    // Добавление кнопки в панель инструментов, если доступно
    if (this.app.addToolbarButton && typeof this.app.addToolbarButton === 'function') {
      this.app.addToolbarButton({
        id: 'bookmark-viewer-button',
        icon: 'bookmark',
        tooltip: 'Закладки',
        onClick: () => this.toggleBookmarkViewer()
      });
    }
  }
  
  /**
   * Загрузка закладок из хранилища
   */
  loadBookmarks() {
    try {
      const storedBookmarks = localStorage.getItem(this.options.storageKey);
      if (storedBookmarks) {
        this.bookmarks = JSON.parse(storedBookmarks);
      }
    } catch (error) {
      console.error('Ошибка при загрузке закладок:', error);
      this.bookmarks = [];
    }
  }
  
  /**
   * Сохранение закладок в хранилище
   */
  saveBookmarks() {
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.bookmarks));
    } catch (error) {
      console.error('Ошибка при сохранении закладок:', error);
    }
  }
  
  /**
   * Обработчик выбора закладки
   * @param {Object} bookmark - Выбранная закладка
   */
  handleBookmarkSelect(bookmark) {
    if (this.app.navigateToPage && typeof this.app.navigateToPage === 'function') {
      this.app.navigateToPage(bookmark.page);
    }
  }
  
  /**
   * Обработчик удаления закладки
   * @param {Object} bookmark - Удаленная закладка
   */
  handleBookmarkDelete(bookmark) {
    this.saveBookmarks();
  }
  
  /**
   * Обработчик редактирования закладки
   * @param {Object} bookmark - Отредактированная закладка
   */
  handleBookmarkEdit(bookmark) {
    this.saveBookmarks();
  }
  
  /**
   * Добавление новой закладки
   * @param {Object} bookmarkData - Данные закладки
   * @returns {Object} Созданная закладка
   */
  addBookmark(bookmarkData) {
    const newBookmark = {
      id: Date.now().toString(),
      title: bookmarkData.title || 'Без названия',
      page: bookmarkData.page || 1,
      note: bookmarkData.note || '',
      date: new Date().toISOString()
    };
    
    this.bookmarks.push(newBookmark);
    
    if (this.bookmarkViewer) {
      this.bookmarkViewer.updateBookmarks(this.bookmarks);
    }
    
    this.saveBookmarks();
    return newBookmark;
  }
  
  /**
   * Удаление закладки по ID
   * @param {string} id - ID закладки
   * @returns {boolean} Результат операции
   */
  removeBookmark(id) {
    const initialLength = this.bookmarks.length;
    this.bookmarks = this.bookmarks.filter(bookmark => bookmark.id !== id);
    
    if (this.bookmarks.length !== initialLength) {
      if (this.bookmarkViewer) {
        this.bookmarkViewer.updateBookmarks(this.bookmarks);
      }
      
      this.saveBookmarks();
      return true;
    }
    
    return false;
  }
  
  /**
   * Обновление закладки
   * @param {string} id - ID закладки
   * @param {Object} bookmarkData - Новые данные закладки
   * @returns {Object|null} Обновленная закладка или null, если закладка не найдена
   */
  updateBookmark(id, bookmarkData) {
    const index = this.bookmarks.findIndex(bookmark => bookmark.id === id);
    
    if (index !== -1) {
      this.bookmarks[index] = {
        ...this.bookmarks[index],
        ...bookmarkData,
        date: new Date().toISOString()
      };
      
      if (this.bookmarkViewer) {
        this.bookmarkViewer.updateBookmarks(this.bookmarks);
      }
      
      this.saveBookmarks();
      return this.bookmarks[index];
    }
    
    return null;
  }
  
  /**
   * Получение всех закладок
   * @returns {Array} Массив закладок
   */
  getBookmarks() {
    return [...this.bookmarks];
  }
  
  /**
   * Получение закладки по ID
   * @param {string} id - ID закладки
   * @returns {Object|null} Закладка или null, если не найдена
   */
  getBookmarkById(id) {
    return this.bookmarks.find(bookmark => bookmark.id === id) || null;
  }
  
  /**
   * Получение закладок для указанной страницы
   * @param {number} page - Номер страницы
   * @returns {Array} Массив закладок для указанной страницы
   */
  getBookmarksByPage(page) {
    return this.bookmarks.filter(bookmark => bookmark.page === page);
  }
  
  /**
   * Переключение видимости компонента просмотра закладок
   */
  toggleBookmarkViewer() {
    if (this.container.style.display === 'none') {
      this.showBookmarkViewer();
    } else {
      this.hideBookmarkViewer();
    }
  }
  
  /**
   * Отображение компонента просмотра закладок
   */
  showBookmarkViewer() {
    this.container.style.display = 'block';
  }
  
  /**
   * Скрытие компонента просмотра закладок
   */
  hideBookmarkViewer() {
    this.container.style.display = 'none';
  }
  
  /**
   * Очистка всех закладок
   */
  clearBookmarks() {
    this.bookmarks = [];
    
    if (this.bookmarkViewer) {
      this.bookmarkViewer.updateBookmarks(this.bookmarks);
    }
    
    this.saveBookmarks();
  }
  
  /**
   * Импорт закладок из JSON
   * @param {string} json - JSON-строка с закладками
   * @returns {boolean} Результат операции
   */
  importBookmarks(json) {
    try {
      const importedBookmarks = JSON.parse(json);
      
      if (Array.isArray(importedBookmarks)) {
        this.bookmarks = importedBookmarks;
        
        if (this.bookmarkViewer) {
          this.bookmarkViewer.updateBookmarks(this.bookmarks);
        }
        
        this.saveBookmarks();
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Ошибка при импорте закладок:', error);
      return false;
    }
  }
  
  /**
   * Экспорт закладок в JSON
   * @returns {string} JSON-строка с закладками
   */
  exportBookmarks() {
    return JSON.stringify(this.bookmarks);
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarkViewerIntegration;
}
