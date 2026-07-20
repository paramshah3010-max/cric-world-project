import { api, tokenStore } from './api';
import type { AuthUser } from '../utils/types';

interface AuthResponse {
  user: AuthUser;
  token: string;
}

export const authApi = {
  register: async (payload: { name: string; email: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/register', payload);
    tokenStore.set(res.token);
    return res.user;
  },
  login: async (payload: { email: string; password: string }) => {
    const res = await api.post<AuthResponse>('/auth/login', payload);
    tokenStore.set(res.token);
    return res.user;
  },
  me: () => api.get<AuthUser>('/auth/me'),
  logout: () => tokenStore.clear(),
};
