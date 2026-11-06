/**
 * Onda do Bem — ImpactStories Component
 *
 * Barra de stories com scroll horizontal:
 * - 1º item: o usuário logado ("Sua Ação"), que abre sua última publicação ou cria uma nova
 * - Demais itens: cada usuário que já publicou, com sua publicação mais recente
 *
 * Ao tocar em um story abre o visualizador em tela cheia, que avança sozinho
 * e permite navegar tocando nas laterais.
 */

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { View, ScrollView, StyleSheet, Pressable, Modal, Animated } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CATEGORY_INFO } from '@/constants/mock-data';
import { getPostImageSource } from '@/utils/post-image';
import { formatRelativeTime } from '@/utils/format';
import type { Post, User } from '@/types/entities';

const STORY_DURATION_MS = 5_000;

interface ImpactStoriesProps {
  /** Usuário logado (null = convidado) */
  user: User | null;
  /** Última publicação de cada usuário, incluindo a do usuário logado */
  stories: Post[];
  /** Abre a tela de nova publicação */
  onCreatePress: () => void;
  /** Convidado tocou em "Sua Ação": pedir login/cadastro */
  onGuestPress: () => void;
}

function firstName(name?: string | null): string {
  return name?.trim().split(/\s+/)[0] || 'Usuário';
}

function StoryAvatar({ uri, name, size }: { uri?: string | null; name?: string | null; size: number }) {
  const theme = useAppTheme();
  const dimension = { width: size, height: size, borderRadius: size / 2 };

  if (uri) {
    return <Image source={{ uri }} style={dimension} contentFit="cover" />;
  }

  return (
    <View style={[dimension, styles.avatarFallback, { backgroundColor: theme.primary }]}>
      <AppText weight="bold" style={{ color: '#FFFFFF', fontSize: size * 0.4 }}>
        {(name?.trim().charAt(0) || '?').toUpperCase()}
      </AppText>
    </View>
  );
}

