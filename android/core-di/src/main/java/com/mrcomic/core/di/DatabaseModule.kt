package com.mrcomic.core.di

import android.content.Context
import androidx.room.Room
import com.mrcomic.core.database.MrComicDatabase
import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.database.dao.UserPreferencesDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): MrComicDatabase {
        return Room.databaseBuilder(
            context,
            MrComicDatabase::class.java,
            "mrcomic_database"
        ).build()
    }

    @Provides
    fun provideComicDao(database: MrComicDatabase): ComicDao = database.comicDao()

    @Provides
    fun provideUserPreferencesDao(database: MrComicDatabase): UserPreferencesDao = database.userPreferencesDao()
}
