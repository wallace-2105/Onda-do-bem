/**
 * Onda do Bem — Login & Cadastro Screen
 *
 * Tela de autenticação conectada à API REST Spring Boot (JWT).
 * Suporta login, registro de novos usuários e seleção rápida com 1 toque
 * das contas de teste pré-cadastradas no servidor.
 */

import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';

import { useAppTheme } from '@/hooks/use-theme';
import { useAuthStore } from '@/store/auth.store';
import { AppText } from '@/components/ui/text';
import { AppButton } from '@/components/ui/button';
import { Spacing, BorderRadius, Shadows, FontWeight } from '@/constants/theme';
import { Config } from '@/constants/config';

// Credenciais de teste pré-cadastradas no DataInitializer do backend
const DEMO_ACCOUNTS = [
  {
    name: 'Lucas Silva',
    email: 'lucas.silva@ondadobem.org',
    password: 'senha123',
    role: 'Guardião da Terra (Nível 4)',
    emoji: '🏄‍♂️',
    color: '#0EA5E9',
  },
  {
    name: 'Marina Costa',
    email: 'marina.costa@ondadobem.org',
    password: 'senha123',
    role: 'Líder Sustentável (Nível 5)',
    emoji: '🌊',
    color: '#10B981',
  },
  {
    name: 'Pedro Almeida',
    email: 'pedro.almeida@ondadobem.org',
    password: 'senha123',
    role: 'Semeador do Futuro (Nível 3)',
    emoji: '🌱',
    color: '#F59E0B',
  },
];

