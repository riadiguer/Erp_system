import { apiFetch } from '@/lib/api/client';

// —— Types (sync with your serializers) ——
export type UUID = string;

export type Category = {
  id: number;
  name: string;
  description?: string;
  materials_count?: number;
  created_at: string;
  updated_at: string;
};

export type Supplier = {
  id: number;
  name: string;
  contact_name?: string;
  email?: string | null;
  phone?: string;
  address?: string;
  nif?: string;  
  rc?: string;   
  iban?: string; 
  payment_mode?: 'cash' | 'bank' | 'check' | 'credit'; 
  payment_delay?: number; 
  notes?: string; 
  materials_count?: number;
  created_at: string;
  updated_at: string;
};

// ✅ NEW: Supplier Statistics Type
export type SupplierStatistics = {
  total_suppliers: number;
  active_suppliers: number;
  inactive_suppliers: number;
  suppliers_with_debt: number;
  monthly_data: Array<{
    month: string;
    achats: number;
    paiements: number;
  }>;
  total_achats: number;
  total_paiements: number;
  solde: number;
};

export type UnitType = 'mètre' | 'rouleau' | 'litre' | 'kg' | 'pièce' | 'boîte';

export type Material = {
  id: number;
  name: string;
  reference: string;
  category: number;
  category_name?: string;
  supplier: number;
  supplier_name?: string;
  stock: string;
  min_stock: string;
  unit: UnitType;
  price: string;
  description?: string;
  is_low_stock: boolean;
  stock_percentage: string;
  stock_status: 'Critique' | 'Bas' | 'Normal';
  total_value: string;
  created_at: string;
  updated_at: string;
};

export type MaterialDetail = Material & {
  recent_movements?: StockMovement[];
};

export type MovementType = 'in' | 'out' | 'adjustment';

export type StockMovement = {
  id: number;
  material: number;
  material_name?: string;
  material_reference?: string;
  material_unit?: string;
  movement_type: MovementType;
  quantity: string;
  previous_stock: string;
  new_stock: string;
  notes?: string;
  created_by?: string;
  created_at: string;
};

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';

export type PurchaseOrderItem = {
  id?: number;
  material: number;
  material_name?: string;
  material_reference?: string;
  material_unit?: string;
  quantity: string;
  unit_price: string;
  received_quantity?: string;
  total_price?: string;
  is_fully_received?: boolean;
};

export type PurchaseOrder = {
  id: number;
  order_number: string;
  supplier: number;
  supplier_name?: string;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  total_amount: string;
  notes?: string;
  items_count?: number;
  created_at: string;
  updated_at: string;
};

export type PurchaseOrderDetail = PurchaseOrder & {
  items: PurchaseOrderItem[];
};

export type DashboardStats = {
  total_materials: number;
  low_stock_count: number;
  total_value: string;
  categories_count: number;
  recent_movements: StockMovement[];
  low_stock_materials: Material[];
};

export type MaterialStatistics = {
  total_count: number;
  low_stock_count: number;
  total_value: string;
  by_category: Array<{
    category__name: string;
    count: number;
    total_value: string;
  }>;
  by_supplier: Array<{
    supplier__name: string;
    count: number;
  }>;
};

// Input types for creating/updating
export type MaterialInput = {
  name: string;
  reference: string;
  category?: number;
  supplier?: number;
  stock: number | string;
  min_stock: number | string;
  unit: UnitType;
  price: number | string;
  description?: string;
};

export type StockMovementInput = {
  material: number;
  movement_type: MovementType;
  quantity: number | string;
  notes?: string;
  created_by?: string;
};

export type PurchaseOrderInput = {
  order_number: string;
  supplier: number;
  status?: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  notes?: string;
  items?: PurchaseOrderItem[];
};

// —— HTTP helpers ——
const get = <T>(p: string) => apiFetch<T>(p);
const post = <T>(p: string, body?: any) => 
  apiFetch<T>(p, { method: 'POST', body: body ? JSON.stringify(body) : undefined });
const put = <T>(p: string, body: any) => 
  apiFetch<T>(p, { method: 'PUT', body: JSON.stringify(body) });
