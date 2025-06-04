package com.example.mrcomic.theme.data.db

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.TypeConverters
import com.example.mrcomic.theme.data.model.*

/**
 * База данных Room для локального хранения данных
 */
@Database(
    entities = [
        Theme::class,
        User::class,
        Rating::class,
        Comment::class,
        Download::class
    ],
    version = 1,
    exportSchema = false
)
@TypeConverters(Converters::class)
abstract class ThemeDatabase : RoomDatabase() {
    abstract fun themeDao(): ThemeDao
    abstract fun userDao(): UserDao
    abstract fun ratingDao(): RatingDao
    abstract fun commentDao(): CommentDao
    abstract fun downloadDao(): DownloadDao
}
