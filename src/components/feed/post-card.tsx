/**
 * Onda do Bem — PostCard Component
 *
 * Exibe uma publicação de ação positiva com cabeçalho de autor,
 * badge de categoria, imagem, métrica de impacto e ações (curtir, comentar).
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Share,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { type Post } from '@/types/entities';
import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius, Shadows, FontWeight } from '@/constants/theme';
import { CATEGORY_INFO } from '@/constants/mock-data';

interface PostCardProps {
  post: Post;
  onToggleLike: (postId: string) => void;
}

export function PostCard({ post, onToggleLike }: PostCardProps) {
  const theme = useAppTheme();
  const [commentOpen, setCommentOpen] = useState(false);
  const categoryMeta = CATEGORY_INFO[post.category] ?? {
    label: 'Ação do Bem',
    emoji: '✨',
    color: theme.primary,
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Confira essa ação do bem no app Onda do Bem: "${post.title}" por @${post.author.username}! 🌊✨`,
      });
    } catch {
      // ignore
    }
  };

  // Formatação simples de data
  const dateFormatted = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  return (
    <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
      {/* Header do Autor */}
      <View style={styles.header}>
        <View style={styles.authorContainer}>
          <Avatar
            source={post.author.avatarUrl}
            name={post.author.displayName}
            size="md"
          />
          <View style={styles.authorInfo}>
            <View style={styles.nameRow}>
              <AppText variant="body" weight="semibold">
                {post.author.displayName}
              </AppText>
              <AppText variant="caption" color="muted" style={styles.dot}>
                •
              </AppText>
              <AppText variant="caption" color="muted">
                {dateFormatted}
              </AppText>
            </View>
            <AppText variant="caption" color="secondary" numberOfLines={1}>
              {post.locationName || `@${post.author.username}`}
            </AppText>
          </View>
        </View>

        {/* Badge de Categoria */}
        <View style={[styles.categoryBadge, { backgroundColor: categoryMeta.color + '20' }]}>
          <AppText variant="caption" style={{ color: categoryMeta.color, fontWeight: FontWeight.semibold }}>
            {categoryMeta.emoji} {categoryMeta.label}
          </AppText>
        </View>
      </View>

      {/* Título & Descrição */}
      <View style={styles.content}>
        <AppText variant="bodyLg" weight="bold" style={styles.title}>
          {post.title}
        </AppText>
        <AppText variant="body" color="secondary" style={styles.description}>
          {post.description}
        </AppText>
      </View>

      {/* Imagem do Post (se houver) */}
      {post.imageUrl ? (
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: post.imageUrl }}
            style={styles.image}
            contentFit="cover"
            transition={300}
          />
          {post.impactScore > 0 && (
            <View style={styles.impactBadge}>
              <Ionicons name="sparkles" size={13} color="#FFFFFF" />
              <AppText variant="caption" style={styles.impactText}>
                Impacto: +{post.impactScore}
              </AppText>
            </View>
          )}
        </View>
      ) : null}

      {/* Barra de Ações (Curtir, Comentar, Compartilhar) */}
      <View style={[styles.actionsBar, { borderTopColor: theme.borderLight }]}>
        <View style={styles.leftActions}>
          <Pressable
            onPress={() => onToggleLike(post.id)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            hitSlop={8}
          >
            <Ionicons
              name={post.isLiked ? 'heart' : 'heart-outline'}
              size={24}
              color={post.isLiked ? '#EF4444' : theme.textSecondary}
            />
            <AppText
              variant="bodySm"
              weight="medium"
              style={{
                color: post.isLiked ? '#EF4444' : theme.textSecondary,
                marginLeft: Spacing.xs,
              }}
            >
              {post.likesCount}
            </AppText>
          </Pressable>

          <Pressable
            onPress={() => setCommentOpen(!commentOpen)}
            style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
            hitSlop={8}
          >
            <Ionicons name="chatbubble-outline" size={22} color={theme.textSecondary} />
            <AppText
              variant="bodySm"
              weight="medium"
              style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
            >
              {post.commentsCount}
            </AppText>
          </Pressable>
        </View>

        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
          hitSlop={8}
        >
          <Ionicons name="share-social-outline" size={22} color={theme.textSecondary} />
        </Pressable>
      </View>

      {/* Caixa de comentário expandida rápida */}
      {commentOpen && (
        <View style={[styles.commentPreview, { backgroundColor: theme.surfaceElevated }]}>
          <AppText variant="caption" color="muted">
            💬 Comentários em breve! Por enquanto, você já pode curtir e criar posts.
          </AppText>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  authorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: Spacing.sm,
  },
  authorInfo: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    marginHorizontal: 4,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  content: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  title: {
    marginBottom: 4,
  },
  description: {
    lineHeight: 20,
  },
  imageContainer: {
    width: '100%',
    height: 260,
    position: 'relative',
    backgroundColor: '#0F172A',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  impactBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  impactText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.semibold,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderTopWidth: 1,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.lg,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionPressed: {
    opacity: 0.6,
  },
  commentPreview: {
    padding: Spacing.sm,
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
});
