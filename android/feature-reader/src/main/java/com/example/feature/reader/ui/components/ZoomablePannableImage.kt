package com.example.feature.reader.ui.components

import android.graphics.Bitmap
import androidx.compose.foundation.Image
import androidx.compose.foundation.gestures.*
import androidx.compose.foundation.layout.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.graphics.RectangleShape
import androidx.compose.ui.graphics.asImageBitmap
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.graphics.painter.BitmapPainter
import androidx.compose.ui.input.pointer.*
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.IntSize
import kotlinx.coroutines.launch
import kotlin.math.*

/**
 * Направление навигации
 */
enum class NavigationDirection {
    LEFT, RIGHT, UP, DOWN
}

/**
 * Улучшенная версия с управлением жестами и анимациями
 */
@Composable
fun ZoomablePannableImageAdvanced(
    bitmap: Bitmap,
    contentDescription: String,
    modifier: Modifier = Modifier,
    onTap: (Offset) -> Unit = {},
    onDoubleTap: () -> Unit = {},
    onPageNavigation: (NavigationDirection) -> Unit = {},
    minZoom: Float = 1f,
    maxZoom: Float = 5f,
    contentScale: ContentScale = ContentScale.Fit,
    enablePageNavigation: Boolean = true
) {
    var scale by remember { mutableStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    var isZoomed by remember { mutableStateOf(false) }
    val coroutineScope = rememberCoroutineScope()
    
    // Предустановки масштабирования
    val zoomPresets = floatArrayOf(1f, 2f, 3f, 4f, 5f)
    var currentPresetIndex by remember { mutableStateOf(0) }
    
    // Update zoom state when scale changes
    isZoomed = scale > 1.1f

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = remember(bitmap) { BitmapPainter(bitmap.asImageBitmap()) },
            contentDescription = contentDescription,
            contentScale = contentScale,
            modifier = Modifier
                .fillMaxSize()
                .clip(RectangleShape)
                .graphicsLayer(
                    scaleX = scale,
                    scaleY = scale,
                    translationX = offset.x,
                    translationY = offset.y
                )
                .pointerInput(Unit) {
                    detectTransformGestures(
                        panZoomLock = true
                    ) { centroid, pan, zoom, _ ->
                        val newScale = (scale * zoom).coerceIn(minZoom, maxZoom)
                        
                        // Calculate bounds for panning
                        val imageWidth = size.width * newScale
                        val imageHeight = size.height * newScale
                        val maxX = ((imageWidth - size.width) / 2f).coerceAtLeast(0f)
                        val maxY = ((imageHeight - size.height) / 2f).coerceAtLeast(0f)
                        
                        // Handle scaling
                        if (newScale != scale) {
                            val scaleDelta = newScale / scale
                            offset = Offset(
                                x = (offset.x + centroid.x) * scaleDelta - centroid.x,
                                y = (offset.y + centroid.y) * scaleDelta - centroid.y
                            )
                            scale = newScale
                        }
                        
                        // Handle panning with bounds checking
                        val newOffset = offset + pan
                        offset = Offset(
                            x = newOffset.x.coerceIn(-maxX, maxX),
                            y = newOffset.y.coerceIn(-maxY, maxY)
                        )
                    }
                }
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { tapOffset ->
                            onTap(tapOffset)
                        },
                        onDoubleTap = { tapOffset ->
                            // Double tap to cycle through zoom presets
                            coroutineScope.launch {
                                currentPresetIndex = (currentPresetIndex + 1) % zoomPresets.size
                                val targetScale = zoomPresets[currentPresetIndex]
                                
                                // Animate to target scale
                                animateScaleAndPan(
                                    currentScale = scale,
                                    targetScale = targetScale,
                                    currentOffset = offset,
                                    targetOffset = Offset.Zero,
                                    centroid = tapOffset
                                ) { newScale, newOffset ->
                                    scale = newScale
                                    offset = newOffset
                                }
                                
                                if (scale <= 1.1f) {
                                    isZoomed = false
                                } else {
                                    isZoomed = true
                                }
                            }
                            onDoubleTap()
                        }
                    )
                }
                .pointerInput(Unit) {
                    detectDragGestures(
                        onDragStart = { },
                        onDragEnd = { },
                        onDragCancel = { },
                        onDrag = { change, dragAmount ->
                            // Handle swipe gestures for page navigation when not zoomed
                            if (!isZoomed && enablePageNavigation) {
                                val dragDistance = dragAmount.getDistance()
                                if (dragDistance > 50) { // Minimum drag distance
                                    val angle = atan2(dragAmount.y, dragAmount.x)
                                    val degrees = Math.toDegrees(angle.toDouble())
                                    
                                    when {
                                        degrees in -45.0..45.0 -> onPageNavigation(NavigationDirection.RIGHT)
                                        degrees in 45.0..135.0 -> onPageNavigation(NavigationDirection.DOWN)
                                        degrees in -135.0..-45.0 -> onPageNavigation(NavigationDirection.UP)
                                        else -> onPageNavigation(NavigationDirection.LEFT)
                                    }
                                }
                            } else {
                                // Handle panning when zoomed
                                val newOffset = offset + dragAmount
                                val imageWidth = size.width * scale
                                val imageHeight = size.height * scale
                                val maxX = ((imageWidth - size.width) / 2f).coerceAtLeast(0f)
                                val maxY = ((imageHeight - size.height) / 2f).coerceAtLeast(0f)
                                
                                offset = Offset(
                                    x = newOffset.x.coerceIn(-maxX, maxX),
                                    y = newOffset.y.coerceIn(-maxY, maxY)
                                )
                            }
                        }
                    )
                }
        )
    }
}

