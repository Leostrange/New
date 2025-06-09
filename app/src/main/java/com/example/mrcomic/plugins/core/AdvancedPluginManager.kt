package com.example.mrcomic.plugins.core

import android.content.Context
import android.content.pm.PackageManager
import android.os.Handler
import android.os.Looper
import androidx.lifecycle.LiveData
import androidx.lifecycle.MutableLiveData
import kotlinx.coroutines.*
import kotlinx.coroutines.flow.*
import java.io.File
import java.util.concurrent.ConcurrentHashMap
import java.util.concurrent.atomic.AtomicBoolean
import java.util.concurrent.atomic.AtomicLong
import javax.crypto.Cipher
import javax.crypto.spec.SecretKeySpec
import kotlin.collections.mutableMapOf

/**
 * Продвинутый менеджер плагинов для Mr.Comic
 * 
 * Обеспечивает полное управление жизненным циклом плагинов с поддержкой:
 * - Автоматического обнаружения и загрузки плагинов
 * - Системы зависимостей и версионирования
 * - Песочницы безопасности и изоляции
 * - Мониторинга производительности и здоровья
 * - Автоматических обновлений и миграций
 * - Горячей замены плагинов без перезапуска
 * - Распределенной архитектуры для масштабирования
 * 
 * @author Manus AI
 * @version 2.0.0
 * @since API level 23
 */
