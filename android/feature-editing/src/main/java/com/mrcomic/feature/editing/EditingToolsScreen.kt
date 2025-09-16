package com.mrcomic.feature.editing

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun EditingToolsScreen(
    onBackClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    var selectedTool by remember { mutableStateOf("crop") }
    var brightness by remember { mutableFloatStateOf(0.5f) }
    var contrast by remember { mutableFloatStateOf(0.5f) }
    var rotation by remember { mutableIntStateOf(0) }

    Column(modifier = modifier.fillMaxSize()) {
        // Top App Bar
        TopAppBar(
            title = { Text("Editing Tools") },
            navigationIcon = {
                IconButton(onClick = onBackClick) {
                    Icon(Icons.Default.ArrowBack, contentDescription = "Back")
                }
            },
            actions = {
                TextButton(onClick = { /* Save */ }) {
                    Text("Save")
                }
            }
        )

        Row(modifier = Modifier.fillMaxSize()) {
            // Tool Selection Panel
            NavigationRail(
                modifier = Modifier.width(80.dp)
            ) {
                val tools = listOf(
                    "crop" to Icons.Default.Crop,
                    "rotate" to Icons.Default.RotateRight,
                    "adjust" to Icons.Default.Tune,
                    "text" to Icons.Default.TextFields,
                    "filter" to Icons.Default.FilterVintage
                )

                tools.forEach { (tool, icon) ->
                    NavigationRailItem(
                        selected = selectedTool == tool,
                        onClick = { selectedTool = tool },
                        icon = { Icon(icon, contentDescription = tool) },
                        label = { Text(tool.capitalize()) }
                    )
                }
            }

            // Main Content Area
            Column(
                modifier = Modifier
                    .weight(1f)
                    .padding(16.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Preview Area (placeholder)
                Card(
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(300.dp),
                    colors = CardDefaults.cardColors(
                        containerColor = MaterialTheme.colorScheme.surfaceVariant
                    )
                ) {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = "Image Preview",
                            style = MaterialTheme.typography.headlineSmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                }

                // Tool-specific Controls
                Card {
                    Column(
                        modifier = Modifier.padding(16.dp),
                        verticalArrangement = Arrangement.spacedBy(16.dp)
                    ) {
                        Text(
                            text = "${selectedTool.capitalize()} Controls",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )

                        when (selectedTool) {
                            "crop" -> CropControls()
                            "rotate" -> RotateControls(
                                rotation = rotation,
                                onRotationChange = { rotation = it }
                            )
                            "adjust" -> AdjustControls(
                                brightness = brightness,
                                contrast = contrast,
                                onBrightnessChange = { brightness = it },
                                onContrastChange = { contrast = it }
                            )
                            "text" -> TextEditingControls()
                            "filter" -> FilterControls()
                        }
                    }
                }
            }
        }
    }
}

@Composable
private fun CropControls() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Crop Settings", style = MaterialTheme.typography.titleSmall)
        
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
                onClick = { /* 16:9 crop */ },
                modifier = Modifier.weight(1f)
            ) {
                Text("16:9")
            }
            OutlinedButton(
                onClick = { /* Square crop */ },
                modifier = Modifier.weight(1f)
            ) {
                Text("1:1")
            }
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { /* Apply crop */ },
                modifier = Modifier.weight(1f)
            ) {
                Text("Apply Crop")
            }
            OutlinedButton(
                onClick = { /* Reset crop */ },
                modifier = Modifier.weight(1f)
            ) {
                Text("Reset")
            }
        }
    }
}

@Composable
private fun RotateControls(
    rotation: Int,
    onRotationChange: (Int) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Rotation: ${rotation}°", style = MaterialTheme.typography.titleSmall)
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            IconButton(onClick = { onRotationChange((rotation - 90) % 360) }) {
                Icon(Icons.Default.RotateLeft, contentDescription = "Rotate left")
            }
            IconButton(onClick = { onRotationChange((rotation + 90) % 360) }) {
                Icon(Icons.Default.RotateRight, contentDescription = "Rotate right")
            }
            Spacer(Modifier.weight(1f))
            OutlinedButton(onClick = { onRotationChange(0) }) {
                Text("Reset")
            }
        }
    }
}

@Composable
private fun AdjustControls(
    brightness: Float,
    contrast: Float,
    onBrightnessChange: (Float) -> Unit,
    onContrastChange: (Float) -> Unit
) {
    Column(verticalArrangement = Arrangement.spacedBy(16.dp)) {
        // Brightness
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Brightness", style = MaterialTheme.typography.titleSmall)
                Text("${(brightness * 100).toInt()}%")
            }
            Slider(
                value = brightness,
                onValueChange = onBrightnessChange,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        // Contrast
        Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text("Contrast", style = MaterialTheme.typography.titleSmall)
                Text("${(contrast * 100).toInt()}%")
            }
            Slider(
                value = contrast,
                onValueChange = onContrastChange,
                modifier = Modifier.fillMaxWidth()
            )
        }
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = { /* Apply adjustments */ },
                modifier = Modifier.weight(1f)
            ) {
                Text("Apply")
            }
            OutlinedButton(
                onClick = { 
                    onBrightnessChange(0.5f)
                    onContrastChange(0.5f)
                },
                modifier = Modifier.weight(1f)
            ) {
                Text("Reset")
            }
        }
    }
}

@Composable
private fun TextEditingControls() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Text Editing", style = MaterialTheme.typography.titleSmall)
        
        OutlinedTextField(
            value = "",
            onValueChange = { },
            label = { Text("Add text") },
            modifier = Modifier.fillMaxWidth()
        )
        
        Row(
            modifier = Modifier.fillMaxWidth(),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            OutlinedButton(
                onClick = { /* OCR text */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Scanner, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("OCR")
            }
            OutlinedButton(
                onClick = { /* Translate */ },
                modifier = Modifier.weight(1f)
            ) {
                Icon(Icons.Default.Translate, contentDescription = null)
                Spacer(Modifier.width(4.dp))
                Text("Translate")
            }
        }
    }
}

@Composable
private fun FilterControls() {
    Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
        Text("Filters", style = MaterialTheme.typography.titleSmall)
        
        LazyColumn(
            verticalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            val filters = listOf("None", "Sepia", "Grayscale", "High Contrast", "Vintage")
            
            items(filters.size) { index ->
                val filter = filters[index]
                FilterChip(
                    selected = index == 0,
                    onClick = { /* Apply filter */ },
                    label = { Text(filter) },
                    modifier = Modifier.fillMaxWidth()
                )
            }
        }
    }
}
