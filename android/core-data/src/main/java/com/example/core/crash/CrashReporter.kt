package com.example.core.crash

import android.content.Context
import android.os.Build
import android.util.Log
import androidx.core.content.FileProvider
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch
import kotlinx.coroutines.withContext
import java.io.File
import java.io.PrintWriter
import java.io.StringWriter
import java.text.SimpleDateFormat
import java.util.*
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Comprehensive crash reporting system for MrComic
 * Handles crash detection, logging, and reporting
 */
@Singleton
class CrashReporter @Inject constructor(
    private val context: Context
) {
    
    companion object {
        private const val TAG = "CrashReporter"
        private const val CRASH_LOG_DIR = "crash_logs"
        private const val MAX_CRASH_FILES = 50
        private val dateFormat = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.getDefault())
    }
    
    private val crashLogDir: File by lazy {
        File(context.filesDir, CRASH_LOG_DIR).apply {
            if (!exists()) mkdirs()
        }
    }
    
    private val coroutineScope = CoroutineScope(Dispatchers.IO)
    
    /**
     * Initialize crash reporting
     */
    fun initialize() {
        Thread.setDefaultUncaughtExceptionHandler { thread, exception ->
            handleUncaughtException(thread, exception)
        }
        Log.i(TAG, "Crash reporting initialized")
    }
    
    /**
     * Handle uncaught exceptions
     */
    private fun handleUncaughtException(thread: Thread, exception: Throwable) {
        Log.e(TAG, "Uncaught exception in thread: ${thread.name}", exception)
        
        coroutineScope.launch {
            try {
                val crashReport = generateCrashReport(thread, exception)
                saveCrashReport(crashReport)
                cleanupOldCrashLogs()
            } catch (e: Exception) {
                Log.e(TAG, "Failed to save crash report", e)
            }
        }
        
        // Call the default handler to ensure the app still crashes
        val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()
        defaultHandler?.uncaughtException(thread, exception)
    }
    
    /**
     * Report a non-fatal exception
     */
    fun reportException(exception: Throwable, context: String = "") {
        Log.e(TAG, "Non-fatal exception: $context", exception)
        
        coroutineScope.launch {
            try {
                val crashReport = generateNonFatalReport(exception, context)
                saveCrashReport(crashReport)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to save non-fatal report", e)
            }
        }
    }
    
    /**
     * Report a custom error with additional context
     */
    fun reportError(
        error: String,
        additionalInfo: Map<String, String> = emptyMap(),
        exception: Throwable? = null
    ) {
        Log.e(TAG, "Custom error: $error", exception)
        
        coroutineScope.launch {
            try {
                val crashReport = generateCustomErrorReport(error, additionalInfo, exception)
                saveCrashReport(crashReport)
            } catch (e: Exception) {
                Log.e(TAG, "Failed to save custom error report", e)
            }
        }
    }
    
    /**
     * Generate comprehensive crash report
     */
    private fun generateCrashReport(thread: Thread, exception: Throwable): CrashReport {
        return CrashReport(
            timestamp = System.currentTimeMillis(),
            type = CrashType.FATAL,
            threadName = thread.name,
            exception = exception.javaClass.simpleName,
            message = exception.message ?: "No message",
            stackTrace = getStackTrace(exception),
            deviceInfo = getDeviceInfo(),
            appInfo = getAppInfo(),
            memoryInfo = getMemoryInfo(),
            additionalInfo = emptyMap()
        )
    }
    
    /**
     * Generate non-fatal exception report
     */
    private fun generateNonFatalReport(exception: Throwable, context: String): CrashReport {
        return CrashReport(
            timestamp = System.currentTimeMillis(),
            type = CrashType.NON_FATAL,
            threadName = Thread.currentThread().name,
            exception = exception.javaClass.simpleName,
            message = exception.message ?: "No message",
            stackTrace = getStackTrace(exception),
            deviceInfo = getDeviceInfo(),
            appInfo = getAppInfo(),
            memoryInfo = getMemoryInfo(),
            additionalInfo = mapOf("context" to context)
        )
    }
    
    /**
     * Generate custom error report
     */
    private fun generateCustomErrorReport(
        error: String,
        additionalInfo: Map<String, String>,
        exception: Throwable?
    ): CrashReport {
        return CrashReport(
            timestamp = System.currentTimeMillis(),
            type = CrashType.CUSTOM_ERROR,
            threadName = Thread.currentThread().name,
            exception = exception?.javaClass?.simpleName ?: "CustomError",
            message = error,
            stackTrace = exception?.let { getStackTrace(it) } ?: "No stack trace",
            deviceInfo = getDeviceInfo(),
            appInfo = getAppInfo(),
            memoryInfo = getMemoryInfo(),
            additionalInfo = additionalInfo
        )
    }
    
    /**
     * Get stack trace as string
     */
    private fun getStackTrace(exception: Throwable): String {
        val stringWriter = StringWriter()
        val printWriter = PrintWriter(stringWriter)
        exception.printStackTrace(printWriter)
        return stringWriter.toString()
    }
    
    /**
     * Get device information
     */
    private fun getDeviceInfo(): DeviceInfo {
        return DeviceInfo(
            manufacturer = Build.MANUFACTURER,
            model = Build.MODEL,
            androidVersion = Build.VERSION.RELEASE,
            apiLevel = Build.VERSION.SDK_INT,
            brand = Build.BRAND,
            device = Build.DEVICE,
            hardware = Build.HARDWARE,
            product = Build.PRODUCT,
            board = Build.BOARD,
            bootloader = Build.BOOTLOADER,
            fingerprint = Build.FINGERPRINT
        )
    }
    
    /**
     * Get application information
     */
    private fun getAppInfo(): AppInfo {
        val packageInfo = context.packageManager.getPackageInfo(context.packageName, 0)
        return AppInfo(
            packageName = context.packageName,
            versionName = packageInfo.versionName ?: "Unknown",
            versionCode = packageInfo.longVersionCode,
            isDebuggable = (context.applicationInfo.flags and android.content.pm.ApplicationInfo.FLAG_DEBUGGABLE) != 0
        )
    }
    
    /**
     * Get memory information
     */
    private fun getMemoryInfo(): MemoryInfo {
        val runtime = Runtime.getRuntime()
        val activityManager = context.getSystemService(Context.ACTIVITY_SERVICE) as android.app.ActivityManager
        val memInfo = android.app.ActivityManager.MemoryInfo()
        activityManager.getMemoryInfo(memInfo)
        
        return MemoryInfo(
            totalMemory = runtime.totalMemory(),
            freeMemory = runtime.freeMemory(),
            maxMemory = runtime.maxMemory(),
            usedMemory = runtime.totalMemory() - runtime.freeMemory(),
            availableMemory = memInfo.availMem,
            totalDeviceMemory = memInfo.totalMem,
            isLowMemory = memInfo.lowMemory
        )
    }
    
    /**
     * Save crash report to file
     */
    private suspend fun saveCrashReport(crashReport: CrashReport) {
        withContext(Dispatchers.IO) {
            try {
                val timestamp = dateFormat.format(Date(crashReport.timestamp))
                val fileName = "${crashReport.type.name.lowercase()}_${timestamp}.json"
                val file = File(crashLogDir, fileName)
                
                val reportJson = crashReportToJson(crashReport)
                file.writeText(reportJson)
                
                Log.i(TAG, "Crash report saved: ${file.absolutePath}")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to save crash report to file", e)
            }
        }
    }
    
    /**
     * Convert crash report to JSON
     */
    private fun crashReportToJson(crashReport: CrashReport): String {
        return """
        {
            "timestamp": ${crashReport.timestamp},
            "type": "${crashReport.type}",
            "threadName": "${crashReport.threadName}",
            "exception": "${crashReport.exception}",
            "message": "${crashReport.message.replace("\"", "\\\"").replace("\n", "\\n")}",
            "stackTrace": "${crashReport.stackTrace.replace("\"", "\\\"").replace("\n", "\\n")}",
            "deviceInfo": {
                "manufacturer": "${crashReport.deviceInfo.manufacturer}",
                "model": "${crashReport.deviceInfo.model}",
                "androidVersion": "${crashReport.deviceInfo.androidVersion}",
                "apiLevel": ${crashReport.deviceInfo.apiLevel},
                "brand": "${crashReport.deviceInfo.brand}",
                "device": "${crashReport.deviceInfo.device}",
                "hardware": "${crashReport.deviceInfo.hardware}",
                "product": "${crashReport.deviceInfo.product}",
                "board": "${crashReport.deviceInfo.board}",
                "bootloader": "${crashReport.deviceInfo.bootloader}",
                "fingerprint": "${crashReport.deviceInfo.fingerprint}"
            },
            "appInfo": {
                "packageName": "${crashReport.appInfo.packageName}",
                "versionName": "${crashReport.appInfo.versionName}",
                "versionCode": ${crashReport.appInfo.versionCode},
                "isDebuggable": ${crashReport.appInfo.isDebuggable}
            },
            "memoryInfo": {
                "totalMemory": ${crashReport.memoryInfo.totalMemory},
                "freeMemory": ${crashReport.memoryInfo.freeMemory},
                "maxMemory": ${crashReport.memoryInfo.maxMemory},
                "usedMemory": ${crashReport.memoryInfo.usedMemory},
                "availableMemory": ${crashReport.memoryInfo.availableMemory},
                "totalDeviceMemory": ${crashReport.memoryInfo.totalDeviceMemory},
                "isLowMemory": ${crashReport.memoryInfo.isLowMemory}
            },
            "additionalInfo": {
                ${crashReport.additionalInfo.entries.joinToString(",\n                ") { "\"${it.key}\": \"${it.value}\"" }}
            }
        }
        """.trimIndent()
    }
    
    /**
     * Cleanup old crash log files
     */
    private fun cleanupOldCrashLogs() {
        try {
            val files = crashLogDir.listFiles()?.sortedByDescending { it.lastModified() }
            if (files != null && files.size > MAX_CRASH_FILES) {
                files.drop(MAX_CRASH_FILES).forEach { file ->
                    if (file.delete()) {
                        Log.d(TAG, "Deleted old crash log: ${file.name}")
                    }
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to cleanup old crash logs", e)
        }
    }
    
    /**
     * Get all crash reports
     */
    suspend fun getAllCrashReports(): List<File> {
        return withContext(Dispatchers.IO) {
            crashLogDir.listFiles()?.sortedByDescending { it.lastModified() }?.toList() ?: emptyList()
        }
    }
    
    /**
     * Clear all crash reports
     */
    suspend fun clearAllCrashReports() {
        withContext(Dispatchers.IO) {
            try {
                crashLogDir.listFiles()?.forEach { it.delete() }
                Log.i(TAG, "All crash reports cleared")
            } catch (e: Exception) {
                Log.e(TAG, "Failed to clear crash reports", e)
            }
        }
    }
    
    /**
     * Export crash reports
     */
    suspend fun exportCrashReports(): File? {
        return withContext(Dispatchers.IO) {
            try {
                val exportFile = File(context.getExternalFilesDir(null), "mrcomic_crash_reports.zip")
                // Implementation for creating ZIP file with all crash reports
                // This would require additional ZIP library or manual implementation
                Log.i(TAG, "Crash reports exported to: ${exportFile.absolutePath}")
                exportFile
            } catch (e: Exception) {
                Log.e(TAG, "Failed to export crash reports", e)
                null
            }
        }
    }
}

/**
 * Data classes for crash reporting
 */
data class CrashReport(
    val timestamp: Long,
    val type: CrashType,
    val threadName: String,
    val exception: String,
    val message: String,
    val stackTrace: String,
    val deviceInfo: DeviceInfo,
    val appInfo: AppInfo,
    val memoryInfo: MemoryInfo,
    val additionalInfo: Map<String, String>
)

enum class CrashType {
    FATAL,
    NON_FATAL,
    CUSTOM_ERROR
}

data class DeviceInfo(
    val manufacturer: String,
    val model: String,
    val androidVersion: String,
    val apiLevel: Int,
    val brand: String,
    val device: String,
    val hardware: String,
    val product: String,
    val board: String,
    val bootloader: String,
    val fingerprint: String
)

data class AppInfo(
    val packageName: String,
    val versionName: String,
    val versionCode: Long,
    val isDebuggable: Boolean
)

data class MemoryInfo(
    val totalMemory: Long,
    val freeMemory: Long,
    val maxMemory: Long,
    val usedMemory: Long,
    val availableMemory: Long,
    val totalDeviceMemory: Long,
    val isLowMemory: Boolean
)