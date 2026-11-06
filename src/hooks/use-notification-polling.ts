/**
 * Onda do Bem — Polling de notificações
 *
 * Enquanto há um usuário logado, consulta as notificações ao entrar, a cada
 * intervalo e sempre que o app volta ao primeiro plano. Ao trocar de conta
 * ou sair, limpa as notificações da sessão anterior.
 */

import { useEffect } from 'react';
import { AppState } from 'react-native';

import { useAuthStore } from '@/store/auth.store';
import { useNotificationStore } from '@/store/notification.store';

const NOTIFICATION_POLL_INTERVAL_MS = 20_000;

export function useNotificationPolling() {
  const userId = useAuthStore((s) => s.user?.id ?? null);

  useEffect(() => {
    const store = useNotificationStore.getState();
    store.clearNotifications();
    if (!userId) return;

    const fetchNow = () => useNotificationStore.getState().fetchNotifications();
    fetchNow();

    const interval = setInterval(fetchNow, NOTIFICATION_POLL_INTERVAL_MS);
    const subscription = AppState.addEventListener('change', (status) => {
      if (status === 'active') fetchNow();
    });

    return () => {
      clearInterval(interval);
      subscription.remove();
    };
  }, [userId]);
}
