/**
 * Onda do Bem — Secure Storage
 *
 * Wrapper em torno do expo-secure-store para armazenar
 * dados sensíveis (tokens JWT, credenciais).
 * Abstrai a API nativa para facilitar testes e migrações futuras.
 */

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const STORAGE_KEYS = {
  ACCESS_TOKEN: 'onda_access_token',
  REFRESH_TOKEN: 'onda_refresh_token',
  HAS_COMPLETED_ONBOARDING: 'onda_onboarding_completed',
} as const;

/**
 * No web, expo-secure-store não está disponível.
 * Usamos localStorage como fallback (não seguro, mas funcional em dev).
 */
const isWeb = Platform.OS === 'web';

async function setItem(key: string, value: string): Promise<void> {
  if (isWeb) {
    localStorage.setItem(key, value);
    return;
  }
  await SecureStore.setItemAsync(key, value);
}

async function getItem(key: string): Promise<string | null> {
  if (isWeb) {
    return localStorage.getItem(key);
  }
  return SecureStore.getItemAsync(key);
}

async function deleteItem(key: string): Promise<void> {
  if (isWeb) {
    localStorage.removeItem(key);
    return;
  }
  await SecureStore.deleteItemAsync(key);
}

// ---------------------------------------------------------------------------
// API pública — funções de alto nível com tipagem forte
// ---------------------------------------------------------------------------

export const secureStorage = {
  /** Salva os tokens de autenticação */
  async saveTokens(accessToken: string, refreshToken: string): Promise<void> {
    await Promise.all([
      setItem(STORAGE_KEYS.ACCESS_TOKEN, accessToken),
      setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken),
    ]);
  },

  /** Recupera os tokens de autenticação */
  async getTokens(): Promise<{ accessToken: string | null; refreshToken: string | null }> {
    const [accessToken, refreshToken] = await Promise.all([
      getItem(STORAGE_KEYS.ACCESS_TOKEN),
      getItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
    return { accessToken, refreshToken };
  },

  /** Remove os tokens de autenticação (logout) */
  async clearTokens(): Promise<void> {
    await Promise.all([
      deleteItem(STORAGE_KEYS.ACCESS_TOKEN),
      deleteItem(STORAGE_KEYS.REFRESH_TOKEN),
    ]);
  },

  /** Marca que o onboarding foi concluído */
  async setOnboardingCompleted(): Promise<void> {
    await setItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING, 'true');
  },

  /** Verifica se o onboarding foi concluído */
  async hasCompletedOnboarding(): Promise<boolean> {
    const value = await getItem(STORAGE_KEYS.HAS_COMPLETED_ONBOARDING);
    return value === 'true';
  },
};
