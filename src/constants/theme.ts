/**
 * Onda do Bem — Design System Tokens
 *
 * Identidade visual: "Tecnologia + Natureza + Comunidade + Impacto Positivo"
 *
 * Paleta inspirada no oceano (primary), na vegetação (secondary)
 * e na energia solar (accent). Suporta temas claro e escuro.
 */

import { Platform } from 'react-native';

// ---------------------------------------------------------------------------
// Cores
// ---------------------------------------------------------------------------

export const Palette = {
  // Primary — Oceano / Água (Sky)
  primary50: '#F0F9FF',
  primary100: '#E0F2FE',
  primary200: '#BAE6FD',
  primary300: '#7DD3FC',
  primary400: '#38BDF8',
  primary500: '#0EA5E9',
  primary600: '#0284C7',
  primary700: '#0369A1',
  primary800: '#075985',
  primary900: '#0C4A6E',

  // Secondary — Natureza / Vegetação (Emerald)
  secondary50: '#ECFDF5',
  secondary100: '#D1FAE5',
  secondary200: '#A7F3D0',
  secondary300: '#6EE7B7',
  secondary400: '#34D399',
  secondary500: '#10B981',
  secondary600: '#059669',
  secondary700: '#047857',
  secondary800: '#065F46',
  secondary900: '#064E3B',

  // Accent — Energia / Sol (Amber)
  accent50: '#FFFBEB',
  accent100: '#FEF3C7',
  accent200: '#FDE68A',
  accent300: '#FCD34D',
  accent400: '#FBBF24',
  accent500: '#F59E0B',
  accent600: '#D97706',
  accent700: '#B45309',
  accent800: '#92400E',
  accent900: '#78350F',

  // Neutrals (Slate)
  slate50: '#F8FAFC',
  slate100: '#F1F5F9',
  slate200: '#E2E8F0',
  slate300: '#CBD5E1',
  slate400: '#94A3B8',
  slate500: '#64748B',
  slate600: '#475569',
  slate700: '#334155',
  slate800: '#1E293B',
  slate900: '#0F172A',
  slate950: '#020617',

  // Semantic
  error50: '#FEF2F2',
  error500: '#EF4444',
  error600: '#DC2626',
  error400: '#F87171',

  success50: '#F0FDF4',
  success500: '#22C55E',
  success400: '#4ADE80',

  warning50: '#FFFBEB',
  warning500: '#F59E0B',
  warning400: '#FBBF24',

  info50: '#EFF6FF',
  info500: '#3B82F6',
  info400: '#60A5FA',

  // Base
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',
} as const;

// ---------------------------------------------------------------------------
// Temas
// ---------------------------------------------------------------------------

export const Colors = {
  light: {
    primary: Palette.primary500,
    primaryLight: Palette.primary100,
    primaryDark: Palette.primary700,

    secondary: Palette.secondary500,
    secondaryLight: Palette.secondary100,
    secondaryDark: Palette.secondary700,

    accent: Palette.accent500,
    accentLight: Palette.accent100,

    background: Palette.slate50,
    surface: Palette.white,
    surfaceElevated: Palette.white,

    text: Palette.slate900,
    textSecondary: Palette.slate500,
    textMuted: Palette.slate400,
    textInverse: Palette.white,

    border: Palette.slate200,
    borderLight: Palette.slate100,
    divider: Palette.slate100,

    error: Palette.error500,
    errorLight: Palette.error50,
    success: Palette.success500,
    successLight: Palette.success50,
    warning: Palette.warning500,
    warningLight: Palette.warning50,
    info: Palette.info500,
    infoLight: Palette.info50,

    overlay: 'rgba(15, 23, 42, 0.5)',
    skeleton: Palette.slate200,
    tabBar: Palette.white,
    tabBarBorder: Palette.slate200,
  },
  dark: {
    primary: Palette.primary400,
    primaryLight: Palette.primary900,
    primaryDark: Palette.primary300,

    secondary: Palette.secondary400,
    secondaryLight: Palette.secondary900,
    secondaryDark: Palette.secondary300,

    accent: Palette.accent400,
    accentLight: Palette.accent900,

    background: Palette.slate950,
    surface: Palette.slate900,
    surfaceElevated: Palette.slate800,

    text: Palette.slate50,
    textSecondary: Palette.slate400,
    textMuted: Palette.slate500,
    textInverse: Palette.slate900,

    border: Palette.slate700,
    borderLight: Palette.slate800,
    divider: Palette.slate800,

    error: Palette.error400,
    errorLight: 'rgba(239, 68, 68, 0.15)',
    success: Palette.success400,
    successLight: 'rgba(34, 197, 94, 0.15)',
    warning: Palette.warning400,
    warningLight: 'rgba(245, 158, 11, 0.15)',
    info: Palette.info400,
    infoLight: 'rgba(59, 130, 246, 0.15)',

    overlay: 'rgba(0, 0, 0, 0.7)',
    skeleton: Palette.slate800,
    tabBar: Palette.slate900,
    tabBarBorder: Palette.slate800,
  },
} as const;

export type ThemeColors = { [K in keyof typeof Colors.light]: string };
export type ThemeColor = keyof ThemeColors;

// ---------------------------------------------------------------------------
// Tipografia
// ---------------------------------------------------------------------------

export const Fonts = Platform.select({
  ios: {
    sans: 'System',
    serif: 'Georgia',
    mono: 'Menlo',
  },
  default: {
    sans: 'System',
    serif: 'serif',
    mono: 'monospace',
  },
});

export const FontSize = {
  xs: 11,
  sm: 13,
  base: 15,
  md: 17,
  lg: 20,
  xl: 24,
  '2xl': 30,
  '3xl': 36,
} as const;

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
};

export const LineHeight = {
  tight: 1.2,
  normal: 1.5,
  relaxed: 1.75,
} as const;

// ---------------------------------------------------------------------------
// Espaçamento (múltiplos de 4)
// ---------------------------------------------------------------------------

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  '2xl': 48,
  '3xl': 64,
} as const;

// ---------------------------------------------------------------------------
// Border Radius
// ---------------------------------------------------------------------------

export const BorderRadius = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 9999,
} as const;

// ---------------------------------------------------------------------------
// Sombras
// ---------------------------------------------------------------------------

export const Shadows = {
  sm: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  md: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lg: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  xl: {
    shadowColor: Palette.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
} as const;

// ---------------------------------------------------------------------------
// Layout
// ---------------------------------------------------------------------------

export const Layout = {
  maxContentWidth: 600,
  screenPadding: Spacing.md,
  bottomTabInset: Platform.select({ ios: 50, android: 80 }) ?? 0,
} as const;

// ---------------------------------------------------------------------------
// Animação
// ---------------------------------------------------------------------------

export const Animation = {
  fast: 150,
  normal: 300,
  slow: 500,
} as const;
