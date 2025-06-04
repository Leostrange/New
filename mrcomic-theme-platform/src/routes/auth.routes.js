const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const User = require('../models/User');
const config = require('../config/config');

const router = express.Router();

// Middleware для проверки токена
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

// Регистрация нового пользователя
router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    // Проверка существования пользователя
    const existingUser = await User.findOne({ 
      $or: [{ email }, { username }] 
    });
    
    if (existingUser) {
      return res.status(400).json({ 
        message: 'Пользователь с таким email или именем уже существует' 
      });
    }
    
    // Создание нового пользователя
    const user = new User({
      username,
      email,
      passwordHash: password // будет хешироваться в pre-save хуке
    });
    
    await user.save();
    
    // Генерация токенов
    const accessToken = jwt.sign(
      { id: user._id, role: user.role }, 
      config.JWT_SECRET, 
      { expiresIn: config.JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id }, 
      config.JWT_REFRESH_SECRET, 
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );
    
    res.status(201).json({
      message: 'Пользователь успешно зарегистрирован',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Вход в систему
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Поиск пользователя
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    // Проверка пароля
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Неверный email или пароль' });
    }
    
    // Генерация токенов
    const accessToken = jwt.sign(
      { id: user._id, role: user.role }, 
      config.JWT_SECRET, 
      { expiresIn: config.JWT_EXPIRES_IN }
    );
    
    const refreshToken = jwt.sign(
      { id: user._id }, 
      config.JWT_REFRESH_SECRET, 
      { expiresIn: config.JWT_REFRESH_EXPIRES_IN }
    );
    
    res.status(200).json({
      message: 'Вход выполнен успешно',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      tokens: {
        accessToken,
        refreshToken
      }
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Обновление токена
router.post('/refresh', async (req, res) => {
  try {
    const { refreshToken } = req.body;
    
    if (!refreshToken) {
      return res.status(401).json({ message: 'Требуется refresh token' });
    }
    
    // Проверка refresh token
    jwt.verify(refreshToken, config.JWT_REFRESH_SECRET, async (err, decoded) => {
      if (err) {
        return res.status(403).json({ message: 'Недействительный refresh token' });
      }
      
      // Поиск пользователя
      const user = await User.findById(decoded.id);
      if (!user) {
        return res.status(404).json({ message: 'Пользователь не найден' });
      }
      
      // Генерация нового access token
      const accessToken = jwt.sign(
        { id: user._id, role: user.role }, 
        config.JWT_SECRET, 
        { expiresIn: config.JWT_EXPIRES_IN }
      );
      
      res.status(200).json({
        accessToken
      });
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Выход из системы
router.post('/logout', authenticateToken, (req, res) => {
  // В реальном приложении здесь можно добавить логику для инвалидации токенов
  // например, добавление токена в черный список
  res.status(200).json({ message: 'Выход выполнен успешно' });
});

// Проверка текущего пользователя
router.get('/me', authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-passwordHash');
    if (!user) {
      return res.status(404).json({ message: 'Пользователь не найден' });
    }
    
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
