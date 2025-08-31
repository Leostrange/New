@OptIn(ExperimentalPermissionsApi::class)
@Composable
fun AppNavHost(navController: NavHostController, onOnboardingComplete: () -> Unit) {
    NavHost(navController = navController, startDestination = Screen.Onboarding.route) {
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
                        // Process the selected files and add them to the library
                        // This implementation processes the selected files and navigates to the reader
                        val firstUri = uris.firstOrNull()
                        firstUri?.let { uri ->
                            // Take persistable URI permission
                            val contentResolver = context.contentResolver
                            val takeFlags = Intent.FLAG_GRANT_READ_URI_PERMISSION
                            try {
                                contentResolver.takePersistableUriPermission(uri, takeFlags)
                            } catch (e: SecurityException) {
                                android.util.Log.w("AppNavigation", "Could not take URI permission", e)
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
                    // Implement file picker for adding comics from device storage
                    // Open system file picker for .cbr, .cbz, .pdf files
                    if (storagePermissionState.status.isGranted) {
                        // Permission already granted, open file picker
                        filePickerLauncher.launch(
                            arrayOf("application/x-cbr", "application/x-cbz", "application/pdf", "*/*")
                        )
                    } else {
                        // Request permission
                        storagePermissionState.launchPermissionRequest()
                    }
                }
            )
        }

        composable(route = Screen.Settings.route) {
            SettingsScreen(
                onNavigateToAnalytics = { navController.navigate(Screen.Analytics.route) }
            )
        }

        composable(route = Screen.Plugins.route) {
            PluginsScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToPermissions = { plugin -> 
                    // Navigate to plugin permissions screen
                    navController.navigate(Screen.PluginPermissions.create(plugin.id))
                },
                onNavigateToStore = { navController.navigate(Screen.PluginStore.route) },
                onNavigateToConfig = { plugin -> 
                    navController.navigate(Screen.PluginConfig.create(plugin.id))
                }
            )
        }

        composable(route = Screen.Onboarding.route) {
            OnboardingScreen(onOnboardingComplete = onOnboardingComplete)
        }

        composable(route = Screen.Reader.route) { backStackEntry ->
            val encodedUri = backStackEntry.arguments?.getString("uri") ?: ""
            val uri = URLDecoder.decode(encodedUri, StandardCharsets.UTF_8.toString())
            android.util.Log.d("Navigation", "📁 ReaderScreen URI: $uri")
            ReaderScreen(
                comicUri = uri,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(route = Screen.PluginStore.route) {
            PluginStoreScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(
            route = Screen.PluginConfig.route,
            arguments = listOf(navArgument("pluginId") { defaultValue = "" })
        ) { backStackEntry ->
            val pluginId = backStackEntry.arguments?.getString("pluginId") ?: ""
            // Fetch the plugin by ID from the repository
            // For demonstration purposes, we'll create a mock plugin
            // In a real implementation, this would fetch from a plugin repository
            val mockPlugin = Plugin(
                id = pluginId,
                name = "Sample Plugin",
                version = "1.0.0",
                author = "Mr.Comic Team",
                description = "A sample plugin for demonstration purposes",
                category = com.example.feature.plugins.model.PluginCategory.UTILITY,
                type = com.example.feature.plugins.model.PluginType.JAVASCRIPT,
                configurable = true
            )
            
            PluginConfigScreen(
                plugin = mockPlugin,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(
            route = Screen.PluginPermissions.route,
            arguments = listOf(navArgument("pluginId") { defaultValue = "" })
        ) { backStackEntry ->
            val pluginId = backStackEntry.arguments?.getString("pluginId") ?: ""
            // Fetch the plugin by ID from the repository
            // For demonstration purposes, we'll create a mock plugin
            // In a real implementation, this would fetch from a plugin repository
            val mockPlugin = com.example.feature.plugins.model.Plugin(
                id = pluginId,
                name = "Sample Plugin",
                version = "1.0.0",
                author = "Mr.Comic Team",
                description = "A sample plugin for demonstration purposes",
                category = com.example.feature.plugins.model.PluginCategory.UTILITY,
                type = com.example.feature.plugins.model.PluginType.JAVASCRIPT,
                configurable = true,
                permissions = listOf(
                    com.example.feature.plugins.model.PluginPermission.READ_FILES,
                    com.example.feature.plugins.model.PluginPermission.NETWORK_ACCESS,
                    com.example.feature.plugins.model.PluginPermission.STORAGE_ACCESS
                )
            )
            
            com.example.feature.plugins.ui.PluginPermissionsScreen(
                plugin = mockPlugin,
                onNavigateBack = { navController.popBackStack() }
            )
        }
        
        composable(route = Screen.Analytics.route) {
            com.example.feature.analytics.ui.AnalyticsScreen(
                onNavigateBack = { navController.popBackStack() },
                onNavigateToCrashReports = { navController.navigate(Screen.CrashReports.route) }
            )
        }
        
        composable(route = Screen.CrashReports.route) {
            com.example.feature.analytics.ui.CrashReportsScreen(
                onNavigateBack = { navController.popBackStack() }
            )
        }
    }
}