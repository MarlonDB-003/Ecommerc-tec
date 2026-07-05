import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  orderService,
  toApiPaymentMethod,
  PAYMENT_METHOD_LABELS,
  ORDER_STATUS_LABELS,
} from './orderService';

vi.mock('@/lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

import { api } from '@/lib/api';

describe('toApiPaymentMethod', () => {
  it('maps "credit-card" to "CreditCard"', () => {
    expect(toApiPaymentMethod('credit-card')).toBe('CreditCard');
  });

  it('maps "debit-card" to "DebitCard"', () => {
    expect(toApiPaymentMethod('debit-card')).toBe('DebitCard');
  });

  it('maps "pix" to "Pix"', () => {
    expect(toApiPaymentMethod('pix')).toBe('Pix');
  });

  it('maps "boleto" to "Boleto"', () => {
    expect(toApiPaymentMethod('boleto')).toBe('Boleto');
  });

  it('defaults to "CreditCard" for unknown values', () => {
    expect(toApiPaymentMethod('unknown')).toBe('CreditCard');
    expect(toApiPaymentMethod('')).toBe('CreditCard');
  });
});

describe('PAYMENT_METHOD_LABELS', () => {
  it('has label for CreditCard', () => {
    expect(PAYMENT_METHOD_LABELS['CreditCard']).toBe('Cartão de Crédito');
  });

  it('has label for DebitCard', () => {
    expect(PAYMENT_METHOD_LABELS['DebitCard']).toBe('Cartão de Débito');
  });

  it('has label for Pix', () => {
    expect(PAYMENT_METHOD_LABELS['Pix']).toBe('PIX');
  });

  it('has label for Boleto', () => {
    expect(PAYMENT_METHOD_LABELS['Boleto']).toBe('Boleto Bancário');
  });
});

describe('ORDER_STATUS_LABELS', () => {
  const expectedLabels: Record<string, string> = {
    Pending: 'Pendente',
    Processing: 'Em Processamento',
    Shipped: 'Enviado',
    Delivered: 'Entregue',
    Cancelled: 'Cancelado',
  };

  Object.entries(expectedLabels).forEach(([status, label]) => {
    it(`has correct label for ${status}`, () => {
      expect(ORDER_STATUS_LABELS[status]).toBe(label);
    });
  });
});

describe('orderService', () => {
  beforeEach(() => { vi.clearAllMocks(); });

  const MOCK_PAYLOAD = {
    items: [{ productId: 'p1', quantity: 2 }],
    customerInfo: { name: 'João', email: 'joao@test.com', phone: '11999999999' },
    addressInfo: {
      cep: '01310-100', street: 'Av. Paulista', number: '1000',
      neighborhood: 'Bela Vista', city: 'São Paulo', state: 'SP',
    },
    paymentMethod: 'CreditCard' as const,
    installments: 3,
  };

  describe('create', () => {
    it('calls POST /api/orders with payload', async () => {
      vi.mocked(api.post).mockResolvedValue({});
      await orderService.create(MOCK_PAYLOAD);
      expect(api.post).toHaveBeenCalledWith('/api/orders', MOCK_PAYLOAD);
    });
  });

  describe('getMyOrders', () => {
    it('calls GET /api/orders with default pagination', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await orderService.getMyOrders();
      expect(api.get).toHaveBeenCalledWith('/api/orders?page=1&pageSize=10');
    });

    it('calls GET /api/orders with custom pagination', async () => {
      vi.mocked(api.get).mockResolvedValue({ items: [] });
      await orderService.getMyOrders(2, 5);
      expect(api.get).toHaveBeenCalledWith('/api/orders?page=2&pageSize=5');
    });
  });

  describe('getById', () => {
    it('calls GET /api/orders/:id', async () => {
      vi.mocked(api.get).mockResolvedValue({});
      await orderService.getById('order-abc');
      expect(api.get).toHaveBeenCalledWith('/api/orders/order-abc');
    });
  });
});
