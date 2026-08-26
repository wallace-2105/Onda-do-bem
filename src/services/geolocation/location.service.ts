/**
 * Service stub para geolocalização.
 * Integrar com expo-location na Etapa 5.
 */

export const locationService = {
  /** Solicita permissão de localização */
  async requestPermission(): Promise<boolean> {
    // TODO: Integrar com expo-location
    console.log('[Location] requestPermission — stub');
    return false;
  },

  /** Obtém a localização atual */
  async getCurrentLocation(): Promise<{ latitude: number; longitude: number } | null> {
    // TODO: Integrar com expo-location
    console.log('[Location] getCurrentLocation — stub');
    return null;
  },
};
