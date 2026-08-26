/**
 * Onda do Bem — AppButton Component
 *
 * Botão reutilizável com variantes visuais,
 * estados de loading e acessibilidade.
 */

import React from 'react';
import {
  Pressable,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type PressableProps,
} from 'react-native';

import { AppText } from './text';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, FontWeight, Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'ghost';
type ButtonSize = 'sm' | 'md' | 'lg';

interface AppButtonProps extends Omit<PressableProps, 'children'> {
  /** Texto do botão */
  title: string;
  /** Variante visual */
  variant?: ButtonVariant;
  /** Tamanho */
  size?: ButtonSize;
  /** Mostra spinner de loading */
  loading?: boolean;
  /** Ícone à esquerda (render prop) */
  leftIcon?: React.ReactNode;
  /** Ícone à direita (render prop) */
  rightIcon?: React.ReactNode;
  /** Ocupa toda a largura disponível */
  fullWidth?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppButton({
  title,
  variant = 'primary',
  size = 'md',
  loading = false,
  leftIcon,
  rightIcon,
  fullWidth = false,
  disabled,
  style,
  ...props
}: AppButtonProps) {
  const theme = useAppTheme();
  const isDisabled = disabled === true || loading;

  const variantStyles: Record<ButtonVariant, ViewStyle> = {
    primary: {
      backgroundColor: theme.primary,
    },
    secondary: {
      backgroundColor: theme.secondary,
    },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: theme.primary,
    },
    ghost: {
      backgroundColor: 'transparent',
    },
  };

  const sizeStyles: Record<ButtonSize, ViewStyle> = {
    sm: { paddingVertical: Spacing.xs, paddingHorizontal: Spacing.md, minHeight: 36 },
    md: { paddingVertical: Spacing.sm, paddingHorizontal: Spacing.lg, minHeight: 48 },
    lg: { paddingVertical: Spacing.md, paddingHorizontal: Spacing.xl, minHeight: 56 },
  };

  const textColor =
    variant === 'outline' || variant === 'ghost' ? theme.primary : theme.textInverse;

  const loadingColor =
    variant === 'outline' || variant === 'ghost' ? theme.primary : theme.textInverse;

  return (
    <Pressable
      style={({ pressed }) => [
        styles.base,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && styles.fullWidth,
        pressed && !isDisabled && styles.pressed,
        isDisabled && styles.disabled,
        style as ViewStyle,
      ]}
      disabled={isDisabled}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      accessibilityLabel={title}
      {...props}
    >
      {loading ? (
        <ActivityIndicator size="small" color={loadingColor} />
      ) : (
        <>
          {leftIcon}
          <AppText
            variant="label"
            style={[
              styles.text,
              { color: textColor, fontWeight: FontWeight.semibold },
              leftIcon != null && styles.textWithLeftIcon,
              rightIcon != null && styles.textWithRightIcon,
            ]}
          >
            {title}
          </AppText>
          {rightIcon}
        </>
      )}
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  base: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  fullWidth: {
    width: '100%',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.98 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    textAlign: 'center',
  },
  textWithLeftIcon: {
    marginLeft: Spacing.sm,
  },
  textWithRightIcon: {
    marginRight: Spacing.sm,
  },
});
