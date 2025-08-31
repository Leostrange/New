package com.example.feature.reader.ui.components

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Map
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.drawscope.DrawScope
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog
import com.example.core.model.Bookmark
import com.example.core.model.Note
import kotlin.math.max
import kotlin.math.min

@Composable
fun ComicMiniMapFab(
    onShowMiniMap: () -> Unit
) {
    FloatingActionButton(
        onClick = onShowMiniMap,
        modifier = Modifier.size(48.dp),
        containerColor = MaterialTheme.colorScheme.secondaryContainer
    ) {
        Icon(
            Icons.Default.Map,
            contentDescription = "Show mini map",
            tint = MaterialTheme.colorScheme.onSecondaryContainer
        )
    }
}

@Composable
fun ComicMiniMapDialog(
    currentPage: Int,
    totalPages: Int,
    bookmarks: List<Bookmark>,
    notes: List<Note>,
    onDismiss: () -> Unit,
    onPageSelected: (Int) -> Unit
) {
    Dialog(onDismissRequest = onDismiss) {
        Card(
            modifier = Modifier
                .fillMaxWidth()
                .fillMaxHeight(0.8f),
            shape = RoundedCornerShape(16.dp),
            elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
        ) {
            Column(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(16.dp)
            ) {
                // Header
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Comic Navigation",
                        style = MaterialTheme.typography.titleLarge,
                        fontWeight = FontWeight.Bold
                    )
                    
                    IconButton(onClick = onDismiss) {
                        Icon(Icons.Default.Close, contentDescription = "Close")
                    }
                }
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Page info
                Text(
                    text = "Page ${currentPage + 1} of $totalPages",
                    style = MaterialTheme.typography.bodyLarge,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Mini map
                ComicMiniMap(
                    modifier = Modifier
                        .fillMaxWidth()
                        .weight(1f),
                    currentPage = currentPage,
                    totalPages = totalPages,
                    bookmarks = bookmarks,
                    notes = notes,
                    onPageSelected = onPageSelected
                )
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Legend
                ComicMiniMapLegend()
                
                Spacer(modifier = Modifier.height(16.dp))
                
                // Quick navigation buttons
                QuickNavigationButtons(
                    currentPage = currentPage,
                    totalPages = totalPages,
                    onPageSelected = onPageSelected
                )
            }
        }
    }
}

@Composable
private fun ComicMiniMap(
    modifier: Modifier = Modifier,
    currentPage: Int,
    totalPages: Int,
    bookmarks: List<Bookmark>,
    notes: List<Note>,
    onPageSelected: (Int) -> Unit
) {
    val density = LocalDensity.current
    
    // Calculate grid dimensions for optimal layout
    val aspectRatio = 3f / 4f // Comic page aspect ratio
    val itemsPerRow = when {
        totalPages <= 20 -> 5
        totalPages <= 100 -> 10
        totalPages <= 400 -> 20
        else -> 25
    }
    val rowCount = (totalPages + itemsPerRow - 1) / itemsPerRow
    
    Box(
        modifier = modifier
            .aspectRatio(itemsPerRow.toFloat() / rowCount.toFloat())
    ) {
        Canvas(
            modifier = Modifier
                .matchParentSize()
        ) {
            val canvasWidth = size.width
            val canvasHeight = size.height
            
            val itemWidth = canvasWidth / itemsPerRow
            val itemHeight = canvasHeight / rowCount
            
            // Draw grid of pages
            for (page in 0 until totalPages) {
                val row = page / itemsPerRow
                val col = page % itemsPerRow
                
                val x = col * itemWidth
                val y = row * itemHeight
                
                // Determine page color based on content
                val pageColor = when {
                    page == currentPage -> MaterialTheme.colorScheme.primary
                    bookmarks.any { it.page == page } -> MaterialTheme.colorScheme.secondary
                    notes.any { it.page == page } -> MaterialTheme.colorScheme.tertiary
                    else -> MaterialTheme.colorScheme.surfaceVariant
                }
                
                // Draw page rectangle
                drawRect(
                    color = pageColor,
                    topLeft = Offset(x + 1.dp.toPx(), y + 1.dp.toPx()),
                    size = Size(
                        itemWidth - 2.dp.toPx(),
                        itemHeight - 2.dp.toPx()
                    )
                )
                
                // Draw border for current page
                if (page == currentPage) {
                    drawRect(
                        color = MaterialTheme.colorScheme.onPrimary,
                        topLeft = Offset(x + 1.dp.toPx(), y + 1.dp.toPx()),
                        size = Size(
                            itemWidth - 2.dp.toPx(),
                            itemHeight - 2.dp.toPx()
                        ),
                        style = androidx.compose.ui.graphics.drawscope.Stroke(width = 2.dp.toPx())
                    )
                }
            }
        }
        
        // Handle clicks on the canvas
        Box(
            modifier = Modifier
                .matchParentSize()
                .pointerInput(Unit) {
                    detectTapGestures { offset ->
                        // Calculate which page was clicked based on tap position
                        val itemWidth = size.width / itemsPerRow
                        val itemHeight = size.height / rowCount
                        
                        val col = (offset.x / itemWidth).toInt()
                        val row = (offset.y / itemHeight).toInt()
                        
                        val page = row * itemsPerRow + col
                        
                        // Only trigger if the page is valid
                        if (page >= 0 && page < totalPages) {
                            onPageSelected(page)
                        }
                    }
                }
        )
    }
}

