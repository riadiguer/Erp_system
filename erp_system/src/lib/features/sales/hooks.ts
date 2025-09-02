import useSWR from 'swr';
import { SalesApi, type Order, type Invoice, type Customer, type Product, SalesPoint } from './api';

export function useOrders() {
  const { data, error, mutate, isValidating } = useSWR<Order[]>('/sales/orders/', SalesApi.orders.list);
  return { orders: data, loading: !data && !error, error, refresh: mutate, isValidating };
}

export function useInvoices() {
  const { data, error, mutate, isValidating } = useSWR<Invoice[]>('/sales/invoices/', SalesApi.invoices.list);
  return { invoices: data, loading: !data && !error, error, refresh: mutate, isValidating };
}

export function useCustomers() {
  const { data, error } = useSWR<Customer[]>('/sales/customers/', SalesApi.customers.list);
  return { customers: data, loading: !data && !error, error };
}

export function useProducts() {
  const { data, error } = useSWR<Product[]>('/sales/products/', SalesApi.products.list);
  return { products: data, loading: !data && !error, error };
}

export function useOrder(id?: string) {
  const key = id ? `/sales/orders/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<Order>(key, () => SalesApi.orders.get(id!));
  return { order: data, loading: !!id && !data && !error, error, refresh: mutate, isValidating };
}

export function useDeliveryNotesByOrder(orderId?: string) {
  const key = orderId ? `/sales/delivery-notes/?order=${orderId}` : null;
  const { data, error, mutate } = useSWR<any[]>(key, () => SalesApi.delivery.listByOrder(orderId!));
  return { deliveryNotes: data || [], loading: !!orderId && !data && !error, error, refresh: mutate };
}

export function useInvoicesByOrder(orderId?: string) {
  const key = orderId ? `/sales/invoices/?order=${orderId}` : null;
  const { data, error, mutate } = useSWR<Invoice[]>(key, () => SalesApi.invoices.listByOrder(orderId!));
  return { invoices: data || [], loading: !!orderId && !data && !error, error, refresh: mutate };
}

export function useSalesPoints() {
  const { data, error, mutate } = useSWR<SalesPoint[]>('/sales/sales-points/', SalesApi.salesPoints.list);
  return { salesPoints: data || [], loading: !data && !error, error, refresh: mutate };
}

