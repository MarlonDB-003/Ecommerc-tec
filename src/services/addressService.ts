import { api } from '@/lib/api';

export interface AddressDto {
  id: string;
  userId: string;
  label: string | null;
  cep: string;
  street: string;
  number: string;
  complement: string | null;
  neighborhood: string;
  city: string;
  state: string;
  isDefault: boolean;
  createdAt: string;
}

export interface CreateAddressPayload {
  label?: string | null;
  cep: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
}

export const addressService = {
  getMyAddresses: () =>
    api.get<AddressDto[]>('/api/addresses'),

  create: (data: CreateAddressPayload) =>
    api.post<AddressDto>('/api/addresses', data),

  setDefault: (id: string) =>
    api.patch<void>(`/api/addresses/${id}/default`, {}),

  delete: (id: string) =>
    api.delete(`/api/addresses/${id}`),
};
