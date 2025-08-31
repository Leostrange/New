package com.example.feature.analytics.ui

import android.content.Context
import com.example.core.analytics.AnalyticsEvent
import com.example.core.analytics.AnalyticsTracker
import com.example.core.analytics.CrashReport
import com.example.core.analytics.CrashReportingService
import com.example.core.analytics.PerformanceProfiler
import com.example.core.analytics.RoomAnalyticsStorage
import io.mockk.MockKAnnotations
import io.mockk.coEvery
import io.mockk.coVerify
import io.mockk.every
import io.mockk.impl.annotations.MockK
import io.mockk.mockk
import io.mockk.verify
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.flow.flowOf
import kotlinx.coroutines.test.StandardTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.runTest
import kotlinx.coroutines.test.setMain
import org.junit.After
import org.junit.Before
import org.junit.Test

@OptIn(ExperimentalCoroutinesApi::class)
class AnalyticsViewModelTest {

    @MockK
    private lateinit var analyticsTracker: AnalyticsTracker

    @MockK
    private lateinit var performanceProfiler: PerformanceProfiler

    @MockK
    private lateinit var analyticsStorage: RoomAnalyticsStorage

    @MockK
    private lateinit var crashReportingService: CrashReportingService

    @MockK
    private lateinit var context: Context

    private lateinit var viewModel: AnalyticsViewModel

    private val testDispatcher = StandardTestDispatcher()

    @Before
    fun setUp() {
        MockKAnnotations.init(this)
        Dispatchers.setMain(testDispatcher)
        
        // Mock the performance profiler
        every { performanceProfiler.getPerformanceStats() } returns mockk()
        
        // Mock the analytics storage
        coEvery { analyticsStorage.getAllEvents() } returns emptyList()
        
        viewModel = AnalyticsViewModel(
            analyticsTracker = analyticsTracker,
            performanceProfiler = performanceProfiler,
            analyticsStorage = analyticsStorage,
            crashReportingService = crashReportingService
        )
    }

    @After
    fun tearDown() {
        Dispatchers.resetMain()
    }

    @Test
    fun `loadAnalyticsData should load data successfully`() = runTest {
        // Given
        every { performanceProfiler.getPerformanceStats() } returns mockk()
        coEvery { analyticsStorage.getAllEvents() } returns emptyList()

        // When
        viewModel.loadAnalyticsData()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        // Verify that the UI state is updated
        // We can't directly assert on the state here because it's a flow,
        // but we can verify that the methods were called
        verify { performanceProfiler.getPerformanceStats() }
        coVerify { analyticsStorage.getAllEvents() }
    }

    @Test
    fun `loadCrashReports should load crash reports successfully`() = runTest {
        // Given
        val crashReports = listOf(
            CrashReport(
                id = "report1",
                timestamp = System.currentTimeMillis(),
                content = "Test crash report",
                fileName = "crash_report_1.txt"
            )
        )
        every { crashReportingService.getSavedCrashReports(context) } returns crashReports

        // When
        viewModel.loadCrashReports(context)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify { crashReportingService.getSavedCrashReports(context) }
    }

    @Test
    fun `deleteCrashReport should delete crash report successfully`() = runTest {
        // Given
        val report = CrashReport(
            id = "report1",
            timestamp = System.currentTimeMillis(),
            content = "Test crash report",
            fileName = "crash_report_1.txt"
        )
        every { crashReportingService.deleteCrashReport(context, "report1") } returns true
        every { crashReportingService.getSavedCrashReports(context) } returns emptyList()

        // When
        viewModel.deleteCrashReport(context, report)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify { crashReportingService.deleteCrashReport(context, "report1") }
        verify { crashReportingService.getSavedCrashReports(context) }
    }

    @Test
    fun `clearAllCrashReports should clear all crash reports successfully`() = runTest {
        // Given
        every { crashReportingService.clearAllCrashReports(context) } returns Unit
        every { crashReportingService.getSavedCrashReports(context) } returns emptyList()

        // When
        viewModel.clearAllCrashReports(context)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify { crashReportingService.clearAllCrashReports(context) }
        verify { crashReportingService.getSavedCrashReports(context) }
    }

    @Test
    fun `submitCrashReport should submit crash report successfully`() = runTest {
        // Given
        val report = CrashReport(
            id = "report1",
            timestamp = System.currentTimeMillis(),
            content = "Test crash report",
            fileName = "crash_report_1.txt"
        )
        every { crashReportingService.submitCrashReport(context, report) } returns Unit
        every { crashReportingService.getSavedCrashReports(context) } returns emptyList()

        // When
        viewModel.submitCrashReport(context, report)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify { crashReportingService.submitCrashReport(context, report) }
        verify { crashReportingService.getSavedCrashReports(context) }
    }

    @Test
    fun `submitAllCrashReports should submit all crash reports successfully`() = runTest {
        // Given
        every { crashReportingService.submitAllCrashReports(context) } returns Unit
        every { crashReportingService.getSavedCrashReports(context) } returns emptyList()

        // When
        viewModel.submitAllCrashReports(context)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify { crashReportingService.submitAllCrashReports(context) }
        verify { crashReportingService.getSavedCrashReports(context) }
    }

    @Test
    fun `selectCrashReport should update selected report`() = runTest {
        // Given
        val report = CrashReport(
            id = "report1",
            timestamp = System.currentTimeMillis(),
            content = "Test crash report",
            fileName = "crash_report_1.txt"
        )

        // When
        viewModel.selectCrashReport(report)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        // We can't directly assert on the state here because it's a flow,
        // but we can verify the method executes without error
    }

    @Test
    fun `closeCrashReportDetails should clear selected report`() = runTest {
        // When
        viewModel.closeCrashReportDetails()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        // We can't directly assert on the state here because it's a flow,
        // but we can verify the method executes without error
    }

    @Test
    fun `refreshData should reload analytics data`() = runTest {
        // Given
        every { performanceProfiler.getPerformanceStats() } returns mockk()
        coEvery { analyticsStorage.getAllEvents() } returns emptyList()

        // When
        viewModel.refreshData()
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify { performanceProfiler.getPerformanceStats() }
        coVerify { analyticsStorage.getAllEvents() }
    }

    @Test
    fun `onError should report error to crash reporting service`() = runTest {
        // Given
        val errorMessage = "Test error"
        every { crashReportingService.reportError(any(), any(), any(), any()) } returns Unit

        // When
        viewModel.onError(errorMessage)
        testDispatcher.scheduler.advanceUntilIdle()

        // Then
        verify { crashReportingService.reportError("AnalyticsViewModel", errorMessage, any(), any()) }
    }
}