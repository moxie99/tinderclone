import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Platform, StyleSheet, ViewStyle } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

interface SafeAreaWrapperProps {
  children: React.ReactNode;
  style?: ViewStyle;
  edges?: ('top' | 'bottom' | 'left' | 'right')[];
  backgroundColor?: string;
  forceInset?: boolean;
}

/**
 * Senior-level SafeAreaView wrapper with advanced theming and edge control
 * Provides consistent safe area handling across the app with proper dark/light mode support
 */
export const SafeAreaWrapper: React.FC<SafeAreaWrapperProps> = ({
  children,
  style,
  edges = ['top', 'bottom', 'left', 'right'],
  backgroundColor,
  forceInset = false,
}) => {
  const colorScheme = useColorScheme();
  const insets = useSafeAreaInsets();

  const dynamicBackgroundColor = backgroundColor || Colors[colorScheme ?? 'light'].background;

  // For Android, add extra bottom padding to account for navigation buttons
  const androidBottomPadding = Platform.OS === 'android' ? 8 : 0;

  return (
    <SafeAreaView
      style={[
        styles.container,
        { 
          backgroundColor: dynamicBackgroundColor,
          paddingBottom: Platform.OS === 'android' ? androidBottomPadding : 0,
        },
        style,
      ]}
      edges={edges}
      forceInset={forceInset}
    >
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
