/**
 * Onda do Bem — Theme Store (Zustand)
 *
 * Gerencia a preferência de tema do usuário (light / dark / system).
 * Persiste a preferência localmente.
 */

import { create } from 'zustand';
import { Appearance } from 'react-native';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeState {
  /** Modo de tema selecionado pelo usuário */
  mode: ThemeMode;
  /** Tema efetivo (resolvido a partir de mode + sistema) */
  resolvedTheme: 'light' | 'dark';
}

interface ThemeActions {
  /** Define o modo de tema */
  setMode: (mode: ThemeMode) => void;
}

type ThemeStore = ThemeState & ThemeActions;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function resolveTheme(mode: ThemeMode): 'light' | 'dark' {
  if (mode === 'system') {
    const systemScheme = Appearance.getColorScheme();
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useThemeStore = create<ThemeStore>()((set) => ({
  mode: 'system',
  resolvedTheme: resolveTheme('system'),

  setMode: (mode) => {
    set({
      mode,
      resolvedTheme: resolveTheme(mode),
    });
  },
}));
