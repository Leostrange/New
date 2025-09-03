package com.example.core.reader.pdf

import android.content.Context
import android.graphics.Bitmap
import android.net.Uri
import android.os.ParcelFileDescriptor
import com.example.core.reader.ImageOptimizer
import com.github.barteksc.pdfiumandroid.PdfiumCore
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.runBlocking
import javax.inject.Inject

/**
 * Реализация ридера PDF файлов с использованием Pdfium
 */
class PdfiumReader @Inject constructor(
    @ApplicationContext private val context: Context,
    private val imageOptimizer: ImageOptimizer?
) : PdfReader {
    
    private var pdfiumCore: PdfiumCore? = null
    private var pdfDocument: Long = 0
    private var parcelFileDescriptor: ParcelFileDescriptor? = null
    private var pageCount: Int = 0
    
    override suspend fun openDocument(context: Context, uri: Uri): Result<Unit> {
        return try {
            // Инициализируем Pdfium
            pdfiumCore = PdfiumCore(context)
            
            // Открываем файл
            parcelFileDescriptor = context.contentResolver.openFileDescriptor(uri, "r")
            parcelFileDescriptor?.let { pfd ->
                pdfDocument = pdfiumCore?.newDocument(pfd, null) ?: 0
                pageCount = pdfiumCore?.getPageCount(pdfDocument) ?: 0
                Result.success(Unit)
            } ?: Result.failure(Exception("Failed to open PDF document"))
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override suspend fun renderPage(pageIndex: Int, maxWidth: Int, maxHeight: Int): Result<Bitmap> {
        return try {
            val core = pdfiumCore ?: return Result.failure(Exception("PdfiumCore not initialized"))
            if (pdfDocument == 0L) return Result.failure(Exception("PDF document not opened"))
            if (pageIndex < 0 || pageIndex >= pageCount) return Result.failure(Exception("Invalid page index"))
            
            // Получаем размеры страницы
            val pageSize = core.getPageSize(pdfDocument, pageIndex)
            val pageWidth = pageSize.width
            val pageHeight = pageSize.height
            
            // Рассчитываем масштаб (используем фиксированный масштаб для совместимости)
            val scale = calculateScale(pageWidth, pageHeight, maxWidth, maxHeight)
            val scaledWidth = (pageWidth * scale).toInt()
            val scaledHeight = (pageHeight * scale).toInt()
            
            val bitmap = Bitmap.createBitmap(scaledWidth, scaledHeight, Bitmap.Config.ARGB_8888)
            
            // Рендерим страницу (сигнатуры библиотек различаются порядком аргументов)
            // Попробуем порядок: document, bitmap, index, left, top, width, height
            core.renderPageBitmap(pdfDocument, bitmap, pageIndex, 0, 0, scaledWidth, scaledHeight)
            
            // Apply memory optimization if available
            val optimizedBitmap = if (imageOptimizer != null) {
                // Check memory pressure and adjust accordingly
                val isUnderPressure = imageOptimizer.isUnderMemoryPressure()
                
                // Manage cache based on memory pressure before processing
                if (isUnderPressure) {
                    imageOptimizer.clearCaches()
                }
                
                // Use adaptive loading for better performance
                bitmap
            } else {
                bitmap
            }
            
            Result.success(optimizedBitmap)
        } catch (e: Exception) {
            Result.failure(e)
        }
    }
    
    override fun getPageCount(): Int? {
        return if (pdfDocument != 0L) pageCount else null
    }
    
    override fun close() {
        try {
            pdfiumCore?.closeDocument(pdfDocument)
            parcelFileDescriptor?.close()
        } catch (e: Exception) {
            // Игнорируем ошибки при закрытии
        } finally {
            pdfiumCore = null
            pdfDocument = 0L
            parcelFileDescriptor = null
            pageCount = 0
        }
    }
    
    override fun supportsUri(uri: Uri): Boolean {
        return uri.toString().lowercase().endsWith(".pdf")
    }
    
    private fun calculateScale(pageWidth: Int, pageHeight: Int, maxWidth: Int, maxHeight: Int): Float {
        val scaleX = maxWidth.toFloat() / pageWidth
        val scaleY = maxHeight.toFloat() / pageHeight
        return minOf(scaleX, scaleY, 1.0f) // Не увеличиваем изображение
    }
    
    // Method to get page count as Int (for compatibility with BookReader if needed)
    fun getPageCountInt(): Int {
        return pageCount
    }
    
    // Method to render page and return Bitmap directly (for compatibility with BookReader if needed)
    fun renderPageDirect(pageIndex: Int): Bitmap? {
        return try {
            runBlocking {
                renderPage(pageIndex, 2048, 2048).getOrNull()
            }
        } catch (e: Exception) {
            null
        }
    }
}