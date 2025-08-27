package com.example.core.data.database

import androidx.room.AutoMigration
import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.core.data.database.plugins.PluginDao
import com.example.core.data.database.plugins.PluginEntity
import com.example.core.data.reader.ReaderStateEntity
import com.example.core.data.reader.ReaderStateDao

@Database(
    entities = [ComicEntity::class, BookmarkEntity::class, PluginEntity::class, ReaderStateEntity::class],
    version = 5,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun comicDao(): ComicDao
    abstract fun pluginDao(): PluginDao
    abstract fun readerStateDao(): ReaderStateDao
}