/**
 * Onda do Bem — Root Layout
 *
 * Layout raiz que envolve toda a aplicação com:
 * - AppProviders (ErrorBoundary, QueryClient)
 * - ThemeProvider do Expo Router
 * - Splash screen control
 * - Auth initialization
 *
 * As rotas filhas (auth, onboarding, main) são renderizadas pelo Slot.
 */

import { useEffect } from 'react';
import { useColorScheme } from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider, Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';

import { AppProviders } from '@/providers/app-providers';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { Colors } from '@/constants/theme';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const themeMode = useThemeStore((s) => s.mode);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const isAuthInitialized = useAuthStore((s) => s.isInitialized);

  // Initialize auth on app boot
  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  // Sync system color scheme changes when mode is 'system'
  useEffect(() => {
    if (themeMode === 'system' && systemColorScheme) {
      useThemeStore.getState().setMode('system');
    }
  }, [systemColorScheme, themeMode]);

  // Hide splash screen once auth is initialized
  useEffect(() => {
    if (isAuthInitialized) {
      SplashScreen.hideAsync();
    }
  }, [isAuthInitialized]);

  const navigationTheme = resolvedTheme === 'dark' ? DarkTheme : DefaultTheme;

  // Customize navigation theme with our design tokens
  const customTheme = {
    ...navigationTheme,
    colors: {
      ...navigationTheme.colors,
      primary: Colors[resolvedTheme].primary,
      background: Colors[resolvedTheme].background,
      card: Colors[resolvedTheme].surface,
      text: Colors[resolvedTheme].text,
      border: Colors[resolvedTheme].border,
    },
  };

  return (
    <AppProviders>
      <ThemeProvider value={customTheme}>
        <Slot />
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppProviders>
  );
}
