/**
 * Onda do Bem — Interceptors HTTP
 *
 * Configura interceptors no Axios client para:
 * 1. Injetar o token de autenticação em todas as requisições
 * 2. Tratar erros de resposta (401 → refresh token, erros genéricos)
 *
 * Este módulo deve ser inicializado uma única vez, no boot do app.
 */

import type { AxiosError, InternalAxiosRequestConfig } from 'axios';

import { apiClient } from './client';

import { useAuthStore } from '@/store/auth.store';

// ---------------------------------------------------------------------------
// Request interceptor — injeta Authorization header
// ---------------------------------------------------------------------------

apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const { accessToken } = useAuthStore.getState();

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

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config;

    // Se recebeu 401 e não é uma tentativa de refresh (evita loop infinito)
    if (
      error.response?.status === 401 &&
      originalRequest &&
      !(originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry
    ) {
      (originalRequest as InternalAxiosRequestConfig & { _retry?: boolean })._retry = true;

      try {
        const { refreshToken } = useAuthStore.getState();

        if (!refreshToken) {
          useAuthStore.getState().logout();
          return Promise.reject(error);
        }

        // Tenta renovar o token
        const response = await apiClient.post<{
          accessToken: string;
          refreshToken: string;
        }>('/auth/refresh', { refreshToken });

        const { accessToken: newAccessToken, refreshToken: newRefreshToken } = response.data;

        // Atualiza os tokens no store
        useAuthStore.getState().setTokens(newAccessToken, newRefreshToken);

        // Refaz a requisição original com o novo token
        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
        }

        return apiClient(originalRequest);
      } catch {
        // Refresh falhou — força logout
        useAuthStore.getState().logout();
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

export { apiClient };
