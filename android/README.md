# Mr.Comic Android Application

Современное Android приложение для чтения комиксов с поддержкой переводов и кастомизации.

## Архитектура

Проект использует модульную архитектуру с разделением на слои:

### Core модули
- **core-model** - модели данных и доменные объекты
- **core-ui** - общие UI компоненты и темы
- **core-database** - Room база данных и DAO
- **core-di** - Dependency Injection с Hilt
- **core-navigation** - навигационная система
- **core-notifications** - система уведомлений

### Feature модули
- **feature-library** - библиотека комиксов с поиском и фильтрами
- **feature-reader** - читалка с настройками отображения
- **feature-settings** - настройки приложения и кастомизация
- **feature-translations** - OCR и система переводов
- **feature-details** - детальная информация о комиксах
- **feature-editing** - инструменты редактирования
- **feature-plugins** - система плагинов

## Технологии

- **Jetpack Compose** - современный UI toolkit
- **Material Design 3** - дизайн система Google
- **Hilt** - Dependency Injection
- **Room** - локальная база данных
- **Navigation Compose** - навигация между экранами
- **Coroutines & Flow** - асинхронное программирование

## Функциональность

### Основные возможности
- Чтение комиксов с настраиваемым интерфейсом
- OCR распознавание текста и переводы
- Система тем (Light/Dark/Sepia) и кастомизация
- Облачная синхронизация и офлайн режим
- Система плагинов для расширения функциональности

### Кастомизация
- Конструктор тем с предпросмотром
- Выбор шрифтов и наборов иконок
- Настройки читалки (размер текста, интервалы)
- Пользовательские цветовые схемы

## Установка

1. Откройте проект в Android Studio
2. Синхронизируйте Gradle файлы
3. Запустите на устройстве или эмуляторе

## Требования

- Android 7.0 (API 24) и выше
- Kotlin 1.9+
- Compose BOM 2024.02.00+
\`\`\`

```kotlin file="android/core-database/src/main/java/com/mrcomic/core/database/entity/ComicEntity.kt"
package com.mrcomic.core.database.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "comics")
data class ComicEntity(
    @PrimaryKey val id: String,
    val title: String,
    val author: String,
    val coverUrl: String,
    val description: String,
    val totalPages: Int,
    val currentPage: Int = 0,
    val isDownloaded: Boolean = false,
    val isFavorite: Boolean = false,
    val lastReadTime: Long = 0L,
    val tags: List<String> = emptyList(),
    val rating: Float = 0f
)
