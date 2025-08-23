package com.example.core.data.database

import androidx.room.AutoMigration
import androidx.room.Database
import androidx.room.RoomDatabase
import com.example.feature.plugins.data.local.PluginDao
import com.example.feature.plugins.data.local.PluginEntity

@Database(
    entities = [ComicEntity::class, BookmarkEntity::class, PluginEntity::class],
    version = 4,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun comicDao(): ComicDao
    abstract fun pluginDao(): PluginDao
}