/**
 * Onda do Bem — AppCard Component
 *
 * Container card reutilizável com sombra, borda e padding.
 * Base para listar posts, informações de impacto, etc.
 */

import React from 'react';
import { View, Pressable, StyleSheet, type ViewProps, type ViewStyle } from 'react-native';

import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, Shadows, Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type CardVariant = 'elevated' | 'outlined' | 'filled';

interface AppCardProps extends ViewProps {
  /** Variante visual */
  variant?: CardVariant;
  /** Padding interno */
  padding?: keyof typeof Spacing;
  /** Se o card é pressionável (touchable) */
  onPress?: () => void;
  /** Estilo extra */
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppCard({
  variant = 'elevated',
  padding = 'md',
  onPress,
  style,
  children,
  ...props
}: AppCardProps) {
  const theme = useAppTheme();

  const variantStyles: Record<CardVariant, ViewStyle> = {
    elevated: {
      backgroundColor: theme.surface,
      ...Shadows.md,
    },
    outlined: {
      backgroundColor: theme.surface,
      borderWidth: 1,
      borderColor: theme.border,
    },
    filled: {
      backgroundColor: theme.surfaceElevated,
    },
  };

  const cardStyle: ViewStyle[] = [
    styles.base,
    variantStyles[variant],
    { padding: Spacing[padding] },
    ...(style ? [style] : []),
  ];

  if (onPress != null) {
    return (
      <Pressable
        style={({ pressed }) => [
          ...cardStyle,
          pressed && styles.pressed,
        ]}
        onPress={onPress}
        accessibilityRole="button"
        {...props}
      >
        {children}
      </Pressable>
    );
  }

  return (
    <View style={cardStyle} {...props}>
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  base: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.99 }],
  },
});
