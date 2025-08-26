package com.example.feature.plugins.domain

import android.content.Context
import android.webkit.WebView
import com.example.feature.plugins.model.*
import com.google.gson.Gson
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.*
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PluginManager @Inject constructor(
    @ApplicationContext private val context: Context,
    private val gson: Gson,
    private val pluginSandbox: PluginSandbox,
    private val permissionManager: PluginPermissionManager
) {
    
    // Реестр активных плагинов
    private val activePlugins = ConcurrentHashMap<String, ActivePlugin>()
    
    // Кэш метаданных плагинов
    private val metadataCache = ConcurrentHashMap<String, PluginMetadata>()
    
    /**
     * Класс для активного плагина
     */
    private data class ActivePlugin(
        val metadata: PluginMetadata,
        val context: PluginExecutionContext,
        val webView: WebView? = null,
        val state: PluginState = PluginState.INACTIVE
    )
    
    /**
     * Извлечь метаданные плагина
     */
    suspend fun extractMetadata(packagePath: String): PluginMetadata? = withContext(Dispatchers.IO) {
        try {
            val packageFile = File(packagePath)
            if (!packageFile.exists()) return@withContext null
            
            // Для JavaScript плагинов ищем plugin.json
            if (packagePath.endsWith(".js") || packagePath.endsWith(".zip")) {
                val configFile = if (packagePath.endsWith(".js")) {
                    File(packageFile.parent, "plugin.json")
                } else {
                    // Для ZIP архивов извлекаем plugin.json
                    extractConfigFromZip(packageFile)
                }
                
                if (configFile?.exists() == true) {
                    val configJson = configFile.readText()
                    return@withContext parseMetadata(configJson)
                }
            }
            
            null
        } catch (e: Exception) {
            null
        }
    }
    
    /**
     * Проверить зависимости плагина
     */
    fun checkDependencies(dependencies: List<String>): PluginResult<Unit> {
        for (dependency in dependencies) {
            if (!activePlugins.containsKey(dependency)) {
                return PluginResult.error("Зависимость не найдена: $dependency")
            }
        }
        return PluginResult.success(Unit)
    }
    
    /**
     * Активировать плагин
     */
    suspend fun activatePlugin(pluginId: String): PluginResult<Unit> = withContext(Dispatchers.Main) {
        try {
            val metadata = metadataCache[pluginId] 
                ?: return@withContext PluginResult.error("Метаданные плагина не найдены")
            
            // Проверка разрешений
            val permissionCheck = permissionManager.checkPermissions(pluginId, metadata.permissions)
            if (!permissionCheck.success) {
                return@withContext PluginResult.error("Разрешения не предоставлены: ${permissionCheck.error}")
            }
            
            // Создание контекста выполнения
            val executionContext = PluginExecutionContext(
                pluginId = pluginId,
                permissions = metadata.permissions.toSet(),
                configuration = metadata.customMetadata
            )
            
            // Активация в зависимости от типа плагина
            when (metadata.type) {
                PluginType.JAVASCRIPT -> activateJavaScriptPlugin(metadata, executionContext)
                PluginType.NATIVE -> activateNativePlugin(metadata, executionContext)
                PluginType.HYBRID -> activateHybridPlugin(metadata, executionContext)
            }
            
            PluginResult.success(Unit)
        } catch (e: Exception) {
            PluginResult.error("Ошибка активации плагина: ${e.message}")
        }
    }
    
    /**
     * Деактивировать плагин
     */
    suspend fun deactivatePlugin(pluginId: String): PluginResult<Unit> = withContext(Dispatchers.Main) {
        try {
            val activePlugin = activePlugins[pluginId]
                ?: return@withContext PluginResult.success(Unit) // Уже неактивен
            
            // Очистка ресурсов
            activePlugin.webView?.destroy()
            
            // Удаление из реестра активных плагинов
            activePlugins.remove(pluginId)
            
            PluginResult.success(Unit)
        } catch (e: Exception) {
            PluginResult.error("Ошибка деактивации плагина: ${e.message}")
        }
    }
    
    /**
     * Проверить, активен ли плагин
     */
    fun isActive(pluginId: String): Boolean {
        return activePlugins.containsKey(pluginId)
    }
    
    /**
     * Выполнить команду плагина
     */
    suspend fun executeCommand(
        pluginId: String,
        command: String,
        params: Map<String, Any>
    ): PluginResult<Any> = withContext(Dispatchers.IO) {
        try {
            val activePlugin = activePlugins[pluginId]
                ?: return@withContext PluginResult.error("Плагин не активен")
            
            // Выполнение команды в песочнице
            when (activePlugin.metadata.type) {
                PluginType.JAVASCRIPT -> executeJavaScriptCommand(activePlugin, command, params)
                PluginType.NATIVE -> executeNativeCommand(activePlugin, command, params)
                PluginType.HYBRID -> executeHybridCommand(activePlugin, command, params)
            }
        } catch (e: Exception) {
            PluginResult.error("Ошибка выполнения команды: ${e.message}")
        }
    }
    
    /**
     * Удалить файлы плагина
     */
    suspend fun removePluginFiles(packagePath: String): Boolean = withContext(Dispatchers.IO) {
        try {
            val file = File(packagePath)
            if (file.exists()) {
                if (file.isDirectory) {
                    file.deleteRecursively()
                } else {
                    file.delete()
                }
            }
            true
        } catch (e: Exception) {
            false
        }
    }
    
    // Приватные методы для активации различных типов плагинов
    
    private suspend fun activateJavaScriptPlugin(
        metadata: PluginMetadata,
        context: PluginExecutionContext
    ) {
        val webView = WebView(this.context).apply {
            settings.javaScriptEnabled = true
            settings.domStorageEnabled = true
            settings.allowFileAccess = false
            settings.allowContentAccess = false
        }
        
        // Загрузка JavaScript кода плагина
        val pluginCode = loadPluginCode(metadata.packagePath)
        pluginSandbox.executeInWebView(webView, pluginCode, context)
        
        activePlugins[metadata.id] = ActivePlugin(
            metadata = metadata,
            context = context,
            webView = webView,
            state = PluginState.ACTIVE
        )
    }
    
    private suspend fun activateNativePlugin(
        metadata: PluginMetadata,
        context: PluginExecutionContext
    ) {
        // Загрузка нативного плагина через System.loadLibrary
        // В реальной реализации здесь будет загрузка .so файла
        activePlugins[metadata.id] = ActivePlugin(
            metadata = metadata,
            context = context,
            state = PluginState.ACTIVE
        )
    }
    
    private suspend fun activateHybridPlugin(
        metadata: PluginMetadata,
        context: PluginExecutionContext
    ) {
        // Комбинация JavaScript и нативного кода
        activateJavaScriptPlugin(metadata, context)
        activateNativePlugin(metadata, context)
    }
    
    private suspend fun executeJavaScriptCommand(
        plugin: ActivePlugin,
        command: String,
        params: Map<String, Any>
    ): PluginResult<Any> {
        return pluginSandbox.executeCommand(plugin.webView!!, command, params)
    }
    
    private suspend fun executeNativeCommand(
        plugin: ActivePlugin,
        command: String,
        params: Map<String, Any>
    ): PluginResult<Any> {
        // Выполнение нативной команды
        return PluginResult.error("Нативные команды пока не поддерживаются")
    }
    
    private suspend fun executeHybridCommand(
        plugin: ActivePlugin,
        command: String,
        params: Map<String, Any>
    ): PluginResult<Any> {
        // Выбор между JavaScript и нативным выполнением
        return executeJavaScriptCommand(plugin, command, params)
    }
    
    private suspend fun loadPluginCode(packagePath: String?): String = withContext(Dispatchers.IO) {
        packagePath?.let { File(it).readText() } ?: ""
    }
    
    private fun extractConfigFromZip(zipFile: File): File? {
        return try {
            val tempDir = File(context.cacheDir, "plugin_tmp_${zipFile.nameWithoutExtension}")
            if (!tempDir.exists()) tempDir.mkdirs()
            java.util.zip.ZipFile(zipFile).use { zf ->
                val entry = zf.getEntry("plugin.json") ?: return null
                val outFile = File(tempDir, "plugin.json")
                zf.getInputStream(entry).use { input ->
                    outFile.outputStream().use { output -> input.copyTo(output) }
                }
                outFile
            }
        } catch (e: Exception) {
            null
        }
    }
    
    private fun parseMetadata(configJson: String): PluginMetadata? {
        return try {
            gson.fromJson(configJson, PluginMetadata::class.java)
        } catch (e: Exception) {
            null
        }
    }
}

/**
 * Метаданные плагина
 */
data class PluginMetadata(
    val id: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val category: PluginCategory,
    val type: PluginType,
    val permissions: List<PluginPermission>,
    val dependencies: List<String>,
    val packagePath: String,
    val customMetadata: Map<String, Any> = emptyMap()
)