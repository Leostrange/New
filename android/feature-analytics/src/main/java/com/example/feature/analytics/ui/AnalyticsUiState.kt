package com.example.feature.analytics.ui

import com.example.core.analytics.PerformanceStats
import com.example.core.analytics.CrashReport

/**
 * UI state for analytics dashboard
 */
data class AnalyticsUiState(
    val isLoading: Boolean = false,
    val error: String? = null,
    val usageStats: UsageStats = UsageStats(),
    val performanceStats: PerformanceStats = PerformanceStats(),
    val appEvents: List<AppEvent> = emptyList()
)

/**
 * Usage statistics data class
 */
data class UsageStats(
    val totalComicsRead: Int = 0,
    val totalTimeReading: Long = 0, // in minutes
    val totalPagesRead: Long = 0,
    val favoriteGenres: List<String> = emptyList(),
    val mostUsedFeatures: List<FeatureUsage> = emptyList(),
    val dailyUsage: List<DailyUsage> = emptyList()
)

/**
 * Feature usage data class
 */
data class FeatureUsage(
    val featureName: String,
    val usageCount: Int,
    val lastUsed: Long // timestamp
)

/**
 * Daily usage data class
 */
data class DailyUsage(
    val date: String, // YYYY-MM-DD
    val minutes: Int,
    val comicsOpened: Int
)

/**
 * App event data class
 */
data class AppEvent(
    val eventName: String,
    val timestamp: Long,
    val parameters: Map<String, Any> = emptyMap()
)