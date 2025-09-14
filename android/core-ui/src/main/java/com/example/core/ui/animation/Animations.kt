package com.example.core.ui.animation

import androidx.compose.animation.AnimatedVisibility
import androidx.compose.animation.AnimatedVisibilityScope
import androidx.compose.animation.EnterTransition
import androidx.compose.animation.ExitTransition
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.AnimationSpec
import androidx.compose.animation.core.FastOutSlowInEasing
import androidx.compose.animation.core.LinearOutSlowInEasing
import androidx.compose.animation.core.Spring
import androidx.compose.animation.core.animateFloatAsState
import androidx.compose.animation.core.spring
import androidx.compose.animation.core.tween
import androidx.compose.animation.expandHorizontally
import androidx.compose.animation.expandIn
import androidx.compose.animation.expandVertically
import androidx.compose.animation.fadeIn
import androidx.compose.animation.fadeOut
import androidx.compose.animation.scaleIn
import androidx.compose.animation.scaleOut
import androidx.compose.animation.shrinkHorizontally
import androidx.compose.animation.shrinkOut
import androidx.compose.animation.shrinkVertically
import androidx.compose.animation.slideInHorizontally
import androidx.compose.animation.slideInVertically
import androidx.compose.animation.slideOutHorizontally
import androidx.compose.animation.slideOutVertically
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.material3.MaterialTheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.alpha
import androidx.compose.ui.draw.scale
import androidx.compose.ui.graphics.TransformOrigin
import androidx.compose.ui.graphics.graphicsLayer
import androidx.compose.ui.unit.IntOffset
import androidx.compose.ui.unit.IntSize
import com.example.core.ui.theme.AnimationDurationLong
import com.example.core.ui.theme.AnimationDurationMedium
import com.example.core.ui.theme.AnimationDurationShort

/**
 * Material Motion animation specifications for MrComic
 */
object MrComicAnimations {

    /**
     * Standard easing curves
     */
    val standardEasing = FastOutSlowInEasing
    val decelerateEasing = LinearOutSlowInEasing

    /**
     * Animation durations
     */
    const val shortDuration = AnimationDurationShort
    const val mediumDuration = AnimationDurationMedium
    const val longDuration = AnimationDurationLong

    /**
     * Spring animation specs
     */
    val standardSpring = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessMedium
    )

    val gentleSpring = spring<Float>(
        dampingRatio = Spring.DampingRatioLowBouncy,
        stiffness = Spring.StiffnessLow
    )

    val bouncySpring = spring<Float>(
        dampingRatio = Spring.DampingRatioMediumBouncy,
        stiffness = Spring.StiffnessHigh
    )

    /**
     * Tween animation specs
     */
    val shortTween = tween<Float>(
        durationMillis = shortDuration,
        easing = standardEasing
    )

    val mediumTween = tween<Float>(
        durationMillis = mediumDuration,
        easing = standardEasing
    )

    val longTween = tween<Float>(
        durationMillis = longDuration,
        easing = standardEasing
    )
}

/**
 * Fade transition animations
 */
object FadeTransitions {
    val fadeIn = fadeIn(animationSpec = MrComicAnimations.mediumTween)
    val fadeOut = fadeOut(animationSpec = MrComicAnimations.mediumTween)
    
    val quickFadeIn = fadeIn(animationSpec = MrComicAnimations.shortTween)
    val quickFadeOut = fadeOut(animationSpec = MrComicAnimations.shortTween)
}

/**
 * Slide transition animations
 */
object SlideTransitions {
    // Horizontal slides
    val slideInFromLeft = slideInHorizontally(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        initialOffsetX = { -it }
    )
    
    val slideInFromRight = slideInHorizontally(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        initialOffsetX = { it }
    )
    
    val slideOutToLeft = slideOutHorizontally(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        targetOffsetX = { -it }
    )
    
    val slideOutToRight = slideOutHorizontally(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        targetOffsetX = { it }
    )

    // Vertical slides
    val slideInFromTop = slideInVertically(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        initialOffsetY = { -it }
    )
    
    val slideInFromBottom = slideInVertically(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        initialOffsetY = { it }
    )
    
    val slideOutToTop = slideOutVertically(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        targetOffsetY = { -it }
    )
    
    val slideOutToBottom = slideOutVertically(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        targetOffsetY = { it }
    )
}

/**
 * Scale transition animations
 */
object ScaleTransitions {
    val scaleIn = scaleIn(
        animationSpec = MrComicAnimations.mediumTween,
        transformOrigin = TransformOrigin.Center
    )
    
    val scaleOut = scaleOut(
        animationSpec = MrComicAnimations.mediumTween,
        transformOrigin = TransformOrigin.Center
    )
    
