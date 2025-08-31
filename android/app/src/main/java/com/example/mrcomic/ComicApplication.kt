package com.example.mrcomic

import android.app.Application
import com.example.core.crash.CrashReporter
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

@HiltAndroidApp
class ComicApplication : Application() {
    
    @Inject
    lateinit var crashReporter: CrashReporter
    
    override fun onCreate() {
        super.onCreate()
        
        // Initialize crash reporting
        crashReporter.initialize()
        
        // Log application startup
        android.util.Log.i("ComicApplication", "MrComic application started")
        
        // Report custom event for app startup
        crashReporter.reportError(
            "Application Started",
            mapOf(
                "version" to getVersionInfo(),
                "startup_time" to System.currentTimeMillis().toString()
            )
        )
    }
    
    private fun getVersionInfo(): String {
        return try {
            val packageInfo = packageManager.getPackageInfo(packageName, 0)
            "${packageInfo.versionName} (${packageInfo.longVersionCode})"
        } catch (e: Exception) {
            "Unknown"
        }
    }
} 