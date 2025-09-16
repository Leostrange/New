package com.mrcomic.ui.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.mrcomic.ui.auth.LoginScreen
import com.mrcomic.ui.library.LibraryScreen
import com.mrcomic.ui.reader.ReaderScreen
import com.mrcomic.ui.settings.SettingsScreen
import com.mrcomic.ui.translations.TranslationsScreen

@Composable
fun AppNavigation(
    navController: NavHostController,
    isLoggedIn: Boolean
) {
    NavHost(
        navController = navController,
        startDestination = if (isLoggedIn) "library" else "login"
    ) {
        composable("login") {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate("library") {
                        popUpTo("login") { inclusive = true }
                    }
                }
            )
        }
        
        composable("library") {
            LibraryScreen(
                onComicClick = { comicId ->
                    navController.navigate("reader/$comicId")
                }
            )
        }
        
        composable("reader/{comicId}") { backStackEntry ->
            val comicId = backStackEntry.arguments?.getString("comicId") ?: ""
            ReaderScreen(
                comicId = comicId,
                onBackClick = {
                    navController.popBackStack()
                }
            )
        }
        
        composable("translations") {
            TranslationsScreen()
        }
        
        composable("settings") {
            SettingsScreen()
        }
    }
}

sealed class Screen(val route: String, val title: String) {
    object Library : Screen("library", "Библиотека")
    object Reader : Screen("reader", "Чтение")
    object Translations : Screen("translations", "Переводы")
    object Settings : Screen("settings", "Настройки")
}
