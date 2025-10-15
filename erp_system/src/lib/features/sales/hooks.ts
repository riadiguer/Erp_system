import useSWR from 'swr';
import { SalesApi, type Order, type Invoice, type Customer, type Product, type Quote , type DeliveryNote ,SalesPoint, OrderLite } from './api';

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
  const { data, error, mutate, isValidating } = useSWR<Product[]>(
    '/sales/products/',
    SalesApi.products.list
  );
  return { products: data || [], loading: !data && !error, error, refresh: mutate, isValidating };
}

export function useProduct(id?: string) {
  const key = id ? `/sales/products/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<Product | undefined>(
    key,
    () => SalesApi.products.get!(id!)  // If you don’t have .get, see API step below
  );
  return { product: data, loading: !!id && !data && !error, error, refresh: mutate, isValidating };
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

export function useDeliveryNotes() {
  const { data, error, mutate, isValidating } = useSWR<DeliveryNote[]>('/sales/delivery-notes/', SalesApi.deliveryNotes.list);
  return { notes: data || [], loading: !data && !error, error, refresh: mutate, isValidating };
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

export function useQuotes() {
  const { data, error, mutate, isValidating } = useSWR<Quote[]>('/sales/quotes/', SalesApi.quotes.list);
  return { quotes: data || [], loading: !data && !error, error, refresh: mutate, isValidating };
}

export function useQuote(id?: string) {
  const key = id ? `/sales/quotes/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<Quote>(key, () => SalesApi.quotes.get(id!));
  return { quote: data, loading: !!id && !data && !error, error, refresh: mutate, isValidating };
}

export function useOrdersLite() {
  const { data, error } = useSWR<OrderLite[]>('/sales/orders/', SalesApi.orders.list);
  return { orders: data, loading: !data && !error, error };
}