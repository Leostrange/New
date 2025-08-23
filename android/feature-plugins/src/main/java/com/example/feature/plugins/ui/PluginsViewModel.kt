package com.example.feature.plugins.ui

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.feature.plugins.data.repository.PluginRepository
import com.example.feature.plugins.domain.PluginPermissionManager
import com.example.feature.plugins.model.Plugin
import com.example.feature.plugins.model.PluginPermission
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.*
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class PluginsViewModel @Inject constructor(
    private val pluginRepository: PluginRepository,
    private val permissionManager: PluginPermissionManager
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(PluginsUiState())
    val uiState: StateFlow<PluginsUiState> = combine(
        _uiState,
        pluginRepository.getAllPlugins(),
        permissionManager.pendingPermissionRequests
    ) { state, plugins, permissions ->
        state.copy(
            plugins = plugins,
            pendingPermissionRequests = permissions
        )
    }.stateIn(
        scope = viewModelScope,
        started = SharingStarted.WhileSubscribed(5000),
        initialValue = PluginsUiState()
    )
    
    init {
        refreshPlugins()
    }
    
    fun refreshPlugins() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                // Плагины загружаются автоматически через Flow из репозитория
                _uiState.update { it.copy(isLoading = false) }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false, 
                        error = "Ошибка загрузки плагинов: ${e.message}"
                    ) 
                }
            }
        }
    }
    
    fun togglePlugin(plugin: Plugin) {
        viewModelScope.launch {
            try {
                if (plugin.isEnabled) {
                    val result = pluginRepository.deactivatePlugin(plugin.id)
                    if (!result.success) {
                        _uiState.update { it.copy(error = result.error) }
                    }
                } else {
                    val result = pluginRepository.activatePlugin(plugin.id)
                    if (!result.success) {
                        _uiState.update { it.copy(error = result.error) }
                    }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "Ошибка переключения плагина: ${e.message}") }
            }
        }
    }
    
    fun uninstallPlugin(plugin: Plugin) {
        viewModelScope.launch {
            try {
                val result = pluginRepository.uninstallPlugin(plugin.id)
                if (!result.success) {
                    _uiState.update { it.copy(error = result.error) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "Ошибка удаления плагина: ${e.message}") }
            }
        }
    }
    
    fun configurePlugin(plugin: Plugin) {
        // TODO: Открыть экран конфигурации плагина
        _uiState.update { it.copy(error = "Настройка плагинов пока не реализована") }
    }
    
    fun installPluginFromFile() {
        // TODO: Открыть файловый диалог для выбора плагина
        _uiState.update { it.copy(error = "Установка из файла пока не реализована") }
    }
    
    fun openPluginStore() {
        // TODO: Открыть магазин плагинов
        _uiState.update { it.copy(error = "Магазин плагинов пока не реализован") }
    }
    
    fun grantPermissions(pluginId: String, permissions: List<PluginPermission>) {
        viewModelScope.launch {
            try {
                permissionManager.grantPermissions(pluginId, permissions)
                // Попытка повторной активации плагина
                val result = pluginRepository.activatePlugin(pluginId)
                if (!result.success) {
                    _uiState.update { it.copy(error = result.error) }
                }
            } catch (e: Exception) {
                _uiState.update { it.copy(error = "Ошибка предоставления разрешений: ${e.message}") }
            }
        }
    }
    
    fun denyPermissions(pluginId: String) {
        viewModelScope.launch {
            permissionManager.denyPermissions(pluginId)
        }
    }
    
    fun clearError() {
        _uiState.update { it.copy(error = null) }
    }
}

data class PluginsUiState(
    val plugins: List<Plugin> = emptyList(),
    val isLoading: Boolean = false,
    val error: String? = null,
    val pendingPermissionRequests: Map<String, List<PluginPermission>> = emptyMap()
)