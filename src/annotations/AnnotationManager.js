/**
 * AnnotationManager.js
 *
 * Основной менеджер для работы с аннотациями в приложении Mr.Comic.
 * Обеспечивает создание, редактирование, удаление и хранение аннотаций.
 *
 * @version 1.0.0
 * @author Manus AI
 */

class AnnotationManager {
  /**
   * Создает экземпляр менеджера аннотаций
   * @param {Object} options - Параметры инициализации
   * @param {string} options.storageKey - Ключ для хранения аннотаций в localStorage
   * @param {Function} options.onChange - Callback при изменении аннотаций
   */
  constructor(options = {}) {
    this.options = Object.assign({
      storageKey: 'mr-comic-annotations',
      onChange: null
    }, options);
    
    this.annotations = [];
    this.loadAnnotations();
  }
  
  /**
   * Загрузка аннотаций из хранилища
   */
  loadAnnotations() {
    try {
      const storedAnnotations = localStorage.getItem(this.options.storageKey);
      if (storedAnnotations) {
        this.annotations = JSON.parse(storedAnnotations);
      }
    } catch (error) {
      console.error('Ошибка при загрузке аннотаций:', error);
      this.annotations = [];
    }
  }
  
  /**
   * Сохранение аннотаций в хранилище
   */
  saveAnnotations() {
    try {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.annotations));
      if (this.options.onChange && typeof this.options.onChange === 'function') {
        this.options.onChange(this.annotations);
      }
    } catch (error) {
      console.error('Ошибка при сохранении аннотаций:', error);
    }
  }
  
  /**
   * Получение всех аннотаций
   * @returns {Array} Массив аннотаций
   */
  getAllAnnotations() {
    return [...this.annotations];
  }
  
  /**
   * Получение аннотаций для указанного документа
   * @param {string} documentId - ID документа
   * @returns {Array} Массив аннотаций для указанного документа
   */
  getAnnotationsByDocument(documentId) {
    return this.annotations.filter(annotation => annotation.documentId === documentId);
  }
  
  /**
   * Получение аннотаций для указанной страницы документа
   * @param {string} documentId - ID документа
   * @param {number} pageNumber - Номер страницы
   * @returns {Array} Массив аннотаций для указанной страницы
   */
  getAnnotationsByPage(documentId, pageNumber) {
    return this.annotations.filter(annotation => 
      annotation.documentId === documentId && 
      annotation.pageNumber === pageNumber
    );
  }
  
  /**
   * Получение аннотации по ID
   * @param {string} id - ID аннотации
   * @returns {Object|null} Аннотация или null, если не найдена
   */
  getAnnotationById(id) {
    return this.annotations.find(annotation => annotation.id === id) || null;
  }
  
  /**
   * Добавление новой аннотации
   * @param {Object} annotationData - Данные аннотации
   * @returns {Object} Созданная аннотация
   */
  addAnnotation(annotationData) {
    const newAnnotation = {
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...annotationData
    };
    
    this.annotations.push(newAnnotation);
    this.saveAnnotations();
    
    return newAnnotation;
  }
  
  /**
   * Обновление аннотации
   * @param {string} id - ID аннотации
   * @param {Object} annotationData - Новые данные аннотации
   * @returns {Object|null} Обновленная аннотация или null, если аннотация не найдена
   */
  updateAnnotation(id, annotationData) {
    const index = this.annotations.findIndex(annotation => annotation.id === id);
    
    if (index !== -1) {
      this.annotations[index] = {
        ...this.annotations[index],
        ...annotationData,
        updatedAt: new Date().toISOString()
      };
      
      this.saveAnnotations();
      return this.annotations[index];
    }
    
    return null;
  }
  
  /**
   * Удаление аннотации
   * @param {string} id - ID аннотации
   * @returns {boolean} Результат операции
   */
  deleteAnnotation(id) {
    const initialLength = this.annotations.length;
    this.annotations = this.annotations.filter(annotation => annotation.id !== id);
    
    if (this.annotations.length !== initialLength) {
      this.saveAnnotations();
      return true;
    }
    
    return false;
  }
  
  /**
   * Удаление всех аннотаций для указанного документа
   * @param {string} documentId - ID документа
   * @returns {number} Количество удаленных аннотаций
   */
  deleteAnnotationsByDocument(documentId) {
    const initialLength = this.annotations.length;
    this.annotations = this.annotations.filter(annotation => annotation.documentId !== documentId);
    
    const deletedCount = initialLength - this.annotations.length;
    
    if (deletedCount > 0) {
      this.saveAnnotations();
    }
    
    return deletedCount;
  }
  
  /**
   * Удаление всех аннотаций для указанной страницы документа
   * @param {string} documentId - ID документа
   * @param {number} pageNumber - Номер страницы
   * @returns {number} Количество удаленных аннотаций
   */
  deleteAnnotationsByPage(documentId, pageNumber) {
    const initialLength = this.annotations.length;
    this.annotations = this.annotations.filter(annotation => 
      !(annotation.documentId === documentId && annotation.pageNumber === pageNumber)
    );
    
    const deletedCount = initialLength - this.annotations.length;
    
    if (deletedCount > 0) {
      this.saveAnnotations();
    }
    
    return deletedCount;
  }
  
  /**
   * Очистка всех аннотаций
   */
  clearAnnotations() {
    this.annotations = [];
    this.saveAnnotations();
  }
  
  /**
   * Поиск аннотаций по тексту
   * @param {string} searchText - Текст для поиска
   * @returns {Array} Массив найденных аннотаций
   */
  searchAnnotations(searchText) {
    if (!searchText) {
      return [];
    }
    
    const lowerSearchText = searchText.toLowerCase();
    
    return this.annotations.filter(annotation => {
      // Поиск в тексте аннотации
      if (annotation.text && annotation.text.toLowerCase().includes(lowerSearchText)) {
        return true;
      }
      
      // Поиск в комментарии к аннотации
      if (annotation.comment && annotation.comment.toLowerCase().includes(lowerSearchText)) {
        return true;
      }
      
      // Поиск в тегах аннотации
      if (annotation.tags && Array.isArray(annotation.tags)) {
        return annotation.tags.some(tag => tag.toLowerCase().includes(lowerSearchText));
      }
      
      return false;
    });
  }
  
  /**
   * Получение статистики по аннотациям
   * @returns {Object} Объект со статистикой
   */
  getAnnotationStats() {
    const stats = {
      total: this.annotations.length,
      byDocument: {},
      byType: {},
      byTag: {}
    };
    
    this.annotations.forEach(annotation => {
      // Статистика по документам
      if (!stats.byDocument[annotation.documentId]) {
        stats.byDocument[annotation.documentId] = 0;
      }
      stats.byDocument[annotation.documentId]++;
      
      // Статистика по типам аннотаций
      if (annotation.type) {
        if (!stats.byType[annotation.type]) {
          stats.byType[annotation.type] = 0;
        }
        stats.byType[annotation.type]++;
      }
      
      // Статистика по тегам
      if (annotation.tags && Array.isArray(annotation.tags)) {
        annotation.tags.forEach(tag => {
          if (!stats.byTag[tag]) {
            stats.byTag[tag] = 0;
          }
          stats.byTag[tag]++;
        });
      }
    });
    
    return stats;
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnnotationManager;
}
