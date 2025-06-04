const express = require('express');
const User = require('../models/User');
const Theme = require('../models/Theme');
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

// Получение информации о пользователе
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select('-passwordHash -__v');
    
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение тем пользователя
router.get('/:id/themes', async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;
    
    // Проверка существования пользователя
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Получение тем пользователя
    const themes = await Theme.find({ authorId: req.params.id, isPublic: true })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));
    
    // Получение общего количества тем для пагинации
    const total = await Theme.countDocuments({ authorId: req.params.id, isPublic: true });
    
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

// Обновление профиля пользователя
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    // Проверка прав доступа
    if (req.params.id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Нет прав для редактирования этого профиля' });
    }
    
    const { username, bio, avatarUrl, preferences } = req.body;
    
    // Проверка существования пользователя
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Проверка уникальности имени пользователя
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ message: 'Пользователь с таким именем уже существует' });
      }
      user.username = username;
    }
    
    // Обновление полей
    if (bio !== undefined) user.bio = bio;
    if (avatarUrl) user.avatarUrl = avatarUrl;
    if (preferences) {
      user.preferences = {
        ...user.preferences,
        ...preferences
      };
    }
    
    const updatedUser = await user.save();
    
    res.status(200).json({
      message: 'Профиль успешно обновлен',
      user: {
        id: updatedUser._id,
        username: updatedUser.username,
        email: updatedUser.email,
        bio: updatedUser.bio,
        avatarUrl: updatedUser.avatarUrl,
        preferences: updatedUser.preferences
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Подписка на пользователя
router.post('/:id/follow', authenticateToken, async (req, res) => {
  try {
    // Проверка, что пользователь не подписывается сам на себя
    if (req.params.id === req.user.id) {
      return res.status(400).json({ message: 'Нельзя подписаться на самого себя' });
    }
    
    // Проверка существования пользователя
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // Проверка, подписан ли уже пользователь
    if (currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Вы уже подписаны на этого пользователя' });
    }
    
    // Добавление подписки
    currentUser.following.push(req.params.id);
    await currentUser.save();
    
    // Добавление подписчика целевому пользователю
    targetUser.followers.push(req.user.id);
    await targetUser.save();
    
    res.status(200).json({ message: 'Подписка успешно оформлена' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Отписка от пользователя
router.post('/:id/unfollow', authenticateToken, async (req, res) => {
  try {
    // Проверка существования пользователя
    const targetUser = await User.findById(req.params.id);
    if (!targetUser) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    const currentUser = await User.findById(req.user.id);
    
    // Проверка, подписан ли пользователь
    if (!currentUser.following.includes(req.params.id)) {
      return res.status(400).json({ message: 'Вы не подписаны на этого пользователя' });
    }
    
    // Удаление подписки
    currentUser.following = currentUser.following.filter(
      id => id.toString() !== req.params.id
    );
    await currentUser.save();
    
    // Удаление подписчика у целевого пользователя
    targetUser.followers = targetUser.followers.filter(
      id => id.toString() !== req.user.id
    );
    await targetUser.save();
    
    res.status(200).json({ message: 'Вы успешно отписались' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение подписчиков пользователя
router.get('/:id/followers', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Проверка существования пользователя
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Получение подписчиков с пагинацией
    const followers = await User.find({ _id: { $in: user.followers } })
      .select('username avatarUrl bio')
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      followers,
      pagination: {
        total: user.followers.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user.followers.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Получение подписок пользователя
router.get('/:id/following', async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (page - 1) * limit;
    
    // Проверка существования пользователя
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    // Получение подписок с пагинацией
    const following = await User.find({ _id: { $in: user.following } })
      .select('username avatarUrl bio')
      .skip(skip)
      .limit(parseInt(limit));
    
    res.status(200).json({
      following,
      pagination: {
        total: user.following.length,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(user.following.length / limit)
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
