/**
 * Onda do Bem — Tipagem de Variáveis de Ambiente
 *
 * Garante que variáveis de ambiente tenham autocompletar no TypeScript.
 */

declare global {
  namespace NodeJS {
    interface ProcessEnv {
      EXPO_PUBLIC_API_URL?: string;
      EXPO_PUBLIC_FIREBASE_API_KEY?: string;
      EXPO_PUBLIC_FIREBASE_PROJECT_ID?: string;
      EXPO_PUBLIC_ANALYTICS_KEY?: string;
    }
  }
}

export {};
