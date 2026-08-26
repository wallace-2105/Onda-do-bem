/**
 * Onda do Bem — Error Handler
 *
 * Tratamento centralizado de erros da aplicação.
 * Normaliza erros de diferentes fontes (API, rede, JS) em mensagens amigáveis.
 */

import type { AxiosError } from 'axios';
import type { ApiError } from '@/types/api';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface AppError {
  message: string;
  code: string;
  statusCode?: number;
  details?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Normalização
// ---------------------------------------------------------------------------

/**
 * Transforma qualquer erro em um AppError normalizado.
 * Trata Axios errors, API errors e erros genéricos de JS.
 */
export function normalizeError(error: unknown): AppError {
  // Erro do Axios com resposta da API
  if (isAxiosError(error) && error.response?.data) {
    const apiError = error.response.data as Partial<ApiError>;
    return {
      message: apiError.message ?? 'Erro ao comunicar com o servidor.',
      code: apiError.error ?? 'API_ERROR',
      statusCode: error.response.status,
      details: apiError.details,
    };
  }

  // Erro do Axios sem resposta (rede)
  if (isAxiosError(error) && !error.response) {
    return {
      message: 'Sem conexão com a internet. Verifique sua rede e tente novamente.',
      code: 'NETWORK_ERROR',
    };
  }

  // Erro genérico de JS
  if (error instanceof Error) {
    return {
      message: error.message,
      code: 'UNKNOWN_ERROR',
    };
  }

  // Fallback
  return {
    message: 'Ocorreu um erro inesperado.',
    code: 'UNKNOWN_ERROR',
  };
}

/**
 * Extrai apenas a mensagem de erro amigável para exibição.
 */
export function getErrorMessage(error: unknown): string {
  return normalizeError(error).message;
}

// ---------------------------------------------------------------------------
// Type Guards
// ---------------------------------------------------------------------------

function isAxiosError(error: unknown): error is AxiosError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'isAxiosError' in error &&
    (error as AxiosError).isAxiosError === true
  );
}
