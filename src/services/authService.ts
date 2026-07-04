import { api } from '@/lib/api';

export interface LoginResponse {
  userId: string;
  email: string;
  displayName: string | null;
  isAdmin: boolean;
  token: string;
}

export interface RegisterResponse {
  userId: string;
  email: string;
  displayName: string | null;
  token: string;
}

export const authService = {
  login: (email: string, password: string) =>
    api.post<LoginResponse>('/api/auth/login', { email, password }),

  register: (email: string, password: string, displayName?: string) =>
    api.post<RegisterResponse>('/api/auth/register', { email, password, displayName }),
};
