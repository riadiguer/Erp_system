'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders, useCustomers, useProducts } from '@/lib/features/sales/hooks';
import { SalesApi, type OrderCreateInput } from '@/lib/features/sales/api';
import { PermissionGate } from '@/components/guards/PermissionGate';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error, refresh } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [form, setForm] = useState<OrderCreateInput>({
    customer: '' as any,
    currency: 'DZD',
    notes: '',
    lines: [],
  });

  async function createOrder() {
    if (!form.customer || form.lines.length === 0) return;
    
    setActionLoading('create');
    setActionError(null);
    
    try {
      await SalesApi.orders.create(form);
      setCreating(false);
      setForm({ customer: '' as any, currency: 'DZD', notes: '', lines: [] });
      await refresh();
    } catch (error: any) {
      console.error('Failed to create order:', error);
      
      if (error?.code === 'CONFIG_ERROR') {
        setActionError('Configuration error: API URL not set. Please contact your administrator.');
      } else if (error?.code === 'NETWORK_ERROR') {
        setActionError('Network error: Cannot connect to the server. Please check your connection and try again.');
      } else if (error?.status === 400) {
        setActionError('Invalid order data. Please check all fields and try again.');
      } else if (error?.status === 401) {
        setActionError('Authentication error. Please refresh the page and try again.');
      } else if (error?.status === 403) {
        setActionError('Permission denied. You do not have access to create orders.');
      } else if (error?.status >= 500) {
        setActionError('Server error. Please try again later.');
      } else {
        setActionError(error?.detail || 'Failed to create order. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  }

  async function confirmOrder(id: string) {
    setActionLoading(id);
    setActionError(null);
    
    try {
      console.log(`Attempting to confirm order: ${id}`);
      const result = await SalesApi.orders.confirm(id);
      console.log('Confirm result:', result);
      await refresh();
    } catch (error: any) {
      console.error('Failed to confirm order:', error);
      console.error('Error details:', {
        status: error?.status,
        detail: error?.detail,
        code: error?.code,
        originalError: error?.originalError
      });
      
      if (error?.code === 'CONFIG_ERROR') {
        setActionError('Configuration error: API URL not set. Please contact your administrator.');
      } else if (error?.code === 'NETWORK_ERROR') {
        setActionError('Network error: Cannot connect to the server. Please check your connection and try again.');
      } else if (error?.status === 400) {
        setActionError(error?.detail || 'Cannot confirm this order. It may already be confirmed or have invalid data.');
      } else if (error?.status === 401) {
        setActionError('Authentication error. Please refresh the page and try again.');
      } else if (error?.status === 403) {
        setActionError('Permission denied. You do not have access to confirm orders.');
      } else if (error?.status === 404) {
        setActionError('Order not found or confirm endpoint not available.');
      } else if (error?.status >= 500) {
        setActionError('Server error. Please try again later.');
      } else {
        setActionError(error?.detail || 'Failed to confirm order. Please try again.');
      }
    } finally {
      setActionLoading(null);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'SHIPPED': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Orders Management</h1>
              <p className="text-gray-600">Create, manage and track your sales orders</p>
            </div>
            <PermissionGate need="sales_manage">
              <button 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => setCreating(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create New Order
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Order Creation Form */}
        {creating && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Create New Order
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Details */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Customer *</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={form.customer || ''}
                    onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value as any }))}
                  >
                    <option value="">Select a customer...</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Currency</label>
                  <input 
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={form.currency}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Notes</label>
                  <input 
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="Order notes..."
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} 
                  />
                </div>
              </div>

              {/* Order Lines */}
              <LinesEditor 
                products={products?.filter(p => p.is_active) || []}
                onChange={(lines) => setForm((f) => ({ ...f, lines }))} 
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button 
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => setCreating(false)}
                >
                  Cancel
                </button>
                <button 
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={createOrder}
                  disabled={!form.customer || form.lines.length === 0 || actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Creating...
                    </>
                  ) : (
                    'Create Order'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Action Error */}
        {actionError && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">{actionError}</span>
              <button 
                onClick={() => setActionError(null)}
                className="ml-auto text-red-600 hover:text-red-800"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">Failed to load orders. Please try again.</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Loading orders...</span>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid gap-6">
          {orders?.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 cursor-pointer group"
                 onClick={() => router.push(`/sales/orders/${o.id}`)}>
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-3 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{o.code}</h3>
                      <p className="text-gray-600 font-medium">{o.customer_detail?.name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(o.status)}`}>
                      {o.status}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{o.total} {o.currency}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-sm text-gray-600 mb-1">Items</div>
                    <div className="text-lg font-semibold text-gray-900">{o.lines.length}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-sm text-gray-600 mb-1">Created</div>
                    <div className="text-lg font-semibold text-gray-900">{new Date(o.created_at).toLocaleDateString()}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-sm text-gray-600 mb-1">Time</div>
                    <div className="text-lg font-semibold text-gray-900">{new Date(o.created_at).toLocaleTimeString()}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <PermissionGate need="sales_manage">
                    {o.status === 'DRAFT' && (
                      <button 
                        className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-6 py-3 rounded-xl shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed z-10"
                        onClick={(e) => {
                          e.stopPropagation();
                          confirmOrder(o.id);
                        }}
                        disabled={actionLoading === o.id}
                      >
                        {actionLoading === o.id ? (
                          <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                            Confirming...
                          </>
                        ) : (
                          <>
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                            Confirm Order
                          </>
                        )}
                      </button>
                    )}
                  </PermissionGate>
                  
                  <div className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600 transition-colors">
                    <span className="text-sm font-medium">View Details</span>
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {!loading && orders && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No orders yet</h3>
            <p className="text-gray-600 mb-6">Create your first order to get started with sales management.</p>
            <PermissionGate need="sales_manage">
              <button 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setCreating(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Create First Order
              </button>
            </PermissionGate>
          </div>
        )}
      </div>
    </div>
  );
}

function LinesEditor({
  products,
  onChange,
}: {
  products: { id: string; sku: string; name: string; tax_rate: string; unit_price: string }[];
  onChange: (lines: { product: string; description?: string; quantity: number; unit_price: number; tax_rate?: number }[]) => void;
}) {
  const [rows, setRows] = useState<any[]>([]);

  function addRow() {
    setRows((r) => [...r, { product: '', quantity: 1, unit_price: 0, tax_rate: undefined }]);
  }
  
  function update(i: number, patch: any) {
    setRows((r) => {
      const copy = [...r]; 
      copy[i] = { ...copy[i], ...patch }; 
      return copy;
    });
    onChange(rows.map((row, idx) => (idx === i ? { ...row, ...patch } : row)));
  }
  
  function remove(i: number) {
    const copy = rows.slice(); 
    copy.splice(i, 1); 
    setRows(copy); 
    onChange(copy);
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Order Items
        </h3>
        <button 
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-xl border border-gray-300 shadow-sm transition-colors"
          onClick={addRow}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Add Item
        </button>
      </div>
      
      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="font-medium">No items added yet</p>
            <p className="text-sm">Click "Add Item" to start building your order</p>
          </div>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Product</label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={row.product}
                    onChange={(e) => update(i, { product: e.target.value })}
                  >
                    <option value="">Select product...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                  <input 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="Item description..."
                    value={row.description || ''} 
                    onChange={(e) => update(i, { description: e.target.value })} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantity</label>
                  <input 
                    type="number" 
                    min={0} 
                    step="0.001" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={row.quantity} 
                    onChange={(e) => update(i, { quantity: Number(e.target.value) })} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Unit Price</label>
                  <input 
                    type="number" 
                    min={0} 
                    step="0.01" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={row.unit_price} 
                    onChange={(e) => update(i, { unit_price: Number(e.target.value) })} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Tax %</label>
                  <input 
                    type="number" 
                    min={0} 
                    step="0.01" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="0.00"
                    value={row.tax_rate ?? ''} 
                    onChange={(e) => update(i, { tax_rate: e.target.value ? Number(e.target.value) : undefined })} 
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button 
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
                  onClick={() => remove(i)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Remove Item
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}