/**
 * Onda do Bem — Auth Store (Zustand)
 *
 * Gerencia o estado de autenticação client-side e sincronização com a API REST.
 * Responsável por: user autenticado, access & refresh tokens JWT, status de login.
 * Os tokens são persistidos no SecureStore do dispositivo.
 */

import { create } from 'zustand';

import type { User } from '@/types/entities';
import type { ApiResponse, AuthResponse, RegisterRequest } from '@/types/api';
import { secureStorage } from '@/services/storage/secure-storage';
import { apiPost, apiGet, Endpoints } from '@/services/api';
import { tokenRegistry } from '@/services/api/token-registry';
import { useFeedStore } from './feed.store';

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
  /** Se está executando login/cadastro */
  isLoading: boolean;
}

interface AuthActions {
  /** Inicializa o estado de auth (chamado no boot do app) */
  initialize: () => Promise<void>;
  /** Realiza login na API REST e persiste tokens */
  login: (email: string, password: string) => Promise<User>;
  /** Realiza cadastro na API REST */
  register: (payload: RegisterRequest) => Promise<User>;
  /** Define o usuário e tokens manualmente */
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

export type AuthStore = AuthState & AuthActions;

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
  isLoading: false,

  // Actions
  initialize: async () => {
    try {
      const { accessToken, refreshToken } = await secureStorage.getTokens();
      const hasCompletedOnboarding = await secureStorage.hasCompletedOnboarding();

      if (accessToken) {
        set({ accessToken, refreshToken, hasCompletedOnboarding });
        // Tenta buscar os dados do usuário autenticado no backend
        try {
          const res = await apiGet<ApiResponse<User>>(Endpoints.auth.me);
          const userData = (res as any)?.data || res;
          if (userData && userData.id) {
            set({ user: userData, isInitialized: true });
            useFeedStore.setState({ currentUser: userData });
            return;
          }
        } catch {
          // Se o backend estiver indisponível ou o token expirado, mantém estado
        }
      }

      set({
        accessToken,
        refreshToken,
        hasCompletedOnboarding,
        isInitialized: true,
      });
    } catch {
      set({ isInitialized: true });
    }
  },

  login: async (email: string, password: string): Promise<User> => {
    set({ isLoading: true });
    try {
      const res = await apiPost<ApiResponse<AuthResponse>>(Endpoints.auth.login, {
        email: email.trim().toLowerCase(),
        password,
      });

      const authData = (res as any)?.data || res;
      const { user, accessToken, refreshToken } = authData;

      if (!accessToken || !user) {
        throw new Error('Resposta de autenticação inválida do servidor.');
      }

      await secureStorage.saveTokens(accessToken, refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      });

      // Sincroniza o usuário logado com o feed store para atualizar UI
      useFeedStore.setState({ currentUser: user });

      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (payload: RegisterRequest): Promise<User> => {
    set({ isLoading: true });
    try {
      const res = await apiPost<ApiResponse<AuthResponse>>(Endpoints.auth.register, {
        email: payload.email.trim().toLowerCase(),
        username: payload.username.trim().toLowerCase(),
        displayName: payload.displayName.trim(),
        password: payload.password,
      });

      const authData = (res as any)?.data || res;
      const { user, accessToken, refreshToken } = authData;

      if (!accessToken || !user) {
        throw new Error('Falha ao processar cadastro na API.');
      }

      await secureStorage.saveTokens(accessToken, refreshToken);

      set({
        user,
        accessToken,
        refreshToken,
        isLoading: false,
      });

      useFeedStore.setState({ currentUser: user });

      return user;
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  setAuth: async (user, accessToken, refreshToken) => {
    await secureStorage.saveTokens(accessToken, refreshToken);
    set({ user, accessToken, refreshToken });
    useFeedStore.setState({ currentUser: user });
  },

  setTokens: async (accessToken, refreshToken) => {
    await secureStorage.saveTokens(accessToken, refreshToken);
    set({ accessToken, refreshToken });
  },

  updateUser: (partial) => {
    const { user } = get();
    if (user) {
      const updatedUser = { ...user, ...partial };
      set({ user: updatedUser });
      useFeedStore.setState({ currentUser: updatedUser });
    }
  },

  logout: async () => {
    try {
      // Dispara logout na API (fire and forget)
      apiPost(Endpoints.auth.logout).catch(() => {});
    } finally {
      await secureStorage.clearTokens();
      set({
        user: null,
        accessToken: null,
        refreshToken: null,
      });
    }
  },

  completeOnboarding: async () => {
    await secureStorage.setOnboardingCompleted();
    set({ hasCompletedOnboarding: true });
  },
}));

// ---------------------------------------------------------------------------
// Liga o tokenRegistry ao auth store (resolve o ciclo de importação)
// O interceptor usa tokenRegistry; o store registra suas funções aqui.
// ---------------------------------------------------------------------------
tokenRegistry.register({
  getAccessToken: () => useAuthStore.getState().accessToken,
  getRefreshToken: () => useAuthStore.getState().refreshToken,
  onLogout: () => useAuthStore.getState().logout(),
  onSetTokens: (access, refresh) => useAuthStore.getState().setTokens(access, refresh),
});
