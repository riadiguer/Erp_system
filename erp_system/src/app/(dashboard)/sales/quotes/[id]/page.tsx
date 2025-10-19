'use client';

import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { useQuote } from '@/lib/features/sales/hooks';
import { SalesApi } from '@/lib/features/sales/api';

function StatusBadge({ status }: { status?: string }) {
  const statusConfig: Record<string, { bg: string; text: string; border: string; icon: string }> = {
    DRAFT: { 
      bg: 'bg-amber-50', 
      text: 'text-amber-700', 
      border: 'border-amber-200',
      icon: '📝'
    },
    SENT: { 
      bg: 'bg-blue-50', 
      text: 'text-blue-700', 
      border: 'border-blue-200',
      icon: '📤'
    },
    ACCEPTED: { 
      bg: 'bg-emerald-50', 
      text: 'text-emerald-700', 
      border: 'border-emerald-200',
      icon: '✅'
    },
    REJECTED: { 
      bg: 'bg-rose-50', 
      text: 'text-rose-700', 
      border: 'border-rose-200',
      icon: '❌'
    },
    EXPIRED: { 
      bg: 'bg-slate-50', 
      text: 'text-slate-600', 
      border: 'border-slate-200',
      icon: '⏰'
    },
  };

  const config = statusConfig[status || ''] || statusConfig.DRAFT;
  
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium rounded-full border ${config.bg} ${config.text} ${config.border} transition-all duration-200 hover:shadow-sm`}>
      <span className="text-xs">{config.icon}</span>
      {status}
    </span>
  );
}

function AnimatedButton({ 
  onClick, 
  disabled, 
  variant = 'primary', 
  children, 
  icon,
  loading = false 
}: {
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger' | 'secondary' | 'dark';
  children: React.ReactNode;
  icon?: string;
  loading?: boolean;
}) {
  const variants = {
    primary: 'bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-blue-200',
    success: 'bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white shadow-emerald-200',
    danger: 'bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white shadow-rose-200',
    secondary: 'bg-gradient-to-r from-slate-100 to-slate-200 hover:from-slate-200 hover:to-slate-300 text-slate-700 shadow-slate-200',
    dark: 'bg-gradient-to-r from-slate-800 to-slate-900 hover:from-slate-900 hover:to-black text-white shadow-slate-300'
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`
        relative overflow-hidden rounded-xl px-5 py-2.5 font-semibold
        transition-all duration-300 ease-out
        hover:shadow-lg hover:scale-105 hover:-translate-y-0.5
        active:scale-95 active:translate-y-0
        disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none
        ${variants[variant]}
        group
      `}
    >
      <div className="flex items-center gap-2">
        {loading ? (
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
        ) : icon && (
          <span className="text-sm">{icon}</span>
        )}
        {children}
      </div>
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
    </button>
  );
}

function MetricCard({ label, value, currency, trend }: { 
  label: string; 
  value: string | number; 
  currency?: string; 
  trend?: 'up' | 'down' | 'neutral';
}) {
  const trendColors = {
    up: 'text-emerald-600',
    down: 'text-rose-600',
    neutral: 'text-slate-600'
  };

  return (
    <div className="group relative rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-slate-50 p-6 transition-all duration-300 hover:border-slate-300 hover:shadow-lg hover:-translate-y-1">
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <div className="relative">
        <div className="text-sm font-medium text-slate-500 mb-1">{label}</div>
        <div className="flex items-baseline gap-1">
          <div className="text-2xl font-bold text-slate-900">
            {value}
          </div>
          {currency && (
            <div className="text-sm font-medium text-slate-500">{currency}</div>
          )}
          {trend && (
            <div className={`text-xs ${trendColors[trend]} ml-2`}>
              {trend === 'up' ? '↗' : trend === 'down' ? '↘' : '→'}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function QuoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { quote, loading, error, refresh } = useQuote(id);
  const [busy, setBusy] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  async function doAction(kind: 'send' | 'accept' | 'reject' | 'expire' | 'toOrder') {
    if (!quote) return;
    setErr(null);
    setBusy(kind);
    try {
      if (kind === 'send') await SalesApi.quotes.send(quote.id);
      if (kind === 'accept') await SalesApi.quotes.accept(quote.id);
      if (kind === 'reject') await SalesApi.quotes.reject(quote.id);
      if (kind === 'expire') await SalesApi.quotes.expire(quote.id);
      if (kind === 'toOrder') {
        const res = await SalesApi.quotes.toOrder(quote.id);
        router.push(`/sales/orders/${res.order_id}`);
        return;
      }
      await refresh();
    } catch (e: any) {
      if (e?.status === 400) setErr(e?.detail || 'Opération invalide pour cet état de devis.');
      else if (e?.status === 401) setErr('Veuillez vous reconnecter.');
      else if (e?.status === 403) setErr('Vous n\'avez pas la permission pour cette action.');
      else if (e?.status === 404) setErr('Devis introuvable.');
      else setErr('Une erreur s\'est produite. Veuillez réessayer.');
    } finally {
      setBusy(null);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
            <div className="absolute inset-0 w-16 h-16 border-4 border-transparent border-r-purple-400 rounded-full animate-spin animation-delay-150" />
          </div>
          <div className="text-slate-600 font-medium">Chargement des détails du devis...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">😞</div>
          <div className="text-xl font-semibold text-slate-800">Échec du chargement du devis</div>
          <div className="text-slate-600">Veuillez réessayer ou contacter le support</div>
        </div>
      </div>
    );
  }

  if (!quote) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-6xl">🔍</div>
          <div className="text-xl font-semibold text-slate-800">Devis introuvable</div>
          <Link href="/sales/quotes" className="text-blue-600 hover:underline">
            ← Retour aux Devis
          </Link>
        </div>
      </div>
    );
  }

  const canConvert = quote.status === 'SENT' || quote.status === 'ACCEPTED';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
      <div className="relative">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse" />
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-2000" />
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl animate-pulse animation-delay-4000" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto p-4 md:p-8 space-y-8">
          {/* Navigation */}
          <div className="flex items-center justify-between">
            <Link 
              href="/sales/quotes" 
              className="group flex items-center gap-2 text-slate-600 hover:text-slate-800 transition-colors duration-200"
            >
              <span className="transform transition-transform duration-200 group-hover:-translate-x-1">←</span>
              <span className="font-medium">Retour aux Devis</span>
            </Link>
          </div>

          {/* Header Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-8">
            <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-8">
              <div className="space-y-4 flex-1">
                <div className="space-y-3">
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
                    {quote.code}
                  </h1>
                  <div className="text-xl text-slate-700 font-medium">
                    {quote.customer_detail?.name || 'Client Anonyme'}
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <StatusBadge status={quote.status} />
                  {quote.sales_point_detail?.name && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-slate-50 text-slate-600 text-sm font-medium">
                      <span>🏪</span>
                      {quote.sales_point_detail.name}
                    </span>
                  )}
                  {quote.valid_until && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border bg-orange-50 text-orange-600 text-sm font-medium">
                      <span>⏰</span>
                      Valide jusqu'au {new Date(quote.valid_until).toLocaleDateString('fr-FR')}
                    </span>
                  )}
                </div>

                <div className="text-sm text-slate-500 space-y-1">
                  <div>📅 Créé le {new Date(quote.created_at).toLocaleString('fr-FR')}</div>
                  {quote.sent_at && (
                    <div>📤 Envoyé le {new Date(quote.sent_at).toLocaleString('fr-FR')}</div>
                  )}
                  {quote.decided_at && (
                    <div>✅ Décidé le {new Date(quote.decided_at).toLocaleString('fr-FR')}</div>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-wrap gap-3">
                <PermissionGate need="sales_manage">
                  {quote.status === 'DRAFT' && (
                    <AnimatedButton
                      onClick={() => doAction('send')}
                      disabled={busy === 'send'}
                      variant="primary"
                      icon="📤"
                      loading={busy === 'send'}
                    >
                      {busy === 'send' ? 'Envoi en cours...' : 'Envoyer le Devis'}
                    </AnimatedButton>
                  )}

                  {quote.status === 'SENT' && (
                    <>
                      <AnimatedButton
                        onClick={() => doAction('accept')}
                        disabled={busy === 'accept'}
                        variant="success"
                        icon="✅"
                        loading={busy === 'accept'}
                      >
                        {busy === 'accept' ? 'Acceptation...' : 'Accepter'}
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => doAction('reject')}
                        disabled={busy === 'reject'}
                        variant="danger"
                        icon="❌"
                        loading={busy === 'reject'}
                      >
                        {busy === 'reject' ? 'Rejet...' : 'Rejeter'}
                      </AnimatedButton>
                      <AnimatedButton
                        onClick={() => doAction('expire')}
                        disabled={busy === 'expire'}
                        variant="secondary"
                        icon="⏰"
                        loading={busy === 'expire'}
                      >
                        {busy === 'expire' ? 'Expiration...' : 'Marquer Expiré'}
                      </AnimatedButton>
                    </>
                  )}

                  {canConvert && (
                    <AnimatedButton
                      onClick={() => doAction('toOrder')}
                      disabled={busy === 'toOrder'}
                      variant="dark"
                      icon="🔄"
                      loading={busy === 'toOrder'}
                    >
                      {busy === 'toOrder' ? 'Conversion...' : 'Convertir en Commande'}
                    </AnimatedButton>
                  )}
                </PermissionGate>
              </div>
            </div>

            {err && (
              <div className="mt-6 rounded-2xl border border-rose-200 bg-gradient-to-r from-rose-50 to-red-50 p-4 text-rose-800">
                <div className="flex items-center gap-2">
                  <span>⚠️</span>
                  <span className="font-medium">{err}</span>
                </div>
              </div>
            )}
          </div>

          {/* Totals */}
          <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <MetricCard 
              label="Sous-total" 
              value={quote.subtotal} 
              currency={quote.currency}
              trend="neutral"
            />
            <MetricCard 
              label="Montant TVA" 
              value={quote.tax_amount} 
              currency={quote.currency}
              trend="neutral"
            />
            <MetricCard 
              label="Total" 
              value={quote.total} 
              currency={quote.currency}
              trend="up"
            />
          </section>

          {/* Quote Lines */}
          <section className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 overflow-hidden">
            <div className="border-b border-slate-200 p-6">
              <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <span>📋</span>
                Lignes du Devis
              </h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-r from-slate-50 to-slate-100">
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Produit</th>
                    <th className="px-6 py-4 text-left font-semibold text-slate-700">Description</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-700">Qté</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-700">Prix Unitaire</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-700">TVA %</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-700">Sous-total</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-700">TVA</th>
                    <th className="px-6 py-4 text-right font-semibold text-slate-700">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {quote.lines.map((ln, index) => (
                    <tr 
                      key={ln.id} 
                      className={`border-t border-slate-200 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 transition-colors duration-200 ${
                        index % 2 === 0 ? 'bg-white/50' : 'bg-slate-50/50'
                      }`}
                    >
                      <td className="px-6 py-4 font-medium text-slate-800">
                        {ln.product_detail?.sku || ln.product}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        {ln.description || '—'}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {ln.quantity}
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {ln.unit_price}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {ln.tax_rate}%
                      </td>
                      <td className="px-6 py-4 text-right font-medium text-slate-800">
                        {ln.subtotal}
                      </td>
                      <td className="px-6 py-4 text-right text-slate-600">
                        {ln.tax_amount}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        {ln.total}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Notes */}
          {quote.notes && (
            <section className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl border border-white/50 p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                <span>📝</span>
                Notes
              </h3>
              <div className="text-slate-700 leading-relaxed bg-slate-50 rounded-2xl p-4 border">
                {quote.notes}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}