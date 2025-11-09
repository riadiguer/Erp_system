'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { 
  X, Eye, FileText, Calendar, Building, Package, MessageSquare, 
  AlertTriangle,  DollarSign, Loader2
} from 'lucide-react'
import { WarehouseApi } from '@/lib/features/warehouse/api'
import type { PurchaseOrder, PurchaseOrderDetail } from '@/lib/features/warehouse/api'

interface ViewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  order: PurchaseOrder
}

export default function ViewOrderModal({ 
  isOpen, 
  onClose, 
  order 
}: ViewOrderModalProps) {
  const [orderDetail, setOrderDetail] = useState<PurchaseOrderDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load order details - wrapped in useCallback to fix dependency warning
  const loadOrderDetails = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const detail = await WarehouseApi.purchaseOrders.get(order.id)
      setOrderDetail(detail)
    } catch (err) {
      console.error('Error loading order details:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des détails'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [order.id])

  useEffect(() => {
    if (isOpen && order) {
      loadOrderDetails()
    }
  }, [isOpen, order, loadOrderDetails])

  if (!isOpen) return null

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateShort = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const getStatutColor = (status: string) => {
    switch (status) {
      case 'draft': return 'text-gray-700 bg-gray-100 border-gray-300'
      case 'sent': return 'text-blue-700 bg-blue-100 border-blue-300'
      case 'confirmed': return 'text-orange-700 bg-orange-100 border-orange-300'
      case 'received': return 'text-green-700 bg-green-100 border-green-300'
      case 'cancelled': return 'text-red-700 bg-red-100 border-red-300'
      default: return 'text-gray-700 bg-gray-100 border-gray-300'
    }
  }

  const getStatutLabel = (status: string) => {
    switch (status) {
      case 'draft': return 'Brouillon'
      case 'sent': return 'Envoyé'
      case 'confirmed': return 'Confirmé'
      case 'received': return 'Reçu'
      case 'cancelled': return 'Annulé'
      default: return status
    }
  }

  const getStatutIcon = (status: string) => {
    switch (status) {
      case 'draft': return '📝'
      case 'sent': return '📤'
      case 'confirmed': return '✅'
      case 'received': return '📦'
      case 'cancelled': return '❌'
      default: return '📄'
    }
  }

  const calculateTotal = () => {
    if (!orderDetail) return parseFloat(order.total_amount)
    return orderDetail.items.reduce((sum, item) => {
      return sum + (parseFloat(item.quantity) * parseFloat(item.unit_price))
    }, 0)
  }

  const getTotalQuantity = () => {
    if (!orderDetail) return 0
    return orderDetail.items.reduce((sum, item) => sum + parseFloat(item.quantity), 0)
  }

  const isDeliveryLate = () => {
    if (!order.expected_delivery_date) return false
    if (order.status === 'received' || order.status === 'cancelled') return false
    return new Date(order.expected_delivery_date) < new Date()
  }

  const getDaysUntilDelivery = () => {
    if (!order.expected_delivery_date) return null
    const today = new Date()
    const delivery = new Date(order.expected_delivery_date)
    const diffTime = delivery.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Détails du bon de commande</h3>
              <p className="text-sm text-gray-600">{order.order_number}</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-green-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des détails...</p>
          </div>
        )}

        {/* Error State */}
        {error && !loading && (
          <div className="p-6">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start">
              <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-800">Erreur</h4>
                <p className="text-sm text-red-700">{error}</p>
              </div>
            </div>
            <div className="mt-4 flex justify-center">
              <button
                onClick={loadOrderDetails}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Réessayer
              </button>
            </div>
          </div>
        )}

        {/* Content */}
        {!loading && !error && orderDetail && (
          <div className="p-6 space-y-8">
            
            {/* Order Header */}
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <FileText className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Numéro</span>
                  </div>
                  <p className="text-lg font-bold text-gray-900">{orderDetail.order_number}</p>
                  <p className="text-xs text-gray-500">ID: {orderDetail.id}</p>
                </div>
                
                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Date commande</span>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">
                    {formatDateShort(orderDetail.order_date)}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <Calendar className="w-5 h-5 text-orange-600" />
                    <span className="text-sm font-medium text-gray-600">Livraison prévue</span>
                  </div>
                  <p className={`text-lg font-semibold ${isDeliveryLate() ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDateShort(orderDetail.expected_delivery_date)}
                  </p>
                  {getDaysUntilDelivery() !== null && !isDeliveryLate() && orderDetail.status !== 'received' && (
                    <p className="text-xs text-gray-500">{getDaysUntilDelivery()} jours restants</p>
                  )}
                  {isDeliveryLate() && (
                    <p className="text-xs text-red-600 font-medium">En retard</p>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg shadow-sm">
                  <div className="flex items-center space-x-3 mb-2">
                    <DollarSign className="w-5 h-5 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Montant total</span>
                  </div>
                  <p className="text-xl font-bold text-green-600">
                    {calculateTotal().toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DT
                  </p>
                </div>
              </div>
            </div>

            {/* Supplier Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-blue-500 rounded-lg">
                  <Building className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Informations fournisseur</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <Building className="w-4 h-4 text-blue-600" />
                      <span className="text-sm font-medium text-gray-600">Nom:</span>
                    </div>
                    <p className="text-base font-bold text-gray-900">
                      {orderDetail.supplier_name || `Fournisseur #${orderDetail.supplier}`}
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-600">ID:</span>
                    </div>
                    <p className="text-base text-gray-900">{orderDetail.supplier}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Status */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2 text-gray-600" />
                Statut de la commande
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <span className="text-sm font-medium text-gray-600 block mb-3">Statut actuel</span>
                  <div className="flex items-center space-x-3">
                    <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(orderDetail.status)}`}>
                      {getStatutIcon(orderDetail.status)} {getStatutLabel(orderDetail.status)}
                    </span>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <span className="text-sm font-medium text-gray-600 block mb-3">Créé le</span>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDateShort(orderDetail.created_at)}
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-lg p-6">
                  <span className="text-sm font-medium text-gray-600 block mb-3">Dernière modification</span>
                  <div className="text-lg font-bold text-gray-900">
                    {formatDateShort(orderDetail.updated_at)}
                  </div>
                </div>
              </div>
            </div>

            {/* Items Summary */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Résumé des articles commandés
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{orderDetail.items.length}</div>
                    <div className="text-sm text-gray-600">Articles différents</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {getTotalQuantity().toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600">Quantité totale</div>
                  </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-700">
                      {calculateTotal().toLocaleString('fr-FR', { minimumFractionDigits: 2 })}
                    </div>
                    <div className="text-sm text-gray-600">Montant (DT)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Items List */}
            <div>
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-600" />
                Articles commandés ({orderDetail.items.length})
              </h4>
              
              <div className="space-y-4">
                {orderDetail.items.map((item, index) => (
                  <div key={item.id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 flex-1 min-w-0">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg flex-shrink-0">
                          {index + 1}
                        </div>
                        <div className="min-w-0">
                          <h5 className="text-lg font-bold text-gray-900 mb-1 truncate">
                            {item.material_name || `Matériau #${item.material}`}
                          </h5>
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            {item.material_reference && (
                              <span className="px-2 py-1 bg-gray-100 rounded text-xs font-medium">
                                Ref: {item.material_reference}
                              </span>
                            )}
                            {item.material_unit && (
                              <span className="text-xs">Unité: {item.material_unit}</span>
                            )}
                          </div>
                          {item.received_quantity && parseFloat(item.received_quantity) > 0 && (
                            <div className="mt-1">
                              <span className="text-xs text-green-600 font-medium">
                                ✓ Reçu: {parseFloat(item.received_quantity).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                                {item.is_fully_received ? ' (Complet)' : ' (Partiel)'}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-6 flex-shrink-0">
                        {/* Quantity */}
                        <div className="text-center bg-gray-50 rounded-lg p-4 min-w-[80px]">
                          <div className="text-sm font-medium text-gray-600 mb-1">Quantité</div>
                          <div className="text-2xl font-bold text-gray-900">
                            {parseFloat(item.quantity).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                          </div>
                        </div>
                        
                        {/* Unit Price */}
                        <div className="text-center bg-gray-50 rounded-lg p-4 min-w-[100px]">
                          <div className="text-sm font-medium text-gray-600 mb-1">Prix unitaire</div>
                          <div className="text-xl font-bold text-blue-600">
                            {parseFloat(item.unit_price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DT
                          </div>
                        </div>
                        
                        {/* Subtotal */}
                        <div className="text-center bg-green-50 rounded-lg p-4 min-w-[120px] border-2 border-green-200">
                          <div className="text-sm font-medium text-green-700 mb-1">Sous-total</div>
                          <div className="text-xl font-bold text-green-600">
                            {item.total_price 
                              ? parseFloat(item.total_price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                              : (parseFloat(item.quantity) * parseFloat(item.unit_price)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                            } DT
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Grand Total */}
              <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-xl p-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-green-500 rounded-full">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">Montant total de la commande</h3>
                      <p className="text-gray-600">Somme de tous les articles</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-green-600">
                      {calculateTotal().toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DT
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Notes */}
            {orderDetail.notes && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-yellow-500 rounded-lg">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h4 className="text-xl font-bold text-gray-900">Notes et instructions</h4>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-yellow-200">
                  <p className="text-gray-700 leading-relaxed text-base whitespace-pre-wrap">
                    {orderDetail.notes}
                  </p>
                </div>
              </div>
            )}

            {/* Delivery Alerts */}
            {isDeliveryLate() && (
              <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-red-600" />
                  <div>
                    <h4 className="text-lg font-bold text-red-900">Livraison en retard</h4>
                    <p className="text-red-700">
                      La date de livraison prévue était le {formatDate(orderDetail.expected_delivery_date)}. 
                      Veuillez contacter le fournisseur pour obtenir une mise à jour.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {!isDeliveryLate() && getDaysUntilDelivery() !== null && getDaysUntilDelivery()! <= 7 && getDaysUntilDelivery()! > 0 && orderDetail.status !== 'received' && (
              <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
                <div className="flex items-center space-x-3">
                  <AlertTriangle className="w-6 h-6 text-orange-600" />
                  <div>
                    <h4 className="text-lg font-bold text-orange-900">Livraison proche</h4>
                    <p className="text-orange-700">
                      Cette commande doit être livrée dans {getDaysUntilDelivery()} jour{getDaysUntilDelivery()! > 1 ? 's' : ''} 
                      ({formatDate(orderDetail.expected_delivery_date)}).
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  )
}