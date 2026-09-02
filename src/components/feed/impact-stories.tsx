/**
 * Onda do Bem — ImpactStories Component
 *
 * Exibe a barra de histórias / mutirões ativos com scroll horizontal.
 */

import React from 'react';
import { View, ScrollView, StyleSheet, Pressable } from 'react-native';
import { Image } from 'expo-image';

import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing, BorderRadius } from '@/constants/theme';
import { MOCK_STORIES, type StoryItem } from '@/constants/mock-data';

interface ImpactStoriesProps {
  onStoryPress?: (story: StoryItem) => void;
}

export function ImpactStories({ onStoryPress }: ImpactStoriesProps) {
  const theme = useAppTheme();

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {MOCK_STORIES.map((story, index) => {
          const isUser = index === 0;

          return (
            <Pressable
              key={story.id}
              style={styles.storyItem}
              onPress={() => onStoryPress?.(story)}
            >
              <View
                style={[
                  styles.avatarRing,
                  {
                    borderColor: isUser ? theme.primary : theme.secondary,
                    borderStyle: isUser ? 'dashed' : 'solid',
                  },
                ]}
              >
                <Image
                  source={{ uri: story.avatarUrl }}
                  style={styles.avatar}
                  contentFit="cover"
                />
                <View
                  style={[
                    styles.badgeIcon,
                    {
                      backgroundColor: isUser ? theme.primary : theme.surfaceElevated,
                    },
                  ]}
                >
                  <AppText variant="caption" style={{ fontSize: 10 }}>
                    {story.emoji}
                  </AppText>
                </View>
              </View>
              <AppText
                variant="caption"
                numberOfLines={1}
                weight={isUser ? 'semibold' : 'regular'}
                style={styles.authorName}
              >
                {story.title}
              </AppText>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
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
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: BorderRadius.full,
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
});
