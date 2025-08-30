'use client';

import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { useOrder, useDeliveryNotesByOrder, useInvoicesByOrder } from '@/lib/features/sales/hooks';
import { SalesApi } from '@/lib/features/sales/api';
import { PermissionGate } from '@/components/guards/PermissionGate';

type StatusConfig = {
  bg: string;
  text: string;
  dot: string;
};

const STATUS_CONFIGS: Record<string, StatusConfig> = {
  DRAFT: { 
    bg: 'bg-amber-50 border-amber-200', 
    text: 'text-amber-700',
    dot: 'bg-amber-400'
  },
  CONFIRMED: { 
    bg: 'bg-blue-50 border-blue-200', 
    text: 'text-blue-700',
    dot: 'bg-blue-400'
  },
  PART_DELIV: { 
    bg: 'bg-purple-50 border-purple-200', 
    text: 'text-purple-700',
    dot: 'bg-purple-400'
  },
  DELIVERED: { 
    bg: 'bg-emerald-50 border-emerald-200', 
    text: 'text-emerald-700',
    dot: 'bg-emerald-400'
  },
  CANCELLED: { 
    bg: 'bg-red-50 border-red-200', 
    text: 'text-red-700',
    dot: 'bg-red-400'
  },
};

function StatusBadge({ status }: { status?: string }) {
  const statusConfig: StatusConfig = STATUS_CONFIGS[status ?? ''] || { 
    bg: 'bg-gray-50 border-gray-200', 
    text: 'text-gray-700',
    dot: 'bg-gray-400'
  };

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${statusConfig.bg} ${statusConfig.text}`}>
      <div className={`w-2 h-2 rounded-full ${statusConfig.dot}`}></div>
      {status?.replace('_', ' ')}
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  );
}

function ActionButton({ 
  onClick, 
  disabled, 
  variant = 'secondary', 
  children 
}: { 
  onClick: () => void; 
  disabled?: boolean; 
  variant?: 'primary' | 'secondary'; 
  children: React.ReactNode; 
}) {
  const baseClasses = "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed";
  const variantClasses = variant === 'primary' 
    ? "bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md" 
    : "bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 hover:border-gray-400";

  return (
    <button
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
    >
      {children}
    </button>
  );
}

function Card({ title, children, className = "" }: { title?: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>
      {title && (
        <div className="px-6 py-4 border-b border-gray-100">
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        </div>
      )}
      <div className="p-6">{children}</div>
    </div>
  );
}

function MetricCard({ label, value, currency }: { label: string; value: number | string; currency?: string }) {
  return (
    <div className="bg-gradient-to-br from-gray-50 to-white rounded-lg border border-gray-200 p-4">
      <div className="text-sm font-medium text-gray-600 mb-1">{label}</div>
      <div className="text-2xl font-bold text-gray-900">
        {value} {currency && <span className="text-lg font-medium text-gray-600">{currency}</span>}
      </div>
    </div>
  );
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { order, loading, error, refresh } = useOrder(id);
  const { deliveryNotes } = useDeliveryNotesByOrder(id);
  const { invoices, refresh: refreshInvoices } = useInvoicesByOrder(id);
  const [busy, setBusy] = useState(false);

  async function confirm() {
    if (!order) return;
    setBusy(true);
    try { await SalesApi.orders.confirm(order.id); await refresh(); }
    finally { setBusy(false); }
  }

  async function createInvoiceFromOrder() {
    if (!order) return;
    setBusy(true);
    try {
      const res = await SalesApi.invoices.fromOrder(order.id);
      await refreshInvoices();
      // navigate to the new invoice if you want:
      // router.push(`/sales/invoices/${res.invoice_id}`);
    } finally { setBusy(false); }
  }

  if (loading) return <LoadingSpinner />;
  if (error) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-center">
        <div className="text-red-600 text-lg font-medium mb-2">Failed to load order</div>
        <button 
          onClick={() => refresh()} 
          className="text-blue-600 hover:text-blue-700 text-sm font-medium"
        >
          Try again
        </button>
      </div>
    </div>
  );
  if (!order) return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="text-gray-600 text-lg">Order not found</div>
    </div>
  );

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      {/* Header */}
      <div className="bg-white rounded-xl border border-gray-200 shadow-sm">
        <div className="px-6 py-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold text-gray-900">{order.code}</h1>
                <StatusBadge status={order.status} />
              </div>
              
              <div className="flex items-center gap-4 text-sm text-gray-600">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                  </div>
                  <span className="font-medium">{order.customer_detail?.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-gray-100 rounded-full flex items-center justify-center">
                    <div className="w-2 h-2 bg-gray-600 rounded-full"></div>
                  </div>
                  <span>{new Date(order.created_at).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <PermissionGate need="sales_manage">
                {order.status === 'DRAFT' && (
                  <ActionButton
                    disabled={busy}
                    onClick={confirm}
                    variant="secondary"
                  >
                    {busy ? 'Confirming...' : 'Confirm Order'}
                  </ActionButton>
                )}
              </PermissionGate>

              <PermissionGate need="invoices_manage">
                {order.status !== 'CANCELLED' && (
                  <ActionButton
                    disabled={busy}
                    onClick={createInvoiceFromOrder}
                    variant="primary"
                  >
                    {busy ? 'Creating...' : 'Create Invoice'}
                  </ActionButton>
                )}
              </PermissionGate>
            </div>
          </div>
        </div>
      </div>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard label="Subtotal" value={order.subtotal} currency={order.currency} />
        <MetricCard label="Tax Amount" value={order.tax_amount} currency={order.currency} />
        <MetricCard label="Total Amount" value={order.total} currency={order.currency} />
      </div>

      {/* Order Lines */}
      <Card title="Order Lines">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-semibold text-gray-900">Product</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Quantity</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Unit Price</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Tax %</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Subtotal</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Tax</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Total</th>
                <th className="text-right py-3 px-4 font-semibold text-gray-900">Delivered</th>
              </tr>
            </thead>
            <tbody>
              {order.lines.map((ln, index) => (
                <tr key={ln.id} className={`border-b border-gray-100 hover:bg-gray-50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-gray-25'}`}>
                  <td className="py-4 px-4">
                    <div className="font-medium text-gray-900">{ln.description || `Item ${ln.id}`}</div>
                  </td>
                  <td className="py-4 px-4 text-right font-medium">{ln.quantity}</td>
                  <td className="py-4 px-4 text-right">{ln.unit_price}</td>
                  <td className="py-4 px-4 text-right">{ln.tax_rate}%</td>
                  <td className="py-4 px-4 text-right font-medium">{ln.subtotal}</td>
                  <td className="py-4 px-4 text-right">{ln.tax_amount}</td>
                  <td className="py-4 px-4 text-right font-semibold text-gray-900">{ln.total}</td>
                  <td className="py-4 px-4 text-right">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      ln.delivered_qty >= ln.quantity 
                        ? 'bg-green-100 text-green-800' 
                        : Number(ln.delivered_qty) > 0 
                        ? 'bg-yellow-100 text-yellow-800' 
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {ln.delivered_qty}/{ln.quantity}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Related Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Delivery Notes */}
        <Card title="Delivery Notes">
          {deliveryNotes.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <p className="text-gray-600">No delivery notes yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deliveryNotes.map((dn) => (
                <div key={dn.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div>
                    <div className="font-semibold text-gray-900">{dn.code}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      <span className="capitalize">{dn.status.toLowerCase().replace('_', ' ')}</span>
                      {dn.delivered_at && (
                        <span> • {new Date(dn.delivered_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* Invoices */}
        <Card title="Invoices">
          {invoices.length === 0 ? (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <div className="w-6 h-6 bg-gray-400 rounded"></div>
              </div>
              <p className="text-gray-600">No invoices for this order</p>
            </div>
          ) : (
            <div className="space-y-3">
              {invoices.map((inv) => (
                <div key={inv.id} className="p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div className="font-semibold text-gray-900">{inv.code}</div>
                    <div className="flex gap-2">
                      <PermissionGate need="invoices_manage">
                        {inv.status === 'DRAFT' && (
                          <button
                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                            onClick={async () => { 
                              await SalesApi.invoices.issue(inv.id); 
                              await refreshInvoices(); 
                            }}
                          >
                            Issue
                          </button>
                        )}
                      </PermissionGate>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        View
                      </button>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="capitalize">{inv.status.toLowerCase()}</span>
                    <span> • Total: {inv.total} {inv.currency}</span>
                    <span> • Balance: {inv.balance_due}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}