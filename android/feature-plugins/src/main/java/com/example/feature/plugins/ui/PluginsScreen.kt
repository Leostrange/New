package com.example.feature.plugins.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.feature.plugins.model.*
import com.example.feature.plugins.domain.PermissionRiskLevel
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import android.net.Uri

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PluginsScreen(
    onNavigateBack: () -> Unit,
    onNavigateToPermissions: (Plugin) -> Unit,
    onNavigateToStore: () -> Unit,
    onNavigateToConfig: (Plugin) -> Unit,
    viewModel: PluginsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    val context = LocalContext.current
    
    // Диалог запроса разрешений
    var showPermissionDialog by remember { mutableStateOf(false) }
    var pendingPermissions by remember { mutableStateOf<Pair<String, List<PluginPermission>>?>(null) }
    
    // Отслеживание запросов разрешений
    LaunchedEffect(uiState.pendingPermissionRequests) {
        if (uiState.pendingPermissionRequests.isNotEmpty()) {
            val firstRequest = uiState.pendingPermissionRequests.entries.first()
            pendingPermissions = firstRequest.key to firstRequest.value
            showPermissionDialog = true
        }
    }
    
    val filePickerLauncher = rememberLauncherForActivityResult(
        contract = ActivityResultContracts.OpenDocument(),
        onResult = { uri: Uri? ->
            if (uri != null) {
                viewModel.installPluginFromUri(uri)
            }
        }
    )

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Плагины") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.refreshPlugins() }) {
                        Icon(Icons.Default.Refresh, contentDescription = "Обновить")
                    }
                    IconButton(onClick = { onNavigateToStore() }) {
                        Icon(Icons.Default.ShoppingCart, contentDescription = "Магазин плагинов")
                    }
                }
            )
        },
        floatingActionButton = {
            FloatingActionButton(
                onClick = {
                    try {
                        filePickerLauncher.launch(arrayOf("application/zip", "application/x-zip-compressed", "application/octet-stream", "text/javascript", "application/javascript"))
                    } catch (e: Exception) {
                        viewModel.setError("Не удалось открыть файловый диалог: ${e.message}")
                    }
                }
            ) {
                Icon(Icons.Default.Add, contentDescription = "Установить плагин")
            }
        }
    ) { paddingValues ->
        Box(modifier = Modifier.fillMaxSize().padding(paddingValues)) {
            when {
                uiState.isLoading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                uiState.error != null -> {
                    val errorMessage = uiState.error ?: "Unknown error"
                    ErrorMessage(
                        error = errorMessage,
                        onRetry = { viewModel.refreshPlugins() },
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                uiState.plugins.isEmpty() -> {
                    EmptyState(
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                else -> {
                    PluginsList(
                        plugins = uiState.plugins,
                        onPluginToggle = { plugin -> viewModel.togglePlugin(plugin) },
                        onPluginUninstall = { plugin -> viewModel.uninstallPlugin(plugin) },
                        onPluginConfigure = { plugin -> onNavigateToConfig(plugin) },
                        onNavigateToPermissions = onNavigateToPermissions,
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
    
    // Диалог запроса разрешений
    if (showPermissionDialog && pendingPermissions != null) {
        PermissionRequestDialog(
            pluginId = pendingPermissions!!.first,
            permissions = pendingPermissions!!.second,
            onGranted = { pluginId, permissions ->
                viewModel.grantPermissions(pluginId, permissions)
                showPermissionDialog = false
                pendingPermissions = null
            },
            onDenied = { pluginId ->
                viewModel.denyPermissions(pluginId)
                showPermissionDialog = false
                pendingPermissions = null
            },
            onDismiss = {
                showPermissionDialog = false
                pendingPermissions = null
            }
        )
    }
}

@Composable
private fun PluginsList(
    plugins: List<Plugin>,
    onPluginToggle: (Plugin) -> Unit,
    onPluginUninstall: (Plugin) -> Unit,
    onPluginConfigure: (Plugin) -> Unit,
    onNavigateToPermissions: (Plugin) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp)
    ) {
        items(plugins, key = { it.id }) { plugin ->
            PluginCard(
                plugin = plugin,
                onToggle = { onPluginToggle(plugin) },
                onUninstall = { onPluginUninstall(plugin) },
                onConfigure = { onPluginConfigure(plugin) },
                onNavigateToPermissions = onNavigateToPermissions
            )
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun PluginCard(
    plugin: Plugin,
    onToggle: () -> Unit,
    onUninstall: () -> Unit,
    onConfigure: () -> Unit,
    onNavigateToPermissions: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = plugin.name,
                        style = MaterialTheme.typography.headlineSmall,
                        fontWeight = FontWeight.Bold,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "v${plugin.version} • ${plugin.author}",
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
                
                Switch(
                    checked = plugin.isEnabled,
                    onCheckedChange = { onToggle() }
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = plugin.description,
                style = MaterialTheme.typography.bodyMedium,
                maxLines = 2,
                overflow = TextOverflow.Ellipsis
            )
            
            Spacer(modifier = Modifier.height(8.dp))
            
            // Категория и тип плагина
            Row(
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                AssistChip(
                    onClick = { },
                    label = { Text(plugin.category.name) },
                    leadingIcon = {
                        Icon(
                            imageVector = getCategoryIcon(plugin.category),
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                    }
                )
                
                AssistChip(
                    onClick = { },
                    label = { Text(plugin.type.name) }
                )
            }
            
            Spacer(modifier = Modifier.height(12.dp))
            
            // Кнопки действий
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End,
                verticalAlignment = Alignment.CenterVertically
            ) {
                if (plugin.configurable) {
                    TextButton(onClick = onConfigure) {
                        Icon(
                            Icons.Default.Settings,
                            contentDescription = null,
                            modifier = Modifier.size(16.dp)
                        )
                        Spacer(modifier = Modifier.width(4.dp))
                        Text("Настроить")
                    }
                }
                
                TextButton(
                    onClick = onNavigateToPermissions,
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.primary
                    )
                ) {
                    Icon(
                        Icons.Default.Security,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Разрешения")
                }
                
                TextButton(
                    onClick = onUninstall,
                    colors = ButtonDefaults.textButtonColors(
                        contentColor = MaterialTheme.colorScheme.error
                    )
                ) {
                    Icon(
                        Icons.Default.Delete,
                        contentDescription = null,
                        modifier = Modifier.size(16.dp)
                    )
                    Spacer(modifier = Modifier.width(4.dp))
                    Text("Удалить")
                }
            }
        }
    }
}

@Composable
private fun PermissionRequestDialog(
    pluginId: String,
    permissions: List<PluginPermission>,
    onGranted: (String, List<PluginPermission>) -> Unit,
    onDenied: (String) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Запрос разрешений") },
        text = {
            Column {
                Text("Плагин запрашивает следующие разрешения:")
                Spacer(modifier = Modifier.height(8.dp))
                
                permissions.forEach { permission ->
                    Row(
                        modifier = Modifier.padding(vertical = 4.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Icon(
                            imageVector = getPermissionIcon(permission),
                            contentDescription = null,
                            tint = getPermissionColor(permission),
                            modifier = Modifier.size(20.dp)
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = getPermissionDescription(permission),
                            style = MaterialTheme.typography.bodyMedium
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(
                onClick = { onGranted(pluginId, permissions) }
            ) {
                Text("Разрешить")
            }
        },
        dismissButton = {
            TextButton(
                onClick = { onDenied(pluginId) }
            ) {
                Text("Отклонить")
            }
        }
    )
}

@Composable
private fun ErrorMessage(
    error: String,
    onRetry: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.Warning,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.error,
            modifier = Modifier.size(48.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = error,
            style = MaterialTheme.typography.bodyLarge,
            color = MaterialTheme.colorScheme.error
        )
        Spacer(modifier = Modifier.height(16.dp))
        Button(onClick = onRetry) {
            Text("Повторить")
        }
    }
}

@Composable
private fun EmptyState(
    modifier: Modifier = Modifier
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            Icons.Default.Extension,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.onSurfaceVariant,
            modifier = Modifier.size(64.dp)
        )
        Spacer(modifier = Modifier.height(16.dp))
        Text(
            text = "Нет установленных плагинов",
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "Установите плагины для расширения функциональности",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

// Вспомогательные функции

private fun getCategoryIcon(category: PluginCategory) = when (category) {
    PluginCategory.READER_ENHANCEMENT -> Icons.Default.Book
    PluginCategory.IMAGE_PROCESSING -> Icons.Default.Photo
    PluginCategory.TRANSLATION -> Icons.Default.Language
    PluginCategory.EXPORT -> Icons.Default.Download
    PluginCategory.UTILITY -> Icons.Default.Build
    PluginCategory.THEME -> Icons.Default.ColorLens
    PluginCategory.FORMAT_SUPPORT -> Icons.Default.Article
    PluginCategory.INTEGRATION -> Icons.Default.Share
}

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

private fun getPermissionColor(permission: PluginPermission) = when (getRiskLevel(permission)) {
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
