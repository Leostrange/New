package com.mrcomic.ui.theme

import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = Color(0xFF2563EB),
    onPrimary = Color.White,
    primaryContainer = Color(0xFFDEEAFF),
    onPrimaryContainer = Color(0xFF001D36),
    secondary = Color(0xFF525F7A),
    onSecondary = Color.White,
    secondaryContainer = Color(0xFFD6E3FF),
    onSecondaryContainer = Color(0xFF0E1B2E),
    background = Color(0xFFFEFBFF),
    onBackground = Color(0xFF1A1C1E),
    surface = Color(0xFFFEFBFF),
    onSurface = Color(0xFF1A1C1E),
    surfaceVariant = Color(0xFFE0E2EC),
    onSurfaceVariant = Color(0xFF44474E),
    outline = Color(0xFF74777F),
    error = Color(0xFFBA1A1A),
    onError = Color.White
)

private val DarkColorScheme = darkColorScheme(
    primary = Color(0xFFB8C5FF),
    onPrimary = Color(0xFF002E69),
    primaryContainer = Color(0xFF004494),
    onPrimaryContainer = Color(0xFFDEEAFF),
    secondary = Color(0xFFAAC7FF),
    onSecondary = Color(0xFF253048),
    secondaryContainer = Color(0xFF3B4664),
    onSecondaryContainer = Color(0xFFD6E3FF),
    background = Color(0xFF111318),
    onBackground = Color(0xFFE2E2E9),
    surface = Color(0xFF111318),
    onSurface = Color(0xFFE2E2E9),
    surfaceVariant = Color(0xFF44474E),
    onSurfaceVariant = Color(0xFFC4C6D0),
    outline = Color(0xFF8E9099),
    error = Color(0xFFFFB4AB),
    onError = Color(0xFF690005)
)

private val SepiaColorScheme = lightColorScheme(
    primary = Color(0xFF8B4513),
    onPrimary = Color(0xFFFFF8DC),
    primaryContainer = Color(0xFFDEB887),
    onPrimaryContainer = Color(0xFF3E2723),
    secondary = Color(0xFFA0522D),
    onSecondary = Color(0xFFFFF8DC),
    secondaryContainer = Color(0xFFD2B48C),
    onSecondaryContainer = Color(0xFF3E2723),
    background = Color(0xFFFFF8DC),
    onBackground = Color(0xFF3E2723),
    surface = Color(0xFFFAF0E6),
    onSurface = Color(0xFF3E2723),
    surfaceVariant = Color(0xFFE6D3B7),
    onSurfaceVariant = Color(0xFF5D4E37),
    outline = Color(0xFF8B7355),
    error = Color(0xFFD2691E),
    onError = Color(0xFFFFF8DC)
)

enum class AppTheme {
    LIGHT, DARK, SEPIA
}

@Composable
fun MrComicTheme(
    theme: AppTheme = AppTheme.LIGHT,
    dynamicColor: Boolean = false,
    content: @Composable () -> Unit
) {
    val colorScheme = when (theme) {
        AppTheme.LIGHT -> LightColorScheme
        AppTheme.DARK -> DarkColorScheme
        AppTheme.SEPIA -> SepiaColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}
