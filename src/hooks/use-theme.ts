/**
 * Onda do Bem — useAppTheme Hook
 *
 * Hook que retorna as cores do tema atual (light ou dark)
 * baseado na preferência do usuário no ThemeStore.
 * Substitui o hook genérico do template para usar nosso design system.
 */

import { Colors } from '@/constants/theme';
import type { ThemeColors } from '@/constants/theme';
import { useThemeStore } from '@/store/theme.store';

/** Retorna o objeto de cores do tema ativo */
export function useAppTheme(): ThemeColors {
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  return Colors[resolvedTheme] as ThemeColors;
}

/** Retorna se o tema atual é dark */
export function useIsDark(): boolean {
  return useThemeStore((s) => s.resolvedTheme === 'dark');
}
