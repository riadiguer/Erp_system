'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { X, Check, Package, Calendar, Building, AlertTriangle, FileText, Truck, Loader2 } from 'lucide-react'
import { WarehouseApi } from '@/lib/features/warehouse/api'
import type { PurchaseOrder, PurchaseOrderDetail } from '@/lib/features/warehouse/api'

interface ReceiveOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  order: PurchaseOrder
}

export default function ReceiveOrderModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  order 
}: ReceiveOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [loadingDetails, setLoadingDetails] = useState(true)
  const [orderDetail, setOrderDetail] = useState<PurchaseOrderDetail | null>(null)
  const [receptionData, setReceptionData] = useState({
    delivery_date: new Date().toISOString().split('T')[0],
    notes: ''
  })

  const [errors, setErrors] = useState({
    delivery_date: '',
    general: ''
  })

  // Load full order details - wrapped in useCallback to fix dependency warning
  const loadOrderDetails = useCallback(async () => {
    setLoadingDetails(true)
    try {
      const detail = await WarehouseApi.purchaseOrders.get(order.id)
      setOrderDetail(detail)
    } catch (err) {
      console.error('Error loading order details:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du chargement des détails'
      setErrors(prev => ({ ...prev, general: errorMessage }))
    } finally {
      setLoadingDetails(false)
    }
  }, [order.id])

  useEffect(() => {
    if (order && isOpen) {
      loadOrderDetails()
    }
  }, [order, isOpen, loadOrderDetails])

  if (!isOpen || !order) return null

  const validateForm = () => {
    const newErrors = {
      delivery_date: '',
      general: ''
    }

    if (!receptionData.delivery_date) {
      newErrors.delivery_date = 'La date de réception est requise'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleReceive = async () => {
    if (!validateForm()) return

    setLoading(true)
    setErrors({ ...errors, general: '' })

    try {
      await WarehouseApi.purchaseOrders.receive(order.id, {
        delivery_date: receptionData.delivery_date
      })
      onSuccess()
    } catch (error) {
      console.error('Error receiving purchase order:', error)
      const errorMessage = error instanceof Error ? error.message : 'Erreur lors de la réception du bon de commande'
      setErrors(prev => ({ 
        ...prev, 
        general: errorMessage
      }))
      setLoading(false)
    }
  }

  const getTotalQuantity = () => {
    if (!orderDetail) return 0
    return orderDetail.items.reduce((total, item) => total + parseFloat(item.quantity), 0)
  }

  const getTotalReceived = () => {
    if (!orderDetail) return 0
    return orderDetail.items.reduce((total, item) => {
      return total + parseFloat(item.received_quantity || '0')
    }, 0)
  }

  const isFullyReceived = () => {
    if (!orderDetail) return false
    return orderDetail.items.every(item => item.is_fully_received)
  }

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: string | number) => {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount
    return num.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg mr-3">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Réception de commande</div>
              <div className="text-sm font-normal text-gray-600">
                Bon n° {order.order_number}
              </div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            disabled={loading || loadingDetails}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Loading State */}
        {loadingDetails && (
          <div className="p-12 text-center">
            <Loader2 className="w-8 h-8 text-purple-600 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Chargement des détails...</p>
          </div>
        )}

        {/* Error Alert */}
        {errors.general && !loadingDetails && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Erreur</h4>
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Content */}
        {!loadingDetails && orderDetail && (
          <div className="p-6 space-y-6">
            
            {/* Order Summary */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="w-5 h-5 mr-2 text-blue-600" />
                Informations de la commande
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center text-sm text-blue-600 mb-1">
                    <Building className="w-4 h-4 mr-2" />
                    Fournisseur
                  </div>
                  <div className="font-bold text-gray-900">
                    {orderDetail.supplier_name || `Fournisseur #${orderDetail.supplier}`}
                  </div>
                </div>
                
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center text-sm text-blue-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Date commande
                  </div>
                  <div className="font-bold text-gray-900">
                    {new Date(orderDetail.order_date).toLocaleDateString('fr-FR')}
                  </div>
                  {orderDetail.expected_delivery_date && (
                    <div className="text-sm text-gray-500">
                      Livraison prévue: {new Date(orderDetail.expected_delivery_date).toLocaleDateString('fr-FR')}
                    </div>
                  )}
                </div>

                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center text-sm text-blue-600 mb-1">
                    <Package className="w-4 h-4 mr-2" />
                    Montant total
                  </div>
                  <div className="font-bold text-gray-900">
                    {formatCurrency(orderDetail.total_amount)} DT
                  </div>
                  <div className="text-sm text-gray-500">
                    {orderDetail.items.length} article{orderDetail.items.length > 1 ? 's' : ''}
                  </div>
                </div>
              </div>
            </div>

            {/* Reception Information */}
            <div className="bg-green-50 border border-green-200 rounded-xl p-6">
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Truck className="w-5 h-5 mr-2 text-green-600" />
                Détails de la réception
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de réception *
                  </label>
                  <input
                    type="date"
                    value={receptionData.delivery_date}
                    onChange={(e) => {
                      setReceptionData({ ...receptionData, delivery_date: e.target.value })
                      if (errors.delivery_date) {
                        setErrors({ ...errors, delivery_date: '' })
                      }
                    }}
                    disabled={loading}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                      errors.delivery_date ? 'border-red-500' : 'border-gray-300'
                    }`}
                    max={new Date().toISOString().split('T')[0]}
                  />
                  {errors.delivery_date && (
                    <p className="mt-1 text-sm text-red-600">{errors.delivery_date}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes de réception
                  </label>
                  <textarea
                    value={receptionData.notes}
                    onChange={(e) => setReceptionData({ ...receptionData, notes: e.target.value })}
                    disabled={loading}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none disabled:bg-gray-100"
                    placeholder="Observations sur la réception..."
                  />
                </div>
              </div>
            </div>

            {/* Items Detail */}
            <div>
              <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
                <Package className="w-5 h-5 mr-2 text-gray-600" />
                Articles à recevoir ({orderDetail.items.length})
              </h4>
              
              <div className="space-y-4">
                {orderDetail.items.map((item, index) => (
                  <div key={item.id || index} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="text-lg font-bold text-gray-900">
                            {item.material_name || `Matériau #${item.material}`}
                          </h5>
                          {item.material_reference && (
                            <div className="flex items-center space-x-2 mt-1">
                              <span className="px-3 py-1 text-sm font-medium rounded-full border-2 bg-gray-100 text-gray-800 border-gray-200">
                                Ref: {item.material_reference}
                              </span>
                              {item.material_unit && (
                                <span className="text-sm text-gray-500">
                                  Unité: {item.material_unit}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Quantity Ordered */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-blue-700">Commandée</div>
                        <div className="text-xl font-bold text-blue-600">
                          {parseFloat(item.quantity).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                        </div>
                      </div>

                      {/* Already Received */}
                      <div className={`p-3 rounded-lg border ${
                        item.received_quantity && parseFloat(item.received_quantity) > 0
                          ? 'bg-orange-50 border-orange-200'
                          : 'bg-gray-50 border-gray-200'
                      }`}>
                        <div className={`text-sm font-medium ${
                          item.received_quantity && parseFloat(item.received_quantity) > 0
                            ? 'text-orange-700'
                            : 'text-gray-700'
                        }`}>
                          Déjà reçue
                        </div>
                        <div className={`text-xl font-bold ${
                          item.received_quantity && parseFloat(item.received_quantity) > 0
                            ? 'text-orange-600'
                            : 'text-gray-600'
                        }`}>
                          {item.received_quantity 
                            ? parseFloat(item.received_quantity).toLocaleString('fr-FR', { maximumFractionDigits: 2 })
                            : '0'}
                        </div>
                      </div>

                      {/* Unit Price */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-gray-700">Prix unitaire</div>
                        <div className="text-lg font-bold text-gray-900">
                          {parseFloat(item.unit_price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DT
                        </div>
                      </div>

                      {/* Subtotal */}
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="text-sm font-medium text-purple-700">Sous-total</div>
                        <div className="text-lg font-bold text-purple-600">
                          {item.total_price
                            ? parseFloat(item.total_price).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                            : (parseFloat(item.quantity) * parseFloat(item.unit_price)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })
                          } DT
                        </div>
                      </div>
                    </div>

                    {/* Reception Status */}
                    <div className="mt-4 flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        {item.is_fully_received ? (
                          <>
                            <Check className="w-5 h-5 text-green-600" />
                            <span className="text-sm font-medium text-green-600">Article déjà complètement reçu</span>
                          </>
                        ) : item.received_quantity && parseFloat(item.received_quantity) > 0 ? (
                          <>
                            <AlertTriangle className="w-5 h-5 text-orange-600" />
                            <span className="text-sm font-medium text-orange-600">
                              Partiellement reçu - Reste: {(parseFloat(item.quantity) - parseFloat(item.received_quantity)).toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                            </span>
                          </>
                        ) : (
                          <>
                            <Package className="w-5 h-5 text-blue-600" />
                            <span className="text-sm font-medium text-blue-600">Pas encore reçu</span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Check className="w-6 h-6 mr-2 text-purple-600" />
                Récapitulatif
              </h4>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Articles commandés:</span>
                    <span className="font-bold text-gray-900">{orderDetail.items.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Quantité totale commandée:</span>
                    <span className="font-bold text-gray-900">
                      {getTotalQuantity().toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Déjà reçue:</span>
                    <span className={`font-bold ${getTotalReceived() > 0 ? 'text-orange-600' : 'text-gray-600'}`}>
                      {getTotalReceived().toLocaleString('fr-FR', { maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Montant total:</span>
                    <span className="font-bold text-gray-900">{formatCurrency(orderDetail.total_amount)} DT</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-gray-700">Statut:</span>
                    <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                      isFullyReceived() ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {isFullyReceived() ? 'Complètement reçu' : 'À recevoir'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Alerts */}
              {isFullyReceived() && (
                <div className="mt-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
                  <div className="flex items-center text-orange-800">
                    <AlertTriangle className="w-5 h-5 mr-2" />
                    <span className="font-medium">
                      Cette commande est déjà complètement reçue. Une nouvelle réception mettra à jour la date de livraison.
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Important Info */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-start">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-3 flex-shrink-0 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-semibold mb-1">Important:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Cette action marquera la commande comme &quot;Reçue&quot;</li>
                    <li>Le stock sera automatiquement mis à jour pour tous les articles</li>
                    <li>La date de livraison sera enregistrée: {formatDate(receptionData.delivery_date)}</li>
                    <li>Cette opération ne peut pas être annulée directement</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        {!loadingDetails && (
          <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-200 rounded-b-xl">
            <div className="text-sm text-gray-600">
              <span className="font-medium">Confirmation requise</span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                disabled={loading}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Annuler
              </button>
              
              <button
                onClick={handleReceive}
                disabled={loading}
                className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Réception en cours...</span>
                  </>
                ) : (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Confirmer la réception</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}