package com.example.feature.plugins.data.repository

import com.example.feature.plugins.data.local.PluginDao
import com.example.feature.plugins.data.local.PluginEntity
import com.example.feature.plugins.data.mapper.toDomain
import com.example.feature.plugins.data.mapper.toEntity
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
            // 1. Деактивация плагина
            if (pluginManager.isActive(pluginId)) {
                val deactivationResult = pluginManager.deactivatePlugin(pluginId)
                if (!deactivationResult.success) {
                    return PluginResult.error("Ошибка деактивации: ${deactivationResult.error}")
                }
            }
            
            // 2. Удаление файлов плагина
            val plugin = getPluginById(pluginId)
            plugin?.packagePath?.let { path ->
                pluginManager.removePluginFiles(path)
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
            val result = pluginManager.activatePlugin(pluginId)
            if (result.success) {
                pluginDao.updatePluginState(pluginId, true)
            }
            result
        } catch (e: Exception) {
            PluginResult.error("Ошибка активации плагина: ${e.message}")
        }
    }
    
    /**
     * Деактивировать плагин
     */
    suspend fun deactivatePlugin(pluginId: String): PluginResult<Unit> {
        return try {
            val result = pluginManager.deactivatePlugin(pluginId)
            if (result.success) {
                pluginDao.updatePluginState(pluginId, false)
            }
            result
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
            if (!pluginManager.isActive(pluginId)) {
                return PluginResult.error("Плагин не активен")
            }
            
            pluginManager.executeCommand(pluginId, command, params)
        } catch (e: Exception) {
            PluginResult.error("Ошибка выполнения команды: ${e.message}")
        }
    }
}