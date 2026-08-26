/**
 * Onda do Bem — HTTP Client
 *
 * Instância Axios configurada como ponto central de comunicação com a API.
 * Interceptors são configurados separadamente para manter este arquivo limpo.
 */

import axios from 'axios';

import { Config } from '@/constants/config';

export const apiClient = axios.create({
  baseURL: Config.apiBaseUrl,
  timeout: Config.apiTimeout,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
});

/**
 * Helper tipado para extrair o `data` de uma resposta Axios.
 * Isso evita que todo hook precise fazer `response.data.data`.
 */
export async function apiGet<T>(url: string, params?: Record<string, unknown>): Promise<T> {
  const response = await apiClient.get<T>(url, { params });
  return response.data;
}

export async function apiPost<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.post<T>(url, data);
  return response.data;
}

export async function apiPut<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.put<T>(url, data);
  return response.data;
}

export async function apiPatch<T>(url: string, data?: unknown): Promise<T> {
  const response = await apiClient.patch<T>(url, data);
  return response.data;
}

export async function apiDelete<T>(url: string): Promise<T> {
  const response = await apiClient.delete<T>(url);
  return response.data;
}
