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
import android.content.Context
import android.net.Uri
import android.util.Log
import androidx.core.content.FileProvider
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream

@HiltViewModel
class PluginsViewModel @Inject constructor(
    private val pluginRepository: PluginRepository,
    private val permissionManager: PluginPermissionManager,
    private val context: Context
) : ViewModel() {
    
    companion object {
        private const val TAG = "PluginsViewModel"
    }
    
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
        // In a real implementation, this would navigate to a plugin configuration screen
        // For now, we'll just show a message that configuration is not yet implemented
        _uiState.update { it.copy(error = "Настройка плагинов будет реализована в следующей версии") }
    }
    
    fun installPluginFromFile() {
        // In a real implementation, this would open a file picker dialog
        // For now, we'll just show a message that file installation is not yet implemented
        _uiState.update { it.copy(error = "Установка из файла будет реализована в следующей версии") }
    }

    fun installPluginFromUri(uri: Uri) {
        viewModelScope.launch {
            try {
                // Copy the file from the URI to a temporary location
                val tempFile = copyUriToTempFile(uri)
                if (tempFile != null) {
                    // Install the plugin from the temporary file
                    val result = pluginRepository.installPlugin(tempFile.absolutePath)
                    if (result.success) {
                        // Delete the temporary file after successful installation
                        tempFile.delete()
                        _uiState.update { it.copy(error = "Плагин успешно установлен") }
                    } else {
                        _uiState.update { it.copy(error = result.error) }
                    }
                } else {
                    _uiState.update { it.copy(error = "Не удалось скопировать файл плагина") }
                }
            } catch (e: Exception) {
                Log.e(TAG, "Error installing plugin from URI", e)
                _uiState.update { it.copy(error = "Ошибка установки плагина: ${e.message}") }
            }
        }
    }

    private fun copyUriToTempFile(uri: Uri): File? {
        return try {
            val inputStream = context.contentResolver.openInputStream(uri)
            inputStream?.use { stream ->
                val tempFile = File.createTempFile("plugin_", ".zip", context.cacheDir)
                FileOutputStream(tempFile).use { output ->
                    stream.copyTo(output)
                }
                tempFile
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error copying URI to temp file", e)
            null
        }
    }

    fun setError(message: String) {
        _uiState.update { it.copy(error = message) }
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