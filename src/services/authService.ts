import { api } from '@/lib/api';

export interface LoginResponse {
  userId: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  displayName: string | null;
}

export interface MeResponse {
  userId: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),

  register: (email: string, password: string, displayName?: string) =>
    api.post<RegisterResponse>('/api/auth/register', { email, password, displayName }),

  logout: () =>
    api.post<void>('/api/auth/logout', {}),

  me: () =>
    api.get<MeResponse>('/api/auth/me'),
};
