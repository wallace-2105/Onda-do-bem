/**
 * Onda do Bem — Endpoints da API
 *
 * Centraliza todas as URLs de endpoints em um único lugar.
 * Quando o backend estiver pronto, basta atualizar os caminhos aqui.
 */

export const Endpoints = {
  auth: {
    login: '/auth/login',
    register: '/auth/register',
    refresh: '/auth/refresh',
    logout: '/auth/logout',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    me: '/auth/me',
  },
  posts: {
    list: '/posts',
    detail: (id: string) => `/posts/${id}`,
    create: '/posts',
    update: (id: string) => `/posts/${id}`,
    delete: (id: string) => `/posts/${id}`,
    like: (id: string) => `/posts/${id}/like`,
    unlike: (id: string) => `/posts/${id}/unlike`,
    comments: (id: string) => `/posts/${id}/comments`,
  },
  users: {
    profile: (id: string) => `/users/${id}`,
    me: '/users/me',
    update: '/users/me',
    avatar: '/users/me/avatar',
  },
  impact: {
    summary: '/impact/summary',
    byUser: (id: string) => `/impact/user/${id}`,
    community: '/impact/community',
  },
  notifications: {
    list: '/notifications',
    markRead: (id: string) => `/notifications/${id}/read`,
    markAllRead: '/notifications/read-all',
  },
  upload: {
    image: '/upload/image',
  },
} as const;
