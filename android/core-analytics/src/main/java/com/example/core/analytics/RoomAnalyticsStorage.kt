package com.example.core.analytics

import android.util.Log
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.util.UUID
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Room-based implementation of AnalyticsStorage
 */
@Singleton
class RoomAnalyticsStorage @Inject constructor(
    private val dao: AnalyticsEventDao
) : AnalyticsStorage {
    
    companion object {
        private const val TAG = "RoomAnalyticsStorage"
    }
    
    override suspend fun saveEvent(event: AnalyticsEvent) = withContext(Dispatchers.IO) {
        try {
            val storedEvent = StoredAnalyticsEvent(
                id = UUID.randomUUID().toString(),
                timestamp = System.currentTimeMillis(),
                eventType = event.javaClass.simpleName,
                eventName = event.eventName,
                parameters = event.parameters
            )
            
            val entity = AnalyticsEventEntity.fromStoredEvent(storedEvent)
            dao.insertEvent(entity)
            
            Log.d(TAG, "Saved analytics event: ${event.eventName}")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to save analytics event: ${e.message}", e)
        }
    }
    
    override suspend fun getAllEvents(): List<StoredAnalyticsEvent> = withContext(Dispatchers.IO) {
        try {
            val entities = dao.getAllEvents()
            entities.map { AnalyticsEventEntity.toStoredEvent(it) }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get all analytics events: ${e.message}", e)
            emptyList()
        }
    }
    
    override suspend fun getEventsByType(eventType: String): List<StoredAnalyticsEvent> = withContext(Dispatchers.IO) {
        try {
            val entities = dao.getEventsByType(eventType)
            entities.map { AnalyticsEventEntity.toStoredEvent(it) }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get analytics events by type '$eventType': ${e.message}", e)
            emptyList()
        }
    }
    
    override suspend fun getEventsByTimeRange(startTime: Long, endTime: Long): List<StoredAnalyticsEvent> = withContext(Dispatchers.IO) {
        try {
            val entities = dao.getEventsByTimeRange(startTime, endTime)
            entities.map { AnalyticsEventEntity.toStoredEvent(it) }
        } catch (e: Exception) {
            Log.e(TAG, "Failed to get analytics events by time range: ${e.message}", e)
            emptyList()
        }
    }
    
    override suspend fun clearAllEvents() = withContext(Dispatchers.IO) {
        try {
            dao.clearAllEvents()
            Log.d(TAG, "Cleared all analytics events")
        } catch (e: Exception) {
            Log.e(TAG, "Failed to clear analytics events: ${e.message}", e)
        }
    }
}