/**
 * Onda do Bem — Feed Store (Zustand)
 *
 * Gerencia os posts do feed em memória durante a sessão.
 * Permite alternar curtidas e adicionar novas publicações dinamicamente.
 */

import { create } from 'zustand';
import { type Post, PostCategory } from '@/types/entities';
import { INITIAL_POSTS, CURRENT_USER } from '@/constants/mock-data';

interface CreatePostInput {
  title: string;
  description: string;
  category: PostCategory;
  locationName?: string;
  imageUrl?: string;
  impactScore?: number;
}

interface FeedState {
  posts: Post[];
  isRefreshing: boolean;
  selectedCategory: PostCategory | 'ALL';
  toggleLike: (postId: string) => void;
  addPost: (input: CreatePostInput) => void;
  refreshFeed: () => Promise<void>;
  setSelectedCategory: (category: PostCategory | 'ALL') => void;
}

export const useFeedStore = create<FeedState>((set, get) => ({
  posts: INITIAL_POSTS,
  isRefreshing: false,
  selectedCategory: 'ALL',

  toggleLike: (postId: string) => {
    set((state) => ({
      posts: state.posts.map((post) => {
        if (post.id === postId) {
          const isLiked = !post.isLiked;
          return {
            ...post,
            isLiked,
            likesCount: isLiked ? post.likesCount + 1 : Math.max(0, post.likesCount - 1),
          };
        }
        return post;
      }),
    }));
  },

  addPost: (input: CreatePostInput) => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      authorId: CURRENT_USER.id,
      author: CURRENT_USER,
      title: input.title,
      description: input.description,
      category: input.category,
      imageUrl:
        input.imageUrl ||
        'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
      latitude: -27.5954,
      longitude: -48.548,
      locationName: input.locationName || CURRENT_USER.location || 'Brasil',
      likesCount: 1,
      commentsCount: 0,
      impactScore: input.impactScore || 10,
      isLiked: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      posts: [newPost, ...state.posts],
    }));
  },

  refreshFeed: async () => {
    set({ isRefreshing: true });
    // Simula delay de rede de 600ms
    await new Promise((resolve) => setTimeout(resolve, 600));
    set({ isRefreshing: false });
  },

  setSelectedCategory: (category) => {
    set({ selectedCategory: category });
  },
}));
