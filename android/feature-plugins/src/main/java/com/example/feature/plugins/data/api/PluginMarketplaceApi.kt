package com.example.feature.plugins.data.api

import com.example.feature.plugins.data.model.MarketplacePlugin
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Path
import retrofit2.http.Query

/**
 * API interface for plugin marketplace
 */
interface PluginMarketplaceApi {
    
    /**
     * Get list of available plugins from marketplace
     * 
     * @param category Filter by category (optional)
     * @param page Page number for pagination (default: 1)
     * @param limit Number of items per page (default: 20)
     * @return List of marketplace plugins
     */
    @GET("plugins")
    suspend fun getPlugins(
        @Query("category") category: String? = null,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<List<MarketplacePlugin>>
    
    /**
     * Search plugins by query
     * 
     * @param query Search query
     * @param page Page number for pagination (default: 1)
     * @param limit Number of items per page (default: 20)
     * @return List of marketplace plugins matching the query
     */
    @GET("plugins/search")
    suspend fun searchPlugins(
        @Query("q") query: String,
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 20
    ): Response<List<MarketplacePlugin>>
    
    /**
     * Get plugin details by ID
     * 
     * @param pluginId Plugin ID
     * @return Plugin details
     */
    @GET("plugins/{id}")
    suspend fun getPluginDetails(
        @Path("id") pluginId: String
    ): Response<MarketplacePlugin>
    
    /**
     * Get plugin download URL
     * 
     * @param pluginId Plugin ID
     * @return Download URL for the plugin
     */
    @GET("plugins/{id}/download")
    suspend fun getPluginDownloadUrl(
        @Path("id") pluginId: String
    ): Response<String>
}