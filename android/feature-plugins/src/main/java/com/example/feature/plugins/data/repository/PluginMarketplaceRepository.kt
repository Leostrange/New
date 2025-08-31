package com.example.feature.plugins.data.repository

import android.content.Context
import android.util.Log
import com.example.feature.plugins.data.api.PluginMarketplaceApi
import com.example.feature.plugins.data.model.MarketplacePlugin
import com.example.feature.plugins.model.Plugin
import com.example.feature.plugins.model.PluginCategory
import com.example.feature.plugins.model.PluginType
import dagger.hilt.android.qualifiers.ApplicationContext
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Inject
import javax.inject.Singleton

/**
 * Repository for plugin marketplace
 */
@Singleton
class PluginMarketplaceRepository @Inject constructor(
    @ApplicationContext private val context: Context
) {
    
    companion object {
        private const val TAG = "PluginMarketplaceRepo"
        private const val BASE_URL = "https://plugins.mrcomic.app/api/v1/"
    }
    
    private val marketplaceApi: PluginMarketplaceApi by lazy {
        val loggingInterceptor = HttpLoggingInterceptor().apply {
            level = HttpLoggingInterceptor.Level.BODY
        }
        
        val okHttpClient = OkHttpClient.Builder()
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .addInterceptor(loggingInterceptor)
            .build()
        
        val retrofit = Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create())
            .build()
        
        retrofit.create(PluginMarketplaceApi::class.java)
    }
    
    /**
     * Get list of available plugins from marketplace
     * 
     * @param category Filter by category (optional)
     * @param page Page number for pagination (default: 1)
     * @param limit Number of items per page (default: 20)
     * @return List of marketplace plugins or empty list if failed
     */
    suspend fun getPlugins(
        category: String? = null,
        page: Int = 1,
        limit: Int = 20
    ): List<MarketplacePlugin> {
        return try {
            val response = marketplaceApi.getPlugins(category, page, limit)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                Log.e(TAG, "Failed to fetch plugins: ${response.code()} - ${response.message()}")
                emptyList()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching plugins", e)
            emptyList()
        }
    }
    
    /**
     * Search plugins by query
     * 
     * @param query Search query
     * @param page Page number for pagination (default: 1)
     * @param limit Number of items per page (default: 20)
     * @return List of marketplace plugins matching the query or empty list if failed
     */
    suspend fun searchPlugins(
        query: String,
        page: Int = 1,
        limit: Int = 20
    ): List<MarketplacePlugin> {
        return try {
            val response = marketplaceApi.searchPlugins(query, page, limit)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                Log.e(TAG, "Failed to search plugins: ${response.code()} - ${response.message()}")
                emptyList()
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error searching plugins", e)
            emptyList()
        }
    }
    
    /**
     * Get plugin details by ID
     * 
     * @param pluginId Plugin ID
     * @return Plugin details or null if failed
     */
    suspend fun getPluginDetails(pluginId: String): MarketplacePlugin? {
        return try {
            val response = marketplaceApi.getPluginDetails(pluginId)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                Log.e(TAG, "Failed to fetch plugin details: ${response.code()} - ${response.message()}")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching plugin details", e)
            null
        }
    }
    
    /**
     * Get plugin download URL
     * 
     * @param pluginId Plugin ID
     * @return Download URL for the plugin or null if failed
     */
    suspend fun getPluginDownloadUrl(pluginId: String): String? {
        return try {
            val response = marketplaceApi.getPluginDownloadUrl(pluginId)
            if (response.isSuccessful && response.body() != null) {
                response.body()!!
            } else {
                Log.e(TAG, "Failed to fetch plugin download URL: ${response.code()} - ${response.message()}")
                null
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error fetching plugin download URL", e)
            null
        }
    }
    
    /**
     * Convert MarketplacePlugin to Plugin model
     * 
     * @param marketplacePlugin Marketplace plugin
     * @return Plugin model
     */
    fun toPlugin(marketplacePlugin: MarketplacePlugin): Plugin {
        return Plugin(
            id = marketplacePlugin.id,
            name = marketplacePlugin.name,
            version = marketplacePlugin.version,
            author = marketplacePlugin.author,
            description = marketplacePlugin.description,
            category = marketplacePlugin.category,
            type = marketplacePlugin.type,
            isInstalled = marketplacePlugin.isInstalled
        )
    }
}