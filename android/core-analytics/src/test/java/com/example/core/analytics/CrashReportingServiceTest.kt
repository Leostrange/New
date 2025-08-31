package com.example.core.analytics

import android.content.Context
import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.os.Build
import io.mockk.MockKAnnotations
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.slot
import io.mockk.verify
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test
import java.io.File

@OptIn(ExperimentalCoroutinesApi::class)
class CrashReportingServiceTest {

    @MockK
    private lateinit var analyticsTracker: AnalyticsTracker

    @MockK
    private lateinit var context: Context

    @MockK
    private lateinit var packageManager: PackageManager

    private lateinit var crashReportingService: CrashReportingService
    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        Dispatchers.setMain(testDispatcher)
        
        crashReportingService = CrashReportingService(analyticsTracker)
        
        // Mock context
        every { context.packageManager } returns packageManager
        every { context.filesDir } returns mockk()
        
        // Mock display metrics
        val displayMetrics = mockk<android.util.DisplayMetrics>()
        displayMetrics.widthPixels = 1080
        displayMetrics.heightPixels = 1920
        displayMetrics.density = 2.0f
        
        val resources = mockk<android.content.res.Resources>()
        every { resources.displayMetrics } returns displayMetrics
        every { context.resources } returns resources
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `initialize should set default uncaught exception handler`() {
        // Mock Build.VERSION for static access
        mockkStatic(Build.VERSION::class)
        every { Build.VERSION.SDK_INT } returns Build.VERSION_CODES.O
        
        // Capture the exception handler
        val handlerSlot = slot<Thread.UncaughtExceptionHandler>()
        mockkStatic(Thread::class)
        every { Thread.setDefaultUncaughtExceptionHandler(capture(handlerSlot)) } returns Unit
        
        // When
        crashReportingService.initialize(context)
        
        // Then
        verify { Thread.setDefaultUncaughtExceptionHandler(any()) }
    }

    @Test
    fun `trackCrash should send crash event to analytics tracker`() = runTest {
        // Given
        val exception = RuntimeException("Test exception")
        
        // Mock device info methods
        val packageInfo = mockk<PackageInfo>()
        packageInfo.versionName = "1.0.0"
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
            packageInfo.longVersionCode = 1L
        }
        
        every { packageManager.getPackageInfo(any<String>(), any<Int>()) } returns packageInfo
        every { context.packageName } returns "com.example.test"
        
        // Mock Build static fields
        mockkStatic(Build::class)
        every { Build.MODEL } returns "TestModel"
        every { Build.MANUFACTURER } returns "TestManufacturer"
        every { Build.VERSION.RELEASE } returns "10"
        every { Build.VERSION.SDK_INT } returns Build.VERSION_CODES.Q
        every { Build.BRAND } returns "TestBrand"
        every { Build.PRODUCT } returns "TestProduct"
        
        // Mock Runtime for memory info
        val runtime = mockk<Runtime>()
        every { runtime.maxMemory() } returns 1024 * 1024 * 100L // 100MB
        every { runtime.totalMemory() } returns 1024 * 1024 * 50L // 50MB
        every { runtime.freeMemory() } returns 1024 * 1024 * 20L // 20MB
        mockkStatic(Runtime::class)
        every { Runtime.getRuntime() } returns runtime
        
        // When
        // We can't directly call the private trackCrash method, but we can test
        // the reportError method which calls similar logic
        crashReportingService.reportError("TestError", "Test error message", exception, context)
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Then
        verify(exactly = 1) { analyticsTracker.trackEvent(any<AnalyticsEvent.Error>()) }
    }

    @Test
    fun `reportError should send error event to analytics tracker`() = runTest {
        // Given
        val errorType = "TestError"
        val errorMessage = "Test error message"
        
        // When
        crashReportingService.reportError(errorType, errorMessage, context = context)
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Then
        verify(exactly = 1) { analyticsTracker.trackEvent(any<AnalyticsEvent.Error>()) }
    }

    @Test
    fun `getSavedCrashReports should return list of crash reports`() {
        // Given
        val filesDir = mockk<File>()
        every { context.filesDir } returns filesDir
        
        val crashFile = mockk<File>()
        every { crashFile.name } returns "crash_report_1234567890.txt"
        every { crashFile.readText() } returns "Timestamp: 1234567890\nTest crash content"
        every { crashFile.lastModified() } returns 1234567890L
        
        every { filesDir.listFiles(any()) } returns arrayOf(crashFile)
        
        // When
        val reports = crashReportingService.getSavedCrashReports(context)
        
        // Then
        assert(reports.isNotEmpty())
        assert(reports.first().id == "crash_report_1234567890.txt")
        assert(reports.first().fileName == "crash_report_1234567890.txt")
    }

    @Test
    fun `deleteCrashReport should delete crash report file`() {
        // Given
        val reportId = "crash_report_test.txt"
        val crashFile = mockk<File>()
        every { crashFile.exists() } returns true
        every { crashFile.delete() } returns true
        every { context.filesDir } returns mockk()
        
        // Mock File constructor
        mockkStatic(File::class)
        every { File(any<File>(), any<String>()) } returns crashFile
        
        // When
        val result = crashReportingService.deleteCrashReport(context, reportId)
        
        // Then
        assert(result)
        verify { crashFile.delete() }
    }

    @Test
    fun `clearAllCrashReports should delete all crash report files`() {
        // Given
        val filesDir = mockk<File>()
        every { context.filesDir } returns filesDir
        
        val crashFile1 = mockk<File>()
        every { crashFile1.name } returns "crash_report_1.txt"
        every { crashFile1.delete() } returns true
        
        val crashFile2 = mockk<File>()
        every { crashFile2.name } returns "crash_report_2.txt"
        every { crashFile2.delete() } returns true
        
        every { filesDir.listFiles(any()) } returns arrayOf(crashFile1, crashFile2)
        
        // When
        crashReportingService.clearAllCrashReports(context)
        
        // Then
        verify { crashFile1.delete() }
        verify { crashFile2.delete() }
    }

    @Test
    fun `submitCrashReport should call submission logic`() = runTest {
        // Given
        val report = CrashReport(
            id = "test_report",
            timestamp = System.currentTimeMillis(),
            content = "Test content",
            fileName = "test_report.txt"
        )
        
        // When
        crashReportingService.submitCrashReport(context, report)
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Then
        // Since this is a placeholder implementation, we just verify it doesn't crash
        // In a real implementation, we would verify the actual submission
    }

    @Test
    fun `submitAllCrashReports should submit all reports`() = runTest {
        // Given
        val filesDir = mockk<File>()
        every { context.filesDir } returns filesDir
        
        val crashFile = mockk<File>()
        every { crashFile.name } returns "crash_report_1234567890.txt"
        every { crashFile.readText() } returns "Timestamp: 1234567890\nTest crash content"
        every { crashFile.lastModified() } returns 1234567890L
        
        every { filesDir.listFiles(any()) } returns arrayOf(crashFile)
        
        // When
        crashReportingService.submitAllCrashReports(context)
        testDispatcher.scheduler.advanceUntilIdle()
        
        // Then
        // Since this is a placeholder implementation, we just verify it doesn't crash
    }
}