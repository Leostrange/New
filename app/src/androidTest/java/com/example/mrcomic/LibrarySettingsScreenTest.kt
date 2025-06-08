package com.example.mrcomic

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.example.mrcomic.viewmodel.SettingsViewModel
import com.example.mrcomic.ui.LibrarySettingsScreen
import org.junit.Rule
import org.junit.Test

class LibrarySettingsScreenTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun testDisplayModeSelection() {
        val viewModel = SettingsViewModel(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        composeRule.setContent {
            LibrarySettingsScreen(viewModel = viewModel)
        }
        composeRule.onNodeWithText("LIST").performClick()
        composeRule.onNodeWithText("Сохранить").performClick()
        assert(viewModel.librarySettings.value.displayMode.name == "LIST")
    }
} 