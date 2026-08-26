/**
 * Onda do Bem — Entry Point
 *
 * Rota raiz que redireciona o usuário com base no estado de autenticação:
 * - Não completou onboarding → /onboarding
 * - Não autenticado → /login
 * - Autenticado → /feed (tabs)
 *
 * Por enquanto, exibe uma tela placeholder até as rotas serem criadas.
 */

import { View, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/text';
import { AppButton } from '@/components/ui/button';
import { useAppTheme } from '@/hooks/use-theme';
import { useThemeStore } from '@/store/theme.store';
import { Spacing } from '@/constants/theme';

export default function IndexScreen() {
  const theme = useAppTheme();
  const resolvedTheme = useThemeStore((s) => s.resolvedTheme);
  const setMode = useThemeStore((s) => s.setMode);

  const toggleTheme = () => {
    setMode(resolvedTheme === 'dark' ? 'light' : 'dark');
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <AppText variant="h1" style={{ color: theme.primary }}>
        🌊
      </AppText>
      <AppText variant="h2" style={styles.title}>
        Onda do Bem
      </AppText>
      <AppText variant="body" color="secondary" center style={styles.subtitle}>
        Arquitetura inicializada com sucesso!
      </AppText>
      <AppText variant="bodySm" color="muted" center style={styles.description}>
        Fundação pronta para as próximas etapas.
      </AppText>

      <View style={styles.actions}>
        <AppButton
          title={`Tema: ${resolvedTheme === 'dark' ? '🌙 Escuro' : '☀️ Claro'}`}
          variant="outline"
          onPress={toggleTheme}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },
  title: {
    marginTop: Spacing.md,
  },
  subtitle: {
    marginTop: Spacing.sm,
  },
  description: {
    marginTop: Spacing.xs,
  },
  actions: {
    marginTop: Spacing['2xl'],
    gap: Spacing.md,
  },
});
