package com.example.core.data.reader

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import kotlinx.coroutines.flow.Flow

@Dao
interface ReaderStateDao {
    @Query("SELECT * FROM reader_state WHERE id = 0")
    fun getState(): Flow<ReaderStateEntity?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun setState(state: ReaderStateEntity)
    
    // Backup/Restore methods
    @Query("SELECT * FROM reader_state")
    suspend fun getAllStates(): List<ReaderStateEntity>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertStates(states: List<ReaderStateEntity>)
    
    @Query("DELETE FROM reader_state")
    suspend fun clearAllStates()
    
    // Synchronization methods
    @Query("SELECT * FROM reader_state WHERE isSynced = 0")
    suspend fun getUnsyncedStates(): List<ReaderStateEntity>
    
    @Query("UPDATE reader_state SET isSynced = 1 WHERE id = :id")
    suspend fun markStateAsSynced(id: Int)
    
    @Query("SELECT * FROM reader_state WHERE deviceId != :currentDeviceId OR deviceId IS NULL")
    suspend fun getStatesFromOtherDevices(currentDeviceId: String): List<ReaderStateEntity>
}