    val scaleInFromCorner = scaleIn(
        animationSpec = MrComicAnimations.mediumTween,
        transformOrigin = TransformOrigin(0f, 0f)
    )
}

/**
 * Expand/Shrink transition animations
 */
object ExpandTransitions {
    val expandIn = expandIn(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        expandFrom = androidx.compose.ui.Alignment.Center
    )
    
    val shrinkOut = shrinkOut(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing),
        shrinkTowards = androidx.compose.ui.Alignment.Center
    )
    
    val expandVertically = expandVertically(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing)
    )
    
    val shrinkVertically = shrinkVertically(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing)
    )
    
    val expandHorizontally = expandHorizontally(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing)
    )
    
    val shrinkHorizontally = shrinkHorizontally(
        animationSpec = tween(MrComicAnimations.mediumDuration, easing = MrComicAnimations.standardEasing)
    )
}

/**
 * Combined transition animations for common use cases
 */
object CombinedTransitions {
    // Fade + Scale (Material Design standard)
    val fadeInScale = FadeTransitions.fadeIn + ScaleTransitions.scaleIn
    val fadeOutScale = FadeTransitions.fadeOut + ScaleTransitions.scaleOut
    
    // Slide + Fade (Navigation transitions)
    val slideInFadeIn = SlideTransitions.slideInFromRight + FadeTransitions.fadeIn
    val slideOutFadeOut = SlideTransitions.slideOutToLeft + FadeTransitions.fadeOut
    
    // Expand + Fade (Dialog/Sheet animations)
    val expandFadeIn = ExpandTransitions.expandIn + FadeTransitions.fadeIn
    val shrinkFadeOut = ExpandTransitions.shrinkOut + FadeTransitions.fadeOut
}

/**
 * Animated visibility wrapper with predefined transitions
 */
@Composable
fun AnimatedVisibilityWrapper(
    visible: Boolean,
    modifier: Modifier = Modifier,
    enter: EnterTransition = CombinedTransitions.fadeInScale,
    exit: ExitTransition = CombinedTransitions.fadeOutScale,
    content: @Composable AnimatedVisibilityScope.() -> Unit
) {
    AnimatedVisibility(
        visible = visible,
        modifier = modifier,
        enter = enter,
        exit = exit,
        content = content
    )
}

/**
 * Shimmer loading animation
 */
@Composable
fun ShimmerBox(
    modifier: Modifier = Modifier,
    isLoading: Boolean = true
) {
    if (isLoading) {
        val shimmerAlpha = remember { Animatable(0.3f) }
        
        LaunchedEffect(Unit) {
            shimmerAlpha.animateTo(
                targetValue = 1f,
                animationSpec = tween(
                    durationMillis = 1000,
                    easing = FastOutSlowInEasing
                )
            )
            shimmerAlpha.animateTo(
                targetValue = 0.3f,
                animationSpec = tween(
                    durationMillis = 1000,
                    easing = FastOutSlowInEasing
                )
            )
        }
        
        Box(
            modifier = modifier
                .background(
                    MaterialTheme.colorScheme.surfaceVariant.copy(
                        alpha = shimmerAlpha.value
                    )
                )
        )
    }
}

/**
 * Bouncy scale animation for button press
 */
@Composable
fun Modifier.bouncyClick(
    enabled: Boolean = true,
    onClick: () -> Unit = {}
): Modifier {
    val scale by animateFloatAsState(
        targetValue = if (enabled) 1f else 0.95f,
        animationSpec = MrComicAnimations.bouncySpring,
        label = "bouncy_scale"
    )
    
    return this
        .scale(scale)
        .graphicsLayer {
            scaleX = scale
            scaleY = scale
        }
}

/**
 * Floating animation for FAB and other floating elements
 */
@Composable
fun Modifier.floatingAnimation(): Modifier {
    val offsetY by animateFloatAsState(
        targetValue = 0f,
        animationSpec = tween(
            durationMillis = 2000,
            easing = FastOutSlowInEasing
        ),
        label = "floating_animation"
    )
    
    return this.graphicsLayer {
        translationY = offsetY
    }
}

/**
 * Pulsing animation for attention-grabbing elements
 */
@Composable
fun Modifier.pulseAnimation(
    enabled: Boolean = true,
    minAlpha: Float = 0.5f,
    maxAlpha: Float = 1f
): Modifier {
    val alpha by animateFloatAsState(
        targetValue = if (enabled) maxAlpha else minAlpha,
        animationSpec = tween(
            durationMillis = 1500,
            easing = FastOutSlowInEasing
        ),
        label = "pulse_animation"
    )
    
    return this.alpha(alpha)
}