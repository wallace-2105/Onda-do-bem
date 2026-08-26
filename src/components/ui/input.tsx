/**
 * Onda do Bem — AppInput Component
 *
 * Campo de entrada reutilizável com suporte a label,
 * erro de validação, ícones e temas.
 */

import React, { useState } from 'react';
import {
  View,
  TextInput,
  StyleSheet,
  type TextInputProps,
  type ViewStyle,
} from 'react-native';

import { AppText } from './text';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius, FontSize, FontWeight, Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AppInputProps extends TextInputProps {
  /** Label exibida acima do input */
  label?: string;
  /** Mensagem de erro (exibida abaixo, em vermelho) */
  error?: string;
  /** Hint de ajuda (exibida abaixo, em cinza) */
  hint?: string;
  /** Ícone à esquerda (render prop) */
  leftIcon?: React.ReactNode;
  /** Ícone à direita (render prop) */
  rightIcon?: React.ReactNode;
  /** Estilo extra para o container */
  containerStyle?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function AppInput({
  label,
  error,
  hint,
  leftIcon,
  rightIcon,
  containerStyle,
  style,
  onFocus,
  onBlur,
  ...props
}: AppInputProps) {
  const theme = useAppTheme();
  const [isFocused, setIsFocused] = useState(false);
  const hasError = error != null && error.length > 0;

  const borderColor = hasError
    ? theme.error
    : isFocused
      ? theme.primary
      : theme.border;

  return (
    <View style={[styles.container, containerStyle]}>
      {label != null && (
        <AppText variant="label" color="secondary" style={styles.label}>
          {label}
        </AppText>
      )}

      <View
        style={[
          styles.inputContainer,
          {
            borderColor,
            backgroundColor: theme.surface,
          },
          isFocused && styles.focused,
        ]}
      >
        {leftIcon != null && <View style={styles.iconLeft}>{leftIcon}</View>}

        <TextInput
          style={[
            styles.input,
            {
              color: theme.text,
            },
            leftIcon != null && styles.inputWithLeftIcon,
            rightIcon != null && styles.inputWithRightIcon,
            style,
          ]}
          placeholderTextColor={theme.textMuted}
          selectionColor={theme.primary}
          onFocus={(e) => {
            setIsFocused(true);
            onFocus?.(e);
          }}
          onBlur={(e) => {
            setIsFocused(false);
            onBlur?.(e);
          }}
          accessibilityLabel={label}
          {...props}
        />

        {rightIcon != null && <View style={styles.iconRight}>{rightIcon}</View>}
      </View>

      {hasError && (
        <AppText variant="caption" color="error" style={styles.message}>
          {error}
        </AppText>
      )}
      {!hasError && hint != null && (
        <AppText variant="caption" color="muted" style={styles.message}>
          {hint}
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
    width: '100%',
  },
  label: {
    marginBottom: Spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: BorderRadius.md,
    minHeight: 48,
  },
  focused: {
    borderWidth: 2,
  },
  input: {
    flex: 1,
    fontSize: FontSize.base,
    fontWeight: FontWeight.regular,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  inputWithLeftIcon: {
    paddingLeft: Spacing.xs,
  },
  inputWithRightIcon: {
    paddingRight: Spacing.xs,
  },
  iconLeft: {
    paddingLeft: Spacing.md,
  },
  iconRight: {
    paddingRight: Spacing.md,
  },
  message: {
    marginTop: Spacing.xs,
    paddingLeft: Spacing.xs,
  },
});
