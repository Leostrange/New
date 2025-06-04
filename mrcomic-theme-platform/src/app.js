const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const config = require('./config/config');
const connectDB = require('./db/mongoose');

// Импорт маршрутов
const authRoutes = require('./routes/auth.routes');
const themeRoutes = require('./routes/theme.routes');
const userRoutes = require('./routes/user.routes');

// Инициализация приложения Express
const app = express();

// Подключение к базе данных
connectDB();

// Middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Базовый маршрут API
app.get('/', (req, res) => {
  res.json({ 
    message: 'Mr.Comic Theme Platform API',
    version: config.API_VERSION
  });
});

// Маршруты API
app.use(`/api/${config.API_VERSION}/auth`, authRoutes);
app.use(`/api/${config.API_VERSION}/themes`, themeRoutes);
app.use(`/api/${config.API_VERSION}/users`, userRoutes);

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.statusCode || 500).json({
    status: 'error',
    message: err.message || 'Внутренняя ошибка сервера'
  });
});

// Запуск сервера
const PORT = config.PORT;
app.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT} в режиме ${config.NODE_ENV}`);
});

module.exports = app;
