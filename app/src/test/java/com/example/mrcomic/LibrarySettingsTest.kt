package com.example.mrcomic

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import com.example.mrcomic.data.DisplayMode
import com.example.mrcomic.data.LibrarySettings
import com.example.mrcomic.data.LibrarySettingsManager
import com.example.mrcomic.data.SortOrder
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking
import org.junit.Assert.assertEquals
import org.junit.Test

class LibrarySettingsTest {
    @Test
    fun saveAndGetLibrarySettings() = runBlocking {
        val context = ApplicationProvider.getApplicationContext<Context>()
        val settings = LibrarySettings(displayMode = DisplayMode.LIST, sortOrder = SortOrder.AUTHOR)
        LibrarySettingsManager.saveLibrarySettings(context, settings)
        val loaded = LibrarySettingsManager.getLibrarySettings(context).first()
        assertEquals(DisplayMode.LIST, loaded.displayMode)
        assertEquals(SortOrder.AUTHOR, loaded.sortOrder)
    }
} 