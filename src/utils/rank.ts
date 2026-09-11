/**
 * Onda do Bem — Sistema de Ranks e Impacto
 *
 * Cada curtida recebida em uma publicação concede +2 pontos de impacto
 * ao usuário autor, permitindo subir de rank e avançar no leaderboard comunitário.
 */

import { type User, type Post } from '@/types/entities';

export interface RankTier {
  rank: number;
  title: string;
  badge: string;
  minImpact: number;
  maxImpact: number;
  color: string;
  description: string;
}

/** Tabela de níveis e patentes de impacto sustentável */
export const RANK_TIERS: RankTier[] = [
  {
    rank: 1,
    title: 'Semente do Bem',
    badge: '🌱',
    minImpact: 0,
    maxImpact: 99,
    color: '#10B981',
    description: 'Iniciando os primeiros passos de impacto positivo.',
  },
  {
    rank: 2,
    title: 'Broto Verde',
    badge: '🌿',
    minImpact: 100,
    maxImpact: 199,
    color: '#059669',
    description: 'Cultivando hábitos ecológicos consistentes.',
  },
  {
    rank: 3,
    title: 'Raiz Solidária',
    badge: '🌾',
    minImpact: 200,
    maxImpact: 299,
    color: '#14B8A6',
    description: 'Apoiando mutirões e causas comunitárias locais.',
  },
  {
    rank: 4,
    title: 'Defensor Local',
    badge: '🍃',
    minImpact: 300,
    maxImpact: 399,
    color: '#06B6D4',
    description: 'Mobilizando amigos e transformando seu bairro.',
  },
  {
    rank: 5,
    title: 'Protetor do Bem',
    badge: '🌊',
    minImpact: 400,
    maxImpact: 499,
    color: '#0EA5E9',
    description: 'Gerando ondas reais de mudança e limpeza ambiental.',
  },
  {
    rank: 6,
    title: 'Guardião da Terra',
    badge: '🛡️',
    minImpact: 500,
    maxImpact: 649,
    color: '#3B82F6',
    description: 'Referência em preservação e ações ecológicas ativas.',
  },
  {
    rank: 7,
    title: 'Eco Guerreiro',
    badge: '⚡',
    minImpact: 650,
    maxImpact: 799,
    color: '#6366F1',
    description: 'Impacto consistente e engajamento comunitário exemplar.',
  },
  {
    rank: 8,
    title: 'Mestre da Mudança',
    badge: '⭐',
    minImpact: 800,
    maxImpact: 999,
    color: '#8B5CF6',
    description: 'Liderança comunitária que inspira centenas de pessoas.',
  },
  {
    rank: 9,
    title: 'Embaixador Verde',
    badge: '👑',
    minImpact: 1000,
    maxImpact: 1399,
    color: '#EC4899',
    description: 'Transformação em larga escala para um planeta sustentável.',
  },
  {
    rank: 10,
    title: 'Lenda da Onda do Bem',
    badge: '🌟',
    minImpact: 1400,
    maxImpact: Infinity,
    color: '#F59E0B',
    description: 'O nível mais alto de prestígio e transformação social.',
  },
];

export interface UserRankInfo {
  rank: number;
  title: string;
  badge: string;
  color: string;
  description: string;
  currentImpact: number;
  minImpact: number;
  nextRankImpact: number;
  progressPercent: number;
  pointsToNext: number;
  likesToNext: number;
  nextTier: RankTier | null;
}

/**
 * Calcula os detalhes completos de rank para um determinado total de impacto.
 * Cada curtida vale 2 pontos de impacto.
 */
