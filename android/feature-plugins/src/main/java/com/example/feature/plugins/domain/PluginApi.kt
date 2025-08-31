package com.example.feature.plugins.domain

import com.example.feature.plugins.model.PluginPermission
import com.example.feature.plugins.model.PluginResult

/**
 * API для взаимодействия плагинов с приложением Mr.Comic
 * 
 * Этот интерфейс предоставляет плагинам безопасный доступ к функциям приложения
 * в соответствии с предоставленными разрешениями.
 */
interface PluginApi {
    
    /**
     * Получить идентификатор плагина
     */
    fun getPluginId(): String
    
    /**
     * Проверить наличие разрешения у плагина
     * 
     * @param permission Разрешение для проверки
     * @return true, если разрешение предоставлено, иначе false
     */
    fun hasPermission(permission: PluginPermission): Boolean
    
    /**
     * Выполнить системную команду
     * 
     * @param command Идентификатор команды
     * @param params Параметры команды
     * @return Результат выполнения команды
     */
    suspend fun executeSystemCommand(
        command: String, 
        params: Map<String, Any> = emptyMap()
    ): PluginResult<Any?>
    
    /**
     * Получить данные приложения
     * 
     * @param key Ключ данных
     * @return Значение данных или null, если данные не найдены
     */
    fun getAppData(key: String): Any?
    
    /**
     * Сохранить данные плагина
     * 
     * @param key Ключ данных
     * @param value Значение данных
     */
    fun setPluginData(key: String, value: Any?)
    
    /**
     * Получить данные плагина
     * 
     * @param key Ключ данных
     * @return Значение данных или null, если данные не найдены
     */
    fun getPluginData(key: String): Any?
    
    /**
     * Логирование сообщения плагина
     * 
     * @param message Сообщение для логирования
     * @param level Уровень логирования (debug, info, warn, error)
     */
    fun log(message: String, level: LogLevel = LogLevel.INFO)
    
    /**
     * Получить информацию о текущем комиксе
     * 
     * @return Информация о текущем комиксе или null, если комикс не открыт
     */
    fun getCurrentComicInfo(): ComicInfo?
    
    /**
     * Получить информацию о текущей странице
     * 
     * @return Информация о текущей странице или null, если страница не открыта
     */
    fun getCurrentPageInfo(): PageInfo?
    
    /**
     * Зарегистрировать обработчик события
     * 
     * @param event Тип события
     * @param handler Обработчик события
     * @return Идентификатор обработчика для возможности отмены регистрации
     */
    fun registerEventHandler(event: PluginEvent, handler: (Map<String, Any>) -> Unit): String
    
    /**
     * Отменить регистрацию обработчика события
     * 
     * @param handlerId Идентификатор обработчика
     */
    fun unregisterEventHandler(handlerId: String)
    
    /**
     * Показать уведомление пользователю
     * 
     * @param message Текст уведомления
     * @param type Тип уведомления
     * @param duration Длительность отображения (в миллисекундах)
     */
    fun showNotification(
        message: String, 
        type: NotificationType = NotificationType.INFO,
        duration: Long = 3000
    )
    
    /**
     * Добавить элемент в пользовательский интерфейс
     * 
     * @param element Элемент интерфейса для добавления
     * @return Идентификатор добавленного элемента
     */
    fun addUiElement(element: UiElement): String
    
    /**
     * Удалить элемент из пользовательского интерфейса
     * 
     * @param elementId Идентификатор элемента для удаления
     */
    fun removeUiElement(elementId: String)
    
    /**
     * Обновить элемент пользовательского интерфейса
     * 
     * @param elementId Идентификатор элемента
     * @param updates Обновления для элемента
     */
    fun updateUiElement(elementId: String, updates: Map<String, Any>)
}

/**
 * Уровни логирования
 */
enum class LogLevel {
    DEBUG,
    INFO,
    WARN,
    ERROR
}

/**
 * Типы уведомлений
 */
enum class NotificationType {
    INFO,
    SUCCESS,
    WARNING,
    ERROR
}

/**
 * Типы событий плагинов
 */
enum class PluginEvent {
    COMIC_OPENED,
    COMIC_CLOSED,
    PAGE_CHANGED,
    SETTINGS_CHANGED,
    PLUGIN_ACTIVATED,
    PLUGIN_DEACTIVATED
}

/**
 * Информация о комиксе
 */
data class ComicInfo(
    val id: String,
    val title: String,
    val filePath: String,
    val pageCount: Int,
    val currentPage: Int,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Информация о странице
 */
data class PageInfo(
    val comicId: String,
    val pageNumber: Int,
    val imagePath: String,
    val textContent: String? = null,
    val metadata: Map<String, Any> = emptyMap()
)

/**
 * Элемент пользовательского интерфейса
 */
sealed class UiElement {
    abstract val id: String
    abstract val type: UiElementType
    
    data class Button(
        override val id: String,
        val text: String,
        val icon: String? = null,
        val onClick: () -> Unit
    ) : UiElement() {
        override val type: UiElementType = UiElementType.BUTTON
    }
    
    data class ToolbarItem(
        override val id: String,
        val title: String,
        val icon: String? = null,
        val onClick: () -> Unit
    ) : UiElement() {
        override val type: UiElementType = UiElementType.TOOLBAR_ITEM
    }
    
    data class MenuItem(
        override val id: String,
        val title: String,
        val icon: String? = null,
        val onClick: () -> Unit
    ) : UiElement() {
        override val type: UiElementType = UiElementType.MENU_ITEM
    }
}

/**
 * Типы элементов интерфейса
 */
enum class UiElementType {
    BUTTON,
    TOOLBAR_ITEM,
    MENU_ITEM,
    PANEL,
    DIALOG
}