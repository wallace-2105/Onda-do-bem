/**
 * Onda do Bem — Interceptors HTTP
 *
 * Configura interceptors no Axios client para:
 * 1. Injetar o token de autenticação em todas as requisições
 * 2. Tratar erros de resposta (401 → refresh token, erros genéricos)
 *
 * Usa o tokenRegistry para acessar o estado de auth SEM criar um ciclo
 * circular de importação com auth.store.
 */

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { apiClient } from './client';
import { tokenRegistry } from './token-registry';
import type { ApiResponse } from '@/types/api';

// ---------------------------------------------------------------------------
// Request interceptor — injeta Authorization header
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessToken = tokenRegistry.getAccessToken();

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ---------------------------------------------------------------------------
// Response interceptor — trata erros globais
// ---------------------------------------------------------------------------

// Uma única renovação em andamento é compartilhada entre requisições simultâneas
// (ex.: revalidação do feed + publicação expirando ao mesmo tempo)
let refreshInFlight: Promise<string> | null = null;

async function renewAccessToken(refreshToken: string): Promise<string> {
  // O backend responde no envelope ApiResponse: { data: { accessToken, refreshToken, user } }
  const response = await apiClient.post<ApiResponse<{ accessToken: string; refreshToken: string }>>(
    '/auth/refresh',
    { refreshToken }
  );
  const { accessToken, refreshToken: newRefreshToken } = response.data.data;
  if (!accessToken) {
    throw new Error('Resposta de refresh sem accessToken');
  }

  // Atualiza os tokens no store via registry
  await tokenRegistry.setTokens(accessToken, newRefreshToken);
  return accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;
    // Login/cadastro/refresh com 401 são erros reais, não sessão expirada (evita loop infinito)
    const isAuthEndpoint = originalRequest?.url?.startsWith('/auth/') ?? false;

    // Se recebeu 401 e não é uma tentativa de refresh
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !isAuthEndpoint &&
      !(originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry
    ) {
      (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;

      try {
        const refreshToken = tokenRegistry.getRefreshToken();

        if (!refreshToken) {
          tokenRegistry.logout();
          return Promise.reject(error);
        }

        refreshInFlight ??= renewAccessToken(refreshToken).finally(() => {
          refreshInFlight = null;
        });
        const newAccessToken = await refreshInFlight;

        // Refaz a requisição original com o novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch {
        // Refresh falhou — força logout
        tokenRegistry.logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export { apiClient };
