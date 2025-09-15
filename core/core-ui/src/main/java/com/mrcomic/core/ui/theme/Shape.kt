package com.mrcomic.core.ui.theme

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Shapes
import androidx.compose.ui.unit.dp

val MrComicShapes = Shapes(
    extraSmall = RoundedCornerShape(4.dp),
    small = RoundedCornerShape(8.dp),
    medium = RoundedCornerShape(12.dp),
    large = RoundedCornerShape(16.dp),
    extraLarge = RoundedCornerShape(28.dp)
)

// Custom shapes for specific components
val ComicCardShape = RoundedCornerShape(12.dp)
val ReaderControlShape = RoundedCornerShape(24.dp)
val SettingsCardShape = RoundedCornerShape(16.dp)
val FloatingActionButtonShape = RoundedCornerShape(16.dp)
val BottomSheetShape = RoundedCornerShape(topStart = 28.dp, topEnd = 28.dp)