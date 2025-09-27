import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import React, { memo } from 'react';
import { ActivityIndicator, Dimensions, StyleSheet, View } from 'react-native';
import Animated, {
    Extrapolate,
    interpolate,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming,
} from 'react-native-reanimated';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface LoadingStatesProps {
  type?: 'cards' | 'profile' | 'matches' | 'messages' | 'general';
  message?: string;
  size?: 'small' | 'medium' | 'large';
  showProgress?: boolean;
  progress?: number;
}

// Sophisticated loading component with multiple states and animations
export const LoadingStates = memo<LoadingStatesProps>(({
  type = 'general',
  message,
  size = 'medium',
  showProgress = false,
  progress = 0,
}) => {
  // Animation values
  const rotation = useSharedValue(0);
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Start animations
  React.useEffect(() => {
    rotation.value = withRepeat(
      withTiming(360, { duration: 1000 }),
      -1,
      false
    );
    
    scale.value = withRepeat(
      withTiming(1.1, { duration: 800 }),
      -1,
      true
    );
  }, [rotation, scale]);

  // Animated styles
  const spinnerStyle = useAnimatedStyle(() => ({
    transform: [
      { rotate: `${rotation.value}deg` },
      { scale: scale.value },
    ],
  }));

  const progressStyle = useAnimatedStyle(() => ({
    width: `${progress}%`,
  }));

  // Get loading message based on type
  const getLoadingMessage = () => {
    if (message) return message;
    
    switch (type) {
      case 'cards':
        return 'Finding new people...';
      case 'profile':
        return 'Loading profile...';
      case 'matches':
        return 'Loading matches...';
      case 'messages':
        return 'Loading messages...';
      default:
        return 'Loading...';
    }
  };

  // Get spinner size
  const getSpinnerSize = () => {
    switch (size) {
      case 'small':
        return 20;
      case 'large':
        return 40;
      default:
        return 30;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={styles.content}>
        {/* Animated spinner */}
        <Animated.View style={[styles.spinnerContainer, spinnerStyle]}>
          <ActivityIndicator 
            size={getSpinnerSize()} 
            color={Colors.light.tint} 
          />
        </Animated.View>

        {/* Loading message */}
        <ThemedText style={styles.message}>
          {getLoadingMessage()}
        </ThemedText>

        {/* Progress bar */}
        {showProgress && (
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <Animated.View 
                style={[styles.progressFill, progressStyle]} 
              />
            </View>
            <ThemedText style={styles.progressText}>
              {Math.round(progress)}%
            </ThemedText>
          </View>
        )}

        {/* Loading dots animation */}
        <LoadingDots />
      </View>
    </ThemedView>
  );
});

LoadingStates.displayName = 'LoadingStates';

// Animated loading dots component
const LoadingDots = memo(() => {
  const dot1 = useSharedValue(0);
  const dot2 = useSharedValue(0);
  const dot3 = useSharedValue(0);

  React.useEffect(() => {
    const animateDot = (dot: Animated.SharedValue<number>, delay: number) => {
      dot.value = withRepeat(
        withTiming(1, { duration: 600 }),
        -1,
        true
      );
    };

    animateDot(dot1, 0);
    animateDot(dot2, 200);
    animateDot(dot3, 400);
  }, [dot1, dot2, dot3]);

  const dot1Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot1.value, [0, 1], [0.3, 1], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(dot1.value, [0, 1], [0.8, 1.2], Extrapolate.CLAMP) }],
  }));

  const dot2Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot2.value, [0, 1], [0.3, 1], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(dot2.value, [0, 1], [0.8, 1.2], Extrapolate.CLAMP) }],
  }));

  const dot3Style = useAnimatedStyle(() => ({
    opacity: interpolate(dot3.value, [0, 1], [0.3, 1], Extrapolate.CLAMP),
    transform: [{ scale: interpolate(dot3.value, [0, 1], [0.8, 1.2], Extrapolate.CLAMP) }],
  }));

  return (
    <View style={styles.dotsContainer}>
      <Animated.View style={[styles.dot, dot1Style]} />
      <Animated.View style={[styles.dot, dot2Style]} />
      <Animated.View style={[styles.dot, dot3Style]} />
    </View>
  );
});

LoadingDots.displayName = 'LoadingDots';

// Skeleton loading component for cards
export const CardSkeleton = memo(() => {
  const shimmer = useSharedValue(0);

  React.useEffect(() => {
    shimmer.value = withRepeat(
      withTiming(1, { duration: 1500 }),
      -1,
      false
    );
  }, [shimmer]);

  const shimmerStyle = useAnimatedStyle(() => ({
    opacity: interpolate(shimmer.value, [0, 0.5, 1], [0.3, 0.8, 0.3], Extrapolate.CLAMP),
  }));

  return (
    <ThemedView style={styles.skeletonCard}>
      <Animated.View style={[styles.skeletonImage, shimmerStyle]} />
      <View style={styles.skeletonContent}>
        <Animated.View style={[styles.skeletonLine, styles.skeletonTitle, shimmerStyle]} />
        <Animated.View style={[styles.skeletonLine, styles.skeletonSubtitle, shimmerStyle]} />
        <Animated.View style={[styles.skeletonLine, styles.skeletonBio, shimmerStyle]} />
      </View>
    </ThemedView>
  );
});

CardSkeleton.displayName = 'CardSkeleton';

// Empty state component
export const EmptyState = memo<{ 
  title: string; 
  subtitle?: string; 
  actionText?: string; 
  onAction?: () => void; 
}>(({ title, subtitle, actionText, onAction }) => {
  return (
    <ThemedView style={styles.emptyContainer}>
      <ThemedText style={styles.emptyTitle}>{title}</ThemedText>
      {subtitle && (
        <ThemedText style={styles.emptySubtitle}>{subtitle}</ThemedText>
      )}
      {actionText && onAction && (
        <ThemedView style={styles.emptyAction}>
          <ThemedText style={styles.emptyActionText} onPress={onAction}>
            {actionText}
          </ThemedText>
        </ThemedView>
      )}
    </ThemedView>
  );
});

EmptyState.displayName = 'EmptyState';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  spinnerContainer: {
    marginBottom: 16,
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: Colors.light.text,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '100%',
    height: 4,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.light.tint,
    borderRadius: 2,
  },
  progressText: {
    fontSize: 12,
    color: Colors.light.text,
    opacity: 0.7,
  },
  dotsContainer: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.light.tint,
  },
  skeletonCard: {
    width: SCREEN_WIDTH - 40,
    height: 400,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.05)',
    overflow: 'hidden',
  },
  skeletonImage: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.1)',
  },
  skeletonContent: {
    padding: 20,
    gap: 12,
  },
  skeletonLine: {
    height: 16,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 8,
  },
  skeletonTitle: {
    width: '60%',
    height: 20,
  },
  skeletonSubtitle: {
    width: '40%',
  },
  skeletonBio: {
    width: '80%',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
    color: Colors.light.text,
  },
  emptySubtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 24,
    color: Colors.light.text,
    opacity: 0.7,
    lineHeight: 22,
  },
  emptyAction: {
    backgroundColor: Colors.light.tint,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyActionText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
