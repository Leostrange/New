package com.example.core.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

/**
 * Material Design 3 shapes for MrComic application
 * Following the updated Material Design guidelines
 */
val MrComicShapes = Shapes(
    // Extra small shape - for chips, badges
    extraSmall = RoundedCornerShape(4.dp),
    
    // Small shape - for buttons, small cards
    small = RoundedCornerShape(8.dp),
    
    // Medium shape - for cards, dialogs
    medium = RoundedCornerShape(12.dp),
    
    // Large shape - for bottom sheets, large components
    large = RoundedCornerShape(16.dp),
    
    // Extra large shape - for special components
    extraLarge = RoundedCornerShape(28.dp)
)

/**
 * Custom shapes for specific comic reading components
 */
object ComicShapes {
    // Comic cover aspect ratio shape
    val comicCover = RoundedCornerShape(8.dp)
    
    // Reader controls shape
    val readerControls = RoundedCornerShape(
        topStart = 16.dp,
        topEnd = 16.dp,
        bottomStart = 0.dp,
        bottomEnd = 0.dp
    )
    
    // Bottom navigation shape
    val bottomNavigation = RoundedCornerShape(
        topStart = 20.dp,
        topEnd = 20.dp,
        bottomStart = 0.dp,
        bottomEnd = 0.dp
    )
    
    // Floating action button shape
    val fab = RoundedCornerShape(16.dp)
    
    // Search bar shape
    val searchBar = RoundedCornerShape(28.dp)
}