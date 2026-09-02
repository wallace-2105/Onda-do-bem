/**
 * Onda do Bem — Feed Screen
 *
 * Tela principal do aplicativo com scroll vertical de publicações,
 * stories no topo, filtros por categoria e pull-to-refresh.
 */

import React, { useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/hooks/use-theme';
import { useFeedStore } from '@/store/feed.store';
import { AppText } from '@/components/ui/text';
import { PostCard } from '@/components/feed/post-card';
import { ImpactStories } from '@/components/feed/impact-stories';
import { CategoryChips } from '@/components/feed/category-chips';
import { Spacing, BorderRadius } from '@/constants/theme';
import { type Post } from '@/types/entities';

export default function FeedScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const {
    posts,
    isRefreshing,
    selectedCategory,
    toggleLike,
    refreshFeed,
    setSelectedCategory,
  } = useFeedStore();

  // Filtragem dos posts
  const filteredPosts = useMemo(() => {
    if (selectedCategory === 'ALL') return posts;
    return posts.filter((post) => post.category === selectedCategory);
  }, [posts, selectedCategory]);

  const renderHeader = () => (
    <View style={styles.headerComponent}>
      {/* Barra de Stories / Ações em destaque */}
      <ImpactStories
        onStoryPress={() => {
          // Ação ao clicar no story: redireciona para criar ou ver
        }}
      />

      {/* Chips de Categorias */}
      <CategoryChips
        selectedCategory={selectedCategory}
        onSelectCategory={setSelectedCategory}
      />

      <View style={styles.sectionTitleRow}>
        <AppText variant="bodySm" weight="bold" color="secondary">
          {selectedCategory === 'ALL'
            ? 'FEED DE IMPACTO COMUNITÁRIO'
            : `AÇÕES DE ${selectedCategory}`}
        </AppText>
        <AppText variant="caption" color="muted">
          {filteredPosts.length} {filteredPosts.length === 1 ? 'post' : 'posts'}
        </AppText>
      </View>
    </View>
  );

  const renderEmpty = () => (
    <View style={styles.emptyContainer}>
      <AppText variant="h1" center>
        🌱
      </AppText>
      <AppText variant="h3" center style={styles.emptyTitle}>
        Nenhuma ação encontrada
      </AppText>
      <AppText variant="bodySm" color="secondary" center style={styles.emptyDesc}>
        Ainda não há publicações nesta categoria. Seja o primeiro a postar!
      </AppText>
      <Pressable
        style={[styles.emptyButton, { backgroundColor: theme.primary }]}
        onPress={() => router.push('/create')}
      >
        <AppText variant="bodySm" weight="semibold" style={{ color: '#FFFFFF' }}>
          Criar Nova Ação
        </AppText>
      </Pressable>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Top App Bar */}
      <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <View style={styles.brandRow}>
          <AppText variant="h2" style={{ color: theme.primary, marginRight: 6 }}>
            🌊
          </AppText>
          <View>
            <AppText variant="h3" weight="bold" style={{ color: theme.text }}>
              Onda do Bem
            </AppText>
            <AppText variant="caption" color="muted" style={{ marginTop: -2 }}>
              Rede de Impacto Social
            </AppText>
          </View>
        </View>

        <View style={styles.topActions}>
          <Pressable
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.surfaceElevated }, pressed && styles.pressed]}
            onPress={() => router.push('/create')}
            accessibilityLabel="Criar nova publicação"
          >
            <Ionicons name="add" size={22} color={theme.primary} />
          </Pressable>

          <Pressable
            style={({ pressed }) => [styles.iconBtn, { backgroundColor: theme.surfaceElevated }, pressed && styles.pressed]}
            accessibilityLabel="Notificações"
          >
            <Ionicons name="notifications-outline" size={20} color={theme.text} />
            <View style={[styles.badgeDot, { backgroundColor: theme.accent }]} />
          </Pressable>
        </View>
      </View>

      {/* Lista com Scroll do Feed */}
      <FlatList
        data={filteredPosts}
        keyExtractor={(item: Post) => item.id}
        renderItem={({ item }) => (
          <PostCard post={item} onToggleLike={toggleLike} />
        )}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={renderEmpty}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={refreshFeed}
            tintColor={theme.primary}
            colors={[theme.primary]}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  badgeDot: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  pressed: {
    opacity: 0.7,
  },
  headerComponent: {
    marginBottom: Spacing.sm,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.sm,
    paddingBottom: Spacing.xs,
  },
  listContent: {
    paddingBottom: Spacing.xl,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing['3xl'],
    paddingHorizontal: Spacing.xl,
  },
  emptyTitle: {
    marginTop: Spacing.md,
  },
  emptyDesc: {
    marginTop: Spacing.xs,
    maxWidth: 260,
  },
  emptyButton: {
    marginTop: Spacing.lg,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
});
