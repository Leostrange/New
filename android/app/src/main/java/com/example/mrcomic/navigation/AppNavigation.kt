package com.example.mrcomic.navigation

import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.feature.library.ui.LibraryScreen
import com.example.feature.settings.ui.SettingsScreen
import com.example.feature.onboarding.OnboardingScreen
import com.example.feature.reader.ui.ReaderScreen
import com.example.feature.plugins.ui.PluginsScreen

/**
 * Navigation routes for the application
 * Defines all possible screens and their navigation paths
 */
sealed class Screen(val route: String) {
    /** Library screen showing all available comics */
    data object Library : Screen("library")
    
    /** Settings screen for app configuration */
    data object Settings : Screen("settings")
    
    /** Plugins management screen */
    data object Plugins : Screen("plugins")
    
    /** Onboarding screen for first-time users */
    data object Onboarding : Screen("onboarding")
    
    /** Reader screen for comic viewing */
    data object Reader : Screen("reader/{uri}") {
        /**
         * Creates a route with the specified comic URI
         * @param uri The comic file path or identifier
         * @return Complete route string for navigation
         */
        fun create(uri: String) = "reader/$uri"
    }
}

/**
 * Main navigation host for the application
 * Manages navigation between different screens and handles navigation logic
 * 
 * @param navController Navigation controller for managing navigation state
 * @param onOnboardingComplete Callback executed when onboarding is completed
 */
@Composable
fun AppNavHost(navController: NavHostController, onOnboardingComplete: () -> Unit) {
    NavHost(navController = navController, startDestination = Screen.Onboarding.route) {
        composable(route = Screen.Library.route) {
            LibraryScreen(
                onBookClick = { path -> navController.navigate(Screen.Reader.create(path)) },
                onSettingsClick = { navController.navigate(Screen.Settings.route) },
                onPluginsClick = { navController.navigate(Screen.Plugins.route) },
                onAddClick = { 
                    // TODO: Implement add comic functionality
                    // This could open a file picker or add from URL
                }
            )
        }

        composable(route = Screen.Settings.route) {
            SettingsScreen()
        }

        composable(route = Screen.Plugins.route) {
            PluginsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        composable(route = Screen.Onboarding.route) {
            OnboardingScreen(onOnboardingComplete = onOnboardingComplete)
        }

        composable(route = Screen.Reader.route) { backStackEntry ->
            val uri = backStackEntry.arguments?.getString("uri") ?: ""
            ReaderScreen(
                comicUri = uri,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}


