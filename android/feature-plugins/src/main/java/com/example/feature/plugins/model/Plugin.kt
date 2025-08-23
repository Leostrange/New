package com.example.feature.plugins.model

import androidx.compose.runtime.Immutable

/**
 * Модель плагина для Mr.Comic
 */
@Immutable
data class Plugin(
    val id: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val category: PluginCategory,
    val type: PluginType,
    val permissions: List<PluginPermission> = emptyList(),
    val dependencies: List<String> = emptyList(),
    val isEnabled: Boolean = false,
    val isInstalled: Boolean = false,
    val configurable: Boolean = false,
    val iconUrl: String? = null,
    val sourceUrl: String? = null,
    val packagePath: String? = null,
    val metadata: Map<String, String> = emptyMap()
)

/**
 * Категории плагинов
 */
enum class PluginCategory {
    READER_ENHANCEMENT,    // Улучшение читалки
    IMAGE_PROCESSING,      // Обработка изображений
    TRANSLATION,           // Перевод
    EXPORT,               // Экспорт
    UTILITY,              // Утилиты
    THEME,                // Темы
    FORMAT_SUPPORT,       // Поддержка форматов
    INTEGRATION           // Интеграция
}

/**
 * Типы плагинов
 */
enum class PluginType {
    JAVASCRIPT,    // JavaScript плагин
    NATIVE,        // Нативный плагин
    HYBRID         // Гибридный плагин
}

/**
 * Разрешения плагинов
 */
enum class PluginPermission {
    READ_FILES,           // Чтение файлов
    WRITE_FILES,          // Запись файлов
    NETWORK_ACCESS,       // Доступ к сети
    CAMERA_ACCESS,        // Доступ к камере
    STORAGE_ACCESS,       // Доступ к хранилищу
    SYSTEM_SETTINGS,      // Доступ к настройкам системы
    READER_CONTROL,       // Управление читалкой
    UI_MODIFICATION       // Изменение интерфейса
}

/**
 * Состояние плагина
 */
enum class PluginState {
    INACTIVE,      // Неактивен
    LOADING,       // Загружается
    ACTIVE,        // Активен
    ERROR,         // Ошибка
    UPDATING       // Обновляется
}

/**
 * Результат выполнения плагина
 */
data class PluginResult<T>(
    val success: Boolean,
    val data: T? = null,
    val error: String? = null
) {
    companion object {
        fun <T> success(data: T): PluginResult<T> = PluginResult(true, data)
        fun <T> error(message: String): PluginResult<T> = PluginResult(false, error = message)
    }
}

/**
 * Контекст выполнения плагина
 */
data class PluginExecutionContext(
    val pluginId: String,
    val permissions: Set<PluginPermission>,
    val configuration: Map<String, Any> = emptyMap()
)