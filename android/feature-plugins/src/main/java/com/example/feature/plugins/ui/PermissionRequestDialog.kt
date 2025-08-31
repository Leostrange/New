package com.example.feature.plugins.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.example.feature.plugins.model.PluginPermission
import com.example.feature.plugins.domain.PermissionRiskLevel

@Composable
fun PermissionRequestDialog(
    pluginName: String,
    permissions: List<PluginPermission>,
    onConfirm: (List<PluginPermission>) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = {
            Text(
                text = "Запрос разрешений",
                style = MaterialTheme.typography.headlineSmall,
                fontWeight = FontWeight.Bold
            )
        },
        text = {
            Column(
                modifier = modifier
                    .fillMaxWidth()
                    .verticalScroll(rememberScrollState())
            ) {
                Text(
                    text = "Плагин \"$pluginName\" запрашивает следующие разрешения:",
                    style = MaterialTheme.typography.bodyMedium,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
                
                permissions.forEach { permission ->
                    PermissionRequestItem(
                        permission = permission,
                        modifier = Modifier.padding(vertical = 4.dp)
                    )
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onConfirm(permissions) }
            ) {
                Text("Разрешить")
            }
        },
        dismissButton = {
            TextButton(
                onClick = onDismiss
            ) {
                Text("Отклонить")
            }
        }
    )
}

@Composable
private fun PermissionRequestItem(
    permission: PluginPermission,
    modifier: Modifier = Modifier
) {
    val riskLevel = getRiskLevel(permission)
    val color = getPermissionColor(riskLevel)
    
    Card(
        modifier = modifier,
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(12.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = getPermissionIcon(permission),
                contentDescription = null,
                tint = color,
                modifier = Modifier.size(20.dp)
            )
            
            Spacer(modifier = Modifier.width(12.dp))
            
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = getPermissionDescription(permission),
                    style = MaterialTheme.typography.bodyMedium
                )
                
                Spacer(modifier = Modifier.height(2.dp))
                
                Text(
                    text = getRiskLevelDescription(riskLevel),
                    style = MaterialTheme.typography.bodySmall,
                    color = color
                )
            }
        }
    }
}

// Helper functions for permission display
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