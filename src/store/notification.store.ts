/**
 * Onda do Bem — Notification Store (Zustand)
 *
 * Notificações reais vindas do backend (curtidas e comentários nas publicações
 * do usuário logado). O app consulta a API periodicamente; quando chega uma
 * notificação nova, exibe o popup discreto no topo e balança o sino.
 */

import { create } from 'zustand';

import { type Notification, NotificationType } from '@/types/entities';
import type { ApiResponse } from '@/types/api';
import { apiGet, apiPatch, Endpoints } from '@/services/api';
import { tokenRegistry } from '@/services/api/token-registry';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  senderName: string;
  senderAvatar: string | null;
  type: NotificationType;
  createdAt: string;
}

interface NotificationListPayload {
  notifications: Notification[];
  unreadCount: number;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  activeToast: ToastNotification | null;
  bellShakeTrigger: number;
  /** Se já houve a primeira carga (a primeira não gera popup para notificações antigas) */
  hasLoaded: boolean;

  /** Busca as notificações do usuário logado e avisa sobre as novas */
  fetchNotifications: () => Promise<void>;

  /** Exibe manualmente um toast */
  showToast: (toast: ToastNotification) => void;

  /** Fecha o popup discreto */
  hideToast: () => void;

  /** Marca todas as notificações como lidas */
  markAllAsRead: () => void;

  /** Marca uma notificação individual como lida */
  markAsRead: (id: string) => void;

  /** Limpa tudo (logout / troca de conta) */
  clearNotifications: () => void;
}

const TOAST_DURATION_MS = 4200;

let toastTimer: ReturnType<typeof setTimeout> | null = null;
/** Incrementado ao limpar, para descartar respostas de uma sessão anterior */
let sessionGeneration = 0;
let fetchInFlight: Promise<void> | null = null;

function toToast(notification: Notification): ToastNotification {
  return {
    id: notification.id,
    title: notification.title,
    body: notification.body,
    senderName: notification.sender?.displayName ?? 'Onda do Bem',
    senderAvatar: notification.sender?.avatarUrl ?? null,
    type: notification.type,
    createdAt: notification.createdAt,
  };
}

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: [],
  unreadCount: 0,
  activeToast: null,
  bellShakeTrigger: 0,
  hasLoaded: false,

  fetchNotifications: () => {
    // Convidado não tem notificações
    if (!tokenRegistry.getAccessToken()) return Promise.resolve();
    // Evita requisições sobrepostas (polling + volta ao app ao mesmo tempo)
    if (fetchInFlight) return fetchInFlight;

    const generation = sessionGeneration;

    fetchInFlight = (async () => {
      try {
        const response = await apiGet<ApiResponse<NotificationListPayload>>(Endpoints.notifications.list);
        if (generation !== sessionGeneration) return;

        const payload = response?.data;
        if (!payload || !Array.isArray(payload.notifications)) return;

        const { notifications: previous, hasLoaded } = get();
        const knownIds = new Set(previous.map((n) => n.id));
        const fresh = payload.notifications.filter((n) => !n.isRead && !knownIds.has(n.id));

        set({
          notifications: payload.notifications,
          unreadCount: payload.unreadCount,
          hasLoaded: true,
        });

        // Popup só para o que chegou desde a última consulta
        if (hasLoaded && fresh.length > 0) {
          get().showToast(toToast(fresh[0]));
        }
      } catch {
        // Offline ou servidor acordando: mantém o que já está na tela
      } finally {
        fetchInFlight = null;
      }
    })();

    return fetchInFlight;
  },

  showToast: (toast) => {
    if (toastTimer) clearTimeout(toastTimer);
    set((state) => ({
      activeToast: toast,
      bellShakeTrigger: state.bellShakeTrigger + 1,
    }));
    toastTimer = setTimeout(() => {
      set({ activeToast: null });
    }, TOAST_DURATION_MS);
  },

  hideToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ activeToast: null });
  },

  markAllAsRead: () => {
    if (get().unreadCount === 0) return;
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
    apiPatch(Endpoints.notifications.markAllRead).catch(() => {});
  },

  markAsRead: (id: string) => {
    const target = get().notifications.find((n) => n.id === id);
    if (!target || target.isRead) return;

    set((state) => ({
      notifications: state.notifications.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
      unreadCount: Math.max(0, state.unreadCount - 1),
    }));
    apiPatch(Endpoints.notifications.markRead(id)).catch(() => {});
  },

  clearNotifications: () => {
    sessionGeneration += 1;
    if (toastTimer) clearTimeout(toastTimer);
    set({ notifications: [], unreadCount: 0, activeToast: null, hasLoaded: false });
  },
}));
