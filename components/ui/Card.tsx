import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import React, { memo } from 'react';
import { ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring
} from 'react-native-reanimated';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'elevated' | 'outlined' | 'flat';
  padding?: 'none' | 'small' | 'medium' | 'large';
  style?: ViewStyle;
  onPress?: () => void;
  disabled?: boolean;
}

// Advanced card component with variants and animations
export const Card = memo<CardProps>(({
  children,
  variant = 'default',
  padding = 'medium',
  style,
  onPress,
  disabled = false,
}) => {
  const scale = useSharedValue(1);

  // Handle press animations
  const handlePressIn = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 150 });
    }
  };

  const handlePressOut = () => {
    if (onPress && !disabled) {
      scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  // Get card styles based on variant
  const getCardStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      backgroundColor: Colors.light.background,
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      default: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 2,
      },
      elevated: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 4,
      },
      outlined: {
        borderWidth: 1,
        borderColor: 'rgba(0,0,0,0.1)',
      },
      flat: {
        // No shadows or borders
      },
    };

    // Padding styles
    const paddingStyles: Record<string, ViewStyle> = {
      none: {},
      small: { padding: 8 },
      medium: { padding: 16 },
      large: { padding: 24 },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
      ...paddingStyles[padding],
      ...(disabled && { opacity: 0.5 }),
    };
  };

  const cardContent = (
    <Animated.View style={[animatedStyle, style]}>
      <ThemedView style={getCardStyle()}>
        {children}
      </ThemedView>
    </Animated.View>
  );

  if (onPress && !disabled) {
    return (
      <Animated.View
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
        onTouchCancel={handlePressOut}
      >
        {cardContent}
      </Animated.View>
    );
  }

  return cardContent;
});

Card.displayName = 'Card';
