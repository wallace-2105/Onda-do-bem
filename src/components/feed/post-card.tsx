/**
 * Onda do Bem — PostCard Component
 *
 * Exibe uma publicação de ação positiva com cabeçalho de autor,
 * badge de rank do autor, imagem, métrica de impacto, curtidas
 * com animação de feedback (+2 Impacto) e seção interativa de comentários.
 */

import React, { useState, useRef } from 'react';
import {
  View,
  StyleSheet,
  Pressable,
  Share,
  TextInput,
  Animated,
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
import { getPostImageSource } from '@/utils/post-image';
import { calculateUserRank } from '@/utils/rank';

interface PostCardProps {
  post: Post;
  onToggleLike: (postId: string) => void;
}

export function PostCard({ post, onToggleLike }: PostCardProps) {
  const theme = useAppTheme();
  const addComment = useFeedStore((s) => s.addComment);
  const [commentOpen, setCommentOpen] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  const [showImpactToast, setShowImpactToast] = useState(false);
  const floatAnim = useRef(new Animated.Value(0)).current;
  const heartScale = useRef(new Animated.Value(1)).current;

  const authorImpact = post.author?.totalImpact || 0;
  const authorRank = calculateUserRank(authorImpact);

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

  const handleLikePress = () => {
    const willBeLiked = !post.isLiked;
    onToggleLike(post.id);

    // Animação de pulso no coração
    Animated.sequence([
      Animated.spring(heartScale, { toValue: 1.35, friction: 3, useNativeDriver: true }),
      Animated.spring(heartScale, { toValue: 1, friction: 4, useNativeDriver: true }),
    ]).start();

    // Feedback visual quando curte: "+2 Impacto! ⭐"
    if (willBeLiked) {
      setShowImpactToast(true);
      floatAnim.setValue(0);
      Animated.timing(floatAnim, {
        toValue: 1,
        duration: 1100,
        useNativeDriver: true,
      }).start(() => {
        setShowImpactToast(false);
      });
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
              <AppText variant="body" weight="semibold" numberOfLines={1} style={styles.authorName}>
                {post.author.displayName}
              </AppText>
              <View
                style={[
                  styles.authorRankBadge,
                  { backgroundColor: authorRank.color + '1A', borderColor: authorRank.color + '4D' },
                ]}
              >
                <AppText variant="caption" style={[styles.authorRankText, { color: authorRank.color }]}>
                  {authorRank.badge} Rank {authorRank.rank}
                </AppText>
              </View>
            </View>
            <View style={styles.metaRow}>
              <AppText variant="caption" color="secondary" numberOfLines={1} style={styles.locationText}>
                {post.locationName || `@${post.author.username}`}
              </AppText>
              <AppText variant="caption" color="muted" style={styles.dot}>
                •
              </AppText>
              <AppText variant="caption" color="muted">
                {dateFormatted}
              </AppText>
            </View>
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
      {(() => {
        const imageSource = getPostImageSource(post);
        if (!imageSource) return null;
        return (
          <View style={styles.imageContainer}>
            <Image
              source={imageSource}
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
        );
      })()}

      {/* Barra de Ações (Curtir, Comentar, Compartilhar) */}
      <View style={[styles.actionsBar, { borderTopColor: theme.borderLight }]}>
        <View style={styles.leftActions}>
          <View style={styles.likeButtonWrapper}>
            {showImpactToast && (
              <Animated.View
                style={[
                  styles.floatingImpactToast,
                  {
                    opacity: floatAnim.interpolate({
                      inputRange: [0, 0.15, 0.8, 1],
                      outputRange: [0, 1, 1, 0],
                    }),
                    transform: [
                      {
                        translateY: floatAnim.interpolate({
                          inputRange: [0, 1],
                          outputRange: [0, -32],
                        }),
                      },
                      {
                        scale: floatAnim.interpolate({
                          inputRange: [0, 0.25, 1],
                          outputRange: [0.7, 1.1, 0.95],
                        }),
                      },
                    ],
                  },
                ]}
              >
                <AppText variant="caption" weight="bold" style={styles.floatingImpactText}>
                  +2 Impacto! ⭐
                </AppText>
              </Animated.View>
            )}

            <Pressable
              onPress={handleLikePress}
              style={({ pressed }) => [styles.actionButton, pressed && styles.actionPressed]}
              hitSlop={8}
            >
              <Animated.View style={{ transform: [{ scale: heartScale }] }}>
                <Ionicons
                  name={post.isLiked ? 'heart' : 'heart-outline'}
                  size={24}
                  color={post.isLiked ? '#EF4444' : theme.textSecondary}
                />
              </Animated.View>
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
          </View>

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
        <View style={[styles.commentsSection, { borderTopColor: theme.borderLight }]}>
          <View style={styles.commentsHeader}>
            <View style={styles.commentsTitleRow}>
              <Ionicons name="chatbubbles" size={16} color={theme.primary} />
              <AppText variant="bodySm" weight="semibold" style={{ marginLeft: 6 }}>
                Comentários e Incentivos ({commentsList.length})
              </AppText>
            </View>
            <Pressable onPress={() => setCommentOpen(false)} hitSlop={8}>
              <Ionicons name="close" size={18} color={theme.textSecondary} />
            </Pressable>
          </View>

          {/* Lista de Comentários */}
          {commentsList.map((c: Comment) => (
            <View key={c.id} style={styles.commentItem}>
              <Avatar
                source={c.author.avatarUrl}
                name={c.author.displayName}
                size="sm"
              />
              <View style={styles.commentContent}>
                <View style={styles.commentAuthorRow}>
                  <AppText variant="caption" weight="semibold">
                    {c.author.displayName}
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ marginLeft: 4 }}>
                    • @{c.author.username}
                  </AppText>
                </View>
                <AppText variant="caption" color="secondary" style={styles.commentText}>
                  {c.content}
                </AppText>
              </View>
            </View>
          ))}

          {/* Input para adicionar comentário */}
          <View style={[styles.inputRow, { borderColor: theme.border, backgroundColor: theme.surfaceElevated }]}>
            <TextInput
              placeholder="Envie uma mensagem de incentivo..."
              placeholderTextColor={theme.textMuted}
              value={newCommentText}
              onChangeText={setNewCommentText}
              style={[styles.input, { color: theme.text }]}
              onSubmitEditing={handleSendComment}
              returnKeyType="send"
            />
            <Pressable
              onPress={handleSendComment}
              style={[
                styles.sendBtn,
                { backgroundColor: newCommentText.trim() ? theme.primary : theme.border },
              ]}
              disabled={!newCommentText.trim()}
            >
              <Ionicons name="arrow-up" size={16} color="#FFFFFF" />
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
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
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
    gap: 6,
  },
  authorName: {
    flexShrink: 1,
  },
  authorRankBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    flexShrink: 0,
  },
  authorRankText: {
    fontSize: 10,
    fontWeight: FontWeight.bold,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    flexShrink: 1,
  },
  locationText: {
    flexShrink: 1,
  },
  dot: {
    marginHorizontal: 4,
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    flexShrink: 0,
    alignSelf: 'flex-start',
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
    height: 220,
    position: 'relative',
    backgroundColor: '#E2E8F0',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  impactBadge: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    flexDirection: 'row',
    alignItems: 'center',
  },
  impactText: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
    marginLeft: 4,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderTopWidth: 1,
  },
  leftActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  likeButtonWrapper: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
  },
  floatingImpactToast: {
    position: 'absolute',
    top: -6,
    left: -4,
    backgroundColor: '#10B981',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    zIndex: 10,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 4,
    elevation: 4,
  },
  floatingImpactText: {
    color: '#FFFFFF',
    fontSize: 11,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    paddingRight: Spacing.md,
  },
  actionPressed: {
    opacity: 0.7,
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
