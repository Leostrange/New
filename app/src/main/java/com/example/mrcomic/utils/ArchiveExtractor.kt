package com.example.mrcomic.utils

import android.content.Context
import android.util.Log
import java.io.*
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.regex.Pattern
import kotlin.collections.ArrayList

/**
 * Универсальный экстрактор архивов для комиксов
 * Поддерживает CBZ, CBR, ZIP, RAR, 7z и вложенные папки
 */
class ArchiveExtractor(private val context: Context) {

    companion object {
        private const val TAG = "ArchiveExtractor"
        
        // Поддерживаемые форматы изображений
        private val IMAGE_EXTENSIONS = setOf(
            "jpg", "jpeg", "png", "gif", "bmp", "webp", "tiff", "tif"
        )
        
        // Поддерживаемые архивные форматы
        private val ARCHIVE_EXTENSIONS = setOf(
            "cbz", "zip", "cbr", "rar", "cb7", "7z", "cbt", "tar"
        )
        
        // Паттерн для сортировки файлов по номерам
        private val NUMBER_PATTERN = Pattern.compile("(\\d+)")
    }

    /**
     * Извлечение изображений из архива
     */
    fun extractImages(archiveFile: File): List<ExtractedImage> {
        val extension = archiveFile.extension.lowercase()
        
        return when (extension) {
            "cbz", "zip" -> extractFromZip(archiveFile)
            "cbr", "rar" -> extractFromRar(archiveFile)
            "cb7", "7z" -> extractFrom7z(archiveFile)
            "cbt", "tar" -> extractFromTar(archiveFile)
            else -> {
                Log.w(TAG, "Unsupported archive format: $extension")
                emptyList()
            }
        }
    }

