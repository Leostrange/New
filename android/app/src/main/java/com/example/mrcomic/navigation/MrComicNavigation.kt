package com.example.mrcomic.navigation

import android.Manifest
import android.content.Intent
import android.net.Uri
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.result.contract.ActivityResultContracts
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.ui.platform.LocalContext
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.navArgument
import com.example.core.ui.components.AdaptiveNavigation
import com.example.feature.analytics.ui.AnalyticsScreen
import com.example.feature.analytics.ui.CrashReportsScreen
import com.example.feature.library.ui.LibraryScreen
import com.example.feature.onboarding.ui.OnboardingScreen
import com.example.feature.plugins.model.Plugin
import com.example.feature.plugins.model.PluginCategory
import com.example.feature.plugins.model.PluginPermission
import com.example.feature.plugins.model.PluginType
import com.example.feature.plugins.ui.PluginConfigScreen
import com.example.feature.plugins.ui.PluginPermissionsScreen
import com.example.feature.plugins.ui.PluginStoreScreen
import com.example.feature.reader.ui.ReaderScreen
import com.example.feature.settings.ui.SettingsScreen
import com.example.mrcomic.ui.PluginsScreen
import com.google.accompanist.permissions.ExperimentalPermissionsApi
import com.google.accompanist.permissions.rememberPermissionState
import java.net.URLDecoder
import java.nio.charset.StandardCharsets

/**
 * Main navigation component with adaptive navigation support
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun MrComicNavigation(
    navController: NavHostController,
    windowSizeClass: WindowSizeClass,
    onOnboardingComplete: () -> Unit
) {
    val navBackStackEntry by navController.currentBackStackEntryAsState()
    val currentDestination = navBackStackEntry?.destination
    val currentRoute = currentDestination?.route

    // Check if we should show navigation for current route
    val showNavigation = NavigationItems.isMainNavigationRoute(currentRoute) && 
                        currentRoute != Screen.Onboarding.route

    if (showNavigation) {
        AdaptiveNavigation(
            windowSizeClass = windowSizeClass,
            navigationItems = NavigationItems.mainNavigationItems,
            currentDestination = currentRoute,
            onNavigate = { route ->
                navController.navigate(route) {
                    // Pop up to the start destination of the graph to
                    // avoid building up a large stack of destinations
                    popUpTo(navController.graph.findStartDestination().id) {
                        saveState = true
                    }
                    // Avoid multiple copies of the same destination when
                    // reselecting the same item
                    launchSingleTop = true
                    // Restore state when reselecting a previously selected item
                    restoreState = true
                }
            }
        ) { paddingValues ->
            MrComicNavHost(
                navController = navController,
                onOnboardingComplete = onOnboardingComplete,
                contentPadding = paddingValues
            )
        }
    } else {
        MrComicNavHost(
            navController = navController,
            onOnboardingComplete = onOnboardingComplete
        )
    }
}

/**
 * Navigation host with all app destinations
 */
