/**
 * @file BugTracker.js
 * @description Система отслеживания и исправления ошибок
 */

class BugTracker {
  /**
   * Создает экземпляр системы отслеживания ошибок
   * @param {Object} options - Параметры инициализации
   * @param {Object} options.eventEmitter - Система событий
   * @param {Object} options.logger - Система логирования
   * @param {Object} options.vcsIntegration - Интеграция с системой контроля версий
   */
  constructor(options) {
    this.eventEmitter = options.eventEmitter;
    this.logger = options.logger;
    this.vcsIntegration = options.vcsIntegration;
    this.bugs = [];
    this.categories = ['UI', 'Performance', 'Functionality', 'Security', 'Compatibility'];
    this.priorities = ['Critical', 'High', 'Medium', 'Low'];
    this.statuses = ['New', 'Confirmed', 'In Progress', 'Fixed', 'Verified', 'Closed', 'Rejected'];
  }

  /**
   * Инициализирует систему отслеживания ошибок
   */
  initialize() {
    this.logger.info('Инициализация системы отслеживания ошибок');
    this.eventEmitter.emit('bugTracker:initialized');
    return this;
  }

  /**
   * Регистрирует новую ошибку
   * @param {Object} bug - Информация об ошибке
   * @param {string} bug.title - Заголовок ошибки
   * @param {string} bug.description - Описание ошибки
   * @param {string} bug.category - Категория ошибки
   * @param {string} bug.priority - Приоритет ошибки
   * @param {string} bug.reporter - Пользователь, сообщивший об ошибке
   * @param {Array} bug.steps - Шаги для воспроизведения
   * @param {Object} bug.environment - Информация об окружении
   * @returns {Object} Зарегистрированная ошибка
   */
  registerBug(bug) {
    this.logger.info(`Регистрация новой ошибки: ${bug.title}`);
    
    if (!this.validateBug(bug)) {
      throw new Error('Недопустимая информация об ошибке');
    }
    
    const newBug = {
      id: this.generateBugId(),
      title: bug.title,
      description: bug.description,
      category: bug.category,
      priority: bug.priority,
      reporter: bug.reporter,
      steps: bug.steps || [],
      environment: bug.environment || {},
      status: 'New',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      assignee: null,
      comments: [],
      attachments: [],
      relatedBugs: [],
      commits: []
    };
    
    this.bugs.push(newBug);
    this.eventEmitter.emit('bugTracker:bugRegistered', newBug);
    
    return newBug;
  }

  /**
   * Валидирует информацию об ошибке
   * @param {Object} bug - Информация об ошибке
   * @returns {boolean} Результат валидации
   * @private
   */
  validateBug(bug) {
    if (!bug.title || !bug.description) {
      return false;
    }
    
    if (bug.category && !this.categories.includes(bug.category)) {
      return false;
    }
    
    if (bug.priority && !this.priorities.includes(bug.priority)) {
      return false;
    }
    
    return true;
  }

  /**
   * Генерирует уникальный идентификатор ошибки
   * @returns {string} Уникальный идентификатор
   * @private
   */
  generateBugId() {
    const prefix = 'BUG';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 6);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Обновляет статус ошибки
   * @param {string} bugId - Идентификатор ошибки
   * @param {string} status - Новый статус
   * @param {string} comment - Комментарий к изменению статуса
   * @returns {Object} Обновленная ошибка
   */
  updateBugStatus(bugId, status, comment) {
    this.logger.info(`Обновление статуса ошибки ${bugId} на ${status}`);
    
    if (!this.statuses.includes(status)) {
      throw new Error(`Недопустимый статус: ${status}`);
    }
    
    const bug = this.getBug(bugId);
    if (!bug) {
      throw new Error(`Ошибка с идентификатором ${bugId} не найдена`);
    }
    
    const previousStatus = bug.status;
    bug.status = status;
    bug.updatedAt = new Date().toISOString();
    
    if (comment) {
      this.addComment(bugId, {
        author: 'System',
        text: `Статус изменен с "${previousStatus}" на "${status}": ${comment}`,
        timestamp: new Date().toISOString()
      });
    }
    
    this.eventEmitter.emit('bugTracker:bugStatusUpdated', { bug, previousStatus, newStatus: status });
    
    return bug;
  }

