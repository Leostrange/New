/**
 * BookmarkViewer.js
 * 
 * Компонент для визуального просмотра и управления закладками в приложении Mr.Comic.
 * Поддерживает адаптивный дизайн, темный режим и режим для E-Ink устройств.
 * 
 * @version 1.0.0
 * @author Manus AI
 */

class BookmarkViewer {
  /**
   * Создает экземпляр компонента просмотра закладок
   * @param {Object} options - Параметры инициализации
   * @param {HTMLElement} options.container - DOM-элемент для рендеринга компонента
   * @param {Array} options.bookmarks - Массив закладок для отображения
   * @param {Object} options.theme - Настройки темы оформления
   * @param {Function} options.onSelect - Callback при выборе закладки
   * @param {Function} options.onDelete - Callback при удалении закладки
   * @param {Function} options.onEdit - Callback при редактировании закладки
   */
  constructor(options) {
    this.container = options.container;
    this.bookmarks = options.bookmarks || [];
    this.theme = options.theme || { mode: 'light' };
    this.onSelect = options.onSelect || (() => {});
    this.onDelete = options.onDelete || (() => {});
    this.onEdit = options.onEdit || (() => {});
    
    this.isEInkMode = options.isEInkMode || false;
    this.sortOrder = 'date'; // 'date', 'name', 'page'
    this.filterText = '';
    
    this.init();
  }
  
  /**
   * Инициализация компонента
   */
  init() {
    this.createStyles();
    this.render();
    this.attachEventListeners();
    this.registerHotkeys();
  }
  
  /**
   * Создание стилей компонента
   */
  createStyles() {
    const styleId = 'bookmark-viewer-styles';
    
    // Проверяем, не добавлены ли уже стили
    if (document.getElementById(styleId)) {
      return;
    }
    
    const style = document.createElement('style');
    style.id = styleId;
    
    const isDarkMode = this.theme.mode === 'dark';
    const isEInkMode = this.isEInkMode;
    
    const bgColor = isDarkMode ? '#222' : (isEInkMode ? '#fff' : '#f5f5f5');
    const textColor = isDarkMode ? '#eee' : (isEInkMode ? '#000' : '#333');
    const borderColor = isDarkMode ? '#444' : (isEInkMode ? '#000' : '#ddd');
    const hoverColor = isDarkMode ? '#333' : (isEInkMode ? '#eee' : '#e9e9e9');
    const activeColor = isDarkMode ? '#444' : (isEInkMode ? '#ddd' : '#d9d9d9');
    
    style.textContent = `
      .bookmark-viewer {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: ${bgColor};
        color: ${textColor};
        border: 1px solid ${borderColor};
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        flex-direction: column;
        height: 100%;
        transition: ${isEInkMode ? 'none' : 'all 0.2s ease'};
      }
      
      .bookmark-viewer-header {
        padding: 12px;
        border-bottom: 1px solid ${borderColor};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .bookmark-viewer-title {
        font-size: 16px;
        font-weight: 600;
        margin: 0;
      }
      
      .bookmark-viewer-controls {
        display: flex;
        gap: 8px;
      }
      
      .bookmark-viewer-search {
        padding: 12px;
        border-bottom: 1px solid ${borderColor};
      }
      
      .bookmark-viewer-search input {
        width: 100%;
        padding: 8px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#fff'};
        color: ${textColor};
      }
      
      .bookmark-viewer-list {
        flex: 1;
        overflow-y: auto;
        padding: 0;
        margin: 0;
        list-style: none;
      }
      
      .bookmark-viewer-item {
        padding: 12px;
        border-bottom: 1px solid ${borderColor};
        cursor: pointer;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .bookmark-viewer-item:hover {
        background-color: ${hoverColor};
      }
      
      .bookmark-viewer-item:active {
        background-color: ${activeColor};
      }
      
      .bookmark-viewer-item-info {
        flex: 1;
      }
      
      .bookmark-viewer-item-title {
        font-weight: 500;
        margin: 0 0 4px 0;
      }
      
      .bookmark-viewer-item-page {
        font-size: 12px;
        color: ${isDarkMode ? '#aaa' : '#666'};
      }
      
      .bookmark-viewer-item-date {
        font-size: 11px;
        color: ${isDarkMode ? '#888' : '#999'};
      }
      
      .bookmark-viewer-item-actions {
        display: flex;
        gap: 8px;
      }
      
      .bookmark-viewer-button {
        background-color: ${isDarkMode ? '#444' : '#e0e0e0'};
        border: none;
        border-radius: 4px;
        padding: 6px 10px;
        cursor: pointer;
        color: ${textColor};
        font-size: 13px;
        transition: ${isEInkMode ? 'none' : 'background-color 0.2s ease'};
      }
      
      .bookmark-viewer-button:hover {
        background-color: ${isDarkMode ? '#555' : '#d0d0d0'};
      }
      
      .bookmark-viewer-button.primary {
        background-color: ${isDarkMode ? '#0066cc' : '#007bff'};
        color: white;
      }
      
      .bookmark-viewer-button.primary:hover {
        background-color: ${isDarkMode ? '#0055aa' : '#0069d9'};
      }
      
      .bookmark-viewer-button.danger {
        background-color: ${isDarkMode ? '#cc3300' : '#dc3545'};
        color: white;
      }
      
      .bookmark-viewer-button.danger:hover {
        background-color: ${isDarkMode ? '#aa2200' : '#c82333'};
      }
      
      .bookmark-viewer-empty {
        padding: 24px;
        text-align: center;
        color: ${isDarkMode ? '#888' : '#999'};
      }
      
      .bookmark-viewer-footer {
        padding: 12px;
        border-top: 1px solid ${borderColor};
        display: flex;
        justify-content: space-between;
        align-items: center;
      }
      
      .bookmark-viewer-sort {
        display: flex;
        align-items: center;
        gap: 8px;
      }
      
      .bookmark-viewer-sort label {
        font-size: 13px;
      }
      
      .bookmark-viewer-sort select {
        padding: 4px 8px;
        border: 1px solid ${borderColor};
        border-radius: 4px;
        background-color: ${isDarkMode ? '#333' : '#fff'};
        color: ${textColor};
      }
      
      @media (max-width: 768px) {
        .bookmark-viewer-header {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .bookmark-viewer-controls {
          width: 100%;
          justify-content: flex-end;
        }
        
        .bookmark-viewer-item {
          flex-direction: column;
          align-items: flex-start;
          gap: 8px;
        }
        
        .bookmark-viewer-item-actions {
          width: 100%;
          justify-content: flex-end;
        }
      }
    `;
    
    document.head.appendChild(style);
  }
  
