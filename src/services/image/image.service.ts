/**
 * Onda do Bem — Image Service
 *
 * Envia imagens escolhidas no dispositivo para o backend, que as persiste no
 * Supabase Storage e devolve uma URL pública acessível por qualquer cliente.
 */

import { Platform } from 'react-native';

import { apiClient, Endpoints } from '@/services/api';
import type { ApiResponse } from '@/types/api';

// URIs que só existem no dispositivo/aba que escolheu a foto
const LOCAL_URI_PATTERN = /^(blob:|file:|content:|ph:|assets-library:|data:)/i;

export function isLocalImageUri(uri?: string | null): uri is string {
  return !!uri && LOCAL_URI_PATTERN.test(uri);
}

function guessMimeType(uri: string): string {
  const extension = uri.split('?')[0].split('.').pop()?.toLowerCase();
  if (extension === 'png') return 'image/png';
  if (extension === 'webp') return 'image/webp';
  if (extension === 'gif') return 'image/gif';
  return 'image/jpeg';
}

export const imageService = {
  /** Abre o seletor de imagem e retorna a URI local */
  async pickImage(): Promise<string | null> {
    // TODO: Integrar com expo-image-picker
    console.log('[Image] pickImage — stub');
    return null;
  },

  /** Faz upload de uma imagem local e retorna a URL pública no Supabase Storage */
  async uploadImage(uri: string): Promise<string> {
    const form = new FormData();

    if (Platform.OS === 'web') {
      // Na web o picker retorna `blob:` — lê o arquivo real antes de enviar
      const blob = await (await fetch(uri)).blob();
      const extension = blob.type.split('/')[1] || 'jpg';
      form.append('file', blob, `upload.${extension}`);
    } else {
      const type = guessMimeType(uri);
      form.append('file', { uri, name: `upload.${type.split('/')[1]}`, type } as unknown as Blob);
    }

    // O Content-Type JSON padrão do client faria o axios serializar o FormData como JSON;
    // com multipart o axios deixa o browser/RN definir o boundary.
    const response = await apiClient.post<ApiResponse<{ url: string }>>(Endpoints.upload.image, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data.url;
  },
};
