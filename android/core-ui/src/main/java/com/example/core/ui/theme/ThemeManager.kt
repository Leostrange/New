package com.example.core.ui.theme

import com.example.core.data.repository.SettingsRepository
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Theme manager for handling app-wide theme settings
 */
@Singleton
class ThemeManager @Inject constructor(
    private val settingsRepository: SettingsRepository
) {
    /**
     * Current theme mode
     */
    val themeMode: Flow<ThemeMode> = settingsRepository.themeMode

    /**
     * Whether dynamic color is enabled
     */
    val isDynamicColorEnabled: Flow<Boolean> = settingsRepository.isDynamicColorEnabled

    /**
     * Combined theme settings
     */
    val themeSettings: Flow<ThemeSettings> = settingsRepository.themeMode.map { mode ->
        ThemeSettings(
            themeMode = mode,
            isDynamicColorEnabled = settingsRepository.isDynamicColorEnabled.value
        )
    }

    /**
     * Update theme mode
     */
    suspend fun setThemeMode(themeMode: ThemeMode) {
        settingsRepository.setThemeMode(themeMode)
    }

    /**
     * Update dynamic color setting
     */
    suspend fun setDynamicColorEnabled(enabled: Boolean) {
        settingsRepository.setDynamicColorEnabled(enabled)
    }
}

/**
 * Theme mode options
 */
enum class ThemeMode {
    SYSTEM,
    LIGHT,
    DARK
}

/**
 * Combined theme settings
 */
data class ThemeSettings(
    val themeMode: ThemeMode,
    val isDynamicColorEnabled: Boolean
)