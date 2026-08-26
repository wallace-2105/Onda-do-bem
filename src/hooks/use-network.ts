/**
 * Onda do Bem — useNetwork Hook
 *
 * Hook para monitorar o status da conexão de rede.
 * Útil para exibir avisos offline e controlar comportamento do React Query.
 */

import { useEffect, useState } from 'react';

interface NetworkState {
  isConnected: boolean;
  isInternetReachable: boolean;
}

/**
 * Hook simples de conectividade.
 * Futuramente integrar com @react-native-community/netinfo
 * para monitoramento real de rede.
 */
export function useNetwork(): NetworkState {
  const [state, setState] = useState<NetworkState>({
    isConnected: true,
    isInternetReachable: true,
  });

  useEffect(() => {
    // TODO: Integrar com NetInfo quando necessário
    // const unsubscribe = NetInfo.addEventListener(newState => {
    //   setState({
    //     isConnected: newState.isConnected ?? true,
    //     isInternetReachable: newState.isInternetReachable ?? true,
    //   });
    // });
    // return () => unsubscribe();
    setState({ isConnected: true, isInternetReachable: true });
  }, []);

  return state;
}
