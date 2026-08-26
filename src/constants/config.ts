/**
 * Onda do Bem — Configuração Geral
 *
 * Constantes de configuração do aplicativo.
 * Valores sensíveis devem vir de variáveis de ambiente.
 */

export const Config = {
  /** Nome do aplicativo */
  appName: 'Onda do Bem',

  /** Versão do app (sincronizar com app.json) */
  appVersion: '1.0.0',

  /**
   * URL base da API.
   * Em dev, usar o endereço do servidor local.
   * Em prod, será o domínio da API real.
   */
  apiBaseUrl: process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3000/api',

  /** Timeout padrão para requisições HTTP (em ms) */
  apiTimeout: 15_000,

  /** Número de itens por página em listagens */
  defaultPageSize: 20,

  /** Tempo de cache padrão do React Query (em ms) */
  defaultStaleTime: 1000 * 60, // 1 minuto

  /** Tempo de garbage collection do cache (em ms) */
  defaultGcTime: 1000 * 60 * 60 * 24, // 24 horas
} as const;