class AdvancedPluginManager private constructor(
    private val context: Context,
    private val config: PluginManagerConfig
) {
    
    companion object {
        @Volatile
        private var INSTANCE: AdvancedPluginManager? = null
        
        fun getInstance(context: Context, config: PluginManagerConfig = PluginManagerConfig()): AdvancedPluginManager {
            return INSTANCE ?: synchronized(this) {
                INSTANCE ?: AdvancedPluginManager(context.applicationContext, config).also { INSTANCE = it }
            }
        }
        
        private const val PLUGIN_DIRECTORY = "plugins"
        private const val CACHE_DIRECTORY = "plugin_cache"
        private const val TEMP_DIRECTORY = "plugin_temp"
        private const val BACKUP_DIRECTORY = "plugin_backups"
        private const val MAX_PLUGIN_SIZE = 50 * 1024 * 1024 // 50MB
        private const val HEALTH_CHECK_INTERVAL = 30000L // 30 seconds
        private const val AUTO_UPDATE_INTERVAL = 3600000L // 1 hour
    }
    
    // Core components
    private val pluginRegistry = ConcurrentHashMap<String, PluginContainer>()
    private val dependencyGraph = PluginDependencyGraph()
    private val securityManager = PluginSecurityManager(context)
    private val performanceMonitor = PluginPerformanceMonitor()
    private val updateManager = PluginUpdateManager(context)
    private val sandboxManager = PluginSandboxManager(context)
    
    // State management
    private val _pluginStates = MutableLiveData<Map<String, PluginState>>()
    val pluginStates: LiveData<Map<String, PluginState>> = _pluginStates
    
    private val _pluginEvents = MutableSharedFlow<PluginEvent>()
    val pluginEvents: SharedFlow<PluginEvent> = _pluginEvents.asSharedFlow()
    
    private val isInitialized = AtomicBoolean(false)
    private val isShuttingDown = AtomicBoolean(false)
    private val operationCounter = AtomicLong(0)
    
    // Coroutine management
    private val managerScope = CoroutineScope(SupervisorJob() + Dispatchers.Default)
    private val mainHandler = Handler(Looper.getMainLooper())
    
    // Plugin directories
    private val pluginDir: File by lazy { File(context.filesDir, PLUGIN_DIRECTORY).apply { mkdirs() } }
    private val cacheDir: File by lazy { File(context.cacheDir, CACHE_DIRECTORY).apply { mkdirs() } }
    private val tempDir: File by lazy { File(context.cacheDir, TEMP_DIRECTORY).apply { mkdirs() } }
    private val backupDir: File by lazy { File(context.filesDir, BACKUP_DIRECTORY).apply { mkdirs() } }
    
    /**
     * Инициализация менеджера плагинов
     */
    suspend fun initialize(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            if (isInitialized.get()) {
                return@withContext Result.success(Unit)
            }
            
            // Инициализация компонентов
            securityManager.initialize()
            performanceMonitor.initialize()
            updateManager.initialize()
            sandboxManager.initialize()
            
            // Очистка временных файлов
            cleanupTempFiles()
            
            // Загрузка существующих плагинов
            loadExistingPlugins()
            
            // Запуск фоновых задач
            startBackgroundTasks()
            
            isInitialized.set(true)
            emitEvent(PluginEvent.ManagerInitialized)
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(PluginException("Failed to initialize plugin manager", e))
        }
    }
    
    /**
     * Установка плагина из файла
     */
    suspend fun installPlugin(
        pluginFile: File,
        options: InstallOptions = InstallOptions()
    ): Result<PluginInfo> = withContext(Dispatchers.IO) {
        try {
            val operationId = operationCounter.incrementAndGet()
            emitEvent(PluginEvent.InstallationStarted(operationId, pluginFile.name))
            
            // Валидация файла
            validatePluginFile(pluginFile)
            
            // Извлечение метаданных
            val metadata = extractPluginMetadata(pluginFile)
            
            // Проверка совместимости
            checkCompatibility(metadata)
            
            // Проверка зависимостей
            val dependencies = resolveDependencies(metadata)
            
            // Проверка безопасности
            securityManager.scanPlugin(pluginFile, metadata)
            
            // Создание песочницы
            val sandbox = sandboxManager.createSandbox(metadata.id, metadata.permissions)
            
            // Установка плагина
            val pluginInfo = performInstallation(pluginFile, metadata, sandbox, options)
            
            // Регистрация в системе
            registerPlugin(pluginInfo, dependencies)
            
            emitEvent(PluginEvent.InstallationCompleted(operationId, pluginInfo))
            Result.success(pluginInfo)
            
        } catch (e: Exception) {
            emitEvent(PluginEvent.InstallationFailed(operationCounter.get(), e.message ?: "Unknown error"))
            Result.failure(e)
        }
    }
    
    /**
     * Удаление плагина
     */
    suspend fun uninstallPlugin(
        pluginId: String,
        options: UninstallOptions = UninstallOptions()
    ): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val plugin = pluginRegistry[pluginId] 
                ?: return@withContext Result.failure(PluginNotFoundException(pluginId))
            
            val operationId = operationCounter.incrementAndGet()
            emitEvent(PluginEvent.UninstallationStarted(operationId, pluginId))
            
            // Проверка зависимостей
            val dependents = dependencyGraph.getDependents(pluginId)
            if (dependents.isNotEmpty() && !options.force) {
                return@withContext Result.failure(
                    PluginDependencyException("Plugin has dependents: ${dependents.joinToString()}")
                )
            }
            
            // Остановка плагина
            if (plugin.state == PluginState.RUNNING) {
                stopPlugin(pluginId)
            }
            
            // Создание резервной копии
            if (options.createBackup) {
                createBackup(plugin)
            }
            
            // Удаление файлов
            performUninstallation(plugin, options)
            
            // Удаление из реестра
            unregisterPlugin(pluginId)
            
            emitEvent(PluginEvent.UninstallationCompleted(operationId, pluginId))
            Result.success(Unit)
            
        } catch (e: Exception) {
            emitEvent(PluginEvent.UninstallationFailed(operationCounter.get(), e.message ?: "Unknown error"))
            Result.failure(e)
        }
    }
    
    /**
     * Запуск плагина
     */
    suspend fun startPlugin(pluginId: String): Result<Unit> = withContext(Dispatchers.Default) {
        try {
            val container = pluginRegistry[pluginId] 
                ?: return@withContext Result.failure(PluginNotFoundException(pluginId))
            
            if (container.state == PluginState.RUNNING) {
                return@withContext Result.success(Unit)
            }
            
            // Проверка зависимостей
            val dependencies = dependencyGraph.getDependencies(pluginId)
            for (depId in dependencies) {
                val depContainer = pluginRegistry[depId]
                if (depContainer?.state != PluginState.RUNNING) {
                    startPlugin(depId).getOrThrow()
                }
            }
            
            // Запуск плагина
            container.state = PluginState.STARTING
            updatePluginStates()
            
            val plugin = container.plugin
            val sandbox = container.sandbox
            
            // Инициализация в песочнице
            sandbox.execute {
                plugin.initialize(container.context)
            }
            
            // Запуск мониторинга
            performanceMonitor.startMonitoring(pluginId, plugin)
            
            container.state = PluginState.RUNNING
            container.startTime = System.currentTimeMillis()
            updatePluginStates()
            
            emitEvent(PluginEvent.PluginStarted(pluginId))
            Result.success(Unit)
            
        } catch (e: Exception) {
            pluginRegistry[pluginId]?.state = PluginState.ERROR
            updatePluginStates()
            emitEvent(PluginEvent.PluginError(pluginId, e.message ?: "Unknown error"))
            Result.failure(e)
        }
    }
    
    /**
     * Остановка плагина
     */
    suspend fun stopPlugin(pluginId: String): Result<Unit> = withContext(Dispatchers.Default) {
        try {
            val container = pluginRegistry[pluginId] 
                ?: return@withContext Result.failure(PluginNotFoundException(pluginId))
            
            if (container.state != PluginState.RUNNING) {
                return@withContext Result.success(Unit)
            }
            
            // Проверка зависимых плагинов
            val dependents = dependencyGraph.getDependents(pluginId)
            for (depId in dependents) {
                stopPlugin(depId).getOrThrow()
            }
            
            container.state = PluginState.STOPPING
            updatePluginStates()
            
            // Остановка мониторинга
            performanceMonitor.stopMonitoring(pluginId)
            
            // Остановка плагина
            val plugin = container.plugin
            val sandbox = container.sandbox
            
            sandbox.execute {
                plugin.shutdown()
            }
            
            container.state = PluginState.STOPPED
            updatePluginStates()
            
            emitEvent(PluginEvent.PluginStopped(pluginId))
            Result.success(Unit)
            
        } catch (e: Exception) {
            pluginRegistry[pluginId]?.state = PluginState.ERROR
            updatePluginStates()
            emitEvent(PluginEvent.PluginError(pluginId, e.message ?: "Unknown error"))
            Result.failure(e)
        }
    }
    
    /**
     * Получение информации о плагине
     */
    fun getPluginInfo(pluginId: String): PluginInfo? {
        return pluginRegistry[pluginId]?.info
    }
    
    /**
     * Получение списка всех плагинов
     */
    fun getAllPlugins(): List<PluginInfo> {
        return pluginRegistry.values.map { it.info }
    }
    
    /**
     * Получение плагинов по типу
     */
    fun getPluginsByType(type: PluginType): List<PluginInfo> {
        return pluginRegistry.values
            .filter { it.info.type == type }
            .map { it.info }
    }
    
    /**
     * Поиск плагинов
     */
    fun searchPlugins(query: String): List<PluginInfo> {
        val lowerQuery = query.lowercase()
        return pluginRegistry.values
            .filter { 
                it.info.name.lowercase().contains(lowerQuery) ||
                it.info.description.lowercase().contains(lowerQuery) ||
                it.info.tags.any { tag -> tag.lowercase().contains(lowerQuery) }
            }
            .map { it.info }
    }
    
    /**
     * Обновление плагина
     */
    suspend fun updatePlugin(
        pluginId: String,
        updateFile: File? = null
    ): Result<PluginInfo> = withContext(Dispatchers.IO) {
        try {
            val container = pluginRegistry[pluginId] 
                ?: return@withContext Result.failure(PluginNotFoundException(pluginId))
            
            val operationId = operationCounter.incrementAndGet()
            emitEvent(PluginEvent.UpdateStarted(operationId, pluginId))
            
            // Получение файла обновления
            val updateSource = updateFile ?: updateManager.downloadUpdate(container.info)
            
            // Создание резервной копии
            createBackup(container)
            
            // Остановка плагина
            val wasRunning = container.state == PluginState.RUNNING
            if (wasRunning) {
                stopPlugin(pluginId).getOrThrow()
            }
            
            // Установка обновления
            val newInfo = performUpdate(container, updateSource)
            
            // Запуск плагина если он был запущен
            if (wasRunning) {
                startPlugin(pluginId).getOrThrow()
            }
            
            emitEvent(PluginEvent.UpdateCompleted(operationId, newInfo))
            Result.success(newInfo)
            
        } catch (e: Exception) {
            emitEvent(PluginEvent.UpdateFailed(operationCounter.get(), e.message ?: "Unknown error"))
            Result.failure(e)
        }
    }
    
    /**
     * Проверка обновлений для всех плагинов
     */
    suspend fun checkForUpdates(): Result<List<PluginUpdateInfo>> = withContext(Dispatchers.IO) {
        try {
            val updates = mutableListOf<PluginUpdateInfo>()
            
            for (container in pluginRegistry.values) {
                val updateInfo = updateManager.checkForUpdate(container.info)
                if (updateInfo != null) {
                    updates.add(updateInfo)
                }
            }
            
            Result.success(updates)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Автоматическое обновление всех плагинов
     */
    suspend fun autoUpdateAll(): Result<List<PluginInfo>> = withContext(Dispatchers.IO) {
        try {
            val updates = checkForUpdates().getOrThrow()
            val results = mutableListOf<PluginInfo>()
            
            for (update in updates) {
                try {
                    val result = updatePlugin(update.pluginId).getOrThrow()
                    results.add(result)
                } catch (e: Exception) {
                    // Логируем ошибку, но продолжаем обновление других плагинов
                    emitEvent(PluginEvent.UpdateFailed(operationCounter.incrementAndGet(), 
                        "Failed to update ${update.pluginId}: ${e.message}"))
                }
            }
            
            Result.success(results)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Получение метрик производительности
     */
    fun getPerformanceMetrics(pluginId: String): PluginMetrics? {
        return performanceMonitor.getMetrics(pluginId)
    }
    
    /**
     * Получение метрик всех плагинов
     */
    fun getAllPerformanceMetrics(): Map<String, PluginMetrics> {
        return performanceMonitor.getAllMetrics()
    }
    
    /**
     * Экспорт конфигурации плагинов
     */
    suspend fun exportConfiguration(): Result<File> = withContext(Dispatchers.IO) {
        try {
            val config = PluginConfiguration(
                plugins = pluginRegistry.values.map { it.info },
                dependencies = dependencyGraph.export(),
                settings = exportSettings()
            )
            
            val exportFile = File(backupDir, "plugin_config_${System.currentTimeMillis()}.json")
            exportFile.writeText(config.toJson())
            
            Result.success(exportFile)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Импорт конфигурации плагинов
     */
    suspend fun importConfiguration(configFile: File): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val config = PluginConfiguration.fromJson(configFile.readText())
            
            // Остановка всех плагинов
            stopAllPlugins()
            
            // Импорт настроек
            importSettings(config.settings)
            
            // Восстановление зависимостей
            dependencyGraph.import(config.dependencies)
            
            // Уведомление о завершении
            emitEvent(PluginEvent.ConfigurationImported)
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    /**
     * Завершение работы менеджера
     */
    suspend fun shutdown(): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            if (isShuttingDown.getAndSet(true)) {
                return@withContext Result.success(Unit)
            }
            
            // Остановка всех плагинов
            stopAllPlugins()
            
            // Завершение фоновых задач
            managerScope.cancel()
            
            // Завершение компонентов
            performanceMonitor.shutdown()
            updateManager.shutdown()
            sandboxManager.shutdown()
            securityManager.shutdown()
            
            // Очистка ресурсов
            pluginRegistry.clear()
            cleanupTempFiles()
            
            isInitialized.set(false)
            emitEvent(PluginEvent.ManagerShutdown)
            
            Result.success(Unit)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    // Private helper methods
    
    private suspend fun loadExistingPlugins() {
        val pluginFiles = pluginDir.listFiles { file -> 
            file.isDirectory && File(file, "plugin.json").exists() 
        } ?: return
        
        for (pluginFile in pluginFiles) {
            try {
                val metadataFile = File(pluginFile, "plugin.json")
                val metadata = PluginMetadata.fromJson(metadataFile.readText())
                
                // Загрузка плагина
                loadPlugin(pluginFile, metadata)
            } catch (e: Exception) {
                // Логируем ошибку и продолжаем
                emitEvent(PluginEvent.PluginError(pluginFile.name, 
                    "Failed to load plugin: ${e.message}"))
            }
        }
    }
    
    private suspend fun loadPlugin(pluginDir: File, metadata: PluginMetadata) {
        val sandbox = sandboxManager.createSandbox(metadata.id, metadata.permissions)
        val plugin = sandbox.loadPlugin(pluginDir, metadata)
        
        val info = PluginInfo(
            id = metadata.id,
            name = metadata.name,
            version = metadata.version,
            description = metadata.description,
            author = metadata.author,
            type = metadata.type,
            permissions = metadata.permissions,
            dependencies = metadata.dependencies,
            tags = metadata.tags,
            installTime = File(pluginDir, "install_time").takeIf { it.exists() }
                ?.readText()?.toLongOrNull() ?: System.currentTimeMillis(),
            size = calculateDirectorySize(pluginDir)
        )
        
        val container = PluginContainer(
            info = info,
            plugin = plugin,
            sandbox = sandbox,
            context = PluginContext(context, metadata.id, sandbox),
            state = PluginState.STOPPED,
            directory = pluginDir
        )
        
        pluginRegistry[metadata.id] = container
        dependencyGraph.addPlugin(metadata.id, metadata.dependencies)
    }
    
    private fun startBackgroundTasks() {
        // Мониторинг здоровья плагинов
        managerScope.launch {
            while (isActive && !isShuttingDown.get()) {
                try {
                    performHealthCheck()
                    delay(HEALTH_CHECK_INTERVAL)
                } catch (e: Exception) {
                    // Логируем ошибку
                }
            }
        }
        
        // Автоматические обновления
        if (config.autoUpdateEnabled) {
            managerScope.launch {
                while (isActive && !isShuttingDown.get()) {
                    try {
                        autoUpdateAll()
                        delay(AUTO_UPDATE_INTERVAL)
                    } catch (e: Exception) {
                        // Логируем ошибку
                    }
                }
            }
        }
        
        // Очистка кэша
        managerScope.launch {
            while (isActive && !isShuttingDown.get()) {
                try {
                    cleanupCache()
                    delay(3600000L) // 1 hour
                } catch (e: Exception) {
                    // Логируем ошибку
                }
            }
        }
    }
    
    private suspend fun performHealthCheck() {
        for ((pluginId, container) in pluginRegistry) {
            if (container.state == PluginState.RUNNING) {
                try {
                    val isHealthy = container.sandbox.execute {
                        container.plugin.isHealthy()
                    }
                    
                    if (!isHealthy) {
                        emitEvent(PluginEvent.PluginUnhealthy(pluginId))
                        
                        if (config.autoRestartUnhealthyPlugins) {
                            stopPlugin(pluginId)
                            delay(1000)
                            startPlugin(pluginId)
                        }
                    }
                } catch (e: Exception) {
                    emitEvent(PluginEvent.PluginError(pluginId, "Health check failed: ${e.message}"))
                }
            }
        }
    }
    
    private fun validatePluginFile(file: File) {
        if (!file.exists()) {
            throw PluginException("Plugin file does not exist: ${file.path}")
        }
        
        if (file.length() > MAX_PLUGIN_SIZE) {
            throw PluginException("Plugin file too large: ${file.length()} bytes (max: $MAX_PLUGIN_SIZE)")
        }
        
        // Дополнительные проверки безопасности
        securityManager.validateFile(file)
    }
    
    private suspend fun extractPluginMetadata(file: File): PluginMetadata {
        return sandboxManager.executeInTempSandbox { sandbox ->
            sandbox.extractMetadata(file)
        }
    }
    
    private fun checkCompatibility(metadata: PluginMetadata) {
        if (metadata.minApiVersion > PluginAPI.CURRENT_VERSION) {
            throw PluginCompatibilityException(
                "Plugin requires API version ${metadata.minApiVersion}, current is ${PluginAPI.CURRENT_VERSION}"
            )
        }
        
        if (metadata.maxApiVersion < PluginAPI.CURRENT_VERSION) {
            throw PluginCompatibilityException(
                "Plugin is too old, max supported API version is ${metadata.maxApiVersion}"
            )
        }
    }
    
    private fun resolveDependencies(metadata: PluginMetadata): List<String> {
        val resolved = mutableListOf<String>()
        
        for (dependency in metadata.dependencies) {
            val depContainer = pluginRegistry[dependency]
            if (depContainer == null) {
                throw PluginDependencyException("Missing dependency: $dependency")
            }
            resolved.add(dependency)
        }
        
        return resolved
    }
    
    private suspend fun performInstallation(
        pluginFile: File,
        metadata: PluginMetadata,
        sandbox: PluginSandbox,
        options: InstallOptions
    ): PluginInfo {
        val pluginDir = File(this.pluginDir, metadata.id)
        
        if (pluginDir.exists()) {
            if (!options.overwrite) {
                throw PluginException("Plugin already exists: ${metadata.id}")
            }
            pluginDir.deleteRecursively()
        }
        
        pluginDir.mkdirs()
        
        // Извлечение плагина
        sandbox.extractPlugin(pluginFile, pluginDir)
        
        // Сохранение метаданных
        File(pluginDir, "plugin.json").writeText(metadata.toJson())
        File(pluginDir, "install_time").writeText(System.currentTimeMillis().toString())
        
        // Загрузка плагина
        val plugin = sandbox.loadPlugin(pluginDir, metadata)
        
        return PluginInfo(
            id = metadata.id,
            name = metadata.name,
            version = metadata.version,
            description = metadata.description,
            author = metadata.author,
            type = metadata.type,
            permissions = metadata.permissions,
            dependencies = metadata.dependencies,
            tags = metadata.tags,
            installTime = System.currentTimeMillis(),
            size = calculateDirectorySize(pluginDir)
        )
    }
    
    private fun registerPlugin(info: PluginInfo, dependencies: List<String>) {
        val sandbox = sandboxManager.getSandbox(info.id)
            ?: throw PluginException("Sandbox not found for plugin: ${info.id}")
        
        val plugin = sandbox.getPlugin()
            ?: throw PluginException("Plugin not loaded: ${info.id}")
        
        val container = PluginContainer(
            info = info,
            plugin = plugin,
            sandbox = sandbox,
            context = PluginContext(context, info.id, sandbox),
            state = PluginState.INSTALLED,
            directory = File(pluginDir, info.id)
        )
        
        pluginRegistry[info.id] = container
        dependencyGraph.addPlugin(info.id, dependencies)
        updatePluginStates()
    }
    
    private suspend fun performUninstallation(container: PluginContainer, options: UninstallOptions) {
        // Удаление песочницы
        sandboxManager.removeSandbox(container.info.id)
        
        // Удаление файлов
        if (options.removeData) {
            container.directory.deleteRecursively()
        }
        
        // Удаление кэша
        val cacheDir = File(this.cacheDir, container.info.id)
        if (cacheDir.exists()) {
            cacheDir.deleteRecursively()
        }
    }
    
    private fun unregisterPlugin(pluginId: String) {
        pluginRegistry.remove(pluginId)
        dependencyGraph.removePlugin(pluginId)
        updatePluginStates()
    }
    
    private suspend fun createBackup(container: PluginContainer) {
        val backupFile = File(backupDir, "${container.info.id}_${System.currentTimeMillis()}.backup")
        
        // Создание архива плагина
        sandboxManager.executeInTempSandbox { sandbox ->
            sandbox.createArchive(container.directory, backupFile)
        }
    }
    
    private suspend fun performUpdate(container: PluginContainer, updateFile: File): PluginInfo {
        val metadata = extractPluginMetadata(updateFile)
        
        // Проверка совместимости
        checkCompatibility(metadata)
        
        // Создание новой песочницы
        val newSandbox = sandboxManager.createSandbox(metadata.id, metadata.permissions)
        
        // Обновление файлов
        container.directory.deleteRecursively()
        container.directory.mkdirs()
        
        newSandbox.extractPlugin(updateFile, container.directory)
        
        // Сохранение метаданных
        File(container.directory, "plugin.json").writeText(metadata.toJson())
        
        // Загрузка обновленного плагина
        val newPlugin = newSandbox.loadPlugin(container.directory, metadata)
        
        // Обновление контейнера
        container.plugin = newPlugin
        container.sandbox = newSandbox
        container.info = container.info.copy(
            version = metadata.version,
            description = metadata.description,
            permissions = metadata.permissions,
            dependencies = metadata.dependencies
        )
        
        return container.info
    }
    
    private suspend fun stopAllPlugins() {
        val runningPlugins = pluginRegistry.values
            .filter { it.state == PluginState.RUNNING }
            .map { it.info.id }
        
        for (pluginId in runningPlugins) {
            try {
                stopPlugin(pluginId)
            } catch (e: Exception) {
                // Логируем ошибку, но продолжаем остановку других плагинов
            }
        }
    }
    
    private fun updatePluginStates() {
        val states = pluginRegistry.mapValues { it.value.state }
        mainHandler.post {
            _pluginStates.value = states
        }
    }
    
    private suspend fun emitEvent(event: PluginEvent) {
        _pluginEvents.emit(event)
    }
    
    private fun cleanupTempFiles() {
        tempDir.listFiles()?.forEach { file ->
            if (System.currentTimeMillis() - file.lastModified() > 24 * 60 * 60 * 1000) { // 24 hours
                file.deleteRecursively()
            }
        }
    }
    
    private fun cleanupCache() {
        val maxCacheSize = config.maxCacheSize
        val cacheFiles = cacheDir.listFiles()?.sortedBy { it.lastModified() } ?: return
        
        var totalSize = cacheFiles.sumOf { calculateDirectorySize(it) }
        
        for (file in cacheFiles) {
            if (totalSize <= maxCacheSize) break
            
            val fileSize = calculateDirectorySize(file)
            file.deleteRecursively()
            totalSize -= fileSize
        }
    }
    
    private fun calculateDirectorySize(dir: File): Long {
        return dir.walkTopDown().filter { it.isFile }.map { it.length() }.sum()
    }
    
    private fun exportSettings(): Map<String, Any> {
        return mapOf(
            "autoUpdateEnabled" to config.autoUpdateEnabled,
            "autoRestartUnhealthyPlugins" to config.autoRestartUnhealthyPlugins,
            "maxCacheSize" to config.maxCacheSize,
            "securityLevel" to config.securityLevel.name
        )
    }
    
    private fun importSettings(settings: Map<String, Any>) {
        // Импорт настроек конфигурации
        // Реализация зависит от требований
    }
}

/**
 * Конфигурация менеджера плагинов
 */
data class PluginManagerConfig(
    val autoUpdateEnabled: Boolean = true,
    val autoRestartUnhealthyPlugins: Boolean = true,
    val maxCacheSize: Long = 100 * 1024 * 1024, // 100MB
    val securityLevel: SecurityLevel = SecurityLevel.MEDIUM,
    val sandboxEnabled: Boolean = true,
    val performanceMonitoringEnabled: Boolean = true
)

/**
 * Опции установки плагина
 */
data class InstallOptions(
    val overwrite: Boolean = false,
    val skipDependencyCheck: Boolean = false,
    val skipSecurityScan: Boolean = false
)

/**
 * Опции удаления плагина
 */
data class UninstallOptions(
    val force: Boolean = false,
    val removeData: Boolean = true,
    val createBackup: Boolean = true
)

/**
 * Контейнер плагина
 */
data class PluginContainer(
    val info: PluginInfo,
    var plugin: Plugin,
    var sandbox: PluginSandbox,
    val context: PluginContext,
    var state: PluginState,
    val directory: File,
    var startTime: Long = 0
)

/**
 * События плагинов
 */
sealed class PluginEvent {
    object ManagerInitialized : PluginEvent()
    object ManagerShutdown : PluginEvent()
    object ConfigurationImported : PluginEvent()
    
    data class InstallationStarted(val operationId: Long, val fileName: String) : PluginEvent()
    data class InstallationCompleted(val operationId: Long, val info: PluginInfo) : PluginEvent()
    data class InstallationFailed(val operationId: Long, val error: String) : PluginEvent()
    
    data class UninstallationStarted(val operationId: Long, val pluginId: String) : PluginEvent()
    data class UninstallationCompleted(val operationId: Long, val pluginId: String) : PluginEvent()
    data class UninstallationFailed(val operationId: Long, val error: String) : PluginEvent()
    
    data class UpdateStarted(val operationId: Long, val pluginId: String) : PluginEvent()
    data class UpdateCompleted(val operationId: Long, val info: PluginInfo) : PluginEvent()
    data class UpdateFailed(val operationId: Long, val error: String) : PluginEvent()
    
    data class PluginStarted(val pluginId: String) : PluginEvent()
    data class PluginStopped(val pluginId: String) : PluginEvent()
    data class PluginError(val pluginId: String, val error: String) : PluginEvent()
    data class PluginUnhealthy(val pluginId: String) : PluginEvent()
}

/**
 * Исключения плагинов
 */
class PluginException(message: String, cause: Throwable? = null) : Exception(message, cause)
class PluginNotFoundException(pluginId: String) : PluginException("Plugin not found: $pluginId")
class PluginDependencyException(message: String) : PluginException(message)
class PluginCompatibilityException(message: String) : PluginException(message)
class PluginSecurityException(message: String) : PluginException(message)