  /**
   * Рендеринг компонента
   */
  render() {
    this.container.innerHTML = '';
    
    const viewerEl = document.createElement('div');
    viewerEl.className = 'bookmark-viewer';
    
    // Заголовок
    const headerEl = document.createElement('div');
    headerEl.className = 'bookmark-viewer-header';
    
    const titleEl = document.createElement('h2');
    titleEl.className = 'bookmark-viewer-title';
    titleEl.textContent = 'Закладки';
    
    const controlsEl = document.createElement('div');
    controlsEl.className = 'bookmark-viewer-controls';
    
    const addButton = document.createElement('button');
    addButton.className = 'bookmark-viewer-button primary';
    addButton.textContent = 'Добавить';
    addButton.addEventListener('click', () => this.handleAddBookmark());
    
    controlsEl.appendChild(addButton);
    headerEl.appendChild(titleEl);
    headerEl.appendChild(controlsEl);
    
    // Поиск
    const searchEl = document.createElement('div');
    searchEl.className = 'bookmark-viewer-search';
    
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Поиск закладок...';
    searchInput.addEventListener('input', (e) => {
      this.filterText = e.target.value;
      this.renderBookmarkList();
    });
    
    searchEl.appendChild(searchInput);
    
    // Список закладок
    const listContainerEl = document.createElement('div');
    listContainerEl.style.flex = '1';
    listContainerEl.style.overflow = 'hidden';
    listContainerEl.style.position = 'relative';
    
    const listEl = document.createElement('ul');
    listEl.className = 'bookmark-viewer-list';
    
    listContainerEl.appendChild(listEl);
    
    // Футер
    const footerEl = document.createElement('div');
    footerEl.className = 'bookmark-viewer-footer';
    
    const sortEl = document.createElement('div');
    sortEl.className = 'bookmark-viewer-sort';
    
    const sortLabel = document.createElement('label');
    sortLabel.textContent = 'Сортировка:';
    
    const sortSelect = document.createElement('select');
    
    const sortOptions = [
      { value: 'date', text: 'По дате' },
      { value: 'page', text: 'По номеру страницы' },
      { value: 'name', text: 'По названию' }
    ];
    
    sortOptions.forEach(option => {
      const optionEl = document.createElement('option');
      optionEl.value = option.value;
      optionEl.textContent = option.text;
      optionEl.selected = this.sortOrder === option.value;
      sortSelect.appendChild(optionEl);
    });
    
    sortSelect.addEventListener('change', (e) => {
      this.sortOrder = e.target.value;
      this.renderBookmarkList();
    });
    
    sortEl.appendChild(sortLabel);
    sortEl.appendChild(sortSelect);
    
    const countEl = document.createElement('div');
    countEl.textContent = `Всего: ${this.bookmarks.length}`;
    
    footerEl.appendChild(sortEl);
    footerEl.appendChild(countEl);
    
    // Добавляем все элементы в контейнер
    viewerEl.appendChild(headerEl);
    viewerEl.appendChild(searchEl);
    viewerEl.appendChild(listContainerEl);
    viewerEl.appendChild(footerEl);
    
    this.container.appendChild(viewerEl);
    
    // Сохраняем ссылки на элементы для дальнейшего использования
    this.listEl = listEl;
    this.countEl = countEl;
    
    // Рендерим список закладок
    this.renderBookmarkList();
  }
  
