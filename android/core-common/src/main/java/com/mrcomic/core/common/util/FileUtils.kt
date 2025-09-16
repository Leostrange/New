package com.mrcomic.core.common.util

import android.content.Context
import android.net.Uri
import java.io.File
import java.io.FileOutputStream
import java.io.InputStream
import java.util.zip.ZipInputStream

object FileUtils {
    
    fun getFileExtension(fileName: String): String {
        return fileName.substringAfterLast('.', "").lowercase()
    }
    
    fun isComicFile(fileName: String): Boolean {
        val extension = getFileExtension(fileName)
        return extension in listOf("cbz", "cbr", "pdf", "zip", "rar")
    }
    
    fun extractCoverFromCBZ(file: File): File? {
        try {
            ZipInputStream(file.inputStream()).use { zipStream ->
                var entry = zipStream.nextEntry
                while (entry != null) {
                    if (entry.name.lowercase().matches(Regex(".*\\.(jpg|jpeg|png|webp)$"))) {
                        val coverFile = File(file.parent, "${file.nameWithoutExtension}_cover.jpg")
                        FileOutputStream(coverFile).use { output ->
                            zipStream.copyTo(output)
                        }
                        return coverFile
                    }
                    entry = zipStream.nextEntry
                }
            }
        } catch (e: Exception) {
            e.printStackTrace()
        }
        return null
    }
    
    fun copyUriToFile(context: Context, uri: Uri, destinationFile: File): Boolean {
        return try {
            context.contentResolver.openInputStream(uri)?.use { input ->
                FileOutputStream(destinationFile).use { output ->
                    input.copyTo(output)
                }
            }
            true
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
    
    fun formatFileSize(bytes: Long): String {
        val units = arrayOf("B", "KB", "MB", "GB")
        var size = bytes.toDouble()
        var unitIndex = 0
        
        while (size >= 1024 && unitIndex < units.size - 1) {
            size /= 1024
            unitIndex++
        }
        
        return "%.1f %s".format(size, units[unitIndex])
    }
}
