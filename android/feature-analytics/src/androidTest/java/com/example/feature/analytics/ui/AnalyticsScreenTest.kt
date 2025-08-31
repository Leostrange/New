package com.example.feature.analytics.ui

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class AnalyticsScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<AnalyticsActivity>()

    @Test
    fun analyticsScreen_showsTitle() {
        // Verify that the analytics screen title is displayed
        composeTestRule.onNodeWithText("Analytics Dashboard").assertExists()
    }

    @Test
    fun analyticsScreen_showsRefreshButton() {
        // Verify that the refresh button is displayed
        composeTestRule.onNodeWithText("Refresh").assertExists()
    }

    @Test
    fun analyticsScreen_showsCrashReportsButton() {
        // Verify that the crash reports button is displayed
        composeTestRule.onNodeWithText("Crash Reports").assertExists()
    }

    @Test
    fun analyticsScreen_showsUsageStatistics() {
        // Verify that usage statistics sections are displayed
        composeTestRule.onNodeWithText("Usage Statistics").assertExists()
        composeTestRule.onNodeWithText("Feature Usage").assertExists()
        composeTestRule.onNodeWithText("Daily Usage").assertExists()
    }

    @Test
    fun analyticsScreen_showsAppEvents() {
        // Verify that app events section is displayed
        composeTestRule.onNodeWithText("Recent App Events").assertExists()
    }

    @Test
    fun analyticsScreen_showsPerformanceMetrics() {
        // Verify that performance metrics section is displayed
        composeTestRule.onNodeWithText("Performance Metrics").assertExists()
    }
}