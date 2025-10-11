'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { SalesApi } from '@/lib/features/sales/api';
import { useDeliveryNotes, useOrder, useOrders } from '@/lib/features/sales/hooks';

// ---- Types ----------------------------------------------
type DeliveryNoteStatus = 'DRAFT' | 'SENT' | 'DELIVERED' | 'CANCELLED';

type ProductLite = { 
  id: string; 
  sku: string; 
  name: string; 
};

type OrderLineLite = {
  id: string;
  product: string;
  product_detail?: ProductLite;
  description?: string;
  quantity: string;
  delivered_qty: string;
};

type OrderLite = {
  id: string;
  code: string;
  customer_detail?: { name: string };
  currency: string;
  lines: OrderLineLite[];
};

type DeliveryLine = { 
  id: string; 
  order_line: string; 
  quantity: string; 
};

type DeliveryNote = {
  id: string;
  code: string;
  status: DeliveryNoteStatus;
  created_at: string;
  order: string;
  order_detail?: OrderLite;
  lines: DeliveryLine[];
};

// ---- UI ---------------------------------------------------------------------
export default function DeliveryNotesPage() {
  const router = useRouter();
  const { notes, loading, error, refresh } = useDeliveryNotes();
  const { orders } = useOrders();

  const [creating, setCreating] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const { order } = useOrder(orderId);
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Filter only CONFIRMED orders with remaining quantities
  const confirmedOrders = useMemo(() => {
    if (!orders) return [];
    return orders.filter(o => 
      o.status === 'CONFIRMED' || o.status === 'PART_DELIV'
    );
  }, [orders]);

  // Reset quantities when order changes
  useEffect(() => {
    if (order?.lines) {
      const initialQty: Record<string, number> = {};
      order.lines.forEach(line => {
        const remaining = Number(line.quantity) - Number(line.delivered_qty);
        if (remaining > 0) {
          initialQty[line.id] = Math.min(1, remaining);
        }
      });
      setQuantities(initialQty);
    } else {
      setQuantities({});
    }
    setErr(null);
  }, [order]);

  const remainingByLine = useMemo(() => {
    const map: Record<string, number> = {};
    if (order?.lines) {
      order.lines.forEach(l => {
        const remaining = Number(l.quantity) - Number(l.delivered_qty);
        map[l.id] = Math.max(0, remaining);
      });
    }
    return map;
  }, [order]);

  function updateQuantity(lineId: string, value: number) {
    const max = remainingByLine[lineId] || 0;
    setQuantities(prev => ({
      ...prev,
      [lineId]: Math.min(Math.max(0, value), max)
    }));
  }

  function toggleLine(lineId: string) {
    setQuantities(prev => {
      const copy = { ...prev };
      if (lineId in copy) {
        delete copy[lineId];
      } else {
        const max = remainingByLine[lineId] || 0;
        copy[lineId] = Math.min(1, max);
      }
      return copy;
    });
  }

  async function createNote() {
    if (!orderId || Object.keys(quantities).length === 0) return;
    
    // Validate order is loaded
    if (!order || !order.lines || order.id !== orderId) {
      setErr('Order data not loaded. Please wait and try again.');
      return;
    }
    
    // Build lines array only for selected items with quantity > 0
    const lines = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([lineId, qty]) => ({
        order_line: lineId,
        quantity: qty
      }));

    if (lines.length === 0) {
      setErr('Please select at least one line with quantity > 0');
      return;
    }
    
    // Validate quantities
    for (const line of lines) {
      const max = remainingByLine[line.order_line] || 0;
      if (line.quantity > max) {
        setErr(`Quantity exceeds remaining amount for one or more items`);
        return;
      }
    }
    
    setBusy(true); 
    setErr(null);
    
    try {
      const payload = {
        order: orderId,
        lines: lines
      };
      
      console.log('Creating delivery note with payload:', payload);
      
      const dn = await SalesApi.deliveryNotes.create(payload);
      
      console.log('Delivery note created successfully:', dn);
      
      setCreating(false);
      setOrderId('');
      setQuantities({});
      await refresh();
      router.push(`/sales/delivery-notes/${dn.id}`);
    } catch (e: any) {
      console.error('Delivery note creation failed:', e);
      
      let errorMsg = 'Failed to create delivery note.';
      
      if (e?.response) {
        try {
          const data = await e.response.json();
          console.log('API error response:', data);
          errorMsg = data?.lines?.[0] || data?.detail || data?.error || data?.message || JSON.stringify(data);
        } catch (jsonErr) {
          try {
            const text = await e.response.text();
            errorMsg = text || errorMsg;
          } catch (textErr) {
            // Ignore
          }
        }
      } else if (e?.detail) {
        errorMsg = typeof e.detail === 'string' ? e.detail : JSON.stringify(e.detail);
      } else if (e?.message) {
        errorMsg = e.message;
      } else if (typeof e === 'string') {
        errorMsg = e;
      }
      
      setErr(errorMsg);
    } finally {
      setBusy(false);
    }
  }

  const statusColor = (s: string) =>
    s === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
    : s === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200'
    : s === 'SENT' ? 'bg-blue-100 text-blue-800 border-blue-200'
    : s === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200'
    : 'bg-gray-100 text-gray-800 border-gray-200';

  // Handle loading states
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border bg-white p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <div className="mt-3 text-gray-600">Loading…</div>
          </div>
        </div>
      </div>
    );
  }

  // Handle error states
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            Failed to load delivery notes: {error.message || error}
          </div>
        </div>
      </div>
    );
  }

  const selectedLines = order?.lines.filter(l => l.id in quantities) || [];
  const availableLines = order?.lines.filter(l => remainingByLine[l.id] > 0) || [];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Delivery Notes</h1>
              <p className="text-gray-600">Prepare and track deliveries from confirmed orders</p>
            </div>
            <PermissionGate need="sales_manage">
              <button
                className="inline-flex items-center gap-2 bg-black text-white px-5 py-3 rounded-xl hover:bg-neutral-800 transition-colors"
                onClick={() => setCreating(true)}
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M12 6v12m6-6H6"/>
                </svg>
                New Delivery Note
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Create panel */}
        {creating && (
          <div className="bg-white rounded-2xl shadow border border-gray-200 overflow-hidden">
            <div className="p-6 space-y-6">
              {/* Order Selection */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Select Confirmed Order *
                </label>
                <select
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  value={orderId}
                  onChange={(e) => setOrderId(e.target.value)}
                >
                  <option value="">Choose an order to deliver…</option>
                  {confirmedOrders.map((o) => (
                    <option key={o.id} value={o.id}>
                      {o.code} — {o.customer_detail?.name || 'Unknown Customer'}
                    </option>
                  ))}
                </select>
                {orderId && confirmedOrders.length === 0 && (
                  <p className="mt-2 text-sm text-amber-600">
                    No confirmed orders available for delivery
                  </p>
                )}
              </div>

              {/* Order Lines */}
              {orderId && order && (
                <>
                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">
                      Order Lines - Select items to deliver
                    </h3>
                    
                    {availableLines.length === 0 ? (
                      <div className="text-center py-8 text-gray-500">
                        <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <p className="font-medium">All items fully delivered</p>
                        <p className="text-sm mt-1">This order has no remaining quantities to deliver</p>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {order.lines.map(line => {
                          const remaining = remainingByLine[line.id] || 0;
                          const isSelected = line.id in quantities;
                          const currentQty = quantities[line.id] || 0;
                          
                          if (remaining <= 0) return null;

                          return (
                            <div 
                              key={line.id}
                              className={`border rounded-xl p-4 transition-all ${
                                isSelected 
                                  ? 'border-blue-500 bg-blue-50' 
                                  : 'border-gray-200 hover:border-gray-300'
                              }`}
                            >
                              <div className="flex items-start gap-4">
                                <div className="flex items-center pt-1">
                                  <input
                                    type="checkbox"
                                    checked={isSelected}
                                    onChange={() => toggleLine(line.id)}
                                    className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-2 focus:ring-blue-500"
                                  />
                                </div>
                                
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <div className="font-semibold text-gray-900">
                                        {line.product_detail?.sku || 'Unknown SKU'}
                                      </div>
                                      <div className="text-sm text-gray-600 mt-0.5">
                                        {line.product_detail?.name || 'Unknown Product'}
                                      </div>
                                      {line.description && (
                                        <div className="text-xs text-gray-500 mt-1">
                                          {line.description}
                                        </div>
                                      )}
                                    </div>
                                    
                                    <div className="text-right flex-shrink-0">
                                      <div className="text-sm text-gray-600">Ordered</div>
                                      <div className="font-semibold">{line.quantity}</div>
                                    </div>
                                    
                                    <div className="text-right flex-shrink-0">
                                      <div className="text-sm text-gray-600">Delivered</div>
                                      <div className="font-semibold">{line.delivered_qty}</div>
                                    </div>
                                    
                                    <div className="text-right flex-shrink-0">
                                      <div className="text-sm text-amber-600">Remaining</div>
                                      <div className="font-bold text-amber-700">{remaining}</div>
                                    </div>
                                  </div>

                                  {isSelected && (
                                    <div className="mt-3 flex items-center gap-3">
                                      <label className="text-sm font-medium text-gray-700 min-w-[120px]">
                                        Quantity to deliver:
                                      </label>
                                      <input
                                        type="number"
                                        min={0}
                                        max={remaining}
                                        step="0.001"
                                        value={currentQty}
                                        onChange={(e) => updateQuantity(line.id, Number(e.target.value))}
                                        className="w-32 rounded-lg border border-gray-300 px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                      />
                                      <span className="text-sm text-gray-500">
                                        (max: {remaining})
                                      </span>
                                    </div>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {selectedLines.length > 0 && (
                    <div className="border-t pt-4">
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-2 text-blue-900">
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                          <span className="font-semibold">
                            {selectedLines.length} item{selectedLines.length !== 1 ? 's' : ''} selected for delivery
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
                  <strong>Error:</strong> {err}
                </div>
              )}

              <div className="flex gap-3 pt-2 border-t">
                <button 
                  className="rounded-xl border border-gray-300 px-5 py-2.5 hover:bg-gray-50 transition-colors" 
                  onClick={() => { 
                    setCreating(false); 
                    setOrderId(''); 
                    setQuantities({});
                    setErr(null);
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-black text-white px-6 py-2.5 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={!orderId || selectedLines.length === 0 || busy}
                  onClick={createNote}
                  type="button"
                >
                  {busy ? 'Creating…' : `Create Delivery Note (${selectedLines.length} items)`}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* List */}
        <div className="grid gap-6">
          {(notes || []).map(n => (
            <div 
              key={n.id}
              className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-shadow cursor-pointer"
              onClick={() => router.push(`/sales/delivery-notes/${n.id}`)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  router.push(`/sales/delivery-notes/${n.id}`);
                }
              }}
            >
              <div className="p-6 flex items-center justify-between">
                <div>
                  <div className="text-xl font-bold">{n.code}</div>
                  <div className="text-sm text-gray-600">
                    {n.order_detail?.code || 'Unknown Order'} — {n.order_detail?.customer_detail?.name || 'Unknown Customer'}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`px-3 py-1 rounded-full border text-sm font-semibold ${statusColor(n.status)}`}>
                    {n.status}
                  </span>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Created</div>
                    <div className="font-semibold">
                      {new Date(n.created_at).toLocaleString()}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!loading && (!notes || notes.length === 0) && (
          <div className="rounded-2xl border bg-white p-12 text-center text-gray-600">
            <svg className="w-16 h-16 mx-auto text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-lg font-medium">No delivery notes yet</p>
            <p className="text-sm text-gray-500 mt-1">Create your first delivery note to get started</p>
          </div>
        )}
      </div>
    </div>
  );
}