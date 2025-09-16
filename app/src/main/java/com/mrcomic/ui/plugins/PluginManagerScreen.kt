package com.mrcomic.ui.plugins

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun PluginManagerScreen(
    onBackClick: () -> Unit
) {
    var selectedTab by remember { mutableStateOf(0) }
    val tabs = listOf("Installed", "Available", "Themes")
    
    val installedPlugins = remember {
        listOf(
            Plugin("1", "PDF Reader", "Enhanced PDF support", "1.2.0", true, true),
            Plugin("2", "Cloud Sync", "Sync across devices", "2.1.0", true, true),
            Plugin("3", "Advanced OCR", "Better text recognition", "1.0.5", true, false)
        )
    }
    
    val availablePlugins = remember {
        listOf(
            Plugin("4", "Manga Reader", "Specialized manga features", "1.0.0", false, false),
            Plugin("5", "Voice Reader", "Text-to-speech support", "0.9.0", false, false),
            Plugin("6", "Social Share", "Share with friends", "1.1.0", false, false)
        )
    }

    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        TopAppBar(
            title = { Text("Plugin Manager") },
            navigationIcon = {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            actions = {
                IconButton(onClick = { /* Search plugins */ }) {
                    Icon(Icons.Default.Search, contentDescription = "Search")
                }
            }
        )
        
        TabRow(
            selectedTabIndex = selectedTab,
            modifier = Modifier.fillMaxWidth()
        ) {
            tabs.forEachIndexed { index, title ->
                Tab(
                    selected = selectedTab == index,
                    onClick = { selectedTab = index },
                    text = { Text(title) }
                )
            }
        }
        
        LazyColumn(
            modifier = Modifier.fillMaxSize(),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            when (selectedTab) {
                0 -> {
                    items(installedPlugins) { plugin ->
                        PluginCard(
                            plugin = plugin,
                            onToggle = { /* Toggle plugin */ },
                            onUninstall = { /* Uninstall plugin */ }
                        )
                    }
                }
                1 -> {
                    items(availablePlugins) { plugin ->
                        PluginCard(
                            plugin = plugin,
                            onInstall = { /* Install plugin */ }
                        )
                    }
                }
                2 -> {
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth()
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp),
                                verticalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Text(
                                    text = "Theme Store",
                                    style = MaterialTheme.typography.titleMedium,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Browse and install custom themes for your reading experience.",
                                    style = MaterialTheme.typography.bodyMedium,
                                    color = MaterialTheme.colorScheme.onSurfaceVariant
                                )
                                Button(
                                    onClick = { /* Open theme store */ },
                                    modifier = Modifier.fillMaxWidth()
                                ) {
                                    Icon(Icons.Default.Palette, contentDescription = null)
                                    Spacer(modifier = Modifier.width(8.dp))
                                    Text("Browse Themes")
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun PluginCard(
    plugin: Plugin,
    onToggle: (() -> Unit)? = null,
    onInstall: (() -> Unit)? = null,
    onUninstall: (() -> Unit)? = null
) {
    Card(
        modifier = Modifier.fillMaxWidth()
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
                Column(
                    modifier = Modifier.weight(1f)
                ) {
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
                
                if (plugin.isInstalled) {
                    Row(
                        horizontalArrangement = Arrangement.spacedBy(8.dp),
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        if (onToggle != null) {
                            Switch(
                                checked = plugin.isEnabled,
                                onCheckedChange = { onToggle() }
                            )
                        }
                        if (onUninstall != null) {
                            IconButton(onClick = onUninstall) {
                                Icon(
                                    Icons.Default.Delete,
                                    contentDescription = "Uninstall",
                                    tint = MaterialTheme.colorScheme.error
                                )
                            }
                        }
                    }
                } else {
                    if (onInstall != null) {
                        Button(onClick = onInstall) {
                            Text("Install")
                        }
                    }
                }
            }
        }
    }
}

data class Plugin(
    val id: String,
    val name: String,
    val description: String,
    val version: String,
    val isInstalled: Boolean,
    val isEnabled: Boolean
)