/**
 * Анимация масштабирования и панорамирования
 */
suspend fun animateScaleAndPan(
    currentScale: Float,
    targetScale: Float,
    currentOffset: Offset,
    targetOffset: Offset,
    centroid: Offset,
    onUpdate: (Float, Offset) -> Unit
) {
    val steps = 30
    for (i in 1..steps) {
        val progress = i.toFloat() / steps
        val newScale = lerp(currentScale, targetScale, progress)
        val newOffset = Offset(
            x = lerp(currentOffset.x, targetOffset.x, progress),
            y = lerp(currentOffset.y, targetOffset.y, progress)
        )
        onUpdate(newScale, newOffset)
        kotlinx.coroutines.delay(16) // ~60 FPS
    }
}

/**
 * Линейная интерполяция
 */
fun lerp(start: Float, end: Float, progress: Float): Float {
    return start + (end - start) * progress
}

/**
 * A composable that displays an image with zoom and pan capabilities
 */
@Composable
fun ZoomablePannableImage(
    bitmap: Bitmap,
    contentDescription: String,
    modifier: Modifier = Modifier,
    onTap: (Offset) -> Unit = {},
    onDoubleTap: () -> Unit = {},
    minZoom: Float = 1f,
    maxZoom: Float = 5f,
    contentScale: ContentScale = ContentScale.Fit
) {
    var scale by remember { mutableStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    val density = LocalDensity.current

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = remember(bitmap) { BitmapPainter(bitmap.asImageBitmap()) },
            contentDescription = contentDescription,
            contentScale = contentScale,
            modifier = Modifier
                .fillMaxSize()
                .clip(RectangleShape)
                .graphicsLayer(
                    scaleX = scale,
                    scaleY = scale,
                    translationX = offset.x,
                    translationY = offset.y
                )
                .pointerInput(Unit) {
                    detectTransformGestures(
                        panZoomLock = true
                    ) { centroid, pan, zoom, _ ->
                        val newScale = (scale * zoom).coerceIn(minZoom, maxZoom)
                        
                        // Calculate the maximum allowed offset based on the scaled size
                        val imageSize = IntSize(
                            (size.width * newScale).toInt(),
                            (size.height * newScale).toInt()
                        )
                        
                        val maxX = ((imageSize.width - size.width) / 2f).coerceAtLeast(0f)
                        val maxY = ((imageSize.height - size.height) / 2f).coerceAtLeast(0f)
                        
                        // Apply the scale change
                        if (newScale != scale) {
                            // Adjust offset to keep the zoom centered on the gesture centroid
                            val scaleDelta = newScale / scale
                            offset = Offset(
                                x = (offset.x + centroid.x) * scaleDelta - centroid.x,
                                y = (offset.y + centroid.y) * scaleDelta - centroid.y
                            )
                            scale = newScale
                        }
                        
                        // Apply panning
                        val newOffset = offset + pan
                        offset = Offset(
                            x = newOffset.x.coerceIn(-maxX, maxX),
                            y = newOffset.y.coerceIn(-maxY, maxY)
                        )
                    }
                }
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { tapOffset ->
                            onTap(tapOffset)
                        },
                        onDoubleTap = { tapOffset ->
                            // Double tap to zoom in/out
                            if (scale > 1f) {
                                // Zoom out to fit
                                scale = 1f
                                offset = Offset.Zero
                            } else {
                                // Zoom in to 2x at the tap location
                                val newScale = 2f
                                val scaleDelta = newScale / scale
                                offset = Offset(
                                    x = (offset.x + tapOffset.x) * scaleDelta - tapOffset.x,
                                    y = (offset.y + tapOffset.y) * scaleDelta - tapOffset.y
                                )
                                scale = newScale
                            }
                            onDoubleTap()
                        }
                    )
                }
        )
    }
}

