# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# For more details, see
#   http://developer.android.com/guide/developing/tools/proguard.html

# If your project uses WebView with JS, uncomment the following
# and specify the fully qualified class name to the JavaScript interface
# class:
#-keepclassmembers class fqcn.of.javascript.interface.for.webview {
#   public *;
#}

# Uncomment this to preserve the line number information for
# debugging stack traces.
#-keepattributes SourceFile,LineNumberTable

# If you keep the line number information, uncomment this to
# hide the original source file name.
#-renamesourcefileattribute SourceFile

# Keep Room annotations
-keep class androidx.room.** { *; }
-keepclassmembers class * {
    @androidx.room.* <fields>;
    @androidx.room.* <methods>;
}

# Keep Hilt annotations
-keep class dagger.hilt.** { *; }
-keep class javax.inject.** { *; }
-keepclassmembers class * {
    @dagger.hilt.** <fields>;
    @dagger.hilt.** <methods>;
    @javax.inject.** <fields>;
    @javax.inject.** <methods>;
}

# Keep Compose
-keep class androidx.compose.** { *; }
-keepclassmembers class androidx.compose.** { *; }

# Keep Firebase
-keep class com.google.firebase.** { *; }
-keepattributes Signature
-keepattributes *Annotation*

# Keep ML Kit
-keep class com.google.mlkit.** { *; }
-keep class com.google.android.gms.** { *; }

# Keep PDF Box
-keep class com.tom_roush.pdfbox.** { *; }

# Keep Apache Commons
-keep class org.apache.commons.** { *; }

# Keep Gson
-keepattributes Signature
-keepattributes *Annotation*
-dontwarn sun.misc.**
-keep class com.google.gson.** { *; }
-keep class * implements com.google.gson.TypeAdapterFactory
-keep class * implements com.google.gson.JsonSerializer
-keep class * implements com.google.gson.JsonDeserializer

# Keep data classes
-keep class com.mrcomic.core.model.** { *; }
-keepclassmembers class com.mrcomic.core.model.** { *; }

# Keep Coroutines
-keepnames class kotlinx.coroutines.internal.MainDispatcherFactory {}
-keepnames class kotlinx.coroutines.CoroutineExceptionHandler {}
-keepclassmembers class kotlinx.coroutines.** {
    volatile <fields>;
}