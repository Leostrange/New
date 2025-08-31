package com.example.core.analytics

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

/**
 * Room DAO for analytics events
 */
@Dao
interface AnalyticsEventDao {
    @Insert
    suspend fun insertEvent(event: AnalyticsEventEntity)
    
    @Query("SELECT * FROM analytics_events ORDER BY timestamp DESC")
    suspend fun getAllEvents(): List<AnalyticsEventEntity>
    
    @Query("SELECT * FROM analytics_events WHERE eventType = :eventType ORDER BY timestamp DESC")
    suspend fun getEventsByType(eventType: String): List<AnalyticsEventEntity>
    
    @Query("SELECT * FROM analytics_events WHERE timestamp BETWEEN :startTime AND :endTime ORDER BY timestamp DESC")
    suspend fun getEventsByTimeRange(startTime: Long, endTime: Long): List<AnalyticsEventEntity>
    
    @Query("DELETE FROM analytics_events")
    suspend fun clearAllEvents()
    
    @Query("SELECT COUNT(*) FROM analytics_events")
    suspend fun getEventCount(): Int
}