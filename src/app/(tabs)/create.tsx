/**
 * Onda do Bem — Create Post Screen
 *
 * Formulário interativo para publicar uma nova ação positiva na rede.
 * Atualiza o feed em tempo real com os dados digitados.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  TextInput,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/hooks/use-theme';
import { useFeedStore } from '@/store/feed.store';
import { AppText } from '@/components/ui/text';
import { AppButton } from '@/components/ui/button';
import { Spacing, BorderRadius, FontWeight } from '@/constants/theme';
import { PostCategory } from '@/types/entities';
import { CATEGORY_INFO } from '@/constants/mock-data';

const SAMPLE_PHOTO_PRESETS = [
  {
    label: 'Praia / Oceano',
    url: 'https://images.unsplash.com/photo-1618477461853-cf6ed80faba5?w=800&auto=format&fit=crop',
  },
  {
    label: 'Árvores / Floresta',
    url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&auto=format&fit=crop',
  },
  {
    label: 'Horta / Alimentos',
    url: 'https://images.unsplash.com/photo-1592417817098-8f3d6910985b?w=800&auto=format&fit=crop',
  },
  {
    label: 'Animais / Resgate',
    url: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=800&auto=format&fit=crop',
  },
  {
    label: 'Reciclagem',
    url: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?w=800&auto=format&fit=crop',
  },
];

export default function CreatePostScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const addPost = useFeedStore((s) => s.addPost);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState<PostCategory>(PostCategory.TREE_PLANTING);
  const [locationName, setLocationName] = useState('');
  const [impactScore, setImpactScore] = useState('25');
  const [selectedPhoto, setSelectedPhoto] = useState(SAMPLE_PHOTO_PRESETS[1].url);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!title.trim()) {
      Alert.alert('Atenção', 'Por favor, informe o título da sua ação.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Atenção', 'Escreva uma breve descrição de como foi essa ação.');
      return;
    }

    setLoading(true);

    addPost({
      title: title.trim(),
      description: description.trim(),
      category,
      locationName: locationName.trim() || 'Minha Cidade',
      impactScore: parseInt(impactScore, 10) || 10,
      imageUrl: selectedPhoto,
    });

    setLoading(false);
    // Limpa campos e volta para o feed
    setTitle('');
    setDescription('');
    router.replace('/(tabs)');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={[styles.header, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AppText variant="h3" weight="bold">
          Publicar Ação do Bem ✨
        </AppText>
        <AppText variant="caption" color="secondary">
          Compartilhe seu impacto com a comunidade
        </AppText>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Título */}
        <View style={styles.formGroup}>
          <AppText variant="label" weight="semibold" style={styles.label}>
            Título da Ação *
          </AppText>
          <TextInput
            placeholder="Ex: Plantio comunitário de 30 mudas nativas"
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            style={[
              styles.input,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        {/* Categoria */}
        <View style={styles.formGroup}>
          <AppText variant="label" weight="semibold" style={styles.label}>
            Categoria de Impacto
          </AppText>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsScroll}>
            {Object.entries(CATEGORY_INFO).map(([catKey, meta]) => {
              const isSelected = category === catKey;
              return (
                <Pressable
                  key={catKey}
                  onPress={() => setCategory(catKey as PostCategory)}
                  style={[
                    styles.categoryChip,
                    {
                      backgroundColor: isSelected ? meta.color : theme.surface,
                      borderColor: isSelected ? meta.color : theme.border,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'bold' : 'medium'}
                    style={{ color: isSelected ? '#FFFFFF' : theme.text }}
                  >
                    {meta.emoji} {meta.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Descrição */}
        <View style={styles.formGroup}>
          <AppText variant="label" weight="semibold" style={styles.label}>
            Descrição da Ação *
          </AppText>
          <TextInput
            placeholder="Conte os detalhes da ação, quem participou, o que foi recolhido ou transformado..."
            placeholderTextColor={theme.textMuted}
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
            textAlignVertical="top"
            style={[
              styles.textArea,
              {
                backgroundColor: theme.surface,
                borderColor: theme.border,
                color: theme.text,
              },
            ]}
          />
        </View>

        {/* Localização & Pontos de Impacto */}
        <View style={styles.rowInputs}>
          <View style={[styles.formGroup, { flex: 2 }]}>
            <AppText variant="label" weight="semibold" style={styles.label}>
              Localização
            </AppText>
            <TextInput
              placeholder="Ex: Praia da Joaquina, SC"
              placeholderTextColor={theme.textMuted}
              value={locationName}
              onChangeText={setLocationName}
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
          </View>

          <View style={[styles.formGroup, { flex: 1 }]}>
            <AppText variant="label" weight="semibold" style={styles.label}>
              Impacto (+pts)
            </AppText>
            <TextInput
              placeholder="Ex: 50"
              placeholderTextColor={theme.textMuted}
              value={impactScore}
              onChangeText={setImpactScore}
              keyboardType="numeric"
              style={[
                styles.input,
                {
                  backgroundColor: theme.surface,
                  borderColor: theme.border,
                  color: theme.text,
                },
              ]}
            />
          </View>
        </View>

        {/* Escolha da Foto Ilustrativa (Mock) */}
        <View style={styles.formGroup}>
          <AppText variant="label" weight="semibold" style={styles.label}>
            Foto da Ação (Selecione uma imagem de exemplo)
          </AppText>
          <View style={styles.photoPreviewContainer}>
            <Image
              source={{ uri: selectedPhoto }}
              style={styles.photoPreview}
              contentFit="cover"
            />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.presetsRow}>
            {SAMPLE_PHOTO_PRESETS.map((preset) => {
              const isSelected = selectedPhoto === preset.url;
              return (
                <Pressable
                  key={preset.label}
                  onPress={() => setSelectedPhoto(preset.url)}
                  style={[
                    styles.presetButton,
                    {
                      borderColor: isSelected ? theme.primary : theme.border,
                      backgroundColor: isSelected ? theme.primaryLight : theme.surface,
                    },
                  ]}
                >
                  <AppText
                    variant="caption"
                    weight={isSelected ? 'bold' : 'regular'}
                    style={{ color: isSelected ? theme.primary : theme.textSecondary }}
                  >
                    {preset.label}
                  </AppText>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Botão de Publicar */}
        <AppButton
          title="Publicar Ação no Feed 🌊"
          size="lg"
          variant="primary"
          loading={loading}
          onPress={handleSubmit}
          style={styles.submitBtn}
        />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  formGroup: {
    marginBottom: Spacing.md,
  },
  label: {
    marginBottom: Spacing.xs,
  },
  input: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
  },
  textArea: {
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    fontSize: 15,
    minHeight: 90,
  },
  chipsScroll: {
    marginTop: 4,
  },
  categoryChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  rowInputs: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  photoPreviewContainer: {
    width: '100%',
    height: 180,
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    marginTop: 4,
    backgroundColor: '#0F172A',
  },
  photoPreview: {
    width: '100%',
    height: '100%',
  },
  presetsRow: {
    marginTop: Spacing.xs,
  },
  presetButton: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 6,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginRight: Spacing.xs,
  },
  submitBtn: {
    marginTop: Spacing.md,
  },
});
