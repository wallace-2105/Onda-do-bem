/**
 * Onda do Bem — Notification Store (Zustand)
 *
 * Gerencia notificações de impacto e interações sociais (curtidas, comentários).
 * Fornece estado para o popup discreto animado disparado a partir do botão
 * de notificações existente na barra superior.
 */

import { create } from 'zustand';
import { type Notification, NotificationType } from '@/types/entities';

export interface ToastNotification {
  id: string;
  title: string;
  body: string;
  senderName: string;
  senderAvatar: string | null;
  postTitle?: string;
  type: NotificationType;
  createdAt: string;
}

interface NotificationState {
  notifications: Notification[];
  unreadCount: number;
  activeToast: ToastNotification | null;
  bellShakeTrigger: number;

  /** Dispara uma notificação de curtida e exibe o popup discreto no topo */
  triggerLikeNotification: (params?: {
    senderName?: string;
    senderAvatar?: string | null;
    postTitle?: string;
    postId?: string;
  }) => void;

  /** Exibe manualmente um toast */
  showToast: (toast: ToastNotification) => void;

  /** Fecha o popup discreto */
  hideToast: () => void;

  /** Marca todas as notificações como lidas */
  markAllAsRead: () => void;

  /** Marca uma notificação individual como lida */
  markAsRead: (id: string) => void;

  /** Limpa todas as notificações */
  clearNotifications: () => void;
}

const INITIAL_NOTIFICATIONS: Notification[] = [
  {
    id: 'notif-1',
    recipientId: 'u1',
    senderId: 'u2',
    sender: {
      id: 'u2',
      displayName: 'Marina Costa',
      username: 'marina.eco',
      email: 'marina.costa@ondadobem.org',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop',
      bio: 'Bióloga marinha',
      location: 'Rio de Janeiro, RJ',
      totalActions: 28,
      totalImpact: 890,
      rank: 5,
      rankTitle: 'Líder Sustentável',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    type: NotificationType.LIKE,
    title: 'Nova curtida',
    body: 'Marina Costa curtiu sua ação "Mutirão de Limpeza na Praia Mole" (+2 de impacto)!',
    referenceId: 'post-1',
    referenceType: 'POST',
    isRead: false,
    createdAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(), // há 12 min
  },
  {
    id: 'notif-2',
    recipientId: 'u1',
    senderId: 'u3',
    sender: {
      id: 'u3',
      displayName: 'Pedro Almeida',
      username: 'pedro.almeida',
      email: 'pedro.almeida@ondadobem.org',
      avatarUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop',
      bio: 'Engenheiro ambiental',
      location: 'Curitiba, PR',
      totalActions: 12,
      totalImpact: 310,
      rank: 3,
      rankTitle: 'Semeador do Futuro',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    type: NotificationType.COMMENT,
    title: 'Novo comentário',
    body: 'Pedro Almeida comentou: "No próximo mutirão podem contar comigo com certeza!"',
    referenceId: 'post-1',
    referenceType: 'POST',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
  },
  {
    id: 'notif-3',
    recipientId: 'u1',
    senderId: null,
    sender: null,
    type: NotificationType.IMPACT_MILESTONE,
    title: 'Conquista Ecológica! 🌊',
    body: 'Você atingiu 420 pontos de impacto e agora é Guardião da Terra (Nível 4)!',
    referenceId: null,
    referenceType: 'MILESTONE',
    isRead: true,
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
  },
];

let toastTimer: any = null;

export const useNotificationStore = create<NotificationState>()((set, get) => ({
  notifications: INITIAL_NOTIFICATIONS,
  unreadCount: INITIAL_NOTIFICATIONS.filter((n) => !n.isRead).length,
  activeToast: null,
  bellShakeTrigger: 0,

  triggerLikeNotification: (params) => {
    const senderName = params?.senderName || 'Marina Costa';
    const senderAvatar =
      params?.senderAvatar ||
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop';
    const postTitle = params?.postTitle || 'sua publicação';

    const newNotification: Notification = {
      id: 'like-' + Date.now(),
      recipientId: 'current-user',
      senderId: 'user-sender',
      sender: {
        id: 'user-sender',
        displayName: senderName,
        username: senderName.toLowerCase().replace(/\s+/g, '.'),
        email: `${senderName.toLowerCase().replace(/\s+/g, '.')}@ondadobem.org`,
        avatarUrl: senderAvatar,
        bio: 'Membro ativo da rede de impacto',
        location: 'Brasil',
        totalActions: 10,
        totalImpact: 150,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      type: NotificationType.LIKE,
      title: 'Nova curtida recebida!',
      body: `${senderName} curtiu "${postTitle}". Você ganhou +2 de impacto ecológico! 🌊`,
      referenceId: params?.postId || null,
      referenceType: 'POST',
      isRead: false,
      createdAt: new Date().toISOString(),
    };

    const toast: ToastNotification = {
      id: newNotification.id,
      title: 'Nova curtida!',
      body: `${senderName} curtiu sua ação • +2 Impacto 🌱`,
      senderName,
      senderAvatar,
      postTitle,
      type: NotificationType.LIKE,
      createdAt: new Date().toISOString(),
    };

    if (toastTimer) clearTimeout(toastTimer);

    set((state) => ({
      notifications: [newNotification, ...state.notifications],
      unreadCount: state.unreadCount + 1,
      activeToast: toast,
      bellShakeTrigger: state.bellShakeTrigger + 1,
    }));

    // Auto-esconde o popup discreto após 4.2 segundos
    toastTimer = setTimeout(() => {
      set({ activeToast: null });
    }, 4200);
  },

  showToast: (toast) => {
    if (toastTimer) clearTimeout(toastTimer);
    set((state) => ({
      activeToast: toast,
      bellShakeTrigger: state.bellShakeTrigger + 1,
    }));
    toastTimer = setTimeout(() => {
      set({ activeToast: null });
    }, 4200);
  },

  hideToast: () => {
    if (toastTimer) clearTimeout(toastTimer);
    set({ activeToast: null });
  },

  markAllAsRead: () => {
    set((state) => ({
      notifications: state.notifications.map((n) => ({ ...n, isRead: true })),
      unreadCount: 0,
    }));
  },

  markAsRead: (id: string) => {
    set((state) => {
      const updated = state.notifications.map((n) =>
        n.id === id ? { ...n, isRead: true } : n
      );
      return {
        notifications: updated,
        unreadCount: updated.filter((n) => !n.isRead).length,
      };
    });
  },

  clearNotifications: () => {
    set({ notifications: [], unreadCount: 0, activeToast: null });
  },
}));
