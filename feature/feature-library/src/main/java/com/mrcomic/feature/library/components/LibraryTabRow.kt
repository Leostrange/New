package com.mrcomic.feature.library.components

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.mrcomic.feature.library.LibraryTab

@Composable
fun LibraryTabRow(
    selectedTab: LibraryTab,
    onTabSelected: (LibraryTab) -> Unit,
    modifier: Modifier = Modifier
) {
    TabRow(
        selectedTabIndex = selectedTab.ordinal,
        modifier = modifier
    ) {
        LibraryTab.values().forEach { tab ->
            Tab(
                selected = selectedTab == tab,
                onClick = { onTabSelected(tab) },
                text = {
                    Text(
                        text = when (tab) {
                            LibraryTab.ALL -> "Все"
                            LibraryTab.FAVORITES -> "Избранное"
                            LibraryTab.IN_PROGRESS -> "В процессе"
                            LibraryTab.COMPLETED -> "Прочитано"
                        }
                    )
                }
            )
        }
    }
}