package com.example.feature.ocr.data.api

import com.example.feature.ocr.data.model.TranslationResponse
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query

/**
 * API interface for translation service
 * Using Google Translate API format
 */
interface TranslationApi {
    
    /**
     * Translates text from source language to target language
     * 
     * @param text The text to translate
     * @param sourceLanguage Source language code (e.g., "en", "ja", "zh")
     * @param targetLanguage Target language code (e.g., "en", "ru", "es")
     * @param apiKey API key for authentication
     * @return Translation response with translated text
     */
    @GET("translate")
    suspend fun translate(
        @Query("q") text: String,
        @Query("source") sourceLanguage: String,
        @Query("target") targetLanguage: String,
        @Query("key") apiKey: String
    ): Response<TranslationResponse>
}