export function calculateUserRank(totalImpact: number = 0): UserRankInfo {
  const safeImpact = Math.max(0, totalImpact);

  // Encontra o tier atual
  let currentTierIndex = RANK_TIERS.findIndex(
    (tier) => safeImpact >= tier.minImpact && safeImpact <= tier.maxImpact
  );

  if (currentTierIndex === -1) {
    // Se passar de 1400+
    currentTierIndex = RANK_TIERS.length - 1;
  }

  const currentTier = RANK_TIERS[currentTierIndex];
  const nextTier = currentTierIndex < RANK_TIERS.length - 1 ? RANK_TIERS[currentTierIndex + 1] : null;

  let progressPercent = 100;
  let pointsToNext = 0;
  let nextRankImpact = safeImpact;

  if (nextTier) {
    nextRankImpact = nextTier.minImpact;
    const tierRange = nextTier.minImpact - currentTier.minImpact;
    const progressInTier = safeImpact - currentTier.minImpact;
    progressPercent = Math.min(100, Math.max(0, Math.round((progressInTier / tierRange) * 100)));
    pointsToNext = Math.max(0, nextTier.minImpact - safeImpact);
  } else {
    // Rank máximo: progress continua em ciclos de 200 pontos
    const over1400 = safeImpact - 1400;
    const cycle = over1400 % 200;
    progressPercent = Math.round((cycle / 200) * 100);
    pointsToNext = 200 - cycle;
    nextRankImpact = safeImpact + pointsToNext;
  }

  const likesToNext = Math.ceil(pointsToNext / 2);

  // Ranks além do 10 para quem ultrapassar 1400
  let dynamicRank = currentTier.rank;
  if (safeImpact >= 1400) {
    dynamicRank = 10 + Math.floor((safeImpact - 1400) / 200);
  }

  return {
    rank: dynamicRank,
    title: currentTier.title,
    badge: currentTier.badge,
    color: currentTier.color,
    description: currentTier.description,
    currentImpact: safeImpact,
    minImpact: currentTier.minImpact,
    nextRankImpact,
    progressPercent,
    pointsToNext,
    likesToNext,
    nextTier,
  };
}

export interface LeaderboardEntry {
  user: User;
  rankInfo: UserRankInfo;
  position: number;
  isCurrentUser: boolean;
  totalPosts: number;
}

/**
 * Gera o ranking comunitário ordenado por total de impacto,
 * incluindo o usuário atual e todos os autores do feed.
 */
export function getCommunityLeaderboard(posts: Post[], currentUser: User): LeaderboardEntry[] {
  const usersMap = new Map<string, { user: User; count: number }>();

  // Adiciona o usuário logado
  usersMap.set(currentUser.id, {
    user: { ...currentUser },
    count: 0,
  });

  // Agrega autores dos posts
  posts.forEach((post) => {
    const author = post.author;
    if (!author) return;

    const isCurrent =
      author.id === currentUser.id || author.username === currentUser.username;
    const id = isCurrent ? currentUser.id : author.id;

    const existing = usersMap.get(id);
    if (existing) {
      existing.count += 1;
      // Atualiza para o maior totalImpact registrado
      if (author.totalImpact > existing.user.totalImpact) {
        existing.user.totalImpact = author.totalImpact;
      }
    } else {
      usersMap.set(id, {
        user: { ...author },
        count: 1,
      });
    }
  });

  // Garante que o currentUser tenha seu impacto atualizado do store
  const currentEntry = usersMap.get(currentUser.id);
  if (currentEntry) {
    currentEntry.user = { ...currentUser };
    currentEntry.count = posts.filter(
      (p) => p.authorId === currentUser.id || p.author?.username === currentUser.username
    ).length;
  }

  // Converte e ordena decrescente por totalImpact
  const sorted = Array.from(usersMap.values()).sort(
    (a, b) => (b.user.totalImpact || 0) - (a.user.totalImpact || 0)
  );

  return sorted.map((item, index) => {
    const isCurrent =
      item.user.id === currentUser.id || item.user.username === currentUser.username;
    const rankInfo = calculateUserRank(item.user.totalImpact || 0);

    return {
      user: {
        ...item.user,
        rank: rankInfo.rank,
        rankTitle: rankInfo.title,
      },
      rankInfo,
      position: index + 1,
      isCurrentUser: isCurrent,
      totalPosts: item.count,
    };
  });
}
