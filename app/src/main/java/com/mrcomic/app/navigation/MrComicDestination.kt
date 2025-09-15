package com.mrcomic.app.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.ui.graphics.vector.ImageVector

enum class TopLevelDestination(
    val route: String,
    val icon: ImageVector,
    val label: String,
    val contentDescription: String
) {
    LIBRARY(
        route = "library",
        icon = Icons.Default.LibraryBooks,
        label = "Библиотека",
        contentDescription = "Библиотека комиксов"
    ),
    READER(
        route = "reader",
        icon = Icons.Default.MenuBook,
        label = "Читалка",
        contentDescription = "Читалка комиксов"
    ),
    OCR(
        route = "ocr",
        icon = Icons.Default.Translate,
        label = "OCR",
        contentDescription = "Распознавание и перевод текста"
    ),
    SETTINGS(
        route = "settings",
        icon = Icons.Default.Settings,
        label = "Настройки",
        contentDescription = "Настройки приложения"
    )
}

object MrComicDestinations {
    // Top level destinations
    const val LIBRARY_ROUTE = "library"
    const val READER_ROUTE = "reader"
    const val OCR_ROUTE = "ocr"
    const val SETTINGS_ROUTE = "settings"
    
    // Auth destinations
    const val AUTH_ROUTE = "auth"
    const val LOGIN_ROUTE = "login"
    const val REGISTER_ROUTE = "register"
    
    // Reader destinations
    const val COMIC_READER_ROUTE = "comic_reader"
    const val READER_SETTINGS_ROUTE = "reader_settings"
    
    // Library destinations
    const val COMIC_DETAILS_ROUTE = "comic_details"
    const val SEARCH_ROUTE = "search"
    
    // Settings destinations
    const val CUSTOMIZATION_ROUTE = "customization"
    const val OCR_SETTINGS_ROUTE = "ocr_settings"
    const val BACKUP_SETTINGS_ROUTE = "backup_settings"
    const val CLOUD_PROVIDERS_ROUTE = "cloud_providers"
    const val ABOUT_ROUTE = "about"
}

// Navigation arguments
object MrComicNavigationArgs {
    const val COMIC_ID = "comicId"
    const val PAGE_NUMBER = "pageNumber"
    const val SEARCH_QUERY = "searchQuery"
}