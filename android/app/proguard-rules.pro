# ============================================================================
# 🛡️ Mr.Comic ProGuard Configuration
# Advanced optimizations and security for production builds
# ============================================================================

# === PERFORMANCE OPTIMIZATIONS ===

# Keep main application classes
-keep class com.mrcomic.** { *; }
-keep class com.example.mrcomic.** { *; }

# === DATABASE OPTIMIZATION ===

# Keep Room database classes
-keep class * extends androidx.room.RoomDatabase
-keep @androidx.room.Entity class * { *; }
-keep @androidx.room.Dao class * { *; }
-keep @androidx.room.TypeConverter class * { *; }
-keep @androidx.room.Database class * { *; }

# Room - Keep constructor for database implementations
-keepclassmembers class * extends androidx.room.RoomDatabase {
    <init>(...);
}

# === DEPENDENCY INJECTION ===

# Keep Hilt classes
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keep @dagger.hilt.android.lifecycle.HiltViewModel class * { *; }
-keep @dagger.Module class * { *; }
-keep @dagger.Component class * { *; }
-keep @dagger.Provides class * { *; }

# === COMPOSE & UI OPTIMIZATION ===

# Keep Compose runtime classes for proper performance
-keep class androidx.compose.runtime.** { *; }
-keep class androidx.compose.ui.** { *; }
-keep class androidx.compose.material3.** { *; }
-keep class androidx.compose.foundation.** { *; }

# Keep Composable functions
-keep @androidx.compose.runtime.Composable class * { *; }
-keepclassmembers class * {
    @androidx.compose.runtime.Composable <methods>;
}

# === NETWORKING ===

# Keep Retrofit and OkHttp classes
-keep class retrofit2.** { *; }
-keep class okhttp3.** { *; }
-keep interface retrofit2.Call
-keep class retrofit2.Response

# Keep Gson classes
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapter
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# === COROUTINES ===

# Keep Kotlin Coroutines
-keep class kotlinx.coroutines.** { *; }
-keep class kotlin.coroutines.** { *; }
-dontwarn kotlinx.coroutines.flow.**

# === DATA CLASSES & MODELS ===

# Keep model classes (prevent obfuscation of data classes)
-keep class com.example.**.model.** { *; }
-keep class com.example.**.data.** { *; }
-keep class com.example.core.model.** { *; }

# Keep data class properties
-keepclassmembers class * {
    <init>(...);
}
-keep @kotlinx.serialization.Serializable class * { *; }

# === NATIVE & JNI ===

# Keep classes with native methods
-keepclasseswithmembernames class * {
    native <methods>;
}

# === ENUMS & PARCELABLES ===

# Keep enum classes
-keepclassmembers enum * {
    public static **[] values();
    public static ** valueOf(java.lang.String);
}

# Keep Parcelable classes
-keep class * implements android.os.Parcelable {
  public static final android.os.Parcelable$Creator *;
}

# === REFLECTION & ANNOTATIONS ===

# Optimize reflection usage
-keepattributes Signature
-keepattributes *Annotation*
-keepattributes EnclosingMethod
-keepattributes InnerClasses
-keepattributes SourceFile,LineNumberTable
-keepattributes RuntimeVisibleAnnotations
-keepattributes RuntimeInvisibleAnnotations
-keepattributes RuntimeVisibleParameterAnnotations
-keepattributes RuntimeInvisibleParameterAnnotations

# === COMIC READER LIBRARIES ===

# Archive handling libraries
-keep class org.apache.commons.compress.** { *; }
-keep class com.github.junrar.** { *; }
-keep class net.sf.sevenzipjbinding.** { *; }
-keep class net.lingala.zip4j.** { *; }

# PDF libraries
-keep class com.shockwave.pdfium.** { *; }
-keep class org.vudroid.djvulibre.** { *; }
-keep class com.tom_roush.pdfbox.** { *; }

# === IMAGE PROCESSING ===

# Image processing optimizations
-keep class android.graphics.** { *; }
-keep class androidx.compose.ui.graphics.** { *; }
-keep class io.coil.** { *; }
-keep class com.example.core.reader.ImageOptimizer { *; }

# Keep image filter enums
-keep class com.example.core.reader.ImageFilter { *; }

# === MEDIA PLAYER ===

# ExoPlayer / Media3
-keep class androidx.media3.** { *; }
-keep class com.google.android.exoplayer2.** { *; }
-dontwarn androidx.media3.datasource.RtmpDataSource
-dontwarn androidx.media3.decoder.flac.FlacExtractor

# === ANALYTICS & MONITORING ===

# Keep analytics classes for proper functioning
-keep class com.example.core.analytics.** { *; }
-keep class com.example.core.analytics.PerformanceProfiler { *; }

# === SECURITY ENHANCEMENTS ===

# Remove debug information in release
-assumenosideeffects class android.util.Log {
    public static boolean isLoggable(java.lang.String, int);
    public static int v(...);
    public static int i(...);
    public static int w(...);
    public static int d(...);
    public static int e(...);
}

# Remove debug and verbose print statements
-assumenosideeffects class java.io.PrintStream {
    public void println(%);
    public void print(%);
}

# === ADVANCED OPTIMIZATIONS ===

# R8 specific optimizations
-allowaccessmodification
-repackageclasses ''
-optimizationpasses 5
-overloadaggressively

# Advanced optimization flags
-optimizations !code/simplification/arithmetic,!field/*,!class/merging/*,!code/allocation/variable

# Assume no side effects for better optimization
-assumenosideeffects class kotlin.jvm.internal.Intrinsics {
    static void checkParameterIsNotNull(java.lang.Object, java.lang.String);
    static void checkNotNullParameter(java.lang.Object, java.lang.String);
    static void checkExpressionValueIsNotNull(java.lang.Object, java.lang.String);
    static void checkNotNullExpressionValue(java.lang.Object, java.lang.String);
    static void checkReturnedValueIsNotNull(java.lang.Object, java.lang.String);
    static void checkFieldIsNotNull(java.lang.Object, java.lang.String);
    static void throwUninitializedPropertyAccessException(java.lang.String);
}

# === LIBRARY SPECIFIC RULES ===

# OkHttp platform specific
-dontwarn okhttp3.internal.platform.**
-dontwarn org.conscrypt.**
-dontwarn org.bouncycastle.**
-dontwarn org.openjsse.**

# Kotlin serialization
-keepattributes InnerClasses
-dontnote kotlinx.serialization.AnnotationsKt

# === WARNING SUPPRESSIONS ===

# Suppress warnings for optional dependencies
-dontwarn javax.annotation.**
-dontwarn org.jetbrains.annotations.**
-dontwarn java.lang.instrument.ClassFileTransformer
-dontwarn sun.misc.SignalHandler

# === TESTING EXCLUSIONS ===

# Remove test classes from release builds
-assumenosideeffects class kotlin.test.** {
    *;
}
-assumenosideeffects class org.junit.** {
    *;
}

# === FINAL SECURITY MEASURES ===

# Hide internal implementation details
-printmapping mapping.txt
-printseeds seeds.txt
-printusage usage.txt

# Additional security through renaming
-obfuscationdictionary dictionary.txt
-classobfuscationdictionary dictionary.txt
-packageobfuscationdictionary dictionary.txt 