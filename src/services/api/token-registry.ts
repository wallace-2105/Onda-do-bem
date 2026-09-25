/**
 * Onda do Bem — Token Registry
 *
 * Módulo leve e sem dependências que serve como "ponte" entre o auth store
 * e os interceptors do Axios, quebrando o ciclo circular de importação:
 *
 *   auth.store ? api/index ? interceptors ? auth.store  ? (circular)
 *   auth.store ? token-registry ? interceptors           ? (sem ciclo)
 *
 * O auth store registra callbacks aqui. O interceptor lê daqui.
 * Nenhum dos dois precisa importar o outro.
 */

type TokenGetter = () => string | null;
type LogoutHandler = () => void;
type TokenSetter = (access: string, refresh: string) => void;

let _getAccessToken: TokenGetter = () => null;
let _getRefreshToken: TokenGetter = () => null;
let _onLogout: LogoutHandler = () => {};
let _onSetTokens: TokenSetter = () => {};

export const tokenRegistry = {
  /** Registra as funções do auth store (chamado no boot do app) */
  register(options: {
    getAccessToken: TokenGetter;
    getRefreshToken: TokenGetter;
    onLogout: LogoutHandler;
    onSetTokens: TokenSetter;
  }) {
    _getAccessToken = options.getAccessToken;
    _getRefreshToken = options.getRefreshToken;
    _onLogout = options.onLogout;
    _onSetTokens = options.onSetTokens;
  },

  getAccessToken: () => _getAccessToken(),
  getRefreshToken: () => _getRefreshToken(),
  logout: () => _onLogout(),
  setTokens: (access: string, refresh: string) => _onSetTokens(access, refresh),
};
