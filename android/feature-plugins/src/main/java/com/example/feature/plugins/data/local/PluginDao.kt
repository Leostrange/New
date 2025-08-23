package com.example.feature.plugins.data.local

import androidx.room.*
import kotlinx.coroutines.flow.Flow

@Entity(tableName = "plugins")
data class PluginEntity(
    @PrimaryKey val id: String,
    val name: String,
    val version: String,
    val author: String,
    val description: String,
    val category: String,
    val type: String,
    val permissions: String, // JSON строка
    val dependencies: String, // JSON строка
    val isEnabled: Boolean,
    val isInstalled: Boolean,
    val configurable: Boolean,
    val iconUrl: String?,
    val sourceUrl: String?,
    val packagePath: String?,
    val metadata: String, // JSON строка
    val installDate: Long,
    val lastUpdateDate: Long
)

@Dao
interface PluginDao {
    
    @Query("SELECT * FROM plugins ORDER BY name ASC")
    fun getAllPlugins(): Flow<List<PluginEntity>>
    
    @Query("SELECT * FROM plugins WHERE isEnabled = 1 ORDER BY name ASC")
    fun getActivePlugins(): Flow<List<PluginEntity>>
    
    @Query("SELECT * FROM plugins WHERE id = :id")
    suspend fun getPluginById(id: String): PluginEntity?
    
    @Query("SELECT * FROM plugins WHERE category = :category ORDER BY name ASC")
    fun getPluginsByCategory(category: String): Flow<List<PluginEntity>>
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlugin(plugin: PluginEntity)
    
    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPlugins(plugins: List<PluginEntity>)
    
    @Update
    suspend fun updatePlugin(plugin: PluginEntity)
    
    @Query("UPDATE plugins SET isEnabled = :enabled WHERE id = :id")
    suspend fun updatePluginState(id: String, enabled: Boolean)
    
    @Query("DELETE FROM plugins WHERE id = :id")
    suspend fun deletePlugin(id: String)
    
    @Query("DELETE FROM plugins")
    suspend fun deleteAllPlugins()
    
    @Query("SELECT COUNT(*) FROM plugins")
    suspend fun getPluginCount(): Int
    
    @Query("SELECT COUNT(*) FROM plugins WHERE isEnabled = 1")
    suspend fun getActivePluginCount(): Int
}