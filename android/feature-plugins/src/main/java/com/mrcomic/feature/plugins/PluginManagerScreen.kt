package com.mrcomic.feature.plugins

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PluginManagerScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTab by remember { mutableIntStateOf(0) }
    val tabs = listOf("Installed", "Available", "Themes")

    Column(modifier = modifier.fillMaxSize()) {
        // Top App Bar
        TopAppBar(
            title = { Text("Plugin Manager") },
            navigationIcon = {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            actions = {
                IconButton(onClick = { /* Refresh */ }) {
                    Icon(Icons.Default.Refresh, contentDescription = "Refresh")
                }
            }
        )

        // Tab Row
        TabRow(selectedTabIndex = selectedTab) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }

        // Content based on selected tab
        when (selectedTab) {
            0 -> InstalledPluginsContent()
            1 -> AvailablePluginsContent()
            2 -> ThemesContent()
        }
    }
}

@Composable
private fun InstalledPluginsContent() {
    val installedPlugins = remember {
        listOf(
            Plugin("1", "Dark Reader", "Enhanced dark mode for comics", "1.2.0", true),
            Plugin("2", "Auto Translator", "Automatic text translation", "2.1.0", false),
            Plugin("3", "Page Enhancer", "AI-powered page enhancement", "1.0.5", true),
            Plugin("4", "Cloud Sync", "Sync reading progress across devices", "3.0.1", true)
        )
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(installedPlugins) { plugin ->
            PluginCard(
                plugin = plugin,
                isInstalled = true,
                onToggle = { /* Toggle plugin */ },
                onAction = { /* Uninstall */ }
            )
        }
    }
}

@Composable
private fun AvailablePluginsContent() {
    val availablePlugins = remember {
        listOf(
            Plugin("5", "Speed Reader", "Fast reading mode with highlighting", "1.0.0", false),
            Plugin("6", "Manga Mode", "Right-to-left reading support", "2.0.0", false),
            Plugin("7", "Voice Reader", "Text-to-speech for comics", "1.5.0", false),
            Plugin("8", "Panel Zoom", "Smart panel detection and zoom", "1.1.0", false)
        )
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(availablePlugins) { plugin ->
            PluginCard(
                plugin = plugin,
                isInstalled = false,
                onToggle = null,
                onAction = { /* Install */ }
            )
        }
    }
}

@Composable
private fun ThemesContent() {
    val themes = remember {
        listOf(
            Theme("1", "Midnight Blue", "Dark theme with blue accents", "Free"),
            Theme("2", "Sepia Classic", "Warm reading theme", "Free"),
            Theme("3", "High Contrast", "Accessibility focused theme", "Free"),
            Theme("4", "Neon Cyber", "Futuristic neon theme", "Premium")
        )
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        items(themes) { theme ->
            ThemeCard(
                theme = theme,
                onApply = { /* Apply theme */ },
                onDownload = { /* Download theme */ }
            )
        }
    }
}

@Composable
private fun PluginCard(
    plugin: Plugin,
    isInstalled: Boolean,
    onToggle: (() -> Unit)?,
    onAction: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = plugin.name,
                        style = MaterialTheme.typography.titleMedium,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = plugin.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                    Text(
                        text = "Version ${plugin.version}",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }

                if (isInstalled && onToggle != null) {
                    Switch(
                        checked = plugin.isEnabled,
                        onCheckedChange = { onToggle() }
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.End
            ) {
                if (isInstalled) {
                    OutlinedButton(onClick = onAction) {
                        Text("Uninstall")
                    }
                } else {
                    Button(onClick = onAction) {
                        Text("Install")
                    }
                }
            }
        }
    }
}

@Composable
private fun ThemeCard(
    theme: Theme,
    onApply: () -> Unit,
    onDownload: () -> Unit,
    modifier: Modifier = Modifier
) {
    Card(
        modifier = modifier.fillMaxWidth()
    ) {
        Column(
            modifier = Modifier.padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = theme.name,
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        if (theme.price == "Premium") {
                            AssistChip(
                                onClick = { },
                                label = { Text("Premium") },
                                colors = AssistChipDefaults.assistChipColors(
                                    containerColor = MaterialTheme.colorScheme.primaryContainer
                                )
                            )
                        }
                    }
                    Text(
                        text = theme.description,
                        style = MaterialTheme.typography.bodyMedium,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                OutlinedButton(
                    onClick = onApply,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Preview")
                }
                Button(
                    onClick = onDownload,
                    modifier = Modifier.weight(1f)
                ) {
                    Text(if (theme.price == "Free") "Apply" else "Buy")
                }
            }
        }
    }
}

// Data classes
data class Plugin(
    val id: String,
    val name: String,
    val description: String,
    val version: String,
    val isEnabled: Boolean
)

data class Theme(
    val id: String,
    val name: String,
    val description: String,
    val price: String
)