/**
 * Enhanced version with gesture state management
 */
@Composable
fun ZoomablePannableImageAdvanced(
    bitmap: Bitmap,
    contentDescription: String,
    modifier: Modifier = Modifier,
    onTap: (Offset) -> Unit = {},
    onDoubleTap: () -> Unit = {},
    onPageNavigation: (NavigationDirection) -> Unit = {},
    minZoom: Float = 1f,
    maxZoom: Float = 5f,
    contentScale: ContentScale = ContentScale.Fit,
    enablePageNavigation: Boolean = true
) {
    var scale by remember { mutableStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    var isZoomed by remember { mutableStateOf(false) }
    
    // Update zoom state when scale changes
    isZoomed = scale > 1.1f

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = remember(bitmap) { BitmapPainter(bitmap.asImageBitmap()) },
            contentDescription = contentDescription,
            contentScale = contentScale,
            modifier = Modifier
                .fillMaxSize()
                .clip(RectangleShape)
                .graphicsLayer(
                    scaleX = scale,
                    scaleY = scale,
                    translationX = offset.x,
                    translationY = offset.y
                )
                .pointerInput(Unit) {
                    detectTransformGestures(
                        panZoomLock = true
                    ) { centroid, pan, zoom, _ ->
                        val newScale = (scale * zoom).coerceIn(minZoom, maxZoom)
                        
                        // Calculate bounds for panning
                        val imageWidth = size.width * newScale
                        val imageHeight = size.height * newScale
                        val maxX = ((imageWidth - size.width) / 2f).coerceAtLeast(0f)
                        val maxY = ((imageHeight - size.height) / 2f).coerceAtLeast(0f)
                        
                        // Handle scaling
                        if (newScale != scale) {
                            val scaleDelta = newScale / scale
                            offset = Offset(
                                x = (offset.x + centroid.x) * scaleDelta - centroid.x,
                                y = (offset.y + centroid.y) * scaleDelta - centroid.y
                            )
                            scale = newScale
                        }
                        
                        // Handle panning with bounds checking
                        val newOffset = offset + pan
                        offset = Offset(
                            x = newOffset.x.coerceIn(-maxX, maxX),
                            y = newOffset.y.coerceIn(-maxY, maxY)
                        )
                    }
                }
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { tapOffset ->
                            if (!isZoomed && enablePageNavigation) {
                                // Page navigation when not zoomed
                                val screenWidth = size.width.toFloat()
                                val leftThreshold = screenWidth * 0.3f
                                val rightThreshold = screenWidth * 0.7f
                                
                                when {
                                    tapOffset.x < leftThreshold -> onPageNavigation(NavigationDirection.PREVIOUS)
                                    tapOffset.x > rightThreshold -> onPageNavigation(NavigationDirection.NEXT)
                                    else -> onTap(tapOffset) // Middle tap
                                }
                            } else {
                                onTap(tapOffset)
                            }
                        },
                        onDoubleTap = { tapOffset ->
                            if (scale > 1f) {
                                // Reset zoom
                                scale = 1f
                                offset = Offset.Zero
                            } else {
                                // Zoom in at tap location
                                val targetScale = 2.5f
                                val scaleDelta = targetScale / scale
                                
                                // Calculate new offset to center zoom on tap point
                                val newOffsetX = (offset.x + tapOffset.x) * scaleDelta - tapOffset.x
                                val newOffsetY = (offset.y + tapOffset.y) * scaleDelta - tapOffset.y
                                
                                // Apply bounds checking
                                val imageWidth = size.width * targetScale
                                val imageHeight = size.height * targetScale
                                val maxX = ((imageWidth - size.width) / 2f).coerceAtLeast(0f)
                                val maxY = ((imageHeight - size.height) / 2f).coerceAtLeast(0f)
                                
                                offset = Offset(
                                    x = newOffsetX.coerceIn(-maxX, maxX),
                                    y = newOffsetY.coerceIn(-maxY, maxY)
                                )
                                scale = targetScale
                            }
                            onDoubleTap()
                        }
                    )
                }
        )
    }
}

/**
 * Enhanced version with swipe gesture support for page navigation
 */
