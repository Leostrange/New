package com.mrcomic.feature.settings

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

data class CustomTheme(
    val name: String,
    val primaryColor: Color,
    val secondaryColor: Color,
    val backgroundColor: Color,
    val surfaceColor: Color,
    val accentColor: Color
)

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ThemeBuilderDialog(
    onDismiss: () -> Unit,
    onThemeCreated: (CustomTheme) -> Unit
) {
    var themeName by remember { mutableStateOf("My Custom Theme") }
    var primaryColor by remember { mutableStateOf(Color(0xFF6200EE)) }
    var secondaryColor by remember { mutableStateOf(Color(0xFF03DAC6)) }
    var backgroundColor by remember { mutableStateOf(Color(0xFFFFFBFE)) }
    var surfaceColor by remember { mutableStateOf(Color(0xFFFFFBFE)) }
    var accentColor by remember { mutableStateOf(Color(0xFFFF6B35)) }
    
    var showColorPicker by remember { mutableStateOf(false) }
    var selectedColorType by remember { mutableStateOf("") }
    
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .heightIn(max = 600.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Column(
                modifier = Modifier.padding(16.dp)
            ) {
                Text(
                    "Theme Builder",
                    style = MaterialTheme.typography.headlineSmall
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                OutlinedTextField(
                    value = themeName,
                    onValueChange = { themeName = it },
                    label = { Text("Theme Name") },
                    modifier = Modifier.fillMaxWidth()
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                LazyColumn(
                    modifier = Modifier.weight(1f),
                    verticalArrangement = Arrangement.spacedBy(12.dp)
                ) {
                    item {
                        ColorPickerItem(
                            title = "Primary Color",
                            color = primaryColor,
                            onClick = {
                                selectedColorType = "primary"
                                showColorPicker = true
                            }
                        )
                    }
                    
                    item {
                        ColorPickerItem(
                            title = "Secondary Color",
                            color = secondaryColor,
                            onClick = {
                                selectedColorType = "secondary"
                                showColorPicker = true
                            }
                        )
                    }
                    
                    item {
                        ColorPickerItem(
                            title = "Background Color",
                            color = backgroundColor,
                            onClick = {
                                selectedColorType = "background"
                                showColorPicker = true
                            }
                        )
                    }
                    
                    item {
                        ColorPickerItem(
                            title = "Surface Color",
                            color = surfaceColor,
                            onClick = {
                                selectedColorType = "surface"
                                showColorPicker = true
                            }
                        )
                    }
                    
                    item {
                        ColorPickerItem(
                            title = "Accent Color",
                            color = accentColor,
                            onClick = {
                                selectedColorType = "accent"
                                showColorPicker = true
                            }
                        )
                    }
                    
                    item {
                        Card(
                            modifier = Modifier.fillMaxWidth(),
                            colors = CardDefaults.cardColors(
                                containerColor = backgroundColor
                            )
                        ) {
                            Column(
                                modifier = Modifier.padding(16.dp)
                            ) {
                                Text(
                                    "Preview",
                                    style = MaterialTheme.typography.titleMedium,
                                    color = primaryColor
                                )
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                Button(
                                    onClick = { },
                                    colors = ButtonDefaults.buttonColors(
                                        containerColor = primaryColor
                                    )
                                ) {
                                    Text("Primary Button")
                                }
                                
                                Spacer(modifier = Modifier.height(8.dp))
                                
                                OutlinedButton(
                                    onClick = { },
                                    colors = ButtonDefaults.outlinedButtonColors(
                                        contentColor = secondaryColor
                                    ),
                                    border = ButtonDefaults.outlinedButtonBorder.copy(
                                        brush = androidx.compose.foundation.BorderStroke(
                                            1.dp, secondaryColor
                                        ).brush
                                    )
                                ) {
                                    Text("Secondary Button")
                                }
                            }
                        }
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp)
                ) {
                    OutlinedButton(
                        onClick = onDismiss,
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Cancel")
                    }
                    
                    Button(
                        onClick = {
                            onThemeCreated(
                                CustomTheme(
                                    name = themeName,
                                    primaryColor = primaryColor,
                                    secondaryColor = secondaryColor,
                                    backgroundColor = backgroundColor,
                                    surfaceColor = surfaceColor,
                                    accentColor = accentColor
                                )
                            )
                        },
                        modifier = Modifier.weight(1f)
                    ) {
                        Text("Create Theme")
                    }
                }
            }
        }
    }
    
    if (showColorPicker) {
        ColorPickerDialog(
            initialColor = when (selectedColorType) {
                "primary" -> primaryColor
                "secondary" -> secondaryColor
                "background" -> backgroundColor
                "surface" -> surfaceColor
                "accent" -> accentColor
                else -> Color.Black
            },
            onColorSelected = { color ->
                when (selectedColorType) {
                    "primary" -> primaryColor = color
                    "secondary" -> secondaryColor = color
                    "background" -> backgroundColor = color
                    "surface" -> surfaceColor = color
                    "accent" -> accentColor = color
                }
                showColorPicker = false
            },
            onDismiss = { showColorPicker = false }
        )
    }
}

@Composable
private fun ColorPickerItem(
    title: String,
    color: Color,
    onClick: () -> Unit
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(vertical = 8.dp),
        verticalAlignment = Alignment.CenterVertically
    ) {
        Box(
            modifier = Modifier
                .size(32.dp)
                .clip(CircleShape)
                .background(color)
                .border(1.dp, MaterialTheme.colorScheme.outline, CircleShape)
        )
        
        Spacer(modifier = Modifier.width(16.dp))
        
        Text(
            title,
            style = MaterialTheme.typography.bodyLarge,
            modifier = Modifier.weight(1f)
        )
        
        Icon(Icons.Default.ChevronRight, contentDescription = null)
    }
}

@Composable
private fun ColorPickerDialog(
    initialColor: Color,
    onColorSelected: (Color) -> Unit,
    onDismiss: () -> Unit
) {
    val predefinedColors = listOf(
        Color(0xFF6200EE), Color(0xFF3700B3), Color(0xFF03DAC6),
        Color(0xFFFF6B35), Color(0xFFE91E63), Color(0xFF9C27B0),
        Color(0xFF673AB7), Color(0xFF3F51B5), Color(0xFF2196F3),
        Color(0xFF00BCD4), Color(0xFF009688), Color(0xFF4CAF50),
        Color(0xFF8BC34A), Color(0xFFCDDC39), Color(0xFFFFEB3B),
        Color(0xFFFFC107), Color(0xFFFF9800), Color(0xFFFF5722)
    )
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Select Color") },
        text = {
            LazyColumn {
                items(predefinedColors.chunked(6).size) { rowIndex ->
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        predefinedColors.chunked(6)[rowIndex].forEach { color ->
                            Box(
                                modifier = Modifier
                                    .size(40.dp)
                                    .clip(CircleShape)
                                    .background(color)
                                    .clickable { onColorSelected(color) }
                                    .border(
                                        if (color == initialColor) 3.dp else 1.dp,
                                        if (color == initialColor) MaterialTheme.colorScheme.primary 
                                        else MaterialTheme.colorScheme.outline,
                                        CircleShape
                                    )
                            )
                        }
                    }
                    Spacer(modifier = Modifier.height(8.dp))
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
