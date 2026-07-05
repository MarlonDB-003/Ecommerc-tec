import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';

vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockUseAuth() }));
const mockUseAuth = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));
vi.mock('@/components/ProductFormModal', () => ({
  default: ({ isOpen }: { isOpen: boolean }) =>
    isOpen ? <div data-testid="product-form-modal" /> : null,
}));

vi.mock('@/services/productService', () => ({
  productService: { getAll: vi.fn(), delete: vi.fn() },
}));

import Admin from './Admin';
import { productService } from '@/services/productService';

const MOCK_ADMIN_USER = {
  id: 'admin1', email: 'admin@test.com', displayName: 'Admin',
  avatarUrl: null, role: 'Admin',
};

const MOCK_PRODUCTS = [
  {
    id: 'p1', name: 'Produto A', price: 100, discountedPrice: 100,
    discountPercentage: 0, imageUrl: '/img/a.jpg', category: 'gaming',
    brand: 'BrandA', stock: 10, description: '', isActive: true, createdAt: '2025-01-01',
  },
];

describe('Admin page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(productService.getAll).mockResolvedValue({
      items: MOCK_PRODUCTS, totalCount: 1, page: 1, pageSize: 10, totalPages: 1,
    });
    vi.mocked(productService.delete).mockResolvedValue(undefined);
  });

  it('redirects to /auth when user is not admin', async () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, isLoading: false });
    render(<Admin />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/auth'));
  });

  it('redirects to /auth when regular user (not admin)', async () => {
    mockUseAuth.mockReturnValue({
      user: { id: 'u1', email: 'user@test.com' }, isAdmin: false, isLoading: false,
    });
    render(<Admin />);
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/auth'));
  });

  it('renders Header and Footer for admin user', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_ADMIN_USER, isAdmin: true, isLoading: false });
    render(<Admin />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('calls productService.getAll on mount for admin', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_ADMIN_USER, isAdmin: true, isLoading: false });
    render(<Admin />);
    await waitFor(() => expect(productService.getAll).toHaveBeenCalled());
  });

  it('renders product list after loading', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_ADMIN_USER, isAdmin: true, isLoading: false });
    render(<Admin />);
    await waitFor(() => expect(screen.getByText('Produto A')).toBeInTheDocument());
  });

  it('opens product form modal when "Novo Produto" is clicked', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_ADMIN_USER, isAdmin: true, isLoading: false });
    render(<Admin />);
    await waitFor(() => screen.getByText('Produto A'));
    fireEvent.click(screen.getByRole('button', { name: /novo produto/i }));
    expect(screen.getByTestId('product-form-modal')).toBeInTheDocument();
  });

  it('does not redirect when auth is still loading', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, isLoading: true });
    render(<Admin />);
    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('does not fetch products before auth resolves', () => {
    mockUseAuth.mockReturnValue({ user: null, isAdmin: false, isLoading: true });
    render(<Admin />);
    expect(productService.getAll).not.toHaveBeenCalled();
  });
});
