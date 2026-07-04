import { api } from '@/lib/api';

export interface ProductListItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  discountedPrice: number;
  imageUrl: string | null;
  category: string;
  stock: number;
  isActive: boolean;
  discountPercentage: number;
  createdAt: string;
}

export interface ProductSpec {
  id: string;
  label: string;
  value: string;
  displayOrder: number;
}

export interface ProductDetail extends ProductListItem {
  specifications: ProductSpec[];
}

export interface PagedResult<T> {
  items: T[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface SpecificationInput {
  label: string;
  value: string;
  displayOrder: number;
}

export interface ProductPayload {
  name: string;
  price: number;
  category: string;
  description?: string | null;
  imageUrl?: string | null;
  stock: number;
  discountPercentage: number;
  specifications: SpecificationInput[];
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export const productService = {
  getAll: (params: {
    category?: string;
    search?: string;
    isActive?: boolean;
    page?: number;
    pageSize?: number;
    sortBy?: string;
    ascending?: boolean;
  } = {}) => {
    const qs = new URLSearchParams();
    if (params.category && params.category !== 'todos') {
      qs.set('category', capitalize(params.category));
    }
    if (params.search) qs.set('search', params.search);
    if (params.isActive !== undefined) qs.set('isActive', String(params.isActive));
    if (params.page) qs.set('page', String(params.page));
    if (params.pageSize) qs.set('pageSize', String(params.pageSize));
    if (params.sortBy) qs.set('sortBy', params.sortBy);
    if (params.ascending !== undefined) qs.set('ascending', String(params.ascending));

    const query = qs.toString();
    return api.get<PagedResult<ProductListItem>>(`/api/products${query ? `?${query}` : ''}`);
  },

  getFeatured: (type: 'discounts' | 'recent' | 'gaming', limit = 10) =>
    api.get<ProductListItem[]>(`/api/products/featured?type=${type}&limit=${limit}`),

  getById: (id: string) =>
    api.get<ProductDetail>(`/api/products/${id}`),

  create: (data: ProductPayload) =>
    api.post<ProductDetail>('/api/products', data),

  update: (id: string, data: ProductPayload) =>
    api.put<ProductDetail>(`/api/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/api/products/${id}`),
};
