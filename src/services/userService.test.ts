import { describe, it, expect, vi, beforeEach } from 'vitest';
import { userService } from './userService';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    put: vi.fn(),
    postMultipart: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('userService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getMyProfile', () => {
    it('calls GET /api/users/me', async () => {
      vi.mocked(api.get).mockResolvedValue({});
      await userService.getMyProfile();
      expect(api.get).toHaveBeenCalledWith('/api/users/me');
    });

    it('returns the user profile', async () => {
      const mockProfile = {
        userId: 'u1', email: 'a@b.com', displayName: 'Test',
        phone: null, avatarUrl: null, isAdmin: false,
      };
      vi.mocked(api.get).mockResolvedValue(mockProfile);
      const result = await userService.getMyProfile();
      expect(result).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('calls PUT /api/users/me with payload', async () => {
      vi.mocked(api.put).mockResolvedValue({});
      const payload = { displayName: 'New Name', phone: '11999999999' };
      await userService.updateProfile(payload);
      expect(api.put).toHaveBeenCalledWith('/api/users/me', payload);
    });

    it('handles partial updates', async () => {
      vi.mocked(api.put).mockResolvedValue({});
      await userService.updateProfile({ displayName: 'Only Name' });
      expect(api.put).toHaveBeenCalledWith('/api/users/me', { displayName: 'Only Name' });
    });
  });

  describe('uploadAvatar', () => {
    it('calls postMultipart with FormData containing the file', async () => {
      vi.mocked(api.postMultipart).mockResolvedValue({});
      const file = new File(['image'], 'avatar.jpg', { type: 'image/jpeg' });
      await userService.uploadAvatar(file);
      expect(api.postMultipart).toHaveBeenCalledWith(
        '/api/users/me/avatar',
        expect.any(FormData)
      );
    });
  });
});
