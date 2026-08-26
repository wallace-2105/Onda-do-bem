/**
 * Onda do Bem — Auth Store (Zustand)
 *
 * Gerencia o estado de autenticação client-side.
 * Responsável por: user em memória, tokens, status de auth.
 *
 * Os tokens são persistidos no SecureStore (ver secure-storage.ts).
 * Este store é acessível fora de componentes React (ex: interceptors).
 */

import { create } from 'zustand';

import type { User } from '@/types/entities';
import { secureStorage } from '@/services/storage/secure-storage';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AuthState {
  /** Usuário logado (null se não autenticado) */
  user: User | null;
  /** Token de acesso JWT (em memória) */
  accessToken: string | null;
  /** Token de refresh (em memória) */
  refreshToken: string | null;
  /** Se a verificação inicial de auth já terminou */
  isInitialized: boolean;
  /** Se o onboarding já foi completado */
  hasCompletedOnboarding: boolean;
}

interface AuthActions {
  /** Inicializa o estado de auth (chamado no boot do app) */
  initialize: () => Promise<void>;
  /** Define o usuário e tokens após login/registro */
  setAuth: (user: User, accessToken: string, refreshToken: string) => Promise<void>;
  /** Atualiza apenas os tokens (após refresh) */
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  /** Atualiza o perfil do usuário */
  updateUser: (user: Partial<User>) => void;
  /** Faz logout limpando tudo */
  logout: () => Promise<void>;
  /** Marca onboarding como completo */
  completeOnboarding: () => Promise<void>;
}

type AuthStore = AuthState & AuthActions;

// ---------------------------------------------------------------------------
// Computed
// ---------------------------------------------------------------------------

/** Helper para verificar se está autenticado */
export function selectIsAuthenticated(state: AuthState): boolean {
  return state.user !== null && state.accessToken !== null;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthStore>()((set, get) => ({
  // State
  user: null,
  accessToken: null,
  refreshToken: null,
  isInitialized: false,
  hasCompletedOnboarding: false,

  // Actions
  initialize: async () => {
    try {
      const { accessToken, refreshToken } = await secureStorage.getTokens();
      const hasCompletedOnboarding = await secureStorage.hasCompletedOnboarding();

      set({
        accessToken,
        refreshToken,
        hasCompletedOnboarding,
        isInitialized: true,
      });

      // TODO: Quando o backend existir, validar o token e buscar o user
      // if (accessToken) {
      //   const user = await authService.getMe();
      //   set({ user });
      // }
    } catch {
      // Se falhar ao recuperar tokens, trata como não autenticado
      set({ isInitialized: true });
    }
  },

  setAuth: async (user, accessToken, refreshToken) => {
    await secureStorage.saveTokens(accessToken, refreshToken);
    set({ user, accessToken, refreshToken });
  },

  setTokens: async (accessToken, refreshToken) => {
    await secureStorage.saveTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken });
  },

  updateUser: (partial) => {
    const { user } = get();
    if (user) {
      set({ user: { ...user, ...partial } });
    }
  },

  logout: async () => {
    await secureStorage.clearTokens();
    set({
      user: null,
      accessToken: null,
      refreshToken: null,
    });
  },

  completeOnboarding: async () => {
    await secureStorage.setOnboardingCompleted();
    set({ hasCompletedOnboarding: true });
  },
}));
