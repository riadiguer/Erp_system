'use client';

import Link from 'next/link';
import { useParams } from 'next/navigation';
import useSWR from 'swr';
import { useMemo, useState } from 'react';
import { PermissionGate } from '@/components/guards/PermissionGate';
import { SalesApi } from '@/lib/features/sales/api';

// --- types ----------------------------------------------
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
type DeliveryLine = { 
  id: string; 
  order_line: string; 
  quantity: string; 
  order_line_detail?: OrderLineLite 
};
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

export default function DeliveryNoteDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { data, error, mutate } = useSWR<DeliveryNote>(
    `/sales/delivery-notes/${id}/`, 
    () => SalesApi.deliveryNotes.get(id)
  );
  
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [errMsg, setErrMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  // Calculate remaining quantities accounting for what's already in this note
  const remainingByLine = useMemo(() => {
    const map: Record<string, number> = {};
    if (data?.order_detail?.lines) {
      data.order_detail.lines.forEach(l => {
        const already = Number(l.delivered_qty);
        const ordered = Number(l.quantity);
        // Subtract what's already in this draft delivery note
        const inThisNote = (data.lines || [])
          .filter(dl => dl.order_line === l.id)
          .reduce((sum, dl) => sum + Number(dl.quantity), 0);
        map[l.id] = Math.max(0, ordered - already - inThisNote);
      });
    }
    return map;
  }, [data]);

  // Get available lines (those with remaining quantity)
  const availableLines = useMemo(() => {
    if (!data?.order_detail?.lines) return [];
    return data.order_detail.lines.filter(l => remainingByLine[l.id] > 0);
  }, [data, remainingByLine]);

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

  function updateQuantity(lineId: string, value: number) {
    const max = remainingByLine[lineId] || 0;
    setQuantities(prev => ({
      ...prev,
      [lineId]: Math.min(Math.max(0, value), max)
    }));
  }

  async function doMarkDelivered() {
    if (!data) return;
    setBusy('deliver'); 
    setErrMsg(null);
    try {
      await SalesApi.deliveryNotes.markDelivered(data.id);
      await mutate();
    } catch (e: any) {
      setErrMsg(e?.detail || 'Échec du marquage comme livré.');
    } finally {
      setBusy(null);
    }
  }

  async function addLines() {
    if (!data || Object.keys(quantities).length === 0) return;
    
    const lines = Object.entries(quantities)
      .filter(([_, qty]) => qty > 0)
      .map(([lineId, qty]) => ({ 
        order_line: lineId, 
        quantity: qty 
      }));

    if (lines.length === 0) {
      setErrMsg('Veuillez sélectionner au moins une ligne avec une quantité > 0');
      return;
    }

    setBusy('add'); 
    setErrMsg(null);
    try {
      await SalesApi.deliveryNotes.addLines(data.id, lines);
      setQuantities({});
      await mutate();
    } catch (e: any) {
      setErrMsg(e?.detail || 'Échec de l\'ajout des lignes.');
    } finally {
      setBusy(null);
    }
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-red-800">
            Échec du chargement du bon de livraison : {error.message || error}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-2xl border bg-white p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
            <div className="mt-3 text-gray-600">Chargement…</div>
          </div>
        </div>
      </div>
    );
  }

  const canEdit = data.status === 'DRAFT';
  const selectedLines = Object.keys(quantities).filter(id => quantities[id] > 0);

  const badge =
    data.status === 'DRAFT' ? 'bg-yellow-100 text-yellow-800 border-yellow-200' :
    data.status === 'DELIVERED' ? 'bg-green-100 text-green-800 border-green-200' :
    data.status === 'SENT' ? 'bg-blue-100 text-blue-800 border-blue-200' :
    data.status === 'CANCELLED' ? 'bg-red-100 text-red-800 border-red-200' :
    'bg-gray-100 text-gray-800 border-gray-200';

  const statusLabel = {
    'DRAFT': 'BROUILLON',
    'SENT': 'ENVOYÉ',
    'DELIVERED': 'LIVRÉ',
    'CANCELLED': 'ANNULÉ'
  }[data.status] || data.status;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-center justify-between">
          <Link 
            href="/sales/delivery-notes" 
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Retour aux bons de livraison
          </Link>
        </div>

        {/* Header Card */}
        <div className="bg-white rounded-2xl border shadow-sm p-6">
          <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-3xl font-bold text-gray-900">{data.code}</h1>
                <span className={`px-3 py-1 rounded-full border text-xs font-semibold ${badge}`}>
                  {statusLabel}
                </span>
              </div>
              
              <div className="space-y-1 text-gray-700">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Commande :</span>
                  <Link 
                    href={`/sales/orders/${data.order}`}
                    className="text-blue-600 hover:underline"
                  >
                    {data.order_detail?.code}
                  </Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Client :</span>
                  <span>{data.order_detail?.customer_detail?.name || 'Inconnu'}</span>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500">
                <div className="flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Créé le : {new Date(data.created_at).toLocaleString('fr-FR')}
                </div>
                {data.delivered_at && (
                  <div className="flex items-center gap-1 text-green-600">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Livré le : {new Date(data.delivered_at).toLocaleString('fr-FR')}
                  </div>
                )}
              </div>
            </div>

            <PermissionGate need="sales_manage">
              {canEdit && data.lines.length > 0 && (
                <button
                  onClick={doMarkDelivered}
                  disabled={busy === 'deliver'}
                  className="inline-flex items-center gap-2 rounded-xl bg-green-600 text-white px-5 py-3 hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  {busy === 'deliver' ? 'Marquage…' : 'Marquer comme livré'}
                </button>
              )}
            </PermissionGate>
          </div>

          {errMsg && (
            <div className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-red-800">
              <strong>Erreur :</strong> {errMsg}
            </div>
          )}
        </div>

        {/* Current Lines */}
        <section className="rounded-2xl border bg-white overflow-hidden shadow-sm">
          <div className="border-b bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-semibold text-gray-900">
              Articles dans cette livraison ({data.lines.length})
            </h2>
          </div>
          
          {data.lines.length === 0 ? (
            <div className="p-12 text-center text-gray-500">
              <svg className="w-16 h-16 mx-auto mb-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <p className="font-medium">Aucun article dans ce bon de livraison pour le moment</p>
              {canEdit && <p className="text-sm mt-1">Ajoutez des articles depuis la commande ci-dessous</p>}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Produit</th>
                    <th className="px-6 py-3 text-left font-semibold text-gray-700">Description</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Qté (ce bon)</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Commandé</th>
                    <th className="px-6 py-3 text-right font-semibold text-gray-700">Total livré</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {data.lines.map(dl => {
                    const ol = data.order_detail?.lines.find(l => l.id === dl.order_line);
                    return (
                      <tr key={dl.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {ol?.product_detail?.sku || 'Inconnu'}
                          </div>
                          <div className="text-xs text-gray-500">
                            {ol?.product_detail?.name || 'Produit inconnu'}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {ol?.description || '—'}
                        </td>
                        <td className="px-6 py-4 text-right font-semibold text-gray-900">
                          {dl.quantity}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {ol?.quantity || '—'}
                        </td>
                        <td className="px-6 py-4 text-right text-gray-600">
                          {ol?.delivered_qty || '0'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        {/* Add More Lines (DRAFT only) */}
        {canEdit && availableLines.length > 0 && (
          <section className="rounded-2xl border bg-white shadow-sm overflow-hidden">
            <div className="border-b bg-gray-50 px-6 py-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Ajouter plus d'articles depuis la commande
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Sélectionnez des articles supplémentaires à inclure dans cette livraison
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="space-y-3">
                {availableLines.map(line => {
                  const remaining = remainingByLine[line.id] || 0;
                  const isSelected = line.id in quantities;
                  const currentQty = quantities[line.id] || 0;

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
                                {line.product_detail?.sku || 'SKU inconnu'}
                              </div>
                              <div className="text-sm text-gray-600 mt-0.5">
                                {line.product_detail?.name || 'Produit inconnu'}
                              </div>
                              {line.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {line.description}
                                </div>
                              )}
                            </div>
                            
                            <div className="text-right flex-shrink-0">
                              <div className="text-sm text-amber-600">Disponible</div>
                              <div className="font-bold text-amber-700">{remaining}</div>
                            </div>
                          </div>

                          {isSelected && (
                            <div className="mt-3 flex items-center gap-3">
                              <label className="text-sm font-medium text-gray-700 min-w-[120px]">
                                Quantité à livrer :
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
                                (max : {remaining})
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {selectedLines.length > 0 && (
                <div className="border-t pt-4">
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                    <div className="flex items-center gap-2 text-blue-900">
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className="font-semibold">
                        {selectedLines.length} article{selectedLines.length !== 1 ? 's' : ''} sélectionné{selectedLines.length !== 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <button
                    className="w-full md:w-auto rounded-xl bg-black text-white px-6 py-3 hover:bg-neutral-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    disabled={selectedLines.length === 0 || busy === 'add'}
                    onClick={addLines}
                  >
                    {busy === 'add' ? 'Ajout…' : `Ajouter ${selectedLines.length} article${selectedLines.length !== 1 ? 's' : ''} à la livraison`}
                  </button>
                </div>
              )}
            </div>
          </section>
        )}

        {canEdit && availableLines.length === 0 && data.lines.length > 0 && (
          <div className="rounded-2xl border bg-white p-8 text-center text-gray-500">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="font-medium">Tous les articles de la commande sont inclus</p>
            <p className="text-sm mt-1">Aucun autre article disponible à ajouter depuis cette commande</p>
          </div>
        )}
      </div>
    </div>
  );
}