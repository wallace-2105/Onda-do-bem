/**
 * Onda do Bem — Tipos de Navegação
 *
 * Tipos auxiliares para a navegação com Expo Router.
 * O Expo Router com typedRoutes habilitado gera os tipos principais automaticamente.
 * Aqui definimos tipos adicionais para parâmetros de rotas e guards.
 */

/** Parâmetros para a rota de detalhes do post */
export interface PostRouteParams {
  id: string;
}

/** Parâmetros para a rota de perfil de outro usuário */
export interface UserRouteParams {
  id: string;
}

/** Estado de autenticação usado pelo route guard */
export interface AuthGuardState {
  isAuthenticated: boolean;
  isLoading: boolean;
  hasCompletedOnboarding: boolean;
}
