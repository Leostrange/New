package com.example.core.ui.components

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.core.tween
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Check
import androidx.compose.material.icons.filled.Close
import androidx.compose.material.icons.filled.Error
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Search
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ElevatedButton
import androidx.compose.material3.ElevatedCard
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilledTonalButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.OutlinedCard
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.SearchBar
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.material3.Surface
import androidx.compose.material3.Switch
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.material3.TextField
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.example.core.ui.theme.AnimationDurationMedium
import com.example.core.ui.theme.ComicShapes
import com.example.core.ui.theme.CornerRadiusMedium
import com.example.core.ui.theme.ElevationMedium
import com.example.core.ui.theme.IconSizeMedium
import com.example.core.ui.theme.PaddingLarge
import com.example.core.ui.theme.PaddingMedium
import com.example.core.ui.theme.PaddingSmall

/**
 * Material Design 3 Button variants for MrComic
 */
@Composable
fun MrComicButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    text: String,
    leadingIcon: ImageVector? = null,
    variant: ButtonVariant = ButtonVariant.Primary
) {
    val buttonContent: @Composable () -> Unit = {
        Row(
            horizontalArrangement = Arrangement.Center,
            verticalAlignment = Alignment.CenterVertically
        ) {
            leadingIcon?.let { icon ->
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    modifier = Modifier.size(IconSizeMedium)
                )
                Spacer(modifier = Modifier.width(PaddingMedium))
            }
            Text(text = text)
        }
    }

    when (variant) {
        ButtonVariant.Primary -> Button(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            content = { buttonContent() }
        )
        ButtonVariant.Secondary -> FilledTonalButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            content = { buttonContent() }
        )
        ButtonVariant.Outlined -> OutlinedButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            content = { buttonContent() }
        )
        ButtonVariant.Text -> TextButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            content = { buttonContent() }
        )
        ButtonVariant.Elevated -> ElevatedButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            content = { buttonContent() }
        )
    }
}

enum class ButtonVariant {
    Primary, Secondary, Outlined, Text, Elevated
}

/**
 * Material Design 3 Card variants for MrComic
 */
@Composable
fun MrComicCard(
    modifier: Modifier = Modifier,
    onClick: (() -> Unit)? = null,
    variant: CardVariant = CardVariant.Filled,
    content: @Composable () -> Unit
) {
    val cardModifier = if (onClick != null) {
        modifier.clickable { onClick() }
    } else {
        modifier
    }

    when (variant) {
        CardVariant.Filled -> Card(
            modifier = cardModifier,
            content = { content() }
        )
        CardVariant.Elevated -> ElevatedCard(
            modifier = cardModifier,
            content = { content() }
        )
        CardVariant.Outlined -> OutlinedCard(
            modifier = cardModifier,
            content = { content() }
        )
    }
}

enum class CardVariant {
    Filled, Elevated, Outlined
}

/**
 * Loading indicator with text
 */
@Composable
fun LoadingIndicator(
    modifier: Modifier = Modifier,
    text: String = "Loading...",
    isLinear: Boolean = false
) {
    Column(
        modifier = modifier,
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        if (isLinear) {
            LinearProgressIndicator(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = PaddingLarge)
            )
        } else {
            CircularProgressIndicator()
        }
        Spacer(modifier = Modifier.height(PaddingMedium))
        Text(
            text = text,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
    }
}

/**
 * Empty state component
 */
@Composable
fun EmptyState(
    modifier: Modifier = Modifier,
    icon: ImageVector,
    title: String,
    description: String,
    actionText: String? = null,
    onActionClick: (() -> Unit)? = null
) {
    Column(
        modifier = modifier.padding(PaddingLarge),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Icon(
            imageVector = icon,
            contentDescription = null,
            modifier = Modifier.size(64.dp),
            tint = MaterialTheme.colorScheme.outline
        )
        Spacer(modifier = Modifier.height(PaddingLarge))
        Text(
            text = title,
            style = MaterialTheme.typography.headlineSmall,
            color = MaterialTheme.colorScheme.onSurface,
            textAlign = TextAlign.Center
        )
        Spacer(modifier = Modifier.height(PaddingMedium))
        Text(
            text = description,
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant,
            textAlign = TextAlign.Center
        )
        
        if (actionText != null && onActionClick != null) {
            Spacer(modifier = Modifier.height(PaddingLarge))
            MrComicButton(
                onClick = onActionClick,
                text = actionText,
                variant = ButtonVariant.Primary
            )
        }
    }
}

/**
 * Status message component
 */
