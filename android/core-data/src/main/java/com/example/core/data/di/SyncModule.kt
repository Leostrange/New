package com.example.core.data.di

import com.example.core.data.sync.ReadingProgressSyncService
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object SyncModule {
    
    @Provides
    @Singleton
    fun provideReadingProgressSyncService(syncService: ReadingProgressSyncService): ReadingProgressSyncService = syncService
}