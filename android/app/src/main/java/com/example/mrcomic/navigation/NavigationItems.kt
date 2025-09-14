package com.example.mrcomic.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Analytics
import androidx.compose.material.icons.filled.Book
import androidx.compose.material.icons.filled.Extension
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Settings
import androidx.compose.material.icons.outlined.Analytics
import androidx.compose.material.icons.outlined.Book
import androidx.compose.material.icons.outlined.Extension
import androidx.compose.material.icons.outlined.Home
import androidx.compose.material.icons.outlined.Settings
import androidx.compose.ui.graphics.vector.ImageVector
import com.example.core.ui.components.NavigationItem

/**
 * Navigation items for the main navigation
 */
object NavigationItems {
    
    /**
     * Main navigation items for bottom navigation and navigation rail
     */
    val mainNavigationItems = listOf(
        NavigationItem(
            route = Screen.Library.route,
            label = "Library",
            icon = Icons.Outlined.Book
        ),
        NavigationItem(
            route = Screen.Reader.route,
            label = "Reader", 
            icon = Icons.Outlined.Home
        ),
        NavigationItem(
            route = Screen.Plugins.route,
            label = "Plugins",
            icon = Icons.Outlined.Extension
        ),
        NavigationItem(
            route = Screen.Analytics.route,
            label = "Analytics",
            icon = Icons.Outlined.Analytics
        ),
        NavigationItem(
            route = Screen.Settings.route,
            label = "Settings",
            icon = Icons.Outlined.Settings
        )
    )
    
    /**
     * Get selected icon for navigation item
     */
    fun getSelectedIcon(route: String): ImageVector = when (route) {
        Screen.Library.route -> Icons.Filled.Book
        Screen.Reader.route -> Icons.Filled.Home
        Screen.Plugins.route -> Icons.Filled.Extension
        Screen.Analytics.route -> Icons.Filled.Analytics
        Screen.Settings.route -> Icons.Filled.Settings
        else -> Icons.Outlined.Home
    }
    
    /**
     * Get unselected icon for navigation item
     */
    fun getUnselectedIcon(route: String): ImageVector = when (route) {
        Screen.Library.route -> Icons.Outlined.Book
        Screen.Reader.route -> Icons.Outlined.Home
        Screen.Plugins.route -> Icons.Outlined.Extension
        Screen.Analytics.route -> Icons.Outlined.Analytics
        Screen.Settings.route -> Icons.Outlined.Settings
        else -> Icons.Outlined.Home
    }
    
    /**
     * Check if route should show in main navigation
     */
    fun isMainNavigationRoute(route: String?): Boolean {
        return route != null && mainNavigationItems.any { it.route == route }
    }
    
    /**
     * Get navigation label for route
     */
    fun getNavigationLabel(route: String): String = when (route) {
        Screen.Library.route -> "Library"
        Screen.Reader.route -> "Reader"
        Screen.Plugins.route -> "Plugins"
        Screen.Analytics.route -> "Analytics"
        Screen.Settings.route -> "Settings"
        else -> "Unknown"
    }
}