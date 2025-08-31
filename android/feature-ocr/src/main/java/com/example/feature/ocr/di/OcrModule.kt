package com.example.feature.ocr.di

import com.example.feature.ocr.data.OnlineTranslationService
import com.example.feature.ocr.domain.TranslationService
import com.google.gson.Gson
import dagger.Binds
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
abstract class OcrModule {

    @Binds
    @Singleton
    abstract fun bindTranslationService(
        onlineTranslationService: OnlineTranslationService
    ): TranslationService

    companion object {
        @Provides
        @Singleton
        fun provideGson(): Gson = Gson()
    }
}