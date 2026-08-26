export { apiClient, apiGet, apiPost, apiPut, apiPatch, apiDelete } from './client';
export { Endpoints } from './endpoints';
// Importar interceptors causa side-effect de configuração
import './interceptors';
