package com.mrcomic.core.notifications

import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import androidx.core.app.NotificationManagerCompat
import com.mrcomic.MainActivity
import dagger.hilt.android.qualifiers.ApplicationContext
import javax.inject.Inject
import javax.inject.Singleton

@Singleton
class MrComicNotificationManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    companion object {
        private const val CHANNEL_ID_DOWNLOADS = "downloads"
        private const val CHANNEL_ID_UPDATES = "updates"
        private const val CHANNEL_ID_TRANSLATIONS = "translations"
        
        private const val NOTIFICATION_ID_DOWNLOAD = 1001
        private const val NOTIFICATION_ID_UPDATE = 1002
        private const val NOTIFICATION_ID_TRANSLATION = 1003
    }

    init {
        createNotificationChannels()
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val channels = listOf(
                NotificationChannel(
                    CHANNEL_ID_DOWNLOADS,
                    "Загрузки комиксов",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Уведомления о загрузке комиксов"
                },
                NotificationChannel(
                    CHANNEL_ID_UPDATES,
                    "Обновления",
                    NotificationManager.IMPORTANCE_DEFAULT
                ).apply {
                    description = "Уведомления об обновлениях комиксов"
                },
                NotificationChannel(
                    CHANNEL_ID_TRANSLATIONS,
                    "Переводы",
                    NotificationManager.IMPORTANCE_LOW
                ).apply {
                    description = "Уведомления о завершении переводов"
                }
            )

            val notificationManager = context.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
            channels.forEach { notificationManager.createNotificationChannel(it) }
        }
    }

    fun showDownloadNotification(comicTitle: String, progress: Int) {
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID_DOWNLOADS)
            .setSmallIcon(android.R.drawable.stat_sys_download)
            .setContentTitle("Загрузка комикса")
            .setContentText(comicTitle)
            .setProgress(100, progress, false)
            .setContentIntent(pendingIntent)
            .setAutoCancel(false)
            .build()

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_DOWNLOAD, notification)
    }

    fun showDownloadCompleteNotification(comicTitle: String) {
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID_DOWNLOADS)
            .setSmallIcon(android.R.drawable.stat_sys_download_done)
            .setContentTitle("Загрузка завершена")
            .setContentText("$comicTitle готов к чтению")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_DOWNLOAD, notification)
    }

    fun showUpdateNotification(comicsCount: Int) {
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID_UPDATES)
            .setSmallIcon(android.R.drawable.ic_popup_sync)
            .setContentTitle("Доступны обновления")
            .setContentText("Обновлено комиксов: $comicsCount")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_UPDATE, notification)
    }

    fun showTranslationCompleteNotification(comicTitle: String) {
        val intent = Intent(context, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            context, 0, intent,
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )

        val notification = NotificationCompat.Builder(context, CHANNEL_ID_TRANSLATIONS)
            .setSmallIcon(android.R.drawable.ic_menu_translate)
            .setContentTitle("Перевод завершен")
            .setContentText("$comicTitle переведен")
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        NotificationManagerCompat.from(context).notify(NOTIFICATION_ID_TRANSLATION, notification)
    }

    fun cancelDownloadNotification() {
        NotificationManagerCompat.from(context).cancel(NOTIFICATION_ID_DOWNLOAD)
    }
}