  /**
   * Назначает ошибку исполнителю
   * @param {string} bugId - Идентификатор ошибки
   * @param {string} assignee - Исполнитель
   * @returns {Object} Обновленная ошибка
   */
  assignBug(bugId, assignee) {
    this.logger.info(`Назначение ошибки ${bugId} исполнителю ${assignee}`);
    
    const bug = this.getBug(bugId);
    if (!bug) {
      throw new Error(`Ошибка с идентификатором ${bugId} не найдена`);
    }
    
    const previousAssignee = bug.assignee;
    bug.assignee = assignee;
    bug.updatedAt = new Date().toISOString();
    
    this.addComment(bugId, {
      author: 'System',
      text: previousAssignee ? 
        `Переназначено с "${previousAssignee}" на "${assignee}"` : 
        `Назначено "${assignee}"`,
      timestamp: new Date().toISOString()
    });
    
    this.eventEmitter.emit('bugTracker:bugAssigned', { bug, previousAssignee, newAssignee: assignee });
    
    return bug;
  }

  /**
   * Добавляет комментарий к ошибке
   * @param {string} bugId - Идентификатор ошибки
   * @param {Object} comment - Комментарий
   * @returns {Object} Обновленная ошибка
   */
  addComment(bugId, comment) {
    this.logger.info(`Добавление комментария к ошибке ${bugId}`);
    
    const bug = this.getBug(bugId);
    if (!bug) {
      throw new Error(`Ошибка с идентификатором ${bugId} не найдена`);
    }
    
    if (!comment.author || !comment.text) {
      throw new Error('Недопустимый комментарий');
    }
    
    const newComment = {
      id: this.generateCommentId(),
      author: comment.author,
      text: comment.text,
      timestamp: comment.timestamp || new Date().toISOString()
    };
    
    bug.comments.push(newComment);
    bug.updatedAt = new Date().toISOString();
    
    this.eventEmitter.emit('bugTracker:commentAdded', { bug, comment: newComment });
    
    return bug;
  }

  /**
   * Генерирует уникальный идентификатор комментария
   * @returns {string} Уникальный идентификатор
   * @private
   */
  generateCommentId() {
    const prefix = 'CMT';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 4);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Добавляет вложение к ошибке
   * @param {string} bugId - Идентификатор ошибки
   * @param {Object} attachment - Вложение
   * @returns {Object} Обновленная ошибка
   */
  addAttachment(bugId, attachment) {
    this.logger.info(`Добавление вложения к ошибке ${bugId}`);
    
    const bug = this.getBug(bugId);
    if (!bug) {
      throw new Error(`Ошибка с идентификатором ${bugId} не найдена`);
    }
    
    if (!attachment.name || !attachment.type || !attachment.url) {
      throw new Error('Недопустимое вложение');
    }
    
    const newAttachment = {
      id: this.generateAttachmentId(),
      name: attachment.name,
      type: attachment.type,
      url: attachment.url,
      size: attachment.size,
      uploadedBy: attachment.uploadedBy,
      timestamp: new Date().toISOString()
    };
    
    bug.attachments.push(newAttachment);
    bug.updatedAt = new Date().toISOString();
    
    this.eventEmitter.emit('bugTracker:attachmentAdded', { bug, attachment: newAttachment });
    
    return bug;
  }

