package com.mrcomic

import android.content.Intent
import android.os.Bundle
import androidx.activity.ComponentActivity

class SplashActivity : ComponentActivity() {
	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		startActivity(Intent(this, VideoSplashActivity::class.java))
		finish()
	}
}