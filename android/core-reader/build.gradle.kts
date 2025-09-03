plugins {
    id("com.android.library")
    id("org.jetbrains.kotlin.android")
    id("com.google.dagger.hilt.android")
    id("com.google.devtools.ksp")
}

android {
    lint {
        disable += "NullSafeMutableLiveData"
    }
    namespace = "com.example.core.reader"
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
}

dependencies {
    implementation(project(":android:core-model"))

    implementation(libs.google.hilt.android)
    ksp(libs.google.hilt.compiler)

    implementation("androidx.collection:collection-ktx:1.4.0")

    // Archive and document format support
    implementation(libs.zip4j)
    implementation(libs.junrar)
    implementation(libs.commons.compress)
    
    // PDF support libraries
    implementation(libs.pdfium.android)
    implementation(libs.pdfbox.android)
    
    // Logging for PDF operations
    implementation(libs.slf4j.android)
}


