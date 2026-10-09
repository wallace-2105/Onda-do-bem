/**
 * Onda do Bem — Feed Screen
 *
 * Tela principal do aplicativo com scroll vertical de publicações,
 * stories no topo, filtros por categoria e pull-to-refresh.
 */

import React, { useMemo, useEffect, useState } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Modal,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';

import { useAppTheme } from '@/hooks/use-theme';
import { useFeedStore } from '@/store/feed.store';
import { useAuthStore } from '@/store/auth.store';
import { AppText } from '@/components/ui/text';
import { PostCard } from '@/components/feed/post-card';
import { ImpactStories } from '@/components/feed/impact-stories';
import { CategoryChips } from '@/components/feed/category-chips';
import { Spacing, BorderRadius, Shadows } from '@/constants/theme';
import { type Post } from '@/types/entities';

export default function FeedScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [accountModalVisible, setAccountModalVisible] = useState(false);

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

  // Carrega publicações atualizadas da API ao abrir a tela
  useEffect(() => {
    refreshFeed();
  }, [refreshFeed]);

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
          <Image
            source={require('@/../assets/images/onda-logo.png')}
            style={styles.brandLogo}
            contentFit="contain"
          />
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
          {/* Ícone de Usuário / Login na Barra Superior */}
          {user ? (
            <Pressable
              style={({ pressed }) => [
                styles.userIconBtn,
                { borderColor: theme.primary, backgroundColor: theme.surfaceElevated },
                pressed && styles.pressed,
              ]}
              onPress={() => setAccountModalVisible(true)}
              accessibilityLabel={`Conta de ${user.displayName}`}
            >
              {user.avatarUrl ? (
                <Image source={{ uri: user.avatarUrl }} style={styles.topBarAvatar} />
              ) : (
                <View style={[styles.avatarFallback, { backgroundColor: theme.primary }]}>
                  <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF', fontSize: 13 }}>
                    {user.displayName.charAt(0).toUpperCase()}
                  </AppText>
                </View>
              )}
              {/* Indicador de status online / sincronizado com o banco */}
              <View style={[styles.onlineDot, { backgroundColor: '#10B981' }]} />
            </Pressable>
          ) : (
            <Pressable
              style={({ pressed }) => [
                styles.loginPillBtn,
                { backgroundColor: theme.primary + '18', borderColor: theme.primary + '60' },
                pressed && styles.pressed,
              ]}
              onPress={() => router.push('/login')}
              accessibilityLabel="Fazer login no aplicativo"
            >
              <Ionicons name="log-in-outline" size={18} color={theme.primary} />
              <AppText variant="caption" weight="bold" style={{ color: theme.primary, marginLeft: 4 }}>
                Entrar
              </AppText>
            </Pressable>
          )}

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

      {/* Modal de Gestão da Conta / Sessão no Banco */}
      <Modal
        visible={accountModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAccountModalVisible(false)}
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setAccountModalVisible(false)}
        >
          <Pressable
            style={[styles.accountModalCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
            onPress={(e) => e.stopPropagation()}
          >
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Ionicons name="person-circle" size={24} color={theme.primary} />
                <AppText variant="h3" weight="bold" style={{ marginLeft: 6 }}>
                  Minha Conta 🌊
                </AppText>
              </View>
              <Pressable onPress={() => setAccountModalVisible(false)} hitSlop={8}>
                <Ionicons name="close-circle-outline" size={24} color={theme.textSecondary} />
              </Pressable>
            </View>

            {user && (
              <View style={styles.userProfileSection}>
                <View style={styles.modalAvatarContainer}>
                  {user.avatarUrl ? (
                    <Image source={{ uri: user.avatarUrl }} style={styles.modalAvatar} />
                  ) : (
                    <View style={[styles.modalAvatarFallback, { backgroundColor: theme.primary }]}>
                      <AppText variant="h2" weight="bold" style={{ color: '#FFFFFF' }}>
                        {user.displayName.charAt(0).toUpperCase()}
                      </AppText>
                    </View>
                  )}
                  <View style={[styles.modalOnlineBadge, { backgroundColor: '#10B981' }]} />
                </View>

                <AppText variant="h3" weight="bold" center style={{ marginTop: Spacing.sm }}>
                  {user.displayName}
                </AppText>
                <AppText variant="caption" color="secondary" center>
                  {user.email}
                </AppText>

                {user.rankTitle && (
                  <View style={[styles.rankChip, { backgroundColor: theme.primary + '18' }]}>
                    <Ionicons name="shield-checkmark" size={14} color={theme.primary} />
                    <AppText variant="caption" weight="bold" style={{ color: theme.primary, marginLeft: 4 }}>
                      {user.rankTitle}
                    </AppText>
                  </View>
                )}

                {/* Status da Persistência no Banco */}
                <View style={[styles.dbStatusBox, { backgroundColor: theme.surfaceElevated, borderColor: '#10B98140' }]}>
                  <Ionicons name="server" size={16} color="#10B981" />
                  <View style={{ marginLeft: 8, flex: 1 }}>
                    <AppText variant="caption" weight="bold" style={{ color: '#10B981' }}>
                      Sessão Salva no Banco de Dados 💾
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      {user.lastLoginAt
                        ? `Último acesso: ${new Date(user.lastLoginAt).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' })}`
                        : 'Sessão autenticada e sincronizada'}
                    </AppText>
                  </View>
                </View>

                {/* Ações de Conta */}
                <View style={styles.modalButtonsGroup}>
                  <Pressable
                    style={[styles.modalActionBtn, { backgroundColor: theme.primary }]}
                    onPress={() => {
                      setAccountModalVisible(false);
                      router.push('/profile');
                    }}
                  >
                    <Ionicons name="person-outline" size={18} color="#FFFFFF" />
                    <AppText variant="bodySm" weight="bold" style={{ color: '#FFFFFF', marginLeft: 8 }}>
                      Ver Perfil e Conquistas
                    </AppText>
                  </Pressable>

                  <Pressable
                    style={[styles.modalActionBtn, { backgroundColor: theme.surfaceElevated, borderColor: theme.border, borderWidth: 1 }]}
                    onPress={() => {
                      setAccountModalVisible(false);
                      router.push('/login');
                    }}
                  >
                    <Ionicons name="swap-horizontal-outline" size={18} color={theme.primary} />
                    <AppText variant="bodySm" weight="bold" style={{ color: theme.text, marginLeft: 8 }}>
                      Trocar de Conta / Tela de Login
                    </AppText>
                  </Pressable>

                  <Pressable
                    style={[styles.modalActionBtn, { backgroundColor: '#EF444415', borderColor: '#EF444440', borderWidth: 1 }]}
                    onPress={async () => {
                      setAccountModalVisible(false);
                      await logout();
                      router.replace('/login');
                    }}
                  >
                    <Ionicons name="log-out-outline" size={18} color="#EF4444" />
                    <AppText variant="bodySm" weight="bold" style={{ color: '#EF4444', marginLeft: 8 }}>
                      Desconectar (Sair)
                    </AppText>
                  </Pressable>
                </View>
              </View>
            )}
          </Pressable>
        </Pressable>
      </Modal>
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
  brandLogo: {
    width: 44,
    height: 44,
    marginRight: Spacing.sm,
  },
  topActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  userIconBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  topBarAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  avatarFallback: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  loginPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.lg,
  },
  accountModalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    padding: Spacing.lg,
    ...Shadows.lg,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.md,
  },
  userProfileSection: {
    alignItems: 'center',
  },
  modalAvatarContainer: {
    position: 'relative',
  },
  modalAvatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
  },
  modalAvatarFallback: {
    width: 72,
    height: 72,
    borderRadius: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalOnlineBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  rankChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  dbStatusBox: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginTop: Spacing.md,
  },
  modalButtonsGroup: {
    width: '100%',
    marginTop: Spacing.md,
    gap: Spacing.xs,
  },
  modalActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
});
