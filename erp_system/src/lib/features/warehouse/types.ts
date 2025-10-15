// lib/api/warehouse/types.ts

export interface Category {
  id: number;
  name: string;
  description?: string;
  materials_count?: number;
  created_at: string;
  updated_at: string;
}

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

export type UnitType = 'mètre' | 'rouleau' | 'litre' | 'kg' | 'pièce' | 'boîte';

export interface Material {
  id: number;
  name: string;
  reference: string;
  category: number;
  category_name?: string;
  supplier: number;
  supplier_name?: string;
  stock: number;
  min_stock: number;
  unit: UnitType;
  price: number;
  description?: string;
  is_low_stock: boolean;
  stock_percentage: number;
  stock_status: 'Critique' | 'Bas' | 'Normal';
  total_value: number;
  created_at: string;
  updated_at: string;
}

export interface MaterialDetail extends Material {
  recent_movements?: StockMovement[];
}

export interface MaterialFormData {
  name: string;
  reference: string;
  category?: number;
  supplier?: number;
  stock: number;
  min_stock: number;
  unit: UnitType;
  price: number;
  description?: string;
}

export type MovementType = 'in' | 'out' | 'adjustment';

export interface StockMovement {
  id: number;
  material: number;
  material_name?: string;
  material_reference?: string;
  material_unit?: string;
  movement_type: MovementType;
  quantity: number;
  previous_stock: number;
  new_stock: number;
  notes?: string;
  created_by?: string;
  created_at: string;
}

export interface StockMovementCreate {
  material: number;
  movement_type: MovementType;
  quantity: number;
  notes?: string;
  created_by?: string;
}

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
  id?: number;
  material: number;
  material_name?: string;
  material_reference?: string;
  material_unit?: string;
  quantity: number;
  unit_price: number;
  received_quantity?: number;
  total_price?: number;
  is_fully_received?: boolean;
}

export interface PurchaseOrder {
  id: number;
  order_number: string;
  supplier: number;
  supplier_name?: string;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  total_amount: number;
  notes?: string;
  items_count?: number;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderFormData {
  order_number: string;
  supplier: number;
  status: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date?: string;
  actual_delivery_date?: string;
  notes?: string;
  items?: PurchaseOrderItem[];
}

export interface DashboardStats {
  total_materials: number;
  low_stock_count: number;
  total_value: number;
  categories_count: number;
  recent_movements: StockMovement[];
  low_stock_materials: Material[];
}

export interface MaterialStatistics {
  total_count: number;
  low_stock_count: number;
  total_value: number;
  by_category: Array<{
    category__name: string;
    count: number;
    total_value: number;
  }>;
  by_supplier: Array<{
    supplier__name: string;
    count: number;
  }>;
}

export interface StockMovementStatistics {
  total_movements: number;
  entries: number;
  exits: number;
  adjustments: number;
  recent_movements: StockMovement[];
}

export interface PurchaseOrderStatistics {
  total_orders: number;
  by_status: Array<{
    status: PurchaseOrderStatus;
    count: number;
  }>;
  total_amount: number;
  pending_orders: number;
}

// Pagination
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

// API Query params
export interface QueryParams {
  search?: string;
  ordering?: string;
  page?: number;
  page_size?: number;
  category?: number;
  supplier?: number;
  unit?: UnitType;
  status?: PurchaseOrderStatus;
  movement_type?: MovementType;
}

// API Error
export interface APIError {
  message: string;
  errors?: Record<string, string[]>;
}