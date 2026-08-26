/**
 * Onda do Bem — Badge Component
 *
 * Badges para categorias, status e contadores.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';

import { AppText } from './text';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type BadgeVariant = 'primary' | 'secondary' | 'accent' | 'error' | 'success' | 'muted';

interface BadgeProps {
  /** Texto do badge */
  label: string;
  /** Variante de cor */
  variant?: BadgeVariant;
  /** Estilo extra */
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Badge({ label, variant = 'primary', style }: BadgeProps) {
  const theme = useAppTheme();

  const variantStyles: Record<BadgeVariant, { bg: string; text: string }> = {
    primary: { bg: theme.primaryLight, text: theme.primary },
    secondary: { bg: theme.secondaryLight, text: theme.secondary },
    accent: { bg: theme.accentLight, text: theme.accent },
    error: { bg: theme.errorLight, text: theme.error },
    success: { bg: theme.successLight, text: theme.success },
    muted: { bg: theme.borderLight, text: theme.textSecondary },
  };

  const { bg, text } = variantStyles[variant];

  return (
    <View style={[styles.badge, { backgroundColor: bg }, style]}>
      <AppText variant="caption" style={{ color: text }}>
        {label}
      </AppText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  badge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs / 2,
    borderRadius: BorderRadius.full,
  },
});
