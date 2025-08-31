package com.example.core.analytics

import androidx.room.Database
import androidx.room.RoomDatabase
import androidx.room.Room
import android.content.Context
import javax.inject.Singleton
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Qualifier

/**
 * Room database for analytics events
 */
@Database(
    entities = [AnalyticsEventEntity::class],
    version = 1,
    exportSchema = false
)
abstract class AnalyticsDatabase : RoomDatabase() {
    abstract fun analyticsEventDao(): AnalyticsEventDao
}

/**
 * Dagger module for providing AnalyticsDatabase
 */
@Module
@InstallIn(SingletonComponent::class)
object AnalyticsDatabaseModule {
    
    @Provides
    @Singleton
    fun provideAnalyticsDatabase(@ApplicationContext context: Context): AnalyticsDatabase {
        return Room.databaseBuilder(
            context,
            AnalyticsDatabase::class.java,
            "analytics_database"
        ).build()
    }
    
    @Provides
    fun provideAnalyticsEventDao(database: AnalyticsDatabase): AnalyticsEventDao {
        return database.analyticsEventDao()
    }
}