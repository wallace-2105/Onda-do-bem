/**
 * Onda do Bem — Loading Component
 *
 * Indicadores de carregamento reutilizáveis.
 */

import React from 'react';
import { View, ActivityIndicator, StyleSheet, type ViewStyle } from 'react-native';

import { AppText } from './text';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LoadingProps {
  /** Tamanho do spinner */
  size?: 'small' | 'large';
  /** Mensagem opcional abaixo do spinner */
  message?: string;
  /** Se ocupa a tela toda */
  fullScreen?: boolean;
  /** Estilo extra */
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Loading({
  size = 'large',
  message,
  fullScreen = false,
  style,
}: LoadingProps) {
  const theme = useAppTheme();

  return (
    <View
      style={[
        styles.container,
        fullScreen && styles.fullScreen,
        fullScreen && { backgroundColor: theme.background },
        style,
      ]}
    >
      <ActivityIndicator size={size} color={theme.primary} />
      {message != null && (
        <AppText variant="bodySm" color="secondary" style={styles.message}>
          {message}
        </AppText>
      )}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  fullScreen: {
    flex: 1,
  },
  message: {
    marginTop: Spacing.md,
  },
});