  /**
   * Генерирует уникальный идентификатор вложения
   * @returns {string} Уникальный идентификатор
   * @private
   */
  generateAttachmentId() {
    const prefix = 'ATT';
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 4);
    return `${prefix}-${timestamp}-${random}`.toUpperCase();
  }

  /**
   * Связывает ошибки между собой
   * @param {string} bugId - Идентификатор ошибки
   * @param {string} relatedBugId - Идентификатор связанной ошибки
   * @param {string} relationType - Тип связи
   * @returns {Object} Обновленная ошибка
   */
  relateBugs(bugId, relatedBugId, relationType) {
    this.logger.info(`Связывание ошибок ${bugId} и ${relatedBugId}`);
    
    const bug = this.getBug(bugId);
    if (!bug) {
      throw new Error(`Ошибка с идентификатором ${bugId} не найдена`);
    }
    
    const relatedBug = this.getBug(relatedBugId);
    if (!relatedBug) {
      throw new Error(`Ошибка с идентификатором ${relatedBugId} не найдена`);
    }
    
    const relation = {
      bugId: relatedBugId,
      type: relationType || 'related'
    };
    
    // Проверка на дублирование связи
    const existingRelation = bug.relatedBugs.find(rel => rel.bugId === relatedBugId);
    if (existingRelation) {
      existingRelation.type = relationType;
    } else {
      bug.relatedBugs.push(relation);
    }
    
    bug.updatedAt = new Date().toISOString();
    
    this.eventEmitter.emit('bugTracker:bugsRelated', { bug, relatedBug, relationType });
    
    return bug;
  }

  /**
   * Связывает ошибку с коммитом в системе контроля версий
   * @param {string} bugId - Идентификатор ошибки
   * @param {Object} commit - Информация о коммите
   * @returns {Object} Обновленная ошибка
   */
  linkCommit(bugId, commit) {
    this.logger.info(`Связывание ошибки ${bugId} с коммитом ${commit.id}`);
    
    const bug = this.getBug(bugId);
    if (!bug) {
      throw new Error(`Ошибка с идентификатором ${bugId} не найдена`);
    }
    
    if (!commit.id || !commit.message) {
      throw new Error('Недопустимая информация о коммите');
    }
    
    const newCommit = {
      id: commit.id,
      message: commit.message,
      author: commit.author,
      timestamp: commit.timestamp || new Date().toISOString(),
      url: commit.url
    };
    
    // Проверка на дублирование коммита
    const existingCommit = bug.commits.find(c => c.id === commit.id);
    if (!existingCommit) {
      bug.commits.push(newCommit);
      bug.updatedAt = new Date().toISOString();
      
      // Если статус ошибки "New" или "Confirmed", автоматически изменить на "In Progress"
      if (bug.status === 'New' || bug.status === 'Confirmed') {
        this.updateBugStatus(bugId, 'In Progress', 'Автоматическое обновление статуса при связывании с коммитом');
      }
      
      this.eventEmitter.emit('bugTracker:commitLinked', { bug, commit: newCommit });
    }
    
    return bug;
  }

  /**
   * Получает ошибку по идентификатору
   * @param {string} bugId - Идентификатор ошибки
   * @returns {Object|null} Ошибка или null, если не найдена
   */
  getBug(bugId) {
    return this.bugs.find(bug => bug.id === bugId) || null;
  }

  /**
   * Получает список ошибок с фильтрацией
   * @param {Object} filters - Фильтры
   * @returns {Array} Отфильтрованный список ошибок
   */
  getBugs(filters = {}) {
    let filteredBugs = [...this.bugs];
    
    if (filters.status) {
      filteredBugs = filteredBugs.filter(bug => bug.status === filters.status);
    }
    
    if (filters.priority) {
      filteredBugs = filteredBugs.filter(bug => bug.priority === filters.priority);
    }
    
    if (filters.category) {
      filteredBugs = filteredBugs.filter(bug => bug.category === filters.category);
    }
    
    if (filters.assignee) {
      filteredBugs = filteredBugs.filter(bug => bug.assignee === filters.assignee);
    }
    
    if (filters.reporter) {
      filteredBugs = filteredBugs.filter(bug => bug.reporter === filters.reporter);
    }
    
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filteredBugs = filteredBugs.filter(bug => 
        bug.title.toLowerCase().includes(searchLower) || 
        bug.description.toLowerCase().includes(searchLower)
      );
    }
    
    // Сортировка
    if (filters.sortBy) {
      const sortField = filters.sortBy;
      const sortDirection = filters.sortDirection === 'desc' ? -1 : 1;
      
      filteredBugs.sort((a, b) => {
        if (a[sortField] < b[sortField]) return -1 * sortDirection;
        if (a[sortField] > b[sortField]) return 1 * sortDirection;
        return 0;
      });
    } else {
      // По умолчанию сортировка по приоритету и дате обновления
      filteredBugs.sort((a, b) => {
        const priorityOrder = { 'Critical': 0, 'High': 1, 'Medium': 2, 'Low': 3 };
        const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
        
        if (priorityDiff !== 0) return priorityDiff;
        
        // Если приоритеты равны, сортировка по дате обновления (сначала новые)
        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    }
    
    // Пагинация
    if (filters.limit) {
      const offset = filters.offset || 0;
      filteredBugs = filteredBugs.slice(offset, offset + filters.limit);
    }
    
    return filteredBugs;
  }

  /**
   * Генерирует отчет о состоянии исправлений
   * @param {Object} options - Параметры отчета
   * @returns {Object} Отчет о состоянии исправлений
   */
  generateReport(options = {}) {
    this.logger.info('Генерация отчета о состоянии исправлений');
    
    const allBugs = this.bugs;
    const statusCounts = {};
    const priorityCounts = {};
    const categoryCounts = {};
    
    // Подсчет количества ошибок по статусу, приоритету и категории
    allBugs.forEach(bug => {
      statusCounts[bug.status] = (statusCounts[bug.status] || 0) + 1;
      priorityCounts[bug.priority] = (priorityCounts[bug.priority] || 0) + 1;
      categoryCounts[bug.category] = (categoryCounts[bug.category] || 0) + 1;
    });
    
    // Расчет процента исправленных ошибок
    const fixedBugs = allBugs.filter(bug => ['Fixed', 'Verified', 'Closed'].includes(bug.status)).length;
    const fixRate = allBugs.length > 0 ? (fixedBugs / allBugs.length) * 100 : 0;
    
    // Расчет среднего времени исправления
    const fixedBugsWithDates = allBugs.filter(bug => 
      bug.status === 'Fixed' && 
      bug.createdAt && 
      bug.updatedAt
    );
    
    let averageFixTime = 0;
    
    if (fixedBugsWithDates.length > 0) {
      const totalFixTime = fixedBugsWithDates.reduce((sum, bug) => {
        const createdDate = new Date(bug.createdAt);
        const fixedDate = new Date(bug.updatedAt);
        return sum + (fixedDate - createdDate);
      }, 0);
      
      averageFixTime = totalFixTime / fixedBugsWithDates.length;
    }
    
    // Преобразование миллисекунд в дни
    const averageFixTimeDays = averageFixTime / (1000 * 60 * 60 * 24);
    
    // Формирование отчета
    const report = {
      timestamp: new Date().toISOString(),
      totalBugs: allBugs.length,
      statusDistribution: statusCounts,
      priorityDistribution: priorityCounts,
      categoryDistribution: categoryCounts,
      fixRate: fixRate.toFixed(2),
      averageFixTimeDays: averageFixTimeDays.toFixed(2),
      criticalBugsCount: priorityCounts['Critical'] || 0,
      openBugsCount: (statusCounts['New'] || 0) + (statusCounts['Confirmed'] || 0) + (statusCounts['In Progress'] || 0),
      recentlyFixedBugs: this.getRecentlyFixedBugs(options.recentDays || 7)
    };
    
    this.eventEmitter.emit('bugTracker:reportGenerated', report);
    
    return report;
  }

  /**
   * Получает список недавно исправленных ошибок
   * @param {number} days - Количество дней
   * @returns {Array} Список недавно исправленных ошибок
   * @private
   */
  getRecentlyFixedBugs(days) {
    const now = new Date();
    const cutoffDate = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
    
    return this.bugs.filter(bug => {
      if (bug.status !== 'Fixed' && bug.status !== 'Verified' && bug.status !== 'Closed') {
        return false;
      }
      
      const updatedDate = new Date(bug.updatedAt);
      return updatedDate >= cutoffDate;
    });
  }

  /**
   * Экспортирует данные об ошибках в указанном формате
   * @param {string} format - Формат экспорта (json, csv, html)
   * @param {Object} options - Параметры экспорта
   * @returns {string} Экспортированные данные
   */
  exportBugs(format = 'json', options = {}) {
    this.logger.info(`Экспорт данных об ошибках в формате ${format}`);
    
    const bugs = options.filters ? this.getBugs(options.filters) : this.bugs;
    
    switch (format.toLowerCase()) {
      case 'json':
        return JSON.stringify(bugs, null, 2);
        
      case 'csv':
        return this.exportToCSV(bugs, options);
        
      case 'html':
        return this.exportToHTML(bugs, options);
        
      default:
        throw new Error(`Неподдерживаемый формат экспорта: ${format}`);
    }
  }

  /**
   * Экспортирует данные об ошибках в формате CSV
   * @param {Array} bugs - Список ошибок
   * @param {Object} options - Параметры экспорта
   * @returns {string} Данные в формате CSV
   * @private
   */
  exportToCSV(bugs, options) {
    const fields = options.fields || ['id', 'title', 'status', 'priority', 'category', 'assignee', 'reporter', 'createdAt', 'updatedAt'];
    
    // Заголовок CSV
    let csv = fields.join(',') + '\n';
    
    // Данные
    bugs.forEach(bug => {
      const row = fields.map(field => {
        const value = bug[field];
        
        // Экранирование значений с запятыми
        if (value && typeof value === 'string' && value.includes(',')) {
          return `"${value}"`;
        }
        
        return value || '';
      });
      
      csv += row.join(',') + '\n';
    });
    
    return csv;
  }

  /**
   * Экспортирует данные об ошибках в формате HTML
   * @param {Array} bugs - Список ошибок
   * @param {Object} options - Параметры экспорта
   * @returns {string} Данные в формате HTML
   * @private
   */
  exportToHTML(bugs, options) {
    const fields = options.fields || ['id', 'title', 'status', 'priority', 'category', 'assignee', 'reporter', 'createdAt', 'updatedAt'];
    
    let html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Bug Report</title>
        <style>
          body { font-family: Arial, sans-serif; }
          table { border-collapse: collapse; width: 100%; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
          th { background-color: #f2f2f2; }
          tr:nth-child(even) { background-color: #f9f9f9; }
          .critical { background-color: #ffdddd; }
          .high { background-color: #ffffcc; }
        </style>
      </head>
      <body>
        <h1>Bug Report</h1>
        <p>Generated on: ${new Date().toLocaleString()}</p>
        <table>
          <thead>
            <tr>
              ${fields.map(field => `<th>${field}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
    `;
    
    bugs.forEach(bug => {
      const rowClass = bug.priority === 'Critical' ? 'critical' : (bug.priority === 'High' ? 'high' : '');
      
      html += `<tr class="${rowClass}">`;
      
      fields.forEach(field => {
        html += `<td>${bug[field] || ''}</td>`;
      });
      
      html += '</tr>';
    });
    
    html += `
          </tbody>
        </table>
      </body>
      </html>
    `;
    
    return html;
  }
}

module.exports = BugTracker;
