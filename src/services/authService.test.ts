import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authService } from './authService';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('authService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('login', () => {
    it('calls POST /api/auth/login with email and password', async () => {
      vi.mocked(api.post).mockResolvedValue({ userId: '1', email: 'a@b.com', displayName: null, isAdmin: false });
      await authService.login('a@b.com', 'pass123');
      expect(api.post).toHaveBeenCalledWith('/api/auth/login', { email: 'a@b.com', password: 'pass123' });
    });

    it('returns the login response', async () => {
      const mockResponse = { userId: 'u1', email: 'test@test.com', displayName: 'User', isAdmin: false };
      vi.mocked(api.post).mockResolvedValue(mockResponse);
      const result = await authService.login('test@test.com', 'pass');
      expect(result).toEqual(mockResponse);
    });
  });

  describe('register', () => {
    it('calls POST /api/auth/register with credentials', async () => {
      vi.mocked(api.post).mockResolvedValue({ userId: 'new', email: 'new@test.com', displayName: 'New' });
      await authService.register('new@test.com', 'pass123', 'New User');
      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'new@test.com',
        password: 'pass123',
        displayName: 'New User',
      });
    });

    it('calls register without displayName', async () => {
      vi.mocked(api.post).mockResolvedValue({ userId: 'new', email: 'new@test.com', displayName: null });
      await authService.register('new@test.com', 'pass123');
      expect(api.post).toHaveBeenCalledWith('/api/auth/register', {
        email: 'new@test.com',
        password: 'pass123',
        displayName: undefined,
      });
    });
  });

  describe('logout', () => {
    it('calls POST /api/auth/logout', async () => {
      vi.mocked(api.post).mockResolvedValue(undefined);
      await authService.logout();
      expect(api.post).toHaveBeenCalledWith('/api/auth/logout', {});
    });
  });

  describe('me', () => {
    it('calls GET /api/auth/me', async () => {
      vi.mocked(api.get).mockResolvedValue({ userId: 'u1', email: 'a@b.com', displayName: null, isAdmin: false });
      await authService.me();
      expect(api.get).toHaveBeenCalledWith('/api/auth/me');
    });

    it('returns the user profile', async () => {
      const mockMe = { userId: 'u1', email: 'a@b.com', displayName: 'Test', isAdmin: true };
      vi.mocked(api.get).mockResolvedValue(mockMe);
      const result = await authService.me();
      expect(result).toEqual(mockMe);
    });
  });
});
