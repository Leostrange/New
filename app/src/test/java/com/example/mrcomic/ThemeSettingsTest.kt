package com.example.mrcomic

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.mrcomic.data.ThemeMode
import com.example.mrcomic.data.ThemeSettings
import com.example.mrcomic.data.ThemeSettingsManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class ThemeSettingsTest {
    @Test
    fun saveAndGetThemeSettings() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val settings = ThemeSettings(themeMode = ThemeMode.DARK, dynamicColors = false, primaryColor = "#FF0000")
        ThemeSettingsManager.saveThemeSettings(context, settings)
        val loaded = ThemeSettingsManager.getThemeSettings(context).first()
        assertEquals(ThemeMode.DARK, loaded.themeMode)
        assertEquals(false, loaded.dynamicColors)
        assertEquals("#FF0000", loaded.primaryColor)
    }
} 