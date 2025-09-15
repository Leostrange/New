package com.mrcomic.feature.reader.components

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.mrcomic.core.model.ReadingDirection
import com.mrcomic.core.model.ReadingMode
import com.mrcomic.core.model.ScalingMode
import com.mrcomic.core.ui.components.SettingsSliderCard
import com.mrcomic.core.ui.components.SettingsToggleCard
import com.mrcomic.feature.reader.ReaderUiState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ReaderSettingsBottomSheet(
    uiState: ReaderUiState,
    onReadingModeChange: (ReadingMode) -> Unit,
    onReadingDirectionChange: (ReadingDirection) -> Unit,
    onScalingModeChange: (ScalingMode) -> Unit,
    onBrightnessChange: (Float) -> Unit,
    onDismiss: () -> Unit,
    modifier: Modifier = Modifier
) {
    val bottomSheetState = rememberModalBottomSheetState(
        skipPartiallyExpanded = true
    )

    LaunchedEffect(Unit) {
        bottomSheetState.show()
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = bottomSheetState,
        modifier = modifier
    ) {
        LazyColumn(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            item {
                Text(
                    text = "Настройки чтения",
                    style = MaterialTheme.typography.headlineSmall,
                    modifier = Modifier.padding(bottom = 8.dp)
                )
            }

            // Reading Mode
            item {
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.MenuBook,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "Режим чтения",
                                style = MaterialTheme.typography.titleMedium
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        ReadingMode.values().forEach { mode ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = uiState.readingMode == mode,
                                    onClick = { onReadingModeChange(mode) }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = when (mode) {
                                        ReadingMode.PAGE_BY_PAGE -> "Постраничный"
                                        ReadingMode.DOUBLE_PAGE -> "Двухстраничный"
                                        ReadingMode.VERTICAL_SCROLL -> "Вертикальная прокрутка"
                                        ReadingMode.CONTINUOUS_SCROLL -> "Непрерывная прокрутка"
                                    }
                                )
                            }
                        }
                    }
                }
            }

            // Reading Direction
            item {
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.SwapHoriz,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "Направление чтения",
                                style = MaterialTheme.typography.titleMedium
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        ReadingDirection.values().forEach { direction ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = uiState.readingDirection == direction,
                                    onClick = { onReadingDirectionChange(direction) }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = when (direction) {
                                        ReadingDirection.LEFT_TO_RIGHT -> "Слева направо"
                                        ReadingDirection.RIGHT_TO_LEFT -> "Справа налево"
                                        ReadingDirection.TOP_TO_BOTTOM -> "Сверху вниз"
                                    }
                                )
                            }
                        }
                    }
                }
            }

            // Scaling Mode
            item {
                Card(
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(16.dp)
                    ) {
                        Row(
                            verticalAlignment = Alignment.CenterVertically,
                            horizontalArrangement = Arrangement.spacedBy(8.dp)
                        ) {
                            Icon(
                                imageVector = Icons.Default.ZoomIn,
                                contentDescription = null,
                                tint = MaterialTheme.colorScheme.primary
                            )
                            Text(
                                text = "Масштабирование",
                                style = MaterialTheme.typography.titleMedium
                            )
                        }

                        Spacer(modifier = Modifier.height(12.dp))

                        ScalingMode.values().forEach { mode ->
                            Row(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .padding(vertical = 4.dp),
                                verticalAlignment = Alignment.CenterVertically
                            ) {
                                RadioButton(
                                    selected = uiState.scalingMode == mode,
                                    onClick = { onScalingModeChange(mode) }
                                )
                                Spacer(modifier = Modifier.width(8.dp))
                                Text(
                                    text = when (mode) {
                                        ScalingMode.FIT_WIDTH -> "По ширине"
                                        ScalingMode.FIT_HEIGHT -> "По высоте"
                                        ScalingMode.ORIGINAL_SIZE -> "Оригинальный размер"
                                        ScalingMode.SMART_FIT -> "Умное масштабирование"
                                    }
                                )
                            }
                        }
                    }
                }
            }

            // Brightness
            item {
                SettingsSliderCard(
                    title = "Яркость",
                    subtitle = "Настройка яркости экрана",
                    icon = Icons.Default.Brightness6,
                    value = uiState.brightness,
                    onValueChange = onBrightnessChange,
                    valueRange = 0f..1f,
                    valueFormatter = { "${(it * 100).toInt()}%" }
                )
            }

            // Bottom padding for gesture navigation
            item {
                Spacer(modifier = Modifier.height(32.dp))
            }
        }
    }
}