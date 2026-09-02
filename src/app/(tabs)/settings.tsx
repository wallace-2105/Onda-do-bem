/**
 * Onda do Bem — Settings Screen
 *
 * Configurações do aplicativo: alternar tema (claro/escuro/sistema),
 * notificações, privacidade e informações sobre o app.
 */

import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Switch,
  Pressable,
  Alert,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/hooks/use-theme';
import { useThemeStore, type ThemeMode } from '@/store/theme.store';
import { AppText } from '@/components/ui/text';
import { Spacing, BorderRadius, FontWeight } from '@/constants/theme';
import { Config } from '@/constants/config';

export default function SettingsScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

  const [pushLikes, setPushLikes] = useState(true);
  const [pushMutiroes, setPushMutiroes] = useState(true);
  const [saveDataMode, setSaveDataMode] = useState(false);

  const THEME_OPTIONS: Array<{ id: ThemeMode; label: string; icon: keyof typeof Ionicons.glyphMap }> = [
    { id: 'light', label: 'Claro', icon: 'sunny-outline' },
    { id: 'dark', label: 'Escuro', icon: 'moon-outline' },
    { id: 'system', label: 'Sistema', icon: 'phone-portrait-outline' },
  ];

  const handleLogout = () => {
    Alert.alert('Desconectar', 'Deseja realmente sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: () => {} },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background, paddingTop: insets.top }]}>
      {/* Top Header */}
      <View style={[styles.topBar, { backgroundColor: theme.surface, borderBottomColor: theme.border }]}>
        <AppText variant="h3" weight="bold">
          Ajustes & Preferências ⚙️
        </AppText>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Aparência & Tema */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionHeader}>
            APARÊNCIA
          </AppText>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.themeRow}>
              {THEME_OPTIONS.map((opt) => {
                const isSelected = mode === opt.id;
                return (
                  <Pressable
                    key={opt.id}
                    onPress={() => setMode(opt.id)}
                    style={[
                      styles.themeOption,
                      {
                        backgroundColor: isSelected ? theme.primaryLight : 'transparent',
                        borderColor: isSelected ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Ionicons
                      name={opt.icon}
                      size={20}
                      color={isSelected ? theme.primary : theme.textSecondary}
                    />
                    <AppText
                      variant="bodySm"
                      weight={isSelected ? 'bold' : 'regular'}
                      style={{
                        color: isSelected ? theme.primary : theme.text,
                        marginTop: 4,
                      }}
                    >
                      {opt.label}
                    </AppText>
                  </Pressable>
                );
              })}
            </View>
          </View>
        </View>

        {/* Notificações */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionHeader}>
            NOTIFICAÇÕES
          </AppText>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <AppText variant="body" weight="medium">
                  Curtidas e Comentários
                </AppText>
                <AppText variant="caption" color="secondary">
                  Avisos quando interagirem com suas ações
                </AppText>
              </View>
              <Switch
                value={pushLikes}
                onValueChange={setPushLikes}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <AppText variant="body" weight="medium">
                  Convites para Mutirões
                </AppText>
                <AppText variant="caption" color="secondary">
                  Ações ecológicas e voluntariado perto de você
                </AppText>
              </View>
              <Switch
                value={pushMutiroes}
                onValueChange={setPushMutiroes}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </View>
        </View>

        {/* Dados & Rede */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionHeader}>
            PREFERÊNCIAS DE USO
          </AppText>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingItem}>
              <View style={styles.settingInfo}>
                <AppText variant="body" weight="medium">
                  Economia de Dados
                </AppText>
                <AppText variant="caption" color="secondary">
                  Carregar fotos em resolução reduzida no 4G/5G
                </AppText>
              </View>
              <Switch
                value={saveDataMode}
                onValueChange={setSaveDataMode}
                trackColor={{ false: theme.border, true: theme.primary }}
              />
            </View>
          </View>
        </View>

        {/* Sobre */}
        <View style={styles.section}>
          <AppText variant="caption" weight="bold" color="secondary" style={styles.sectionHeader}>
            SOBRE O APP
          </AppText>
          <View style={[styles.card, { backgroundColor: theme.surface, borderColor: theme.border }]}>
            <View style={styles.settingItem}>
              <AppText variant="body">Versão</AppText>
              <AppText variant="bodySm" color="secondary">
                {Config.appVersion} (SDK 57)
              </AppText>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.borderLight }]} />

            <View style={styles.settingItem}>
              <AppText variant="body">Missão</AppText>
              <AppText variant="bodySm" color="secondary">
                Tecnologia para Impacto Positivo 🌊
              </AppText>
            </View>
          </View>
        </View>

        {/* Botão de Sair */}
        <Pressable
          onPress={handleLogout}
          style={[styles.logoutBtn, { borderColor: theme.error }]}
        >
          <Ionicons name="log-out-outline" size={20} color={theme.error} style={{ marginRight: 8 }} />
          <AppText variant="bodySm" weight="semibold" style={{ color: theme.error }}>
            Sair da Conta
          </AppText>
        </Pressable>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topBar: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderBottomWidth: 1,
  },
  scrollContent: {
    padding: Spacing.md,
    paddingBottom: Spacing['3xl'],
  },
  section: {
    marginBottom: Spacing.md,
  },
  sectionHeader: {
    marginBottom: Spacing.xs,
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  card: {
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: 'hidden',
  },
  themeRow: {
    flexDirection: 'row',
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  themeOption: {
    flex: 1,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
  },
  settingInfo: {
    flex: 1,
    paddingRight: Spacing.sm,
  },
  divider: {
    height: 1,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md,
    borderWidth: 1.5,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.md,
  },
});
