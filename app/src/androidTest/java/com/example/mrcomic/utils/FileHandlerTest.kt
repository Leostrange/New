package com.example.mrcomic.utils

import android.content.Context
import androidx.test.core.app.ApplicationProvider
import org.junit.Before
import org.junit.Test
import java.io.File
import kotlin.test.assertEquals
import kotlin.test.assertTrue

class FileHandlerTest {
    private lateinit var context: Context
    private lateinit var testDir: File

    @Before
    fun setup() {
        context = ApplicationProvider.getApplicationContext()
        testDir = context.getDir("testFiles", Context.MODE_PRIVATE)
        // Копировать тестовые файлы (cbz, pdf, protected_pdf) в testDir
    }

    @Test
    fun testValidCbzFile() {
        val cbzFile = File(testDir, "valid_comic.cbz")
        val result = FileHandler.openFile(context, cbzFile.absolutePath)
        assertTrue(result is FileOpenResult.Success)
        assertEquals(FileType.CBZ, (result as FileOpenResult.Success).type)
    }

    @Test
    fun testPasswordProtectedPdf() {
        val pdfFile = File(testDir, "protected_comic.pdf")
        val result = FileHandler.openFile(context, pdfFile.absolutePath, password = null)
        assertTrue(result is FileOpenResult.Error)
        assertEquals(ErrorCode.PASSWORD_REQUIRED, (result as FileOpenResult.Error).code)

        val resultWithPassword = FileHandler.openFile(context, pdfFile.absolutePath, password = "correct_password")
        assertTrue(resultWithPassword is FileOpenResult.Success)
        assertEquals(FileType.PDF, (resultWithPassword as FileOpenResult.Success).type)
    }

    @Test
    fun testCorruptedFile() {
        val corruptedFile = File(testDir, "corrupted_comic.cbz")
        val result = FileHandler.openFile(context, corruptedFile.absolutePath)
        assertTrue(result is FileOpenResult.Error)
        assertEquals(ErrorCode.CORRUPTED_FILE, (result as FileOpenResult.Error).code)
    }
}

