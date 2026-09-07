/**
 * Onda do Bem — Root Layout
 *
 * Layout raiz que envolve toda a aplicação com:
 * - AppProviders (ErrorBoundary, QueryClient)
 * - ThemeProvider do Expo Router
 * - Splash screen animada personalizada com a marca oficial (1.8s)
 * - Auth initialization
 */

import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Animated,
  useColorScheme,
  Text,
} from 'react-native';
import { DarkTheme, DefaultTheme, ThemeProvider } from 'expo-router/react-navigation';
import { Slot } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { Image } from 'expo-image';

import { AppProviders } from '@/providers/app-providers';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { Colors } from '@/constants/theme';

// Prevent native splash screen from auto-hiding immediately
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const systemColorScheme = useColorScheme();
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const themeMode = useThemeStore((s) => s.mode);
  const initializeAuth = useAuthStore((s) => s.initialize);
  const isAuthInitialized = useAuthStore((s) => s.isInitialized);

  // Estados para a tela de abertura animada com a marca
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);
  const splashOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(0.75)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

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

  // Libera a splash nativa assim que o bundle JS estiver pronto
  useEffect(() => {
    if (isAuthInitialized) {
      SplashScreen.hideAsync().catch(() => {});
    }
  }, [isAuthInitialized]);

  // Animação de entrada e saída da tela de abertura da marca (~1.8s)
  useEffect(() => {
    // 1. Entrada suave com leve escala da logo
    Animated.parallel([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 30,
        friction: 6,
        useNativeDriver: true,
      }),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();

    // 2. Transição e fade-out após 1.8 segundos
    const timer = setTimeout(() => {
      Animated.timing(splashOpacity, {
        toValue: 0,
        duration: 380,
        useNativeDriver: true,
      }).start(() => {
        setShowAnimatedSplash(false);
      });
    }, 1800);

    return () => clearTimeout(timer);
  }, []);

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
        <View style={styles.container}>
          <Slot />

          {/* Tela de Abertura com a Marca Oficial (Splash de 1.8s) */}
          {showAnimatedSplash && (
            <Animated.View
              style={[
                StyleSheet.absoluteFill,
                styles.splashOverlay,
                { opacity: splashOpacity },
              ]}
              pointerEvents={showAnimatedSplash ? 'auto' : 'none'}
            >
              <StatusBar style="light" />
              <Animated.View
                style={[
                  styles.splashContent,
                  { transform: [{ scale: logoScale }] },
                ]}
              >
                {/* Logo Circular da Tartaruga Surfista */}
                <View style={styles.logoCircle}>
                  <Image
                    source={require('@/../assets/images/onda-logo.jpg')}
                    style={styles.logoImage}
                    contentFit="cover"
                  />
                </View>

                {/* Textos de Marca */}
                <Animated.View style={[styles.brandTextContainer, { opacity: textOpacity }]}>
                  <Text style={styles.brandTitle}>Onda do Bem</Text>
                  <Text style={styles.brandSubtitle}>Rede de Impacto Social 🌊✨</Text>
                </Animated.View>
              </Animated.View>
            </Animated.View>
          )}
        </View>
        <StatusBar style={resolvedTheme === 'dark' ? 'light' : 'dark'} />
      </ThemeProvider>
    </AppProviders>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  splashOverlay: {
    backgroundColor: '#0284C7', // Azul Oceano Vibrante
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 99999,
  },
  splashContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
    borderWidth: 4.5,
    borderColor: '#FFFFFF',
    backgroundColor: '#BAE6FD',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.35,
    shadowRadius: 18,
    elevation: 14,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  brandTextContainer: {
    alignItems: 'center',
    marginTop: 24,
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 32,
    fontWeight: '800',
    letterSpacing: 0.8,
    textShadowColor: 'rgba(0, 0, 0, 0.25)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 6,
  },
  brandSubtitle: {
    color: 'rgba(255, 255, 255, 0.92)',
    fontSize: 16,
    fontWeight: '500',
    marginTop: 6,
    letterSpacing: 0.3,
  },
});
