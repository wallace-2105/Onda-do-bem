/**
 * Onda do Bem — Platform Helpers
 *
 * Utilidades para lidar com diferenças entre plataformas.
 */

import { Alert, Platform, Dimensions } from 'react-native';

export const isIOS = Platform.OS === 'ios';
export const isAndroid = Platform.OS === 'android';
export const isWeb = Platform.OS === 'web';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

export { SCREEN_WIDTH, SCREEN_HEIGHT };

/** Verifica se o dispositivo é um tablet (largura >= 768) */
export function isTablet(): boolean {
  return SCREEN_WIDTH >= 768;
}

/** Alerta simples que também funciona na web (no react-native-web o Alert.alert não faz nada) */
export function showAlert(title: string, message: string): void {
  if (isWeb) {
    window.alert(`${title}\n\n${message}`);
    return;
  }
  Alert.alert(title, message);
}

/**
 * Pede confirmação antes de uma ação destrutiva.
 * Resolve `true` se o usuário confirmar. Na web usa window.confirm.
 */
export function confirmAction(
  title: string,
  message: string,
  confirmLabel = 'Confirmar',
): Promise<boolean> {
  if (isWeb) {
    return Promise.resolve(window.confirm(`${title}\n\n${message}`));
  }
  return new Promise((resolve) => {
    Alert.alert(
      title,
      message,
      [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: confirmLabel, style: 'destructive', onPress: () => resolve(true) },
      ],
      { cancelable: true, onDismiss: () => resolve(false) },
    );
  });
}

/** Retorna o valor correto por plataforma */
export function platformSelect<T>(config: { ios: T; android: T; default?: T }): T {
  if (isIOS) return config.ios;
  if (isAndroid) return config.android;
  return config.default ?? config.android;
}
