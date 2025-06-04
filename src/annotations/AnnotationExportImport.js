/**
 * AnnotationExportImport.js
 *
 * Модуль для экспорта и импорта аннотаций в различных форматах.
 * Поддерживает форматы JSON, CSV и TXT.
 *
 * @version 1.0.0
 * @author Manus AI
 */

class AnnotationExportImport {
  /**
   * Создает экземпляр модуля экспорта/импорта аннотаций
   * @param {Object} annotationManager - Экземпляр менеджера аннотаций
   */
  constructor(annotationManager) {
    this.annotationManager = annotationManager;
  }
  
  /**
   * Экспорт аннотаций в формате JSON
   * @param {Array} annotations - Массив аннотаций для экспорта (если не указан, используются все аннотации)
   * @returns {string} JSON-строка с аннотациями
   */
  exportToJSON(annotations) {
    const dataToExport = annotations || this.annotationManager.getAllAnnotations();
    
    const exportData = {
      format: 'mr-comic-annotations',
      version: '1.0',
      exportDate: new Date().toISOString(),
      annotations: dataToExport
    };
    
    return JSON.stringify(exportData, null, 2);
  }
  
  /**
   * Экспорт аннотаций в формате CSV
   * @param {Array} annotations - Массив аннотаций для экспорта (если не указан, используются все аннотации)
   * @returns {string} CSV-строка с аннотациями
   */
  exportToCSV(annotations) {
    const dataToExport = annotations || this.annotationManager.getAllAnnotations();
    
    // Определяем заголовки CSV
    const headers = [
      'id',
      'documentId',
      'pageNumber',
      'text',
      'comment',
      'type',
      'tags',
      'x',
      'y',
      'width',
      'height',
      'color',
      'createdAt',
      'updatedAt'
    ];
    
    // Формируем строку заголовков
    let csvContent = headers.join(',') + '\n';
    
    // Добавляем данные
    dataToExport.forEach(annotation => {
      const row = headers.map(header => {
        let value = annotation[header];
        
        // Обработка специальных случаев
        if (header === 'tags' && Array.isArray(value)) {
          value = value.join('|');
        }
        
        // Экранирование значений с запятыми и кавычками
        if (value === null || value === undefined) {
          return '';
        } else if (typeof value === 'string' && (value.includes(',') || value.includes('"') || value.includes('\n'))) {
          return `"${value.replace(/"/g, '""')}"`;
        } else {
          return String(value);
        }
      });
      
      csvContent += row.join(',') + '\n';
    });
    
    return csvContent;
  }
  
  /**
   * Экспорт аннотаций в формате TXT
   * @param {Array} annotations - Массив аннотаций для экспорта (если не указан, используются все аннотации)
   * @returns {string} Текстовое представление аннотаций
   */
  exportToTXT(annotations) {
    const dataToExport = annotations || this.annotationManager.getAllAnnotations();
    
    let txtContent = `# Mr.Comic - Экспорт аннотаций\n`;
    txtContent += `# Дата экспорта: ${new Date().toLocaleString()}\n`;
    txtContent += `# Количество аннотаций: ${dataToExport.length}\n\n`;
    
    dataToExport.forEach((annotation, index) => {
      txtContent += `## Аннотация ${index + 1}\n`;
      txtContent += `ID: ${annotation.id}\n`;
      txtContent += `Документ: ${annotation.documentId}\n`;
      txtContent += `Страница: ${annotation.pageNumber}\n`;
      
      if (annotation.text) {
        txtContent += `Текст: ${annotation.text}\n`;
      }
      
      if (annotation.comment) {
        txtContent += `Комментарий: ${annotation.comment}\n`;
      }
      
      if (annotation.type) {
        txtContent += `Тип: ${annotation.type}\n`;
      }
      
      if (annotation.tags && annotation.tags.length > 0) {
        txtContent += `Теги: ${annotation.tags.join(', ')}\n`;
      }
      
      if (annotation.createdAt) {
        txtContent += `Создано: ${new Date(annotation.createdAt).toLocaleString()}\n`;
      }
      
      if (annotation.updatedAt) {
        txtContent += `Обновлено: ${new Date(annotation.updatedAt).toLocaleString()}\n`;
      }
      
      txtContent += '\n';
    });
    
    return txtContent;
  }
  
  /**
   * Импорт аннотаций из формата JSON
   * @param {string} jsonString - JSON-строка с аннотациями
   * @param {Object} options - Параметры импорта
   * @param {boolean} options.replace - Заменить существующие аннотации (по умолчанию false)
   * @param {boolean} options.skipDuplicates - Пропускать дубликаты (по умолчанию true)
   * @returns {Object} Результат импорта {success, count, errors}
   */
  importFromJSON(jsonString, options = {}) {
    const defaultOptions = {
      replace: false,
      skipDuplicates: true
    };
    
    const importOptions = { ...defaultOptions, ...options };
    const result = {
      success: false,
      count: 0,
      errors: []
    };
    
    try {
      const importData = JSON.parse(jsonString);
      
      // Проверка формата
      if (!importData.annotations || !Array.isArray(importData.annotations)) {
        result.errors.push('Неверный формат данных: отсутствует массив аннотаций');
        return result;
      }
      
      // Если указана опция replace, очищаем существующие аннотации
      if (importOptions.replace) {
        this.annotationManager.clearAnnotations();
      }
      
      // Импортируем аннотации
      const existingIds = new Set(
        this.annotationManager.getAllAnnotations().map(a => a.id)
      );
      
      importData.annotations.forEach(annotation => {
        try {
          // Проверка на дубликаты
          if (importOptions.skipDuplicates && existingIds.has(annotation.id)) {
            return;
          }
          
          // Добавляем аннотацию
          this.annotationManager.addAnnotation(annotation);
          result.count++;
        } catch (error) {
          result.errors.push(`Ошибка при импорте аннотации ${annotation.id}: ${error.message}`);
        }
      });
      
      result.success = true;
    } catch (error) {
      result.errors.push(`Ошибка при разборе JSON: ${error.message}`);
    }
    
    return result;
  }
  
