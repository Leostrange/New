package com.mrcomic.core.ui.components

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.vector.ImageVector
import androidx.compose.ui.unit.dp

@Composable
fun MrComicButton(
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    variant: ButtonVariant = ButtonVariant.Primary,
    size: ButtonSize = ButtonSize.Default,
    icon: ImageVector? = null,
    content: @Composable RowScope.() -> Unit
) {
    when (variant) {
        ButtonVariant.Primary -> {
            Button(
                onClick = onClick,
                modifier = modifier.then(size.modifier),
                enabled = enabled,
                colors = ButtonDefaults.buttonColors()
            ) {
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                content()
            }
        }
        ButtonVariant.Secondary -> {
            OutlinedButton(
                onClick = onClick,
                modifier = modifier.then(size.modifier),
                enabled = enabled
            ) {
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                content()
            }
        }
        ButtonVariant.Ghost -> {
            TextButton(
                onClick = onClick,
                modifier = modifier.then(size.modifier),
                enabled = enabled
            ) {
                if (icon != null) {
                    Icon(
                        imageVector = icon,
                        contentDescription = null,
                        modifier = Modifier.size(18.dp)
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                }
                content()
            }
        }
    }
}

enum class ButtonVariant {
    Primary, Secondary, Ghost
}

enum class ButtonSize(val modifier: Modifier) {
    Small(Modifier.height(32.dp)),
    Default(Modifier.height(40.dp)),
    Large(Modifier.height(48.dp))
}
