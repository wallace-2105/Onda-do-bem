/**
 * Onda do Bem — Mock Data
 *
 * Dados mockados para exibição e prototipagem da rede social.
 */

import { PostCategory, type User, type Post } from '@/types/entities';

export interface CategoryInfo {
  label: string;
  emoji: string;
  color: string;
}

export const CATEGORY_INFO: Record<PostCategory, CategoryInfo> = {
  [PostCategory.BEACH_CLEANUP]: {
    label: 'Limpeza de Praia',
    emoji: '🌊',
    color: '#0EA5E9',
  },
  [PostCategory.TREE_PLANTING]: {
    label: 'Plantio de Árvores',
    emoji: '🌱',
    color: '#10B981',
  },
  [PostCategory.RECYCLING]: {
    label: 'Reciclagem',
    emoji: '♻️',
    color: '#059669',
  },
  [PostCategory.WATER_CONSERVATION]: {
    label: 'Cuidado com a Água',
    emoji: '💧',
    color: '#38BDF8',
  },
  [PostCategory.COMMUNITY_GARDEN]: {
    label: 'Horta Comunitária',
    emoji: '🥕',
    color: '#F59E0B',
  },
  [PostCategory.ANIMAL_RESCUE]: {
    label: 'Proteção Animal',
    emoji: '🐾',
    color: '#EC4899',
  },
  [PostCategory.DONATION]: {
    label: 'Doação',
    emoji: '❤️',
    color: '#EF4444',
  },
  [PostCategory.EDUCATION]: {
    label: 'Educação Ambiental',
    emoji: '📚',
    color: '#8B5CF6',
  },
  [PostCategory.OTHER]: {
    label: 'Outra Ação',
    emoji: '✨',
    color: '#6366F1',
  },
};

export const CURRENT_USER: User = {
  id: 'user-current',
  email: 'lucas.silva@ondadobem.org',
  username: 'lucas.silva',
  displayName: 'Lucas Silva',
  avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
  bio: 'Defensor da natureza e entusiasta de mutirões ecológicos. Criando ondas de impacto positivo todos os dias! 🌊✨',
  location: 'Florianópolis, SC',
  totalActions: 16,
  totalImpact: 420,
  createdAt: '2024-01-10T10:00:00.000Z',
  updatedAt: '2024-05-15T12:00:00.000Z',
};

export interface StoryItem {
  id: string;
  title: string;
  emoji: string;
  authorName: string;
  avatarUrl: string;
}

export const MOCK_STORIES: StoryItem[] = [
  {
    id: 'story-1',
    title: 'Sua Ação',
    emoji: '➕',
    authorName: 'Você',
    avatarUrl: CURRENT_USER.avatarUrl!,
  },
  {
    id: 'story-2',
    title: 'Praia Limpa',
    emoji: '🌊',
    authorName: 'Mariana',
    avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop',
  },
  {
    id: 'story-3',
    title: 'Plantio Serra',
    emoji: '🌲',
    authorName: 'Gabriel',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
  },
  {
    id: 'story-4',
    title: 'Pet Resgate',
    emoji: '🐶',
    authorName: 'Camila',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
  },
  {
    id: 'story-5',
    title: 'Horta Urbana',
    emoji: '🥬',
    authorName: 'Rodrigo',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
  },
  {
    id: 'story-6',
    title: 'Recicla Já',
    emoji: '♻️',
    authorName: 'Beatriz',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop',
  },
];

