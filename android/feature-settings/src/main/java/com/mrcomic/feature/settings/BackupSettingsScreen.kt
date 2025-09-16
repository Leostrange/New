package com.mrcomic.feature.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import java.text.SimpleDateFormat
import java.util.*

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun BackupSettingsScreen(
    modifier: Modifier = Modifier
) {
    var autoBackup by remember { mutableStateOf(true) }
    var backupFrequency by remember { mutableStateOf("Weekly") }
    var cloudProvider by remember { mutableStateOf("Google Drive") }
    var encryptBackups by remember { mutableStateOf(true) }
    var lastBackupTime by remember { mutableStateOf("2024-01-15 14:30") }
    
    LazyColumn(
        modifier = modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp)
    ) {
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Backup Settings",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Auto Backup")
                        Switch(
                            checked = autoBackup,
                            onCheckedChange = { autoBackup = it }
                        )
                    }
                    
                    if (autoBackup) {
                        Spacer(modifier = Modifier.height(16.dp))
                        
                        Text("Backup Frequency")
                        val frequencies = listOf("Daily", "Weekly", "Monthly")
                        frequencies.forEach { frequency ->
                            Row(
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = backupFrequency == frequency,
                                    onClick = { backupFrequency = frequency }
                                )
                                Text(frequency)
                            }
                        }
                    }
                }
            }
        }
        
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Cloud Storage",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    val providers = listOf("Google Drive", "Dropbox", "OneDrive", "Local Storage")
                    providers.forEach { provider ->
                        Row(
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            RadioButton(
                                selected = cloudProvider == provider,
                                onClick = { cloudProvider = provider }
                            )
                            Text(provider)
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text("Encrypt Backups")
                        Switch(
                            checked = encryptBackups,
                            onCheckedChange = { encryptBackups = it }
                        )
                    }
                }
            }
        }
        
        item {
            Card(modifier = Modifier.fillMaxWidth()) {
                Column(modifier = Modifier.padding(16.dp)) {
                    Text(
                        "Backup Status",
                        style = MaterialTheme.typography.titleMedium
                    )
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column {
                            Text("Last Backup")
                            Text(
                                lastBackupTime,
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                        }
                        Icon(
                            Icons.Default.CheckCircle,
                            contentDescription = "Backup successful",
                            tint = MaterialTheme.colorScheme.primary
                        )
                    }
                    
                    Spacer(modifier = Modifier.height(16.dp))
                    
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Button(
                            onClick = { 
                                lastBackupTime = SimpleDateFormat("yyyy-MM-dd HH:mm", Locale.getDefault())
                                    .format(Date())
                            },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Backup, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Backup Now")
                        }
                        
                        OutlinedButton(
                            onClick = { /* TODO: Restore from backup */ },
                            modifier = Modifier.weight(1f)
                        ) {
                            Icon(Icons.Default.Restore, contentDescription = null)
                            Spacer(modifier = Modifier.width(8.dp))
                            Text("Restore")
                        }
                    }
                }
            }
        }
    }
}
