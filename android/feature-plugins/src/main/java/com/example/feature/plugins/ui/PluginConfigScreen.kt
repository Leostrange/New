package com.example.feature.plugins.ui

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.res.stringResource
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.TextFieldValue
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import com.example.feature.plugins.model.Plugin

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PluginConfigScreen(
    plugin: Plugin,
    onNavigateBack: () -> Unit,
    viewModel: PluginConfigViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    // Initialize configuration values
    LaunchedEffect(plugin) {
        viewModel.initializeConfig(plugin)
    }
    
    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("${plugin.name} - Настройки") },
                navigationIcon = {
                    IconButton(onClick = onNavigateBack) {
                        Icon(Icons.Default.ArrowBack, contentDescription = "Назад")
                    }
                },
                actions = {
                    IconButton(onClick = { viewModel.saveConfig() }) {
                        Icon(Icons.Default.Save, contentDescription = "Сохранить")
                    }
                }
            )
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
                        onRetry = { viewModel.initializeConfig(plugin) },
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
                else -> {
                    PluginConfigForm(
                        plugin = plugin,
                        configValues = uiState.configValues,
                        onConfigChange = { key, value -> viewModel.updateConfigValue(key, value) },
                        modifier = Modifier.fillMaxSize()
                    )
                }
            }
        }
    }
}

@Composable
private fun PluginConfigForm(
    plugin: Plugin,
    configValues: Map<String, String>,
    onConfigChange: (String, String) -> Unit,
    modifier: Modifier = Modifier
) {
    LazyColumn(
        modifier = modifier,
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        // Plugin info header
        item {
            PluginInfoHeader(plugin)
        }
        
        // Configuration options
        items(configValues.keys.toList()) { configKey ->
            val configValue = configValues[configKey] ?: ""
            ConfigItem(
                configKey = configKey,
                configValue = configValue,
                onValueChange = { newValue -> onConfigChange(configKey, newValue) }
            )
        }
        
        // Save button
        item {
            Button(
                onClick = { /* Save handled in top bar */ },
                modifier = Modifier.fillMaxWidth()
            ) {
                Icon(Icons.Default.Save, contentDescription = null)
                Spacer(modifier = Modifier.width(8.dp))
                Text("Сохранить настройки")
            }
        }
    }
}

@Composable
private fun PluginInfoHeader(plugin: Plugin) {
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = plugin.name,
                style = MaterialTheme.typography.headlineSmall
            )
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Версия: ${plugin.version}",
                style = MaterialTheme.typography.bodyMedium
            )
            Text(
                text = "Автор: ${plugin.author}",
                style = MaterialTheme.typography.bodyMedium
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
private fun ConfigItem(
    configKey: String,
    configValue: String,
    onValueChange: (String) -> Unit
) {
    var textFieldValue by remember { mutableStateOf(TextFieldValue(configValue)) }
    
    Card(
        elevation = CardDefaults.cardElevation(defaultElevation = 2.dp)
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = getConfigLabel(configKey),
                style = MaterialTheme.typography.titleMedium
            )
            Spacer(modifier = Modifier.height(8.dp))
            
            // Determine input type based on config key
            when {
                configKey.contains("enabled", ignoreCase = true) ||
                configKey.contains("enable", ignoreCase = true) -> {
                    Switch(
                        checked = configValue.equals("true", ignoreCase = true),
                        onCheckedChange = { checked -> onValueChange(checked.toString()) }
                    )
                }
                configKey.contains("count", ignoreCase = true) ||
                configKey.contains("number", ignoreCase = true) ||
                configKey.contains("size", ignoreCase = true) -> {
                    OutlinedTextField(
                        value = textFieldValue,
                        onValueChange = { newValue ->
                            textFieldValue = newValue
                            // Only allow numeric input
                            if (newValue.text.all { it.isDigit() || it == '.' }) {
                                onValueChange(newValue.text)
                            }
                        },
                        label = { Text("Введите число") },
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number)
                    )
                }
                configKey.contains("color", ignoreCase = true) -> {
                    // Color picker would go here
                    OutlinedTextField(
                        value = textFieldValue,
                        onValueChange = { newValue ->
                            textFieldValue = newValue
                            onValueChange(newValue.text)
                        },
                        label = { Text("Цвет (HEX)") }
                    )
                }
                else -> {
                    OutlinedTextField(
                        value = textFieldValue,
                        onValueChange = { newValue ->
                            textFieldValue = newValue
                            onValueChange(newValue.text)
                        },
                        label = { Text("Введите значение") },
                        modifier = Modifier.fillMaxWidth()
                    )
                }
            }
            
            Spacer(modifier = Modifier.height(4.dp))
            Text(
                text = getConfigDescription(configKey),
                style = MaterialTheme.typography.bodySmall,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
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

// Helper functions for configuration labels and descriptions
private fun getConfigLabel(configKey: String): String {
    return when {
        configKey.contains("enabled", ignoreCase = true) -> "Включено"
        configKey.contains("timeout", ignoreCase = true) -> "Таймаут"
        configKey.contains("retry", ignoreCase = true) -> "Попытки повтора"
        configKey.contains("cache", ignoreCase = true) -> "Кэширование"
        configKey.contains("quality", ignoreCase = true) -> "Качество"
        configKey.contains("size", ignoreCase = true) -> "Размер"
        configKey.contains("color", ignoreCase = true) -> "Цвет"
        configKey.contains("theme", ignoreCase = true) -> "Тема"
        configKey.contains("language", ignoreCase = true) -> "Язык"
        configKey.contains("format", ignoreCase = true) -> "Формат"
        else -> configKey.replaceFirstChar { it.uppercase() }
    }
}

private fun getConfigDescription(configKey: String): String {
    return when {
        configKey.contains("enabled", ignoreCase = true) -> "Включить или отключить эту функцию"
        configKey.contains("timeout", ignoreCase = true) -> "Время ожидания в миллисекундах"
        configKey.contains("retry", ignoreCase = true) -> "Количество попыток повтора операции"
        configKey.contains("cache", ignoreCase = true) -> "Использовать кэширование для улучшения производительности"
        configKey.contains("quality", ignoreCase = true) -> "Качество обработки (0-100%)"
        configKey.contains("size", ignoreCase = true) -> "Размер элемента интерфейса"
        configKey.contains("color", ignoreCase = true) -> "Цвет в формате HEX (#RRGGBB)"
        configKey.contains("theme", ignoreCase = true) -> "Выбор темы оформления"
        configKey.contains("language", ignoreCase = true) -> "Язык интерфейса"
        configKey.contains("format", ignoreCase = true) -> "Формат вывода данных"
        else -> "Настройка параметра ${configKey}"
    }
}