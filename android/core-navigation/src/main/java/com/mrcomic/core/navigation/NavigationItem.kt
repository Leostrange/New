package com.mrcomic.core.navigation

import androidx.annotation.DrawableRes

sealed class NavigationItem(
    val route: String,
    val title: String,
    @DrawableRes val icon: Int
) {
    object Library : NavigationItem(
        route = "library",
        title = "Библиотека",
        icon = android.R.drawable.ic_menu_gallery
    )
    
    object Reader : NavigationItem(
        route = "reader",
        title = "Чтение",
        icon = android.R.drawable.ic_menu_view
    )
    
    object Translations : NavigationItem(
        route = "translations",
        title = "Переводы",
        icon = android.R.drawable.ic_menu_translate
    )
    
    object Settings : NavigationItem(
        route = "settings",
        title = "Настройки",
        icon = android.R.drawable.ic_menu_preferences
    )
}
