import { apiFetch } from '@/lib/api/client';

// ——— Types (sync with your serializers) ———
export type UUID = string;

export type Customer = {
  id: UUID; name: string; email?: string | null; phone?: string;
  tax_id?: string; billing_address?: string; shipping_address?: string;
  is_active: boolean; created_at: string; updated_at: string;
};

export type Product = {
  id: UUID; sku: string; name: string; description?: string;
  type: 'GOOD' | 'SERVICE'; unit: string; unit_price: string;
  track_stock: boolean; stock_qty: string; tax_rate: string;
  is_active: boolean; created_at: string; updated_at: string;
};

export type OrderLine = {
  product_detail: any;
  id: UUID;
  order: UUID;
  product: UUID;
  description: string;
  quantity: string;           // Decimal as string
  unit_price: string;
  tax_rate: string;
  subtotal: string;
  tax_amount: string;
  total: string;
  delivered_qty: string;
};

export type Order = {
  sales_point_detail: any;
  id: UUID; code: string; seq: number;
  customer: UUID; customer_detail?: Customer;
  status: 'DRAFT' | 'CONFIRMED' | 'PART_DELIV' | 'DELIVERED' | 'CANCELLED';
  currency: string; expected_delivery_date?: string | null;
  notes: string;
  subtotal: string; tax_amount: string; total: string;
  created_at: string; updated_at: string;
  lines: OrderLine[];
};

export type OrderLineInput = {
  product: UUID;
  description?: string;
  quantity: number | string;
  unit_price?: number | string;
  tax_rate?: number | string;
};
export type OrderCreateInput = {
  customer: UUID;
  currency?: string;
  expected_delivery_date?: string | null;
  notes?: string;
  sales_point: number; // sales point ID
  lines: OrderLineInput[];
};
export type OrderUpdateInput = Partial<Pick<OrderCreateInput, 'expected_delivery_date' | 'notes' | 'lines'>>;

export type InvoiceLine = {
  id: UUID; invoice: UUID; product: UUID; description: string;
  quantity: string; unit_price: string; tax_rate: string;
  subtotal: string; tax_amount: string; total: string;
};
export type Invoice = {
  customer_detail: any;
  id: UUID; code: string; seq: number;
  order?: UUID | null; customer: UUID;
  status: 'DRAFT' | 'ISSUED' | 'PART_PAID' | 'PAID' | 'CANCELLED';
  issue_date: string; due_date?: string | null; currency: string; notes: string;
  subtotal: string; tax_amount: string; total: string;
  amount_paid: string; balance_due: string;
  created_at: string; updated_at: string;
  lines: InvoiceLine[];
};
export type Payment = {
  id: UUID; invoice: UUID; amount: string; method: 'CASH'|'CARD'|'TRANSFER'|'CHECK'|'OTHER';
  reference?: string; received_at: string; notes?: string; created_at: string;
};

export type SalesPoint = {
  id: number;
  name: string;
  slug: string;
  kind: 'SHOWROOM'|'SOCIAL'|'WHATSAPP'|'WEBSITE'|'MARKET'|'OTHER'|'DEPOT'|'FACTORY';
  is_active: boolean;
  meta: Record<string, any>;
  created_at: string;
};

// ——— HTTP helpers ———
const get = <T>(p: string) => apiFetch<T>(p);
const post = <T>(p: string, body?: any) => apiFetch<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
const put  = <T>(p: string, body: any) => apiFetch<T>(p, { method: 'PUT', body: JSON.stringify(body) });
const patch= <T>(p: string, body: any) => apiFetch<T>(p, { method: 'PATCH', body: JSON.stringify(body) });
const del  = <T>(p: string) => apiFetch<T>(p, { method: 'DELETE' });

// ——— Endpoints ———
export const SalesApi = {
  // Customers / Products
  customers: {
    list: () => get<Customer[]>('/sales/customers/'),
  },
  products: {
    list: () => get<Product[]>('/sales/products/'),
  },

   salesPoints: {
    list: () => get<SalesPoint[]>('/sales/sales-points/'),
    create: (payload: Partial<SalesPoint>) => post<SalesPoint>('/sales/sales-points/', payload),
    update: (id: number, payload: Partial<SalesPoint>) => patch<SalesPoint>(`/sales/sales-points/${id}/`, payload),
    delete: (id: number) => del<{}>(`/sales/sales-points/${id}/`),
  },

  // Orders
  orders: {
    list: () => get<Order[]>('/sales/orders/'),
    get: (id: UUID) => get<Order>(`/sales/orders/${id}/`),
    create: (payload: OrderCreateInput) => post<Order>('/sales/orders/', payload),
    update: (id: UUID, payload: OrderUpdateInput) => patch<Order>(`/sales/orders/${id}/`, payload),
    remove: (id: UUID) => del<{}>(`/sales/orders/${id}/`),
    confirm: (id: UUID) => post<{ ok: true; status: string }>(`/sales/orders/${id}/confirm/`),
  },

  delivery: {
    // list delivery notes for a given order
    listByOrder: (orderId: UUID) => get<any[]>(`/sales/delivery-notes/?order=${orderId}`),
  },

  // Invoices
  invoices: {
    list: () => get<Invoice[]>('/sales/invoices/'),
    get: (id: UUID) => get<Invoice>(`/sales/invoices/${id}/`),
    create: (payload: Partial<Invoice> & { lines: any[] }) => post<Invoice>('/sales/invoices/', payload),
    fromOrder: (order_id: UUID) => post<{ ok: true; invoice_id: UUID }>('/sales/invoices/from-order/', { order_id }),
    issue: (id: UUID) => post<{ ok: true; status: string }>(`/sales/invoices/${id}/issue/`),
    update: (id: UUID, payload: Partial<Invoice> & { lines: any[] }) => put<Invoice>(`/sales/invoices/${id}/`, payload),
    remove: (id: UUID) => del<{}>(`/sales/invoices/${id}/`),
    listByOrder: (orderId: UUID) => get<Invoice[]>(`/sales/invoices/?order=${orderId}`)
    
  },

  // Payments
  payments: {
    create: (payload: { invoice: UUID; amount: number | string; method: Payment['method']; reference?: string; received_at?: string; notes?: string; }) =>
      post<Payment>('/sales/payments/', payload),
  },
};
