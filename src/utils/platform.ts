/**
 * Onda do Bem — Platform Helpers
 *
 * Utilidades para lidar com diferenças entre plataformas.
 */

import { Platform, Dimensions } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export { SCREEN_WIDTH, SCREEN_HEIGHT };

/** Verifica se o dispositivo é um tablet (largura >= 768) */
export function isTablet(): boolean {
  return SCREEN_WIDTH >= 768;
}

/** Retorna o valor correto por plataforma */
export function platformSelect<T>(config: { ios: T; android: T; default?: T }): T {
  if (isIOS) return config.ios;
  if (isAndroid) return config.android;
  return config.default ?? config.android;
}
