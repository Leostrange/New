package com.example.feature.analytics.ui

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class CrashReportsScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<CrashReportsActivity>()

    @Test
    fun crashReportsScreen_showsTitle() {
        // Verify that the crash reports screen title is displayed
        composeTestRule.onNodeWithText("Crash Reports").assertExists()
    }

    @Test
    fun crashReportsScreen_showsEmptyState() {
        // Verify that the empty state message is displayed when there are no crash reports
        composeTestRule.onNodeWithText("No crash reports found").assertExists()
        composeTestRule.onNodeWithText("Crash reports will appear here when the app encounters unhandled exceptions").assertExists()
    }

    @Test
    fun crashReportsScreen_showsActionButtons() {
        // Verify that the action buttons are displayed
        composeTestRule.onNodeWithText("Submit All").assertExists()
        composeTestRule.onNodeWithText("Refresh").assertExists()
        composeTestRule.onNodeWithText("Clear All").assertExists()
    }

    @Test
    fun crashReportsScreen_backButtonExists() {
        // Verify that the back button is displayed
        composeTestRule.onNodeWithText("Back").assertExists()
    }
}