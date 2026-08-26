/**
 * Onda do Bem — Tipos de API
 *
 * Contratos genéricos para comunicação com o backend.
 * Esses tipos encapsulam os padrões de resposta da API,
 * permitindo tipagem forte em toda a cadeia: service → hook → componente.
 */

// ---------------------------------------------------------------------------
// Respostas genéricas
// ---------------------------------------------------------------------------

/** Resposta padrão de sucesso da API */
export interface ApiResponse<T> {
  data: T;
  message?: string;
  timestamp: string;
}

/** Resposta paginada da API */
export interface PaginatedResponse<T> {
  data: T[];
  meta: PaginationMeta;
}

/** Metadados de paginação */
export interface PaginationMeta {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

// ---------------------------------------------------------------------------
// Parâmetros de requisição
// ---------------------------------------------------------------------------

/** Parâmetros de paginação para queries */
export interface PaginationParams {
  page?: number;
  limit?: number;
}

/** Parâmetros de ordenação */
export interface SortParams {
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/** Parâmetros combinados para listagens */
export interface ListParams extends PaginationParams, SortParams {
  search?: string;
}

// ---------------------------------------------------------------------------
// Erros
// ---------------------------------------------------------------------------

/** Estrutura de erro retornada pela API */
export interface ApiError {
  statusCode: number;
  message: string;
  error: string;
  details?: Record<string, string[]>;
}

// ---------------------------------------------------------------------------
// Autenticação
// ---------------------------------------------------------------------------

/** Payload de login */
export interface LoginRequest {
  email: string;
  password: string;
}

/** Payload de registro */
export interface RegisterRequest {
  email: string;
  username: string;
  displayName: string;
  password: string;
}

/** Resposta de autenticação (login ou registro) */
export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: import('./entities').User;
}

/** Payload para refresh de token */
export interface RefreshTokenRequest {
  refreshToken: string;
}
