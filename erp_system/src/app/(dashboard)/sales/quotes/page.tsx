'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

import { PermissionGate } from '@/components/guards/PermissionGate';
import {
  SalesApi,
  type QuoteCreateInput,
} from '@/lib/features/sales/api';

import {
  useQuotes,
  useCustomers,
  useProducts,
  useSalesPoints,
} from '@/lib/features/sales/hooks';

export default function QuotesPage() {
  const router = useRouter();
  const { quotes, loading, error, refresh } = useQuotes();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { salesPoints } = useSalesPoints();

  const [creating, setCreating] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [form, setForm] = useState<QuoteCreateInput>({
    customer: '' as any,
    sales_point: undefined,
    currency: 'DZD',
    valid_until: '',
    notes: '',
    lines: [],
  });

  async function createQuote() {
    if (!form.customer || !form.sales_point || form.lines.length === 0) return;
    setActionLoading('create');
    setActionError(null);
    try {
      const q = await SalesApi.quotes.create({
        ...form,
        // empty string → undefined for valid_until
        valid_until: form.valid_until || undefined,
      });
      setCreating(false);
      setForm({
        customer: '' as any,
        sales_point: undefined,
        currency: 'DZD',
        valid_until: '',
        notes: '',
        lines: [],
      });
      await refresh();
      router.push(`/sales/quotes/${q.id}`);
    } catch (e: any) {
      if (e?.status === 400) setActionError(e?.detail || 'Données de devis invalides.');
      else if (e?.status === 401) setActionError('Veuillez vous reconnecter.');
      else if (e?.status === 403) setActionError('Vous n\'avez pas la permission de créer des devis.');
      else if (e?.status >= 500) setActionError('Erreur serveur. Réessayez plus tard.');
      else setActionError(e?.detail || 'Échec de la création du devis.');
    } finally {
      setActionLoading(null);
    }
  }

  const statusBadge = (s: string) => {
    const m: Record<string, string> = {
      DRAFT: 'bg-yellow-100 text-yellow-800 border-yellow-200',
      SENT: 'bg-blue-100 text-blue-800 border-blue-200',
      ACCEPTED: 'bg-green-100 text-green-800 border-green-200',
      REJECTED: 'bg-red-100 text-red-800 border-red-200',
      EXPIRED: 'bg-gray-100 text-gray-800 border-gray-200',
    };
    return m[s] || 'bg-gray-100 text-gray-800 border-gray-200';
  };

  const statusLabel = (s: string) => {
    const labels: Record<string, string> = {
      DRAFT: 'BROUILLON',
      SENT: 'ENVOYÉ',
      ACCEPTED: 'ACCEPTÉ',
      REJECTED: 'REJETÉ',
      EXPIRED: 'EXPIRÉ',
    };
    return labels[s] || s;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Devis</h1>
              <p className="text-gray-600">Créez, envoyez et suivez les devis de vente</p>
            </div>
            <PermissionGate need="sales_manage">
              <button
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                onClick={() => setCreating(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Nouveau devis
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Create Form */}
        {creating && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Créer un devis
              </h2>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Customer */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Client *</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={form.customer || ''}
                    onChange={(e) => setForm((f) => ({ ...f, customer: e.target.value as any }))}
                  >
                    <option value="">Sélectionnez un client...</option>
                    {customers?.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                {/* Sales Point */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Point de vente *</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={(form as any).sales_point ?? ''}
                    onChange={(e) => setForm((f) => ({ ...f, sales_point: Number(e.target.value) }))}
                  >
                    <option value="">Sélectionnez un point de vente...</option>
                    {salesPoints?.filter(sp => sp.is_active).map((sp) => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name}{sp.kind ? ` (${sp.kind})` : ''}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Currency */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Devise</label>
                  <input
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={form.currency || 'DZD'}
                    onChange={(e) => setForm((f) => ({ ...f, currency: e.target.value }))}
                  />
                </div>

                {/* Valid until */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Valide jusqu'au</label>
                  <input
                    type="date"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={(form.valid_until as string) || ''}
                    onChange={(e) => setForm((f) => ({ ...f, valid_until: e.target.value }))}
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label>
                <input
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                  placeholder="Notes du devis..."
                  value={form.notes || ''}
                  onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                />
              </div>

              {/* Lines */}
              <LinesEditor
                products={products?.filter(p => p.is_active) || []}
                onChange={(lines) => setForm((f) => ({ ...f, lines }))}
              />

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50"
                  onClick={() => setCreating(false)}
                >
                  Annuler
                </button>
                <button
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={createQuote}
                  disabled={!form.customer || !form.sales_point || form.lines.length === 0 || actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création...
                    </>
                  ) : (
                    'Créer le devis'
                  )}
                </button>
              </div>

              {actionError && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-800">
                  {actionError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Errors / Loading */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-6">
            <div className="flex items-center gap-3">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span className="text-red-800 font-medium">Échec du chargement des devis. Veuillez réessayer.</span>
            </div>
          </div>
        )}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Chargement des devis...</span>
            </div>
          </div>
        )}

        {/* List */}
        <div className="grid gap-6">
          {quotes?.map((q) => (
            <Link key={q.id} href={`/sales/quotes/${q.id}`} className="block bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4">
                    <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-3">
                      <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{q.code}</h3>
                      <p className="text-gray-600 font-medium">{q.customer_detail?.name}</p>
                      {q.sales_point_detail?.name && (
                        <div className="mt-1 text-xs">
                          <span className="px-2 py-0.5 rounded-full border bg-gray-50 text-gray-700">
                            {q.sales_point_detail.name}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${statusBadge(q.status)}`}>
                      {statusLabel(q.status)}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{q.total} {q.currency}</div>
                      {q.valid_until && (
                        <div className="text-xs text-gray-600">Valide jusqu'au {new Date(q.valid_until).toLocaleDateString('fr-FR')}</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Articles</div>
                    <div className="text-lg font-semibold text-gray-900">{q.lines.length}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Créé le</div>
                    <div className="text-lg font-semibold text-gray-900">{new Date(q.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4">
                    <div className="text-sm text-gray-600 mb-1">Heure</div>
                    <div className="text-lg font-semibold text-gray-900">{new Date(q.created_at).toLocaleTimeString('fr-FR')}</div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty */}
        {!loading && quotes && quotes.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2v-7a2 2 0 00-2-2H5a2 2 0 00-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun devis pour le moment</h3>
            <p className="text-gray-600 mb-6">Créez votre premier devis pour commencer.</p>
            <PermissionGate need="sales_manage">
              <button
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setCreating(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer le premier devis
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
  onChange: (lines: { product: string; description?: string; quantity: number }[]) => void;
}) {
  const [rows, setRows] = useState<any[]>([]);

  function addRow() {
    setRows((r) => [...r, { product: '', description: '', quantity: 1, _unit_price: 0, _tax_rate: 0 }]);
  }

  function update(i: number, patch: any) {
    setRows((r) => {
      const copy = [...r];
      copy[i] = { ...copy[i], ...patch };
      return copy;
    });
    // Only emit server-controlled payload (no price/tax)
    onChange(
      rows.map((row, idx) => {
        const r = idx === i ? { ...row, ...patch } : row;
        return {
          product: r.product,
          description: r.description,
          quantity: Number(r.quantity || 0),
        };
      })
    );
  }

  function onProductChange(i: number, productId: string) {
    const p = products.find(pp => pp.id === productId);
    update(i, {
      product: productId,
      _unit_price: p ? Number(p.unit_price) : 0,
      _tax_rate: p ? Number(p.tax_rate) : 0,
    });
  }

  function remove(i: number) {
    const copy = rows.slice();
    copy.splice(i, 1);
    setRows(copy);
    onChange(copy.map((r) => ({
      product: r.product,
      description: r.description,
      quantity: Number(r.quantity || 0),
    })));
  }

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Articles du devis
        </h3>
        <button
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-xl border border-gray-300 shadow-sm"
          onClick={addRow}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          Ajouter un article
        </button>
      </div>

      <div className="space-y-4">
        {rows.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="font-medium">Aucun article ajouté pour le moment</p>
            <p className="text-sm">Cliquez sur "Ajouter un article" pour commencer à construire votre devis</p>
          </div>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-3">
                {/* Product */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Produit</label>
                  <select
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={row.product}
                    onChange={(e) => onProductChange(i, e.target.value)}
                  >
                    <option value="">Sélectionnez un produit...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                    ))}
                  </select>
                </div>

                {/* Description */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                  <input
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    placeholder="Description de l'article..."
                    value={row.description || ''}
                    onChange={(e) => update(i, { description: e.target.value })}
                  />
                </div>

                {/* Quantity */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantité</label>
                  <input
                    type="number"
                    min={0}
                    step="0.001"
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                    value={row.quantity}
                    onChange={(e) => update(i, { quantity: Number(e.target.value) })}
                  />
                </div>

                {/* Unit Price (read-only from Product) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Prix unitaire</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                    value={row._unit_price ?? 0}
                    readOnly
                    tabIndex={-1}
                  />
                </div>

                {/* Tax % (read-only from Product) */}
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">TVA %</label>
                  <input
                    className="w-full rounded-lg border border-gray-200 bg-gray-50 px-3 py-2.5"
                    value={row._tax_rate ?? 0}
                    readOnly
                    tabIndex={-1}
                  />
                </div>
              </div>

              <div className="flex justify-end">
                <button
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium"
                  onClick={() => remove(i)}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Supprimer l'article
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}