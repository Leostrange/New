package com.mrcomic.core.network.api

import com.mrcomic.core.network.model.TranslationRequest
import com.mrcomic.core.network.model.TranslationResponse
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.Header
import retrofit2.http.POST

interface TranslationApi {
    @POST("translate")
    suspend fun translateText(
        @Header("Authorization") apiKey: String,
        @Body request: TranslationRequest
    ): Response<TranslationResponse>
}

data class TranslationRequest(
    val text: String,
    val sourceLang: String,
    val targetLang: String
)

data class TranslationResponse(
    val translatedText: String,
    val confidence: Float,
    val detectedLanguage: String?
)
