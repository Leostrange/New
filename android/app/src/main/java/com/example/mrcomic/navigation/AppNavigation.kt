package com.example.mrcomic.navigation

import android.net.Uri
import androidx.compose.runtime.Composable
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.example.feature.library.ui.LibraryScreen
import com.example.feature.settings.ui.SettingsScreen
import com.example.feature.onboarding.OnboardingScreen
import com.example.feature.reader.ui.ReaderScreen
import com.example.feature.plugins.ui.PluginsScreen
import java.net.URLEncoder
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

sealed class Screen(val route: String) {
    data object Library : Screen("library")
    data object Settings : Screen("settings")
    data object Plugins : Screen("plugins")
    data object Onboarding : Screen("onboarding")
    data object Reader : Screen("reader/{uri}") {
        fun create(uri: String) = "reader/${URLEncoder.encode(uri, StandardCharsets.UTF_8.toString())}"
    }
}

@Composable
fun AppNavHost(navController: NavHostController, onOnboardingComplete: () -> Unit) {
    NavHost(navController = navController, startDestination = Screen.Library.route) {
        composable(route = Screen.Library.route) {
            LibraryScreen(
                onBookClick = { path -> navController.navigate(Screen.Reader.create(path)) },
                onSettingsClick = { navController.navigate(Screen.Settings.route) },
                onPluginsClick = { navController.navigate(Screen.Plugins.route) },
                onAddClick = { }
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

            val uri = backStackEntry.arguments?.getString("uri") ?: ""
>>>>>>> 272fe1b6a2f2b204ff8ae2d9f7300f5160ae40e7
            ReaderScreen()
        }
        composable(route = Screen.Reader.route) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("uri") ?: ""
            val uri = URLDecoder.decode(encodedUri, StandardCharsets.UTF_8.toString())
            android.util.Log.d("Navigation", "📁 ReaderScreen URI: $uri")
            ReaderScreen()
        }
=======
            val uri = backStackEntry.arguments?.getString("uri") ?: ""
>>>>>>> 272fe1b6a2f2b204ff8ae2d9f7300f5160ae40e7
            ReaderScreen()
        }
    }
}


