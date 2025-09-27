import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { LogBox } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { ErrorBoundary } from '@/components/ErrorBoundary';
import { MatchModal } from '@/components/modals/MatchModal';
import { AppProvider } from '@/context/AppContext';
import { MatchModalProvider, useMatchModal } from '@/context/MatchModalContext';
import { useColorScheme } from '@/hooks/use-color-scheme';

// Ignore specific warnings
LogBox.ignoreLogs([
  'Warning: ReactDOM.render is no longer supported',
  'Warning: componentWillReceiveProps has been renamed',
]);

export const unstable_settings = {
  anchor: '(tabs)',
};

function AppContent() {
  const colorScheme = useColorScheme();
  const { isVisible, matchedUser, hideMatchModal } = useMatchModal();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
        <Stack.Screen name="chat/[id]" options={{ headerShown: false }} />
      </Stack>
      <StatusBar style="auto" />
      <MatchModal
        visible={isVisible}
        onClose={hideMatchModal}
        matchedUser={matchedUser}
      />
    </ThemeProvider>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <ErrorBoundary>
        <AppProvider>
          <MatchModalProvider>
            <AppContent />
          </MatchModalProvider>
        </AppProvider>
      </ErrorBoundary>
    </SafeAreaProvider>
  );
}
