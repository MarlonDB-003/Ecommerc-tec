import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import Index from './Index';

const mockUseCategory = vi.fn();
vi.mock('@/contexts/CategoryContext', () => ({
  useCategory: () => mockUseCategory(),
}));

vi.mock('@/components/Header', () => ({
  default: () => <div data-testid="header" />,
}));
vi.mock('@/components/Hero', () => ({
  default: () => <div data-testid="hero" />,
}));
vi.mock('@/components/ProductCarousel', () => ({
  default: ({ title }: { title: string }) => <div data-testid="product-carousel">{title}</div>,
}));
vi.mock('@/components/ProductGrid', () => ({
  default: () => <div data-testid="product-grid" />,
}));
vi.mock('@/components/Footer', () => ({
  default: () => <div data-testid="footer" />,
}));
vi.mock('@/components/ScrollToTop', () => ({
  default: () => <div data-testid="scroll-to-top" />,
}));

describe('Index page', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  it('renders Header', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders Hero', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getByTestId('hero')).toBeInTheDocument();
  });

  it('renders Footer', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getByTestId('footer')).toBeInTheDocument();
  });

  it('renders ScrollToTop', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getByTestId('scroll-to-top')).toBeInTheDocument();
  });

  it('shows 3 ProductCarousels when category is "todos"', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getAllByTestId('product-carousel')).toHaveLength(3);
  });

  it('shows "Ofertas Imperdíveis" carousel when category is todos', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getByText('Ofertas Imperdíveis')).toBeInTheDocument();
  });

  it('shows "Lançamentos Recentes" carousel when category is todos', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getByText('Lançamentos Recentes')).toBeInTheDocument();
  });

  it('shows "Gaming Zone" carousel when category is todos', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'todos' });
    render(<Index />);
    expect(screen.getByText('Gaming Zone')).toBeInTheDocument();
  });

  it('shows ProductGrid when category is not "todos"', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'gaming' });
    render(<Index />);
    expect(screen.getByTestId('product-grid')).toBeInTheDocument();
    expect(screen.queryAllByTestId('product-carousel')).toHaveLength(0);
  });

  it('hides carousels when category is "smartphones"', () => {
    mockUseCategory.mockReturnValue({ selectedCategory: 'smartphones' });
    render(<Index />);
    expect(screen.queryAllByTestId('product-carousel')).toHaveLength(0);
  });
});
