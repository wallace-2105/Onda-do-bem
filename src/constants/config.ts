/**
 * Onda do Bem — Configuração Geral
 *
 * Constantes de configuração do aplicativo.
 * Valores sensíveis devem vir de variáveis de ambiente (.env.local).
 *
 * EXPO_PUBLIC_API_URL — defina no .env.local:
 *   Emulador Android : http://10.0.2.2:8080/api
 *   iOS Simulator/Web: http://localhost:8080/api
 *   Celular físico   : http://<SEU_IP_LOCAL>:8080/api  (ex: 192.168.15.12)
 */

import { Platform } from 'react-native';

/**
 * Retorna a URL base correta quando EXPO_PUBLIC_API_URL não está definido.
 * - Android: usa 10.0.2.2 (alias do emulador para o host)
 * - iOS / Web: usa localhost
 *
 * Para celular físico, defina EXPO_PUBLIC_API_URL no .env.local com seu IP.
 */
function getDefaultApiUrl(): string {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8080/api';
  }
  return 'http://localhost:8080/api';
}

export const Config = {
  /** Nome do aplicativo */
  appName: 'Onda do Bem',

  /** Versão do app (sincronizar com app.json) */
  appVersion: '1.0.0',

  /**
   * URL base da API REST Spring Boot.
   * Prioridade: variável de ambiente → detecção automática por plataforma.
   */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? getDefaultApiUrl(),

  /** Timeout padrão para requisições HTTP (em ms) */
  apiTimeout: 15_000,

  /** Número de itens por página em listagens */
  defaultPageSize: 20,

  /** Tempo de cache padrão do React Query (em ms) */
  defaultStaleTime: 1000 * 60, // 1 minuto

  /** Tempo de garbage collection do cache (em ms) */
  defaultGcTime: 1000 * 60 * 60 * 24, // 24 horas
} as const;
