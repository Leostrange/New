package com.mrcomic

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.activity.enableEdgeToEdge
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.core.view.WindowCompat
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import com.mrcomic.core.ui.theme.AppTheme
import com.mrcomic.core.ui.theme.MrComicTheme
import com.mrcomic.feature.library.LibraryScreen
import com.mrcomic.feature.reader.ReaderScreen
import com.mrcomic.feature.translations.TranslationsScreen
import com.mrcomic.feature.settings.SettingsScreen
import dagger.hilt.android.AndroidEntryPoint

@AndroidEntryPoint
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        WindowCompat.setDecorFitsSystemWindows(window, false)
        
        setContent {
            var currentTheme by remember { mutableStateOf(AppTheme.LIGHT) }
            val navController = rememberNavController()
            
            MrComicTheme(appTheme = currentTheme) {
                Scaffold(
                    modifier = Modifier.fillMaxSize(),
                    bottomBar = {
                        NavigationBar {
                            val screens = listOf(
                                Screen("library", "Домой", Icons.Default.Home),
                                Screen("reader", "Чтение", Icons.Default.Book),
                                Screen("translations", "Переводы", Icons.Default.Translate),
                                Screen("settings", "Настройки", Icons.Default.Settings)
                            )
                            
                            screens.forEach { screen ->
                                NavigationBarItem(
                                    icon = { Icon(screen.icon, contentDescription = screen.title) },
                                    label = { Text(screen.title) },
                                    selected = false, // TODO: implement current route detection
                                    onClick = { navController.navigate(screen.route) }
                                )
                            }
                        }
                    }
                ) { innerPadding ->
                    NavHost(
                        navController = navController,
                        startDestination = "library",
                        modifier = Modifier.padding(innerPadding)
                    ) {
                        composable("library") {
                            LibraryScreen(
                                onComicClick = { comic ->
                                    navController.navigate("reader/${comic.id}")
                                }
                            )
                        }
                        composable("reader/{comicId}") { backStackEntry ->
                            val comicId = backStackEntry.arguments?.getString("comicId") ?: ""
                            ReaderScreen(
                                comicId = comicId,
                                onBackClick = { navController.popBackStack() }
                            )
                        }
                        composable("translations") {
                            TranslationsScreen()
                        }
                        composable("settings") {
                            SettingsScreen(
                                currentTheme = currentTheme,
                                onThemeChange = { currentTheme = it },
                                onBackClick = { navController.popBackStack() }
                            )
                        }
                    }
                }
            }
        }
    }
}

data class Screen(val route: String, val title: String, val icon: ImageVector)
