// lib/api/clients/customer/hooks.ts

import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient, UseQueryOptions, UseMutationOptions } from '@tanstack/react-query';
import {
  customerApi,
  customerContactApi,
  Customer,
  CustomerWrite,
  CustomerContact,
  CustomerContactWrite,
  CustomerListParams,
  ContactListParams,
  MergeCustomersRequest,
  PaginatedResponse,
} from './api';

// ============================================================================
// Query Keys
// ============================================================================

export const customerKeys = {
  all: ['customers'] as const,
  lists: () => [...customerKeys.all, 'list'] as const,
  list: (params?: CustomerListParams) => [...customerKeys.lists(), params] as const,
  details: () => [...customerKeys.all, 'detail'] as const,
  detail: (id: number) => [...customerKeys.details(), id] as const,
};

export const contactKeys = {
  all: ['customer-contacts'] as const,
  lists: () => [...contactKeys.all, 'list'] as const,
  list: (params?: ContactListParams) => [...contactKeys.lists(), params] as const,
  details: () => [...contactKeys.all, 'detail'] as const,
  detail: (id: number) => [...contactKeys.details(), id] as const,
};

// ============================================================================
// Customer Hooks
// ============================================================================

/**
 * Fetch a paginated list of customers
 */
export function useCustomers(
  params?: CustomerListParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<Customer>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: customerKeys.list(params),
    queryFn: () => customerApi.list(params),
    ...options,
  });
}

/**
 * Fetch a single customer by ID
 */
export function useCustomer(
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<Customer>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: customerKeys.detail(id!),
    queryFn: () => customerApi.get(id!),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new customer
 */
export function useCreateCustomer(
  options?: Omit<UseMutationOptions<Customer, Error, CustomerWrite>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerWrite) => customerApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    ...options,
  });
}

/**
 * Update an existing customer
 */
export function useUpdateCustomer(
  options?: Omit<UseMutationOptions<Customer, Error, { id: number; data: CustomerWrite }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => customerApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    ...options,
  });
}

/**
 * Partially update a customer
 */
export function usePartialUpdateCustomer(
  options?: Omit<UseMutationOptions<Customer, Error, { id: number; data: Partial<CustomerWrite> }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => customerApi.partialUpdate(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    ...options,
  });
}

/**
 * Delete a customer
 */
export function useDeleteCustomer(
  options?: Omit<UseMutationOptions<void, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerApi.delete(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.removeQueries({ queryKey: customerKeys.detail(variables) });
    },
    ...options,
  });
}

/**
 * Activate a customer
 */
export function useActivateCustomer(
  options?: Omit<UseMutationOptions<{ ok: boolean }, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerApi.activate(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    ...options,
  });
}

/**
 * Deactivate a customer
 */
export function useDeactivateCustomer(
  options?: Omit<UseMutationOptions<{ ok: boolean }, Error, number>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => customerApi.deactivate(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables) });
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
    },
    ...options,
  });
}

/**
 * Merge two customers
 */
export function useMergeCustomers(
  options?: Omit<UseMutationOptions<{ ok: boolean; target_id: string }, Error, MergeCustomersRequest>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: MergeCustomersRequest) => customerApi.merge(request),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      queryClient.removeQueries({ queryKey: customerKeys.detail(variables.source_id) });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.target_id) });
    },
    ...options,
  });
}

// ============================================================================
// Customer Contact Hooks
// ============================================================================

/**
 * Fetch a paginated list of customer contacts
 */
export function useCustomerContacts(
  params?: ContactListParams,
  options?: Omit<UseQueryOptions<PaginatedResponse<CustomerContact>>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: contactKeys.list(params),
    queryFn: () => customerContactApi.list(params),
    ...options,
  });
}

/**
 * Fetch a single contact by ID
 */
export function useCustomerContact(
  id: number | null | undefined,
  options?: Omit<UseQueryOptions<CustomerContact>, 'queryKey' | 'queryFn'>
) {
  return useQuery({
    queryKey: contactKeys.detail(id!),
    queryFn: () => customerContactApi.get(id!),
    enabled: !!id,
    ...options,
  });
}

/**
 * Create a new customer contact
 */
export function useCreateCustomerContact(
  options?: Omit<UseMutationOptions<CustomerContact, Error, CustomerContactWrite>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CustomerContactWrite) => customerContactApi.create(data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customer) });
    },
    ...options,
  });
}

/**
 * Update a customer contact
 */
export function useUpdateCustomerContact(
  options?: Omit<UseMutationOptions<CustomerContact, Error, { id: number; data: CustomerContactWrite }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => customerContactApi.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.data.customer) });
    },
    ...options,
  });
}

/**
 * Partially update a customer contact
 */
export function usePartialUpdateCustomerContact(
  options?: Omit<UseMutationOptions<CustomerContact, Error, { id: number; data: Partial<CustomerContactWrite> }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => customerContactApi.partialUpdate(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      if (variables.data.customer) {
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.data.customer) });
      }
    },
    ...options,
  });
}

/**
 * Delete a customer contact
 */
export function useDeleteCustomerContact(
  options?: Omit<UseMutationOptions<void, Error, { id: number; customerId?: number }>, 'mutationFn'>
) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id }) => customerContactApi.delete(id),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: contactKeys.lists() });
      queryClient.removeQueries({ queryKey: contactKeys.detail(variables.id) });
      if (variables.customerId) {
        queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.customerId) });
      }
    },
    ...options,
  });
}

// ============================================================================
// Custom Composite Hooks
// ============================================================================

/**
 * Hook for customer list with search and filters
 */
export function useCustomerSearch(initialParams?: CustomerListParams) {
  const [params, setParams] = useState<CustomerListParams>(initialParams || {});
  const query = useCustomers(params);

  const updateSearch = useCallback((search: string) => {
    setParams(prev => ({ ...prev, search, page: 1 }));
  }, []);

  const updateFilters = useCallback((filters: Partial<CustomerListParams>) => {
    setParams(prev => ({ ...prev, ...filters, page: 1 }));
  }, []);

  const nextPage = useCallback(() => {
    setParams(prev => ({ ...prev, page: (prev.page || 1) + 1 }));
  }, []);

  const prevPage = useCallback(() => {
    setParams(prev => ({ ...prev, page: Math.max((prev.page || 1) - 1, 1) }));
  }, []);

  return {
    ...query,
    params,
    updateSearch,
    updateFilters,
    nextPage,
    prevPage,
    setParams,
  };
}

/**
 * Hook for managing a customer with its contacts
 */
export function useCustomerWithContacts(customerId: number | null | undefined) {
  const customerQuery = useCustomer(customerId);
  const contactsQuery = useCustomerContacts(
    customerId ? { customer: customerId } : undefined,
    { enabled: !!customerId }
  );

  return {
    customer: customerQuery.data,
    contacts: contactsQuery.data?.results || [],
    isLoading: customerQuery.isLoading || contactsQuery.isLoading,
    isError: customerQuery.isError || contactsQuery.isError,
    error: customerQuery.error || contactsQuery.error,
    refetch: () => {
      customerQuery.refetch();
      contactsQuery.refetch();
    },
  };
}