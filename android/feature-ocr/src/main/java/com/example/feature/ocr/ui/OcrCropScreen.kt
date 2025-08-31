package com.example.feature.ocr.ui

import android.graphics.Bitmap
import android.graphics.Matrix
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.Image
import androidx.compose.foundation.background
import androidx.compose.foundation.gestures.detectDragGestures
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ContentCopy
import androidx.compose.material.icons.filled.Translate
import androidx.compose.material3.Button
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Rect
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.ImageBitmap
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.layout.onSizeChanged
import androidx.compose.ui.platform.LocalClipboardManager
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.AnnotatedString
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.IntSize
import androidx.compose.ui.unit.dp
import androidx.hilt.navigation.compose.hiltViewModel

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun OcrCropScreen(
    bitmap: Bitmap, 
    onCrop: (Bitmap) -> Unit,
    onTranslate: (String) -> Unit = {},
    viewModel: OcrViewModel = hiltViewModel()
) {
    val uiState by viewModel.uiState.collectAsState()
    val clipboardManager = LocalClipboardManager.current
    var imageSize by remember { mutableStateOf(IntSize.Zero) }
    var cropRect by remember { mutableStateOf(Rect.Zero) }
    val density = LocalDensity.current

    Column(modifier = Modifier.fillMaxSize()) {
        // Image cropping section
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .weight(1f)
                .padding(8.dp)
        ) {
            Image(
                bitmap = bitmap.asImageBitmap(),
                contentDescription = null,
                modifier = Modifier
                    .fillMaxSize()
                    .clip(RoundedCornerShape(8.dp))
                    .onSizeChanged { size ->
                        imageSize = size
                        // Initialize cropRect to full image size
                        cropRect = Rect(Offset.Zero, Size(size.width.toFloat(), size.height.toFloat()))
                    }
            )

            // Crop frame
            Canvas(modifier = Modifier.fillMaxSize()) {
                drawRect(
                    color = Color.Red,
                    topLeft = cropRect.topLeft,
                    size = cropRect.size,
                    style = Stroke(width = 2.dp.toPx())
                )
            }

            // Drag gesture handling for crop frame
            Box(modifier = Modifier
                .fillMaxSize()
                .pointerInput(Unit) {
                    detectDragGestures { change, dragAmount ->
                        change.consume()
                        val newLeft = (cropRect.left + dragAmount.x).coerceIn(0f, imageSize.width.toFloat() - cropRect.width)
                        val newTop = (cropRect.top + dragAmount.y).coerceIn(0f, imageSize.height.toFloat() - cropRect.height)
                        cropRect = Rect(newLeft, newTop, newLeft + cropRect.width, newTop + cropRect.height)
                    }
                }
            )
        }

        // Control buttons
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            horizontalArrangement = Arrangement.spacedBy(8.dp)
        ) {
            Button(
                onClick = {
                    val croppedBitmap = cropBitmap(bitmap, cropRect, imageSize)
                    viewModel.recognizeText(croppedBitmap)
                    onCrop(croppedBitmap)
                },
                modifier = Modifier.weight(1f),
                enabled = !uiState.isProcessing
            ) {
                if (uiState.isProcessing) {
                    CircularProgressIndicator(
                        size = 16.dp,
                        strokeWidth = 2.dp,
                        color = MaterialTheme.colorScheme.onPrimary
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                Text(if (uiState.isProcessing) "Processing..." else "Crop & Recognize")
            }
            
            if (uiState.recognizedText.isNotEmpty()) {
                OutlinedButton(
                    onClick = { viewModel.clearResults() }
                ) {
                    Text("Clear")
                }
            }
        }

        // Results section
        if (uiState.recognizedText.isNotEmpty() || uiState.error != null) {
            Card(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 16.dp)
                    .padding(bottom = 16.dp),
                elevation = CardDefaults.cardElevation(defaultElevation = 4.dp)
            ) {
                Column(
                    modifier = Modifier.padding(16.dp)
                ) {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Text(
                            text = "Recognized Text",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold
                        )
                        
                        if (uiState.recognizedText.isNotEmpty()) {
                            Row {
                                IconButton(
                                    onClick = {
                                        clipboardManager.setText(AnnotatedString(uiState.recognizedText))
                                    }
                                ) {
                                    Icon(Icons.Default.ContentCopy, contentDescription = "Copy")
                                }
                                
                                IconButton(
                                    onClick = { viewModel.translateText(uiState.recognizedText) },
                                    enabled = !uiState.isTranslating
                                ) {
                                    if (uiState.isTranslating) {
                                        CircularProgressIndicator(
                                            size = 16.dp,
                                            strokeWidth = 2.dp
                                        )
                                    } else {
                                        Icon(Icons.Default.Translate, contentDescription = "Translate")
                                    }
                                }
                            }
                        }
                    }
                    
                    Spacer(modifier = Modifier.height(8.dp))
                    
                    if (uiState.error != null) {
                        Text(
                            text = uiState.error,
                            color = MaterialTheme.colorScheme.error,
                            style = MaterialTheme.typography.bodyMedium
                        )
                    } else {
                        Text(
                            text = uiState.recognizedText.ifEmpty { "No text recognized" },
                            style = MaterialTheme.typography.bodyMedium,
                            modifier = Modifier.fillMaxWidth()
                        )
                        
                        if (uiState.textBlocks.isNotEmpty()) {
                            Spacer(modifier = Modifier.height(12.dp))
                            Text(
                                text = "Text Blocks (${uiState.textBlocks.size})",
                                style = MaterialTheme.typography.labelMedium,
                                fontWeight = FontWeight.Medium
                            )
                            
                            LazyColumn(
                                modifier = Modifier.height(100.dp),
                                verticalArrangement = Arrangement.spacedBy(4.dp)
                            ) {
                                items(uiState.textBlocks) { textBlock ->
                                    Card(
                                        modifier = Modifier.fillMaxWidth(),
                                        colors = CardDefaults.cardColors(
                                            containerColor = MaterialTheme.colorScheme.surfaceVariant
                                        )
                                    ) {
                                        Column(
                                            modifier = Modifier.padding(8.dp)
                                        ) {
                                            Text(
                                                text = textBlock.text,
                                                style = MaterialTheme.typography.bodySmall
                                            )
                                            Text(
                                                text = "Confidence: ${(textBlock.confidence * 100).toInt()}%",
                                                style = MaterialTheme.typography.labelSmall,
                                                color = MaterialTheme.colorScheme.onSurfaceVariant
                                            )
                                        }
                                    }
                                }
                            }
                        }
                        
                        // Translation results
                        if (uiState.translatedText.isNotEmpty() || uiState.translationError != null) {
                            Spacer(modifier = Modifier.height(16.dp))
                            
                            Card(
                                colors = CardDefaults.cardColors(
                                    containerColor = MaterialTheme.colorScheme.secondaryContainer
                                )
                            ) {
                                Column(
                                    modifier = Modifier.padding(12.dp)
                                ) {
                                    Row(
                                        modifier = Modifier.fillMaxWidth(),
                                        horizontalArrangement = Arrangement.SpaceBetween,
                                        verticalAlignment = Alignment.CenterVertically
                                    ) {
                                        Text(
                                            text = "Translation",
                                            style = MaterialTheme.typography.titleSmall,
                                            fontWeight = FontWeight.Bold
                                        )
                                        
                                        if (uiState.translatedText.isNotEmpty()) {
                                            IconButton(
                                                onClick = {
                                                    clipboardManager.setText(AnnotatedString(uiState.translatedText))
                                                }
                                            ) {
                                                Icon(Icons.Default.ContentCopy, contentDescription = "Copy Translation")
                                            }
                                        }
                                    }
                                    
                                    if (uiState.detectedLanguage != null) {
                                        Text(
                                            text = "Detected: ${uiState.detectedLanguage}",
                                            style = MaterialTheme.typography.labelSmall,
                                            color = MaterialTheme.colorScheme.onSecondaryContainer
                                        )
                                        Spacer(modifier = Modifier.height(4.dp))
                                    }
                                    
                                    if (uiState.translationError != null) {
                                        Text(
                                            text = uiState.translationError,
                                            color = MaterialTheme.colorScheme.error,
                                            style = MaterialTheme.typography.bodySmall
                                        )
                                    } else {
                                        Text(
                                            text = uiState.translatedText,
                                            style = MaterialTheme.typography.bodyMedium
                                        )
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
    }
}

fun cropBitmap(bitmap: Bitmap, cropRect: Rect, imageSize: IntSize): Bitmap {
    val scaleX = bitmap.width.toFloat() / imageSize.width
    val scaleY = bitmap.height.toFloat() / imageSize.height

    val croppedX = (cropRect.left * scaleX).toInt()
    val croppedY = (cropRect.top * scaleY).toInt()
    val croppedWidth = (cropRect.width * scaleX).toInt()
    val croppedHeight = (cropRect.height * scaleY).toInt()

    return Bitmap.createBitmap(
        bitmap,
        croppedX,
        croppedY,
        croppedWidth,
        croppedHeight
    )
}