export function ImpactStories({ user, stories, onCreatePress, onGuestPress }: ImpactStoriesProps) {
  const theme = useAppTheme();
  const [viewerIndex, setViewerIndex] = useState<number | null>(null);

  const ownStory = user ? stories.find((post) => post.authorId === user.id) ?? null : null;
  const otherStories = useMemo(
    () => stories.filter((post) => post.authorId !== user?.id),
    [stories, user?.id]
  );

  // Sequência do visualizador: o próprio story (se houver) e depois os dos outros usuários
  const viewerSequence = useMemo(
    () => (ownStory ? [ownStory, ...otherStories] : otherStories),
    [ownStory, otherStories]
  );

  const handleOwnPress = () => {
    if (!user) return onGuestPress();
    if (ownStory) return setViewerIndex(0);
    onCreatePress();
  };

  const handleAddPress = () => {
    if (!user) return onGuestPress();
    onCreatePress();
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Sua Ação — usuário logado */}
        <View style={styles.storyItem}>
          <Pressable
            onPress={handleOwnPress}
            accessibilityLabel={ownStory ? 'Ver sua última ação' : 'Publicar nova ação'}
            style={({ pressed }) => pressed && styles.pressed}
          >
            <View
              style={[
                styles.avatarRing,
                {
                  borderColor: ownStory ? theme.secondary : theme.primary,
                  borderStyle: ownStory ? 'solid' : 'dashed',
                },
              ]}
            >
              {user ? (
                <StoryAvatar uri={user.avatarUrl} name={user.displayName} size={52} />
              ) : (
                <View style={[styles.guestAvatar, { backgroundColor: theme.surfaceElevated }]}>
                  <Ionicons name="person" size={26} color={theme.textMuted} />
                </View>
              )}
            </View>
          </Pressable>
          <Pressable
            onPress={handleAddPress}
            hitSlop={6}
            accessibilityLabel="Publicar nova ação com foto"
            style={[styles.addBadge, { backgroundColor: theme.primary, borderColor: theme.background }]}
          >
            <Ionicons name="add" size={14} color="#FFFFFF" />
          </Pressable>
          <AppText variant="caption" numberOfLines={1} weight="semibold" style={styles.authorName}>
            Sua Ação
          </AppText>
        </View>

        {/* Demais usuários que já publicaram */}
        {otherStories.map((post) => {
          const sequenceIndex = viewerSequence.indexOf(post);
          return (
            <Pressable
              key={post.authorId}
              style={({ pressed }) => [styles.storyItem, pressed && styles.pressed]}
              onPress={() => setViewerIndex(sequenceIndex)}
              accessibilityLabel={`Ver ação de ${post.author?.displayName ?? 'usuário'}`}
            >
              <View style={[styles.avatarRing, { borderColor: theme.secondary }]}>
                <StoryAvatar uri={post.author?.avatarUrl} name={post.author?.displayName} size={52} />
                <View style={[styles.badgeIcon, { backgroundColor: theme.surfaceElevated }]}>
                  <AppText variant="caption" style={{ fontSize: 10 }}>
                    {CATEGORY_INFO[post.category]?.emoji ?? '🌊'}
                  </AppText>
                </View>
              </View>
              <AppText variant="caption" numberOfLines={1} style={styles.authorName}>
                {firstName(post.author?.displayName)}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>

      <StoryViewer
        sequence={viewerSequence}
        index={viewerIndex}
        ownAuthorId={user?.id ?? null}
        onChangeIndex={setViewerIndex}
        onCreatePress={() => {
          setViewerIndex(null);
          onCreatePress();
        }}
      />
    </View>
  );
}

// ---------------------------------------------------------------------------
// Visualizador em tela cheia
// ---------------------------------------------------------------------------

interface StoryViewerProps {
  sequence: Post[];
  index: number | null;
  ownAuthorId: string | null;
  onChangeIndex: (index: number | null) => void;
  onCreatePress: () => void;
}

function StoryViewer({ sequence, index, ownAuthorId, onChangeIndex, onCreatePress }: StoryViewerProps) {
  const insets = useSafeAreaInsets();
  const progress = useRef(new Animated.Value(0)).current;

  const post = index !== null ? sequence[index] : undefined;
  const isOwn = !!post && post.authorId === ownAuthorId;

  const close = useCallback(() => onChangeIndex(null), [onChangeIndex]);

  const goTo = useCallback(
    (next: number) => {
      if (next < 0) return onChangeIndex(0);
      if (next >= sequence.length) return onChangeIndex(null);
      onChangeIndex(next);
    },
    [onChangeIndex, sequence.length]
  );

  // Barra de progresso: avança sozinho para o próximo usuário
  useEffect(() => {
    if (index === null) return;
    progress.setValue(0);
    const animation = Animated.timing(progress, {
      toValue: 1,
      duration: STORY_DURATION_MS,
      useNativeDriver: false,
    });
    animation.start(({ finished }) => {
      if (finished) goTo(index + 1);
    });
    return () => animation.stop();
  }, [index, goTo, progress]);

  if (!post) return null;

  const imageSource = getPostImageSource(post);
  const category = CATEGORY_INFO[post.category];

  return (
    <Modal visible animationType="fade" onRequestClose={close} statusBarTranslucent>
      <View style={[styles.viewer, { backgroundColor: category?.color ?? '#0284C7' }]}>
        {imageSource ? (
          <Image source={imageSource} style={StyleSheet.absoluteFill} contentFit="cover" />
        ) : (
          <View style={styles.viewerEmojiWrap}>
            <AppText style={styles.viewerEmoji}>{category?.emoji ?? '🌊'}</AppText>
          </View>
        )}
        <View style={styles.viewerShade} />

        {/* Áreas de toque: esquerda volta, direita avança */}
        <View style={StyleSheet.absoluteFill}>
          <View style={styles.tapZones}>
            <Pressable style={styles.tapZone} onPress={() => goTo((index ?? 0) - 1)} />
            <Pressable style={styles.tapZone} onPress={() => goTo((index ?? 0) + 1)} />
          </View>
        </View>

        {/* Topo: progresso, autor e fechar */}
        <View style={[styles.viewerTop, { paddingTop: insets.top + Spacing.sm }]} pointerEvents="box-none">
          <View style={styles.progressRow}>
            {sequence.map((item, i) => (
              <View key={item.id} style={styles.progressTrack}>
                <Animated.View
                  style={[
                    styles.progressFill,
                    {
                      width:
                        i < (index ?? 0)
                          ? '100%'
                          : i === index
                            ? progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] })
                            : '0%',
                    },
                  ]}
                />
              </View>
            ))}
          </View>

          <View style={styles.viewerAuthorRow}>
            <StoryAvatar uri={post.author?.avatarUrl} name={post.author?.displayName} size={36} />
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <AppText variant="bodySm" weight="bold" style={styles.viewerText}>
                {isOwn ? 'Sua ação' : post.author?.displayName}
              </AppText>
              <AppText variant="caption" style={styles.viewerTextMuted}>
                {formatRelativeTime(post.createdAt)}
              </AppText>
            </View>
            <Pressable onPress={close} hitSlop={12} accessibilityLabel="Fechar">
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </Pressable>
          </View>
        </View>

        {/* Rodapé: conteúdo da publicação */}
        <View style={[styles.viewerBottom, { paddingBottom: insets.bottom + Spacing.lg }]} pointerEvents="box-none">
          {category && (
            <View style={styles.viewerChip}>
              <AppText variant="caption" weight="bold" style={styles.viewerText}>
                {category.emoji} {category.label}
              </AppText>
            </View>
          )}
          <AppText variant="h3" weight="bold" style={styles.viewerText}>
            {post.title}
          </AppText>
          {!!post.description && (
            <AppText variant="bodySm" numberOfLines={4} style={[styles.viewerTextMuted, { marginTop: 4 }]}>
              {post.description}
            </AppText>
          )}
          {!!post.locationName && (
            <AppText variant="caption" style={[styles.viewerTextMuted, { marginTop: 6 }]}>
              📍 {post.locationName}
            </AppText>
          )}

          {isOwn && (
            <Pressable style={styles.viewerCreateBtn} onPress={onCreatePress}>
              <Ionicons name="camera" size={18} color="#0284C7" />
              <AppText variant="bodySm" weight="bold" style={{ color: '#0284C7', marginLeft: 8 }}>
                Publicar nova ação com foto
              </AppText>
            </Pressable>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingVertical: Spacing.sm,
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.md,
  },
  storyItem: {
    alignItems: 'center',
    width: 68,
  },
  pressed: {
    opacity: 0.7,
  },
  avatarRing: {
    width: 62,
    height: 62,
    borderRadius: BorderRadius.full,
    borderWidth: 2.5,
    padding: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarFallback: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBadge: {
    position: 'absolute',
    top: 42,
    right: 1,
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeIcon: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 20,
    height: 20,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
  },
  authorName: {
    marginTop: 6,
    textAlign: 'center',
    width: '100%',
  },

  // Visualizador
  viewer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  viewerEmojiWrap: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewerEmoji: {
    fontSize: 120,
    lineHeight: 140,
  },
  viewerShade: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.28)',
  },
  tapZones: {
    flex: 1,
    flexDirection: 'row',
  },
  tapZone: {
    flex: 1,
  },
  viewerTop: {
    paddingHorizontal: Spacing.md,
  },
  progressRow: {
    flexDirection: 'row',
    gap: 4,
  },
  progressTrack: {
    flex: 1,
    height: 3,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  viewerAuthorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
  },
  viewerBottom: {
    paddingHorizontal: Spacing.lg,
  },
  viewerChip: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    marginBottom: Spacing.sm,
  },
  viewerText: {
    color: '#FFFFFF',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  viewerTextMuted: {
    color: 'rgba(255, 255, 255, 0.9)',
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  viewerCreateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.lg,
    paddingVertical: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: '#FFFFFF',
  },
});
