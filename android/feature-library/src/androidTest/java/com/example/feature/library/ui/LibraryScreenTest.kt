package com.example.feature.library.ui

import androidx.compose.ui.test.junit4.createAndroidComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import androidx.test.ext.junit.runners.AndroidJUnit4
import org.junit.Rule
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class LibraryScreenTest {

    @get:Rule
    val composeTestRule = createAndroidComposeRule<LibraryActivity>()

    @Test
    fun libraryScreen_showsTitle() {
        // Verify that the library screen title is displayed
        composeTestRule.onNodeWithText("Library").assertExists()
    }

    @Test
    fun libraryScreen_showsAddButton() {
        // Verify that the add button is displayed
        composeTestRule.onNodeWithText("Add Comic").assertExists()
    }

    @Test
    fun libraryScreen_showsSettingsButton() {
        // Verify that the settings button is displayed
        composeTestRule.onNodeWithText("Настройки").assertExists()
    }

    @Test
    fun libraryScreen_showsPluginsButton() {
        // Verify that the plugins button is displayed
        composeTestRule.onNodeWithText("Плагины").assertExists()
    }

    @Test
    fun libraryScreen_showsEmptyState() {
        // Verify that the empty state message is displayed
        composeTestRule.onNodeWithText("No comics found").assertExists()
        composeTestRule.onNodeWithText("Add your first comic to get started").assertExists()
    }

    @Test
    fun libraryScreen_addButtonOpensDialog() {
        // Click the add button
        composeTestRule.onNodeWithText("Add Comic").performClick()
        
        // Verify that the add comic dialog is displayed
        composeTestRule.onNodeWithText("Add Comics").assertExists()
        composeTestRule.onNodeWithText("Choose how you want to add comics to your library:").assertExists()
    }

    @Test
    fun libraryScreen_addDialogShowsOptions() {
        // Click the add button
        composeTestRule.onNodeWithText("Add Comic").performClick()
        
        // Verify that all options are displayed
        composeTestRule.onNodeWithText("Pick Single File").assertExists()
        composeTestRule.onNodeWithText("Pick Multiple Files").assertExists()
        composeTestRule.onNodeWithText("Scan Directory").assertExists()
        composeTestRule.onNodeWithText("Add from URL").assertExists()
        composeTestRule.onNodeWithText("Export Library").assertExists()
        composeTestRule.onNodeWithText("Import Library").assertExists()
        composeTestRule.onNodeWithText("Cancel").assertExists()
    }
}