package com.example.feature.plugins.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import com.example.feature.plugins.model.Plugin
import com.example.feature.plugins.model.PluginPermission
import com.example.feature.plugins.domain.PermissionRiskLevel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PluginPermissionsScreen(
    plugin: Plugin,
    onNavigateBack: () -> Unit,
    viewModel: PluginPermissionsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    LaunchedEffect(plugin.id) {
        viewModel.loadPluginPermissions(plugin)
    }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Разрешения плагина") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                }
            )
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            PluginPermissionsContent(
                plugin = plugin,
                grantedPermissions = uiState.grantedPermissions,
                onPermissionToggle = { permission, granted ->
                    viewModel.togglePermission(plugin.id, permission, granted)
                },
                modifier = Modifier.fillMaxSize()
            )
        }
    }
}

@Composable
private fun PluginPermissionsContent(
    plugin: Plugin,
    grantedPermissions: Set<PluginPermission>,
    onPermissionToggle: (PluginPermission, Boolean) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        // Plugin header
        item {
            PluginHeader(plugin = plugin)
        }
        
        // Permissions list
        items(plugin.permissions) { permission ->
            PermissionItem(
                permission = permission,
                isGranted = permission in grantedPermissions,
                onToggle = { granted -> onPermissionToggle(permission, granted) }
            )
        }
        
        // Additional permissions that might not be in the plugin's manifest
        item {
            AdditionalPermissionsSection(
                plugin = plugin,
                grantedPermissions = grantedPermissions,
                onPermissionToggle = onPermissionToggle
            )
        }
    }
}

@Composable
private fun PluginHeader(plugin: Plugin) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = plugin.name,
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold,
                maxLines = 1,
                overflow = TextOverflow.Ellipsis
            )
            
            Spacer(modifier = Modifier.height(4.dp))
            
            Text(
                text = "v${plugin.version} • ${plugin.author}",
                style = MaterialTheme.typography.bodyMedium,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = plugin.description,
                style = MaterialTheme.typography.bodyMedium
            )
        }
    }
}

@Composable
private fun PermissionItem(
    permission: PluginPermission,
    isGranted: Boolean,
    onToggle: (Boolean) -> Unit
) {
    val riskLevel = getRiskLevel(permission)
    val color = getPermissionColor(riskLevel)
    
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = getPermissionIcon(permission),
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(24.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = getPermissionDescription(permission),
                    style = MaterialTheme.typography.bodyLarge
                )
                
                Spacer(modifier = Modifier.height(4.dp))
                
                Text(
                    text = getRiskLevelDescription(riskLevel),
                    style = MaterialTheme.typography.bodySmall,
                    color = color
                )
            }
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Switch(
                checked = isGranted,
                onCheckedChange = onToggle
            )
        }
    }
}

@Composable
private fun AdditionalPermissionsSection(
    plugin: Plugin,
    grantedPermissions: Set<PluginPermission>,
    onPermissionToggle: (PluginPermission, Boolean) -> Unit
) {
    // Get all permissions that are granted but not in the plugin's manifest
    val additionalPermissions = grantedPermissions.filter { it !in plugin.permissions }
    
    if (additionalPermissions.isNotEmpty()) {
        Column {
            Text(
                text = "Дополнительные разрешения",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            additionalPermissions.forEach { permission ->
                PermissionItem(
                    permission = permission,
                    isGranted = true,
                    onToggle = { granted -> onPermissionToggle(permission, granted) }
                )
                
                Spacer(modifier = Modifier.height(8.dp))
            }
        }
    }
}

// Helper functions
private fun getPermissionIcon(permission: PluginPermission) = when (permission) {
    PluginPermission.READ_FILES -> Icons.Default.Folder
    PluginPermission.WRITE_FILES -> Icons.Default.Edit
    PluginPermission.NETWORK_ACCESS -> Icons.Default.Public
    PluginPermission.CAMERA_ACCESS -> Icons.Default.CameraAlt
    PluginPermission.STORAGE_ACCESS -> Icons.Default.Storage
    PluginPermission.SYSTEM_SETTINGS -> Icons.Default.Settings
    PluginPermission.READER_CONTROL -> Icons.Default.Book
    PluginPermission.UI_MODIFICATION -> Icons.Default.Edit
}

private fun getPermissionColor(riskLevel: PermissionRiskLevel) = when (riskLevel) {
    PermissionRiskLevel.LOW -> Color.Green
    PermissionRiskLevel.MEDIUM -> Color(0xFFFF9800) // Orange
    PermissionRiskLevel.HIGH -> Color.Red
}

private fun getRiskLevel(permission: PluginPermission) = when (permission) {
    PluginPermission.READ_FILES -> PermissionRiskLevel.MEDIUM
    PluginPermission.WRITE_FILES -> PermissionRiskLevel.HIGH
    PluginPermission.NETWORK_ACCESS -> PermissionRiskLevel.MEDIUM
    PluginPermission.CAMERA_ACCESS -> PermissionRiskLevel.HIGH
    PluginPermission.STORAGE_ACCESS -> PermissionRiskLevel.MEDIUM
    PluginPermission.SYSTEM_SETTINGS -> PermissionRiskLevel.HIGH
    PluginPermission.READER_CONTROL -> PermissionRiskLevel.LOW
    PluginPermission.UI_MODIFICATION -> PermissionRiskLevel.MEDIUM
}

private fun getPermissionDescription(permission: PluginPermission) = when (permission) {
    PluginPermission.READ_FILES -> "Чтение файлов"
    PluginPermission.WRITE_FILES -> "Запись файлов"
    PluginPermission.NETWORK_ACCESS -> "Доступ к интернету"
    PluginPermission.CAMERA_ACCESS -> "Доступ к камере"
    PluginPermission.STORAGE_ACCESS -> "Доступ к хранилищу"
    PluginPermission.SYSTEM_SETTINGS -> "Изменение настроек"
    PluginPermission.READER_CONTROL -> "Управление читалкой"
    PluginPermission.UI_MODIFICATION -> "Изменение интерфейса"
}

private fun getRiskLevelDescription(riskLevel: PermissionRiskLevel) = when (riskLevel) {
    PermissionRiskLevel.LOW -> "Низкий риск"
    PermissionRiskLevel.MEDIUM -> "Средний риск"
    PermissionRiskLevel.HIGH -> "Высокий риск"
}