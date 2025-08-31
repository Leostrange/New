package com.example.feature.ocr.data.model

import com.google.gson.annotations.SerializedName

/**
 * Data model for translation API response
 */
data class TranslationResponse(
    @SerializedName("data")
    val data: TranslationData
)

data class TranslationData(
    @SerializedName("translations")
    val translations: List<Translation>
)

data class Translation(
    @SerializedName("translatedText")
    val translatedText: String
)