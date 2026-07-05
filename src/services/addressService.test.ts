import { describe, it, expect, vi, beforeEach } from 'vitest';
import { addressService } from './addressService';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('addressService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const MOCK_ADDRESS = {
    label: 'Casa',
    cep: '01310-100',
    street: 'Av. Paulista',
    number: '1000',
    complement: 'Apto 42',
    neighborhood: 'Bela Vista',
    city: 'São Paulo',
    state: 'SP',
  };

  describe('getMyAddresses', () => {
    it('calls GET /api/addresses', async () => {
      vi.mocked(api.get).mockResolvedValue([]);
      await addressService.getMyAddresses();
      expect(api.get).toHaveBeenCalledWith('/api/addresses');
    });

    it('returns list of addresses', async () => {
      const addresses = [{ id: '1', userId: 'u1', ...MOCK_ADDRESS, isDefault: true, createdAt: '' }];
      vi.mocked(api.get).mockResolvedValue(addresses);
      const result = await addressService.getMyAddresses();
      expect(result).toEqual(addresses);
    });
  });

  describe('create', () => {
    it('calls POST /api/addresses with payload', async () => {
      vi.mocked(api.post).mockResolvedValue({});
      await addressService.create(MOCK_ADDRESS);
      expect(api.post).toHaveBeenCalledWith('/api/addresses', MOCK_ADDRESS);
    });

    it('returns the created address', async () => {
      const created = { id: 'addr-1', userId: 'u1', ...MOCK_ADDRESS, isDefault: false, createdAt: '2025-01-01' };
      vi.mocked(api.post).mockResolvedValue(created);
      const result = await addressService.create(MOCK_ADDRESS);
      expect(result).toEqual(created);
    });
  });

  describe('setDefault', () => {
    it('calls PATCH /api/addresses/:id/default', async () => {
      vi.mocked(api.patch).mockResolvedValue(undefined);
      await addressService.setDefault('addr-123');
      expect(api.patch).toHaveBeenCalledWith('/api/addresses/addr-123/default', {});
    });
  });

  describe('delete', () => {
    it('calls DELETE /api/addresses/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);
      await addressService.delete('addr-123');
      expect(api.delete).toHaveBeenCalledWith('/api/addresses/addr-123');
    });
  });
});
