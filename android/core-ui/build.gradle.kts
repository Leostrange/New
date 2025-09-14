plugins {
    alias(libs.plugins.android.library)
    alias(libs.plugins.kotlin.android)
    alias(libs.plugins.kotlin.compose)
    alias(libs.plugins.hilt.android)
    alias(libs.plugins.ksp)
}

android {
    lint {
        disable += "NullSafeMutableLiveData"
    }
    namespace = "com.example.core.ui"
    compileSdk = libs.versions.compileSdk.get().toInt()

    defaultConfig {
        minSdk = libs.versions.minSdk.get().toInt()
    }

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = libs.versions.jvmTarget.get()
    }

    buildFeatures {
        compose = true
    }
    // Removed composeOptions block as it's now handled by the Compose Compiler plugin
}

dependencies {
    implementation(platform(libs.androidx.compose.bom))
    implementation(libs.androidx.compose.ui)
    implementation(libs.androidx.compose.ui.tooling.preview)
    implementation(libs.androidx.compose.material3)
    implementation(libs.androidx.compose.material.icons.extended)
    
    // Hilt
    implementation(libs.google.hilt.android)
    ksp(libs.google.hilt.compiler)
    
    // Core modules
    implementation(project(":android:core-model"))
    implementation(project(":android:core-data"))
    
    // Third-party
    implementation(libs.coil.compose)
    implementation(libs.material3.window.size)
    implementation(libs.shimmer.compose)
    implementation(libs.lottie.compose)
    implementation(libs.accompanist.systemuicontroller)
    implementation(libs.accompanist.permissions)
    implementation(libs.constraintlayout.compose)
    
    // Media3 for video splash
    implementation(libs.media3.exoplayer)
    implementation(libs.media3.ui)
    
    // Testing
    testImplementation(libs.test.junit)
    testImplementation(libs.test.truth)
    testImplementation(libs.test.mockito.core)
    testImplementation(libs.test.mockito.kotlin)
    androidTestImplementation(libs.androidx.junit)
    androidTestImplementation(libs.androidx.espresso.core)
    androidTestImplementation(platform(libs.androidx.compose.bom))
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
    debugImplementation("androidx.compose.ui:ui-tooling")
    debugImplementation("androidx.compose.ui:ui-test-manifest")
}