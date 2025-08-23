package com.example.feature.plugins.domain

import com.example.feature.plugins.model.PluginPermission
import com.example.feature.plugins.model.PluginResult
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class PluginPermissionManager @Inject constructor() {
    
    // Карта разрешений: pluginId -> Set<PluginPermission>
    private val grantedPermissions = mutableMapOf<String, MutableSet<PluginPermission>>()
    
    // Карта запросов разрешений: pluginId -> List<PluginPermission>
    private val _pendingPermissionRequests = MutableStateFlow<Map<String, List<PluginPermission>>>(emptyMap())
    val pendingPermissionRequests: StateFlow<Map<String, List<PluginPermission>>> = _pendingPermissionRequests.asStateFlow()
    
    /**
     * Проверить разрешения плагина
     */
    fun checkPermissions(pluginId: String, requiredPermissions: List<PluginPermission>): PluginResult<Unit> {
        val granted = grantedPermissions[pluginId] ?: emptySet()
        val missing = requiredPermissions.filter { it !in granted }
        
        return if (missing.isEmpty()) {
            PluginResult.success(Unit)
        } else {
            // Добавляем в очередь запросов разрешений
            requestPermissions(pluginId, missing)
            PluginResult.error("Требуются разрешения: ${missing.joinToString(", ")}")
        }
    }
    
    /**
     * Запросить разрешения для плагина
     */
    fun requestPermissions(pluginId: String, permissions: List<PluginPermission>) {
        val currentRequests = _pendingPermissionRequests.value.toMutableMap()
        currentRequests[pluginId] = permissions
        _pendingPermissionRequests.value = currentRequests
    }
    
    /**
     * Предоставить разрешения плагину
     */
    fun grantPermissions(pluginId: String, permissions: List<PluginPermission>) {
        val pluginPermissions = grantedPermissions.getOrPut(pluginId) { mutableSetOf() }
        pluginPermissions.addAll(permissions)
        
        // Удаляем из очереди запросов
        val currentRequests = _pendingPermissionRequests.value.toMutableMap()
        currentRequests.remove(pluginId)
        _pendingPermissionRequests.value = currentRequests
    }
    
    /**
     * Отклонить запрос разрешений
     */
    fun denyPermissions(pluginId: String) {
        val currentRequests = _pendingPermissionRequests.value.toMutableMap()
        currentRequests.remove(pluginId)
        _pendingPermissionRequests.value = currentRequests
    }
    
    /**
     * Отозвать разрешения у плагина
     */
    fun revokePermissions(pluginId: String, permissions: List<PluginPermission>) {
        val pluginPermissions = grantedPermissions[pluginId] ?: return
        pluginPermissions.removeAll(permissions.toSet())
        
        if (pluginPermissions.isEmpty()) {
            grantedPermissions.remove(pluginId)
        }
    }
    
    /**
     * Отозвать все разрешения у плагина
     */
    fun revokeAllPermissions(pluginId: String) {
        grantedPermissions.remove(pluginId)
    }
    
    /**
     * Получить предоставленные разрешения плагина
     */
    fun getGrantedPermissions(pluginId: String): Set<PluginPermission> {
        return grantedPermissions[pluginId]?.toSet() ?: emptySet()
    }
    
    /**
     * Проверить, имеет ли плагин конкретное разрешение
     */
    fun hasPermission(pluginId: String, permission: PluginPermission): Boolean {
        return grantedPermissions[pluginId]?.contains(permission) == true
    }
    
    /**
     * Получить описание разрешения
     */
    fun getPermissionDescription(permission: PluginPermission): String {
        return when (permission) {
            PluginPermission.READ_FILES -> "Чтение файлов на устройстве"
            PluginPermission.WRITE_FILES -> "Запись файлов на устройство"
            PluginPermission.NETWORK_ACCESS -> "Доступ к интернету"
            PluginPermission.CAMERA_ACCESS -> "Доступ к камере"
            PluginPermission.STORAGE_ACCESS -> "Доступ к хранилищу"
            PluginPermission.SYSTEM_SETTINGS -> "Доступ к настройкам системы"
            PluginPermission.READER_CONTROL -> "Управление читалкой комиксов"
            PluginPermission.UI_MODIFICATION -> "Изменение пользовательского интерфейса"
        }
    }
    
    /**
     * Получить уровень опасности разрешения
     */
    fun getPermissionRiskLevel(permission: PluginPermission): PermissionRiskLevel {
        return when (permission) {
            PluginPermission.READ_FILES -> PermissionRiskLevel.MEDIUM
            PluginPermission.WRITE_FILES -> PermissionRiskLevel.HIGH
            PluginPermission.NETWORK_ACCESS -> PermissionRiskLevel.MEDIUM
            PluginPermission.CAMERA_ACCESS -> PermissionRiskLevel.HIGH
            PluginPermission.STORAGE_ACCESS -> PermissionRiskLevel.MEDIUM
            PluginPermission.SYSTEM_SETTINGS -> PermissionRiskLevel.HIGH
            PluginPermission.READER_CONTROL -> PermissionRiskLevel.LOW
            PluginPermission.UI_MODIFICATION -> PermissionRiskLevel.MEDIUM
        }
    }
}

/**
 * Уровни риска разрешений
 */
enum class PermissionRiskLevel {
    LOW,      // Низкий риск
    MEDIUM,   // Средний риск
    HIGH      // Высокий риск
}