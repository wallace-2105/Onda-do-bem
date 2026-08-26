/**
 * Onda do Bem — AppText Component
 *
 * Componente de texto tipado que aplica automaticamente
 * as cores e tipografia do design system.
 */

import React from 'react';
import { Text, type TextProps, StyleSheet } from 'react-native';

import { useAppTheme } from '@/hooks/use-theme';
import { FontSize, FontWeight } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type TextVariant = 'h1' | 'h2' | 'h3' | 'body' | 'bodyLg' | 'bodySm' | 'caption' | 'label';
type TextColor = 'primary' | 'secondary' | 'muted' | 'inverse' | 'error' | 'success' | 'accent';

interface AppTextProps extends TextProps {
  /** Variante tipográfica */
  variant?: TextVariant;
  /** Cor semântica do texto */
  color?: TextColor;
  /** Peso da fonte (override) */
  weight?: keyof typeof FontWeight;
  /** Se o texto deve ser centralizado */
  center?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppText({
  variant = 'body',
  color = 'primary',
  weight,
  center,
  style,
  ...props
}: AppTextProps) {
  const theme = useAppTheme();

  const colorMap: Record<TextColor, string> = {
    primary: theme.text,
    secondary: theme.textSecondary,
    muted: theme.textMuted,
    inverse: theme.textInverse,
    error: theme.error,
    success: theme.success,
    accent: theme.accent,
  };

  return (
    <Text
      style={[
        styles[variant],
        { color: colorMap[color] },
        weight != null && { fontWeight: FontWeight[weight] },
        center === true && styles.center,
        style,
      ]}
      {...props}
    />
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  h1: {
    fontSize: FontSize['2xl'],
    fontWeight: FontWeight.bold,
    lineHeight: FontSize['2xl'] * 1.2,
  },
  h2: {
    fontSize: FontSize.xl,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.xl * 1.2,
  },
  h3: {
    fontSize: FontSize.lg,
    fontWeight: FontWeight.semibold,
    lineHeight: FontSize.lg * 1.3,
  },
  body: {
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.base * 1.5,
  },
  bodyLg: {
    fontSize: FontSize.md,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.md * 1.5,
  },
  bodySm: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.regular,
    lineHeight: FontSize.sm * 1.5,
  },
  caption: {
    fontSize: FontSize.xs,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.xs * 1.5,
  },
  label: {
    fontSize: FontSize.sm,
    fontWeight: FontWeight.medium,
    lineHeight: FontSize.sm * 1.4,
  },
  center: {
    textAlign: 'center',
  },
});