    /**
     * Извлечение из ZIP/CBZ архивов
     */
    private fun extractFromZip(archiveFile: File): List<ExtractedImage> {
        val images = mutableListOf<ExtractedImage>()
        
        try {
            ZipInputStream(FileInputStream(archiveFile)).use { zipStream ->
                var entry: ZipEntry?
                
                while (zipStream.nextEntry.also { entry = it } != null) {
                    val zipEntry = entry!!
                    
                    if (!zipEntry.isDirectory && isImageFile(zipEntry.name)) {
                        val imageData = zipStream.readBytes()
                        val extractedImage = ExtractedImage(
                            name = getFileName(zipEntry.name),
                            path = zipEntry.name,
                            data = imageData,
                            size = imageData.size.toLong()
                        )
                        images.add(extractedImage)
                        Log.d(TAG, "Extracted image: ${extractedImage.name} (${extractedImage.size} bytes)")
                    }
                    
                    zipStream.closeEntry()
                }
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error extracting ZIP archive: ${archiveFile.name}", e)
        }
        
        return sortImages(images)
    }

    /**
     * Извлечение из RAR/CBR архивов (базовая реализация)
     * Примечание: Для полной поддержки RAR требуется нативная библиотека
     */
    private fun extractFromRar(archiveFile: File): List<ExtractedImage> {
        Log.w(TAG, "RAR extraction not fully implemented - requires native library")
        // TODO: Интегрировать библиотеку для RAR (например, junrar)
        return emptyList()
    }

    /**
     * Извлечение из 7z/CB7 архивов (базовая реализация)
     */
    private fun extractFrom7z(archiveFile: File): List<ExtractedImage> {
        Log.w(TAG, "7z extraction not fully implemented - requires native library")
        // TODO: Интегрировать библиотеку для 7z (например, Apache Commons Compress)
        return emptyList()
    }

    /**
     * Извлечение из TAR/CBT архивов (базовая реализация)
     */
    private fun extractFromTar(archiveFile: File): List<ExtractedImage> {
        Log.w(TAG, "TAR extraction not fully implemented")
        // TODO: Реализовать TAR экстрактор
        return emptyList()
    }

    /**
     * Проверка, является ли файл изображением
     */
    private fun isImageFile(fileName: String): Boolean {
        val extension = File(fileName).extension.lowercase()
        return IMAGE_EXTENSIONS.contains(extension)
    }

    /**
     * Получение имени файла из пути
     */
    private fun getFileName(path: String): String {
        return File(path).name
    }

    /**
     * Сортировка изображений по номерам в имени файла
     */
    private fun sortImages(images: List<ExtractedImage>): List<ExtractedImage> {
        return images.sortedWith { img1, img2 ->
            compareFileNames(img1.name, img2.name)
        }
    }

    /**
     * Сравнение имён файлов с учётом номеров
     */
    private fun compareFileNames(name1: String, name2: String): Int {
        val matcher1 = NUMBER_PATTERN.matcher(name1)
        val matcher2 = NUMBER_PATTERN.matcher(name2)
        
        var pos1 = 0
        var pos2 = 0
        
        while (matcher1.find() && matcher2.find()) {
            // Сравниваем текстовые части
            val text1 = name1.substring(pos1, matcher1.start())
            val text2 = name2.substring(pos2, matcher2.start())
            val textCompare = text1.compareTo(text2, ignoreCase = true)
            
            if (textCompare != 0) return textCompare
            
            // Сравниваем числовые части
            val num1 = matcher1.group(1)!!.toInt()
            val num2 = matcher2.group(1)!!.toInt()
            val numCompare = num1.compareTo(num2)
            
            if (numCompare != 0) return numCompare
            
            pos1 = matcher1.end()
            pos2 = matcher2.end()
        }
        
        // Сравниваем оставшиеся части
        return name1.substring(pos1).compareTo(name2.substring(pos2), ignoreCase = true)
    }

    /**
     * Проверка поддержки формата архива
     */
    fun isArchiveSupported(fileName: String): Boolean {
        val extension = File(fileName).extension.lowercase()
        return ARCHIVE_EXTENSIONS.contains(extension)
    }

    /**
     * Получение информации об архиве
     */
    fun getArchiveInfo(archiveFile: File): ArchiveInfo {
        val extension = archiveFile.extension.lowercase()
        val images = extractImages(archiveFile)
        
        return ArchiveInfo(
            name = archiveFile.name,
            format = extension.uppercase(),
            size = archiveFile.length(),
            imageCount = images.size,
            isSupported = isArchiveSupported(archiveFile.name)
        )
    }

    /**
     * Тестирование Unicode путей
     */
    fun testUnicodePaths(archiveFile: File): TestResult {
        val images = extractImages(archiveFile)
        val unicodeFiles = images.filter { image ->
            image.path.any { char -> char.code > 127 }
        }
        
        return TestResult(
            totalFiles = images.size,
            unicodeFiles = unicodeFiles.size,
            unicodePaths = unicodeFiles.map { it.path },
            success = unicodeFiles.isNotEmpty()
        )
    }

    /**
     * Данные извлечённого изображения
     */
    data class ExtractedImage(
        val name: String,
        val path: String,
        val data: ByteArray,
        val size: Long
    ) {
        override fun equals(other: Any?): Boolean {
            if (this === other) return true
            if (javaClass != other?.javaClass) return false
            other as ExtractedImage
            return name == other.name && path == other.path && size == other.size
        }

        override fun hashCode(): Int {
            var result = name.hashCode()
            result = 31 * result + path.hashCode()
            result = 31 * result + size.hashCode()
            return result
        }
    }

    /**
     * Информация об архиве
     */
    data class ArchiveInfo(
        val name: String,
        val format: String,
        val size: Long,
        val imageCount: Int,
        val isSupported: Boolean
    )

    /**
     * Результат тестирования Unicode путей
     */
    data class TestResult(
        val totalFiles: Int,
        val unicodeFiles: Int,
        val unicodePaths: List<String>,
        val success: Boolean
    )
}

