'use client';

import { useState } from 'react';
import { useInvoices, useOrders } from '@/lib/features/sales/hooks';
import { SalesApi } from '@/lib/features/sales/api';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { 
  FileText, 
  Plus, 
  Send, 
  DollarSign, 
  Calendar, 
  User, 
  AlertCircle,
  CheckCircle,
  Clock,
  Loader2,
  Receipt
} from 'lucide-react';

const statusConfig = {
  DRAFT: { icon: Clock, color: 'bg-yellow-50 text-yellow-700 border-yellow-200', label: 'Draft' },
  ISSUED: { icon: CheckCircle, color: 'bg-green-50 text-green-700 border-green-200', label: 'Issued' },
  PAID: { icon: CheckCircle, color: 'bg-blue-50 text-blue-700 border-blue-200', label: 'Paid' },
  OVERDUE: { icon: AlertCircle, color: 'bg-red-50 text-red-700 border-red-200', label: 'Overdue' },
  CANCELLED: { icon: AlertCircle, color: 'bg-gray-50 text-gray-700 border-gray-200', label: 'Cancelled' },
};

export default function InvoicesPage() {
  const { invoices, loading, error, refresh } = useInvoices();
  const { orders } = useOrders();
  const [ord, setOrd] = useState<string>('');
  const [isCreating, setIsCreating] = useState(false);
  const [processingIds, setProcessingIds] = useState<Set<string>>(new Set());

  async function createFromOrder() {
    if (!ord) return;
    setIsCreating(true);
    try {
      await SalesApi.invoices.fromOrder(ord);
      setOrd('');
      await refresh();
    } finally {
      setIsCreating(false);
    }
  }

  async function issue(id: string) {
    setProcessingIds(prev => new Set([...prev, id]));
    try {
      await SalesApi.invoices.issue(id);
      await refresh();
    } finally {
      setProcessingIds(prev => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD'
    }).format(amount);
  };

  const getStatusInfo = (status: string) => {
    return statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT;
  };

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
            <Receipt className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-800">Invoices</h1>
            <p className="text-sm text-slate-600">Manage your billing and payments</p>
          </div>
        </div>

        <PermissionGate need="invoices_manage">
          <div className="flex items-center gap-3 p-4 bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex items-center gap-2 flex-1 min-w-0">
              <FileText className="w-4 h-4 text-slate-500 flex-shrink-0" />
              <select 
                className="flex-1 bg-transparent border-none outline-none text-sm text-slate-700 min-w-0"
                value={ord} 
                onChange={(e) => setOrd(e.target.value)}
              >
                <option value="">Select order to invoice...</option>
                {orders?.filter(o => o.status !== 'CANCELLED').map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.code} — {o.customer_detail?.name}
                  </option>
                ))}
              </select>
            </div>
            <button 
              className="flex items-center gap-2 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white px-4 py-2 rounded-xl font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 shadow-lg"
              onClick={createFromOrder}
              disabled={!ord || isCreating}
            >
              {isCreating ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Plus className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">Create</span>
            </button>
          </div>
        </PermissionGate>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <div>
            <p className="font-medium">Failed to load invoices</p>
            <p className="text-sm opacity-90">Please try refreshing the page</p>
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3 text-slate-600">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span>Loading invoices...</span>
          </div>
        </div>
      )}

      {/* Invoices Grid */}
      {!loading && invoices && (
        <div className="grid gap-4">
          {invoices.length === 0 ? (
            <div className="text-center py-12 bg-white/50 rounded-2xl border border-slate-200">
              <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Receipt className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-medium text-slate-800 mb-2">No invoices yet</h3>
              <p className="text-slate-600 mb-4">Create your first invoice from an existing order</p>
              <PermissionGate need="invoices_manage">
                <p className="text-sm text-slate-500">Select an order above to get started</p>
              </PermissionGate>
            </div>
          ) : (
            invoices.map((inv) => {
              const statusInfo = getStatusInfo(inv.status);
              const StatusIcon = statusInfo.icon;
              const isProcessing = processingIds.has(inv.id);

              return (
                <div key={inv.id} className="bg-white/80 backdrop-blur-sm rounded-2xl border border-slate-200 p-6 shadow-sm hover:shadow-md transition-all duration-200">
                  {/* Invoice Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-slate-100 to-slate-200 rounded-xl flex items-center justify-center">
                        <FileText className="w-6 h-6 text-slate-600" />
                      </div>
                      <div>
                        <h3 className="font-bold text-slate-800 text-lg">{inv.code}</h3>
                        {inv.customer_detail?.name && (
                          <div className="flex items-center gap-1 mt-1">
                            <User className="w-3 h-3 text-slate-400" />
                            <span className="text-sm text-slate-600">{inv.customer_detail.name}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${statusInfo.color}`}>
                      <StatusIcon className="w-3 h-3" />
                      {statusInfo.label}
                    </div>
                  </div>

                  {/* Invoice Details */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <DollarSign className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Total</div>
                        <div className="font-semibold text-slate-800">
                          {formatCurrency(Number(inv.total), inv.currency)}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-slate-400" />
                      <div>
                        <div className="text-xs text-slate-500">Balance Due</div>
                        <div className={`font-semibold ${Number(inv.balance_due) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                          {formatCurrency(Number(inv.balance_due), inv.currency)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Calendar className="w-3 h-3" />
                      Created {inv.created_at ? new Date(inv.created_at).toLocaleDateString() : 'Recently'}
                    </div>
                    
                    <div className="flex gap-2">
                      <PermissionGate need="invoices_manage">
                        {inv.status === 'DRAFT' && (
                          <button 
                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-lg font-medium transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 text-sm shadow-sm"
                            onClick={() => issue(inv.id)}
                            disabled={isProcessing}
                          >
                            {isProcessing ? (
                              <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                              <Send className="w-4 h-4" />
                            )}
                            Issue
                          </button>
                        )}
                      </PermissionGate>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}