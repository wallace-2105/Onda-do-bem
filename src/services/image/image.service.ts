/**
 * Service stub para upload e processamento de imagens.
 * Integrar com expo-image-picker + API na Etapa 7.
 */

export const imageService = {
  /** Abre o seletor de imagem e retorna a URI local */
  async pickImage(): Promise<string | null> {
    // TODO: Integrar com expo-image-picker
    console.log('[Image] pickImage — stub');
    return null;
  },

  /** Faz upload de uma imagem para o backend */
  async uploadImage(_uri: string): Promise<string | null> {
    // TODO: Integrar com API de upload
    console.log('[Image] uploadImage — stub');
    return null;
  },
};
