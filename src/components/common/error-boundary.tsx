/**
 * Onda do Bem — Error Boundary
 *
 * Captura erros de renderização em componentes filhos
 * e exibe uma tela de fallback amigável ao invés de crashar o app.
 */

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import { View, StyleSheet } from 'react-native';

import { AppText } from '@/components/ui/text';
import { AppButton } from '@/components/ui/button';
import { Spacing } from '@/constants/theme';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ErrorBoundaryProps {
  children: ReactNode;
  /** Componente de fallback customizado */
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    // TODO: Integrar com serviço de crash reporting (ex: Sentry)
    console.error('[ErrorBoundary]', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback != null) {
        return this.props.fallback;
      }

      return (
        <View style={styles.container}>
          <AppText variant="h2" center>
            😔
          </AppText>
          <AppText variant="h3" center style={styles.title}>
            Algo deu errado
          </AppText>
          <AppText variant="bodySm" color="secondary" center style={styles.message}>
            Ocorreu um erro inesperado. Tente novamente.
          </AppText>
          {__DEV__ && this.state.error != null && (
            <AppText variant="caption" color="error" style={styles.errorDetail}>
              {this.state.error.message}
            </AppText>
          )}
          <AppButton
            title="Tentar novamente"
            variant="primary"
            onPress={this.handleReset}
            style={styles.button}
          />
        </View>
      );
    }

    return this.props.children;
  }
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

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
    maxWidth: 280,
  },
  errorDetail: {
    marginTop: Spacing.md,
    maxWidth: 300,
    textAlign: 'center',
  },
  button: {
    marginTop: Spacing.lg,
  },
});
