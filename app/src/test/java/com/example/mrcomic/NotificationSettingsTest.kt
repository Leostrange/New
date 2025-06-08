package com.example.mrcomic

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.mrcomic.data.NotificationSettings
import com.example.mrcomic.data.NotificationSettingsManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class NotificationSettingsTest {
    @Test
    fun saveAndGetNotificationSettings() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val settings = NotificationSettings(autoImportNotifications = false, readingProgressNotifications = true)
        NotificationSettingsManager.saveNotificationSettings(context, settings)
        val loaded = NotificationSettingsManager.getNotificationSettings(context).first()
        assertEquals(false, loaded.autoImportNotifications)
        assertEquals(true, loaded.readingProgressNotifications)
    }
} 