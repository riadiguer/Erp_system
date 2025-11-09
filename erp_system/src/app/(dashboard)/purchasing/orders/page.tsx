'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  FileText, 
  ArrowLeft,
  Building,
  Clock,
  Package,
  DollarSign,
  Loader2
} from 'lucide-react'

// Import API hooks
import { usePurchaseOrders, useSuppliers, useMaterials } from '@/lib/features/warehouse/hooks'
import type { PurchaseOrder, PurchaseOrderStatus } from '@/lib/features/warehouse/api'

// Import modals
import AddOrderModal from './components/AddOrderModal'
import ViewOrderModal from './components/ViewOrderModal'
import EditOrderModal from './components/EditOrderModal'
import DeleteOrderModal from './components/DeleteOrderModal'
import ReceiveOrderModal from './components/ReceiveOrderModal'

export default function OrdersPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'view' | 'edit' | 'delete' | 'receive' | ''>('')
  const [selectedItem, setSelectedItem] = useState<PurchaseOrder | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data from API
  const { orders, loading, error, refresh } = usePurchaseOrders()
  const { suppliers } = useSuppliers()
  const { materials } = useMaterials()

  const openModal = (type: 'add' | 'view' | 'edit' | 'delete' | 'receive', item: PurchaseOrder | null = null) => {
    setModalType(type)
    setSelectedItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
  }

  // Filter orders based on search
  const filteredOrders = useMemo(() => {
    if (!searchTerm.trim()) return orders

    const search = searchTerm.toLowerCase()
    return orders.filter(order =>
      order.order_number.toLowerCase().includes(search) ||
      order.supplier_name?.toLowerCase().includes(search) ||
      getStatutLabel(order.status).toLowerCase().includes(search)
    )
  }, [orders, searchTerm])

  // Helper functions
  const getStatutColor = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft': return 'text-gray-700 bg-gray-100 border-gray-200'
      case 'sent': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'confirmed': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'received': return 'text-green-700 bg-green-100 border-green-200'
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatutLabel = (status: PurchaseOrderStatus) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'sent': return 'Envoyé'
      case 'confirmed': return 'Confirmé'
      case 'received': return 'Reçu'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  const canReceive = (status: PurchaseOrderStatus) => {
    return status === 'sent' || status === 'confirmed'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', { 
      day: '2-digit', 
      month: '2-digit',
      year: 'numeric'
    })
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return `${num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} DT`
  }

  // Calculate statistics
  const stats = useMemo(() => {
    return {
      total: orders.length,
      draft: orders.filter(o => o.status === 'draft').length,
      sent: orders.filter(o => o.status === 'sent').length,
      confirmed: orders.filter(o => o.status === 'confirmed').length,
      totalAmount: orders.reduce((sum, o) => sum + parseFloat(o.total_amount), 0)
    }
  }, [orders])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des commandes...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <FileText className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">Impossible de charger les commandes.</p>
          <button
            onClick={() => refresh?.()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Link 
                href="/purchasing" 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline text-sm">Retour</span>
              </Link>
              <div className="h-4 w-px bg-gray-300 flex-shrink-0" />
              <div className="flex items-center space-x-2 min-w-0">
                <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    Bons de Commande
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block truncate">
                    Gestion des commandes fournisseurs
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <FileText className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-gray-100 flex-shrink-0">
                <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-gray-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Brouillon</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.draft}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 flex-shrink-0">
                <Package className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">En cours</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {stats.sent + stats.confirmed}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-purple-100 flex-shrink-0">
                <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Montant Total</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">
                  {formatCurrency(stats.totalAmount)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro, fournisseur, statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Nouvelle Commande</span>
          </button>
        </div>

        {/* Orders List */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {filteredOrders.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Aucune commande trouvée
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : 'Commencez par créer votre première commande.'}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openModal('add')}
                  className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une commande
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Numéro
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Fournisseur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Montant
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4 text-green-600" />
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">
                                {order.order_number}
                              </div>
                              <div className="text-xs text-gray-500">
                                {order.items_count || 0} articles
                              </div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <Building className="w-4 h-4 text-gray-400 mr-2" />
                            <div className="text-sm text-gray-900">
                              {order.supplier_name || `Fournisseur #${order.supplier}`}
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(order.order_date)}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatutColor(order.status)}`}>
                            {getStatutLabel(order.status)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatCurrency(order.total_amount)}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openModal('view', order)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {order.status !== 'received' && order.status !== 'cancelled' && (
                              <button
                                onClick={() => openModal('edit', order)}
                                className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                                title="Modifier"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                            )}
                            {canReceive(order.status) && (
                              <button
                                onClick={() => openModal('receive', order)}
                                className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50"
                                title="Recevoir"
                              >
                                <Check className="w-4 h-4" />
                              </button>
                            )}
                            {order.status !== 'received' && (
                              <button
                                onClick={() => openModal('delete', order)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet View */}
              <div className="xl:hidden divide-y divide-gray-200">
                {filteredOrders.map((order) => (
                  <div key={order.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <FileText className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">
                            {order.order_number}
                          </div>
                          <div className="text-sm text-gray-500 truncate">
                            {order.supplier_name || `Fournisseur #${order.supplier}`}
                          </div>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatutColor(order.status)}`}>
                        {getStatutLabel(order.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium text-gray-900">{formatDate(order.order_date)}</div>
                      </div>
                      <div>
                        <span className="text-gray-500">Montant:</span>
                        <div className="font-medium text-gray-900">{formatCurrency(order.total_amount)}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openModal('view', order)}
                        className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        Voir
                      </button>
                      {order.status !== 'received' && order.status !== 'cancelled' && (
                        <button
                          onClick={() => openModal('edit', order)}
                          className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
                        >
                          <Edit className="w-4 h-4 mr-1.5" />
                          Modifier
                        </button>
                      )}
                      {canReceive(order.status) && (
                        <button
                          onClick={() => openModal('receive', order)}
                          className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100"
                        >
                          <Check className="w-4 h-4 mr-1.5" />
                          Recevoir
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && modalType === 'add' && (
        <AddOrderModal
          isOpen={showModal}
          onClose={closeModal}
          onSuccess={() => {
            refresh?.();
            closeModal();
          }}
          suppliers={suppliers}
          materials={materials}
        />
      )}

      {showModal && modalType === 'view' && selectedItem && (
        <ViewOrderModal
          isOpen={showModal}
          onClose={closeModal}
          order={selectedItem}
        />
      )}

      {showModal && modalType === 'edit' && selectedItem && (
        <EditOrderModal
          isOpen={showModal}
          onClose={closeModal}
          order={selectedItem}
          onSuccess={() => {
            refresh?.();
            closeModal();
          }}
          suppliers={suppliers}
          materials={materials}
        />
      )}

      {showModal && modalType === 'receive' && selectedItem && (
        <ReceiveOrderModal
          isOpen={showModal}
          onClose={closeModal}
          order={selectedItem}
          onSuccess={() => {
            refresh?.();
            closeModal();
          }}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeleteOrderModal
          isOpen={showModal}
          onClose={closeModal}
          order={selectedItem}
          onSuccess={() => {
            refresh?.();
            closeModal();
          }}
        />
      )}
    </div>
  )
}