@Composable
private fun ComicMiniMapLegend() {
    Column(
        verticalArrangement = Arrangement.spacedBy(8.dp)
    ) {
        Text(
            text = "Legend:",
            style = MaterialTheme.typography.labelLarge,
            fontWeight = FontWeight.Medium
        )
        
        Row(
            horizontalArrangement = Arrangement.spacedBy(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            LegendItem(
                color = MaterialTheme.colorScheme.primary,
                label = "Current"
            )
            LegendItem(
                color = MaterialTheme.colorScheme.secondary,
                label = "Bookmarked"
            )
            LegendItem(
                color = MaterialTheme.colorScheme.tertiary,
                label = "Has Notes"
            )
            LegendItem(
                color = MaterialTheme.colorScheme.surfaceVariant,
                label = "Regular"
            )
        }
    }
}

@Composable
private fun LegendItem(
    color: Color,
    label: String
) {
    Row(
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(4.dp)
    ) {
        Box(
            modifier = Modifier
                .size(12.dp)
                .background(color, RoundedCornerShape(2.dp))
        )
        Text(
            text = label,
            style = MaterialTheme.typography.bodySmall
        )
    }
}

@Composable
private fun QuickNavigationButtons(
    currentPage: Int,
    totalPages: Int,
    onPageSelected: (Int) -> Unit
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceEvenly
    ) {
        OutlinedButton(
            onClick = { onPageSelected(0) },
            enabled = currentPage > 0
        ) {
            Text("First")
        }
        
        OutlinedButton(
            onClick = { onPageSelected(max(0, currentPage - 10)) },
            enabled = currentPage > 9
        ) {
            Text("-10")
        }
        
        OutlinedButton(
            onClick = { onPageSelected(min(totalPages - 1, currentPage + 10)) },
            enabled = currentPage < totalPages - 10
        ) {
            Text("+10")
        }
        
        OutlinedButton(
            onClick = { onPageSelected(totalPages - 1) },
            enabled = currentPage < totalPages - 1
        ) {
            Text("Last")
        }
    }
}

@Composable
fun ComicProgressIndicator(
    currentPage: Int,
    totalPages: Int,
    modifier: Modifier = Modifier
) {
    val progress = if (totalPages > 0) (currentPage + 1).toFloat() / totalPages.toFloat() else 0f
    
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        LinearProgressIndicator(
            progress = { progress },
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.primary,
            trackColor = MaterialTheme.colorScheme.surfaceVariant
        )
        
        Spacer(modifier = Modifier.height(4.dp))
        
        Text(
            text = "${(progress * 100).toInt()}% complete",
            style = MaterialTheme.typography.bodySmall,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}