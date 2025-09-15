package com.mrcomic.core.database.di

import android.content.Context
import androidx.room.Room
import com.mrcomic.core.database.MrComicDatabase
import com.mrcomic.core.database.dao.ComicDao
import com.mrcomic.core.database.dao.OCRDao
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
    fun provideMrComicDatabase(
        @ApplicationContext context: Context
    ): MrComicDatabase {
        return Room.databaseBuilder(
            context.applicationContext,
            MrComicDatabase::class.java,
            MrComicDatabase.DATABASE_NAME
        )
            .fallbackToDestructiveMigration()
            .build()
    }
    
    @Provides
    fun provideComicDao(database: MrComicDatabase): ComicDao {
        return database.comicDao()
    }
    
    @Provides
    fun provideOCRDao(database: MrComicDatabase): OCRDao {
        return database.ocrDao()
    }
}