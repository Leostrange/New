package com.example.core.analytics

import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.launch
import java.io.PrintWriter
import java.io.StringWriter
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Service for comprehensive crash reporting
 * Captures uncaught exceptions and sends them to analytics
 */
@Singleton
class CrashReportingService @Inject constructor(
    private val analyticsTracker: AnalyticsTracker
) {
    
    companion object {
        private const val TAG = "CrashReporting"
    }
    
    // Flag to track if we're currently handling a crash to prevent infinite loops
    private var isHandlingCrash = false
    
    /**
     * Initialize crash reporting by setting up the uncaught exception handler
     */
    fun initialize(context: Context) {
        // Set the default uncaught exception handler
        Thread.setDefaultUncaughtExceptionHandler { thread, throwable ->
            // Prevent infinite loops
            if (isHandlingCrash) {
                Thread.getDefaultUncaughtExceptionHandler()?.uncaughtException(thread, throwable)
                return@setDefaultUncaughtExceptionHandler
            }
            
            isHandlingCrash = true
            
            // Log the crash
            Log.e(TAG, "Uncaught exception in thread ${thread.name}", throwable)
            
            // Track the crash event
            trackCrash(throwable, context)
            
            // Save crash information to a file for potential recovery
            saveCrashToFile(context, throwable)
            
            // Allow the default handler to process the crash (usually terminates the app)
            Thread.getDefaultUncaughtExceptionHandler()?.uncaughtException(thread, throwable)
        }
        
        Log.d(TAG, "Crash reporting initialized")
    }
    
    /**
     * Track a crash event with detailed information
     */
    private fun trackCrash(throwable: Throwable, context: Context) {
        try {
            val stackTraceWriter = StringWriter()
            throwable.printStackTrace(PrintWriter(stackTraceWriter))
            
            // Get device information
            val deviceInfo = getDeviceInfo(context)
            
            val crashEvent = AnalyticsEvent.Error(
                errorType = throwable.javaClass.simpleName,
                errorMessage = throwable.message ?: "Unknown error",
                stackTrace = stackTraceWriter.toString()
            )
            
            // Add device information to the error event
            val extendedParameters = crashEvent.parameters.toMutableMap().apply {
                putAll(deviceInfo)
            }
            
            val extendedErrorEvent = AnalyticsEvent.Error(
                errorType = crashEvent.parameters["error_type"] as String,
                errorMessage = crashEvent.parameters["error_message"] as String,
                stackTrace = crashEvent.parameters["stack_trace"] as String?
            ).copy(
                parameters = extendedParameters
            )
            
            // Track the crash event
            CoroutineScope(Dispatchers.IO + SupervisorJob()).launch {
                try {
                    analyticsTracker.trackEvent(extendedErrorEvent)
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to track crash event: ${e.message}")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to process crash: ${e.message}")
        }
    }
    
    /**
     * Get device information for crash reporting
     */
    private fun getDeviceInfo(context: Context): Map<String, String> {
        return buildMap {
            try {
                // App information
                put("app_version", getAppVersion(context))
                put("app_version_code", getAppVersionCode(context).toString())
                
                // Device information
                put("device_model", Build.MODEL)
                put("device_manufacturer", Build.MANUFACTURER)
                put("android_version", Build.VERSION.RELEASE)
                put("android_sdk", Build.VERSION.SDK_INT.toString())
                put("device_brand", Build.BRAND)
                put("device_product", Build.PRODUCT)
                
                // Screen information
                val displayMetrics = context.resources.displayMetrics
                put("screen_width", displayMetrics.widthPixels.toString())
                put("screen_height", displayMetrics.heightPixels.toString())
                put("screen_density", displayMetrics.density.toString())
                
                // Memory information
                val runtime = Runtime.getRuntime()
                val maxMemory = runtime.maxMemory()
                val totalMemory = runtime.totalMemory()
                val freeMemory = runtime.freeMemory()
                val usedMemory = totalMemory - freeMemory
                
                put("max_memory_mb", (maxMemory / 1024 / 1024).toString())
                put("total_memory_mb", (totalMemory / 1024 / 1024).toString())
                put("used_memory_mb", (usedMemory / 1024 / 1024).toString())
                put("free_memory_mb", (freeMemory / 1024 / 1024).toString())
            } catch (e: Exception) {
                Log.w(TAG, "Failed to get device info: ${e.message}")
            }
        }
    }
    
    /**
     * Get app version name
     */
    private fun getAppVersion(context: Context): String {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            packageInfo.versionName ?: "Unknown"
        } catch (e: PackageManager.NameNotFoundException) {
            "Unknown"
        }
    }
    
    /**
     * Get app version code
     */
    private fun getAppVersionCode(context: Context): Long {
        return try {
            val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                packageInfo.longVersionCode
            } else {
                @Suppress("DEPRECATION")
                packageInfo.versionCode.toLong()
            }
        } catch (e: PackageManager.NameNotFoundException) {
            0L
        }
    }
    
    /**
     * Save crash information to a file for potential recovery
     */
    private fun saveCrashToFile(context: Context, throwable: Throwable) {
        try {
            val crashInfo = buildString {
                append("Timestamp: ${System.currentTimeMillis()}\n")
                append("App Version: ${getAppVersion(context)} (${getAppVersionCode(context)})\n")
                append("Device: ${Build.MANUFACTURER} ${Build.MODEL}\n")
                append("Android: ${Build.VERSION.RELEASE} (SDK ${Build.VERSION.SDK_INT})\n")
                append("Exception: ${throwable.javaClass.simpleName}\n")
                append("Message: ${throwable.message}\n")
                append("Stack trace:\n")
                val stackTraceWriter = StringWriter()
                throwable.printStackTrace(PrintWriter(stackTraceWriter))
                append(stackTraceWriter.toString())
            }
            
            // Save to a file in the app's private directory
            val crashFile = java.io.File(context.filesDir, "crash_report_${System.currentTimeMillis()}.txt")
            crashFile.writeText(crashInfo)
            
            Log.d(TAG, "Crash report saved to ${crashFile.absolutePath}")
        } catch (e: Exception) {
            Log.w(TAG, "Failed to save crash report to file: ${e.message}")
        }
    }
    
    /**
     * Manually report an error (for caught exceptions)
     */
    fun reportError(errorType: String, errorMessage: String, throwable: Throwable? = null, context: Context? = null) {
        try {
            val stackTrace = throwable?.let {
                val stackTraceWriter = StringWriter()
                it.printStackTrace(PrintWriter(stackTraceWriter))
                stackTraceWriter.toString()
            }
            
            val errorEvent = AnalyticsEvent.Error(
                errorType = errorType,
                errorMessage = errorMessage,
                stackTrace = stackTrace
            )
            
            // Add device information if context is available
            val extendedErrorEvent = if (context != null) {
                val deviceInfo = getDeviceInfo(context)
                val extendedParameters = errorEvent.parameters.toMutableMap().apply {
                    putAll(deviceInfo)
                }
                errorEvent.copy(parameters = extendedParameters)
            } else {
                errorEvent
            }
            
            // Track the error event
            CoroutineScope(Dispatchers.IO + SupervisorJob()).launch {
                try {
                    analyticsTracker.trackEvent(extendedErrorEvent)
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to track error event: ${e.message}")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to report error: ${e.message}")
        }
    }
    
    /**
     * Get all saved crash reports
     */
    fun getSavedCrashReports(context: Context): List<CrashReport> {
        return try {
            val filesDir = context.filesDir
            val crashFiles = filesDir.listFiles { file ->
                file.name.startsWith("crash_report_") && file.name.endsWith(".txt")
            } ?: emptyArray()
            
            crashFiles.mapNotNull { file ->
                try {
                    val content = file.readText()
                    val lines = content.lines()
                    
                    if (lines.isNotEmpty()) {
                        val timestampLine = lines.firstOrNull { it.startsWith("Timestamp:") }
                        val timestamp = timestampLine?.substringAfter("Timestamp: ")?.toLongOrNull() ?: file.lastModified()
                        
                        CrashReport(
                            id = file.name,
                            timestamp = timestamp,
                            content = content,
                            fileName = file.name
                        )
                    } else {
                        null
                    }
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to read crash report ${file.name}: ${e.message}")
                    null
                }
            }.sortedByDescending { it.timestamp }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to get crash reports: ${e.message}")
            emptyList()
        }
    }
    
    /**
     * Delete a specific crash report
     */
    fun deleteCrashReport(context: Context, reportId: String): Boolean {
        return try {
            val file = java.io.File(context.filesDir, reportId)
            if (file.exists()) {
                file.delete()
            } else {
                false
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to delete crash report $reportId: ${e.message}")
            false
        }
    }
    
    /**
     * Clear all crash reports
     */
    fun clearAllCrashReports(context: Context) {
        try {
            val filesDir = context.filesDir
            val crashFiles = filesDir.listFiles { file ->
                file.name.startsWith("crash_report_") && file.name.endsWith(".txt")
            } ?: emptyArray()
            
            crashFiles.forEach { file ->
                try {
                    file.delete()
                } catch (e: Exception) {
                    Log.w(TAG, "Failed to delete crash report ${file.name}: ${e.message}")
                }
            }
        } catch (e: Exception) {
            Log.w(TAG, "Failed to clear crash reports: ${e.message}")
        }
    }
    
    /**
     * Submit crash report to remote server
     * This is a placeholder implementation - in a real app, this would send the report to a backend service
     */
    fun submitCrashReport(context: Context, report: CrashReport, includeDeviceInfo: Boolean = true) {
        CoroutineScope(Dispatchers.IO + SupervisorJob()).launch {
            try {
                // In a real implementation, this would send the crash report to a backend service
                // For now, we'll just log that we would submit the report
                Log.d(TAG, "Would submit crash report: ${report.fileName}")
                
                // If we were to implement this, it might look something like:
                // val client = HttpClient()
                // val requestBody = buildCrashReportJson(report, context, includeDeviceInfo)
                // client.post("https://your-backend.com/api/crash-reports") {
                //     contentType(ContentType.Application.Json)
                //     setBody(requestBody)
                // }
                
                // For now, we'll just log that the report would be submitted
                Log.i(TAG, "Crash report submission simulated successfully")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to submit crash report: ${e.message}")
            }
        }
    }
    
    /**
     * Submit all crash reports to remote server
     */
    fun submitAllCrashReports(context: Context) {
        CoroutineScope(Dispatchers.IO + SupervisorJob()).launch {
            try {
                val reports = getSavedCrashReports(context)
                Log.d(TAG, "Submitting ${reports.size} crash reports")
                
                reports.forEach { report ->
                    submitCrashReport(context, report)
                }
                
                Log.i(TAG, "Submitted ${reports.size} crash reports")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to submit crash reports: ${e.message}")
            }
        }
    }
}

/**
 * Data class representing a saved crash report
 */
data class CrashReport(
    val id: String,
    val timestamp: Long,
    val content: String,
    val fileName: String
)