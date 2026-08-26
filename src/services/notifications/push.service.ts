/**
 * Service stub para push notifications.
 * Integrar com expo-notifications na Etapa 4.
 */

export const pushService = {
  /** Solicita permissão de notificações */
  async requestPermission(): Promise<boolean> {
    // TODO: Integrar com expo-notifications
    console.log('[Push] requestPermission — stub');
    return false;
  },

  /** Registra o device token no backend */
  async registerToken(_token: string): Promise<void> {
    // TODO: Enviar token para a API
    console.log('[Push] registerToken — stub');
  },
};
