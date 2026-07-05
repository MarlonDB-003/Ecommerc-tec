import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, useAuth, AuthUser } from './AuthContext';

// Mock services and toast
vi.mock('@/services/authService', () => ({
  authService: {
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
    me: vi.fn(),
  },
}));

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

import { authService } from '@/services/authService';

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <AuthProvider>{children}</AuthProvider>
);

const MOCK_USER: AuthUser = {
  userId: 'user-123',
  email: 'test@test.com',
  displayName: 'Test User',
  isAdmin: false,
};

const MOCK_ADMIN: AuthUser = {
  userId: 'admin-1',
  email: 'admin@test.com',
  displayName: 'Admin',
  isAdmin: true,
};

describe('AuthContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default: me() fails (no active session)
    vi.mocked(authService.me).mockRejectedValue(new Error('Unauthorized'));
  });

  describe('initial state', () => {
    it('starts in loading state', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      expect(result.current.isLoading).toBe(true);
    });

    it('resolves to no user when me() fails and localStorage is empty', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.user).toBeNull();
    });

    it('loads cached user from localStorage while validating', async () => {
      localStorage.setItem('tw_user', JSON.stringify(MOCK_USER));
      vi.mocked(authService.me).mockResolvedValue({
        userId: MOCK_USER.userId,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        isAdmin: MOCK_USER.isAdmin,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.user?.email).toBe(MOCK_USER.email);
    });

    it('clears cached user when me() returns 401', async () => {
      localStorage.setItem('tw_user', JSON.stringify(MOCK_USER));
      vi.mocked(authService.me).mockRejectedValue(new Error('Unauthorized'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('tw_user')).toBeNull();
    });
  });

  describe('signIn', () => {
    it('sets user and stores in localStorage on success', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        userId: MOCK_USER.userId,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        isAdmin: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let response: { error: string | null };
      await act(async () => {
        response = await result.current.signIn('test@test.com', 'password123');
      });

      expect(response!.error).toBeNull();
      expect(result.current.user?.email).toBe(MOCK_USER.email);
      const stored = JSON.parse(localStorage.getItem('tw_user')!);
      expect(stored.email).toBe(MOCK_USER.email);
    });

    it('returns error message on login failure', async () => {
      vi.mocked(authService.login).mockRejectedValue(new Error('Credenciais inválidas'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let response: { error: string | null };
      await act(async () => {
        response = await result.current.signIn('bad@test.com', 'wrong');
      });

      expect(response!.error).toBe('Credenciais inválidas');
      expect(result.current.user).toBeNull();
    });

    it('returns generic error when exception is not an Error instance', async () => {
      vi.mocked(authService.login).mockRejectedValue('some string error');

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let response: { error: string | null };
      await act(async () => {
        response = await result.current.signIn('bad@test.com', 'wrong');
      });

      expect(response!.error).toBe('Erro ao fazer login');
    });
  });

  describe('signUp', () => {
    it('sets user and stores in localStorage on success', async () => {
      vi.mocked(authService.register).mockResolvedValue({
        userId: 'new-user',
        email: 'new@test.com',
        displayName: 'New User',
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let response: { error: string | null };
      await act(async () => {
        response = await result.current.signUp('new@test.com', 'pass123', 'New User');
      });

      expect(response!.error).toBeNull();
      expect(result.current.user?.email).toBe('new@test.com');
      expect(result.current.user?.isAdmin).toBe(false);
    });

    it('returns error message on registration failure', async () => {
      vi.mocked(authService.register).mockRejectedValue(new Error('Email já cadastrado'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      let response: { error: string | null };
      await act(async () => {
        response = await result.current.signUp('dup@test.com', 'pass123');
      });

      expect(response!.error).toBe('Email já cadastrado');
    });
  });

  describe('signOut', () => {
    it('clears user and localStorage', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        userId: MOCK_USER.userId,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        isAdmin: false,
      });
      vi.mocked(authService.logout).mockResolvedValue(undefined);

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => {
        await result.current.signIn('test@test.com', 'pass');
      });
      expect(result.current.user).not.toBeNull();

      await act(async () => { await result.current.signOut(); });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('tw_user')).toBeNull();
    });

    it('still clears user even if logout API call fails', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        userId: MOCK_USER.userId,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        isAdmin: false,
      });
      vi.mocked(authService.logout).mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));

      await act(async () => { await result.current.signIn('test@test.com', 'pass'); });
      await act(async () => { await result.current.signOut(); });

      expect(result.current.user).toBeNull();
    });
  });

  describe('updateUser', () => {
    it('merges partial updates into current user', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        userId: MOCK_USER.userId,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        isAdmin: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => { await result.current.signIn('test@test.com', 'pass'); });

      act(() => { result.current.updateUser({ displayName: 'Updated Name' }); });

      expect(result.current.user?.displayName).toBe('Updated Name');
      expect(result.current.user?.email).toBe(MOCK_USER.email);
    });

    it('persists updates to localStorage', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        userId: MOCK_USER.userId,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        isAdmin: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => { await result.current.signIn('test@test.com', 'pass'); });

      act(() => { result.current.updateUser({ displayName: 'New Name' }); });

      const stored = JSON.parse(localStorage.getItem('tw_user')!);
      expect(stored.displayName).toBe('New Name');
    });

    it('does nothing when user is null', () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      act(() => { result.current.updateUser({ displayName: 'Ghost' }); });
      expect(result.current.user).toBeNull();
    });
  });

  describe('isAdmin and userRole', () => {
    it('isAdmin is false when no user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.isAdmin).toBe(false);
    });

    it('userRole is null when no user', async () => {
      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      expect(result.current.userRole).toBeNull();
    });

    it('isAdmin is true for admin user', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        userId: MOCK_ADMIN.userId,
        email: MOCK_ADMIN.email,
        displayName: MOCK_ADMIN.displayName,
        isAdmin: true,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => { await result.current.signIn('admin@test.com', 'pass'); });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.userRole).toBe('admin');
    });

    it('userRole is "user" for non-admin logged in user', async () => {
      vi.mocked(authService.login).mockResolvedValue({
        userId: MOCK_USER.userId,
        email: MOCK_USER.email,
        displayName: MOCK_USER.displayName,
        isAdmin: false,
      });

      const { result } = renderHook(() => useAuth(), { wrapper });
      await waitFor(() => expect(result.current.isLoading).toBe(false));
      await act(async () => { await result.current.signIn('test@test.com', 'pass'); });

      expect(result.current.isAdmin).toBe(false);
      expect(result.current.userRole).toBe('user');
    });
  });

  describe('useAuth guard', () => {
    it('throws when used outside AuthProvider', () => {
      expect(() => renderHook(() => useAuth())).toThrow(
        'useAuth must be used within an AuthProvider'
      );
    });
  });
});
