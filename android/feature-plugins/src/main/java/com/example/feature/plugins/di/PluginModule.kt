package com.example.feature.plugins.di

import android.content.Context
import androidx.room.Room
import com.example.core.data.AppDatabase
import com.example.feature.plugins.data.local.PluginDao
import com.example.feature.plugins.data.repository.PluginRepository
import com.example.feature.plugins.domain.*
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object PluginModule {
    
    @Provides
    fun providePluginDao(database: AppDatabase): PluginDao {
        return database.pluginDao()
    }
    
    @Provides
    @Singleton
    fun providePluginManager(
        @ApplicationContext context: Context,
        gson: com.google.gson.Gson,
        pluginSandbox: PluginSandbox,
        permissionManager: PluginPermissionManager
    ): PluginManager {
        return PluginManager(context, gson, pluginSandbox, permissionManager)
    }
    
    @Provides
    @Singleton
    fun providePluginSandbox(
        gson: com.google.gson.Gson
    ): PluginSandbox {
        return PluginSandbox(gson)
    }
    
    @Provides
    @Singleton
    fun providePluginPermissionManager(): PluginPermissionManager {
        return PluginPermissionManager()
    }
    
    @Provides
    @Singleton
    fun providePluginValidator(): PluginValidator {
        return PluginValidator()
    }
    
    @Provides
    @Singleton
    fun providePluginRepository(
        pluginDao: PluginDao,
        pluginManager: PluginManager,
        pluginValidator: PluginValidator
    ): PluginRepository {
        return PluginRepository(pluginDao, pluginManager, pluginValidator)
    }
}