package com.example.mrcomic

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.example.mrcomic.data.ThemeSettings
import com.example.mrcomic.viewmodel.SettingsViewModel
import com.example.mrcomic.ui.ThemeSettingsScreen
import org.junit.Rule
import org.junit.Test

class ThemeSettingsScreenTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun testThemeModeSelection() {
        val viewModel = SettingsViewModel(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        composeRule.setContent {
            ThemeSettingsScreen(viewModel = viewModel)
        }
        composeRule.onNodeWithText("DARK").performClick()
        composeRule.onNodeWithText("Сохранить").performClick()
        // Проверка: ThemeSettings в viewModel должен быть DARK
        assert(viewModel.themeSettings.value.themeMode.name == "DARK")
    }
} 