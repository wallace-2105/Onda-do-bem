/**
 * Onda do Bem — 404 Not Found
 *
 * Tela exibida quando o usuário navega para uma rota inexistente.
 */

import { View, StyleSheet } from 'react-native';
import { Link, Stack } from 'expo-router';

import { AppText } from '@/components/ui/text';
import { useAppTheme } from '@/hooks/use-theme';
import { Spacing } from '@/constants/theme';

export default function NotFoundScreen() {
  const theme = useAppTheme();

  return (
    <>
      <Stack.Screen options={{ title: 'Oops!' }} />
      <View style={[styles.container, { backgroundColor: theme.background }]}>
        <AppText variant="h1" center>
          🔍
        </AppText>
        <AppText variant="h3" center style={styles.title}>
          Página não encontrada
        </AppText>
        <AppText variant="bodySm" color="secondary" center style={styles.message}>
          A tela que você procura não existe.
        </AppText>
        <Link href="/index" style={[styles.link, { color: theme.primary }]}>
          Voltar ao início
        </Link>
      </View>
    </>
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
  message: {
    marginTop: Spacing.sm,
  },
  link: {
    marginTop: Spacing.lg,
    fontSize: 16,
    fontWeight: '600',
  },
});
