import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('./ProductCard', () => ({
  default: ({ name }: { name: string }) => <div data-testid="product-card">{name}</div>,
}));

vi.mock('./ProductModal', () => ({
  default: () => null,
}));

vi.mock('@/components/ui/carousel', () => ({
  Carousel: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselContent: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselItem: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  CarouselPrevious: () => null,
  CarouselNext: () => null,
}));

vi.mock('@/services/productService', () => ({
  productService: { getFeatured: vi.fn() },
}));

import ProductCarousel from './ProductCarousel';
import { productService } from '@/services/productService';

const MOCK_PRODUCTS = [
  {
    id: '1', name: 'Notebook Gamer', price: 6000, discountedPrice: 5400,
    discountPercentage: 10, imageUrl: '/img/notebook.jpg', category: 'gaming',
    brand: 'Asus', stock: 5, description: '', isActive: true, createdAt: '2025-01-01',
  },
  {
    id: '2', name: 'Headset Pro', price: 300, discountedPrice: 300,
    discountPercentage: 0, imageUrl: '/img/headset.jpg', category: 'gaming',
    brand: 'HyperX', stock: 20, description: '', isActive: true, createdAt: '2025-01-02',
  },
];

describe('ProductCarousel', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productService.getFeatured).mockResolvedValue([]);
  });

  it('shows loading state initially', () => {
    vi.mocked(productService.getFeatured).mockReturnValue(new Promise(() => {}));
    render(<ProductCarousel title="Ofertas" description="Melhores preços" type="discounts" />);
    expect(screen.getByText('Carregando produtos...')).toBeInTheDocument();
  });

  it('shows title and description in loading state', () => {
    vi.mocked(productService.getFeatured).mockReturnValue(new Promise(() => {}));
    render(<ProductCarousel title="Ofertas" description="Melhores preços" type="discounts" />);
    expect(screen.getByText('Ofertas')).toBeInTheDocument();
    expect(screen.getByText('Melhores preços')).toBeInTheDocument();
  });

  it('calls getFeatured with correct type and limit', async () => {
    render(<ProductCarousel title="Ofertas" description="Desc" type="discounts" />);
    await waitFor(() => {
      expect(productService.getFeatured).toHaveBeenCalledWith('discounts', 10);
    });
  });

  it('calls getFeatured with gaming type', async () => {
    render(<ProductCarousel title="Gaming" description="Desc" type="gaming" />);
    await waitFor(() => {
      expect(productService.getFeatured).toHaveBeenCalledWith('gaming', 10);
    });
  });

  it('calls getFeatured with recent type', async () => {
    render(<ProductCarousel title="Recentes" description="Desc" type="recent" />);
    await waitFor(() => {
      expect(productService.getFeatured).toHaveBeenCalledWith('recent', 10);
    });
  });

  it('shows empty state when no products', async () => {
    render(<ProductCarousel title="Ofertas" description="Desc" type="discounts" />);
    await waitFor(() => {
      expect(screen.getByText('Nenhum produto encontrado.')).toBeInTheDocument();
    });
  });

  it('renders product cards after loading', async () => {
    vi.mocked(productService.getFeatured).mockResolvedValue(MOCK_PRODUCTS);
    render(<ProductCarousel title="Ofertas" description="Desc" type="discounts" />);
    await waitFor(() => {
      expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    });
  });

  it('renders title after loading with products', async () => {
    vi.mocked(productService.getFeatured).mockResolvedValue(MOCK_PRODUCTS);
    render(<ProductCarousel title="Lançamentos" description="Novidades" type="recent" />);
    await waitFor(() => {
      expect(screen.getByText('Lançamentos')).toBeInTheDocument();
      expect(screen.getByText('Novidades')).toBeInTheDocument();
    });
  });
});
