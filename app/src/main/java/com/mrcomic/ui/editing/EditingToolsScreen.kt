package com.mrcomic.ui.editing

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditingToolsScreen(
    onBackClick: () -> Unit
) {
    var selectedTool by remember { mutableStateOf(EditingTool.CROP) }
    var brightness by remember { mutableStateOf(0.5f) }
    var contrast by remember { mutableStateOf(0.5f) }
    var rotation by remember { mutableStateOf(0f) }

    Column(
        modifier = Modifier.fillMaxSize()
    ) {
        // Top bar
        TopAppBar(
            title = { Text("Edit Comic Page") },
            navigationIcon = {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            actions = {
                TextButton(onClick = { /* Save changes */ }) {
                    Text("Save")
                }
            }
        )
        
        // Image preview area
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(16.dp)
                .background(
                    Color.Gray.copy(alpha = 0.1f),
                    RoundedCornerShape(8.dp)
                ),
            contentAlignment = Alignment.Center
        ) {
            Text(
                text = "Comic Page Preview",
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurfaceVariant
            )
        }
        
        // Tool selection tabs
        ScrollableTabRow(
            selectedTabIndex = EditingTool.values().indexOf(selectedTool),
            modifier = Modifier.fillMaxWidth()
        ) {
            EditingTool.values().forEach { tool ->
                Tab(
                    selected = selectedTool == tool,
                    onClick = { selectedTool = tool },
                    text = { Text(tool.displayName) },
                    icon = { Icon(tool.icon, contentDescription = null) }
                )
            }
        }
        
        // Tool controls
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                when (selectedTool) {
                    EditingTool.CROP -> {
                        Text(
                            text = "Crop Tool",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { /* Free crop */ },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Free")
                            }
                            OutlinedButton(
                                onClick = { /* 1:1 crop */ },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("1:1")
                            }
                            OutlinedButton(
                                onClick = { /* 16:9 crop */ },
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("16:9")
                            }
                        }
                    }
                    
                    EditingTool.ROTATE -> {
                        Text(
                            text = "Rotate Tool",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Row(
                            modifier = Modifier.fillMaxWidth(),
                            horizontalArrangement = Arrangement.spacedBy(8.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            IconButton(onClick = { rotation -= 90f }) {
                                Icon(Icons.Default.RotateLeft, contentDescription = "Rotate Left")
                            }
                            
                            Text(
                                text = "${rotation.toInt()}°",
                                modifier = Modifier.weight(1f),
                                style = MaterialTheme.typography.bodyLarge
                            )
                            
                            IconButton(onClick = { rotation += 90f }) {
                                Icon(Icons.Default.RotateRight, contentDescription = "Rotate Right")
                            }
                        }
                        
                        Slider(
                            value = rotation,
                            onValueChange = { rotation = it },
                            valueRange = -180f..180f,
                            modifier = Modifier.fillMaxWidth()
                        )
                    }
                    
                    EditingTool.BRIGHTNESS -> {
                        Text(
                            text = "Brightness & Contrast",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Column(
                            verticalArrangement = Arrangement.spacedBy(12.dp)
                        ) {
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(Icons.Default.Brightness6, contentDescription = null)
                                Text("Brightness", modifier = Modifier.width(80.dp))
                                Slider(
                                    value = brightness,
                                    onValueChange = { brightness = it },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                            
                            Row(
                                verticalAlignment = Alignment.CenterVertically,
                                horizontalArrangement = Arrangement.spacedBy(12.dp)
                            ) {
                                Icon(Icons.Default.Contrast, contentDescription = null)
                                Text("Contrast", modifier = Modifier.width(80.dp))
                                Slider(
                                    value = contrast,
                                    onValueChange = { contrast = it },
                                    modifier = Modifier.weight(1f)
                                )
                            }
                        }
                    }
                    
                    EditingTool.TEXT -> {
                        Text(
                            text = "Text Editing",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        Column(
                            verticalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            OutlinedButton(
                                onClick = { /* OCR scan */ },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Scanner, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Scan Text (OCR)")
                            }
                            
                            OutlinedButton(
                                onClick = { /* Translate */ },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Translate, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Translate Text")
                            }
                            
                            OutlinedButton(
                                onClick = { /* Edit text blocks */ },
                                modifier = Modifier.fillMaxWidth()
                            ) {
                                Icon(Icons.Default.Edit, contentDescription = null)
                                Spacer(modifier = Modifier.width(8.dp))
                                Text("Edit Text Blocks")
                            }
                        }
                    }
                }
                
                // Action buttons
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = { /* Reset */ },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Reset")
                    }
                    
                    Button(
                        onClick = { /* Apply */ },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Apply")
                    }
                }
            }
        }
    }
}

enum class EditingTool(val displayName: String, val icon: androidx.compose.ui.graphics.vector.ImageVector) {
    CROP("Crop", Icons.Default.Crop),
    ROTATE("Rotate", Icons.Default.RotateRight),
    BRIGHTNESS("Adjust", Icons.Default.Brightness6),
    TEXT("Text", Icons.Default.TextFields)
}