@Composable
fun StatusMessage(
    message: String,
    modifier: Modifier = Modifier,
    type: StatusType = StatusType.Info,
    isVisible: Boolean = true,
    onDismiss: (() -> Unit)? = null
) {
    AnimatedVisibility(
        visible = isVisible,
        enter = slideInVertically(
            animationSpec = tween(AnimationDurationMedium),
            initialOffsetY = { -it }
        ) + fadeIn(animationSpec = tween(AnimationDurationMedium)),
        exit = slideOutVertically(
            animationSpec = tween(AnimationDurationMedium),
            targetOffsetY = { -it }
        ) + fadeOut(animationSpec = tween(AnimationDurationMedium))
    ) {
        Surface(
            modifier = modifier
                .fillMaxWidth()
                .padding(PaddingMedium),
            shape = RoundedCornerShape(CornerRadiusMedium),
            color = when (type) {
                StatusType.Success -> MaterialTheme.colorScheme.primaryContainer
                StatusType.Error -> MaterialTheme.colorScheme.errorContainer
                StatusType.Warning -> MaterialTheme.colorScheme.tertiaryContainer
                StatusType.Info -> MaterialTheme.colorScheme.surfaceVariant
            },
            shadowElevation = ElevationMedium
        ) {
            Row(
                modifier = Modifier.padding(PaddingMedium),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = when (type) {
                        StatusType.Success -> Icons.Default.Check
                        StatusType.Error -> Icons.Default.Error
                        StatusType.Warning -> Icons.Default.Warning
                        StatusType.Info -> Icons.Default.Info
                    },
                    contentDescription = null,
                    modifier = Modifier.size(IconSizeMedium),
                    tint = when (type) {
                        StatusType.Success -> MaterialTheme.colorScheme.onPrimaryContainer
                        StatusType.Error -> MaterialTheme.colorScheme.onErrorContainer
                        StatusType.Warning -> MaterialTheme.colorScheme.onTertiaryContainer
                        StatusType.Info -> MaterialTheme.colorScheme.onSurfaceVariant
                    }
                )
                Spacer(modifier = Modifier.width(PaddingMedium))
                Text(
                    text = message,
                    style = MaterialTheme.typography.bodyMedium,
                    color = when (type) {
                        StatusType.Success -> MaterialTheme.colorScheme.onPrimaryContainer
                        StatusType.Error -> MaterialTheme.colorScheme.onErrorContainer
                        StatusType.Warning -> MaterialTheme.colorScheme.onTertiaryContainer
                        StatusType.Info -> MaterialTheme.colorScheme.onSurfaceVariant
                    },
                    modifier = Modifier.weight(1f)
                )
                
                onDismiss?.let { dismiss ->
                    IconButton(
                        onClick = dismiss,
                        modifier = Modifier.size(IconSizeMedium)
                    ) {
                        Icon(
                            imageVector = Icons.Default.Close,
                            contentDescription = "Dismiss",
                            tint = when (type) {
                                StatusType.Success -> MaterialTheme.colorScheme.onPrimaryContainer
                                StatusType.Error -> MaterialTheme.colorScheme.onErrorContainer
                                StatusType.Warning -> MaterialTheme.colorScheme.onTertiaryContainer
                                StatusType.Info -> MaterialTheme.colorScheme.onSurfaceVariant
                            }
                        )
                    }
                }
            }
        }
    }
}

enum class StatusType {
    Success, Error, Warning, Info
}

/**
 * Modern search bar component
 */
@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun MrComicSearchBar(
    query: String,
    onQueryChange: (String) -> Unit,
    onSearch: (String) -> Unit,
    active: Boolean,
    onActiveChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    placeholder: String = "Search...",
    content: @Composable () -> Unit = {}
) {
    SearchBar(
        query = query,
        onQueryChange = onQueryChange,
        onSearch = onSearch,
        active = active,
        onActiveChange = onActiveChange,
        modifier = modifier,
        placeholder = { Text(placeholder) },
        leadingIcon = {
            Icon(
                imageVector = Icons.Default.Search,
                contentDescription = "Search"
            )
        },
        trailingIcon = if (query.isNotEmpty()) {
            {
                IconButton(onClick = { onQueryChange("") }) {
                    Icon(
                        imageVector = Icons.Default.Close,
                        contentDescription = "Clear"
                    )
                }
            }
        } else null,
        content = { content() }
    )
}

/**
 * Settings item component
 */
@Composable
fun SettingsItem(
    title: String,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    icon: ImageVector? = null,
    trailing: @Composable (() -> Unit)? = null,
    onClick: (() -> Unit)? = null
) {
    val itemModifier = if (onClick != null) {
        modifier.clickable { onClick() }
    } else {
        modifier
    }

    Row(
        modifier = itemModifier
            .fillMaxWidth()
            .padding(horizontal = PaddingLarge, vertical = PaddingMedium),
        verticalAlignment = Alignment.CenterVertically
    ) {
        icon?.let { iconVector ->
            Icon(
                imageVector = iconVector,
                contentDescription = null,
                modifier = Modifier.size(IconSizeMedium),
                tint = MaterialTheme.colorScheme.onSurfaceVariant
            )
            Spacer(modifier = Modifier.width(PaddingLarge))
        }

        Column(modifier = Modifier.weight(1f)) {
            Text(
                text = title,
                style = MaterialTheme.typography.bodyLarge,
                color = MaterialTheme.colorScheme.onSurface
            )
            subtitle?.let { sub ->
                Text(
                    text = sub,
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }
        }

        trailing?.invoke()
    }
}

/**
 * Switch settings item
 */
@Composable
fun SwitchSettingsItem(
    title: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit,
    modifier: Modifier = Modifier,
    subtitle: String? = null,
    icon: ImageVector? = null,
    enabled: Boolean = true
) {
    SettingsItem(
        title = title,
        subtitle = subtitle,
        icon = icon,
        modifier = modifier,
        trailing = {
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                enabled = enabled
            )
        },
        onClick = if (enabled) { { onCheckedChange(!checked) } } else null
    )
}