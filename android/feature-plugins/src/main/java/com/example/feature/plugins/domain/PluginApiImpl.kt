package com.example.feature.plugins.domain

import android.content.Context
import android.util.Log
import android.widget.Toast
import com.example.feature.plugins.model.PluginExecutionContext
import com.example.feature.plugins.model.PluginPermission
import com.example.feature.plugins.model.PluginResult
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.*
import java.util.*
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PluginApiImpl @Inject constructor(
    @ApplicationContext private val context: Context,
    private val pluginPermissionManager: PluginPermissionManager
) : PluginApi {
    
    private val pluginStorage: MutableMap<String, MutableMap<String, Any?>> = ConcurrentHashMap()
    private val eventHandlers: MutableMap<String, MutableMap<PluginEvent, (Map<String, Any>) -> Unit>> = ConcurrentHashMap()
    private val uiElements: MutableMap<String, PluginApi.UiElement> = ConcurrentHashMap()
    
    private var currentComicInfo: PluginApi.ComicInfo? = null
    private var currentPageInfo: PluginApi.PageInfo? = null
    
    /**
     * Инициализация API для конкретного плагина
     */
    fun initializeForPlugin(pluginId: String, context: PluginExecutionContext) {
        pluginStorage.getOrPut(pluginId) { ConcurrentHashMap() }
        eventHandlers.getOrPut(pluginId) { ConcurrentHashMap() }
        pluginContexts[pluginId] = context
    }
    
    /**
     * Освобождение ресурсов для плагина
     */
    fun cleanupForPlugin(pluginId: String) {
        pluginStorage.remove(pluginId)
        eventHandlers.remove(pluginId)
        pluginContexts.remove(pluginId)
        
        // Удалить все UI элементы этого плагина
        val elementsToRemove = uiElements.filter { it.key.startsWith("${pluginId}_") }
        elementsToRemove.forEach { (id, _) ->
            uiElements.remove(id)
        }
    }
    
    private val pluginContexts: MutableMap<String, PluginExecutionContext> = ConcurrentHashMap()
    private val currentPluginIds: ThreadLocal<String> = ThreadLocal()
    
    override fun getPluginId(): String {
        return currentPluginIds.get() ?: throw IllegalStateException("No plugin context set")
    }
    
    override fun hasPermission(permission: PluginPermission): Boolean {
        val pluginId = getPluginId()
        val context = pluginContexts[pluginId] ?: return false
        return context.permissions.contains(permission)
    }
    
    fun setPluginContext(pluginId: String) {
        currentPluginIds.set(pluginId)
    }
    
    override suspend fun executeSystemCommand(
        command: String,
        params: Map<String, Any>
    ): PluginResult<Any?> = withContext(Dispatchers.IO) {
        try {
            // Проверка разрешений для различных команд
            val result = when (command) {
                "get_current_comic" -> {
                    checkPermission(PluginPermission.READER_CONTROL)
                    getCurrentComicInfo()
                }
                "get_current_page" -> {
                    checkPermission(PluginPermission.READER_CONTROL)
                    getCurrentPageInfo()
                }
                "navigate_to_page" -> {
                    checkPermission(PluginPermission.READER_CONTROL)
                    navigateToPage(params)
                }
                "get_app_settings" -> {
                    checkPermission(PluginPermission.SYSTEM_SETTINGS)
                    getAppSettings()
                }
                "set_app_setting" -> {
                    checkPermission(PluginPermission.SYSTEM_SETTINGS)
                    setAppSetting(params)
                }
                "show_toast" -> {
                    checkPermission(PluginPermission.UI_MODIFICATION)
                    showToast(params)
                }
                "ping" -> {
                    "pong"
                }
                else -> {
                    return@withContext PluginResult.error("Неизвестная команда: $command")
                }
            }
            
            PluginResult.success(result)
        } catch (e: SecurityException) {
            PluginResult.error("Отказано в доступе: ${e.message}")
        } catch (e: Exception) {
            PluginResult.error("Ошибка выполнения команды: ${e.message}")
        }
    }
    
    override fun getAppData(key: String): Any? {
        // Ограниченный доступ к данным приложения
        return when (key) {
            "app_version" -> "1.0.0"
            "app_name" -> "Mr.Comic"
            else -> null // Ограниченный доступ по умолчанию
        }
    }
    
    override fun setPluginData(key: String, value: Any?) {
        val pluginId = getPluginId()
        val store = pluginStorage.getOrPut(pluginId) { ConcurrentHashMap() }
        if (value == null) {
            store.remove(key)
        } else {
            store[key] = value
        }
    }
    
    override fun getPluginData(key: String): Any? {
        val pluginId = getPluginId()
        val store = pluginStorage[pluginId]
        return store?.get(key)
    }
    
    override fun log(message: String, level: PluginApi.LogLevel) {
        val pluginId = getPluginId()
        val tag = "Plugin[$pluginId]"
        
        when (level) {
            PluginApi.LogLevel.DEBUG -> Log.d(tag, message)
            PluginApi.LogLevel.INFO -> Log.i(tag, message)
            PluginApi.LogLevel.WARN -> Log.w(tag, message)
            PluginApi.LogLevel.ERROR -> Log.e(tag, message)
        }
    }
    
    override fun getCurrentComicInfo(): PluginApi.ComicInfo? {
        return currentComicInfo
    }
    
    override fun getCurrentPageInfo(): PluginApi.PageInfo? {
        return currentPageInfo
    }
    
    override fun registerEventHandler(
        event: PluginApi.PluginEvent, 
        handler: (Map<String, Any>) -> Unit
    ): String {
        val pluginId = getPluginId()
        val handlerId = UUID.randomUUID().toString()
        
        val pluginHandlers = eventHandlers.getOrPut(pluginId) { ConcurrentHashMap() }
        pluginHandlers[event] = handler
        
        return handlerId
    }
    
    override fun unregisterEventHandler(handlerId: String) {
        // В реальной реализации здесь нужно будет найти и удалить обработчик по ID
        // Пока просто игнорируем
    }
    
    override fun showNotification(
        message: String, 
        type: PluginApi.NotificationType,
        duration: Long
    ) {
        // Показ уведомления через UI thread
        GlobalScope.launch(Dispatchers.Main) {
            Toast.makeText(context, message, Toast.LENGTH_SHORT).show()
        }
    }
    
    override fun addUiElement(element: PluginApi.UiElement): String {
        val pluginId = getPluginId()
        val elementId = "${pluginId}_${UUID.randomUUID()}"
        uiElements[elementId] = element
        return elementId
    }
    
    override fun removeUiElement(elementId: String) {
        uiElements.remove(elementId)
    }
    
    override fun updateUiElement(elementId: String, updates: Map<String, Any>) {
        val element = uiElements[elementId]
        // В реальной реализации здесь будет обновление элемента UI
        // Пока просто логируем
        log("UI element update requested for $elementId: $updates", PluginApi.LogLevel.DEBUG)
    }
    
    // Вспомогательные методы
    
    fun setPluginContext(pluginId: String) {
        currentPluginIds.set(pluginId)
    }
    
    private fun checkPermission(permission: PluginPermission) {
        if (!hasPermission(permission)) {
            throw SecurityException("Требуется разрешение: ${permission.name}")
        }
    }
    
    private fun navigateToPage(params: Map<String, Any>): Boolean {
        val pageNumber = params["page"] as? Int ?: return false
        // В реальной реализации здесь будет навигация к странице
        log("Navigation to page $pageNumber requested", PluginApi.LogLevel.INFO)
        return true
    }
    
    private fun getAppSettings(): Map<String, Any> {
        // В реальной реализации здесь будет возврат настроек приложения
        return mapOf(
            "theme" to "dark",
            "language" to "ru"
        )
    }
    
    private fun setAppSetting(params: Map<String, Any>): Boolean {
        val key = params["key"] as? String ?: return false
        val value = params["value"] ?: return false
        
        // В реальной реализации здесь будет установка настройки
        log("Setting $key = $value requested", PluginApi.LogLevel.INFO)
        return true
    }
    
    private fun showToast(params: Map<String, Any>): Boolean {
        val message = params["message"] as? String ?: return false
        val duration = params["duration"] as? Int ?: Toast.LENGTH_SHORT
        
        GlobalScope.launch(Dispatchers.Main) {
            Toast.makeText(context, message, duration).show()
        }
        
        return true
    }
    
    // Методы для внутреннего использования системой плагинов
    
    fun setCurrentComicInfo(comicInfo: PluginApi.ComicInfo?) {
        this.currentComicInfo = comicInfo
        emitEvent(PluginApi.PluginEvent.COMIC_OPENED, mapOf("comic" to (comicInfo ?: "")))
    }
    
    fun setCurrentPageInfo(pageInfo: PluginApi.PageInfo?) {
        this.currentPageInfo = pageInfo
        emitEvent(PluginApi.PluginEvent.PAGE_CHANGED, mapOf("page" to (pageInfo ?: "")))
    }
    
    private fun emitEvent(event: PluginApi.PluginEvent, data: Map<String, Any>) {
        eventHandlers.forEach { (pluginId, handlers) ->
            handlers[event]?.invoke(data)
        }
    }
}