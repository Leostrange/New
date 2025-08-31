package com.example.core.crash.di

import android.content.Context
import com.example.core.crash.CrashReporter
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object CrashModule {
    
    @Provides
    @Singleton
    fun provideCrashReporter(
        @ApplicationContext context: Context
    ): CrashReporter {
        return CrashReporter(context)
    }
}