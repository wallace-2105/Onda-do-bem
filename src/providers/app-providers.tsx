/**
 * Onda do Bem — App Providers
 *
 * Composição de todos os context providers do aplicativo.
 * Encapsula QueryClient, ThemeProvider e futuros providers.
 *
 * Uso: envolve o root layout para prover estado global.
 */

import React, { type ReactNode } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import { Config } from '@/constants/config';
import { ErrorBoundary } from '@/components/common/error-boundary';

// ---------------------------------------------------------------------------
// Query Client
// ---------------------------------------------------------------------------

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: Config.defaultStaleTime,
      gcTime: Config.defaultGcTime,
      retry: 2,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 1,
    },
  },
});

// ---------------------------------------------------------------------------
// Provider Composition
// ---------------------------------------------------------------------------

interface AppProvidersProps {
  children: ReactNode;
}

export function AppProviders({ children }: AppProvidersProps) {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
