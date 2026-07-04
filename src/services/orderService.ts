import { api } from '@/lib/api';

export interface OrderItemDto {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface OrderDto {
  id: string;
  userId: string;
  totalAmount: number;
  status: string;
  paymentMethod: string;
  installments: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressCep: string;
  addressStreet: string;
  addressNumber: string;
  addressComplement: string | null;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  items: OrderItemDto[];
  createdAt: string;
}

export interface OrderPagedResult {
  items: OrderDto[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
}

export interface CreateOrderPayload {
  items: { productId: string; quantity: number }[];
  customerInfo: { name: string; email: string; phone: string };
  addressInfo: {
    cep: string;
    street: string;
    number: string;
    complement?: string | null;
    neighborhood: string;
    city: string;
    state: string;
  };
  paymentMethod: 'CreditCard' | 'DebitCard' | 'Pix' | 'Boleto';
  installments?: number;
}

const PAYMENT_METHOD_MAP: Record<string, CreateOrderPayload['paymentMethod']> = {
  'credit-card': 'CreditCard',
  'debit-card':  'DebitCard',
  'pix':         'Pix',
  'boleto':      'Boleto',
};

export function toApiPaymentMethod(frontendId: string): CreateOrderPayload['paymentMethod'] {
  return PAYMENT_METHOD_MAP[frontendId] ?? 'CreditCard';
}

export const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CreditCard: 'Cartão de Crédito',
  DebitCard:  'Cartão de Débito',
  Pix:        'PIX',
  Boleto:     'Boleto Bancário',
};

export const ORDER_STATUS_LABELS: Record<string, string> = {
  Pending:    'Pendente',
  Processing: 'Em Processamento',
  Shipped:    'Enviado',
  Delivered:  'Entregue',
  Cancelled:  'Cancelado',
};

export const orderService = {
  create: (data: CreateOrderPayload) =>
    api.post<OrderDto>('/api/orders', data),

  getMyOrders: (page = 1, pageSize = 10) =>
    api.get<OrderPagedResult>(`/api/orders?page=${page}&pageSize=${pageSize}`),

  getById: (id: string) =>
    api.get<OrderDto>(`/api/orders/${id}`),
};
