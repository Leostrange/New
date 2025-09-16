package com.mrcomic.feature.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material.icons.outlined.*
import androidx.compose.material.icons.rounded.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
fun IconPackDialog(
    onIconPackSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val iconPacks = listOf(
        "Material Design" to listOf(Icons.Default.Home, Icons.Default.Search, Icons.Default.Settings),
        "Material Outlined" to listOf(Icons.Outlined.Home, Icons.Outlined.Search, Icons.Outlined.Settings),
        "Material Rounded" to listOf(Icons.Rounded.Home, Icons.Rounded.Search, Icons.Rounded.Settings)
    )
    
    var selectedIconPack by remember { mutableStateOf("Material Design") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Select Icon Pack") },
        text = {
            Column {
                iconPacks.forEach { (packName, icons) ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedIconPack = packName }
                            .padding(vertical = 12.dp)
                    ) {
                        RadioButton(
                            selected = selectedIconPack == packName,
                            onClick = { selectedIconPack = packName }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Column {
                            Text(
                                text = packName,
                                style = MaterialTheme.typography.bodyLarge
                            )
                            Row(
                                horizontalArrangement = Arrangement.spacedBy(8.dp),
                                modifier = Modifier.padding(top = 4.dp)
                            ) {
                                icons.forEach { icon ->
                                    Icon(
                                        imageVector = icon,
                                        contentDescription = null,
                                        modifier = Modifier.size(20.dp),
                                        tint = MaterialTheme.colorScheme.onSurfaceVariant
                                    )
                                }
                            }
                        }
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { 
                onIconPackSelected(selectedIconPack)
            }) {
                Text("Apply")
            }
        },
        dismissButton = {
            TextButton(onClick = onDismiss) {
                Text("Cancel")
            }
        }
    )
}
