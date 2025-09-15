package com.mrcomic.app

import android.app.Application
import android.app.NotificationChannel
import android.app.NotificationManager
import android.os.Build
import androidx.core.content.getSystemService
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MrComicApplication : Application() {

    override fun onCreate() {
        super.onCreate()
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val notificationManager = getSystemService<NotificationManager>()

            // Downloads channel
            val downloadsChannel = NotificationChannel(
                DOWNLOADS_CHANNEL_ID,
                "Загрузки",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Уведомления о загрузке файлов"
                setShowBadge(false)
            }

            // OCR channel
            val ocrChannel = NotificationChannel(
                OCR_CHANNEL_ID,
                "OCR и переводы",
                NotificationManager.IMPORTANCE_DEFAULT
            ).apply {
                description = "Уведомления о завершении OCR и переводов"
            }

            // Backup channel
            val backupChannel = NotificationChannel(
                BACKUP_CHANNEL_ID,
                "Резервное копирование",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Уведомления о резервном копировании"
                setShowBadge(false)
            }

            notificationManager?.createNotificationChannels(
                listOf(downloadsChannel, ocrChannel, backupChannel)
            )
        }
    }

    companion object {
        const val DOWNLOADS_CHANNEL_ID = "downloads"
        const val OCR_CHANNEL_ID = "ocr"
        const val BACKUP_CHANNEL_ID = "backup"
    }
}