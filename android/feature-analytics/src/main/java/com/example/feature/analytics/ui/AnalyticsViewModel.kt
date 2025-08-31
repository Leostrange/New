package com.example.feature.analytics.ui

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.example.core.analytics.AnalyticsTracker
import com.example.core.analytics.CrashReport
import com.example.core.analytics.CrashReportingService
import com.example.core.analytics.PerformanceProfiler
import com.example.core.analytics.RoomAnalyticsStorage
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AnalyticsViewModel @Inject constructor(
    private val analyticsTracker: AnalyticsTracker,
    private val performanceProfiler: PerformanceProfiler,
    private val analyticsStorage: RoomAnalyticsStorage,
    private val crashReportingService: CrashReportingService
) : ViewModel() {
    
    private val _uiState = MutableStateFlow(AnalyticsUiState())
    val uiState = _uiState.asStateFlow()
    
    private val _crashReports = MutableStateFlow<List<CrashReport>>(emptyList())
    val crashReports = _crashReports.asStateFlow()
    
    private val _isCrashReportsLoading = MutableStateFlow(false)
    val isCrashReportsLoading = _isCrashReportsLoading.asStateFlow()
    
    private val _selectedCrashReport = MutableStateFlow<CrashReport?>(null)
    val selectedCrashReport = _selectedCrashReport.asStateFlow()
    
    init {
        loadAnalyticsData()
    }
    
    fun loadAnalyticsData() {
        viewModelScope.launch {
            _uiState.update { it.copy(isLoading = true, error = null) }
            try {
                // Load performance stats
                val performanceStats = performanceProfiler.getPerformanceStats()
                
                // Load usage stats from stored events
                val usageStats = loadUsageStatsFromEvents()
                
                // Load app events from stored events
                val appEvents = loadAppEventsFromEvents()
                
                _uiState.update { 
                    it.copy(
                        isLoading = false,
                        usageStats = usageStats,
                        performanceStats = performanceStats,
                        appEvents = appEvents
                    ) 
                }
            } catch (e: Exception) {
                _uiState.update { 
                    it.copy(
                        isLoading = false, 
                        error = "Failed to load analytics data: ${e.message}"
                    ) 
                }
            }
        }
    }
    
    fun refreshData() {
        loadAnalyticsData()
    }
    
    private suspend fun loadUsageStatsFromEvents(): UsageStats {
        try {
            val events = analyticsStorage.getAllEvents()
            
            // Calculate comics read
            val comicsRead = events.count { it.eventType == "ComicOpened" }
            
            // Calculate total time reading (simplified calculation)
            val readingEvents = events.filter { it.eventType == "ReadingFinished" }
            val totalTimeReading = readingEvents.sumOf { 
                (it.parameters["session_duration"] as? Number)?.toLong() ?: 0L 
            } / 1000 // Convert to seconds
            
            // Calculate total pages read
            val totalPagesRead = readingEvents.sumOf { 
                (it.parameters["pages_read"] as? Number)?.toInt() ?: 0 
            }
            
            // Get favorite genres (simplified)
            val favoriteGenres = listOf("Action", "Adventure", "Comedy")
            
            // Get most used features
            val featureUsageMap = mutableMapOf<String, Int>()
            events.forEach { event ->
                when (event.eventType) {
                    "OcrStarted" -> featureUsageMap["OCR"] = featureUsageMap.getOrDefault("OCR", 0) + 1
                    "TranslationRequested" -> featureUsageMap["Translation"] = featureUsageMap.getOrDefault("Translation", 0) + 1
                    "ComicOpened" -> featureUsageMap["Bookmarks"] = featureUsageMap.getOrDefault("Bookmarks", 0) + 1
                    "PluginActivated" -> featureUsageMap["Plugins"] = featureUsageMap.getOrDefault("Plugins", 0) + 1
                }
            }
            
            val mostUsedFeatures = featureUsageMap.map { (feature, count) ->
                FeatureUsage(feature, count, System.currentTimeMillis() - (count * 3600000L))
            }.sortedByDescending { it.usageCount }
            
            // Get daily usage (simplified)
            val dailyUsage = events.groupBy { 
                // Group by day (simplified)
                val daysAgo = (System.currentTimeMillis() - it.timestamp) / (24 * 60 * 60 * 1000)
                "2023-06-${(7 - daysAgo).coerceAtLeast(1).toInt()}"
            }.map { (date, dayEvents) ->
                DailyUsage(
                    date = date,
                    minutes = dayEvents.size * 15, // Simplified
                    comicsOpened = dayEvents.count { it.eventType == "ComicOpened" }
                )
            }
            
            return UsageStats(
                totalComicsRead = comicsRead,
                totalTimeReading = totalTimeReading.toInt(),
                totalPagesRead = totalPagesRead,
                favoriteGenres = favoriteGenres,
                mostUsedFeatures = mostUsedFeatures,
                dailyUsage = dailyUsage
            )
        } catch (e: Exception) {
            // Fallback to mock data if there's an error
            return createMockUsageStats()
        }
    }
    
    private suspend fun loadAppEventsFromEvents(): List<AppEvent> {
        try {
            val events = analyticsStorage.getAllEvents()
                .take(20) // Limit to recent events
                .sortedByDescending { it.timestamp }
            
            return events.map { storedEvent ->
                AppEvent(
                    eventName = storedEvent.eventName,
                    timestamp = storedEvent.timestamp,
                    parameters = storedEvent.parameters
                )
            }
        } catch (e: Exception) {
            // Fallback to mock data if there's an error
            return createMockAppEvents()
        }
    }
    
    private fun createMockUsageStats(): UsageStats {
        return UsageStats(
            totalComicsRead = 42,
            totalTimeReading = 1250, // 20 hours 50 minutes
            totalPagesRead = 2156,
            favoriteGenres = listOf("Action", "Adventure", "Comedy"),
            mostUsedFeatures = listOf(
                FeatureUsage("OCR", 127, System.currentTimeMillis() - 3600000),
                FeatureUsage("Translation", 89, System.currentTimeMillis() - 7200000),
                FeatureUsage("Bookmarks", 64, System.currentTimeMillis() - 10800000),
                FeatureUsage("Plugins", 42, System.currentTimeMillis() - 14400000)
            ),
            dailyUsage = listOf(
                DailyUsage("2023-06-01", 45, 3),
                DailyUsage("2023-06-02", 78, 5),
                DailyUsage("2023-06-03", 32, 2),
                DailyUsage("2023-06-04", 95, 7),
                DailyUsage("2023-06-05", 67, 4),
                DailyUsage("2023-06-06", 82, 6),
                DailyUsage("2023-06-07", 55, 3)
            )
        )
    }
    
    private fun createMockAppEvents(): List<AppEvent> {
        return listOf(
            AppEvent("comic_opened", System.currentTimeMillis() - 300000, mapOf("format" to "CBZ")),
            AppEvent("page_turned", System.currentTimeMillis() - 240000, mapOf("page_number" to 15)),
            AppEvent("ocr_started", System.currentTimeMillis() - 180000, mapOf("language" to "ja")),
            AppEvent("translation_requested", System.currentTimeMillis() - 120000, mapOf("from_language" to "ja", "to_language" to "en")),
            AppEvent("plugin_activated", System.currentTimeMillis() - 60000, mapOf("plugin_id" to "night_mode")),
            AppEvent("setting_changed", System.currentTimeMillis() - 30000, mapOf("setting_name" to "theme", "value" to "dark"))
        )
    }
    
    // Crash report functions
    fun loadCrashReports(context: Context) {
        viewModelScope.launch {
            _isCrashReportsLoading.value = true
            try {
                val reports = crashReportingService.getSavedCrashReports(context)
                _crashReports.value = reports
            } catch (e: Exception) {
                // Handle error
            } finally {
                _isCrashReportsLoading.value = false
            }
        }
    }
    
    fun selectCrashReport(report: CrashReport) {
        _selectedCrashReport.value = report
    }
    
    fun clearSelectedCrashReport() {
        _selectedCrashReport.value = null
    }
    
    fun deleteCrashReport(context: Context, report: CrashReport) {
        viewModelScope.launch {
            val success = crashReportingService.deleteCrashReport(context, report.id)
            if (success) {
                // Reload the list
                loadCrashReports(context)
            }
        }
    }
    
    fun clearAllCrashReports(context: Context) {
        viewModelScope.launch {
            crashReportingService.clearAllCrashReports(context)
            // Reload the list
            loadCrashReports(context)
        }
    }
    
    /**
     * Submit a crash report to remote server
     */
    fun submitCrashReport(context: Context, report: CrashReport) {
        viewModelScope.launch {
            crashReportingService.submitCrashReport(context, report)
            // Optionally reload the list to update UI
            loadCrashReports(context)
        }
    }
    
    /**
     * Submit all crash reports to remote server
     */
    fun submitAllCrashReports(context: Context) {
        viewModelScope.launch {
            crashReportingService.submitAllCrashReports(context)
            // Optionally reload the list to update UI
            loadCrashReports(context)
        }
    }
}