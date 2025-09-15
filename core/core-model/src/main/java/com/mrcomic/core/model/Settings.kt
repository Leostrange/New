package com.mrcomic.core.model

import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily

data class ReadingSettings(
    val readingMode: ReadingMode = ReadingMode.PAGE_BY_PAGE,
    val readingDirection: ReadingDirection = ReadingDirection.LEFT_TO_RIGHT,
    val scalingMode: ScalingMode = ScalingMode.FIT_WIDTH,
    val imageQuality: ImageQuality = ImageQuality.HIGH,
    val preloadPages: Int = 3,
    val eInkMode: Boolean = false,
    val nightMode: Boolean = false,
    val fullscreenMode: Boolean = true,
    val volumeKeysNavigation: Boolean = true,
    val tapToToggleUI: Boolean = true,
    val doubleTapToZoom: Boolean = true,
    val brightness: Float = 0.5f,
    val backgroundColor: Color = Color.White
)

data class CustomizationSettings(
    val currentTheme: AppTheme = AppTheme.SYSTEM,
    val materialYouEnabled: Boolean = true,
    val primaryColor: Color? = null,
    val secondaryColor: Color? = null,
    val fontFamily: FontFamily = FontFamily.Default,
    val customFonts: List<CustomFont> = emptyList(),
    val iconPack: IconPack = IconPack.DEFAULT,
    val animationsEnabled: Boolean = true,
    val animationSpeed: Float = 1.0f,
    val showBadges: Boolean = true,
    val compactMode: Boolean = false
)

data class CustomFont(
    val id: String,
    val name: String,
    val fontPath: String,
    val isSystemFont: Boolean = false
)

enum class IconPack {
    DEFAULT,
    ROUNDED,
    SHARP,
    OUTLINED
}

data class OCRTranslationSettings(
    val ocrSettings: OCRSettings = OCRSettings(),
    val translationProviders: List<TranslationProvider> = emptyList(),
    val defaultProvider: String? = null,
    val showOriginalText: Boolean = true,
    val overlayTranslations: Boolean = true,
    val saveTranslations: Boolean = true,
    val autoDetectLanguage: Boolean = true
)

data class BackupSyncSettings(
    val localBackupEnabled: Boolean = false,
    val cloudProvider: CloudProvider = CloudProvider.GOOGLE_DRIVE,
    val encryptionEnabled: Boolean = true,
    val backupSchedule: BackupSchedule = BackupSchedule.WEEKLY,
    val lastBackupTimestamp: Long? = null,
    val backupLocation: String? = null,
    val includeImages: Boolean = false,
    val includeOCRData: Boolean = true,
    val includeSettings: Boolean = true,
    val maxBackupSize: Long = 1024 * 1024 * 100 // 100MB
)

data class PerformanceSettings(
    val memoryOptimization: Boolean = true,
    val batteryOptimization: Boolean = false,
    val preloadingEnabled: Boolean = true,
    val cacheSize: Long = 1024 * 1024 * 50, // 50MB
    val imageCompression: Boolean = false,
    val hardwareAcceleration: Boolean = true,
    val backgroundProcessing: Boolean = true
)

data class SecuritySettings(
    val biometricEnabled: Boolean = false,
    val autoLockTimeout: Long = 30 * 60 * 1000, // 30 minutes
    val encryptDatabase: Boolean = false,
    val secureApiKeys: Boolean = true,
    val allowScreenshots: Boolean = true,
    val requireAuthForSettings: Boolean = false
)

data class NotificationSettings(
    val downloadsEnabled: Boolean = true,
    val ocrEnabled: Boolean = true,
    val backupEnabled: Boolean = true,
    val updateNotifications: Boolean = true,
    val soundEnabled: Boolean = false,
    val vibrationEnabled: Boolean = true
)