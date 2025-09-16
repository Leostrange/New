package com.mrcomic.core.reader

import android.graphics.Bitmap
import android.graphics.BitmapFactory
import android.graphics.pdf.PdfRenderer
import android.os.ParcelFileDescriptor
import com.mrcomic.core.model.ComicPage
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.util.zip.ZipFile
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class ComicPageLoader @Inject constructor() {
    
    suspend fun loadPage(page: ComicPage): Bitmap? = withContext(Dispatchers.IO) {
        when {
            page.imageUrl.startsWith("file://") && page.imageUrl.contains("#") -> {
                loadFromCBZ(page)
            }
            page.imageUrl.startsWith("cbr://") -> {
                loadFromCBR(page)
            }
            page.imageUrl.startsWith("pdf://") -> {
                loadFromPDF(page)
            }
            else -> null
        }
    }
    
    private fun loadFromCBZ(page: ComicPage): Bitmap? {
        return try {
            val parts = page.imageUrl.removePrefix("file://").split("#")
            val zipPath = parts[0]
            val entryName = parts[1]
            
            val zipFile = ZipFile(zipPath)
            val entry = zipFile.getEntry(entryName)
            val inputStream = zipFile.getInputStream(entry)
            
            BitmapFactory.decodeStream(inputStream).also {
                inputStream.close()
                zipFile.close()
            }
        } catch (e: Exception) {
            null
        }
    }
    
    private fun loadFromCBR(page: ComicPage): Bitmap? {
        return try {
            val parts = page.imageUrl.removePrefix("cbr://").split("#")
            val rarPath = parts[0]
            val fileName = parts[1]
            
            val tempFile = File.createTempFile("comic_page", ".jpg")
            val process = ProcessBuilder("unrar", "e", rarPath, fileName, tempFile.parent).start()
            process.waitFor()
            
            if (tempFile.exists()) {
                val bitmap = BitmapFactory.decodeFile(tempFile.absolutePath)
                tempFile.delete()
                bitmap
            } else null
        } catch (e: Exception) {
            null
        }
    }
    
    private fun loadFromPDF(page: ComicPage): Bitmap? {
        return try {
            val parts = page.imageUrl.removePrefix("pdf://").split("#")
            val pdfPath = parts[0]
            val pageIndex = parts[1].toInt()
            
            val pfd = ParcelFileDescriptor.open(File(pdfPath), ParcelFileDescriptor.MODE_READ_ONLY)
            val pdfRenderer = PdfRenderer(pfd)
            val pdfPage = pdfRenderer.openPage(pageIndex)
            
            val bitmap = Bitmap.createBitmap(
                pdfPage.width * 2, 
                pdfPage.height * 2, 
                Bitmap.Config.ARGB_8888
            )
            
            pdfPage.render(bitmap, null, null, PdfRenderer.Page.RENDER_MODE_FOR_DISPLAY)
            
            pdfPage.close()
            pdfRenderer.close()
            pfd.close()
            
            bitmap
        } catch (e: Exception) {
            null
        }
    }
}