export const INITIAL_POSTS: Post[] = [
  {
    id: 'post-1',
    authorId: 'author-1',
    author: {
      id: 'author-1',
      email: 'mariana.costa@ondadobem.org',
      username: 'mari.ecovida',
      displayName: 'Mariana Costa',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop',
      bio: 'Bióloga marinha e voluntária.',
      location: 'Ubatuba, SP',
      totalActions: 28,
      totalImpact: 650,
      createdAt: '2023-11-01T08:00:00.000Z',
      updatedAt: '2024-04-10T10:00:00.000Z',
    },
    title: 'Mutirão de Limpeza na Praia do Tenório',
    description:
      'Hoje reunimos mais de 30 voluntários e conseguimos recolher 120kg de resíduos da orla! A maioria era microplástico e tampinhas. O mar agradece cada um que dedicou a manhã de sábado. 🌊🐢',
    category: PostCategory.BEACH_CLEANUP,
    imageUrl: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop',
    latitude: -23.4682,
    longitude: -45.0644,
    locationName: 'Praia do Tenório, Ubatuba - SP',
    likesCount: 142,
    commentsCount: 23,
    impactScore: 120,
    isLiked: false,
    createdAt: '2024-05-28T14:30:00.000Z',
    updatedAt: '2024-05-28T14:30:00.000Z',
  },
  {
    id: 'post-2',
    authorId: 'author-2',
    author: {
      id: 'author-2',
      email: 'gabriel.araujo@ondadobem.org',
      username: 'gabriel.florestas',
      displayName: 'Gabriel Araújo',
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop',
      bio: 'Engenheiro florestal regenerando áreas degradadas.',
      location: 'Curitiba, PR',
      totalActions: 45,
      totalImpact: 1200,
      createdAt: '2023-09-15T09:00:00.000Z',
      updatedAt: '2024-05-01T11:00:00.000Z',
    },
    title: '50 mudas de Araucária plantadas hoje!',
    description:
      'Dia memorável com os alunos da escola municipal! Plantamos 50 mudas nativas em uma área de nascente. Ver as crianças aprendendo a cuidar da terra nos enche de esperança. 🌲💚',
    category: PostCategory.TREE_PLANTING,
    imageUrl: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
    latitude: -25.4297,
    longitude: -49.2719,
    locationName: 'Parque das Nascentes, Curitiba - PR',
    likesCount: 215,
    commentsCount: 38,
    impactScore: 50,
    isLiked: true,
    createdAt: '2024-05-27T17:15:00.000Z',
    updatedAt: '2024-05-27T17:15:00.000Z',
  },
  {
    id: 'post-3',
    authorId: 'author-3',
    author: {
      id: 'author-3',
      email: 'camila.patas@ondadobem.org',
      username: 'camila.resgate',
      displayName: 'Camila Duarte',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop',
      bio: 'Protetora independente de animais abandonados.',
      location: 'Belo Horizonte, MG',
      totalActions: 32,
      totalImpact: 94,
      createdAt: '2023-12-05T12:00:00.000Z',
      updatedAt: '2024-04-18T14:00:00.000Z',
    },
    title: 'Feira de Adoção: 8 filhotinhos ganharam um lar!',
    description:
      'Nosso domingo não poderia ter sido mais especial! Todos os 8 resgatados da semana passada foram adotados por famílias responsáveis com termo de compromisso e castração agendada. Gratidão imensa! 🐶🐱❤️',
    category: PostCategory.ANIMAL_RESCUE,
    imageUrl: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop',
    latitude: -19.9167,
    longitude: -43.9345,
    locationName: 'Praça da Liberdade, Belo Horizonte - MG',
    likesCount: 340,
    commentsCount: 52,
    impactScore: 8,
    isLiked: false,
    createdAt: '2024-05-26T20:00:00.000Z',
    updatedAt: '2024-05-26T20:00:00.000Z',
  },
  {
    id: 'post-4',
    authorId: 'author-4',
    author: {
      id: 'author-4',
      email: 'rodrigo.horta@ondadobem.org',
      username: 'rodrigo.verde',
      displayName: 'Rodrigo Mendonça',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop',
      bio: 'Agroecologia comunitária e compostagem.',
      location: 'São Paulo, SP',
      totalActions: 19,
      totalImpact: 310,
      createdAt: '2024-02-20T10:00:00.000Z',
      updatedAt: '2024-05-10T16:00:00.000Z',
    },
    title: 'Primeira colheita da Horta Solidária do bairro!',
    description:
      'Colhemos alface, tomate, cenoura e ervas frescas cultivadas sem agrotóxicos. Distribuímos mais de 60 cestas agroecológicas para famílias do bairro. Comida de verdade ao alcance de todos! 🥬🥕🍅',
    category: PostCategory.COMMUNITY_GARDEN,
    imageUrl: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=800&auto=format&fit=crop',
    latitude: -23.5505,
    longitude: -46.6333,
    locationName: 'Vila Mariana, São Paulo - SP',
    likesCount: 188,
    commentsCount: 29,
    impactScore: 60,
    isLiked: false,
    createdAt: '2024-05-25T11:45:00.000Z',
    updatedAt: '2024-05-25T11:45:00.000Z',
  },
  {
    id: 'post-5',
    authorId: 'author-5',
    author: {
      id: 'author-5',
      email: 'beatriz.recicla@ondadobem.org',
      username: 'bia.circular',
      displayName: 'Beatriz Farias',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop',
      bio: 'Economia circular e gestão de resíduos.',
      location: 'Salvador, BA',
      totalActions: 24,
      totalImpact: 580,
      createdAt: '2024-01-05T09:00:00.000Z',
      updatedAt: '2024-05-12T13:00:00.000Z',
    },
    title: 'Ponto de Coleta Seletiva inaugurado no condomínio',
    description:
      'Conseguimos implementar a coleta seletiva para 120 apartamentos! Em apenas 10 dias, já destinamos 250kg de papelão e plástico direto para a cooperativa local de reciclagem. ♻️📦',
    category: PostCategory.RECYCLING,
    imageUrl: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop',
    latitude: -12.9777,
    longitude: -38.5016,
    locationName: 'Pituba, Salvador - BA',
    likesCount: 156,
    commentsCount: 17,
    impactScore: 250,
    isLiked: true,
    createdAt: '2024-05-24T09:30:00.000Z',
    updatedAt: '2024-05-24T09:30:00.000Z',
  },
];
