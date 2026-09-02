/**
 * Onda do Bem — Profile Screen
 *
 * Exibe o perfil do usuário logado com suas métricas de impacto,
 * medalhas de sustentabilidade e histórico de ações publicadas.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';

import { useAppTheme } from '@/hooks/use-theme';
import { CURRENT_USER } from '@/constants/mock-data';
import { useFeedStore } from '@/store/feed.store';
import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { PostCard } from '@/components/feed/post-card';
import { Spacing, BorderRadius, Shadows, FontWeight } from '@/constants/theme';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { posts, toggleLike } = useFeedStore();
  const [activeTab, setActiveTab] = useState<'actions' | 'badges'>('actions');

  // Posts criados pelo usuário logado
  const myPosts = posts.filter(
    (p) => p.authorId === CURRENT_USER.id || p.author.username === CURRENT_USER.username
  );

  const BADGES = [
    {
      id: 'b1',
      title: 'Guardião das Praias',
      level: 'Nível 3',
      emoji: '🌊',
      desc: 'Mais de 100kg de resíduos recolhidos da orla',
      color: '#0EA5E9',
    },
    {
      id: 'b2',
      title: 'Protetor da Mata',
      level: 'Nível 2',
      emoji: '🌱',
      desc: 'Plantou mais de 25 mudas nativas',
      color: '#10B981',
    },
    {
      id: 'b3',
      title: 'Mestre da Reciclagem',
      level: 'Nível 2',
      emoji: '♻️',
      desc: 'Engajou mais de 50 pessoas em descarte correto',
      color: '#F59E0B',
    },
    {
      id: 'b4',
      title: 'Amigo dos Animais',
      level: 'Nível 1',
      emoji: '🐾',
      desc: 'Apoiou feiras e resgate comunitário',
      color: '#EC4899',
    },
  ];

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AppText variant="h3" weight="bold">
          Meu Perfil
        </AppText>
        <Pressable
          onPress={() => router.push('/settings')}
          style={styles.settingsIcon}
          hitSlop={8}
        >
          <Ionicons name="settings-outline" size={22} color={theme.text} />
        </Pressable>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Profile Card Header */}
        <View style={[styles.profileHeaderCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          <Avatar
            source={CURRENT_USER.avatarUrl}
            name={CURRENT_USER.displayName}
            size="xl"
            style={styles.avatar}
          />
          <AppText variant="h2" weight="bold" style={styles.displayName}>
            {CURRENT_USER.displayName}
          </AppText>
          <AppText variant="bodySm" color="secondary">
            @{CURRENT_USER.username} • {CURRENT_USER.location}
          </AppText>
          <AppText variant="bodySm" color="secondary" center style={styles.bio}>
            {CURRENT_USER.bio}
          </AppText>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderTopColor: theme.borderLight }]}>
            <View style={styles.statItem}>
              <AppText variant="h3" weight="bold" style={{ color: theme.primary }}>
                {CURRENT_USER.totalActions + (myPosts.length > 0 ? myPosts.length : 0)}
              </AppText>
              <AppText variant="caption" color="muted">
                Ações
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <AppText variant="h3" weight="bold" style={{ color: theme.secondary }}>
                {CURRENT_USER.totalImpact}
              </AppText>
              <AppText variant="caption" color="muted">
                Impacto (pts)
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <AppText variant="h3" weight="bold" style={{ color: theme.accent }}>
                142
              </AppText>
              <AppText variant="caption" color="muted">
                Voluntários
              </AppText>
            </View>
          </View>
        </View>

        {/* Tab Toggle: Minhas Ações vs Conquistas */}
        <View style={[styles.tabToggle, { backgroundColor: theme.surfaceElevated }]}>
          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'actions' && [styles.tabBtnActive, { backgroundColor: theme.surface }],
            ]}
            onPress={() => setActiveTab('actions')}
          >
            <AppText
              variant="bodySm"
              weight={activeTab === 'actions' ? 'bold' : 'regular'}
              style={{ color: activeTab === 'actions' ? theme.primary : theme.textSecondary }}
            >
              Minhas Ações ({myPosts.length})
            </AppText>
          </Pressable>

          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'badges' && [styles.tabBtnActive, { backgroundColor: theme.surface }],
            ]}
            onPress={() => setActiveTab('badges')}
          >
            <AppText
              variant="bodySm"
              weight={activeTab === 'badges' ? 'bold' : 'regular'}
              style={{ color: activeTab === 'badges' ? theme.primary : theme.textSecondary }}
            >
              Medalhas & Impacto ({BADGES.length})
            </AppText>
          </Pressable>
        </View>

        {/* Content according to tab */}
        {activeTab === 'actions' ? (
          myPosts.length > 0 ? (
            myPosts.map((post) => (
              <PostCard key={post.id} post={post} onToggleLike={toggleLike} />
            ))
          ) : (
            <View style={styles.emptyState}>
              <AppText variant="h2" center>
                ✍️
              </AppText>
              <AppText variant="body" weight="semibold" center style={{ marginTop: 8 }}>
                Você ainda não publicou nenhuma ação
              </AppText>
              <AppText variant="caption" color="secondary" center style={{ marginTop: 4 }}>
                Toque na aba "Postar" para compartilhar sua primeira boa ação!
              </AppText>
              <Pressable
                style={[styles.createActionBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.push('/create')}
              >
                <AppText variant="bodySm" weight="semibold" style={{ color: '#FFFFFF' }}>
                  Publicar Primeira Ação
                </AppText>
              </Pressable>
            </View>
          )
        ) : (
          <View style={styles.badgesList}>
            {BADGES.map((b) => (
              <View
                key={b.id}
                style={[
                  styles.badgeCard,
                  { backgroundColor: theme.surface, borderColor: theme.border },
                ]}
              >
                <View style={[styles.badgeEmojiBox, { backgroundColor: b.color + '20' }]}>
                  <AppText variant="h2">{b.emoji}</AppText>
                </View>
                <View style={styles.badgeInfo}>
                  <View style={styles.badgeTitleRow}>
                    <AppText variant="body" weight="bold">
                      {b.title}
                    </AppText>
                    <View style={[styles.levelPill, { backgroundColor: b.color }]}>
                      <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF', fontSize: 10 }}>
                        {b.level}
                      </AppText>
                    </View>
                  </View>
                  <AppText variant="caption" color="secondary" style={{ marginTop: 2 }}>
                    {b.desc}
                  </AppText>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
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
  settingsIcon: {
    padding: 4,
  },
  scrollContent: {
    paddingBottom: Spacing.xl,
  },
  profileHeaderCard: {
    margin: Spacing.md,
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    borderWidth: 1,
    ...Shadows.sm,
  },
  avatar: {
    marginBottom: Spacing.sm,
  },
  displayName: {
    marginTop: Spacing.xs,
  },
  bio: {
    marginTop: Spacing.sm,
    lineHeight: 20,
    maxWidth: 320,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 30,
  },
  tabToggle: {
    flexDirection: 'row',
    marginHorizontal: Spacing.md,
    marginBottom: Spacing.md,
    borderRadius: BorderRadius.lg,
    padding: 4,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: 'center',
    borderRadius: BorderRadius.md,
  },
  tabBtnActive: {
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  emptyState: {
    padding: Spacing.xl,
    alignItems: 'center',
  },
  createActionBtn: {
    marginTop: Spacing.md,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  badgesList: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  badgeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  badgeEmojiBox: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  badgeInfo: {
    flex: 1,
  },
  badgeTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  levelPill: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: BorderRadius.full,
  },
});
