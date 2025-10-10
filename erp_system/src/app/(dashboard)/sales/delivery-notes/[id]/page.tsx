'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { PermissionGate } from '@/components/guards/PermissionGate';

// --- types (same as list page) ----------------------------------------------
type DeliveryNoteStatus = 'DRAFT'|'SENT'|'DELIVERED'|'CANCELLED';
type ProductLite = { id: string; sku: string; name: string };
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
type DeliveryLine = { id: string; order_line: string; quantity: string; order_line_detail?: OrderLineLite };
type DeliveryNote = {
  id: string;
  code: string;
  status: DeliveryNoteStatus;
  delivered_at?: string | null;
  created_at: string;
  order: string;
  order_detail?: OrderLite;
  lines: DeliveryLine[];
};

const api = {
  get: async <T,>(url: string) => {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api${url}`, { credentials: 'include' });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      const err: any = new Error('REQ_FAILED'); err.status = r.status; err.detail = (detail as any)?.detail; throw err;
    }
    return r.json() as Promise<T>;
  },
  post: async <T,>(url: string, body?: any) => {
    const r = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api${url}`, {
      method: 'POST', credentials: 'include', headers: { 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    });
    if (!r.ok) {
      const detail = await r.json().catch(() => ({}));
      const err: any = new Error('REQ_FAILED'); err.status = r.status; err.detail = (detail as any)?.detail; throw err;
    }
    return r.json() as Promise<T>;
  },
};

const SalesApi = {
  deliveryNotes: {
    get: (id: string) => api.get<DeliveryNote>(`/sales/delivery-notes/${id}/`),
    addLines: (id: string, lines: { order_line: string; quantity: number }[]) =>
      api.post<DeliveryNote>(`/sales/delivery-notes/${id}/lines/`, { lines }),
    markDelivered: (id: string) => api.post<{ ok: true }>(`/sales/delivery-notes/${id}/mark_delivered/`),
  },
};

