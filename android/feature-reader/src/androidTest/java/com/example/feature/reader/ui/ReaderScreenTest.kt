package com.example.feature.reader.ui

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class ReaderScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<ReaderActivity>()

    @Test
    fun readerScreen_showsPageCounter() {
        // Verify that the page counter is displayed
        composeTestRule.onNodeWithText("Page 1 of 10").assertExists()
    }

    @Test
    fun readerScreen_showsBookmarkButton() {
        // Verify that the bookmark button is displayed
        composeTestRule.onNodeWithText("Add bookmark").assertExists()
    }

    @Test
    fun readerScreen_showsReadingModeButton() {
        // Verify that the reading mode toggle button is displayed
        composeTestRule.onNodeWithText("Switch Reading Mode").assertExists()
    }

    @Test
    fun readerScreen_showsBookmarksNotesButton() {
        // Verify that the bookmarks & notes button is displayed
        composeTestRule.onNodeWithText("Notes").assertExists()
    }

    @Test
    fun readerScreen_showsMiniMapFab() {
        // Verify that the mini map FAB is displayed
        composeTestRule.onNodeWithText("Mini Map").assertExists()
    }

    @Test
    fun readerScreen_toggleReadingMode() {
        // Click the reading mode toggle button
        composeTestRule.onNodeWithText("Switch Reading Mode").performClick()
        
        // The reading mode should toggle (implementation detail, but we can at least verify it doesn't crash)
    }

    @Test
    fun readerScreen_openBookmarksNotes() {
        // Click the bookmarks & notes button
        composeTestRule.onNodeWithText("Notes").performClick()
        
        // We can't easily verify the dialog content without more complex setup,
        // but we can at least verify it doesn't crash
    }

    @Test
    fun readerScreen_openMiniMap() {
        // Click the mini map FAB
        composeTestRule.onNodeWithText("Mini Map").performClick()
        
        // We can't easily verify the dialog content without more complex setup,
        // but we can at least verify it doesn't crash
    }
}