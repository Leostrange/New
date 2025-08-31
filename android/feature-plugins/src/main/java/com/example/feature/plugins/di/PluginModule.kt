package com.example.feature.plugins.di

import android.content.Context
import androidx.room.Room
import com.example.core.data.database.AppDatabase
import com.example.core.data.database.plugins.PluginDao
import android.content.Context
import com.example.feature.plugins.data.repository.PluginRepository
import com.example.feature.plugins.domain.*
import com.google.gson.Gson
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
        gson: Gson,
        pluginSandbox: PluginSandbox,
        permissionManager: PluginPermissionManager,
        pluginApi: PluginApiImpl
    ): PluginManager {
        return PluginManager(context, gson, pluginSandbox, permissionManager, pluginApi)
    }
    
    @Provides
    @Singleton
    fun providePluginSandbox(
        gson: Gson,
        pluginApi: PluginApiImpl
    ): PluginSandbox {
        return PluginSandbox(gson, pluginApi)
    }
    
    @Provides
    @Singleton
    fun providePluginPermissionManager(): PluginPermissionManager {
        return PluginPermissionManager()
    }
    
    @Provides
    @Singleton
    fun providePluginApi(
        @ApplicationContext context: Context,
        permissionManager: PluginPermissionManager
    ): PluginApiImpl {
        return PluginApiImpl(context, permissionManager)
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