package com.mrcomic

import android.app.Application
import dagger.hilt.android.HiltAndroidApp

@HiltAndroidApp
class MrComicApplication : Application() {
    override fun onCreate() {
        super.onCreate()
    }
}
