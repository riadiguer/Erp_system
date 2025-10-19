'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useOrders, useCustomers, useProducts, useSalesPoints } from '@/lib/features/sales/hooks';
import { SalesApi, type OrderCreateInput, type OrderUpdateInput, type Order } from '@/lib/features/sales/api';
import { PermissionGate } from '@/components/guards/PermissionGate';

export default function OrdersPage() {
  const router = useRouter();
  const { orders, loading, error, refresh } = useOrders();
  const { customers } = useCustomers();
  const { products } = useProducts();
  const { salesPoints } = useSalesPoints();
  
  // UI State
  const [creating, setCreating] = useState(false);
  const [editingOrder, setEditingOrder] = useState<Order | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Form States
  const [createForm, setCreateForm] = useState<OrderCreateInput>({
    customer: '' as any,
    currency: 'DZD',
    notes: '',
    sales_point: 0,
    lines: [],
  });
  
  const [editForm, setEditForm] = useState<OrderUpdateInput>({
    expected_delivery_date: '',
    notes: '',
    lines: [],
  });

  // Create Order
  async function createOrder() {
    if (!createForm.customer || createForm.lines.length === 0 || !createForm.sales_point) return;
    
    setActionLoading('create');
    setActionError(null);
    
    try {
      await SalesApi.orders.create(createForm);
      setCreating(false);
      setCreateForm({ customer: '' as any, currency: 'DZD', notes: '', sales_point: 0, lines: [] });
      await refresh();
    } catch (error: any) {
      console.error('Failed to create order:', error);
      handleApiError(error, 'Échec de la création de la commande');
    } finally {
      setActionLoading(null);
    }
  }

  // Update Order
  async function updateOrder() {
    if (!editingOrder) return;
    
    setActionLoading('update');
    setActionError(null);
    
    try {
      await SalesApi.orders.update(editingOrder.id, editForm);
      setEditingOrder(null);
      setEditForm({ expected_delivery_date: '', notes: '', lines: [] });
      await refresh();
    } catch (error: any) {
      console.error('Failed to update order:', error);
      handleApiError(error, 'Échec de la mise à jour de la commande');
    } finally {
      setActionLoading(null);
    }
  }

  // Confirm Order
  async function confirmOrder(id: string) {
    setActionLoading(id);
    setActionError(null);
    
    try {
      await SalesApi.orders.confirm(id);
      await refresh();
    } catch (error: any) {
      console.error('Failed to confirm order:', error);
      handleApiError(error, 'Échec de la confirmation de la commande');
    } finally {
      setActionLoading(null);
    }
  }

  // Delete Order
  async function deleteOrder(id: string) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande ? Cette action ne peut pas être annulée.')) {
      return;
    }
    
    setActionLoading(`delete-${id}`);
    setActionError(null);
    
    try {
      await SalesApi.orders.remove(id);
      await refresh();
    } catch (error: any) {
      console.error('Failed to delete order:', error);
      handleApiError(error, 'Échec de la suppression de la commande');
    } finally {
      setActionLoading(null);
    }
  }

  // Create Invoice from Order
  async function createInvoiceFromOrder(orderId: string) {
    setActionLoading(`invoice-${orderId}`);
    setActionError(null);
    
    try {
      const result = await SalesApi.invoices.fromOrder(orderId);
      router.push(`/sales/invoices/${result.invoice_id}`);
    } catch (error: any) {
      console.error('Failed to create invoice:', error);
      handleApiError(error, 'Échec de la création de la facture');
    } finally {
      setActionLoading(null);
    }
  }

  // Error Handler
  function handleApiError(error: any, defaultMessage: string) {
    if (error?.code === 'CONFIG_ERROR') {
      setActionError('Erreur de configuration : URL de l\'API non définie. Veuillez contacter votre administrateur.');
    } else if (error?.code === 'NETWORK_ERROR') {
      setActionError('Erreur réseau : Impossible de se connecter au serveur. Veuillez vérifier votre connexion et réessayer.');
    } else if (error?.status === 400) {
      setActionError('Données invalides. Veuillez vérifier tous les champs et réessayer.');
    } else if (error?.status === 401) {
      setActionError('Erreur d\'authentification. Veuillez actualiser la page et réessayer.');
    } else if (error?.status === 403) {
      setActionError('Permission refusée. Vous n\'avez pas accès à cette action.');
    } else if (error?.status === 404) {
      setActionError('Ressource non trouvée.');
    } else if (error?.status >= 500) {
      setActionError('Erreur serveur. Veuillez réessayer plus tard.');
    } else {
      setActionError(error?.detail || defaultMessage);
    }
  }

  // Filter and Search Orders
  const filteredOrders = orders?.filter(order => {
    const matchesStatus = statusFilter === 'ALL' || order.status === statusFilter;
    const matchesSearch = !searchTerm || 
      order.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer_detail?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.notes.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  }) || [];

  // Status Colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'CONFIRMED': return 'bg-green-100 text-green-800 border-green-200';
      case 'PART_DELIV': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'DELIVERED': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'CANCELLED': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  // Status Labels
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'DRAFT': return 'BROUILLON';
      case 'CONFIRMED': return 'CONFIRMÉE';
      case 'PART_DELIV': return 'PARTIELLEMENT LIVRÉE';
      case 'DELIVERED': return 'LIVRÉE';
      case 'CANCELLED': return 'ANNULÉE';
      default: return status;
    }
  };

  // Start Edit Order
  function startEditOrder(order: Order) {
    setEditingOrder(order);
    setEditForm({
      expected_delivery_date: order.expected_delivery_date || '',
      notes: order.notes,
      lines: order.lines.map(line => ({
        product: line.product,
        description: line.description,
        quantity: parseFloat(line.quantity),
        unit_price: parseFloat(line.unit_price),
        tax_rate: parseFloat(line.tax_rate),
      })),
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header with Stats */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestion des commandes</h1>
              <p className="text-gray-600">Créez, gérez et suivez vos commandes de vente</p>
              
              {/* Quick Stats */}
              {orders && (
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                    <span className="text-gray-600">Brouillon : {orders.filter(o => o.status === 'DRAFT').length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-green-400"></div>
                    <span className="text-gray-600">Confirmée : {orders.filter(o => o.status === 'CONFIRMED').length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div>
                    <span className="text-gray-600">Partiellement livrée : {orders.filter(o => o.status === 'PART_DELIV').length}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full bg-purple-400"></div>
                    <span className="text-gray-600">Livrée : {orders.filter(o => o.status === 'DELIVERED').length}</span>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <PermissionGate need="sales_manage">
                <button 
                  className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
                  onClick={() => setCreating(true)}
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                  </svg>
                  Créer une nouvelle commande
                </button>
              </PermissionGate>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        {orders && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                  </div>
                  <input
                    type="text"
                    placeholder="Rechercher par code, nom du client ou notes..."
                    className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <select
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white min-w-[150px]"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="ALL">Tous les statuts</option>
                  <option value="DRAFT">Brouillon</option>
                  <option value="CONFIRMED">Confirmée</option>
                  <option value="PART_DELIV">Partiellement livrée</option>
                  <option value="DELIVERED">Livrée</option>
                  <option value="CANCELLED">Annulée</option>
                </select>
                <button
                  onClick={() => refresh()}
                  className="px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-colors"
                  title="Actualiser les commandes"
                >
                  <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Creation Form */}
        {creating && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Créer une nouvelle commande
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              {/* Order Details */}
              <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Client *</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={createForm.customer || ''}
                    onChange={(e) => setCreateForm((f) => ({ ...f, customer: e.target.value as any }))}
                  >
                    <option value="">Sélectionnez un client...</option>
                    {customers?.filter(c => c.is_active).map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Point de vente *</label>
                  <select
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={createForm.sales_point ?? ''} 
                    onChange={(e) => setCreateForm(f => ({ ...f, sales_point: Number(e.target.value) }))}
                  >
                    <option value="">Sélectionnez un point de vente...</option>
                    {salesPoints?.filter(sp => sp.is_active).map(sp => (
                      <option key={sp.id} value={sp.id}>
                        {sp.name} {sp.kind !== 'OTHER' ? `(${sp.kind})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Devise</label>
                  <input 
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={createForm.currency}
                    onChange={(e) => setCreateForm((f) => ({ ...f, currency: e.target.value }))} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Livraison prévue</label>
                  <input 
                    type="date"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={createForm.expected_delivery_date || ''}
                    onChange={(e) => setCreateForm((f) => ({ ...f, expected_delivery_date: e.target.value || null }))} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Notes</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  placeholder="Notes de commande..."
                  value={createForm.notes}
                  onChange={(e) => setCreateForm((f) => ({ ...f, notes: e.target.value }))} 
                />
              </div>

              {/* Order Lines */}
              <LinesEditor 
                products={
                  products?.filter(p => p.is_active).map(p => ({
                    id: p.id,
                    sku: p.sku,
                    name: p.name,
                    unit_price: typeof p.unit_price === 'string' ? Number(p.unit_price) : p.unit_price,
                    tax_rate: typeof p.tax_rate === 'string' ? Number(p.tax_rate) : p.tax_rate,
                  })) || []
                }
                onChange={(lines) => setCreateForm((f) => ({ ...f, lines }))} 
              />

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button 
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => setCreating(false)}
                >
                  Annuler
                </button>
                <button 
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={createOrder}
                  disabled={!createForm.customer || !createForm.sales_point || createForm.lines.length === 0 || actionLoading === 'create'}
                >
                  {actionLoading === 'create' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Création...
                    </>
                  ) : (
                    'Créer la commande'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Order Edit Form */}
        {editingOrder && (
          <div className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border-b border-gray-200 p-6">
              <h2 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                <svg className="w-6 h-6 text-amber-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Modifier la commande : {editingOrder.code}
              </h2>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-gray-700">Date de livraison prévue</label>
                  <input 
                    type="date"
                    className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={editForm.expected_delivery_date || ''}
                    onChange={(e) => setEditForm(f => ({ ...f, expected_delivery_date: e.target.value || null }))} 
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">Notes</label>
                <textarea 
                  rows={3}
                  className="w-full rounded-xl border border-gray-300 px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                  value={editForm.notes}
                  onChange={(e) => setEditForm(f => ({ ...f, notes: e.target.value }))} 
                />
              </div>

              {/* Edit Order Lines */}
              <LinesEditor 
                products={
                  products?.filter(p => p.is_active).map(p => ({
                    id: p.id,
                    sku: p.sku,
                    name: p.name,
                    unit_price: typeof p.unit_price === 'string' ? Number(p.unit_price) : p.unit_price,
                    tax_rate: typeof p.tax_rate === 'string' ? Number(p.tax_rate) : p.tax_rate,
                  })) || []
                }
                initialLines={editForm.lines || []}
                onChange={(lines) => setEditForm(f => ({ ...f, lines }))} 
              />

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button 
                  className="flex-1 sm:flex-none px-6 py-3 rounded-xl border border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                  onClick={() => setEditingOrder(null)}
                >
                  Annuler
                </button>
                <button 
                  className="flex-1 sm:flex-none px-8 py-3 rounded-xl bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  onClick={updateOrder}
                  disabled={actionLoading === 'update'}
                >
                  {actionLoading === 'update' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Mise à jour...
                    </>
                  ) : (
                    'Mettre à jour la commande'
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
              <span className="text-red-800 font-medium">Échec du chargement des commandes. Veuillez réessayer.</span>
            </div>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12">
            <div className="flex flex-col items-center gap-4">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
              <span className="text-gray-600 font-medium">Chargement des commandes...</span>
            </div>
          </div>
        )}

        {/* Orders Grid */}
        <div className="grid gap-6">
          {filteredOrders.map((o) => (
            <div key={o.id} className="bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-200 group">
              <div className="p-6">
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
                  <div className="flex items-center gap-4 cursor-pointer" onClick={() => router.push(`/sales/orders/${o.id}`)}>
                    <div className="bg-gradient-to-r from-blue-100 to-indigo-100 rounded-xl p-3 group-hover:from-blue-200 group-hover:to-indigo-200 transition-colors">
                      <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">{o.code}</h3>
                      <p className="text-gray-600 font-medium">{o.customer_detail?.name}</p>
                      {o.sales_point_detail && (
                        <p className="text-sm text-gray-500">{o.sales_point_detail.name}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={`px-4 py-2 rounded-full text-sm font-semibold border ${getStatusColor(o.status)}`}>
                      {getStatusLabel(o.status)}
                    </span>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-gray-900">{o.total} {o.currency}</div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-sm text-gray-600 mb-1">Articles</div>
                    <div className="text-lg font-semibold text-gray-900">{o.lines.length}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-sm text-gray-600 mb-1">Créée le</div>
                    <div className="text-lg font-semibold text-gray-900">{new Date(o.created_at).toLocaleDateString('fr-FR')}</div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-sm text-gray-600 mb-1">Livraison prévue</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {o.expected_delivery_date ? new Date(o.expected_delivery_date).toLocaleDateString('fr-FR') : 'Non définie'}
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded-xl p-4 group-hover:bg-gray-100 transition-colors">
                    <div className="text-sm text-gray-600 mb-1">Solde</div>
                    <div className="text-lg font-semibold text-gray-900">
                      {parseFloat(o.subtotal) + parseFloat(o.tax_amount)} {o.currency}
                    </div>
                  </div>
                </div>

                {/* Order Notes */}
                {o.notes && (
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <div className="text-sm font-semibold text-blue-900 mb-1">Notes</div>
                    <div className="text-sm text-blue-800">{o.notes}</div>
                  </div>
                )}

                {/* Order Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap gap-3">
                    <PermissionGate need="sales_manage">
                      {/* Confirm Order */}
                      {o.status === 'DRAFT' && (
                        <button 
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            confirmOrder(o.id);
                          }}
                          disabled={actionLoading === o.id}
                        >
                          {actionLoading === o.id ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Confirmation...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                              </svg>
                              Confirmer
                            </>
                          )}
                        </button>
                      )}

                      {/* Edit Order */}
                      {o.status === 'DRAFT' && (
                        <button 
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditOrder(o);
                          }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Modifier
                        </button>
                      )}

                      {/* Create Invoice from Order */}
                      {(o.status === 'CONFIRMED' || o.status === 'PART_DELIV' || o.status === 'DELIVERED') && (
                        <button 
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            createInvoiceFromOrder(o.id);
                          }}
                          disabled={actionLoading === `invoice-${o.id}`}
                        >
                          {actionLoading === `invoice-${o.id}` ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Création...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                              </svg>
                              Créer une facture
                            </>
                          )}
                        </button>
                      )}

                      {/* Delete Order */}
                      {o.status === 'DRAFT' && (
                        <button 
                          className="inline-flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-semibold px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteOrder(o.id);
                          }}
                          disabled={actionLoading === `delete-${o.id}`}
                        >
                          {actionLoading === `delete-${o.id}` ? (
                            <>
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              Suppression...
                            </>
                          ) : (
                            <>
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Supprimer
                            </>
                          )}
                        </button>
                      )}
                    </PermissionGate>
                  </div>
                  
                  <div 
                    className="flex items-center gap-2 text-gray-400 group-hover:text-blue-600 transition-colors cursor-pointer"
                    onClick={() => router.push(`/sales/orders/${o.id}`)}
                  >
                    <span className="text-sm font-medium">Voir les détails</span>
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
        {!loading && filteredOrders.length === 0 && orders && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande ne correspond à vos filtres</h3>
            <p className="text-gray-600 mb-6">Essayez d'ajuster votre terme de recherche ou votre filtre de statut.</p>
            <button 
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium transition-colors"
              onClick={() => {
                setSearchTerm('');
                setStatusFilter('ALL');
              }}
            >
              Effacer les filtres
            </button>
          </div>
        )}

        {/* No Orders State */}
        {!loading && orders && orders.length === 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-12 text-center">
            <div className="mx-auto w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune commande pour le moment</h3>
            <p className="text-gray-600 mb-6">Créez votre première commande pour commencer la gestion des ventes.</p>
            <PermissionGate need="sales_manage">
              <button 
                className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200"
                onClick={() => setCreating(true)}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Créer la première commande
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
  initialLines = [],
  onChange,
}: {
  products: { id: string; sku: string; name: string; unit_price?: number; tax_rate?: number; }[];
  initialLines?: any[];
  onChange: (lines: { product: string; description?: string; quantity: number; unit_price?: number; tax_rate?: number; }[]) => void;
}) {
  const [rows, setRows] = useState<any[]>(initialLines.length > 0 ? initialLines : []);

  function addRow() {
    const newRow = { product: '', quantity: 1, unit_price: 0, tax_rate: 0, description: '' };
    const newRows = [...rows, newRow];
    setRows(newRows);
    onChange(newRows);
  }
  
  function update(i: number, patch: any) {
    let finalPatch = { ...patch };
    
    // If product is being changed, auto-populate unit_price and tax_rate from backend
    if (patch.product) {
      const selectedProduct = products.find(p => p.id === patch.product);
      if (selectedProduct) {
        finalPatch = {
          ...patch,
          unit_price: selectedProduct.unit_price ?? 0,
          tax_rate: selectedProduct.tax_rate ?? 0
        };
      }
    }
    
    const newRows = [...rows];
    newRows[i] = { ...newRows[i], ...finalPatch };
    setRows(newRows);
    onChange(newRows);
  }
  
  function remove(i: number) {
    const newRows = rows.slice();
    newRows.splice(i, 1);
    setRows(newRows);
    onChange(newRows);
  }

  // Calculate totals
  const orderTotal = rows.reduce((total, row) => {
    if (row.product && row.quantity > 0 && row.unit_price > 0) {
      const lineSubtotal = row.quantity * row.unit_price;
      const lineTax = lineSubtotal * (row.tax_rate / 100);
      return total + lineSubtotal + lineTax;
    }
    return total;
  }, 0);

  const orderSubtotal = rows.reduce((total, row) => {
    if (row.product && row.quantity > 0 && row.unit_price > 0) {
      return total + (row.quantity * row.unit_price);
    }
    return total;
  }, 0);

  const orderTax = orderTotal - orderSubtotal;

  return (
    <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <svg className="w-6 h-6 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Articles de la commande ({rows.length})
        </h3>
        <button 
          className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-700 font-semibold px-4 py-2 rounded-xl border border-gray-300 shadow-sm transition-colors"
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
            <p className="text-sm">Cliquez sur "Ajouter un article" pour commencer à construire votre commande</p>
          </div>
        ) : (
          rows.map((row, i) => (
            <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 shadow-sm">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 mb-3">
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Produit</label>
                  <select 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={row.product}
                    onChange={(e) => update(i, { product: e.target.value })}
                  >
                    <option value="">Sélectionnez un produit...</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>{p.sku} — {p.name}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Description</label>
                  <input 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    placeholder="Description de l'article..."
                    value={row.description || ''} 
                    onChange={(e) => update(i, { description: e.target.value })} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Quantité</label>
                  <input 
                    type="number" 
                    min={0} 
                    step="1" 
                    className="w-full rounded-lg border border-gray-300 px-3 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                    value={row.quantity} 
                    onChange={(e) => update(i, { quantity: Number(e.target.value) })} 
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">Prix unitaire</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-gray-50 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      value={row.unit_price ?? 0} 
                      readOnly
                      title="Le prix unitaire est automatiquement défini à partir du produit sélectionné"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
                <div className="space-y-1">
                  <label className="block text-xs font-semibold text-gray-600 uppercase tracking-wide">TVA %</label>
                  <div className="relative">
                    <input 
                      type="number"
                      min={0}
                      step="0.01"
                      className="w-full rounded-lg border border-gray-300 px-3 py-2.5 bg-gray-50 text-gray-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-colors"
                      value={row.tax_rate ?? 0} 
                      readOnly
                      title="Le taux de TVA est automatiquement défini à partir du produit sélectionné"
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Line Total Display */}
              {row.product && row.quantity > 0 && row.unit_price > 0 && (
                <div className="bg-blue-50 rounded-lg p-3 mb-3">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-gray-600">Total ligne (hors TVA) :</span>
                    <span className="font-semibold text-gray-900">
                      {(row.quantity * row.unit_price).toFixed(2)}
                    </span>
                  </div>
                  {row.tax_rate > 0 && (
                    <>
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">TVA ({row.tax_rate}%) :</span>
                        <span className="font-semibold text-gray-900">
                          {((row.quantity * row.unit_price) * (row.tax_rate / 100)).toFixed(2)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center text-sm font-bold border-t border-blue-200 pt-2 mt-2">
                        <span className="text-gray-900">Total ligne (TTC) :</span>
                        <span className="text-gray-900">
                          {(row.quantity * row.unit_price * (1 + row.tax_rate / 100)).toFixed(2)}
                        </span>
                      </div>
                    </>
                  )}
                </div>
              )}
              
              <div className="flex justify-end">
                <button 
                  className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 text-sm font-medium transition-colors"
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

      {/* Order Totals */}
      {rows.length > 0 && orderTotal > 0 && (
        <div className="mt-6 bg-white rounded-xl border-2 border-blue-200 p-6">
          <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
            </svg>
            Récapitulatif de la commande
          </h4>
          <div className="space-y-2">
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-600">Sous-total :</span>
              <span className="font-semibold text-gray-900">{orderSubtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-base">
              <span className="text-gray-600">TVA :</span>
              <span className="font-semibold text-gray-900">{orderTax.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center text-xl font-bold border-t border-gray-200 pt-2 mt-2">
              <span className="text-gray-900">Total :</span>
              <span className="text-blue-600">{orderTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}