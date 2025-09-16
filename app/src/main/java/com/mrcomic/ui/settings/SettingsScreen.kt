package com.mrcomic.ui.settings

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp
import androidx.compose.ui.graphics.Color
import com.mrcomic.ui.theme.AppTheme

data class SettingsItem(
    val title: String,
    val subtitle: String? = null,
    val icon: ImageVector,
    val onClick: () -> Unit
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    modifier: Modifier = Modifier
) {
    var currentTheme by remember { mutableStateOf(AppTheme.LIGHT) }
    
    SettingsScreen(
        currentTheme = currentTheme,
        onThemeChange = { currentTheme = it },
        onLanguageClick = { /* TODO: Navigate to language settings */ },
        onAccountClick = { /* TODO: Navigate to account settings */ },
        onOptimizationClick = { /* TODO: Navigate to optimization settings */ },
        modifier = modifier
    )
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    currentTheme: AppTheme,
    onThemeChange: (AppTheme) -> Unit,
    onLanguageClick: () -> Unit,
    onAccountClick: () -> Unit,
    onOptimizationClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    val settingsItems = listOf(
        SettingsItem(
            title = "Аккаунт",
            subtitle = "Профиль, безопасность",
            icon = Icons.Default.Person,
            onClick = onAccountClick
        ),
        SettingsItem(
            title = "Язык",
            subtitle = "Русский",
            icon = Icons.Default.Language,
            onClick = onLanguageClick
        ),
        SettingsItem(
            title = "Оптимизация",
            subtitle = "Производительность, кэш",
            icon = Icons.Default.Speed,
            onClick = onOptimizationClick
        )
    )

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        // Заголовок
        item {
            Text(
                text = "Настройки",
                style = MaterialTheme.typography.headlineMedium,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

        // Выбор темы
        item {
            ThemeSelector(
                currentTheme = currentTheme,
                onThemeChange = onThemeChange,
                modifier = Modifier.padding(bottom = 16.dp)
            )
        }

        // Остальные настройки
        items(settingsItems) { item ->
            SettingsItemCard(item = item)
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun SettingsItemCard(
    item: SettingsItem,
    modifier: Modifier = Modifier
) {
    Card(
        onClick = item.onClick,
        modifier = modifier.fillMaxWidth()
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Icon(
                imageVector = item.icon,
                contentDescription = item.title,
                tint = MaterialTheme.colorScheme.primary,
                modifier = Modifier.size(24.dp)
            )
            
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(start = 16.dp)
            ) {
                Text(
                    text = item.title,
                    style = MaterialTheme.typography.titleMedium
                )
                if (item.subtitle != null) {
                    Text(
                        text = item.subtitle,
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
            
            Icon(
                imageVector = Icons.Default.ChevronRight,
                contentDescription = "Открыть",
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
    }
}

@Composable
private fun ThemeSelector(
    currentTheme: AppTheme,
    onThemeChange: (AppTheme) -> Unit,
    modifier: Modifier = Modifier
) {
    Card(modifier = modifier.fillMaxWidth()) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Text(
                text = "Тема",
                style = MaterialTheme.typography.titleMedium,
                modifier = Modifier.padding(bottom = 12.dp)
            )
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceEvenly
            ) {
                ThemeOption(
                    theme = AppTheme.LIGHT,
                    label = "Светлая",
                    isSelected = currentTheme == AppTheme.LIGHT,
                    onClick = { onThemeChange(AppTheme.LIGHT) }
                )
                
                ThemeOption(
                    theme = AppTheme.DARK,
                    label = "Темная",
                    isSelected = currentTheme == AppTheme.DARK,
                    onClick = { onThemeChange(AppTheme.DARK) }
                )
                
                ThemeOption(
                    theme = AppTheme.SEPIA,
                    label = "Сепия",
                    isSelected = currentTheme == AppTheme.SEPIA,
                    onClick = { onThemeChange(AppTheme.SEPIA) }
                )
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
private fun ThemeOption(
    theme: AppTheme,
    label: String,
    isSelected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    Column(
        horizontalAlignment = Alignment.CenterHorizontally,
        modifier = modifier.clickable { onClick() }
    ) {
        Card(
            colors = CardDefaults.cardColors(
                containerColor = when (theme) {
                    AppTheme.LIGHT -> Color(0xFFFEFBFF)
                    AppTheme.DARK -> Color(0xFF111318)
                    AppTheme.SEPIA -> Color(0xFFFFF8DC)
                }
            ),
            border = if (isSelected) {
                BorderStroke(2.dp, MaterialTheme.colorScheme.primary)
            } else null,
            modifier = Modifier.size(60.dp)
        ) {
            Box(
                modifier = Modifier.fillMaxSize(),
                contentAlignment = Alignment.Center
            ) {
                if (isSelected) {
                    Icon(
                        imageVector = Icons.Default.Check,
                        contentDescription = "Выбрано",
                        tint = MaterialTheme.colorScheme.primary
                    )
                }
            }
        }
        
        Text(
            text = label,
            style = MaterialTheme.typography.labelSmall,
            modifier = Modifier.padding(top = 4.dp)
        )
    }
}