  /**
   * Импорт аннотаций из формата CSV
   * @param {string} csvString - CSV-строка с аннотациями
   * @param {Object} options - Параметры импорта
   * @param {boolean} options.replace - Заменить существующие аннотации (по умолчанию false)
   * @param {boolean} options.skipDuplicates - Пропускать дубликаты (по умолчанию true)
   * @returns {Object} Результат импорта {success, count, errors}
   */
  importFromCSV(csvString, options = {}) {
    const defaultOptions = {
      replace: false,
      skipDuplicates: true
    };
    
    const importOptions = { ...defaultOptions, ...options };
    const result = {
      success: false,
      count: 0,
      errors: []
    };
    
    try {
      // Разбор CSV
      const lines = csvString.split('\n');
      if (lines.length < 2) {
        result.errors.push('CSV файл не содержит данных');
        return result;
      }
      
      // Получаем заголовки
      const headers = this.parseCSVLine(lines[0]);
      
      // Если указана опция replace, очищаем существующие аннотации
      if (importOptions.replace) {
        this.annotationManager.clearAnnotations();
      }
      
      // Получаем существующие ID для проверки дубликатов
      const existingIds = new Set(
        this.annotationManager.getAllAnnotations().map(a => a.id)
      );
      
      // Импортируем аннотации
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        try {
          const values = this.parseCSVLine(line);
          const annotation = {};
          
          // Заполняем объект аннотации
          headers.forEach((header, index) => {
            if (index < values.length) {
              let value = values[index];
              
              // Обработка специальных случаев
              if (header === 'tags' && value) {
                value = value.split('|').filter(tag => tag.trim());
              } else if (header === 'pageNumber' && value) {
                value = parseInt(value, 10);
              } else if ((header === 'x' || header === 'y' || header === 'width' || header === 'height') && value) {
                value = parseFloat(value);
              }
              
              annotation[header] = value;
            }
          });
          
          // Проверка на дубликаты
          if (importOptions.skipDuplicates && existingIds.has(annotation.id)) {
            continue;
          }
          
          // Добавляем аннотацию
          this.annotationManager.addAnnotation(annotation);
          result.count++;
        } catch (error) {
          result.errors.push(`Ошибка при импорте строки ${i + 1}: ${error.message}`);
        }
      }
      
      result.success = true;
    } catch (error) {
      result.errors.push(`Ошибка при разборе CSV: ${error.message}`);
    }
    
    return result;
  }
  
  /**
   * Разбор строки CSV с учетом кавычек и экранирования
   * @param {string} line - Строка CSV
   * @returns {Array} Массив значений
   */
  parseCSVLine(line) {
    const values = [];
    let currentValue = '';
    let inQuotes = false;
    
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      const nextChar = line[i + 1];
      
      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          // Экранированная кавычка внутри кавычек
          currentValue += '"';
          i++; // Пропускаем следующую кавычку
        } else {
          // Начало или конец строки в кавычках
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        // Разделитель вне кавычек
        values.push(currentValue);
        currentValue = '';
      } else {
        // Обычный символ
        currentValue += char;
      }
    }
    
    // Добавляем последнее значение
    values.push(currentValue);
    
    return values;
  }
  
  /**
   * Экспорт аннотаций в указанном формате
   * @param {string} format - Формат экспорта ('json', 'csv', 'txt')
   * @param {Array} annotations - Массив аннотаций для экспорта
   * @returns {string} Экспортированные данные
   */
  export(format, annotations) {
    switch (format.toLowerCase()) {
      case 'json':
        return this.exportToJSON(annotations);
      case 'csv':
        return this.exportToCSV(annotations);
      case 'txt':
        return this.exportToTXT(annotations);
      default:
        throw new Error(`Неподдерживаемый формат экспорта: ${format}`);
    }
  }
  
  /**
   * Импорт аннотаций из указанного формата
   * @param {string} format - Формат импорта ('json', 'csv')
   * @param {string} data - Данные для импорта
   * @param {Object} options - Параметры импорта
   * @returns {Object} Результат импорта
   */
  import(format, data, options) {
    switch (format.toLowerCase()) {
      case 'json':
        return this.importFromJSON(data, options);
      case 'csv':
        return this.importFromCSV(data, options);
      default:
        return {
          success: false,
          count: 0,
          errors: [`Неподдерживаемый формат импорта: ${format}`]
        };
    }
  }
  
  /**
   * Определение формата данных
   * @param {string} data - Данные для анализа
   * @returns {string} Определенный формат ('json', 'csv', 'unknown')
   */
  detectFormat(data) {
    data = data.trim();
    
    if (data.startsWith('{') && data.endsWith('}')) {
      return 'json';
    } else if (data.includes(',') && data.split('\n')[0].includes(',')) {
      return 'csv';
    } else {
      return 'unknown';
    }
  }
}

// Экспортируем класс
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnnotationExportImport;
}