@Composable
fun SwipeableZoomablePannableImage(
    bitmap: Bitmap,
    contentDescription: String,
    modifier: Modifier = Modifier,
    onTap: (Offset) -> Unit = {},
    onDoubleTap: () -> Unit = {},
    onPageNavigation: (NavigationDirection) -> Unit = {},
    onSwipe: (NavigationDirection) -> Unit = {},
    minZoom: Float = 1f,
    maxZoom: Float = 5f,
    contentScale: ContentScale = ContentScale.Fit,
    enablePageNavigation: Boolean = true,
    enableSwipeNavigation: Boolean = true,
    swipeThreshold: Float = 100f // Minimum distance for swipe detection
) {
    var scale by remember { mutableStateOf(1f) }
    var offset by remember { mutableStateOf(Offset.Zero) }
    var isZoomed by remember { mutableStateOf(false) }
    
    // Update zoom state when scale changes
    isZoomed = scale > 1.1f

    Box(
        modifier = modifier.fillMaxSize(),
        contentAlignment = Alignment.Center
    ) {
        Image(
            painter = remember(bitmap) { BitmapPainter(bitmap.asImageBitmap()) },
            contentDescription = contentDescription,
            contentScale = contentScale,
            modifier = Modifier
                .fillMaxSize()
                .clip(RectangleShape)
                .graphicsLayer(
                    scaleX = scale,
                    scaleY = scale,
                    translationX = offset.x,
                    translationY = offset.y
                )
                // Transform gestures for zoom and pan
                .pointerInput(Unit) {
                    detectTransformGestures(
                        panZoomLock = true
                    ) { centroid, pan, zoom, _ ->
                        val newScale = (scale * zoom).coerceIn(minZoom, maxZoom)
                        
                        // Calculate bounds for panning
                        val imageWidth = size.width * newScale
                        val imageHeight = size.height * newScale
                        val maxX = ((imageWidth - size.width) / 2f).coerceAtLeast(0f)
                        val maxY = ((imageHeight - size.height) / 2f).coerceAtLeast(0f)
                        
                        // Handle scaling
                        if (newScale != scale) {
                            val scaleDelta = newScale / scale
                            offset = Offset(
                                x = (offset.x + centroid.x) * scaleDelta - centroid.x,
                                y = (offset.y + centroid.y) * scaleDelta - centroid.y
                            )
                            scale = newScale
                        }
                        
                        // Handle panning with bounds checking
                        val newOffset = offset + pan
                        offset = Offset(
                            x = newOffset.x.coerceIn(-maxX, maxX),
                            y = newOffset.y.coerceIn(-maxY, maxY)
                        )
                    }
                }
                // Swipe gestures for page navigation (when not zoomed)
                .pointerInput(Unit) {
                    if (!isZoomed && enableSwipeNavigation) {
                        detectDragGestures(
                            onDragEnd = {
                                // Swipe handling is done in onDrag
                            }
                        ) { change, dragAmount ->
                            val horizontalDrag = dragAmount.x.absoluteValue
                            val verticalDrag = dragAmount.y.absoluteValue
                            
                            // Only handle horizontal swipes
                            if (horizontalDrag > verticalDrag && horizontalDrag > swipeThreshold) {
                                when {
                                    dragAmount.x > 0 -> onSwipe(NavigationDirection.PREVIOUS)
                                    dragAmount.x < 0 -> onSwipe(NavigationDirection.NEXT)
                                }
                            }
                        }
                    }
                }
                // Tap gestures
                .pointerInput(Unit) {
                    detectTapGestures(
                        onTap = { tapOffset ->
                            if (!isZoomed && enablePageNavigation) {
                                // Page navigation when not zoomed
                                val screenWidth = size.width.toFloat()
                                val leftThreshold = screenWidth * 0.3f
                                val rightThreshold = screenWidth * 0.7f
                                
                                when {
                                    tapOffset.x < leftThreshold -> onPageNavigation(NavigationDirection.PREVIOUS)
                                    tapOffset.x > rightThreshold -> onPageNavigation(NavigationDirection.NEXT)
                                    else -> onTap(tapOffset) // Middle tap
                                }
                            } else {
                                onTap(tapOffset)
                            }
                        },
                        onDoubleTap = { tapOffset ->
                            if (scale > 1f) {
                                // Reset zoom
                                scale = 1f
                                offset = Offset.Zero
                            } else {
                                // Zoom in at tap location
                                val targetScale = 2.5f
                                val scaleDelta = targetScale / scale
                                
                                // Calculate new offset to center zoom on tap point
                                val newOffsetX = (offset.x + tapOffset.x) * scaleDelta - tapOffset.x
                                val newOffsetY = (offset.y + tapOffset.y) * scaleDelta - tapOffset.y
                                
                                // Apply bounds checking
                                val imageWidth = size.width * targetScale
                                val imageHeight = size.height * targetScale
                                val maxX = ((imageWidth - size.width) / 2f).coerceAtLeast(0f)
                                val maxY = ((imageHeight - size.height) / 2f).coerceAtLeast(0f)
                                
                                offset = Offset(
                                    x = newOffsetX.coerceIn(-maxX, maxX),
                                    y = newOffsetY.coerceIn(-maxY, maxY)
                                )
                                scale = targetScale
                            }
                            onDoubleTap()
                        }
                    )
                }
        )
    }
}