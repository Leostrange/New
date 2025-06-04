const express = require('express');
const Theme = require('../models/Theme');
const Rating = require('../models/Rating');
const Comment = require('../models/Comment');
const Download = require('../models/Download');
const router = express.Router();

// Middleware для проверки токена (импортируем из auth.routes.js)
const jwt = require('jsonwebtoken');
const config = require('../config/config');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Требуется авторизация' });
  }
  
  jwt.verify(token, config.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ message: 'Недействительный токен' });
    }
    req.user = user;
    next();
  });
};

// Получение списка тем с пагинацией и фильтрацией
router.get('/', async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      sort = 'createdAt', 
      order = 'desc',
      search = '',
      tags = ''
    } = req.query;
    
    const skip = (page - 1) * limit;
    const sortOrder = order === 'desc' ? -1 : 1;
    const sortOptions = {};
    sortOptions[sort] = sortOrder;
    
    // Построение фильтра
    const filter = { isPublic: true };
    
    // Поиск по тексту
    if (search) {
      filter.$text = { $search: search };
    }
    
    // Фильтрация по тегам
    if (tags) {
      const tagArray = tags.split(',');
      filter.tags = { $in: tagArray };
    }
    
    // Получение тем
    const themes = await Theme.find(filter)
      .sort(sortOptions)
      .skip(skip)
      .limit(parseInt(limit))
      .populate('authorId', 'username avatarUrl');
    
    // Получение общего количества тем для пагинации
    const total = await Theme.countDocuments(filter);
    
    res.status(200).json({
      themes,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение популярных тем
router.get('/trending', async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    
    const themes = await Theme.find({ isPublic: true })
      .sort({ 'rating.average': -1, downloads: -1 })
      .limit(parseInt(limit))
      .populate('authorId', 'username avatarUrl');
    
    res.status(200).json(themes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение рекомендованных тем
router.get('/recommended', authenticateToken, async (req, res) => {
  try {
    const { limit = 10 } = req.query;
    const userId = req.user.id;
    
    // В реальном приложении здесь будет более сложная логика рекомендаций
    // Например, на основе предыдущих загрузок, рейтингов и т.д.
    // Пока просто возвращаем популярные темы
    
    const themes = await Theme.find({ isPublic: true })
      .sort({ 'rating.average': -1, downloads: -1 })
      .limit(parseInt(limit))
      .populate('authorId', 'username avatarUrl');
    
    res.status(200).json(themes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение детальной информации о теме
router.get('/:id', async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id)
      .populate('authorId', 'username avatarUrl bio');
    
    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }
    
    res.status(200).json(theme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Создание новой темы
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { 
      name, 
      description, 
      version, 
      isPublic, 
      previewImageUrl, 
      themeData, 
      tags 
    } = req.body;
    
    const theme = new Theme({
      name,
      description,
      version,
      isPublic,
      previewImageUrl,
      authorId: req.user.id,
      themeData,
      tags
    });
    
    const savedTheme = await theme.save();
    
    res.status(201).json(savedTheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обновление существующей темы
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }
    
    // Проверка прав доступа
    if (theme.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для редактирования этой темы' });
    }
    
    const { 
      name, 
      description, 
      version, 
      isPublic, 
      previewImageUrl, 
      themeData, 
      tags 
    } = req.body;
    
    // Обновление полей
    theme.name = name || theme.name;
    theme.description = description || theme.description;
    theme.version = version || theme.version;
    theme.isPublic = isPublic !== undefined ? isPublic : theme.isPublic;
    theme.previewImageUrl = previewImageUrl || theme.previewImageUrl;
    theme.themeData = themeData || theme.themeData;
    theme.tags = tags || theme.tags;
    
    const updatedTheme = await theme.save();
    
    res.status(200).json(updatedTheme);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Удаление темы
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    const theme = await Theme.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }
    
    // Проверка прав доступа
    if (theme.authorId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для удаления этой темы' });
    }
    
    await theme.remove();
    
    // Удаление связанных данных
    await Rating.deleteMany({ themeId: req.params.id });
    await Comment.deleteMany({ themeId: req.params.id });
    
    res.status(200).json({ message: 'Тема успешно удалена' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Оценка темы
router.post('/:id/rate', authenticateToken, async (req, res) => {
  try {
    const { value } = req.body;
    
    if (!value || value < 1 || value > 5) {
      return res.status(400).json({ message: 'Оценка должна быть от 1 до 5' });
    }
    
    const theme = await Theme.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }
    
    // Проверка существующей оценки
    let rating = await Rating.findOne({ 
      themeId: req.params.id, 
      userId: req.user.id 
    });
    
    if (rating) {
      // Обновление существующей оценки
      rating.value = value;
      await rating.save();
    } else {
      // Создание новой оценки
      rating = new Rating({
        themeId: req.params.id,
        userId: req.user.id,
        value
      });
      await rating.save();
    }
    
    // Обновление средней оценки темы
    const ratings = await Rating.find({ themeId: req.params.id });
    const totalRating = ratings.reduce((sum, item) => sum + item.value, 0);
    const averageRating = totalRating / ratings.length;
    
    theme.rating.average = averageRating;
    theme.rating.count = ratings.length;
    await theme.save();
    
    res.status(200).json({ 
      message: 'Оценка успешно сохранена',
      rating: {
        value,
        average: averageRating,
        count: ratings.length
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Добавление комментария к теме
router.post('/:id/comments', authenticateToken, async (req, res) => {
  try {
    const { content, parentId } = req.body;
    
    if (!content) {
      return res.status(400).json({ message: 'Содержание комментария не может быть пустым' });
    }
    
    const theme = await Theme.findById(req.params.id);
    
    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }
    
    const comment = new Comment({
      themeId: req.params.id,
      userId: req.user.id,
      parentId: parentId || null,
      content
    });
    
    const savedComment = await comment.save();
    
    // Получение информации о пользователе для ответа
    const populatedComment = await Comment.findById(savedComment._id)
      .populate('userId', 'username avatarUrl');
    
    res.status(201).json(populatedComment);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение комментариев к теме
router.get('/:id/comments', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Получение комментариев верхнего уровня
    const comments = await Comment.find({ 
      themeId: req.params.id,
      parentId: null
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit))
      .populate('userId', 'username avatarUrl');
    
    // Получение общего количества комментариев для пагинации
    const total = await Comment.countDocuments({ 
      themeId: req.params.id,
      parentId: null
    });
    
    // Получение ответов на комментарии
    const commentIds = comments.map(comment => comment._id);
    const replies = await Comment.find({
      themeId: req.params.id,
      parentId: { $in: commentIds }
    })
      .populate('userId', 'username avatarUrl')
      .sort({ createdAt: 1 });
    
    // Группировка ответов по родительскому комментарию
    const repliesByParent = {};
    replies.forEach(reply => {
      if (!repliesByParent[reply.parentId]) {
        repliesByParent[reply.parentId] = [];
      }
      repliesByParent[reply.parentId].push(reply);
    });
    
    // Добавление ответов к комментариям
    const commentsWithReplies = comments.map(comment => {
      const commentObj = comment.toObject();
      commentObj.replies = repliesByParent[comment._id] || [];
      return commentObj;
    });
    
    res.status(200).json({
      comments: commentsWithReplies,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Регистрация загрузки темы
router.post('/:id/download', async (req, res) => {
  try {
    const { deviceInfo } = req.body;
    const themeId = req.params.id;
    
    // Проверка существования темы
    const theme = await Theme.findById(themeId);
    if (!theme) {
      return res.status(404).json({ message: 'Тема не найдена' });
    }
    
    // Получение ID пользователя, если он авторизован
    let userId = null;
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    
    if (token) {
      try {
        const decoded = jwt.verify(token, config.JWT_SECRET);
        userId = decoded.id;
      } catch (err) {
        // Игнорируем ошибку, просто не устанавливаем userId
      }
    }
    
    // Создание записи о загрузке
    const download = new Download({
      themeId,
      userId,
      deviceInfo
    });
    
    await download.save();
    
    // Увеличение счетчика загрузок темы
    theme.downloads += 1;
    await theme.save();
    
    res.status(200).json({
      message: 'Загрузка успешно зарегистрирована',
      downloads: theme.downloads
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
