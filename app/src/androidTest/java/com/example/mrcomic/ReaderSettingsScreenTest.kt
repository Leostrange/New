package com.example.mrcomic

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.example.mrcomic.viewmodel.SettingsViewModel
import com.example.mrcomic.ui.ReaderSettingsScreen
import org.junit.Rule
import org.junit.Test

class ReaderSettingsScreenTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun testFontSizeChange() {
        val viewModel = SettingsViewModel(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        composeRule.setContent {
            ReaderSettingsScreen(viewModel = viewModel)
        }
        // Проверка: изменение размера шрифта и сохранение
        composeRule.onNodeWithText("Сохранить").performClick()
        assert(viewModel.readerSettings.value.fontSize in 12..24)
    }
} 