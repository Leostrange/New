package com.example.feature.reader.di

import com.example.feature.reader.RoomReaderRepository
import com.example.feature.reader.ReaderRepository
import com.example.core.data.database.AppDatabase
import com.example.core.data.reader.ReaderStateDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object ReaderModule {
    @Provides
    fun provideReaderStateDao(db: AppDatabase): ReaderStateDao = db.readerStateDao()

    @Provides
    @Singleton
    fun provideReaderRepository(dao: ReaderStateDao): ReaderRepository = RoomReaderRepository(dao)
}