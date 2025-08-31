package com.example.core.analytics

import kotlinx.coroutines.flow.Flow

/**
 * Interface for storing and retrieving analytics events
 */
interface AnalyticsStorage {
    /**
     * Save an analytics event
     * @param event The event to save
     */
    suspend fun saveEvent(event: AnalyticsEvent)
    
    /**
     * Get all stored events
     * @return List of stored events
     */
    suspend fun getAllEvents(): List<StoredAnalyticsEvent>
    
    /**
     * Get events of a specific type
     * @param eventType The type of events to retrieve
     * @return List of events of the specified type
     */
    suspend fun getEventsByType(eventType: String): List<StoredAnalyticsEvent>
    
    /**
     * Get events within a time range
     * @param startTime Start time (milliseconds since epoch)
     * @param endTime End time (milliseconds since epoch)
     * @return List of events within the time range
     */
    suspend fun getEventsByTimeRange(startTime: Long, endTime: Long): List<StoredAnalyticsEvent>
    
    /**
     * Clear all stored events
     */
    suspend fun clearAllEvents()
}

/**
 * Data class representing a stored analytics event
 * @param id Unique identifier for the event
 * @param timestamp When the event occurred
 * @param eventType Type of the event
 * @param eventName Name of the event
 * @param parameters Event parameters
 */
data class StoredAnalyticsEvent(
    val id: String,
    val timestamp: Long,
    val eventType: String,
    val eventName: String,
    val parameters: Map<String, Any>
)