// lib/features/purchasing/api.ts

import { apiFetch } from '@/lib/api/client';

// ========================================
// TYPES
// ========================================

export type DemandStatus = 'draft' | 'submitted' | 'approved' | 'rejected' | 'converted' | 'cancelled';
export type DemandPriority = 'low' | 'medium' | 'high';

export interface DemandLine {
  id?: number;
  material_id: string;
  material_name: string;
  uom: string;
  quantity: string;
  suggested_supplier?: string;
  estimated_price?: string;
  needed_date?: string;
}

export interface DemandRequest {
  id: number;
  number: string;
  date: string;
  site: string;
  requester_id: string;
  requester_name: string;
  priority: DemandPriority;
  category: string;
  needed_date?: string;
  comment?: string;
  status: DemandStatus;
  lines: DemandLine[];
  attachments?: Array<{ name: string; url?: string }>;
  total_estimated_amount?: string;
  total_items?: number;
  approved_by?: string;
  approved_date?: string;
  rejected_by?: string;
  rejected_date?: string;
  rejection_reason?: string;
  converted_to_po?: number;
  converted_date?: string;
  created_at: string;
  updated_at: string;
  // Permissions
  can_edit?: boolean;
  can_submit?: boolean;
  can_approve?: boolean;
  can_reject?: boolean;
  can_convert?: boolean;
}

export interface DemandRequestInput extends Record<string, unknown> {
  date: string;
  site: string;
  requester_id: string;
  requester_name: string;
  priority: DemandPriority;
  category: string;
  needed_date?: string;
  comment?: string;
  lines: DemandLine[];
}

export interface DemandStatistics {
  total: number;
  draft: number;
  submitted: number;
  approved: number;
  rejected: number;
  converted: number;
  cancelled: number;
  high_priority: number;
  by_category?: Array<{ category: string; count: number }>;
  monthly?: Array<{ month: string; count: number }>;
}

export interface PurchaseOrder {
  id: number;
  number: string;
  // Add other PO fields as needed
}

export interface ConvertResponse {
  demand: DemandRequest;
  purchase_order: PurchaseOrder;
}

export interface ApproveData extends Record<string, unknown> {
  approved_by?: string;
  notes?: string;
}

export interface RejectData extends Record<string, unknown> {
  rejected_by?: string;
  reason?: string;
}

export interface CancelData extends Record<string, unknown> {
  reason?: string;
}

export interface ConvertData extends Record<string, unknown> {
  supplier_id: number;
}

// ========================================
// HTTP HELPERS
// ========================================

const get = <T>(path: string) => apiFetch<T>(path);

const post = <T>(path: string, body?: Record<string, unknown>) => 
  apiFetch<T>(path, { 
    method: 'POST', 
    body: body ? JSON.stringify(body) : undefined 
  });

const patch = <T>(path: string, body: Record<string, unknown>) => 
  apiFetch<T>(path, { 
    method: 'PATCH', 
    body: JSON.stringify(body) 
  });

const del = <T>(path: string) => 
  apiFetch<T>(path, { 
    method: 'DELETE', 
    body: undefined 
  });

// ========================================
// API ENDPOINTS
// ========================================

export const PurchasingApi = {
  // Demand Requests
  demands: {
    /**
     * List all demand requests
     * @param params - Query parameters for filtering
     */
    list: (params?: {
      status?: DemandStatus;
      priority?: DemandPriority;
      category?: string;
      requester?: string;
      date_from?: string;
      date_to?: string;
      search?: string;
    }) => {
      const queryParams = new URLSearchParams();
      if (params) {
        Object.entries(params).forEach(([key, value]) => {
          if (value) queryParams.append(key, value);
        });
      }
      const queryString = queryParams.toString();
      return get<DemandRequest[]>(
        `/purchasing/demands/${queryString ? `?${queryString}` : ''}`
      );
    },

    /**
     * Get a single demand request with full details
     */
    get: (id: number) => get<DemandRequest>(`/purchasing/demands/${id}/`),

    /**
     * Create a new demand request
     */
    create: (payload: DemandRequestInput) => 
      post<DemandRequest>('/purchasing/demands/', payload),

    /**
     * Update an existing demand request
     */
    update: (id: number, payload: Partial<DemandRequestInput>) => 
      patch<DemandRequest>(`/purchasing/demands/${id}/`, payload),

    /**
     * Delete a demand request
     */
    remove: (id: number) => del<Record<string, never>>(`/purchasing/demands/${id}/`),

    /**
     * Submit demand for approval
     */
    submit: (id: number) => 
      post<DemandRequest>(`/purchasing/demands/${id}/submit/`),

    /**
     * Approve a demand request
     */
    approve: (id: number, data?: ApproveData) => 
      post<DemandRequest>(`/purchasing/demands/${id}/approve/`, data),

    /**
     * Reject a demand request
     */
    reject: (id: number, data?: RejectData) => 
      post<DemandRequest>(`/purchasing/demands/${id}/reject/`, data),

    /**
     * Cancel a demand request
     */
    cancel: (id: number, data?: CancelData) => 
      post<DemandRequest>(`/purchasing/demands/${id}/cancel/`, data),

    /**
     * Convert demand to purchase order
     */
    convert: (id: number, data: ConvertData) => 
      post<ConvertResponse>(
        `/purchasing/demands/${id}/convert/`, 
        data
      ),

    /**
     * Get demand request statistics
     */
    statistics: () => get<DemandStatistics>('/purchasing/demands/statistics/'),
  }
};

// ========================================
// HELPER FUNCTIONS
// ========================================

/**
 * Transform frontend Priority to API format
 */
export function priorityToApi(priority: string): DemandPriority {
  switch (priority) {
    case 'Haute': return 'high';
    case 'Moyenne': return 'medium';
    case 'Basse': return 'low';
    default: return 'medium';
  }
}

/**
 * Transform API Priority to frontend format
 */
export function priorityFromApi(priority: DemandPriority): string {
  switch (priority) {
    case 'high': return 'Haute';
    case 'medium': return 'Moyenne';
    case 'low': return 'Basse';
    default: return 'Moyenne';
  }
}

/**
 * Transform frontend Status to API format
 */
export function statusToApi(status: string): DemandStatus {
  switch (status) {
    case 'Brouillon': return 'draft';
    case 'Soumise': return 'submitted';
    case 'Approuvée': return 'approved';
    case 'Rejetée': return 'rejected';
    case 'Convertie': return 'converted';
    case 'Annulée': return 'cancelled';
    default: return 'draft';
  }
}

/**
 * Transform API Status to frontend format
 */
export function statusFromApi(status: DemandStatus): string {
  switch (status) {
    case 'draft': return 'Brouillon';
    case 'submitted': return 'Soumise';
    case 'approved': return 'Approuvée';
    case 'rejected': return 'Rejetée';
    case 'converted': return 'Convertie';
    case 'cancelled': return 'Annulée';
    default: return 'Brouillon';
  }
}