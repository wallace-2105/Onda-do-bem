/**
 * Service stub para analytics.
 * Integrar com serviço real (ex: Firebase Analytics, Amplitude) na Etapa 6.
 */

export const analyticsService = {
  /** Registra evento de analytics */
  trackEvent(eventName: string, params?: Record<string, unknown>): void {
    if (__DEV__) {
      console.log(`[Analytics] ${eventName}`, params);
    }
    // TODO: Integrar com serviço real
  },

  /** Registra tela visitada */
  trackScreen(screenName: string): void {
    if (__DEV__) {
      console.log(`[Analytics] Screen: ${screenName}`);
    }
    // TODO: Integrar com serviço real
  },

  /** Define propriedade do usuário */
  setUserProperty(key: string, value: string): void {
    if (__DEV__) {
      console.log(`[Analytics] UserProperty: ${key}=${value}`);
    }
    // TODO: Integrar com serviço real
  },
};
