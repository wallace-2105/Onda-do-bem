/**
 * Onda do Bem — CategoryChips Component
 *
 * Filtro horizontal por categoria de ação positiva.
 */

import React from 'react';
import { ScrollView, StyleSheet, Pressable } from 'react-native';

import { PostCategory } from '@/types/entities';
import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { CATEGORY_INFO } from '@/constants/mock-data';

interface CategoryChipsProps {
  selectedCategory: PostCategory | 'ALL';
  onSelectCategory: (category: PostCategory | 'ALL') => void;
}

export function CategoryChips({
  selectedCategory,
  onSelectCategory,
}: CategoryChipsProps) {
  const theme = useAppTheme();

  const categories: Array<{ id: PostCategory | 'ALL'; label: string; emoji: string }> = [
    { id: 'ALL', label: 'Todos', emoji: '✨' },
    ...Object.entries(CATEGORY_INFO).map(([key, meta]) => ({
      id: key as PostCategory,
      label: meta.label,
      emoji: meta.emoji,
    })),
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {categories.map((cat) => {
        const isSelected = selectedCategory === cat.id;

        return (
          <Pressable
            key={cat.id}
            onPress={() => onSelectCategory(cat.id)}
            style={[
              styles.chip,
              {
                backgroundColor: isSelected ? theme.primary : theme.surface,
                borderColor: isSelected ? theme.primary : theme.border,
              },
            ]}
          >
            <AppText
              variant="caption"
              weight={isSelected ? 'bold' : 'regular'}
              style={{
                color: isSelected ? '#FFFFFF' : theme.textSecondary,
              }}
            >
              {cat.emoji} {cat.label}
            </AppText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  chip: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