@OptIn(ExperimentalPermissionsApi::class)
@Composable
private fun MrComicNavHost(
    navController: NavHostController,
    onOnboardingComplete: () -> Unit,
    contentPadding: androidx.compose.foundation.layout.PaddingValues = 
        androidx.compose.foundation.layout.PaddingValues()
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Onboarding.route,
        modifier = androidx.compose.ui.Modifier.padding(contentPadding)
    ) {
        // Onboarding
        composable(route = Screen.Onboarding.route) {
            OnboardingScreen(onOnboardingComplete = onOnboardingComplete)
        }

        // Library
        composable(route = Screen.Library.route) {
            val context = LocalContext.current
            val storagePermissionState = rememberPermissionState(
                permission = Manifest.permission.READ_EXTERNAL_STORAGE
            )
            
            // Create ActivityResultLauncher for file picker
            val filePickerLauncher = rememberLauncherForActivityResult(
                contract = ActivityResultContracts.OpenMultipleDocuments(),
                onResult = { uris: List<Uri> ->
                    // Handle selected files
                    if (uris.isNotEmpty()) {
                        val firstUri = uris.firstOrNull()
                        firstUri?.let { uri ->
                            // Take persistable URI permission
                            val contentResolver = context.contentResolver
                            val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                            try {
                                contentResolver.takePersistableUriPermission(uri, takeFlags)
                            } catch (e: SecurityException) {
                                android.util.Log.w("Navigation", "Could not take URI permission", e)
                            }
                            
                            // Navigate to reader with the selected file
                            navController.navigate(Screen.Reader.create(uri.toString()))
                        }
                    }
                }
            )
            
            LibraryScreen(
                onBookClick = { path -> navController.navigate(Screen.Reader.create(path)) },
                onSettingsClick = { navController.navigate(Screen.Settings.route) },
                onPluginsClick = { navController.navigate(Screen.Plugins.route) },
                onAddClick = { 
                    if (storagePermissionState.status.isGranted) {
                        filePickerLauncher.launch(
                            arrayOf("application/x-cbr", "application/x-cbz", "application/pdf", "*/*")
                        )
                    } else {
                        storagePermissionState.launchPermissionRequest()
                    }
                }
            )
        }

        // Reader
        composable(
            route = Screen.Reader.route,
            arguments = listOf(navArgument("uri") { defaultValue = "" })
        ) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("uri") ?: ""
            val uri = URLDecoder.decode(encodedUri, StandardCharsets.UTF_8.toString())
            ReaderScreen(
                comicUri = uri,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Settings
        composable(route = Screen.Settings.route) {
            SettingsScreen(
                onNavigateToAnalytics = { navController.navigate(Screen.Analytics.route) }
            )
        }

        // Analytics
        composable(route = Screen.Analytics.route) {
            AnalyticsScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCrashReports = { navController.navigate(Screen.CrashReports.route) }
            )
        }

        // Crash Reports
        composable(route = Screen.CrashReports.route) {
            CrashReportsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Plugins
        composable(route = Screen.Plugins.route) {
            PluginsScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToPermissions = { plugin -> 
                    navController.navigate(Screen.PluginPermissions.create(plugin.id))
                },
                onNavigateToStore = { navController.navigate(Screen.PluginStore.route) },
                onNavigateToConfig = { plugin -> 
                    navController.navigate(Screen.PluginConfig.create(plugin.id))
                }
            )
        }

        // Plugin Store
        composable(route = Screen.PluginStore.route) {
            PluginStoreScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Plugin Configuration
        composable(
            route = Screen.PluginConfig.route,
            arguments = listOf(navArgument("pluginId") { defaultValue = "" })
        ) { backStackEntry ->
            val pluginId = backStackEntry.arguments?.getString("pluginId") ?: ""
            // Mock plugin for demonstration
            val mockPlugin = Plugin(
                id = pluginId,
                name = "Sample Plugin",
                version = "1.0.0",
                author = "Mr.Comic Team",
                description = "A sample plugin for demonstration purposes",
                category = PluginCategory.UTILITY,
                type = PluginType.JAVASCRIPT,
                configurable = true
            )
            
            PluginConfigScreen(
                plugin = mockPlugin,
                onNavigateBack = { navController.popBackStack() }
            )
        }

        // Plugin Permissions
        composable(
            route = Screen.PluginPermissions.route,
            arguments = listOf(navArgument("pluginId") { defaultValue = "" })
        ) { backStackEntry ->
            val pluginId = backStackEntry.arguments?.getString("pluginId") ?: ""
            // Mock plugin for demonstration
            val mockPlugin = Plugin(
                id = pluginId,
                name = "Sample Plugin",
                version = "1.0.0",
                author = "Mr.Comic Team",
                description = "A sample plugin for demonstration purposes",
                category = PluginCategory.UTILITY,
                type = PluginType.JAVASCRIPT,
                configurable = true,
                permissions = listOf(
                    PluginPermission.READ_FILES,
                    PluginPermission.NETWORK_ACCESS,
                    PluginPermission.STORAGE_ACCESS
                )
            )
            
            PluginPermissionsScreen(
                plugin = mockPlugin,
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}