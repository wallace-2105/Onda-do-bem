/**
 * Onda do Bem — Feed Store (Zustand com Persistência)
 *
 * Gerencia as publicações do feed e o usuário logado com persistência via AsyncStorage.
 * Implementa a regra de impacto: cada curtida vale +2 de impacto para o autor da publicação,
 * elevando em tempo real seu score e seu rank sustentável.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { type Post, type Comment, type User, PostCategory } from '@/types/entities';
import { INITIAL_POSTS, CURRENT_USER } from '@/constants/mock-data';
import { calculateUserRank } from '@/utils/rank';

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
  currentUser: User;
  isRefreshing: boolean;
  selectedCategory: PostCategory | 'ALL';
  toggleLike: (postId: string) => void;
  addPost: (input: CreatePostInput) => void;
  addComment: (postId: string, content: string) => void;
  refreshFeed: () => Promise<void>;
  setSelectedCategory: (category: PostCategory | 'ALL') => void;
  resetToDefaults: () => void;
}

const initialRankInfo = calculateUserRank(CURRENT_USER.totalImpact);
const initialCurrentUser: User = {
  ...CURRENT_USER,
  rank: initialRankInfo.rank,
  rankTitle: initialRankInfo.title,
};

// Garante que os posts iniciais também tenham rank computado para os autores
const hydratedInitialPosts: Post[] = INITIAL_POSTS.map((p) => {
  const authorRank = calculateUserRank(p.author?.totalImpact || 0);
  return {
    ...p,
    author: {
      ...p.author,
      rank: authorRank.rank,
      rankTitle: authorRank.title,
    },
  };
});

export const useFeedStore = create<FeedState>()(
  persist(
    (set) => ({
      posts: hydratedInitialPosts,
      currentUser: initialCurrentUser,
      isRefreshing: false,
      selectedCategory: 'ALL',

      toggleLike: (postId: string) => {
        set((state) => {
          const targetPost = state.posts.find((p) => p.id === postId);
          if (!targetPost) return state;

          const isLiked = !targetPost.isLiked;
          const deltaImpact = isLiked ? 2 : -2;

          const authorId = targetPost.authorId;
          const authorUsername = targetPost.author?.username;

          const isCurrentUserAuthor =
            authorId === state.currentUser.id ||
            (authorUsername && authorUsername === state.currentUser.username);

          // Atualiza o usuário logado se ele for o autor da postagem curtida
          let updatedCurrentUser = state.currentUser;
          if (isCurrentUserAuthor) {
            const newImpact = Math.max(0, (state.currentUser.totalImpact || 0) + deltaImpact);
            const newRankInfo = calculateUserRank(newImpact);
            updatedCurrentUser = {
              ...state.currentUser,
              totalImpact: newImpact,
              rank: newRankInfo.rank,
              rankTitle: newRankInfo.title,
            };

            // Sincroniza fallback in-memory do CURRENT_USER
            CURRENT_USER.totalImpact = newImpact;
            CURRENT_USER.rank = newRankInfo.rank;
            CURRENT_USER.rankTitle = newRankInfo.title;
          }

          // Atualiza todos os posts daquele autor no feed para manter integridade visual
          const updatedPosts = state.posts.map((post) => {
            const isTarget = post.id === postId;
            const isSameAuthor =
              post.authorId === authorId ||
              (authorUsername && post.author?.username === authorUsername);

            let updatedAuthor = post.author;
            if (isSameAuthor) {
              const currentImpact = isCurrentUserAuthor
                ? updatedCurrentUser.totalImpact
                : Math.max(0, (post.author?.totalImpact || 0) + deltaImpact);
              const rankInfo = calculateUserRank(currentImpact);

              updatedAuthor = {
                ...post.author,
                totalImpact: currentImpact,
                rank: rankInfo.rank,
                rankTitle: rankInfo.title,
              };
            }

            if (isTarget) {
              const nextLikesCount = isLiked
                ? post.likesCount + 1
                : Math.max(0, post.likesCount - 1);
              const nextImpactScore = Math.max(0, (post.impactScore || 0) + deltaImpact);

              return {
                ...post,
                isLiked,
                likesCount: nextLikesCount,
                impactScore: nextImpactScore,
                author: updatedAuthor,
              };
            }

            if (isSameAuthor) {
              return {
                ...post,
                author: updatedAuthor,
              };
            }

            return post;
          });

          return {
            posts: updatedPosts,
            currentUser: updatedCurrentUser,
          };
        });
      },

      addPost: (input: CreatePostInput) => {
        set((state) => {
          const postImpact = input.impactScore || 10;
          const updatedActions = (state.currentUser.totalActions || 0) + 1;
          const updatedImpact = (state.currentUser.totalImpact || 0) + postImpact;
          const updatedRankInfo = calculateUserRank(updatedImpact);

          const updatedCurrentUser: User = {
            ...state.currentUser,
            totalActions: updatedActions,
            totalImpact: updatedImpact,
            rank: updatedRankInfo.rank,
            rankTitle: updatedRankInfo.title,
          };

          CURRENT_USER.totalActions = updatedActions;
          CURRENT_USER.totalImpact = updatedImpact;
          CURRENT_USER.rank = updatedRankInfo.rank;
          CURRENT_USER.rankTitle = updatedRankInfo.title;

          const newPost: Post = {
            id: `post-${Date.now()}`,
            authorId: updatedCurrentUser.id,
            author: updatedCurrentUser,
            title: input.title,
            description: input.description,
            category: input.category,
            imageUrl:
              input.imageUrl ||
              'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
            latitude: -27.5954,
            longitude: -48.548,
            locationName: input.locationName || updatedCurrentUser.location || 'Brasil',
            likesCount: 1,
            commentsCount: 0,
            impactScore: postImpact,
            isLiked: true,
            comments: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            posts: [newPost, ...state.posts],
            currentUser: updatedCurrentUser,
          };
        });
      },

      addComment: (postId: string, content: string) => {
        if (!content.trim()) return;

        set((state) => {
          const newComment: Comment = {
            id: `c-${Date.now()}`,
            postId,
            authorId: state.currentUser.id,
            author: state.currentUser,
            parentId: null,
            content: content.trim(),
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            posts: state.posts.map((post) => {
              if (post.id === postId) {
                const currentComments = post.comments || [];
                return {
                  ...post,
                  commentsCount: post.commentsCount + 1,
                  comments: [...currentComments, newComment],
                };
              }
              return post;
            }),
          };
        });
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

      resetToDefaults: () => {
        set({
          posts: hydratedInitialPosts,
          currentUser: initialCurrentUser,
          selectedCategory: 'ALL',
        });
      },
    }),
    {
      name: '@onda_do_bem:feed',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ posts: state.posts, currentUser: state.currentUser }),
    }
  )
);
