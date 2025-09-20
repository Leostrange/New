package com.mrcomic.feature.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.unit.dp
import coil.compose.AsyncImage
import com.mrcomic.core.ui.theme.AppTheme
import androidx.lifecycle.compose.collectAsStateWithLifecycle
import androidx.hilt.navigation.compose.hiltViewModel
import com.mrcomic.feature.settings.ui.theme.SettingsViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier,
    viewModel: SettingsViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsStateWithLifecycle()
    
    var showThemeDialog by remember { mutableStateOf(false) }
    var showLanguageDialog by remember { mutableStateOf(false) }
    var showThemeBuilderDialog by remember { mutableStateOf(false) }
    var showFontDialog by remember { mutableStateOf(false) }
    var showIconDialog by remember { mutableStateOf(false) }

    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Account Settings",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        AsyncImage(
                            model = "https://example.com/avatar.jpg",
                            contentDescription = "Profile picture",
                            contentScale = ContentScale.Crop,
                            modifier = Modifier
                                .size(64.dp)
                                .clip(CircleShape)
                        )
                        
                        Spacer(modifier = Modifier.width(16.dp))
                        
                        Column {
                            Text(
                                "Alex Mercer",
                                style = MaterialTheme.typography.titleMedium
                            )
                            Text(
                                "alex.mercer@example.com",
                                style = MaterialTheme.typography.bodyMedium,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    SettingsItem(
                        title = "Edit Profile",
                        icon = Icons.Default.Edit,
                        onClick = { /* TODO */ }
                    )
                    
                    SettingsItem(
                        title = "Change Password", 
                        icon = Icons.Default.Lock,
                        onClick = { /* TODO */ }
                    )
                    
                    SettingsItem(
                        title = "Log Out",
                        icon = Icons.Default.ExitToApp,
                        onClick = { /* TODO */ }
                    )
                }
            }
        }
        
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "General",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    SettingsItem(
                        title = "Language",
                        subtitle = "English",
                        icon = Icons.Default.Language,
                        onClick = { showLanguageDialog = true }
                    )
                    
                    SettingsItem(
                        title = "Display",
                        subtitle = "Brightness, screen timeout",
                        icon = Icons.Default.Brightness6,
                        onClick = { /* TODO */ }
                    )
                    
                    SettingsItem(
                        title = "Notifications",
                        subtitle = "Manage notifications",
                        icon = Icons.Default.Notifications,
                        onClick = { /* TODO */ }
                    )
                    
                    SettingsItem(
                        title = "Sounds",
                        subtitle = "Permissions, account activity",
                        icon = Icons.Default.VolumeUp,
                        onClick = { /* TODO */ }
                    )
                }
            }
        }
        
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Themes",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    SettingsItem(
                        title = "Theme Selection",
                        subtitle = uiState.currentTheme.name,
                        icon = Icons.Default.Palette,
                        onClick = { showThemeDialog = true }
                    )
                }
            }
        }
        
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Customization",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    SettingsItem(
                        title = "Theme Builder",
                        subtitle = "Create custom themes",
                        icon = Icons.Default.Brush,
                        onClick = { showThemeBuilderDialog = true }
                    )
                    
                    SettingsItem(
                        title = "Custom Themes",
                        subtitle = "Manage your themes",
                        icon = Icons.Default.ColorLens,
                        onClick = { /* TODO: Show custom themes manager */ }
                    )
                    
                    SettingsItem(
                        title = "Fonts",
                        subtitle = "Sans Serif",
                        icon = Icons.Default.TextFields,
                        onClick = { showFontDialog = true }
                    )
                    
                    SettingsItem(
                        title = "Icon Pack",
                        subtitle = "Material Design",
                        icon = Icons.Default.Apps,
                        onClick = { showIconDialog = true }
                    )
                    
                    SettingsItem(
                        title = "Layout Customization",
                        subtitle = "Adjust UI elements",
                        icon = Icons.Default.ViewQuilt,
                        onClick = { /* TODO: Show layout customization */ }
                    )
                }
            }
        }
        
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Optimization",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    SettingsItem(
                        title = "Performance Mode",
                        subtitle = uiState.performanceMode,
                        icon = Icons.Default.Speed,
                        onClick = { /* TODO: Show performance mode dialog */ }
                    )
                    
                    SettingsItemWithSwitch(
                        title = "Reduce Animations",
                        checked = uiState.reduceAnimations,
                        onCheckedChange = viewModel::updateReduceAnimations
                    )
                    
                    SettingsItemWithSwitch(
                        title = "Async Cover Loading",
                        checked = uiState.asyncCoverLoading,
                        onCheckedChange = viewModel::updateAsyncCoverLoading
                    )
                    
                    SettingsItemWithSwitch(
                        title = "Compress Images on Import",
                        checked = uiState.compressImages,
                        onCheckedChange = viewModel::updateCompressImages
                    )
                    
                    SettingsItemWithSwitch(
                        title = "Night Mode Optimization",
                        checked = uiState.nightModeOptimization,
                        onCheckedChange = viewModel::updateNightModeOptimization
                    )
                    
                    SettingsItemWithSwitch(
                        title = "Disable Online Functions on Slow Internet",
                        checked = uiState.disableOnlineOnSlowInternet,
                        onCheckedChange = viewModel::updateDisableOnlineOnSlowInternet
                    )
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    Button(
                        onClick = viewModel::clearCache,
                        modifier = Modifier.fillMaxWidth()
                    ) {
                        Icon(Icons.Default.Delete, contentDescription = null)
                        Spacer(modifier = Modifier.width(8.dp))
                        Text("Clear Cache")
                    }
                }
            }
        }
    }
    
    if (showThemeDialog) {
        ThemeSelectionDialog(
            currentTheme = uiState.currentTheme,
            onThemeSelected = { theme ->
                viewModel.updateTheme(theme)
                showThemeDialog = false
            },
            onDismiss = { showThemeDialog = false }
        )
    }
    
    if (showLanguageDialog) {
        LanguageSelectionDialog(
            onLanguageSelected = { language ->
                // TODO: Handle language change
                showLanguageDialog = false
            },
            onDismiss = { showLanguageDialog = false }
        )
    }
    
    if (showThemeBuilderDialog) {
        ThemeBuilderDialog(
            onDismiss = { showThemeBuilderDialog = false },
            onThemeCreated = { customTheme ->
                // TODO: Save custom theme
                showThemeBuilderDialog = false
            }
        )
    }
    
    if (showFontDialog) {
        FontSelectionDialog(
            onFontSelected = { font ->
                // TODO: Apply font
                showFontDialog = false
            },
            onDismiss = { showFontDialog = false }
        )
    }
    
    if (showIconDialog) {
        IconPackDialog(
            onIconPackSelected = { iconPack ->
                // TODO: Apply icon pack
                showIconDialog = false
            },
            onDismiss = { showIconDialog = false }
        )
    }
}

