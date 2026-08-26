/**
 * Onda do Bem — Modelos de Domínio
 *
 * Tipos TypeScript que representam as entidades centrais do aplicativo.
 * Esses tipos são a "fonte de verdade" para o shape dos dados em toda a app.
 * Quando o backend for conectado, esses tipos serão sincronizados com os DTOs da API.
 */

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

/** Categorias de ações positivas que um usuário pode registrar */
export enum PostCategory {
  BEACH_CLEANUP = 'BEACH_CLEANUP',
  TREE_PLANTING = 'TREE_PLANTING',
  RECYCLING = 'RECYCLING',
  WATER_CONSERVATION = 'WATER_CONSERVATION',
  COMMUNITY_GARDEN = 'COMMUNITY_GARDEN',
  ANIMAL_RESCUE = 'ANIMAL_RESCUE',
  DONATION = 'DONATION',
  EDUCATION = 'EDUCATION',
  OTHER = 'OTHER',
}

/** Tipos de notificação que o sistema pode gerar */
export enum NotificationType {
  LIKE = 'LIKE',
  COMMENT = 'COMMENT',
  FOLLOW = 'FOLLOW',
  MENTION = 'MENTION',
  IMPACT_MILESTONE = 'IMPACT_MILESTONE',
  SYSTEM = 'SYSTEM',
}

/** Tipos de impacto mensuráveis */
export enum ImpactType {
  TRASH_COLLECTED = 'TRASH_COLLECTED',
  TREES_PLANTED = 'TREES_PLANTED',
  WATER_SAVED = 'WATER_SAVED',
  AREA_CLEANED = 'AREA_CLEANED',
  PEOPLE_HELPED = 'PEOPLE_HELPED',
  ANIMALS_RESCUED = 'ANIMALS_RESCUED',
  ITEMS_RECYCLED = 'ITEMS_RECYCLED',
  ITEMS_DONATED = 'ITEMS_DONATED',
}

// ---------------------------------------------------------------------------
// Entities
// ---------------------------------------------------------------------------

/** Usuário do aplicativo */
export interface User {
  id: string;
  email: string;
  username: string;
  displayName: string;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  totalActions: number;
  totalImpact: number;
  createdAt: string;
  updatedAt: string;
}

/** Publicação de uma ação positiva */
export interface Post {
  id: string;
  authorId: string;
  author: User;
  title: string;
  description: string;
  category: PostCategory;
  imageUrl: string | null;
  latitude: number | null;
  longitude: number | null;
  locationName: string | null;
  likesCount: number;
  commentsCount: number;
  impactScore: number;
  isLiked: boolean;
  createdAt: string;
  updatedAt: string;
}

/** Curtida de uma publicação */
export interface Like {
  id: string;
  userId: string;
  postId: string;
  createdAt: string;
}

/** Comentário em uma publicação */
export interface Comment {
  id: string;
  authorId: string;
  author: User;
  postId: string;
  parentId: string | null;
  content: string;
  createdAt: string;
  updatedAt: string;
}

/** Registro de impacto mensurável de uma ação */
export interface Impact {
  id: string;
  userId: string;
  postId: string;
  type: ImpactType;
  value: number;
  unit: string;
  description: string | null;
  createdAt: string;
}

/** Notificação enviada a um usuário */
export interface Notification {
  id: string;
  recipientId: string;
  senderId: string | null;
  sender: User | null;
  type: NotificationType;
  title: string;
  body: string;
  referenceId: string | null;
  referenceType: string | null;
  isRead: boolean;
  createdAt: string;
}

/** Localização geográfica de uma ação */
export interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  city: string | null;
  state: string | null;
  country: string | null;
}
