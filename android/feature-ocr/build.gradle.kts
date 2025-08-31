plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("com.google.devtools.ksp")
    id("com.google.dagger.hilt.android")
    id("org.jetbrains.kotlin.plugin.compose")
}

android {
    lint {
        disable += "NullSafeMutableLiveData"
    }
    namespace = "com.mrcomic.feature.ocr"
    compileSdk = libs.versions.compileSdk.get().toInt()
    defaultConfig {
        minSdk = libs.versions.minSdk.get().toInt()
    }
    buildFeatures {
        compose = true
    }
    // Removed composeOptions block as it's now handled by the Compose Compiler plugin
    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }
    kotlinOptions {
        jvmTarget = "17"
    }
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.material3)
    
    // Lifecycle
    implementation(libs.androidx.lifecycle.runtime.ktx)
    implementation(libs.androidx.lifecycle.viewmodel.compose)
    
    // Hilt Navigation Compose
    implementation(libs.androidx.hilt.navigation.compose)
    
    // MLKit Text Recognition
    implementation(libs.mlkit.text.recognition)
    implementation(libs.mlkit.text.recognition.common)
    
    // Core modules
    implementation(project(":android:core-data"))
    implementation(project(":android:core-model"))
    implementation(project(":android:core-ui"))

    // Hilt
    implementation(libs.google.hilt.android)
    ksp(libs.google.hilt.compiler)
    
    // Image processing for OCR
    implementation(libs.coil.compose)
    implementation(libs.exifinterface)
    
    // Network and JSON parsing
    implementation(libs.okhttp.logging.interceptor)
    implementation(libs.retrofit.core)
    implementation(libs.retrofit.converter.gson)
}