const patch = <T>(p: string, body: any) => 
  apiFetch<T>(p, { method: 'PATCH', body: JSON.stringify(body) });
const del = <T>(p: string) => 
  apiFetch<T>(p, { method: 'DELETE', body: undefined });

// —— Endpoints ——
export const WarehouseApi = {
  // Categories
  categories: {
    list: () => get<Category[]>('/warehouse/categories/'),
    get: (id: number) => get<Category>(`/warehouse/categories/${id}/`),
    create: (payload: Partial<Category>) => post<Category>('/warehouse/categories/', payload),
    update: (id: number, payload: Partial<Category>) => patch<Category>(`/warehouse/categories/${id}/`, payload),
    remove: (id: number) => del<{}>(`/warehouse/categories/${id}/`),
  },

  // Suppliers
  suppliers: {
    list: () => get<Supplier[]>('/warehouse/suppliers/'),
    get: (id: number) => get<Supplier>(`/warehouse/suppliers/${id}/`),
    getMaterials: (id: number) => get<Material[]>(`/warehouse/suppliers/${id}/materials/`),
    getStatistics: () => get<SupplierStatistics>('/warehouse/suppliers/statistics/'), // ✅ NEW
    create: (payload: Partial<Supplier>) => post<Supplier>('/warehouse/suppliers/', payload),
    update: (id: number, payload: Partial<Supplier>) => patch<Supplier>(`/warehouse/suppliers/${id}/`, payload),
    remove: (id: number) => del<{}>(`/warehouse/suppliers/${id}/`),
  },

  // Materials
  materials: {
    list: () => get<Material[]>('/warehouse/materials/'),
    get: (id: number) => get<MaterialDetail>(`/warehouse/materials/${id}/`),
    getLowStock: () => get<Material[]>('/warehouse/materials/low_stock/'),
    getStatistics: () => get<MaterialStatistics>('/warehouse/materials/statistics/'),
    create: (payload: MaterialInput) => post<Material>('/warehouse/materials/', payload),
    update: (id: number, payload: MaterialInput) => patch<Material>(`/warehouse/materials/${id}/`, payload),
    remove: (id: number) => del<{}>(`/warehouse/materials/${id}/`),
    adjustStock: (id: number, data: StockMovementInput) => 
      post<MaterialDetail>(`/warehouse/materials/${id}/adjust_stock/`, data),
  },

  // Stock Movements
  stockMovements: {
    list: () => get<StockMovement[]>('/warehouse/stock-movements/'),
    get: (id: number) => get<StockMovement>(`/warehouse/stock-movements/${id}/`),
    getByMaterial: (materialId: number) => 
      get<StockMovement[]>(`/warehouse/stock-movements/by_material/?material_id=${materialId}`),
    getStatistics: () => get<any>('/warehouse/stock-movements/statistics/'),
    create: (payload: StockMovementInput) => post<StockMovement>('/warehouse/stock-movements/', payload),
  },

  // Purchase Orders
  purchaseOrders: {
    list: () => get<PurchaseOrder[]>('/warehouse/purchase-orders/'),
    get: (id: number) => get<PurchaseOrderDetail>(`/warehouse/purchase-orders/${id}/`),
    getStatistics: () => get<any>('/warehouse/purchase-orders/statistics/'),
    create: (payload: PurchaseOrderInput) => post<PurchaseOrderDetail>('/warehouse/purchase-orders/', payload),
    update: (id: number, payload: Partial<PurchaseOrderInput>) => 
      patch<PurchaseOrderDetail>(`/warehouse/purchase-orders/${id}/`, payload),
    remove: (id: number) => del<{}>(`/warehouse/purchase-orders/${id}/`),
    receive: (id: number, data?: { delivery_date?: string; created_by?: string }) => 
      post<PurchaseOrderDetail>(`/warehouse/purchase-orders/${id}/receive/`, data || {}),
  },

  // Dashboard
  dashboard: {
    getStats: () => get<DashboardStats>('/warehouse/dashboard/stats/'),
  },
};