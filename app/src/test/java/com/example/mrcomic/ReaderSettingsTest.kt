package com.example.mrcomic

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.mrcomic.data.ColorFilterType
import com.example.mrcomic.data.PageTransition
import com.example.mrcomic.data.ReaderSettings
import com.example.mrcomic.data.ReaderSettingsManager
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class ReaderSettingsTest {
    @Test
    fun saveAndGetReaderSettings() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val settings = ReaderSettings(fontSize = 20, fontStyle = "Serif", brightness = 0.7f, colorFilter = ColorFilterType.SEPIA, pageTransition = PageTransition.FADE)
        ReaderSettingsManager.saveReaderSettings(context, settings)
        val loaded = ReaderSettingsManager.getReaderSettings(context).first()
        assertEquals(20, loaded.fontSize)
        assertEquals("Serif", loaded.fontStyle)
        assertEquals(0.7f, loaded.brightness)
        assertEquals(ColorFilterType.SEPIA, loaded.colorFilter)
        assertEquals(PageTransition.FADE, loaded.pageTransition)
    }
} 