@Composable
private fun SettingsItem(
    title: String,
    subtitle: String? = null,
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Icon(icon, contentDescription = null)
        Spacer(modifier = Modifier.width(16.dp))
        Column(modifier = Modifier.weight(1f)) {
            Text(title, style = MaterialTheme.typography.bodyLarge)
            if (subtitle != null) {
                Text(
                    subtitle,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }
        Icon(Icons.Default.ChevronRight, contentDescription = null)
    }
}

@Composable
private fun SettingsItemWithSwitch(
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Text(
            title,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f)
        )
        Switch(
            checked = checked,
            onCheckedChange = onCheckedChange
        )
    }
}

@Composable
private fun ThemeSelectionDialog(
    currentTheme: AppTheme,
    onThemeSelected: (AppTheme) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Select Theme") },
        text = {
            Column {
                AppTheme.values().forEach { theme ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { onThemeSelected(theme) }
                            .padding(vertical = 8.dp)
                    ) {
                        RadioButton(
                            selected = currentTheme == theme,
                            onClick = { onThemeSelected(theme) }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(theme.name)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun LanguageSelectionDialog(
    onLanguageSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val languages = listOf("English", "Spanish", "French", "German", "Chinese", "Japanese")
    var selectedLanguage by remember { mutableStateOf("English") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Language") },
        text = {
            Column {
                languages.forEach { language ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedLanguage = language }
                            .padding(vertical = 8.dp)
                    ) {
                        RadioButton(
                            selected = selectedLanguage == language,
                            onClick = { selectedLanguage = language }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(language)
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { 
                onLanguageSelected(selectedLanguage)
                onDismiss()
            }) {
                Text("CONFIRM")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun ThemeBuilderDialog(
    onDismiss: () -> Unit,
    onThemeCreated: (String) -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Theme Builder") },
        text = {
            Text("Create your custom theme here.")
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun FontSelectionDialog(
    onFontSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Font Selection") },
        text = {
            Text("Select your preferred font.")
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}

@Composable
private fun IconPackDialog(
    onIconPackSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Icon Pack Selection") },
        text = {
            Text("Choose your icon pack.")
        },
        confirmButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
