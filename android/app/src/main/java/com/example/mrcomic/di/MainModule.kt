package com.example.mrcomic.di

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.preferencesDataStore
import com.example.core.data.repository.SettingsRepository
import com.example.core.ui.theme.ThemeManager
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import javax.inject.Qualifier
import javax.inject.Singleton

/**
 * Main DI module for app-wide dependencies
 */
@Module
@InstallIn(SingletonComponent::class)
object MainModule {

    // DataStore extension
    private val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "mr_comic_preferences")

    @Provides
    @Singleton
    fun provideDataStore(@ApplicationContext context: Context): DataStore<Preferences> {
        return context.dataStore
    }

    @Provides
    @Singleton
    @ApplicationScope
    fun provideApplicationScope(): CoroutineScope {
        return CoroutineScope(SupervisorJob() + Dispatchers.Default)
    }

    @Provides
    @Singleton
    fun provideThemeManager(
        settingsRepository: SettingsRepository
    ): ThemeManager {
        return ThemeManager(settingsRepository)
    }
}

/**
 * Qualifier for application-scoped coroutine scope
 */
@Qualifier
@Retention(AnnotationRetention.RUNTIME)
annotation class ApplicationScope