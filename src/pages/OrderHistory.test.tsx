import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';

vi.mock('react-router-dom', () => ({ useNavigate: () => mockNavigate }));
const mockNavigate = vi.fn();

vi.mock('@/contexts/AuthContext', () => ({ useAuth: () => mockUseAuth() }));
const mockUseAuth = vi.fn();

vi.mock('@/hooks/use-toast', () => ({
  useToast: () => ({ toast: vi.fn() }),
}));

vi.mock('@/components/Header', () => ({ default: () => <div data-testid="header" /> }));
vi.mock('@/components/Footer', () => ({ default: () => <div data-testid="footer" /> }));

vi.mock('@/services/orderService', () => ({
  orderService: { getMyOrders: vi.fn() },
  PAYMENT_METHOD_LABELS: {
    CreditCard: 'Cartão de Crédito',
    DebitCard: 'Cartão de Débito',
    Pix: 'Pix',
    Boleto: 'Boleto',
  },
  ORDER_STATUS_LABELS: {
    Pending: 'Pendente',
    Processing: 'Em processamento',
    Shipped: 'Enviado',
    Delivered: 'Entregue',
    Cancelled: 'Cancelado',
  },
}));

import OrderHistory from './OrderHistory';
import { orderService } from '@/services/orderService';

const MOCK_USER = { id: 'u1', email: 'user@test.com', displayName: 'User' };

const MOCK_ORDERS = [
  {
    id: 'order-uuid-1234-5678',
    createdAt: '2025-06-01T10:00:00Z',
    status: 'Delivered',
    totalAmount: 499.99,
    paymentMethod: 'Pix',
    installments: 1,
    customerName: 'User',
    customerEmail: 'user@test.com',
    customerPhone: '',
    shippingAddress: '',
    items: [
      { id: 'i1', productId: 'p1', productName: 'Notebook', quantity: 1, unitPrice: 499.99 },
    ],
  },
];

describe('OrderHistory page', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(orderService.getMyOrders).mockResolvedValue({
      items: [], totalCount: 0, page: 1, pageSize: 8, totalPages: 0,
    });
  });

  it('redirects to /auth when not logged in', () => {
    mockUseAuth.mockReturnValue({ user: null });
    render(<OrderHistory />);
    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });

  it('renders Header and Footer for logged in user', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER });
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByTestId('header')).toBeInTheDocument();
      expect(screen.getByTestId('footer')).toBeInTheDocument();
    });
  });

  it('calls getMyOrders on mount', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER });
    render(<OrderHistory />);
    await waitFor(() => expect(orderService.getMyOrders).toHaveBeenCalled());
  });

  it('shows empty state message when no orders', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER });
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText(/nenhum pedido/i)).toBeInTheDocument();
    });
  });

  it('renders order card when orders exist', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER });
    vi.mocked(orderService.getMyOrders).mockResolvedValue({
      items: MOCK_ORDERS, totalCount: 1, page: 1, pageSize: 8, totalPages: 1,
    });
    render(<OrderHistory />);
    // order ID 'order-uuid-1234-5678' → slice(0,8).toUpperCase() = 'ORDER-UU'
    await waitFor(() => {
      expect(screen.getByText(/ORDER-UU/i)).toBeInTheDocument();
    });
  });

  it('renders page title "Meus Pedidos"', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER });
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('Meus Pedidos')).toBeInTheDocument();
    });
  });

  it('renders total amount in order card', async () => {
    mockUseAuth.mockReturnValue({ user: MOCK_USER });
    vi.mocked(orderService.getMyOrders).mockResolvedValue({
      items: MOCK_ORDERS, totalCount: 1, page: 1, pageSize: 8, totalPages: 1,
    });
    render(<OrderHistory />);
    await waitFor(() => {
      expect(screen.getByText('R$ 499.99')).toBeInTheDocument();
    });
  });
});
