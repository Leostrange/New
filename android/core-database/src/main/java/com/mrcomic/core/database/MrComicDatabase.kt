package com.mrcomic.core.database

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.database.dao.UserPreferencesDao
import com.mrcomic.core.database.entity.ComicEntity
import com.mrcomic.core.database.entity.UserPreferencesEntity
import com.mrcomic.core.database.converter.Converters

@Database(
    entities = [
        ComicEntity::class,
        UserPreferencesEntity::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class MrComicDatabase : RoomDatabase() {
    abstract fun comicDao(): ComicDao
    abstract fun userPreferencesDao(): UserPreferencesDao
}
