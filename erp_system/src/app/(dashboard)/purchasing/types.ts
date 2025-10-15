// ========================================
// DEMAND REQUESTS (Internal Requests)
// ========================================

export type Priority = 'Basse' | 'Moyenne' | 'Haute';
export type DemandStatus = 'Brouillon' | 'Soumise' | 'Approuvée' | 'Rejetée' | 'Convertie' | 'Annulée';

export interface Material {
  id: string;
  name: string;
  uom: string;
  defaultSupplier?: string;
  lastPrice?: number;
}

export interface DemandLine {
  id: string;
  materialId: string;
  materialName: string;
  uom: string;
  quantity: number;
  suggestedSupplier?: string;
  estimatedPrice?: number;
  neededDate?: string;
}

export interface DemandRequest {
  id: string;               // UUID interne
  number: string;           // ex: "DA-2025-0001"
  date: string;             // ISO yyyy-mm-dd
  site: string;
  requesterId: string;
  requesterName: string;
  priority: Priority;
  category: string;
  neededDate?: string;
  comment?: string;
  status: DemandStatus;
  lines: DemandLine[];
  attachments?: { name: string; url?: string }[];
  createdAt: string;
  updatedAt: string;
}

// ========================================
// PURCHASE ORDERS (Backend Integration)
// ========================================

export type PurchaseOrderStatus = 'draft' | 'sent' | 'confirmed' | 'received' | 'cancelled';

export interface PurchaseOrderItem {
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
}

export interface PurchaseOrder {
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
}

export interface PurchaseOrderDetail extends PurchaseOrder {
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderInput {
  order_number: string;
  supplier: number;
  status?: PurchaseOrderStatus;
  order_date: string;
  expected_delivery_date?: string | null;
  actual_delivery_date?: string | null;
  notes?: string;
  items?: PurchaseOrderItem[];
}

// ========================================
// INVOICES
// ========================================

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export interface Invoice {
  id: string;
  invoiceNumber: string;
  purchaseOrderId?: string;
  purchaseOrderNumber?: string;
  supplierId: string;
  supplierName: string;
  invoiceDate: string;
  dueDate: string;
  status: InvoiceStatus;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  items: InvoiceItem[];
  notes?: string;
  attachments?: { name: string; url?: string }[];
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

// ========================================
// PAYMENTS
// ========================================

export type PaymentMethod = 'cash' | 'bank' | 'check' | 'credit';
export type PaymentStatus = 'pending' | 'completed' | 'cancelled';

export interface Payment {
  id: string;
  paymentNumber: string;
  invoiceId: string;
  invoiceNumber: string;
  supplierId: string;
  supplierName: string;
  paymentDate: string;
  amount: number;
  method: PaymentMethod;
  status: PaymentStatus;
  reference?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// ========================================
// RECEPTIONS
// ========================================

export type ReceptionStatus = 'partial' | 'complete' | 'with_issues';

export interface Reception {
  id: string;
  receptionNumber: string;
  purchaseOrderId: number;
  purchaseOrderNumber: string;
  receptionDate: string;
  status: ReceptionStatus;
  items: ReceptionItem[];
  notes?: string;
  receivedBy: string;
  createdAt: string;
}

export interface ReceptionItem {
  id: string;
  materialId: number;
  materialName: string;
  orderedQuantity: number;
  receivedQuantity: number;
  acceptedQuantity: number;
  rejectedQuantity: number;
  notes?: string;
}

// ========================================
// RETURNS
// ========================================

export type ReturnReason = 'damaged' | 'wrong_item' | 'excess' | 'quality_issue' | 'other';
export type ReturnStatus = 'pending' | 'approved' | 'completed' | 'rejected';

export interface Return {
  id: string;
  returnNumber: string;
  purchaseOrderId?: number;
  receptionId?: string;
  supplierId: number;
  supplierName: string;
  returnDate: string;
  reason: ReturnReason;
  status: ReturnStatus;
  items: ReturnItem[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReturnItem {
  id: string;
  materialId: number;
  materialName: string;
  quantity: number;
  reason: string;
}

// ========================================
// STATISTICS & DASHBOARD
// ========================================

export interface PurchasingStatistics {
  totalOrders: number;
  pendingOrders: number;
  totalSpent: number;
  pendingInvoices: number;
  overdueInvoices: number;
  averageDeliveryTime: number;
}

// ========================================
// FILTERS
// ========================================

export interface PurchaseOrderFilters {
  status?: PurchaseOrderStatus;
  supplier?: number;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export interface InvoiceFilters {
  status?: InvoiceStatus;
  supplier?: string;
  dateFrom?: string;
  dateTo?: string;
  overdue?: boolean;
}