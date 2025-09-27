import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { StyleSheet, Text, type TextProps } from 'react-native';

export type ThemedTextProps = TextProps & {
  lightColor?: string;
  darkColor?: string;
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link' | 'caption' | 'body' | 'heading';
  variant?: 'primary' | 'secondary' | 'tertiary' | 'accent' | 'error' | 'success' | 'warning';
};

/**
 * Senior-level ThemedText component with advanced color variants and proper dark/light mode handling
 * Provides consistent typography across the app with semantic color variants
 */
export function ThemedText({
  style,
  lightColor,
  darkColor,
  type = 'default',
  variant = 'primary',
  ...rest
}: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const themeColors = Colors[colorScheme ?? 'light'];

  // Get color based on variant and theme
  const getTextColor = () => {
    if (lightColor && darkColor) {
      return colorScheme === 'dark' ? darkColor : lightColor;
    }

    switch (variant) {
      case 'primary':
        return themeColors.text;
      case 'secondary':
        return colorScheme === 'dark' ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.7)';
      case 'tertiary':
        return colorScheme === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.5)';
      case 'accent':
        return themeColors.tint;
      case 'error':
        return colorScheme === 'dark' ? '#FF6B6B' : '#DC2626';
      case 'success':
        return colorScheme === 'dark' ? '#4ADE80' : '#16A34A';
      case 'warning':
        return colorScheme === 'dark' ? '#FBBF24' : '#D97706';
      default:
        return themeColors.text;
    }
  };

  const textColor = getTextColor();

  return (
    <Text
      style={[
        { color: textColor },
        type === 'default' ? styles.default : undefined,
        type === 'title' ? styles.title : undefined,
        type === 'defaultSemiBold' ? styles.defaultSemiBold : undefined,
        type === 'subtitle' ? styles.subtitle : undefined,
        type === 'link' ? styles.link : undefined,
        type === 'caption' ? styles.caption : undefined,
        type === 'body' ? styles.body : undefined,
        type === 'heading' ? styles.heading : undefined,
        style,
      ]}
      {...rest}
    />
  );
}

const styles = StyleSheet.create({
  default: {
    fontSize: 16,
    lineHeight: 24,
  },
  defaultSemiBold: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  link: {
    lineHeight: 30,
    fontSize: 16,
  },
  caption: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: '500',
  },
  body: {
    fontSize: 14,
    lineHeight: 20,
  },
  heading: {
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '700',
  },
});
