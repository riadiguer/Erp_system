'use client';

import { JSXElementConstructor, Key, ReactElement, ReactNode, ReactPortal, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { SalesApi } from '@/lib/features/sales/api';
import { useDeliveryNotes, useOrder, useOrdersLite } from '@/lib/features/sales/hooks';

// ---- API contracts (expected) ----------------------------------------------
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
  quantity: string;         // ordered
  delivered_qty: string;    // already delivered across BLs
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

// Remove unused API object since we're using SalesApi

// ---- UI ---------------------------------------------------------------------
export default function DeliveryNotesPage() {
  const router = useRouter();
  const { notes, loading, error, refresh } = useDeliveryNotes();
  const { orders } = useOrdersLite(); // Assuming this returns an object with orders array

  const [creating, setCreating] = useState(false);
  const [orderId, setOrderId] = useState<string>('');
  const { order } = useOrder(orderId); // Assuming this returns an object with order
  const [rows, setRows] = useState<{ order_line: string; quantity: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => { 
    setRows([]); 
  }, [orderId]);

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

  function addRow(olId: string) {
    if (!olId) return;
    const exists = rows.some(r => r.order_line === olId);
    if (!exists) {
      const max = remainingByLine[olId] || 0;
      setRows(r => [...r, { order_line: olId, quantity: Math.min(1, max) }]);
    }
  }

  function updateRow(i: number, patch: Partial<{ quantity: number }>) {
    setRows(prev => {
      const copy = [...prev];
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
  }

  function removeRow(i: number) {
    setRows(prev => prev.filter((_, idx) => idx !== i));
  }

  async function createNote() {
    if (!orderId || rows.length === 0) return;
    setBusy(true); 
    setErr(null);
    
    try {
      const dn = await SalesApi.deliveryNotes.create({
        order: orderId,
        lines: rows.map(r => ({ 
          order_line: r.order_line, 
          quantity: Number(r.quantity) 
        })),
      });
      setCreating(false);
      setOrderId('');
      setRows([]);
      await refresh();
      router.push(`/sales/delivery-notes/${dn.id}`);
    } catch (e: any) {
      setErr(e?.detail || 'Failed to create delivery note.');
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
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Order *</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={orderId}
                    onChange={(e) => setOrderId(e.target.value)}
                  >
                    <option value="">Select order…</option>
                    {(orders || []).map((o: OrderLite) => (
                      <option key={o.id} value={o.id}>
                        {o.code} — {o.customer_detail?.name || 'Unknown Customer'}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Add lines</label>
                  <div className="flex gap-2">
                    <select
                      className="flex-1 rounded-xl border border-gray-300 px-4 py-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      onChange={(e) => { 
                        addRow(e.target.value); 
                        e.currentTarget.selectedIndex = 0; 
                      }}
                      disabled={!orderId}
                    >
                      <option value="">Pick an order line…</option>
                      {(order?.lines || []).map(ol => {
                        const rem = remainingByLine[ol.id] || 0;
                        return (
                          <option key={ol.id} value={ol.id} disabled={rem <= 0}>
                            {ol.product_detail?.sku || 'Unknown SKU'} — {ol.product_detail?.name || 'Unknown Product'} (remain {rem})
                          </option>
                        );
                      })}
                    </select>
                  </div>
                </div>
              </div>

              {/* Rows */}
              <div className="space-y-3">
                {rows.length === 0 ? (
                  <div className="text-sm text-gray-500 italic">No lines added yet.</div>
                ) : (
                  rows.map((r, i) => {
                    const ol = order?.lines.find(l => l.id === r.order_line);
                    const max = remainingByLine[r.order_line] || 0;
                    return (
                      <div key={`${r.order_line}-${i}`} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center border border-gray-200 rounded-xl p-3">
                        <div className="md:col-span-3">
                          <div className="font-medium">
                            {ol?.product_detail?.sku || 'Unknown SKU'} — {ol?.product_detail?.name || 'Unknown Product'}
                          </div>
                          <div className="text-xs text-gray-500">Remain: {max}</div>
                        </div>
                        <div>
                          <label className="block text-xs text-gray-600 mb-1">Qty</label>
                          <input
                            type="number" 
                            min={0} 
                            max={max}
                            step="0.001"
                            className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            value={r.quantity}
                            onChange={(e) => {
                              const value = Number(e.target.value || 0);
                              updateRow(i, { quantity: Math.min(Math.max(0, value), max) });
                            }}
                          />
                        </div>
                        <div className="flex justify-center">
                          <button 
                            className="text-red-600 hover:text-red-700 text-sm font-semibold px-3 py-1 rounded hover:bg-red-50 transition-colors" 
                            onClick={() => removeRow(i)}
                            type="button"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>

              {err && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
                  <strong>Error:</strong> {err}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  className="rounded-xl border border-gray-300 px-5 py-2.5 hover:bg-gray-50 transition-colors" 
                  onClick={() => { 
                    setCreating(false); 
                    setOrderId(''); 
                    setRows([]); 
                    setErr(null);
                  }}
                  type="button"
                >
                  Cancel
                </button>
                <button
                  className="rounded-xl bg-black text-white px-6 py-2.5 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  disabled={!orderId || rows.length === 0 || busy}
                  onClick={createNote}
                  type="button"
                >
                  {busy ? 'Creating…' : 'Create Delivery Note'}
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

