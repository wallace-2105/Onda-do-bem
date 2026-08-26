/**
 * Onda do Bem — Avatar Component
 *
 * Exibe a foto de perfil de um usuário com fallback para iniciais.
 */

import React from 'react';
import { View, StyleSheet, type ViewStyle } from 'react-native';
import { Image } from 'expo-image';

import { AppText } from './text';
import { useAppTheme } from '@/hooks/use-theme';
import { BorderRadius } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type AvatarSize = 'sm' | 'md' | 'lg' | 'xl';

interface AvatarProps {
  /** URL da imagem */
  source?: string | null;
  /** Nome do usuário (para gerar iniciais no fallback) */
  name?: string;
  /** Tamanho do avatar */
  size?: AvatarSize;
  /** Estilo extra */
  style?: ViewStyle;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const SIZE_MAP: Record<AvatarSize, number> = {
  sm: 32,
  md: 40,
  lg: 56,
  xl: 80,
};

function getInitials(name?: string): string {
  if (!name) return '?';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function Avatar({ source, name, size = 'md', style }: AvatarProps) {
  const theme = useAppTheme();
  const dimension = SIZE_MAP[size];

  const containerStyle: ViewStyle = {
    width: dimension,
    height: dimension,
    borderRadius: BorderRadius.full,
    backgroundColor: theme.primaryLight,
    overflow: 'hidden',
  };

  if (source) {
    return (
      <View style={[containerStyle, style]}>
        <Image
          source={{ uri: source }}
          style={styles.image}
          contentFit="cover"
          transition={200}
          accessibilityLabel={`Avatar de ${name ?? 'usuário'}`}
        />
      </View>
    );
  }

  return (
    <View
      style={[containerStyle, styles.fallback, style]}
      accessibilityLabel={`Avatar de ${name ?? 'usuário'}`}
    >
      <AppText
        variant={size === 'xl' ? 'h3' : size === 'lg' ? 'body' : 'caption'}
        style={{ color: theme.primary }}
      >
        {getInitials(name)}
      </AppText>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
  },
  fallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
