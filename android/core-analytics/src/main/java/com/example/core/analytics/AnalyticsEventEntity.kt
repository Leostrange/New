package com.example.core.analytics

import androidx.room.Entity
import androidx.room.PrimaryKey
import com.google.gson.Gson

/**
 * Room entity for storing analytics events
 */
@Entity(tableName = "analytics_events")
data class AnalyticsEventEntity(
    @PrimaryKey val id: String,
    val timestamp: Long,
    val eventType: String,
    val eventName: String,
    val parametersJson: String // JSON representation of parameters
) {
    companion object {
        private val gson = Gson()
        
        fun fromStoredEvent(event: StoredAnalyticsEvent): AnalyticsEventEntity {
            return AnalyticsEventEntity(
                id = event.id,
                timestamp = event.timestamp,
                eventType = event.eventType,
                eventName = event.eventName,
                parametersJson = gson.toJson(event.parameters)
            )
        }
        
        fun toStoredEvent(entity: AnalyticsEventEntity): StoredAnalyticsEvent {
            return StoredAnalyticsEvent(
                id = entity.id,
                timestamp = entity.timestamp,
                eventType = entity.eventType,
                eventName = entity.eventName,
                parameters = try {
                    gson.fromJson(entity.parametersJson, Map::class.java) as Map<String, Any>
                } catch (e: Exception) {
                    emptyMap()
                }
            )
        }
    }
}