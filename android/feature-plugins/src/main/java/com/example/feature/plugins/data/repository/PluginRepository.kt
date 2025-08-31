package com.example.feature.plugins.data.repository

import com.example.core.data.database.plugins.PluginDao
import com.example.core.data.database.plugins.PluginEntity
import com.example.feature.plugins.data.mapper.toDomain
import com.example.feature.plugins.data.mapper.toEntity
import com.example.feature.plugins.domain.PluginManager
import com.example.feature.plugins.domain.PluginValidator
import com.example.feature.plugins.model.Plugin
import com.example.feature.plugins.model.PluginResult
import com.example.feature.plugins.model.PluginState
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PluginRepository @Inject constructor(
    private val pluginDao: PluginDao,
    private val pluginManager: PluginManager,
    private val pluginValidator: PluginValidator
) {
    
    /**
     * Получить все плагины
     */
    fun getAllPlugins(): Flow<List<Plugin>> {
        return pluginDao.getAllPlugins().map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    /**
     * Получить активные плагины
     */
    fun getActivePlugins(): Flow<List<Plugin>> {
        return pluginDao.getActivePlugins().map { entities ->
            entities.map { it.toDomain() }
        }
    }
    
    /**
     * Получить плагин по ID
     */
    suspend fun getPluginById(id: String): Plugin? {
        return pluginDao.getPluginById(id)?.toDomain()
    }
    
    /**
     * Установить плагин
     */
    suspend fun installPlugin(packagePath: String): PluginResult<Plugin> {
        return try {
            // 1. Валидация пакета плагина
            val validationResult = pluginValidator.validatePackage(packagePath)
            if (!validationResult.success) {
                return PluginResult.error("Ошибка валидации: ${validationResult.error}")
            }
            
            // 2. Извлечение метаданных
            val metadata = pluginManager.extractMetadata(packagePath)
                ?: return PluginResult.error("Не удалось извлечь метаданные плагина")
            
            // 3. Проверка зависимостей
            val dependencyCheck = pluginManager.checkDependencies(metadata.dependencies)
            if (!dependencyCheck.success) {
                return PluginResult.error("Зависимости не выполнены: ${dependencyCheck.error}")
            }
            
            // 4. Установка плагина
            val plugin = Plugin(
                id = metadata.id,
                name = metadata.name,
                version = metadata.version,
                author = metadata.author,
                description = metadata.description,
                category = metadata.category,
                type = metadata.type,
                permissions = metadata.permissions,
                dependencies = metadata.dependencies,
                isInstalled = true,
                isEnabled = false,
                packagePath = packagePath,
                metadata = metadata.customMetadata
            )
            
            // 5. Сохранение в базу данных
            pluginDao.insertPlugin(plugin.toEntity())
            
            PluginResult.success(plugin)
        } catch (e: Exception) {
            PluginResult.error("Ошибка установки плагина: ${e.message}")
        }
    }
    
    /**
     * Удалить плагин
     */
    suspend fun uninstallPlugin(pluginId: String): PluginResult<Unit> {
        return try {
            // 1. Деактивация плагина, если он активен
            pluginManager.deactivatePlugin(pluginId)
            
            // 2. Удаление файлов плагина
            val plugin = getPluginById(pluginId)
            if (plugin != null && plugin.packagePath != null) {
                pluginManager.removePluginFiles(plugin.packagePath)
            }
            
            // 3. Удаление из базы данных
            pluginDao.deletePlugin(pluginId)
            
            PluginResult.success(Unit)
        } catch (e: Exception) {
            PluginResult.error("Ошибка удаления плагина: ${e.message}")
        }
    }
    
    /**
     * Активировать плагин
     */
    suspend fun activatePlugin(pluginId: String): PluginResult<Unit> {
        return try {
            // 1. Активация через PluginManager
            val activationResult = pluginManager.activatePlugin(pluginId)
            if (!activationResult.success) {
                return PluginResult.error(activationResult.error ?: "Не удалось активировать плагин")
            }
            
            // 2. Обновление состояния в базе данных
            pluginDao.updatePluginState(pluginId, true)
            
            PluginResult.success(Unit)
        } catch (e: Exception) {
            PluginResult.error("Ошибка активации плагина: ${e.message}")
        }
    }
    
    /**
     * Деактивировать плагин
     */
    suspend fun deactivatePlugin(pluginId: String): PluginResult<Unit> {
        return try {
            // 1. Деактивация через PluginManager
            val deactivationResult = pluginManager.deactivatePlugin(pluginId)
            if (!deactivationResult.success) {
                return PluginResult.error(deactivationResult.error ?: "Не удалось деактивировать плагин")
            }
            
            // 2. Обновление состояния в базе данных
            pluginDao.updatePluginState(pluginId, false)
            
            PluginResult.success(Unit)
        } catch (e: Exception) {
            PluginResult.error("Ошибка деактивации плагина: ${e.message}")
        }
    }
    
    /**
     * Обновить плагин
     */
    suspend fun updatePlugin(pluginId: String, newPackagePath: String): PluginResult<Plugin> {
        return try {
            // 1. Деактивация старой версии
            deactivatePlugin(pluginId)
            
            // 2. Удаление старой версии
            uninstallPlugin(pluginId)
            
            // 3. Установка новой версии
            installPlugin(newPackagePath)
        } catch (e: Exception) {
            PluginResult.error("Ошибка обновления плагина: ${e.message}")
        }
    }
    
    /**
     * Выполнить команду плагина
     */
    suspend fun executePluginCommand(
        pluginId: String, 
        command: String, 
        params: Map<String, Any> = emptyMap()
    ): PluginResult<Any> {
        return try {
            // Выполнение команды через PluginManager
            val result = pluginManager.executeCommand(pluginId, command, params)
            
            if (!result.success) {
                return PluginResult.error(result.error ?: "Не удалось выполнить команду плагина")
            }
            
            result
        } catch (e: Exception) {
            PluginResult.error("Ошибка выполнения команды: ${e.message}")
        }
    }
}