import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('@/contexts/CategoryContext', () => ({
  useCategory: () => ({ selectedCategory: 'todos', setSelectedCategory: vi.fn() }),
}));

vi.mock('@/contexts/SearchContext', () => ({
  useSearch: () => ({ searchQuery: '', setSearchQuery: vi.fn() }),
}));

vi.mock('./ProductCard', () => ({
  default: ({ name }: { name: string }) => <div data-testid="product-card">{name}</div>,
}));

vi.mock('./ProductModal', () => ({
  default: ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) =>
    isOpen ? <div data-testid="product-modal"><button onClick={onClose}>Fechar</button></div> : null,
}));

vi.mock('@/services/productService', () => ({
  productService: { getAll: vi.fn() },
}));

import ProductGrid from './ProductGrid';
import { productService } from '@/services/productService';

const EMPTY_RESULT = { items: [], totalCount: 0, page: 1, pageSize: 100, totalPages: 0 };

const MOCK_PRODUCTS = [
  {
    id: '1', name: 'Notebook Pro', price: 4000, discountedPrice: 3500,
    discountPercentage: 12, imageUrl: '/img/notebook.jpg', category: 'computadores',
    brand: 'Dell', stock: 10, description: 'Ótimo', isActive: true, createdAt: '2025-01-01',
  },
  {
    id: '2', name: 'Mouse Gamer', price: 200, discountedPrice: 200,
    discountPercentage: 0, imageUrl: '/img/mouse.jpg', category: 'componentes',
    brand: 'Logitech', stock: 50, description: '', isActive: true, createdAt: '2025-01-02',
  },
];

describe('ProductGrid', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productService.getAll).mockResolvedValue(EMPTY_RESULT);
  });

  it('shows loading state initially', () => {
    vi.mocked(productService.getAll).mockReturnValue(new Promise(() => {}));
    render(<ProductGrid />);
    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();
  });

  it('calls productService.getAll on mount', async () => {
    render(<ProductGrid />);
    await waitFor(() => expect(productService.getAll).toHaveBeenCalledTimes(1));
  });

  it('renders product cards after loading', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      items: MOCK_PRODUCTS, totalCount: 2, page: 1, pageSize: 100, totalPages: 1,
    });
    render(<ProductGrid />);
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(2));
  });

  it('shows default title "Produtos em Destaque" for todos category', async () => {
    render(<ProductGrid />);
    await waitFor(() => expect(screen.getByText('Produtos em Destaque')).toBeInTheDocument());
  });

  it('shows empty message when no products found', async () => {
    render(<ProductGrid />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum produto encontrado nesta categoria.')).toBeInTheDocument();
    });
  });

  it('shows brand filter buttons when multiple brands exist', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      items: MOCK_PRODUCTS, totalCount: 2, page: 1, pageSize: 100, totalPages: 1,
    });
    render(<ProductGrid />);
    await waitFor(() => {
      expect(screen.getByText('Todas as marcas')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Dell' })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Logitech' })).toBeInTheDocument();
    });
  });

  it('filters by brand when brand button is clicked', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      items: MOCK_PRODUCTS, totalCount: 2, page: 1, pageSize: 100, totalPages: 1,
    });
    render(<ProductGrid />);
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(2));
    fireEvent.click(screen.getByRole('button', { name: 'Dell' }));
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(1));
    expect(screen.getByText('Notebook Pro')).toBeInTheDocument();
  });

  it('resets brand filter when "Todas as marcas" is clicked', async () => {
    vi.mocked(productService.getAll).mockResolvedValue({
      items: MOCK_PRODUCTS, totalCount: 2, page: 1, pageSize: 100, totalPages: 1,
    });
    render(<ProductGrid />);
    await waitFor(() => screen.getAllByTestId('product-card'));
    fireEvent.click(screen.getByRole('button', { name: 'Dell' }));
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(1));
    fireEvent.click(screen.getByText('Todas as marcas'));
    await waitFor(() => expect(screen.getAllByTestId('product-card')).toHaveLength(2));
  });
});
