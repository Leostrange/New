package com.example.feature.library.di

import com.example.core.data.database.AppDatabase
import com.example.core.data.database.ComicDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent

@Module
@InstallIn(SingletonComponent::class)
object LibraryModule {
    @Provides
    fun provideComicDao(db: AppDatabase): ComicDao = db.comicDao()
}