export default function DeliveryNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, mutate } = useSWR<DeliveryNote>(`/sales/delivery-notes/${id}/`, () => SalesApi.deliveryNotes.get(id));
  const [rows, setRows] = useState<{ order_line: string; quantity: number }[]>([]);
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const remainingByLine = useMemo(() => {
    const map: Record<string, number> = {};
    if (data?.order_detail?.lines) {
      data.order_detail.lines.forEach(l => {
        const already = Number(l.delivered_qty);
        const ordered = Number(l.quantity);
        // subtract what's already inside this draft delivery note too
        const inThisNote = (data.lines || [])
          .filter(dl => dl.order_line === l.id)
          .reduce((sum, dl) => sum + Number(dl.quantity), 0);
        map[l.id] = Math.max(0, ordered - already - inThisNote);
      });
    }
    return map;
  }, [data]);

  async function doMarkDelivered() {
    if (!data) return;
    setBusy('deliver'); setErrMsg(null);
    try {
      await SalesApi.deliveryNotes.markDelivered(data.id);
      await mutate();
    } catch (e: any) {
      setErrMsg(e?.detail || 'Failed to mark delivered.');
    } finally {
      setBusy(null);
    }
  }

  async function addLines() {
    if (!data || rows.length === 0) return;
    setBusy('add'); setErrMsg(null);
    try {
      await SalesApi.deliveryNotes.addLines(data.id, rows.map(r => ({ order_line: r.order_line, quantity: Number(r.quantity) })));
      setRows([]);
      await mutate();
    } catch (e: any) {
      setErrMsg(e?.detail || 'Failed to add lines.');
    } finally {
      setBusy(null);
    }
  }

  if (error) return <div className="p-6 text-red-600">Failed to load delivery note.</div>;
  if (!data) return <div className="p-6">Loading…</div>;

  const canEdit = data.status === 'DRAFT';

  const badge =
    data.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
    data.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' :
    data.status === 'SENT' ? 'bg-blue-100 text-blue-800 border-blue-200' :
    data.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' :
    'bg-gray-100 text-gray-800 border-gray-200';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link href="/sales/delivery-notes" className="text-sm text-blue-600 hover:underline">← Back to Delivery Notes</Link>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div>
              <h1 className="text-2xl font-bold">{data.code}</h1>
              <div className="text-gray-700">{data.order_detail?.code} — {data.order_detail?.customer_detail?.name}</div>
              <div className="mt-1 flex gap-2 items-center">
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${badge}`}>{data.status}</span>
                <span className="text-xs text-gray-500">Created {new Date(data.created_at).toLocaleString()}</span>
                {data.delivered_at && <span className="text-xs text-gray-500">· Delivered {new Date(data.delivered_at).toLocaleString()}</span>}
              </div>
            </div>

            <PermissionGate need="sales_manage">
              {canEdit && (
                <button
                  onClick={doMarkDelivered}
                  disabled={busy === 'deliver'}
                  className="rounded-xl bg-black text-white px-5 py-2.5 disabled:opacity-50"
                >
                  {busy === 'deliver' ? 'Marking…' : 'Mark delivered'}
                </button>
              )}
            </PermissionGate>
          </div>

          {errMsg && <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">{errMsg}</div>}
        </div>

        {/* Lines table */}
        <section className="rounded-2xl border bg-white overflow-hidden">
          <div className="border-b p-4 font-semibold">Lines</div>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-2 text-left">Product</th>
                  <th className="px-3 py-2 text-left">Description</th>
                  <th className="px-3 py-2 text-right">Qty (this note)</th>
                  <th className="px-3 py-2 text-right">Ordered</th>
                  <th className="px-3 py-2 text-right">Delivered so far</th>
                </tr>
              </thead>
              <tbody>
                {data.lines.map(dl => {
                  const ol = data.order_detail?.lines.find(l => l.id === dl.order_line);
                  return (
                    <tr key={dl.id} className="border-t">
                      <td className="px-3 py-2">{ol?.product_detail?.sku} — {ol?.product_detail?.name}</td>
                      <td className="px-3 py-2">{ol?.description || '—'}</td>
                      <td className="px-3 py-2 text-right">{dl.quantity}</td>
                      <td className="px-3 py-2 text-right">{ol?.quantity}</td>
                      <td className="px-3 py-2 text-right">{ol?.delivered_qty}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Add more lines (only DRAFT) */}
        {canEdit && (
          <section className="rounded-2xl border bg-white p-6 space-y-4">
            <div className="font-semibold">Add lines</div>

            <div className="grid gap-3">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-3 items-end">
                <div className="md:col-span-4">
                  <label className="text-xs text-gray-600">Order line</label>
                  <select
                    className="w-full rounded-lg border px-3 py-2.5"
                    onChange={(e) => {
                      const id = e.target.value;
                      if (!id) return;
                      const max = remainingByLine[id] || 0;
                      if (max <= 0) return;
                      setRows(prev => prev.some(r => r.order_line === id) ? prev : [...prev, { order_line: id, quantity: Math.min(1, max) }]);
                      e.currentTarget.selectedIndex = 0;
                    }}
                  >
                    <option value="">Pick order line…</option>
                    {(data.order_detail?.lines || []).map(ol => {
                      const rem = remainingByLine[ol.id] || 0;
                      return (
                        <option key={ol.id} value={ol.id} disabled={rem <= 0}>
                          {ol.product_detail?.sku} — {ol.product_detail?.name} (remain {rem})
                        </option>
                      );
                    })}
                  </select>
                </div>
              </div>

              {rows.map((r, i) => {
                const ol = data.order_detail?.lines.find(l => l.id === r.order_line);
                const max = remainingByLine[r.order_line] || 0;
                return (
                  <div key={i} className="grid grid-cols-1 md:grid-cols-6 gap-3 items-center border rounded-xl p-3">
                    <div className="md:col-span-4">
                      <div className="font-medium">{ol?.product_detail?.sku} — {ol?.product_detail?.name}</div>
                      <div className="text-xs text-gray-500">Remain: {max}</div>
                    </div>
                    <div>
                      <label className="text-xs text-gray-600">Qty</label>
                      <input
                        type="number" min={0} step="0.001"
                        className="w-full rounded-lg border px-3 py-2.5"
                        value={r.quantity}
                        onChange={(e) => setRows(prev => {
                          const copy = [...prev]; copy[i] = { ...copy[i], quantity: Math.min(Number(e.target.value || 0), max) }; return copy;
                        })}
                      />
                    </div>
                    <button className="text-red-600 hover:text-red-700 text-sm font-semibold" onClick={() => setRows(prev => prev.filter((_, idx) => idx !== i))}>
                      Remove
                    </button>
                  </div>
                );
              })}

              <div className="flex gap-3">
                <button
                  className="rounded-xl bg-black text-white px-5 py-2.5 disabled:opacity-50"
                  disabled={rows.length === 0 || busy === 'add'}
                  onClick={addLines}
                >
                  {busy === 'add' ? 'Adding…' : 'Add to note'}
                </button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
