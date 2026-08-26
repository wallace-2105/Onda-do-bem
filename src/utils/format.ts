/**
 * Onda do Bem — Utilitários de Formatação
 *
 * Funções puras para formatar dados de exibição.
 */

/**
 * Formata uma data ISO para exibição relativa.
 * Ex: "há 2 min", "há 3h", "há 5 dias"
 */
export function formatRelativeTime(isoDate: string): string {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSeconds < 60) return 'agora';
  if (diffMinutes < 60) return `há ${diffMinutes} min`;
  if (diffHours < 24) return `há ${diffHours}h`;
  if (diffDays < 7) return `há ${diffDays}d`;
  if (diffDays < 30) return `há ${Math.floor(diffDays / 7)} sem`;

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

/**
 * Formata um número grande para exibição compacta.
 * Ex: 1234 → "1,2K", 1500000 → "1,5M"
 */
export function formatCompactNumber(num: number): string {
  if (num >= 1_000_000) {
    return `${(num / 1_000_000).toFixed(1).replace('.', ',')}M`;
  }
  if (num >= 1_000) {
    return `${(num / 1_000).toFixed(1).replace('.', ',')}K`;
  }
  return num.toString();
}

/**
 * Formata uma categoria de post para exibição.
 */
const CATEGORY_LABELS: Record<string, string> = {
  BEACH_CLEANUP: 'Limpeza de Praia',
  TREE_PLANTING: 'Plantio de Árvores',
  RECYCLING: 'Reciclagem',
  WATER_CONSERVATION: 'Conservação de Água',
  COMMUNITY_GARDEN: 'Horta Comunitária',
  ANIMAL_RESCUE: 'Resgate Animal',
  DONATION: 'Doação',
  EDUCATION: 'Educação Ambiental',
  OTHER: 'Outros',
};

export function formatCategory(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}
