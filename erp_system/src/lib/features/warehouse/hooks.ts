// lib/api/warehouse/hooks.ts

import useSWR from 'swr';
import { 
  WarehouseApi, 
  type Material, 
  type MaterialDetail,
  type Category, 
  type Supplier, 
  type StockMovement, 
  type PurchaseOrder, 
  type PurchaseOrderDetail,
  type DashboardStats,
  type MaterialStatistics,
  type StockMovementInput,
  type MaterialInput,
  type SupplierStatistics
} from './api';

// ==================== CATEGORIES ====================

export function useCategories() {
  const { data, error, mutate, isValidating } = useSWR<Category[]>(
    '/warehouse/categories/',
    WarehouseApi.categories.list
  );
  return { 
    categories: data || [], 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useCategory(id?: number) {
  const key = id ? `/warehouse/categories/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<Category>(
    key,
    () => WarehouseApi.categories.get(id!)
  );
  return { 
    category: data, 
    loading: !!id && !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

// ==================== SUPPLIERS ====================

export function useSuppliers() {
  const { data, error, mutate, isValidating } = useSWR<Supplier[]>(
    '/warehouse/suppliers/',
    WarehouseApi.suppliers.list
  );
  return { 
    suppliers: data || [], 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useSupplier(id?: number) {
  const key = id ? `/warehouse/suppliers/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<Supplier>(
    key,
    () => WarehouseApi.suppliers.get(id!)
  );
  return { 
    supplier: data, 
    loading: !!id && !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useSupplierMaterials(id?: number) {
  const key = id ? `/warehouse/suppliers/${id}/materials/` : null;
  const { data, error, mutate } = useSWR<Material[]>(
    key,
    () => WarehouseApi.suppliers.getMaterials(id!)
  );
  return { 
    materials: data || [], 
    loading: !!id && !data && !error, 
    error, 
    refresh: mutate 
  };
}

// ==================== MATERIALS ====================

export function useMaterials() {
  const { data, error, mutate, isValidating } = useSWR<Material[]>(
    '/warehouse/materials/',
    WarehouseApi.materials.list
  );
  return { 
    materials: data || [], 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useMaterial(id?: number) {
  const key = id ? `/warehouse/materials/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<MaterialDetail>(
    key,
    () => WarehouseApi.materials.get(id!)
  );
  return { 
    material: data, 
    loading: !!id && !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useLowStockMaterials() {
  const { data, error, mutate, isValidating } = useSWR<Material[]>(
    '/warehouse/materials/low_stock/',
    WarehouseApi.materials.getLowStock
  );
  return { 
    materials: data || [], 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useMaterialStatistics() {
  const { data, error, mutate } = useSWR<MaterialStatistics>(
    '/warehouse/materials/statistics/',
    WarehouseApi.materials.getStatistics
  );
  return { 
    statistics: data, 
    loading: !data && !error, 
    error, 
    refresh: mutate 
  };
}

// ==================== STOCK MOVEMENTS ====================

export function useStockMovements() {
  const { data, error, mutate, isValidating } = useSWR<StockMovement[]>(
    '/warehouse/stock-movements/',
    WarehouseApi.stockMovements.list
  );
  return { 
    movements: data || [], 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useStockMovement(id?: number) {
  const key = id ? `/warehouse/stock-movements/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<StockMovement>(
    key,
    () => WarehouseApi.stockMovements.get(id!)
  );
  return { 
    movement: data, 
    loading: !!id && !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function useStockMovementsByMaterial(materialId?: number) {
  const key = materialId ? `/warehouse/stock-movements/by_material/?material_id=${materialId}` : null;
  const { data, error, mutate } = useSWR<StockMovement[]>(
    key,
    () => WarehouseApi.stockMovements.getByMaterial(materialId!)
  );
  return { 
    movements: data || [], 
    loading: !!materialId && !data && !error, 
    error, 
    refresh: mutate 
  };
}

export function useStockMovementsStatistics() {
  const { data, error, mutate } = useSWR<any>(
    '/warehouse/stock-movements/statistics/',
    WarehouseApi.stockMovements.getStatistics
  );
  return { 
    statistics: data, 
    loading: !data && !error, 
    error, 
    refresh: mutate 
  };
}

// ==================== PURCHASE ORDERS ====================

export function usePurchaseOrders() {
  const { data, error, mutate, isValidating } = useSWR<PurchaseOrder[]>(
    '/warehouse/purchase-orders/',
    WarehouseApi.purchaseOrders.list
  );
  return { 
    orders: data || [], 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function usePurchaseOrder(id?: number) {
  const key = id ? `/warehouse/purchase-orders/${id}/` : null;
  const { data, error, mutate, isValidating } = useSWR<PurchaseOrderDetail>(
    key,
    () => WarehouseApi.purchaseOrders.get(id!)
  );
  return { 
    order: data, 
    loading: !!id && !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

export function usePurchaseOrderStatistics() {
  const { data, error, mutate } = useSWR<any>(
    '/warehouse/purchase-orders/statistics/',
    WarehouseApi.purchaseOrders.getStatistics
  );
  return { 
    statistics: data, 
    loading: !data && !error, 
    error, 
    refresh: mutate 
  };
}

// ==================== DASHBOARD ====================

export function useDashboard() {
  const { data, error, mutate, isValidating } = useSWR<DashboardStats>(
    '/warehouse/dashboard/stats/',
    WarehouseApi.dashboard.getStats
  );
  return { 
    stats: data, 
    loading: !data && !error, 
    error, 
    refresh: mutate, 
    isValidating 
  };
}

// Add this to your hooks.ts file, in the SUPPLIERS section:

export function useSupplierStatistics() {
  const { data, error, mutate, isValidating } = useSWR<SupplierStatistics>(
    '/warehouse/suppliers/statistics/',
    WarehouseApi.suppliers.getStatistics
  );
  return { 
    statistics: data, 
    loading: !data && !error, 
    error, 
    refresh: mutate,
    isValidating 
  };
}