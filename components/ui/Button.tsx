import { ThemedText } from '@/components/themed-text';
import { Colors } from '@/constants/theme';
import React, { memo } from 'react';
import { TextStyle, TouchableOpacity, ViewStyle } from 'react-native';
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming
} from 'react-native-reanimated';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'small' | 'medium' | 'large';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  fullWidth?: boolean;
}

// Advanced button component with animations and variants
export const Button = memo<ButtonProps>(({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  style,
  textStyle,
  fullWidth = false,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(1);

  // Handle press animations
  const handlePressIn = () => {
    scale.value = withSpring(0.95, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(0.8, { duration: 100 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
    opacity.value = withTiming(1, { duration: 100 });
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      onPress();
    }
  };

  // Animated styles
  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  // Get button styles based on variant
  const getButtonStyle = (): ViewStyle => {
    const baseStyle: ViewStyle = {
      borderRadius: 12,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
    };

    // Size styles
    const sizeStyles: Record<string, ViewStyle> = {
      small: { paddingHorizontal: 16, paddingVertical: 8, minHeight: 36 },
      medium: { paddingHorizontal: 24, paddingVertical: 12, minHeight: 48 },
      large: { paddingHorizontal: 32, paddingVertical: 16, minHeight: 56 },
    };

    // Variant styles
    const variantStyles: Record<string, ViewStyle> = {
      primary: {
        backgroundColor: Colors.light.tint,
      },
      secondary: {
        backgroundColor: 'rgba(0,0,0,0.1)',
      },
      outline: {
        backgroundColor: 'transparent',
        borderWidth: 1,
        borderColor: Colors.light.tint,
      },
      ghost: {
        backgroundColor: 'transparent',
      },
    };

    return {
      ...baseStyle,
      ...sizeStyles[size],
      ...variantStyles[variant],
      ...(fullWidth && { width: '100%' }),
      ...(disabled && { opacity: 0.5 }),
    };
  };

  // Get text styles based on variant
  const getTextStyle = (): TextStyle => {
    const baseStyle: TextStyle = {
      fontSize: size === 'small' ? 14 : size === 'large' ? 18 : 16,
      fontWeight: '600',
    };

    const variantStyles: Record<string, TextStyle> = {
      primary: { color: 'white' },
      secondary: { color: Colors.light.text },
      outline: { color: Colors.light.tint },
      ghost: { color: Colors.light.tint },
    };

    return {
      ...baseStyle,
      ...variantStyles[variant],
    };
  };

  return (
    <Animated.View style={[animatedStyle, style]}>
      <TouchableOpacity
        style={getButtonStyle()}
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        disabled={disabled || loading}
        activeOpacity={0.8}
      >
        {loading ? (
          <ThemedText style={[getTextStyle(), textStyle]}>
            Loading...
          </ThemedText>
        ) : (
          <ThemedText style={[getTextStyle(), textStyle]}>
            {title}
          </ThemedText>
        )}
      </TouchableOpacity>
    </Animated.View>
  );
});

Button.displayName = 'Button';
