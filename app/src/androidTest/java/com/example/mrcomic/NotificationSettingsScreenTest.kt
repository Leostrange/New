package com.example.mrcomic

import androidx.compose.ui.test.junit4.createComposeRule
import androidx.compose.ui.test.onNodeWithText
import androidx.compose.ui.test.performClick
import com.example.mrcomic.viewmodel.SettingsViewModel
import com.example.mrcomic.ui.NotificationSettingsScreen
import org.junit.Rule
import org.junit.Test

class NotificationSettingsScreenTest {
    @get:Rule
    val composeRule = createComposeRule()

    @Test
    fun testNotificationSwitch() {
        val viewModel = SettingsViewModel(androidx.test.core.app.ApplicationProvider.getApplicationContext())
        composeRule.setContent {
            NotificationSettingsScreen(viewModel = viewModel)
        }
        composeRule.onNodeWithText("Сохранить").performClick()
        assert(viewModel.notificationSettings.value.autoImportNotifications is Boolean)
    }
} 