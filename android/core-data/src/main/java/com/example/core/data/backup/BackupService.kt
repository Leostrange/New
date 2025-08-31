package com.example.core.data.backup

import android.content.Context
import android.net.Uri
import com.example.core.data.database.AppDatabase
import com.example.core.data.database.BookmarkEntity
import com.example.core.data.database.ComicEntity
import com.example.core.data.database.plugins.PluginEntity
import com.example.core.data.reader.ReaderStateEntity
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import dagger.hilt.android.qualifiers.ApplicationContext
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.io.File
import java.io.FileInputStream
import java.io.FileOutputStream
import java.text.SimpleDateFormat
import java.util.*
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream
import java.util.zip.ZipOutputStream
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Service for backing up and restoring app data
 */
@Singleton
class BackupService @Inject constructor(
    @ApplicationContext private val context: Context,
    private val database: AppDatabase,
    private val gson: Gson
) {

    private val dateFormat = SimpleDateFormat("yyyy-MM-dd_HH-mm-ss", Locale.getDefault())

    /**
     * Create a backup of all app data
     */
    suspend fun createBackup(outputUri: Uri): Result<String> = withContext(Dispatchers.IO) {
        try {
            val backupData = BackupData(
                version = BACKUP_VERSION,
                timestamp = System.currentTimeMillis(),
                comics = database.comicDao().getAllComics(),
                bookmarks = database.comicDao().getAllBookmarks(),
                plugins = database.pluginDao().getAllPluginsSync(),
                readerStates = database.readerStateDao().getAllStates(),
                preferences = getPreferences()
            )

            val backupJson = gson.toJson(backupData)
            val tempFile = File(context.cacheDir, "backup_temp.zip")

            ZipOutputStream(FileOutputStream(tempFile)).use { zipOut ->
                // Add backup data
                val dataEntry = ZipEntry("backup.json")
                zipOut.putNextEntry(dataEntry)
                zipOut.write(backupJson.toByteArray())
                zipOut.closeEntry()

                // Add any additional files (covers, etc.)
                addCoversToBackup(zipOut, backupData.comics)
            }

            // Copy to the output URI
            context.contentResolver.openOutputStream(outputUri)?.use { outputStream ->
                FileInputStream(tempFile).use { inputStream ->
                    inputStream.copyTo(outputStream)
                }
            }

            tempFile.delete()
            val fileName = "mrcomic_backup_${dateFormat.format(Date())}.zip"
            Result.success(fileName)

        } catch (e: Exception) {
            Result.failure(Exception("Backup failed: ${e.message}", e))
        }
    }

    /**
     * Restore app data from backup
     */
    suspend fun restoreBackup(inputUri: Uri): Result<Unit> = withContext(Dispatchers.IO) {
        try {
            val tempFile = File(context.cacheDir, "restore_temp.zip")
            
            // Copy input to temp file
            context.contentResolver.openInputStream(inputUri)?.use { inputStream ->
                FileOutputStream(tempFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                }
            }

            var backupData: BackupData? = null

            ZipInputStream(FileInputStream(tempFile)).use { zipIn ->
                var entry = zipIn.nextEntry
                while (entry != null) {
                    when (entry.name) {
                        "backup.json" -> {
                            val json = zipIn.readBytes().toString(Charsets.UTF_8)
                            backupData = gson.fromJson(json, BackupData::class.java)
                        }
                        // Handle cover files
                        else -> {
                            if (entry.name.startsWith("covers/")) {
                                restoreCoverFile(zipIn, entry.name)
                            }
                        }
                    }
                    zipIn.closeEntry()
                    entry = zipIn.nextEntry
                }
            }

            tempFile.delete()

            backupData?.let { data ->
                if (data.version > BACKUP_VERSION) {
                    return@withContext Result.failure(Exception("Backup version ${data.version} is not supported. Please update the app."))
                }

                // Clear existing data
                database.clearAllTables()

                // Restore data
                database.comicDao().insertComics(data.comics)
                database.comicDao().insertBookmarks(data.bookmarks)
                database.pluginDao().insertPlugins(data.plugins)
                database.readerStateDao().insertStates(data.readerStates)
                
                // Restore preferences
                restorePreferences(data.preferences)

                Result.success(Unit)
            } ?: Result.failure(Exception("Invalid backup file"))

        } catch (e: Exception) {
            Result.failure(Exception("Restore failed: ${e.message}", e))
        }
    }

    /**
     * Get backup metadata without restoring
     */
    suspend fun getBackupInfo(inputUri: Uri): Result<BackupInfo> = withContext(Dispatchers.IO) {
        try {
            val tempFile = File(context.cacheDir, "info_temp.zip")
            
            context.contentResolver.openInputStream(inputUri)?.use { inputStream ->
                FileOutputStream(tempFile).use { outputStream ->
                    inputStream.copyTo(outputStream)
                }
            }

            var backupInfo: BackupInfo? = null

            ZipInputStream(FileInputStream(tempFile)).use { zipIn ->
                var entry = zipIn.nextEntry
                while (entry != null) {
                    if (entry.name == "backup.json") {
                        val json = zipIn.readBytes().toString(Charsets.UTF_8)
                        val backupData = gson.fromJson(json, BackupData::class.java)
                        
                        backupInfo = BackupInfo(
                            version = backupData.version,
                            timestamp = backupData.timestamp,
                            comicsCount = backupData.comics.size,
                            bookmarksCount = backupData.bookmarks.size,
                            pluginsCount = backupData.plugins.size
                        )
                        break
                    }
                    zipIn.closeEntry()
                    entry = zipIn.nextEntry
                }
            }

            tempFile.delete()
            
            backupInfo?.let { Result.success(it) } 
                ?: Result.failure(Exception("Invalid backup file"))

        } catch (e: Exception) {
            Result.failure(Exception("Failed to read backup info: ${e.message}", e))
        }
    }

    private suspend fun addCoversToBackup(zipOut: ZipOutputStream, comics: List<ComicEntity>) {
        comics.forEach { comic ->
            comic.coverPath?.let { coverPath ->
                val coverFile = File(coverPath)
                if (coverFile.exists()) {
                    try {
                        val entry = ZipEntry("covers/${coverFile.name}")
                        zipOut.putNextEntry(entry)
                        FileInputStream(coverFile).use { fileInput ->
                            fileInput.copyTo(zipOut)
                        }
                        zipOut.closeEntry()
                    } catch (e: Exception) {
                        // Log error but continue
                    }
                }
            }
        }
    }

    private fun restoreCoverFile(zipIn: ZipInputStream, entryName: String) {
        try {
            val fileName = entryName.substringAfterLast("/")
            val coversDir = File(context.filesDir, "covers")
            if (!coversDir.exists()) coversDir.mkdirs()
            
            val coverFile = File(coversDir, fileName)
            FileOutputStream(coverFile).use { output ->
                zipIn.copyTo(output)
            }
        } catch (e: Exception) {
            // Log error but continue
        }
    }

    private fun getPreferences(): Map<String, Any> {
        val preferences = context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
        return preferences.all
    }

    private fun restorePreferences(preferences: Map<String, Any>) {
        val sharedPrefs = context.getSharedPreferences("app_preferences", Context.MODE_PRIVATE)
        val editor = sharedPrefs.edit()
        
        preferences.forEach { (key, value) ->
            when (value) {
                is String -> editor.putString(key, value)
                is Int -> editor.putInt(key, value)
                is Long -> editor.putLong(key, value)
                is Float -> editor.putFloat(key, value)
                is Boolean -> editor.putBoolean(key, value)
            }
        }
        
        editor.apply()
    }

    companion object {
        private const val BACKUP_VERSION = 1
    }
}

/**
 * Backup data structure
 */
data class BackupData(
    val version: Int,
    val timestamp: Long,
    val comics: List<ComicEntity>,
    val bookmarks: List<BookmarkEntity>,
    val plugins: List<PluginEntity>,
    val readerStates: List<ReaderStateEntity>,
    val preferences: Map<String, Any>
)

/**
 * Backup information for preview
 */
data class BackupInfo(
    val version: Int,
    val timestamp: Long,
    val comicsCount: Int,
    val bookmarksCount: Int,
    val pluginsCount: Int
) {
    val formattedDate: String
        get() = SimpleDateFormat("MMM dd, yyyy HH:mm", Locale.getDefault()).format(Date(timestamp))
}