  /**
   * Рендеринг списка закладок
   */
  renderBookmarkList() {
    const listEl = this.listEl;
    listEl.innerHTML = '';
    
    // Фильтрация закладок
    let filteredBookmarks = this.bookmarks;
    
    if (this.filterText) {
      const lowerFilter = this.filterText.toLowerCase();
      filteredBookmarks = filteredBookmarks.filter(bookmark => 
        bookmark.title.toLowerCase().includes(lowerFilter) || 
        bookmark.note?.toLowerCase().includes(lowerFilter)
      );
    }
    
    // Сортировка закладок
    filteredBookmarks = [...filteredBookmarks].sort((a, b) => {
      switch (this.sortOrder) {
        case 'date':
          return new Date(b.date) - new Date(a.date);
        case 'page':
          return a.page - b.page;
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });
    
    // Обновляем счетчик
    this.countEl.textContent = `Всего: ${filteredBookmarks.length}`;
    
    // Если закладок нет, показываем сообщение
    if (filteredBookmarks.length === 0) {
      const emptyEl = document.createElement('div');
      emptyEl.className = 'bookmark-viewer-empty';
      
      if (this.filterText) {
        emptyEl.textContent = 'Закладки не найдены';
      } else {
        emptyEl.textContent = 'У вас пока нет закладок';
      }
      
      listEl.appendChild(emptyEl);
      return;
    }
    
    // Рендерим закладки
    filteredBookmarks.forEach(bookmark => {
      const itemEl = document.createElement('li');
      itemEl.className = 'bookmark-viewer-item';
      itemEl.dataset.id = bookmark.id;
      
      const infoEl = document.createElement('div');
      infoEl.className = 'bookmark-viewer-item-info';
      
      const titleEl = document.createElement('h3');
      titleEl.className = 'bookmark-viewer-item-title';
      titleEl.textContent = bookmark.title;
      
      const pageEl = document.createElement('div');
      pageEl.className = 'bookmark-viewer-item-page';
      pageEl.textContent = `Страница: ${bookmark.page}`;
      
      const dateEl = document.createElement('div');
      dateEl.className = 'bookmark-viewer-item-date';
      dateEl.textContent = new Date(bookmark.date).toLocaleString();
      
      infoEl.appendChild(titleEl);
      infoEl.appendChild(pageEl);
      infoEl.appendChild(dateEl);
      
      if (bookmark.note) {
        const noteEl = document.createElement('div');
        noteEl.className = 'bookmark-viewer-item-note';
        noteEl.textContent = bookmark.note;
        infoEl.appendChild(noteEl);
      }
      
      const actionsEl = document.createElement('div');
      actionsEl.className = 'bookmark-viewer-item-actions';
      
      const editButton = document.createElement('button');
      editButton.className = 'bookmark-viewer-button';
      editButton.textContent = 'Изменить';
      editButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleEditBookmark(bookmark);
      });
      
      const deleteButton = document.createElement('button');
      deleteButton.className = 'bookmark-viewer-button danger';
      deleteButton.textContent = 'Удалить';
      deleteButton.addEventListener('click', (e) => {
        e.stopPropagation();
        this.handleDeleteBookmark(bookmark);
      });
      
      actionsEl.appendChild(editButton);
      actionsEl.appendChild(deleteButton);
      
      itemEl.appendChild(infoEl);
      itemEl.appendChild(actionsEl);
      
      itemEl.addEventListener('click', () => {
        this.handleSelectBookmark(bookmark);
      });
      
      listEl.appendChild(itemEl);
    });
  }
  
  /**
   * Добавление обработчиков событий
   */
  attachEventListeners() {
    // Обработчики событий уже добавлены в методе render
  }
  
  /**
   * Регистрация горячих клавиш
   */
  registerHotkeys() {
    document.addEventListener('keydown', (e) => {
      // Ctrl+B или Cmd+B для открытия/закрытия просмотра закладок
      if ((e.ctrlKey || e.metaKey) && e.key === 'b') {
        e.preventDefault();
        this.toggleVisibility();
      }
    });
  }
  
  /**
   * Переключение видимости компонента
   */
  toggleVisibility() {
    const viewerEl = this.container.querySelector('.bookmark-viewer');
    if (viewerEl) {
      viewerEl.style.display = viewerEl.style.display === 'none' ? 'flex' : 'none';
    }
  }
  
  /**
   * Обработчик выбора закладки
   * @param {Object} bookmark - Выбранная закладка
   */
  handleSelectBookmark(bookmark) {
    this.onSelect(bookmark);
  }
  
  /**
   * Обработчик добавления закладки
   */
  handleAddBookmark() {
    // Создаем форму для добавления закладки
    const title = prompt('Введите название закладки:');
    if (!title) return;
    
    const pageInput = prompt('Введите номер страницы:');
    if (!pageInput) return;
    
    const page = parseInt(pageInput, 10);
    if (isNaN(page)) {
      alert('Пожалуйста, введите корректный номер страницы.');
      return;
    }
    
    const note = prompt('Введите примечание (необязательно):');
    
    const newBookmark = {
      id: Date.now().toString(),
      title,
      page,
      note,
      date: new Date().toISOString()
    };
    
    this.bookmarks.push(newBookmark);
    this.renderBookmarkList();
  }
  
  /**
   * Обработчик редактирования закладки
   * @param {Object} bookmark - Редактируемая закладка
   */
  handleEditBookmark(bookmark) {
    const title = prompt('Введите название закладки:', bookmark.title);
    if (!title) return;
    
    const pageInput = prompt('Введите номер страницы:', bookmark.page);
    if (!pageInput) return;
    
    const page = parseInt(pageInput, 10);
    if (isNaN(page)) {
      alert('Пожалуйста, введите корректный номер страницы.');
      return;
    }
    
    const note = prompt('Введите примечание (необязательно):', bookmark.note || '');
    
    const index = this.bookmarks.findIndex(b => b.id === bookmark.id);
    if (index !== -1) {
      this.bookmarks[index] = {
        ...bookmark,
        title,
        page,
        note,
        date: new Date().toISOString()
      };
      
      this.renderBookmarkList();
      this.onEdit(this.bookmarks[index]);
    }
  }
  
  /**
   * Обработчик удаления закладки
   * @param {Object} bookmark - Удаляемая закладка
   */
  handleDeleteBookmark(bookmark) {
    if (confirm(`Вы уверены, что хотите удалить закладку "${bookmark.title}"?`)) {
      this.bookmarks = this.bookmarks.filter(b => b.id !== bookmark.id);
      this.renderBookmarkList();
      this.onDelete(bookmark);
    }
  }
  
  /**
   * Обновление списка закладок
   * @param {Array} bookmarks - Новый массив закладок
   */
  updateBookmarks(bookmarks) {
    this.bookmarks = bookmarks || [];
    this.renderBookmarkList();
  }
  
  /**
   * Обновление темы оформления
   * @param {Object} theme - Новые настройки темы
   */
  updateTheme(theme) {
    this.theme = theme || { mode: 'light' };
    this.createStyles();
    this.render();
  }
  
  /**
   * Обновление режима E-Ink
   * @param {boolean} isEInkMode - Флаг режима E-Ink
   */
  updateEInkMode(isEInkMode) {
    this.isEInkMode = isEInkMode;
    this.createStyles();
    this.render();
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = BookmarkViewer;
}
