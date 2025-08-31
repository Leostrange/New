package com.example.mrcomic.navigation

/**
 * Sealed class representing all possible screens in the application
 * Provides type-safe navigation with compile-time checking
 */
sealed class Screen(val route: String) {
    object Onboarding : Screen("onboarding")
    object Library : Screen("library")
    object Reader : Screen("reader/{uri}") {
        fun create(uri: String): String = "reader/${java.net.URLEncoder.encode(uri, "UTF-8")}"
    }
    object Settings : Screen("settings")
    object Analytics : Screen("analytics")
    object CrashReports : Screen("crash_reports")
    object Plugins : Screen("plugins")
    object PluginStore : Screen("plugin_store")
    object PluginConfig : Screen("plugin_config/{pluginId}") {
        fun create(pluginId: String): String = "plugin_config/$pluginId"
    }
    object PluginPermissions : Screen("plugin_permissions/{pluginId}") {
        fun create(pluginId: String): String = "plugin_permissions/$pluginId"
    }
}