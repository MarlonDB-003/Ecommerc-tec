import { describe, it, expect, vi, beforeEach } from 'vitest';
import { productService } from './productService';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('productService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  describe('getAll', () => {
    it('calls GET /api/products with no query string when params are empty', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll();
      expect(api.get).toHaveBeenCalledWith('/api/products');
    });

    it('capitalizes category and adds it to query string', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll({ category: 'gaming' });
      expect(api.get).toHaveBeenCalledWith('/api/products?category=Gaming');
    });

    it('ignores "todos" category', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll({ category: 'todos' });
      expect(api.get).toHaveBeenCalledWith('/api/products');
    });

    it('adds search param when provided', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll({ search: 'notebook' });
      expect(api.get).toHaveBeenCalledWith('/api/products?search=notebook');
    });

    it('adds isActive param', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll({ isActive: true });
      expect(api.get).toHaveBeenCalledWith('/api/products?isActive=true');
    });

    it('adds pagination params', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll({ page: 2, pageSize: 20 });
      expect(api.get).toHaveBeenCalledWith('/api/products?page=2&pageSize=20');
    });

    it('adds sortBy and ascending params', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll({ sortBy: 'price', ascending: false });
      expect(api.get).toHaveBeenCalledWith('/api/products?sortBy=price&ascending=false');
    });

    it('combines multiple params correctly', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await productService.getAll({ category: 'smartphones', search: 'iphone', page: 1, pageSize: 10 });
      const url = vi.mocked(api.get).mock.calls[0][0] as string;
      expect(url).toContain('category=Smartphones');
      expect(url).toContain('search=iphone');
      expect(url).toContain('page=1');
      expect(url).toContain('pageSize=10');
    });
  });

  describe('getFeatured', () => {
    it('calls correct URL for discounts type', async () => {
      vi.mocked(api.get).mockResolvedValue([]);
      await productService.getFeatured('discounts');
      expect(api.get).toHaveBeenCalledWith('/api/products/featured?type=discounts&limit=10');
    });

    it('calls correct URL for recent type', async () => {
      vi.mocked(api.get).mockResolvedValue([]);
      await productService.getFeatured('recent', 5);
      expect(api.get).toHaveBeenCalledWith('/api/products/featured?type=recent&limit=5');
    });

    it('calls correct URL for gaming type', async () => {
      vi.mocked(api.get).mockResolvedValue([]);
      await productService.getFeatured('gaming', 8);
      expect(api.get).toHaveBeenCalledWith('/api/products/featured?type=gaming&limit=8');
    });
  });

  describe('getById', () => {
    it('calls GET /api/products/:id', async () => {
      vi.mocked(api.get).mockResolvedValue({});
      await productService.getById('abc-123');
      expect(api.get).toHaveBeenCalledWith('/api/products/abc-123');
    });
  });

  describe('create', () => {
    it('calls POST /api/products with the payload', async () => {
      vi.mocked(api.post).mockResolvedValue({});
      const payload = {
        name: 'Notebook', price: 5000, category: 'Computadores',
        stock: 10, discountPercentage: 0, specifications: [],
      };
      await productService.create(payload);
      expect(api.post).toHaveBeenCalledWith('/api/products', payload);
    });
  });

  describe('update', () => {
    it('calls PUT /api/products/:id with the payload', async () => {
      vi.mocked(api.put).mockResolvedValue({});
      const payload = {
        name: 'Updated', price: 4000, category: 'Computadores',
        stock: 5, discountPercentage: 10, specifications: [],
      };
      await productService.update('abc-123', payload);
      expect(api.put).toHaveBeenCalledWith('/api/products/abc-123', payload);
    });
  });

  describe('delete', () => {
    it('calls DELETE /api/products/:id', async () => {
      vi.mocked(api.delete).mockResolvedValue(undefined);
      await productService.delete('abc-123');
      expect(api.delete).toHaveBeenCalledWith('/api/products/abc-123');
    });
  });
});
