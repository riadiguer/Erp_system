'use client'

import React, { useState } from 'react'
import { X, Trash2, AlertTriangle, Building, Package, Calendar, DollarSign, Loader2 } from 'lucide-react'
import { WarehouseApi } from '@/lib/features/warehouse/api'
import type { PurchaseOrder } from '@/lib/features/warehouse/api'

interface DeleteOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  order: PurchaseOrder
}

type ApiError = {
  message?: string
  detail?: string
}

export default function DeleteOrderModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  order 
}: DeleteOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !order) return null

  const handleDelete = async () => {
    setLoading(true)
    setError(null)

    try {
      await WarehouseApi.purchaseOrders.remove(order.id)
      onSuccess()
    } catch (err) {
      console.error('Error deleting purchase order:', err)
      const apiError = err as ApiError
      setError(apiError.message || 'Erreur lors de la suppression du bon de commande')
      setLoading(false)
    }
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isDeliveryLate = () => {
    if (!order.expected_delivery_date) return false
    if (order.status === 'received' || order.status === 'cancelled') return false
    return new Date(order.expected_delivery_date) < new Date()
  }

  const getStatutColor = () => {
    switch (order.status) {
      case 'draft': return 'bg-gray-100 text-gray-800'
      case 'sent': return 'bg-blue-100 text-blue-800'
      case 'confirmed': return 'bg-orange-100 text-orange-800'
      case 'received': return 'bg-green-100 text-green-800'
      case 'cancelled': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatutLabel = () => {
    switch (order.status) {
      case 'draft': return 'Brouillon'
      case 'sent': return 'Envoyé'
      case 'confirmed': return 'Confirmé'
      case 'received': return 'Reçu'
      case 'cancelled': return 'Annulé'
      default: return order.status
    }
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-red-500 rounded-lg mr-3">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-red-900">Confirmer la suppression</div>
              <div className="text-sm font-normal text-red-700">Action irréversible</div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Error Alert */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Erreur</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
          )}

          {/* Warning */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Êtes-vous sûr de vouloir supprimer ce bon de commande ?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cette action est <strong>définitive</strong> et ne peut pas être annulée. 
              Toutes les informations associées à ce bon de commande seront perdues.
            </p>
          </div>

          {/* Order Details to be Deleted */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Bon de commande qui sera supprimé
            </h4>
            
            <div className="space-y-4">
              {/* Basic Information */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Package className="w-4 h-4 mr-2" />
                      Numéro de bon
                    </div>
                    <div className="text-lg font-bold text-gray-900">{order.order_number}</div>
                    <div className="text-sm text-gray-500">ID: {order.id}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date de création
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{formatDate(order.order_date)}</div>
                  </div>
                </div>
              </div>

              {/* Supplier Information */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Building className="w-4 h-4 mr-2" />
                  Fournisseur
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-base font-semibold text-gray-900">
                      {order.supplier_name || `Fournisseur #${order.supplier}`}
                    </div>
                    <div className="text-sm text-gray-500">ID: {order.supplier}</div>
                  </div>
                </div>
              </div>

              {/* Status and Dates */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Statut</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatutColor()}`}>
                      {getStatutLabel()}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Articles</div>
                    <div className="text-base font-semibold text-gray-900">
                      {order.items_count || 0} article{(order.items_count || 0) > 1 ? 's' : ''}
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Date */}
              {order.expected_delivery_date && (
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center text-sm text-gray-600 mb-1">
                        <Calendar className="w-4 h-4 mr-2" />
                        Date de livraison prévue
                      </div>
                      <div className={`text-base font-semibold ${isDeliveryLate() ? 'text-red-600' : 'text-gray-900'}`}>
                        {formatDate(order.expected_delivery_date)}
                      </div>
                    </div>
                    {isDeliveryLate() && (
                      <div className="px-3 py-1 bg-red-100 text-red-800 text-sm font-medium rounded-full">
                        En retard
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Amount */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-900 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Montant qui sera perdu
              </span>
              <div className="flex items-center text-2xl font-bold text-green-700">
                <DollarSign className="w-6 h-6 mr-1" />
                {formatCurrency(order.total_amount)} DT
              </div>
            </h4>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{order.items_count || 0}</div>
                  <div className="text-sm text-gray-600">articles différents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{formatCurrency(order.total_amount)}</div>
                  <div className="text-sm text-gray-600">montant total (DT)</div>
                </div>
                <div className="text-center">
                  <div className="text-sm text-gray-600 mb-1">Date commande</div>
                  <div className="text-base font-semibold text-gray-900">
                    {new Date(order.order_date).toLocaleDateString('fr-FR')}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {order.notes && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Notes qui seront perdues :</h5>
              <p className="text-sm text-gray-700 italic bg-white p-3 rounded border-l-4 border-gray-400 whitespace-pre-wrap">
                &ldquo;{order.notes}&rdquo;
              </p>
            </div>
          )}

          {/* Special Warning for Sent/Confirmed Orders */}
          {(order.status === 'sent' || order.status === 'confirmed') && (
            <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-orange-900 mb-2">
                    Attention : Commande {order.status === 'sent' ? 'envoyée' : 'confirmée'} !
                  </h5>
                  <p className="text-sm text-orange-800">
                    Ce bon de commande a le statut &ldquo;{getStatutLabel()}&rdquo;, ce qui signifie qu&rsquo;il a été transmis au fournisseur. 
                    La suppression n&rsquo;annulera pas automatiquement la commande chez le fournisseur. 
                    Vous devrez les contacter séparément.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Warning for Received Orders */}
          {order.status === 'received' && (
            <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-orange-900 mb-2">Attention : Commande déjà reçue !</h5>
                  <p className="text-sm text-orange-800">
                    Cette commande a déjà été reçue et peut avoir affecté votre stock. 
                    La suppression ne modifiera pas automatiquement les niveaux de stock.
                    Vérifiez l&rsquo;impact sur votre inventaire avant de procéder.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Final Warning */}
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-red-900 mb-2">Conséquences de la suppression :</h5>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Le bon de commande {order.order_number} sera définitivement supprimé</li>
                  <li>{order.items_count || 0} article{(order.items_count || 0) > 1 ? 's' : ''} seront perdu{(order.items_count || 0) > 1 ? 's' : ''}</li>
                  <li>Le montant de {formatCurrency(order.total_amount)} DT ne sera plus suivi</li>
                  <li>L&rsquo;historique et les notes associées seront effacés</li>
                  <li>Les informations du fournisseur pour ce bon seront perdues</li>
                  <li>Cette action ne pourra pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-t-2 border-red-200 rounded-b-xl">
          <div className="text-sm text-red-700">
            <strong>Attention :</strong> Cette action est irréversible
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            
            <button
              onClick={handleDelete}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-sm border-2 border-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Suppression...</span>
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4" />
                  <span>Supprimer définitivement</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}