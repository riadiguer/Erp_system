import { DemandRequest, PurchaseOrder, PurchaseOrderDetail, PurchaseOrderInput } from "./types";

// ========================================
// DEMAND REQUESTS (LocalStorage)
// ========================================

const KEY = "erp.purchasing.demands.v1";

function readAll(): DemandRequest[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(KEY) || "[]");
  } catch {
    return [];
  }
}

function writeAll(items: DemandRequest[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(KEY, JSON.stringify(items));
}

export function listDemands(): DemandRequest[] {
  return readAll().sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

function pad(n: number, size = 4) {
  return String(n).padStart(size, "0");
}

function year() {
  return new Date().getFullYear();
}

export function nextDemandNumber(): string {
  const items = readAll();
  const y = year();
  const sameYear = items.filter((d) => d.number.startsWith(`DA-${y}-`));
  const n = sameYear.length + 1;
  return `DA-${y}-${pad(n)}`;
}

export function createDemand(
  payload: Omit<DemandRequest, "id" | "number" | "status" | "createdAt" | "updatedAt">
): DemandRequest {
  const now = new Date().toISOString();
  const item: DemandRequest = {
    ...payload,
    id: crypto.randomUUID(),
    number: nextDemandNumber(),
    status: "Brouillon",
    createdAt: now,
    updatedAt: now,
  };
  const all = readAll();
  all.push(item);
  writeAll(all);
  return item;
}

export function updateDemand(id: string, patch: Partial<DemandRequest>): DemandRequest | null {
  const all = readAll();
  const idx = all.findIndex((d) => d.id === id);
  if (idx === -1) return null;
  all[idx] = { ...all[idx], ...patch, updatedAt: new Date().toISOString() };
  writeAll(all);
  return all[idx];
}

export function deleteDemand(id: string) {
  writeAll(readAll().filter((d) => d.id !== id));
}

export function getDemand(id: string) {
  return readAll().find((d) => d.id === id) || null;
}

export function submitDemand(id: string) {
  return updateDemand(id, { status: "Soumise" });
}

export function approveDemand(id: string) {
  return updateDemand(id, { status: "Approuvée" });
}

export function rejectDemand(id: string) {
  return updateDemand(id, { status: "Rejetée" });
}

export function cancelDemand(id: string) {
  return updateDemand(id, { status: "Annulée" });
}

// ========================================
// PURCHASE ORDERS (Backend API)
// ========================================

// Import the existing warehouse API
import { WarehouseApi } from "@/lib/features/warehouse/api";

// Re-export for convenience
export const PurchaseOrderApi = {
  /**
   * List all purchase orders
   */
  list: () => WarehouseApi.purchaseOrders.list(),

  /**
   * Get a single purchase order with details
   */
  get: (id: number) => WarehouseApi.purchaseOrders.get(id),

  /**
   * Create a new purchase order
   */
  create: (payload: PurchaseOrderInput) => WarehouseApi.purchaseOrders.create(payload),

  /**
   * Update an existing purchase order
   */
  update: (id: number, payload: Partial<PurchaseOrderInput>) =>
    WarehouseApi.purchaseOrders.update(id, payload),

  /**
   * Delete a purchase order
   */
  delete: (id: number) => WarehouseApi.purchaseOrders.remove(id),

  /**
   * Mark a purchase order as received (updates stock)
   */
  receive: (id: number, data?: { delivery_date?: string; created_by?: string }) =>
    WarehouseApi.purchaseOrders.receive(id, data),

  /**
   * Get purchase order statistics
   */
  statistics: () => WarehouseApi.purchaseOrders.getStatistics(),
};

// ========================================
// HELPER: Convert Demand to Purchase Order
// ========================================

/**
 * Convert an approved demand request to a purchase order
 */
export async function convertDemandToPurchaseOrder(
  demand: DemandRequest,
  supplierId: number
): Promise<PurchaseOrderDetail> {
  // Generate order number
  const year = new Date().getFullYear();
  const orderNumber = `BC-${year}-${pad(Math.floor(Math.random() * 10000))}`;

  // Map demand lines to purchase order items
  // Note: You'll need to map your demand materials to actual material IDs from the backend
  const items = demand.lines.map((line) => ({
    material: parseInt(line.materialId), // Assumes materialId is numeric
    quantity: line.quantity.toString(),
    unit_price: (line.estimatedPrice || 0).toString(),
  }));

  const purchaseOrder = await PurchaseOrderApi.create({
    order_number: orderNumber,
    supplier: supplierId,
    order_date: new Date().toISOString().split("T")[0],
    expected_delivery_date: demand.neededDate || null,
    notes: demand.comment,
    items,
  });

  // Update demand status to "Convertie"
  updateDemand(demand.id, { status: "Convertie" });

  return purchaseOrder;
}

// ========================================
// STATISTICS
// ========================================

/**
 * Get demand request statistics
 */
export function getDemandStatistics() {
  const demands = readAll();
  return {
    total: demands.length,
    brouillon: demands.filter((d) => d.status === "Brouillon").length,
    soumise: demands.filter((d) => d.status === "Soumise").length,
    approuvee: demands.filter((d) => d.status === "Approuvée").length,
    rejetee: demands.filter((d) => d.status === "Rejetée").length,
    convertie: demands.filter((d) => d.status === "Convertie").length,
    annulee: demands.filter((d) => d.status === "Annulée").length,
  };
}

/**
 * Get combined purchasing statistics
 */
export async function getPurchasingStatistics() {
  const demandStats = getDemandStatistics();
  const orderStats = await PurchaseOrderApi.statistics();

  return {
    demands: demandStats,
    orders: orderStats,
  };
}