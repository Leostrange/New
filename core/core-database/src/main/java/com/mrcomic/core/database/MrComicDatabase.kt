package com.mrcomic.core.database

import androidx.room.Database
import androidx.room.Room
import androidx.room.RoomDatabase
import androidx.room.migration.Migration
import androidx.sqlite.db.SupportSQLiteDatabase
import android.content.Context
import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.database.dao.OCRDao
import com.mrcomic.core.model.Comic
import com.mrcomic.core.model.OCRResult
import com.mrcomic.core.model.TranslationCache

@Database(
    entities = [
        Comic::class,
        OCRResult::class,
        TranslationCache::class
    ],
    version = 1,
    exportSchema = true
)
abstract class MrComicDatabase : RoomDatabase() {
    
    abstract fun comicDao(): ComicDao
    abstract fun ocrDao(): OCRDao
    
    companion object {
        const val DATABASE_NAME = "mrcomic_database"
        
        @Volatile
        private var INSTANCE: MrComicDatabase? = null
        
        fun getDatabase(context: Context): MrComicDatabase {
            return INSTANCE ?: synchronized(this) {
                val instance = Room.databaseBuilder(
                    context.applicationContext,
                    MrComicDatabase::class.java,
                    DATABASE_NAME
                )
                    .addMigrations(*getAllMigrations())
                    .fallbackToDestructiveMigration() // Only for development
                    .build()
                INSTANCE = instance
                instance
            }
        }
        
        private fun getAllMigrations(): Array<Migration> {
            return arrayOf(
                // Future migrations will be added here
            )
        }
        
        // Example migration for future versions
        private val MIGRATION_1_2 = object : Migration(1, 2) {
            override fun migrate(database: SupportSQLiteDatabase) {
                // Migration logic for version 2
            }
        }
    }
}