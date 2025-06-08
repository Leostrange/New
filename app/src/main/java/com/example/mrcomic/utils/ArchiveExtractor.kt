package com.example.mrcomic.utils

import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import org.apache.commons.compress.archivers.sevenz.SevenZFile
// Для rar используйте стороннюю библиотеку или реализуйте через shell

object ArchiveExtractor {
    suspend fun extractArchive(file: File, outputDir: File) = withContext(Dispatchers.IO) {
        when (file.extension.lowercase()) {
            "rar" -> {/* Реализация для RAR (Unrar) */}
            "7z" -> SevenZFile(file).use { sevenZ ->
                // Реализация извлечения файлов из 7z
            }
        }
    }
} 