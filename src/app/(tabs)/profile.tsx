/**
 * Onda do Bem — Profile Screen
 *
 * Exibe o perfil do usuário logado com métricas em tempo real de impacto e rank,
 * barra de progresso para a próxima patente, histórico de publicações
 * e leaderboard comunitário onde cada curtida recebida vale +2 de impacto.
 */

import React, { useState, useMemo } from 'react';
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
import { useFeedStore } from '@/store/feed.store';
import { Avatar } from '@/components/ui/avatar';
import { AppText } from '@/components/ui/text';
import { PostCard } from '@/components/feed/post-card';
import { Spacing, BorderRadius, Shadows, FontWeight } from '@/constants/theme';
import { calculateUserRank, getCommunityLeaderboard, RANK_TIERS } from '@/utils/rank';

export default function ProfileScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { currentUser, posts, toggleLike } = useFeedStore();
  const [activeTab, setActiveTab] = useState<'actions' | 'ranking' | 'badges'>('actions');

  // Posts criados pelo usuário logado
  const myPosts = useMemo(() => {
    return posts.filter(
      (p) => p.authorId === currentUser.id || p.author?.username === currentUser.username
    );
  }, [posts, currentUser]);

  // Cálculos de rank e posição comunitária
  const userRank = useMemo(() => {
    return calculateUserRank(currentUser.totalImpact || 0);
  }, [currentUser.totalImpact]);

  const leaderboard = useMemo(() => {
    return getCommunityLeaderboard(posts, currentUser);
  }, [posts, currentUser]);

  const myPosition = useMemo(() => {
    const entry = leaderboard.find((l) => l.isCurrentUser);
    return entry ? entry.position : 1;
  }, [leaderboard]);

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
            source={currentUser.avatarUrl}
            name={currentUser.displayName}
            size="xl"
            style={styles.avatar}
          />
          <AppText variant="h2" weight="bold" style={styles.displayName}>
            {currentUser.displayName}
          </AppText>
          <AppText variant="bodySm" color="secondary">
            @{currentUser.username} • {currentUser.location}
          </AppText>
          <AppText variant="bodySm" color="secondary" center style={styles.bio}>
            {currentUser.bio}
          </AppText>

          {/* Banner de Rank & Progresso */}
          <View
            style={[
              styles.rankBanner,
              {
                backgroundColor: userRank.color + '12',
                borderColor: userRank.color + '38',
              },
            ]}
          >
            <View style={styles.rankBannerHeader}>
              <View style={styles.rankBadgeRow}>
                <AppText variant="h3">{userRank.badge}</AppText>
                <View style={{ marginLeft: 8 }}>
                  <AppText variant="body" weight="bold" style={{ color: userRank.color }}>
                    Rank {userRank.rank} • {userRank.title}
                  </AppText>
                  <AppText variant="caption" color="secondary">
                    {userRank.description}
                  </AppText>
                </View>
              </View>
              <View style={[styles.positionBadge, { backgroundColor: userRank.color }]}>
                <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
                  #{myPosition} Geral
                </AppText>
              </View>
            </View>

            {/* Barra de Progresso para o próximo rank */}
            <View style={styles.progressContainer}>
              <View style={styles.progressBarBackground}>
                <View
                  style={[
                    styles.progressBarFill,
                    {
                      width: `${userRank.progressPercent}%`,
                      backgroundColor: userRank.color,
                    },
                  ]}
                />
              </View>
              <View style={styles.progressTextRow}>
                <AppText variant="caption" weight="semibold" style={{ color: userRank.color }}>
                  {userRank.currentImpact} pts acumulados
                </AppText>
                <AppText variant="caption" color="muted">
                  {userRank.progressPercent}% para o próximo rank
                </AppText>
              </View>
            </View>

            {/* Hint explicativo das curtidas */}
            <View style={[styles.likeInfoBox, { backgroundColor: theme.surface }]}>
              <Ionicons name="heart" size={14} color="#EF4444" style={{ marginRight: 6 }} />
              <AppText variant="caption" color="secondary" style={{ flex: 1 }}>
                Faltam <AppText variant="caption" weight="bold" style={{ color: theme.primary }}>{userRank.pointsToNext} pts</AppText> ({userRank.likesToNext} curtidas) para o Rank {userRank.rank + 1} ({userRank.nextTier?.title || 'Próximo Rank'}).
              </AppText>
            </View>
          </View>

          {/* Stats Row */}
          <View style={[styles.statsRow, { borderTopColor: theme.borderLight }]}>
            <View style={styles.statItem}>
              <AppText variant="h3" weight="bold" style={{ color: theme.primary }}>
                {currentUser.totalActions + (myPosts.length > 0 ? myPosts.length : 0)}
              </AppText>
              <AppText variant="caption" color="muted">
                Ações
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <AppText variant="h3" weight="bold" style={{ color: theme.secondary }}>
                {currentUser.totalImpact}
              </AppText>
              <AppText variant="caption" color="muted">
                Impacto (pts)
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <AppText variant="h3" weight="bold" style={{ color: userRank.color }}>
                {userRank.badge} R{userRank.rank}
              </AppText>
              <AppText variant="caption" color="muted">
                Patente
              </AppText>
            </View>
            <View style={[styles.statDivider, { backgroundColor: theme.borderLight }]} />
            <View style={styles.statItem}>
              <AppText variant="h3" weight="bold" style={{ color: theme.accent }}>
                #{myPosition}
              </AppText>
              <AppText variant="caption" color="muted">
                Ranking
              </AppText>
            </View>
          </View>
        </View>

        {/* Tab Toggle: Minhas Ações vs Ranking vs Medalhas */}
        <View style={[styles.tabToggle, { backgroundColor: theme.surfaceElevated }]}>
          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'actions' && [styles.tabBtnActive, { backgroundColor: theme.surface }],
            ]}
            onPress={() => setActiveTab('actions')}
          >
            <AppText
              variant="caption"
              weight={activeTab === 'actions' ? 'bold' : 'regular'}
              style={{ color: activeTab === 'actions' ? theme.primary : theme.textSecondary }}
            >
              Minhas Ações ({myPosts.length})
            </AppText>
          </Pressable>

          <Pressable
            style={[
              styles.tabBtn,
              activeTab === 'ranking' && [styles.tabBtnActive, { backgroundColor: theme.surface }],
            ]}
            onPress={() => setActiveTab('ranking')}
          >
            <AppText
              variant="caption"
              weight={activeTab === 'ranking' ? 'bold' : 'regular'}
              style={{ color: activeTab === 'ranking' ? theme.primary : theme.textSecondary }}
            >
              Leaderboard 🏆
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
              variant="caption"
              weight={activeTab === 'badges' ? 'bold' : 'regular'}
              style={{ color: activeTab === 'badges' ? theme.primary : theme.textSecondary }}
            >
              Medalhas ({BADGES.length})
            </AppText>
          </Pressable>
        </View>

        {/* Content according to tab */}
        {activeTab === 'actions' && (
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
                Toque no botão central de postar para compartilhar sua primeira boa ação e ganhar impacto!
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
        )}

        {activeTab === 'ranking' && (
          <View style={styles.leaderboardContainer}>
            <View style={styles.leaderboardNotice}>
              <Ionicons name="sparkles" size={16} color={theme.primary} />
              <AppText variant="caption" color="secondary" style={{ marginLeft: 6, flex: 1 }}>
                Cada curtida recebida concede <AppText variant="caption" weight="bold">+2 de impacto</AppText> e eleva a posição de quem postou no ranking geral.
              </AppText>
            </View>

            {leaderboard.map((entry) => (
              <View
                key={entry.user.id}
                style={[
                  styles.leaderboardCard,
                  {
                    backgroundColor: entry.isCurrentUser ? theme.primary + '10' : theme.surface,
                    borderColor: entry.isCurrentUser ? theme.primary : theme.border,
                  },
                ]}
              >
                {/* Posição no Ranking */}
                <View
                  style={[
                    styles.rankPosCircle,
                    {
                      backgroundColor:
                        entry.position === 1
                          ? '#F59E0B'
                          : entry.position === 2
                          ? '#94A3B8'
                          : entry.position === 3
                          ? '#B45309'
                          : theme.surfaceElevated,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight="bold"
                    style={{
                      color: entry.position <= 3 ? '#FFFFFF' : theme.textSecondary,
                      fontSize: 12,
                    }}
                  >
                    #{entry.position}
                  </AppText>
                </View>

                {/* Avatar do Usuário */}
                <Avatar
                  source={entry.user.avatarUrl}
                  name={entry.user.displayName}
                  size="md"
                  style={{ marginRight: Spacing.sm }}
                />

                {/* Dados do Usuário */}
                <View style={styles.leaderboardInfo}>
                  <View style={styles.leaderboardNameRow}>
                    <AppText
                      variant="bodySm"
                      weight="bold"
                      numberOfLines={1}
                      style={{ maxWidth: 140 }}
                    >
                      {entry.user.displayName}
                    </AppText>
                    {entry.isCurrentUser && (
                      <View style={[styles.youPill, { backgroundColor: theme.primary }]}>
                        <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF', fontSize: 9 }}>
                          VOCÊ
                        </AppText>
                      </View>
                    )}
                  </View>
                  <View style={styles.leaderboardSubRow}>
                    <View
                      style={[
                        styles.authorRankBadgeMini,
                        { backgroundColor: entry.rankInfo.color + '20' },
                      ]}
                    >
                      <AppText
                        variant="caption"
                        style={{ color: entry.rankInfo.color, fontSize: 10, fontWeight: FontWeight.bold }}
                      >
                        {entry.rankInfo.badge} Rank {entry.rankInfo.rank}
                      </AppText>
                    </View>
                    <AppText variant="caption" color="muted" style={{ marginLeft: 6 }}>
                      {entry.rankInfo.title}
                    </AppText>
                  </View>
                </View>

                {/* Pontuação de Impacto */}
                <View style={styles.leaderboardImpactBox}>
                  <AppText variant="bodySm" weight="bold" style={{ color: theme.secondary }}>
                    {entry.user.totalImpact}
                  </AppText>
                  <AppText variant="caption" color="muted" style={{ fontSize: 10 }}>
                    impacto
                  </AppText>
                </View>
              </View>
            ))}

            {/* Guia de Patentes da Onda do Bem */}
            <View style={[styles.rankGuideBox, { backgroundColor: theme.surface, borderColor: theme.border }]}>
              <View style={styles.rankGuideHeader}>
                <Ionicons name="trophy-outline" size={18} color={theme.primary} />
                <AppText variant="bodySm" weight="bold" style={{ marginLeft: 6 }}>
                  Escala de Ranks da Onda do Bem
                </AppText>
              </View>
              <View style={styles.rankGuideList}>
                {RANK_TIERS.map((tier) => {
                  const isCurrentTier = userRank.rank === tier.rank;
                  return (
                    <View
                      key={tier.rank}
                      style={[
                        styles.rankGuideItem,
                        isCurrentTier && {
                          backgroundColor: tier.color + '15',
                          borderColor: tier.color + '4D',
                          borderRadius: BorderRadius.md,
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                        },
                      ]}
                    >
                      <AppText variant="caption" style={{ width: 28 }}>
                        {tier.badge}
                      </AppText>
                      <AppText
                        variant="caption"
                        weight={isCurrentTier ? 'bold' : 'medium'}
                        style={{ flex: 1, color: isCurrentTier ? tier.color : theme.text }}
                      >
                        Rank {tier.rank}: {tier.title}
                      </AppText>
                      <AppText variant="caption" color="muted">
                        {tier.minImpact} {tier.maxImpact === Infinity ? '+ pts' : `a ${tier.maxImpact} pts`}
                      </AppText>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {activeTab === 'badges' && (
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
  rankBanner: {
    width: '100%',
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  rankBannerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rankBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  positionBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
  },
  progressContainer: {
    marginTop: Spacing.md,
  },
  progressBarBackground: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  progressTextRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  likeInfoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
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
  leaderboardContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.sm,
  },
  leaderboardNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    marginBottom: 4,
  },
  leaderboardCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  rankPosCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.sm,
  },
  leaderboardInfo: {
    flex: 1,
  },
  leaderboardNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  youPill: {
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: BorderRadius.full,
    marginLeft: 6,
  },
  leaderboardSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  authorRankBadgeMini: {
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: BorderRadius.full,
  },
  leaderboardImpactBox: {
    alignItems: 'flex-end',
    marginLeft: Spacing.sm,
  },
  rankGuideBox: {
    borderWidth: 1,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginTop: Spacing.md,
  },
  rankGuideHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  rankGuideList: {
    gap: 6,
  },
  rankGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
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
