// lib/features/purchasing/hooks.ts

import useSWR from 'swr';
import { PurchasingApi } from './api';
import type { 
  DemandRequest, 
  DemandStatistics, 
  DemandStatus, 
  DemandPriority,
  DemandRequestInput 
} from './api';

// ==================== DEMAND REQUESTS ====================

/**
 * Hook to fetch all demand requests
 * @param params - Optional filtering parameters
 */
export function useDemandRequests(params?: {
  status?: DemandStatus;
  priority?: DemandPriority;
  category?: string;
  requester?: string;
  date_from?: string;
  date_to?: string;
  search?: string;
}) {
  // Create cache key with params
  const paramsString = params ? JSON.stringify(params) : '';
  const key = `/purchasing/demands/${paramsString}`;
  
  const { data, error, mutate, isValidating } = useSWR<DemandRequest[]>(
    key,
    () => PurchasingApi.demands.list(params),
    {
      onError: (err) => {
        console.error('SWR Error fetching demands:', err)
      },
      onSuccess: (data) => {
        console.log('SWR Success fetching demands:', data)
      }
    }
  );
  
  // Ensure demands is always an array
  const demands = Array.isArray(data) ? data : [];
  
  console.log('useDemandRequests hook:', { 
    data, 
    demands, 
    isArray: Array.isArray(data),
    length: demands.length,
    error 
  })
  
  return { 
    demands, 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

/**
 * Hook to fetch a single demand request
 * @param id - Demand request ID
 */
export function useDemandRequest(id?: number) {
  const key = id ? `/purchasing/demands/${id}/` : null;
  
  const { data, error, mutate, isValidating } = useSWR<DemandRequest>(
    key,
    async () => {
      if (!id) throw new Error('No ID provided');
      return await PurchasingApi.demands.get(id);
    }
  );
  
  return { 
    demand: data, 
    loading: !!id && !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

/**
 * Hook to fetch demand statistics
 */
export function useDemandStatistics() {
  const { data, error, mutate, isValidating } = useSWR<DemandStatistics>(
    '/purchasing/demands/statistics/',
    PurchasingApi.demands.statistics
  );
  
  return { 
    statistics: data, 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

// ==================== HELPER HOOKS ====================

/**
 * Hook to get demands filtered by status
 */
export function useDemandsByStatus(status: DemandStatus) {
  return useDemandRequests({ status });
}

/**
 * Hook to get high priority demands
 */
export function useHighPriorityDemands() {
  return useDemandRequests({ priority: 'high' });
}

/**
 * Hook to get pending demands (submitted but not approved/rejected)
 */
export function usePendingDemands() {
  return useDemandRequests({ status: 'submitted' });
}

/**
 * Hook to get my demands (current user)
 * Note: Backend filters by requester automatically if user doesn't have view permission
 */
export function useMyDemands() {
  return useDemandRequests();
}

// ==================== MUTATION HELPERS ====================

/**
 * Create a new demand request
 * Note: Call mutate() on your useDemandRequests hook after this to refresh the list
 */
export async function createDemandRequest(payload: DemandRequestInput) {
  try {
    console.log('createDemandRequest called with:', payload);
    const result = await PurchasingApi.demands.create(payload);
    console.log('createDemandRequest result:', result);
    return result;
  } catch (error: unknown) {
    console.error('createDemandRequest error:', error);
    console.error('Error type:', typeof error);
    console.error('Error keys:', Object.keys(error || {}));
    
    // Handle ApiError format from apiFetch
    if (error && typeof error === 'object' && error !== null) {
      const errorObj = error as Record<string, unknown>;
      const errorMsg = (errorObj.detail as string) || (errorObj.message as string) || JSON.stringify(error);
      const status = (errorObj.status as string | number) || 'unknown';
      throw new Error(`API Error (${status}): ${errorMsg}`);
    }
    
    throw new Error(`Failed to create demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Update a demand request
 */
export async function updateDemandRequest(id: number, payload: Partial<DemandRequestInput>) {
  try {
    console.log('updateDemandRequest called with:', { id, payload });
    const result = await PurchasingApi.demands.update(id, payload);
    console.log('updateDemandRequest result:', result);
    return result;
  } catch (error) {
    console.error('updateDemandRequest error:', error);
    throw new Error(`Failed to update demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Delete a demand request
 */
export async function deleteDemandRequest(id: number) {
  try {
    console.log('deleteDemandRequest called with:', id);
    const result = await PurchasingApi.demands.remove(id);
    console.log('deleteDemandRequest result:', result);
    return result;
  } catch (error) {
    console.error('deleteDemandRequest error:', error);
    throw new Error(`Failed to delete demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Submit a demand request for approval
 */
export async function submitDemandRequest(id: number) {
  try {
    console.log('submitDemandRequest called with:', id);
    const result = await PurchasingApi.demands.submit(id);
    console.log('submitDemandRequest result:', result);
    return result;
  } catch (error) {
    console.error('submitDemandRequest error:', error);
    throw new Error(`Failed to submit demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Approve a demand request
 */
export async function approveDemandRequest(id: number, data?: { approved_by?: string; notes?: string }) {
  try {
    console.log('approveDemandRequest called with:', { id, data });
    const result = await PurchasingApi.demands.approve(id, data);
    console.log('approveDemandRequest result:', result);
    return result;
  } catch (error) {
    console.error('approveDemandRequest error:', error);
    throw new Error(`Failed to approve demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Reject a demand request
 */
export async function rejectDemandRequest(id: number, data?: { rejected_by?: string; reason?: string }) {
  try {
    console.log('rejectDemandRequest called with:', { id, data });
    const result = await PurchasingApi.demands.reject(id, data);
    console.log('rejectDemandRequest result:', result);
    return result;
  } catch (error) {
    console.error('rejectDemandRequest error:', error);
    throw new Error(`Failed to reject demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Cancel a demand request
 */
export async function cancelDemandRequest(id: number, data?: { reason?: string }) {
  try {
    console.log('cancelDemandRequest called with:', { id, data });
    const result = await PurchasingApi.demands.cancel(id, data);
    console.log('cancelDemandRequest result:', result);
    return result;
  } catch (error) {
    console.error('cancelDemandRequest error:', error);
    throw new Error(`Failed to cancel demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Convert a demand request to a purchase order
 */
export async function convertDemandToPO(id: number, supplierId: number) {
  try {
    console.log('convertDemandToPO called with:', { id, supplierId });
    const result = await PurchasingApi.demands.convert(id, { supplier_id: supplierId });
    console.log('convertDemandToPO result:', result);
    return result;
  } catch (error) {
    console.error('convertDemandToPO error:', error);
    throw new Error(`Failed to convert demand: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}