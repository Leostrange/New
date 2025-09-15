package com.mrcomic.app.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.material3.windowsizeclass.WindowSizeClass
import androidx.compose.material3.windowsizeclass.WindowWidthSizeClass
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.navigation.NavDestination
import androidx.navigation.NavDestination.Companion.hierarchy
import androidx.navigation.NavGraph.Companion.findStartDestination
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import com.mrcomic.feature.library.LibraryScreen
import com.mrcomic.feature.reader.ReaderScreen

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MrComicNavigation(
    windowSizeClass: WindowSizeClass,
    modifier: Modifier = Modifier,
    navController: NavHostController = rememberNavController()
) {
    val currentBackStack by navController.currentBackStackEntryAsState()
    val currentDestination = currentBackStack?.destination
    
    val currentTopLevelDestination = TopLevelDestination.values().find { destination ->
        currentDestination?.hierarchy?.any {
            it.route?.contains(destination.route, true) ?: false
        } == true
    }
    
    Row(modifier = modifier.fillMaxSize()) {
        if (windowSizeClass.widthSizeClass != WindowWidthSizeClass.Compact) {
            MrComicNavigationRail(
                currentDestination = currentDestination,
                navigateToTopLevelDestination = { destination ->
                    navController.navigateToTopLevelDestination(destination)
                },
                modifier = Modifier.safeDrawingPadding()
            )
        }
        
        Column(modifier = Modifier.fillMaxSize()) {
            MrComicNavHost(
                navController = navController,
                modifier = Modifier
                    .fillMaxSize()
                    .weight(1f)
            )
            
            if (windowSizeClass.widthSizeClass == WindowWidthSizeClass.Compact) {
                MrComicBottomBar(
                    currentDestination = currentDestination,
                    navigateToTopLevelDestination = { destination ->
                        navController.navigateToTopLevelDestination(destination)
                    }
                )
            }
        }
    }
}

@Composable
private fun MrComicBottomBar(
    currentDestination: NavDestination?,
    navigateToTopLevelDestination: (TopLevelDestination) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationBar(modifier = modifier) {
        TopLevelDestination.values().forEach { destination ->
            val selected = currentDestination.isTopLevelDestinationInHierarchy(destination)
            NavigationBarItem(
                selected = selected,
                onClick = { navigateToTopLevelDestination(destination) },
                icon = {
                    Icon(
                        imageVector = destination.icon,
                        contentDescription = destination.contentDescription
                    )
                },
                label = { Text(destination.label) },
                alwaysShowLabel = false
            )
        }
    }
}

@Composable
private fun MrComicNavigationRail(
    currentDestination: NavDestination?,
    navigateToTopLevelDestination: (TopLevelDestination) -> Unit,
    modifier: Modifier = Modifier
) {
    NavigationRail(modifier = modifier) {
        Spacer(Modifier.weight(1f))
        TopLevelDestination.values().forEach { destination ->
            val selected = currentDestination.isTopLevelDestinationInHierarchy(destination)
            NavigationRailItem(
                selected = selected,
                onClick = { navigateToTopLevelDestination(destination) },
                icon = {
                    Icon(
                        imageVector = destination.icon,
                        contentDescription = destination.contentDescription
                    )
                },
                label = { Text(destination.label) },
                alwaysShowLabel = false
            )
        }
        Spacer(Modifier.weight(1f))
    }
}

@Composable
private fun MrComicNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = MrComicDestinations.LIBRARY_ROUTE,
        modifier = modifier
    ) {
        composable(MrComicDestinations.LIBRARY_ROUTE) {
            LibraryScreen(
                windowSizeClass = windowSizeClass,
                onComicClick = { comicId ->
                    navController.navigate("${MrComicDestinations.COMIC_READER_ROUTE}/$comicId")
                },
                onSearchClick = {
                    navController.navigate(MrComicDestinations.SEARCH_ROUTE)
                }
            )
        }
        
        composable("${MrComicDestinations.COMIC_READER_ROUTE}/{comicId}") { backStackEntry ->
            val comicId = backStackEntry.arguments?.getString("comicId") ?: return@composable
            ReaderScreen(
                onBackClick = {
                    navController.popBackStack()
                }
            )
        }
        
        composable(MrComicDestinations.OCR_ROUTE) {
            // OCRScreen will be implemented later
            Box(modifier = Modifier.fillMaxSize()) {
                Text("OCR Screen")
            }
        }
        
        composable(MrComicDestinations.SETTINGS_ROUTE) {
            // SettingsScreen will be implemented later
            Box(modifier = Modifier.fillMaxSize()) {
                Text("Settings Screen")
            }
        }
    }
}

private fun NavDestination?.isTopLevelDestinationInHierarchy(destination: TopLevelDestination) =
    this?.hierarchy?.any {
        it.route?.contains(destination.route, true) ?: false
    } ?: false

private fun NavHostController.navigateToTopLevelDestination(topLevelDestination: TopLevelDestination) {
    navigate(topLevelDestination.route) {
        // Pop up to the start destination of the graph to
        // avoid building up a large stack of destinations
        // on the back stack as users select items
        popUpTo(graph.findStartDestination().id) {
            saveState = true
        }
        // Avoid multiple copies of the same destination when
        // reselecting the same item
        launchSingleTop = true
        // Restore state when reselecting a previously selected item
        restoreState = true
    }
}