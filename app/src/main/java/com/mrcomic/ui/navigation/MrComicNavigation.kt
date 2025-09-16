package com.mrcomic.ui.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.mrcomic.ui.auth.LoginScreen
import com.mrcomic.ui.library.LibraryScreen
import com.mrcomic.ui.reader.ReaderScreen
import com.mrcomic.ui.settings.SettingsScreen
import com.mrcomic.ui.translations.TranslationsScreen

sealed class Screen(val route: String, val title: String, val icon: ImageVector) {
    object Home : Screen("home", "Домой", Icons.Default.Home)
    object Reading : Screen("reading", "Чтение", Icons.Default.MenuBook)
    object Translations : Screen("translations", "Переводы", Icons.Default.Translate)
    object Settings : Screen("settings", "Настройки", Icons.Default.Settings)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MrComicNavigation() {
    val navController = rememberNavController()
    var isAuthenticated by remember { mutableStateOf(false) }
    
    if (!isAuthenticated) {
        LoginScreen(
            onLoginSuccess = { isAuthenticated = true }
        )
        return
    }
    
    val items = listOf(
        Screen.Home,
        Screen.Reading,
        Screen.Translations,
        Screen.Settings
    )
    
    Scaffold(
        bottomBar = {
            NavigationBar {
                val navBackStackEntry by navController.currentBackStackEntryAsState()
                val currentDestination = navBackStackEntry?.destination
                
                items.forEach { screen ->
                    NavigationBarItem(
                        icon = { Icon(screen.icon, contentDescription = null) },
                        label = { Text(screen.title) },
                        selected = currentDestination?.hierarchy?.any { it.route == screen.route } == true,
                        onClick = {
                            navController.navigate(screen.route) {
                                popUpTo(navController.graph.findStartDestination().id) {
                                    saveState = true
                                }
                                launchSingleTop = true
                                restoreState = true
                            }
                        }
                    )
                }
            }
        }
    ) { innerPadding ->
        NavHost(
            navController = navController,
            startDestination = Screen.Home.route,
            modifier = Modifier.padding(innerPadding)
        ) {
            composable(Screen.Home.route) {
                LibraryScreen(
                    onComicClick = { 
                        navController.navigate(Screen.Reading.route)
                    }
                )
            }
            composable(Screen.Reading.route) {
                ReaderScreen()
            }
            composable(Screen.Translations.route) {
                TranslationsScreen()
            }
            composable(Screen.Settings.route) {
                SettingsScreen()
            }
        }
    }
}
