import { SwipeAction, SwipeThresholds } from '@/types';
import { useCallback, useRef } from 'react';
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

export function useSwipeGesture({
  onSwipe,
  onSwipeStart,
  onSwipeEnd,
  thresholds = {},
  enableRotation = true,
  enableScale = true,
}: UseSwipeGestureProps) {
  // Always call hooks at the top level - no conditional calls
  const finalThresholds = { ...DEFAULT_THRESHOLDS, ...thresholds };
  
  // Shared values for animation - these must always be called
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);
  
  // Gesture state tracking
  const isGestureActive = useSharedValue(false);
  const gestureStartTime = useRef<number>(0);

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

  // Callback functions that run on JS thread
  const handleSwipeStart = useCallback(() => {
    gestureStartTime.current = Date.now();
    onSwipeStart?.();
  }, [onSwipeStart]);

  const handleSwipeEnd = useCallback(() => {
    onSwipeEnd?.();
  }, [onSwipeEnd]);

  const handleSwipeAction = useCallback((action: SwipeAction) => {
    onSwipe(action);
  }, [onSwipe]);

  // Pan gesture handler with advanced physics
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
      
      // Scale based on vertical movement (for superlike effect)
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
      
      // Determine swipe action based on position and velocity
      let action: SwipeAction['type'] | null = null;
      
      // Check for superlike (upward swipe)
      if (translationY < finalThresholds.superlike || velocityY < -1000) {
        action = 'superlike';
      }
      // Check for like (right swipe)
      else if (translationX > finalThresholds.like || velocityX > 1000) {
        action = 'like';
      }
      // Check for pass (left swipe)
      else if (translationX < finalThresholds.pass || velocityX < -1000) {
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
              userId: '', // This will be set by the card component
              timestamp: new Date(),
            });
          }
        });
      } else {
        // Return to center with spring animation
        translateX.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        translateY.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        rotation.value = withSpring(0, {
          damping: 15,
          stiffness: 150,
        });
        scale.value = withSpring(1, {
          damping: 15,
          stiffness: 150,
        });
      }
      
      runOnJS(handleSwipeEnd)();
    });

  // Animated styles for the card
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
        { rotate: `${rotation.value}deg` },
        { scale: scale.value },
      ],
      opacity: opacity.value,
    };
  });

  // Animated styles for overlay indicators
  const likeOverlayStyle = useAnimatedStyle(() => ({
    opacity: likeOpacity.value,
  }));

  const passOverlayStyle = useAnimatedStyle(() => ({
    opacity: passOpacity.value,
  }));

  const superlikeOverlayStyle = useAnimatedStyle(() => ({
    opacity: superlikeOpacity.value,
  }));

  // Reset function for programmatic control
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
