const mongoose = require('mongoose');
const config = require('../config/config');

// Функция для подключения к MongoDB
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(config.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log(`MongoDB подключена: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Ошибка подключения к MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;
