package com.mrcomic.feature.settings

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

@Composable
fun FontSelectionDialog(
    onFontSelected: (String) -> Unit,
    onDismiss: () -> Unit
) {
    val fonts = listOf(
        "Sans Serif" to FontFamily.SansSerif,
        "Serif" to FontFamily.Serif,
        "Monospace" to FontFamily.Monospace,
        "Cursive" to FontFamily.Cursive,
        "Roboto" to FontFamily.Default,
        "Open Sans" to FontFamily.SansSerif
    )
    
    var selectedFont by remember { mutableStateOf("Sans Serif") }
    
    AlertDialog(
        onDismissRequest = onDismiss,
        title = { Text("Select Font") },
        text = {
            Column {
                fonts.forEach { (fontName, fontFamily) ->
                    Row(
                        verticalAlignment = Alignment.CenterVertically,
                        modifier = Modifier
                            .fillMaxWidth()
                            .clickable { selectedFont = fontName }
                            .padding(vertical = 8.dp)
                    ) {
                        RadioButton(
                            selected = selectedFont == fontName,
                            onClick = { selectedFont = fontName }
                        )
                        Spacer(modifier = Modifier.width(8.dp))
                        Text(
                            text = fontName,
                            fontFamily = fontFamily,
                            style = MaterialTheme.typography.bodyLarge
                        )
                    }
                }
            }
        },
        confirmButton = {
            TextButton(onClick = { 
                onFontSelected(selectedFont)
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
