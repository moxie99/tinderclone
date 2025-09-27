import { SwipeAction, SwipeThresholds } from '@/types';
import { useCallback } from 'react';
import { Dimensions } from 'react-native';
import {
    Gesture
} from 'react-native-gesture-handler';
import {
    Extrapolate,
    interpolate,
    runOnJS,
    useAnimatedStyle,
    useDerivedValue,
    useSharedValue,
    withSpring,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default thresholds for swipe detection
const DEFAULT_THRESHOLDS: SwipeThresholds = {
  like: SCREEN_WIDTH * 0.25,
  pass: -SCREEN_WIDTH * 0.25,
  superlike: -SCREEN_WIDTH * 0.1,
};

interface UseSwipeGestureProps {
  onSwipe: (action: SwipeAction) => void;
  onSwipeStart?: () => void;
  onSwipeEnd?: () => void;
  thresholds?: Partial<SwipeThresholds>;
  enableRotation?: boolean;
  enableScale?: boolean;
}

/**
 * Simplified and robust swipe gesture hook
 * Prevents crashes by using safer callback patterns
 */
export function useSwipeGestureSimple({
  onSwipe,
  onSwipeStart,
  onSwipeEnd,
  thresholds = {},
  enableRotation = true,
  enableScale = true,
}: UseSwipeGestureProps) {
  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  
  // Shared values for animation
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Gesture state tracking
  const isGestureActive = useSharedValue(false);

  // Safe callback functions
  const handleSwipeStart = useCallback(() => {
    try {
      onSwipeStart?.();
    } catch (error) {
      console.warn('Swipe start callback error:', error);
    }
  }, [onSwipeStart]);

  const handleSwipeEnd = useCallback(() => {
    try {
      onSwipeEnd?.();
    } catch (error) {
      console.warn('Swipe end callback error:', error);
    }
  }, [onSwipeEnd]);

  const handleSwipeAction = useCallback((action: SwipeAction) => {
    try {
      onSwipe(action);
    } catch (error) {
      console.warn('Swipe action callback error:', error);
    }
  }, [onSwipe]);

  // Derived values for visual feedback
  const likeOpacity = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [0, finalThresholds.like],
      [0, 1],
      Extrapolate.CLAMP
    );
  });

  const passOpacity = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [finalThresholds.pass, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
  });

  const superlikeOpacity = useDerivedValue(() => {
    return interpolate(
      translateY.value,
      [finalThresholds.superlike, 0],
      [1, 0],
      Extrapolate.CLAMP
    );
  });

  // Pan gesture handler
  const panGesture = Gesture.Pan()
    .onStart(() => {
      isGestureActive.value = true;
      runOnJS(handleSwipeStart)();
    })
    .onUpdate((event) => {
      translateX.value = event.translationX;
      translateY.value = event.translationY;
      
      // Rotation based on horizontal movement
      if (enableRotation) {
        rotation.value = interpolate(
          translateX.value,
          [-SCREEN_WIDTH, SCREEN_WIDTH],
          [-15, 15],
          Extrapolate.CLAMP
        );
      }
      
      // Scale based on vertical movement
      if (enableScale) {
        scale.value = interpolate(
          translateY.value,
          [finalThresholds.superlike, 0],
          [0.95, 1],
          Extrapolate.CLAMP
        );
      }
    })
    .onEnd((event) => {
      isGestureActive.value = false;
      
      const velocityX = event.velocityX;
      const velocityY = event.velocityY;
      const translationX = event.translationX;
      const translationY = event.translationY;
      
      // Determine swipe action
      let action: SwipeAction['type'] | null = null;
      
      if (translationY < finalThresholds.superlike || velocityY < -1000) {
        action = 'superlike';
      } else if (translationX > finalThresholds.like || velocityX > 1000) {
        action = 'like';
      } else if (translationX < finalThresholds.pass || velocityX < -1000) {
        action = 'pass';
      }
      
      if (action) {
        // Animate card off screen
        const exitDirection = action === 'like' ? SCREEN_WIDTH : -SCREEN_WIDTH;
        translateX.value = withTiming(exitDirection, { duration: 200 });
        opacity.value = withTiming(0, { duration: 200 }, (finished) => {
          if (finished) {
            runOnJS(handleSwipeAction)({
              type: action!,
              userId: '',
              timestamp: new Date(),
            });
          }
        });
      } else {
        // Return to center
        translateX.value = withSpring(0, { damping: 15, stiffness: 150 });
        translateY.value = withSpring(0, { damping: 15, stiffness: 150 });
        rotation.value = withSpring(0, { damping: 15, stiffness: 150 });
        scale.value = withSpring(1, { damping: 15, stiffness: 150 });
      }
      
      runOnJS(handleSwipeEnd)();
    });

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: translateX.value },
      { translateY: translateY.value },
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
    opacity: opacity.value,
  }));

  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: passOpacity.value,
  }));

  const superlikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: superlikeOpacity.value,
  }));

  // Reset function
  const reset = useCallback(() => {
    translateX.value = 0;
    translateY.value = 0;
    rotation.value = 0;
    scale.value = 1;
    opacity.value = 1;
    isGestureActive.value = false;
  }, [translateX, translateY, rotation, scale, opacity, isGestureActive]);

  return {
    panGesture,
    animatedStyle,
    likeOverlayStyle,
    passOverlayStyle,
    superlikeOverlayStyle,
    reset,
    isGestureActive,
  };
}
