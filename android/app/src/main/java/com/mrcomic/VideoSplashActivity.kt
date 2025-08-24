package com.mrcomic

import android.content.Intent
import android.net.Uri
import android.os.Bundle
import android.widget.VideoView
import androidx.activity.ComponentActivity
import androidx.activity.enableEdgeToEdge
import androidx.core.view.WindowCompat

class VideoSplashActivity : ComponentActivity() {
	override fun onCreate(savedInstanceState: Bundle?) {
		super.onCreate(savedInstanceState)
		enableEdgeToEdge()
		WindowCompat.setDecorFitsSystemWindows(window, false)

		val videoView = VideoView(this)
		setContentView(videoView)

		val resId = resources.getIdentifier("splash", "raw", packageName)
		if (resId == 0) {
			startActivity(Intent(this, WelcomeActivity::class.java))
			finish()
			return
		}

		val uri = Uri.parse("android.resource://$packageName/$resId")
		videoView.setVideoURI(uri)
		videoView.setOnCompletionListener {
			startActivity(Intent(this, WelcomeActivity::class.java))
			finish()
		}
		videoView.setOnPreparedListener { mp ->
			mp.isLooping = false
			mp.setVolume(0f, 0f)
		}
		videoView.start()
	}
}