export default function LoginScreen() {
  const theme = useAppTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const currentUser = useAuthStore((s) => s.user);
  const login = useAuthStore((s) => s.login);
  const register = useAuthStore((s) => s.register);
  const setAuth = useAuthStore((s) => s.setAuth);
  const setGuestMode = useAuthStore((s) => s.setGuestMode);
  const logout = useAuthStore((s) => s.logout);
  const isLoading = useAuthStore((s) => s.isLoading);

  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // Campos de Login / Registro
  const [email, setEmail] = useState('lucas.silva@ondadobem.org');
  const [password, setPassword] = useState('senha123');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Executa o Login
  const handleLogin = async (customEmail?: string, customPass?: string) => {
    const targetEmail = customEmail || email;
    const targetPass = customPass || password;

    if (!targetEmail.trim()) {
      setErrorMessage('Por favor, informe seu e-mail.');
      return;
    }
    if (!targetPass) {
      setErrorMessage('Por favor, digite sua senha.');
      return;
    }

    setErrorMessage(null);

    try {
      const user = await login(targetEmail, targetPass);
      Alert.alert(
        'Login efetuado com sucesso! 🌊💾',
        `Bem-vindo(a) de volta, ${user.displayName}!\nSeu acesso foi registrado e salvo com sucesso no banco de dados.`,
        [
          {
            text: 'Entrar no Aplicativo',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err: any) {
      const isNetworkError =
        err?.message?.includes('Network Error') ||
        err?.code === 'ECONNREFUSED' ||
        err?.message?.includes('timeout') ||
        err?.code === 'ERR_NETWORK';

      if (isNetworkError) {
        // Encontra se é uma das contas de demonstração cadastradas
        const matchedDemo = DEMO_ACCOUNTS.find(
          (a) => a.email.toLowerCase() === targetEmail.toLowerCase()
        );
        const demoUser: any = {
          id: matchedDemo
            ? matchedDemo.email.includes('lucas')
              ? 'u1'
              : matchedDemo.email.includes('marina')
              ? 'u2'
              : 'u3'
            : 'local-user-' + Date.now(),
          email: targetEmail,
          username: targetEmail.split('@')[0],
          displayName: matchedDemo ? matchedDemo.name : targetEmail.split('@')[0],
          avatarUrl: matchedDemo?.email.includes('lucas')
            ? 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop'
            : matchedDemo?.email.includes('marina')
            ? 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=200&auto=format&fit=crop',
          bio: 'Protetor ambiental e comunitário 🌊',
          location: 'Brasil',
          totalActions: 16,
          totalImpact: 420,
          rank: 4,
          rankTitle: 'Guardião da Terra',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          loginCount: 1,
        };

        Alert.alert(
          'API Spring Boot Não Respondendo ⚠️',
          `Não foi possível conectar ao servidor em ${Config.apiBaseUrl}.\n\nDeseja realizar o login em Modo Local com persistência segura no banco do dispositivo (SecureStore / AsyncStorage)?`,
          [
            {
              text: 'Cancelar',
              style: 'cancel',
            },
            {
              text: 'Entrar e Salvar no Banco Local 💾',
              onPress: async () => {
                await setAuth(demoUser, 'local-token-' + Date.now(), 'local-refresh-token');
                router.replace('/(tabs)');
              },
            },
          ]
        );
        setErrorMessage(
          `API inacessível em ${Config.apiBaseUrl}. Para conectar ao Spring Boot execute: .\\gradlew.bat bootRun na pasta backend.`
        );
        return;
      }

      let msg = 'Falha ao autenticar. Verifique suas credenciais.';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
    }
  };

  // Executa o Cadastro
  const handleRegister = async () => {
    if (!displayName.trim()) {
      setErrorMessage('Por favor, informe seu nome completo.');
      return;
    }
    if (!username.trim()) {
      setErrorMessage('Por favor, escolha um nome de usuário.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Por favor, informe um e-mail válido.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('A senha deve conter no mínimo 6 caracteres.');
      return;
    }

    setErrorMessage(null);

    try {
      const user = await register({
        displayName: displayName.trim(),
        username: username.trim().toLowerCase(),
        email: email.trim().toLowerCase(),
        password,
      });

      Alert.alert(
        'Conta Criada com Sucesso! 🌱💾',
        `Seja bem-vindo(a) ao Onda do Bem, ${user.displayName}!\nSeu cadastro foi salvo com sucesso no banco de dados.`,
        [
          {
            text: 'Acessar o Aplicativo',
            onPress: () => router.replace('/(tabs)'),
          },
        ]
      );
    } catch (err: any) {
      const isNetworkError =
        err?.message?.includes('Network Error') ||
        err?.code === 'ECONNREFUSED' ||
        err?.message?.includes('timeout') ||
        err?.code === 'ERR_NETWORK';

      if (isNetworkError) {
        const newUser: any = {
          id: 'user-' + Date.now(),
          email: email.trim().toLowerCase(),
          username: username.trim().toLowerCase(),
          displayName: displayName.trim(),
          avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop',
          bio: 'Novo membro da rede de impacto Onda do Bem 🌱',
          location: 'Brasil',
          totalActions: 0,
          totalImpact: 0,
          rank: 1,
          rankTitle: 'Protetor da Natureza',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
          loginCount: 1,
        };

        Alert.alert(
          'API Offline — Modo Local 💾',
          'A API Spring Boot não está ativa. Deseja criar o usuário e salvar seus dados no banco local seguro?',
          [
            { text: 'Cancelar', style: 'cancel' },
            {
              text: 'Criar e Salvar no Banco Local',
              onPress: async () => {
                await setAuth(newUser, 'local-token-' + Date.now(), 'local-refresh-token');
                router.replace('/(tabs)');
              },
            },
          ]
        );
        return;
      }

      let msg = 'Erro ao criar conta.';
      if (err?.response?.data?.message) {
        msg = err.response.data.message;
      }
      setErrorMessage(msg);
    }
  };

  // Preenche conta de demonstração
  const handleSelectDemoAccount = (acc: typeof DEMO_ACCOUNTS[0]) => {
    setEmail(acc.email);
    setPassword(acc.password);
    setErrorMessage(null);
    handleLogin(acc.email, acc.password);
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: theme.background }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[
          styles.scrollContainer,
          { paddingTop: insets.top + Spacing.lg, paddingBottom: insets.bottom + Spacing.xl },
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header e Logo Oficial */}
        <View style={styles.brandSection}>
          <View style={[styles.logoCard, { backgroundColor: '#0284C7' }]}>
            <Image
              source={require('@/../assets/images/onda-logo.png')}
              style={styles.logoImage}
              contentFit="contain"
            />
          </View>
          <AppText variant="h1" weight="bold" style={styles.brandTitle}>
            Onda do Bem 🌊
          </AppText>
          <AppText variant="bodySm" color="secondary" center style={styles.brandSubtitle}>
            Rede de impacto ecológico e comunitário
          </AppText>

          {/* Badge de Conexão com a API e Banco */}
          <View style={[styles.apiBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <View style={styles.apiStatusDot} />
            <AppText variant="caption" color="secondary">
              API & DB: <AppText variant="caption" weight="bold">{Config.apiBaseUrl}</AppText>
            </AppText>
          </View>
        </View>

        {/* Banner de Sessão Ativa (se usuário já estiver conectado) */}
        {currentUser && (
          <View
            style={[
              styles.activeSessionBanner,
              { backgroundColor: theme.surface, borderColor: '#10B98160' },
            ]}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={[styles.activeDot, { backgroundColor: '#10B981' }]} />
              <AppText variant="bodySm" weight="bold" style={{ color: theme.text, marginLeft: 6 }}>
                Sessão Ativa no Banco de Dados 💾
              </AppText>
            </View>
            <AppText variant="caption" color="secondary" style={{ marginTop: 4 }}>
              Usuário conectado: <AppText variant="caption" weight="bold">{currentUser.displayName}</AppText> ({currentUser.email})
            </AppText>
            {currentUser.rankTitle && (
              <AppText variant="caption" style={{ color: theme.primary, marginTop: 2, fontWeight: FontWeight.semibold }}>
                Rank: {currentUser.rankTitle}
              </AppText>
            )}
            <View style={styles.activeSessionActions}>
              <Pressable
                style={[styles.smallBtn, { backgroundColor: theme.primary }]}
                onPress={() => router.replace('/(tabs)')}
              >
                <AppText variant="caption" weight="bold" style={{ color: '#FFFFFF' }}>
                  Acessar Feed ➜
                </AppText>
              </Pressable>
              <Pressable
                style={[styles.smallBtnOutline, { borderColor: theme.border }]}
                onPress={async () => {
                  await logout();
                  setEmail('');
                  setPassword('');
                }}
              >
                <AppText variant="caption" weight="semibold" color="secondary">
                  Desconectar
                </AppText>
              </Pressable>
            </View>
          </View>
        )}

        {/* Card Principal de Autenticação */}
        <View style={[styles.authCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
          {/* Badge informativo de persistência */}
          <View style={[styles.dbBadge, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Ionicons name="server-outline" size={14} color={theme.primary} />
            <AppText variant="caption" color="secondary" style={{ marginLeft: 6, flex: 1 }}>
              Ao fazer o login, seus dados são salvos no banco de dados.
            </AppText>
          </View>

          {/* Seletor de Modo: Entrar vs Criar Conta */}
          <View style={[styles.modeSelector, { backgroundColor: theme.surfaceElevated }]}>
            <Pressable
              onPress={() => {
                setAuthMode('login');
                setErrorMessage(null);
              }}
              style={[
                styles.modeButton,
                authMode === 'login' && { backgroundColor: theme.primary, ...Shadows.sm },
              ]}
            >
              <AppText
                variant="bodySm"
                weight="bold"
                style={{ color: authMode === 'login' ? '#FFFFFF' : theme.textSecondary }}
              >
                Entrar 🔐
              </AppText>
            </Pressable>

            <Pressable
              onPress={() => {
                setAuthMode('register');
                setErrorMessage(null);
              }}
              style={[
                styles.modeButton,
                authMode === 'register' && { backgroundColor: theme.primary, ...Shadows.sm },
              ]}
            >
              <AppText
                variant="bodySm"
                weight="bold"
                style={{ color: authMode === 'register' ? '#FFFFFF' : theme.textSecondary }}
              >
                Criar Conta ✨
              </AppText>
            </Pressable>
          </View>

          {/* Mensagem de Erro */}
          {errorMessage && (
            <View style={[styles.errorBox, { backgroundColor: '#EF444415', borderColor: '#EF444450' }]}>
              <Ionicons name="alert-circle" size={18} color="#EF4444" />
              <AppText variant="caption" style={{ color: '#EF4444', flex: 1, marginLeft: 6 }}>
                {errorMessage}
              </AppText>
            </View>
          )}

          {/* Formulário de Registro (se ativo) */}
          {authMode === 'register' && (
            <>
              <AppText variant="caption" color="secondary" style={styles.inputLabel}>
                Nome Completo *
              </AppText>
              <View style={[styles.inputRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <Ionicons name="person-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  value={displayName}
                  onChangeText={setDisplayName}
                  placeholder="Ex: Beatriz Albuquerque"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>

              <AppText variant="caption" color="secondary" style={styles.inputLabel}>
                Nome de Usuário (Username) *
              </AppText>
              <View style={[styles.inputRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
                <Ionicons name="at-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
                <TextInput
                  value={username}
                  onChangeText={setUsername}
                  placeholder="Ex: beatriz.eco"
                  autoCapitalize="none"
                  placeholderTextColor={theme.textMuted}
                  style={[styles.input, { color: theme.text }]}
                />
              </View>
            </>
          )}

          {/* Campos de E-mail e Senha */}
          <AppText variant="caption" color="secondary" style={styles.inputLabel}>
            E-mail {authMode === 'register' && '*'}
          </AppText>
          <View style={[styles.inputRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Ionicons name="mail-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="seu.email@exemplo.org"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { color: theme.text }]}
            />
          </View>

          <AppText variant="caption" color="secondary" style={styles.inputLabel}>
            Senha {authMode === 'register' && '(mínimo 6 caracteres) *'}
          </AppText>
          <View style={[styles.inputRow, { backgroundColor: theme.surfaceElevated, borderColor: theme.border }]}>
            <Ionicons name="lock-closed-outline" size={18} color={theme.textSecondary} style={{ marginRight: 8 }} />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Digite sua senha"
              secureTextEntry={!showPassword}
              placeholderTextColor={theme.textMuted}
              style={[styles.input, { color: theme.text }]}
            />
            <Pressable onPress={() => setShowPassword(!showPassword)} hitSlop={8}>
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={20}
                color={theme.textSecondary}
              />
            </Pressable>
          </View>

          {/* Botão de Submissão Principal */}
          <View style={{ marginTop: Spacing.md }}>
            <AppButton
              title={authMode === 'login' ? 'Entrar com a API 🔐' : 'Cadastrar e Conectar ✨'}
              variant="primary"
              size="lg"
              loading={isLoading}
              onPress={authMode === 'login' ? () => handleLogin() : handleRegister}
              fullWidth
            />
          </View>
        </View>

        {/* Seção de Demonstração Rápida (Contas do Backend) */}
        {authMode === 'login' && (
          <View style={styles.demoSection}>
            <View style={styles.demoHeaderRow}>
              <Ionicons name="flash" size={16} color="#F59E0B" />
              <AppText variant="caption" weight="bold" color="secondary" style={{ marginLeft: 4 }}>
                CONTAS DE TESTE DA API SPRING BOOT (1 TOQUE)
              </AppText>
            </View>

            <View style={styles.demoCardsContainer}>
              {DEMO_ACCOUNTS.map((acc) => (
                <Pressable
                  key={acc.email}
                  onPress={() => handleSelectDemoAccount(acc)}
                  style={[styles.demoCard, { backgroundColor: theme.surface, borderColor: theme.border }]}
                >
                  <View style={[styles.demoIconBadge, { backgroundColor: acc.color + '18' }]}>
                    <AppText variant="body">{acc.emoji}</AppText>
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText variant="bodySm" weight="bold">
                      {acc.name}
                    </AppText>
                    <AppText variant="caption" color="secondary">
                      {acc.email}
                    </AppText>
                    <AppText variant="caption" style={{ color: acc.color, fontWeight: FontWeight.semibold }}>
                      {acc.role}
                    </AppText>
                  </View>
                  <Ionicons name="arrow-forward-circle" size={22} color={acc.color} />
                </Pressable>
              ))}
            </View>
          </View>
        )}

        {/* Atalho para continuar como Convidado */}
        <Pressable
          onPress={() => {
            setGuestMode(true);
            router.replace('/(tabs)');
          }}
          style={styles.guestLink}
        >
          <AppText variant="bodySm" color="secondary" weight="semibold">
            Continuar sem login (Modo Visitante / Feed) ➜
          </AppText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  scrollContainer: {
    paddingHorizontal: Spacing.md,
    alignItems: 'center',
  },
  brandSection: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  logoCard: {
    width: 90,
    height: 90,
    borderRadius: 45,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.sm,
    ...Shadows.md,
  },
  logoImage: {
    width: 72,
    height: 72,
  },
  brandTitle: {
    fontSize: 26,
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    marginTop: 4,
    maxWidth: 260,
  },
  apiBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    marginTop: Spacing.sm,
  },
  apiStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  activeSessionBanner: {
    width: '100%',
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    marginBottom: Spacing.md,
    ...Shadows.sm,
  },
  activeDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  activeSessionActions: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginTop: Spacing.sm,
  },
  smallBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
  },
  smallBtnOutline: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 6,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  authCard: {
    width: '100%',
    padding: Spacing.lg,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    ...Shadows.md,
  },
  dbBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.md,
  },
  modeSelector: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.sm,
  },
  inputLabel: {
    marginTop: Spacing.xs,
    marginBottom: 4,
    fontWeight: FontWeight.semibold,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.sm,
    marginBottom: Spacing.xs,
  },
  input: {
    flex: 1,
    fontSize: 14,
  },
  demoSection: {
    width: '100%',
    marginTop: Spacing.lg,
  },
  demoHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs,
    marginLeft: 4,
  },
  demoCardsContainer: {
    gap: Spacing.xs,
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    gap: Spacing.sm,
  },
  demoIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestLink: {
    marginTop: Spacing.lg,
    paddingVertical: Spacing.sm,
  },
});
