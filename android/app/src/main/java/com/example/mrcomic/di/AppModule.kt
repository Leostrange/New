package com.example.mrcomic.di

import android.content.Context
import com.example.mrcomic.data.network.MrComicApiService
import com.google.gson.Gson
import com.google.gson.GsonBuilder
import com.example.core.data.repository.SettingsRepository
import com.example.mrcomic.data.LocalTranslationEngine
import com.example.mrcomic.data.DummyLocalTranslationEngine
import com.example.mrcomic.BuildConfig
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.components.SingletonComponent
import okhttp3.OkHttpClient
import okhttp3.logging.HttpLoggingInterceptor
import retrofit2.Retrofit
import retrofit2.converter.gson.GsonConverterFactory
import java.util.concurrent.TimeUnit
import javax.inject.Singleton
import com.example.mrcomic.data.OcrTranslationRepository

@Module
@InstallIn(SingletonComponent::class)
object AppModule {

    @Provides
    @Singleton
    fun provideBaseUrl(): String = BuildConfig.BASE_API_URL

    @Provides
    @Singleton
    fun provideGson(): Gson = GsonBuilder().create()

    @Provides
    @Singleton
    fun provideHttpLoggingInterceptor(): HttpLoggingInterceptor {
        val loggingInterceptor = HttpLoggingInterceptor()
        loggingInterceptor.level = if (BuildConfig.DEBUG) {
            HttpLoggingInterceptor.Level.BODY
        } else {
            HttpLoggingInterceptor.Level.NONE
        }
        return loggingInterceptor
    }

    @Provides
    @Singleton
    fun provideOkHttpClient(loggingInterceptor: HttpLoggingInterceptor): OkHttpClient =
        OkHttpClient.Builder()
            .addInterceptor(loggingInterceptor)
            .connectTimeout(30, TimeUnit.SECONDS)
            .readTimeout(30, TimeUnit.SECONDS)
            .writeTimeout(30, TimeUnit.SECONDS)
            .build()

    @Provides
    @Singleton
    fun provideRetrofit(baseUrl: String, okHttpClient: OkHttpClient, gson: Gson): Retrofit =
        Retrofit.Builder()
            .baseUrl(baseUrl)
            .client(okHttpClient)
            .addConverterFactory(GsonConverterFactory.create(gson))
            .build()

    @Provides
    @Singleton
    fun provideMrComicApiService(retrofit: Retrofit): MrComicApiService =
        retrofit.create(MrComicApiService::class.java)

    @Provides
    @Singleton
    fun provideLocalTranslationEngine(): LocalTranslationEngine = DummyLocalTranslationEngine()

    @Provides
    @Singleton
    fun provideOcrTranslationRepository(
        mrComicApiService: MrComicApiService,
        @ApplicationContext context: Context,
        gson: Gson,
        settingsRepository: SettingsRepository,
        localTranslationEngine: LocalTranslationEngine
    ): OcrTranslationRepository =
        OcrTranslationRepository(
            mrComicApiService,
            context,
            gson,
            settingsRepository,
            localTranslationEngine
        )
}
