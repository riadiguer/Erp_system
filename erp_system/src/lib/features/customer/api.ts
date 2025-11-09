// lib/api/clients/customer/api.ts

import { apiFetch } from '@/lib/api/client';

// ============================================================================
// Types
// ============================================================================

export type CustomerType = 'INDIVIDUAL' | 'BUSINESS';

export interface Customer {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  type: CustomerType;              // NEW
  balance: string;                 // decimal as string from API
  is_active: boolean;
  notes?: string;
  billing_address?: string;
  shipping_address?: string;
  created_at: string;
  updated_at: string;
  contacts?: CustomerContact[];
}

export interface CustomerWrite {
  name: string;
  email?: string;
  phone?: string;
  tax_id?: string;
  type: CustomerType;              // NEW
  billing_address?: string;
  shipping_address?: string;
  notes?: string;
  is_active?: boolean;
}

export interface CustomerContact {
  id: number;
  customer: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  is_primary: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerContactWrite {
  customer: number;
  name: string;
  email?: string;
  phone?: string;
  role?: string;
  is_primary?: boolean;
}

export interface CustomerListParams {
  is_active?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface ContactListParams {
  customer?: number;
  is_primary?: boolean;
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  [key: string]: string | number | boolean | undefined;
}

export interface MergeCustomersRequest {
  source_id: number;
  target_id: number;
  fields?: {
    email?: 'keep_source' | 'keep_target' | 'concat';
    phone?: 'keep_source' | 'keep_target' | 'concat';
    tax_id?: 'keep_source' | 'keep_target' | 'concat';
    notes?: 'keep_source' | 'keep_target' | 'concat';
    billing_address?: 'keep_source' | 'keep_target' | 'concat';
    shipping_address?: 'keep_source' | 'keep_target' | 'concat';
  };
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// ============================================================================
// Helper to build query string
// ============================================================================

function buildQueryString(params?: Record<string, string | number | boolean | undefined>): string {
  if (!params) return '';
  
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      queryParams.append(key, String(value));
    }
  });
  
  const qs = queryParams.toString();
  return qs ? `?${qs}` : '';
}

// ============================================================================
// Customer API
// ============================================================================

export interface BalanceOp { amount: string | number; }

class CustomerApi {
  async list(params?: CustomerListParams): Promise<PaginatedResponse<Customer>> {
    const qs = buildQueryString(params);
    const data = await apiFetch<PaginatedResponse<Customer> | Customer[]>(`/customers/${qs}`);
    // Normalize to pagination shape
    return Array.isArray(data)
      ? { count: data.length, next: null, previous: null, results: data }
      : data;
  }

  async get(id: number): Promise<Customer> {
    return apiFetch<Customer>(`/customers/${id}/`);
  }

  async create(data: CustomerWrite): Promise<Customer> {
    return apiFetch<Customer>('/customers/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: CustomerWrite): Promise<Customer> {
    return apiFetch<Customer>(`/customers/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async partialUpdate(id: number, data: Partial<CustomerWrite>): Promise<Customer> {
    return apiFetch<Customer>(`/customers/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: number): Promise<void> {
    await apiFetch(`/customers/${id}/`, {
      method: 'DELETE',
    });
  }

  async activate(id: number): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/customers/${id}/activate/`, {
      method: 'POST',
    });
  }

  async deactivate(id: number): Promise<{ ok: boolean }> {
    return apiFetch<{ ok: boolean }>(`/customers/${id}/deactivate/`, {
      method: 'POST',
    });
  }

  async merge(request: MergeCustomersRequest): Promise<{ ok: boolean; target_id: string }> {
    return apiFetch<{ ok: boolean; target_id: string }>('/customers/merge/', {
      method: 'POST',
      body: JSON.stringify(request),
    });
  }

   async credit(id: number, data: BalanceOp) {
    return apiFetch<{ ok: boolean; balance: string }>(`/customers/${id}/credit/`, {
      method: 'POST',
      body: JSON.stringify({ amount: data.amount }),
    });
  }
  async debit(id: number, data: BalanceOp) {
    return apiFetch<{ ok: boolean; balance: string }>(`/customers/${id}/debit/`, {
      method: 'POST',
      body: JSON.stringify({ amount: data.amount }),
    });
  }
}

// ============================================================================
// Customer Contact API
// ============================================================================

class CustomerContactApi {
  async list(params?: ContactListParams): Promise<PaginatedResponse<CustomerContact>> {
    const qs = buildQueryString(params);
    const data = await apiFetch<PaginatedResponse<CustomerContact> | CustomerContact[]>(`/customer-contacts/${qs}`);
    return Array.isArray(data)
      ? { count: data.length, next: null, previous: null, results: data }
      : data;
  }

  async get(id: number): Promise<CustomerContact> {
    return apiFetch<CustomerContact>(`/customer-contacts/${id}/`);
  }

  async create(data: CustomerContactWrite): Promise<CustomerContact> {
    return apiFetch<CustomerContact>('/customer-contacts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async update(id: number, data: CustomerContactWrite): Promise<CustomerContact> {
    return apiFetch<CustomerContact>(`/customer-contacts/${id}/`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async partialUpdate(id: number, data: Partial<CustomerContactWrite>): Promise<CustomerContact> {
    return apiFetch<CustomerContact>(`/customer-contacts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async delete(id: number): Promise<void> {
    await apiFetch(`/customer-contacts/${id}/`, {
      method: 'DELETE',
    });
  }
}

// ============================================================================
// Exports
// ============================================================================

export const customerApi = new CustomerApi();
export const customerContactApi = new CustomerContactApi();