/**
 * Onda do Bem — PostCard Component
 *
 * Exibe uma publicação de ação positiva com cabeçalho de autor,
 * badge de categoria, imagem, métrica de impacto, curtidas
 * e seção interativa de comentários com mensagens de incentivo.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Share,
  TextInput,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { type Post, type Comment } from '@/types/entities';
import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-theme';
import { useFeedStore } from '@/store/feed.store';
import { Spacing, BorderRadius, Shadows, FontWeight } from '@/constants/theme';
import { CATEGORY_INFO } from '@/constants/mock-data';

interface PostCardProps {
  post: Post;
  onToggleLike: (postId: string) => void;
}

export function PostCard({ post, onToggleLike }: PostCardProps) {
  const theme = useAppTheme();
  const addComment = useFeedStore((s) => s.addComment);
  const [commentOpen, setCommentOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

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

  const handleSendComment = () => {
    if (!newCommentText.trim()) return;
    addComment(post.id, newCommentText);
    setNewCommentText('');
    setCommentOpen(true);
  };

  // Formatação de data
  const dateFormatted = new Date(post.createdAt).toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
  });

  const commentsList = post.comments || [];

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

      {/* Imagem do Post */}
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
            <Ionicons
              name={commentOpen ? 'chatbubble' : 'chatbubble-outline'}
              size={22}
              color={commentOpen ? theme.primary : theme.textSecondary}
            />
            <AppText
              variant="bodySm"
              weight="medium"
              style={{
                color: commentOpen ? theme.primary : theme.textSecondary,
                marginLeft: Spacing.xs,
              }}
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

      {/* Botão rápido para ver comentários quando fechado */}
      {!commentOpen && commentsList.length > 0 && (
        <Pressable
          onPress={() => setCommentOpen(true)}
          style={styles.openCommentsBtn}
        >
          <AppText variant="caption" color="secondary">
            Ver todos os {commentsList.length} comentários de apoio ✨
          </AppText>
        </Pressable>
      )}

      {/* Seção expandida de Comentários */}
      {commentOpen && (
        <View style={[styles.commentsSection, { backgroundColor: theme.surfaceElevated, borderTopColor: theme.borderLight }]}>
          <View style={styles.commentsHeader}>
            <View style={styles.commentsTitleRow}>
              <Ionicons name="chatbubbles" size={16} color={theme.primary} />
              <AppText variant="caption" weight="bold" style={{ color: theme.primary, marginLeft: 6 }}>
                MENSAGENS DE INCENTIVO ({commentsList.length})
              </AppText>
            </View>
            <Pressable onPress={() => setCommentOpen(false)} hitSlop={8}>
              <Ionicons name="close" size={18} color={theme.textMuted} />
            </Pressable>
          </View>

          {/* Lista de Comentários Positivos */}
          {commentsList.map((c: Comment) => (
            <View key={c.id} style={[styles.commentItem, { borderBottomColor: theme.borderLight }]}>
              <Avatar
                source={c.author.avatarUrl}
                name={c.author.displayName}
                size="sm"
              />
              <View style={styles.commentContent}>
                <View style={styles.commentAuthorRow}>
                  <AppText variant="caption" weight="bold">
                    {c.author.displayName}
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ fontSize: 10, marginLeft: 6 }}>
                    {c.createdAt
                      ? new Date(c.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'short',
                        })
                      : 'Agora'}
                  </AppText>
                </View>
                <AppText variant="bodySm" color="secondary" style={styles.commentText}>
                  {c.content}
                </AppText>
              </View>
            </View>
          ))}

          {/* Input para enviar nova mensagem positiva */}
          <View style={[styles.inputRow, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <TextInput
              placeholder="Deixe uma mensagem de apoio..."
              placeholderTextColor={theme.textMuted}
              value={newCommentText}
              onChangeText={setNewCommentText}
              style={[styles.input, { color: theme.text }]}
              onSubmitEditing={handleSendComment}
            />
            <Pressable
              onPress={handleSendComment}
              disabled={!newCommentText.trim()}
              style={[
                styles.sendBtn,
                { backgroundColor: newCommentText.trim() ? theme.primary : theme.border },
              ]}
            >
              <Ionicons name="send" size={15} color="#FFFFFF" />
            </Pressable>
          </View>
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
  openCommentsBtn: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  commentsSection: {
    padding: Spacing.md,
    borderTopWidth: 1,
  },
  commentsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  commentsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  commentItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing.xs,
    marginBottom: 6,
  },
  commentContent: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  commentAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
  },
  commentText: {
    lineHeight: 18,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.full,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 4,
    marginTop: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: 13,
    paddingVertical: 4,
    paddingHorizontal: 4,
  },
  sendBtn: {
    width: 28,
    height: 28,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 4,
  },
});
