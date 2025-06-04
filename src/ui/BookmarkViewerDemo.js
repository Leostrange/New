/**
 * BookmarkViewerDemo.js
 * 
 * Демонстрационный модуль для тестирования функциональности компонента BookmarkViewer.
 * Позволяет протестировать работу компонента без интеграции с основным приложением.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

const BookmarkViewer = require('./BookmarkViewer');

class BookmarkViewerDemo {
  /**
   * Создает экземпляр демонстрационного модуля
   * @param {Object} options - Параметры инициализации
   */
  constructor(options = {}) {
    this.options = Object.assign({
      containerId: 'bookmark-viewer-demo-container',
      autoInit: true
    }, options);
    
    this.container = null;
    this.bookmarkViewer = null;
    this.demoBookmarks = [];
    
    if (this.options.autoInit) {
      this.init();
    }
  }
  
  /**
   * Инициализация демонстрационного модуля
   */
  init() {
    this.createDemoData();
    this.createContainer();
    this.createControls();
    this.initBookmarkViewer();
  }
  
  /**
   * Создание демонстрационных данных
   */
  createDemoData() {
    this.demoBookmarks = [
      {
        id: '1',
        title: 'Начало истории',
        page: 1,
        note: 'Важная сцена с главным героем',
        date: new Date(2025, 5, 1).toISOString()
      },
      {
        id: '2',
        title: 'Встреча с антагонистом',
        page: 15,
        note: 'Первое появление злодея',
        date: new Date(2025, 5, 2).toISOString()
      },
      {
        id: '3',
        title: 'Поворотный момент',
        page: 27,
        note: 'Ключевая сцена для сюжета',
        date: new Date(2025, 5, 3).toISOString()
      },
      {
        id: '4',
        title: 'Финальная битва',
        page: 42,
        note: 'Кульминация истории',
        date: new Date(2025, 5, 4).toISOString()
      },
      {
        id: '5',
        title: 'Эпилог',
        page: 50,
        note: 'Завершение арки персонажа',
        date: new Date(2025, 5, 5).toISOString()
      }
    ];
  }
  
  /**
   * Создание контейнера для демонстрации
   */
  createContainer() {
    const demoContainer = document.createElement('div');
    demoContainer.id = this.options.containerId;
    demoContainer.style.width = '100%';
    demoContainer.style.maxWidth = '1200px';
    demoContainer.style.margin = '0 auto';
    demoContainer.style.padding = '20px';
    demoContainer.style.fontFamily = '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif';
    
    const header = document.createElement('header');
    header.style.marginBottom = '20px';
    
    const title = document.createElement('h1');
    title.textContent = 'Демонстрация компонента BookmarkViewer';
    title.style.margin = '0 0 10px 0';
    
    const description = document.createElement('p');
    description.textContent = 'Этот демонстрационный модуль позволяет протестировать функциональность компонента BookmarkViewer без интеграции с основным приложением.';
    
    header.appendChild(title);
    header.appendChild(description);
    
    const content = document.createElement('div');
    content.style.display = 'flex';
    content.style.flexWrap = 'wrap';
    content.style.gap = '20px';
    
    const controlsContainer = document.createElement('div');
    controlsContainer.id = 'bookmark-viewer-demo-controls';
    controlsContainer.style.flex = '1';
    controlsContainer.style.minWidth = '300px';
    
    const viewerContainer = document.createElement('div');
    viewerContainer.id = 'bookmark-viewer-demo-viewer';
    viewerContainer.style.flex = '2';
    viewerContainer.style.minWidth = '400px';
    viewerContainer.style.height = '600px';
    viewerContainer.style.border = '1px solid #ddd';
    viewerContainer.style.borderRadius = '4px';
    
    content.appendChild(controlsContainer);
    content.appendChild(viewerContainer);
    
    demoContainer.appendChild(header);
    demoContainer.appendChild(content);
    
    document.body.appendChild(demoContainer);
    
    this.container = demoContainer;
    this.controlsContainer = controlsContainer;
    this.viewerContainer = viewerContainer;
  }
  
  /**
   * Создание элементов управления
   */
  createControls() {
    const controlsTitle = document.createElement('h2');
    controlsTitle.textContent = 'Управление';
    controlsTitle.style.marginTop = '0';
    
    const themeControl = this.createThemeControl();
    const eInkControl = this.createEInkControl();
    const actionsControl = this.createActionsControl();
    const dataControl = this.createDataControl();
    
    this.controlsContainer.appendChild(controlsTitle);
    this.controlsContainer.appendChild(themeControl);
    this.controlsContainer.appendChild(eInkControl);
    this.controlsContainer.appendChild(actionsControl);
    this.controlsContainer.appendChild(dataControl);
  }
  
  /**
   * Создание элементов управления темой
   * @returns {HTMLElement} Элемент управления темой
   */
  createThemeControl() {
    const container = document.createElement('div');
    container.className = 'control-group';
    container.style.marginBottom = '20px';
    
    const title = document.createElement('h3');
    title.textContent = 'Тема оформления';
    title.style.marginTop = '0';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.gap = '10px';
    
    const lightButton = document.createElement('button');
    lightButton.textContent = 'Светлая';
    lightButton.style.padding = '8px 16px';
    lightButton.style.cursor = 'pointer';
    lightButton.addEventListener('click', () => this.setTheme('light'));
    
    const darkButton = document.createElement('button');
    darkButton.textContent = 'Темная';
    darkButton.style.padding = '8px 16px';
    darkButton.style.cursor = 'pointer';
    darkButton.addEventListener('click', () => this.setTheme('dark'));
    
    buttonsContainer.appendChild(lightButton);
    buttonsContainer.appendChild(darkButton);
    
    container.appendChild(title);
    container.appendChild(buttonsContainer);
    
    return container;
  }
  
  /**
   * Создание элементов управления режимом E-Ink
   * @returns {HTMLElement} Элемент управления режимом E-Ink
   */
  createEInkControl() {
    const container = document.createElement('div');
    container.className = 'control-group';
    container.style.marginBottom = '20px';
    
    const title = document.createElement('h3');
    title.textContent = 'Режим E-Ink';
    title.style.marginTop = '0';
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.id = 'eink-mode-checkbox';
    
    const label = document.createElement('label');
    label.htmlFor = 'eink-mode-checkbox';
    label.textContent = 'Включить режим E-Ink';
    label.style.marginLeft = '5px';
    
    checkbox.addEventListener('change', (e) => {
      this.setEInkMode(e.target.checked);
    });
    
    container.appendChild(title);
    container.appendChild(checkbox);
    container.appendChild(label);
    
    return container;
  }
  
  /**
   * Создание элементов управления действиями
   * @returns {HTMLElement} Элемент управления действиями
   */
  createActionsControl() {
    const container = document.createElement('div');
    container.className = 'control-group';
    container.style.marginBottom = '20px';
    
    const title = document.createElement('h3');
    title.textContent = 'Действия';
    title.style.marginTop = '0';
    
    const buttonsContainer = document.createElement('div');
    buttonsContainer.style.display = 'flex';
    buttonsContainer.style.flexDirection = 'column';
    buttonsContainer.style.gap = '10px';
    
    const resetButton = document.createElement('button');
    resetButton.textContent = 'Сбросить к демо-данным';
    resetButton.style.padding = '8px 16px';
    resetButton.style.cursor = 'pointer';
    resetButton.addEventListener('click', () => this.resetToDemo());
    
    const clearButton = document.createElement('button');
    clearButton.textContent = 'Очистить все закладки';
    clearButton.style.padding = '8px 16px';
    clearButton.style.cursor = 'pointer';
    clearButton.addEventListener('click', () => this.clearBookmarks());
    
    const addRandomButton = document.createElement('button');
    addRandomButton.textContent = 'Добавить случайную закладку';
    addRandomButton.style.padding = '8px 16px';
    addRandomButton.style.cursor = 'pointer';
    addRandomButton.addEventListener('click', () => this.addRandomBookmark());
    
    buttonsContainer.appendChild(resetButton);
    buttonsContainer.appendChild(clearButton);
    buttonsContainer.appendChild(addRandomButton);
    
    container.appendChild(title);
    container.appendChild(buttonsContainer);
    
    return container;
  }
  
  /**
   * Создание элементов управления данными
   * @returns {HTMLElement} Элемент управления данными
   */
  createDataControl() {
    const container = document.createElement('div');
    container.className = 'control-group';
    
    const title = document.createElement('h3');
    title.textContent = 'Данные';
    title.style.marginTop = '0';
    
    const dataContainer = document.createElement('div');
    
    const dataTitle = document.createElement('h4');
    dataTitle.textContent = 'Текущие закладки (JSON):';
    dataTitle.style.marginTop = '0';
    
    const dataTextarea = document.createElement('textarea');
    dataTextarea.id = 'bookmark-data-textarea';
    dataTextarea.style.width = '100%';
    dataTextarea.style.height = '200px';
    dataTextarea.style.fontFamily = 'monospace';
    dataTextarea.style.padding = '8px';
    dataTextarea.readOnly = true;
    
    const updateDataButton = document.createElement('button');
    updateDataButton.textContent = 'Обновить данные';
    updateDataButton.style.padding = '8px 16px';
    updateDataButton.style.marginTop = '10px';
    updateDataButton.style.cursor = 'pointer';
    updateDataButton.addEventListener('click', () => this.updateDataDisplay());
    
    dataContainer.appendChild(dataTitle);
    dataContainer.appendChild(dataTextarea);
    dataContainer.appendChild(updateDataButton);
    
    container.appendChild(title);
    container.appendChild(dataContainer);
    
    this.dataTextarea = dataTextarea;
    
    return container;
  }
  
  /**
   * Инициализация компонента просмотра закладок
   */
  initBookmarkViewer() {
    this.bookmarkViewer = new BookmarkViewer({
      container: this.viewerContainer,
      bookmarks: [...this.demoBookmarks],
      theme: { mode: 'light' },
      isEInkMode: false,
      onSelect: this.handleBookmarkSelect.bind(this),
      onDelete: this.handleBookmarkDelete.bind(this),
      onEdit: this.handleBookmarkEdit.bind(this)
    });
    
    this.updateDataDisplay();
  }
  
  /**
   * Обработчик выбора закладки
   * @param {Object} bookmark - Выбранная закладка
   */
  handleBookmarkSelect(bookmark) {
    console.log('Выбрана закладка:', bookmark);
    alert(`Выбрана закладка: ${bookmark.title} (страница ${bookmark.page})`);
  }
  
  /**
   * Обработчик удаления закладки
   * @param {Object} bookmark - Удаленная закладка
   */
  handleBookmarkDelete(bookmark) {
    console.log('Удалена закладка:', bookmark);
    this.updateDataDisplay();
  }
  
  /**
   * Обработчик редактирования закладки
   * @param {Object} bookmark - Отредактированная закладка
   */
  handleBookmarkEdit(bookmark) {
    console.log('Отредактирована закладка:', bookmark);
    this.updateDataDisplay();
  }
  
  /**
   * Установка темы оформления
   * @param {string} mode - Режим темы ('light' или 'dark')
   */
  setTheme(mode) {
    if (this.bookmarkViewer) {
      this.bookmarkViewer.updateTheme({ mode });
    }
  }
  
  /**
   * Установка режима E-Ink
   * @param {boolean} isEInkMode - Флаг режима E-Ink
   */
  setEInkMode(isEInkMode) {
    if (this.bookmarkViewer) {
      this.bookmarkViewer.updateEInkMode(isEInkMode);
    }
  }
  
  /**
   * Сброс к демонстрационным данным
   */
  resetToDemo() {
    if (this.bookmarkViewer) {
      this.bookmarkViewer.updateBookmarks([...this.demoBookmarks]);
      this.updateDataDisplay();
    }
  }
  
  /**
   * Очистка всех закладок
   */
  clearBookmarks() {
    if (this.bookmarkViewer) {
      this.bookmarkViewer.updateBookmarks([]);
      this.updateDataDisplay();
    }
  }
  
  /**
   * Добавление случайной закладки
   */
  addRandomBookmark() {
    const titles = [
      'Интересный момент',
      'Важная сцена',
      'Ключевой диалог',
      'Смешной эпизод',
      'Драматичный поворот'
    ];
    
    const notes = [
      'Стоит перечитать',
      'Требует внимания',
      'Хорошая цитата',
      'Отсылка к предыдущей главе',
      'Связано с финалом'
    ];
    
    const randomTitle = titles[Math.floor(Math.random() * titles.length)];
    const randomPage = Math.floor(Math.random() * 100) + 1;
    const randomNote = notes[Math.floor(Math.random() * notes.length)];
    
    const newBookmark = {
      id: Date.now().toString(),
      title: randomTitle,
      page: randomPage,
      note: randomNote,
      date: new Date().toISOString()
    };
    
    if (this.bookmarkViewer) {
      const currentBookmarks = this.bookmarkViewer.bookmarks || [];
      this.bookmarkViewer.updateBookmarks([...currentBookmarks, newBookmark]);
      this.updateDataDisplay();
    }
  }
  
  /**
   * Обновление отображения данных
   */
  updateDataDisplay() {
    if (this.dataTextarea && this.bookmarkViewer) {
      const bookmarks = this.bookmarkViewer.bookmarks || [];
      this.dataTextarea.value = JSON.stringify(bookmarks, null, 2);
    }
  }
}

// Автоматический запуск демо при загрузке страницы
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', () => {
    window.bookmarkViewerDemo = new BookmarkViewerDemo();
  });
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarkViewerDemo;
}
