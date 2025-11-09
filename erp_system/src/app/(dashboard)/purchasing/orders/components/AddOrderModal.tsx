'use client'

import React, { useState } from 'react'
import { X, Plus, Check, Building, AlertTriangle, Package, Calendar, Loader2 } from 'lucide-react'
import { WarehouseApi } from '@/lib/features/warehouse/api'
import type { Supplier, Material, PurchaseOrderInput } from '@/lib/features/warehouse/api'

interface AddOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSuccess: () => void
  suppliers: Supplier[]
  materials: Material[]
}

interface OrderItem {
  material: number
  material_name?: string
  quantity: string
  unit_price: string
}

export default function AddOrderModal({ 
  isOpen, 
  onClose, 
  onSuccess,
  suppliers, 
  materials 
}: AddOrderModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    supplier: 0,
    order_date: new Date().toISOString().split('T')[0],
    expected_delivery_date: '',
    notes: '',
    items: [] as OrderItem[]
  })

  const [errors, setErrors] = useState({
    supplier: '',
    expected_delivery_date: '',
    items: '',
    general: ''
  })

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      supplier: '',
      expected_delivery_date: '',
      items: '',
      general: ''
    }

    if (!formData.supplier || formData.supplier === 0) {
      newErrors.supplier = 'Veuillez sélectionner un fournisseur'
    }

    if (!formData.expected_delivery_date) {
      newErrors.expected_delivery_date = 'La date de livraison est requise'
    } else {
      const today = new Date().toISOString().split('T')[0]
      if (formData.expected_delivery_date < today) {
        newErrors.expected_delivery_date = 'La date de livraison doit être dans le futur'
      }
    }

    if (formData.items.length === 0) {
      newErrors.items = 'Au moins un article doit être sélectionné'
    }

    // Validate item quantities and prices
    const hasInvalidItems = formData.items.some(
      item => parseFloat(item.quantity) <= 0 || parseFloat(item.unit_price) < 0
    )
    if (hasInvalidItems) {
      newErrors.items = 'Tous les articles doivent avoir une quantité > 0 et un prix >= 0'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const calculateTotal = () => {
    return formData.items.reduce((total, item) => {
      return total + (parseFloat(item.quantity) * parseFloat(item.unit_price))
    }, 0)
  }

  const handleSave = async () => {
    if (!validateForm()) return

    setLoading(true)
    setErrors({ ...errors, general: '' })

    try {
      // Generate order number (format: BC-YYYY-XXXX)
      const year = new Date().getFullYear()
      const randomNum = Math.floor(Math.random() * 10000).toString().padStart(4, '0')
      const order_number = `BC-${year}-${randomNum}`

      const payload: PurchaseOrderInput = {
        order_number,
        supplier: formData.supplier,
        order_date: formData.order_date,
        expected_delivery_date: formData.expected_delivery_date || null,
        notes: formData.notes || undefined,
        status: 'draft',
        items: formData.items.map(item => ({
          material: item.material,
          quantity: item.quantity,
          unit_price: item.unit_price
        }))
      }

      await WarehouseApi.purchaseOrders.create(payload)
      
      // Reset form
      setFormData({
        supplier: 0,
        order_date: new Date().toISOString().split('T')[0],
        expected_delivery_date: '',
        notes: '',
        items: []
      })
      
      onSuccess()
    } catch (error: unknown) {
      console.error('Error creating purchase order:', error)
      setErrors({ 
        ...errors, 
          general: error instanceof Error ? error.message : 'Erreur lors de la création du bon de commande'})
    } finally {
      setLoading(false)
    }
  }

  const handleSupplierChange = (supplierId: number) => {
    setFormData({ ...formData, supplier: supplierId })
    if (errors.supplier) {
      setErrors({ ...errors, supplier: '' })
    }
  }

  const addMaterialToForm = (material: Material) => {
    const existing = formData.items.find(item => item.material === material.id)
    
    if (existing) {
      // Increment quantity if already exists
      const updatedItems = formData.items.map(item => 
        item.material === material.id 
          ? { ...item, quantity: (parseFloat(item.quantity) + 1).toString() }
          : item
      )
      setFormData({ ...formData, items: updatedItems })
    } else {
      // Add new item
      const newItem: OrderItem = {
        material: material.id,
        material_name: material.name,
        quantity: '1',
        unit_price: material.price
      }
      setFormData({ ...formData, items: [...formData.items, newItem] })
    }
    
    if (errors.items) {
      setErrors({ ...errors, items: '' })
    }
  }

  const updateItemQuantity = (materialId: number, newQuantity: string) => {
    const qty = parseFloat(newQuantity)
    
    if (qty <= 0 || isNaN(qty)) {
      removeItemFromForm(materialId)
    } else {
      const updatedItems = formData.items.map(item => 
        item.material === materialId ? { ...item, quantity: newQuantity } : item
      )
      setFormData({ ...formData, items: updatedItems })
    }
  }

  const updateItemPrice = (materialId: number, newPrice: string) => {
    const updatedItems = formData.items.map(item => 
      item.material === materialId ? { ...item, unit_price: newPrice } : item
    )
    setFormData({ ...formData, items: updatedItems })
  }

  const removeItemFromForm = (materialId: number) => {
    const updatedItems = formData.items.filter(item => item.material !== materialId)
    setFormData({ ...formData, items: updatedItems })
  }

  const handleClose = () => {
    setFormData({
      supplier: 0,
      order_date: new Date().toISOString().split('T')[0],
      expected_delivery_date: '',
      notes: '',
      items: []
    })
    setErrors({ supplier: '', expected_delivery_date: '', items: '', general: '' })
    onClose()
  }

  const selectedSupplier = suppliers.find(s => s.id === formData.supplier)

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-green-500 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Nouveau bon de commande
          </h3>
          <button 
            onClick={handleClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Error Alert */}
        {errors.general && (
          <div className="m-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
            <AlertTriangle className="w-5 h-5 text-red-600 mr-3 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="text-sm font-semibold text-red-800">Erreur</h4>
              <p className="text-sm text-red-700">{errors.general}</p>
            </div>
          </div>
        )}

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Section Fournisseur */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Building className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Informations fournisseur</h4>
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fournisseur *
                </label>
                <select
                  value={formData.supplier}
                  onChange={(e) => handleSupplierChange(parseInt(e.target.value))}
                  disabled={loading}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed ${
                    errors.supplier ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value={0}>Sélectionner un fournisseur</option>
                  {suppliers.map((supplier) => (
                    <option key={supplier.id} value={supplier.id}>
                      {supplier.name} {supplier.email ? `- ${supplier.email}` : ''}
                    </option>
                  ))}
                </select>
                {errors.supplier && (
                  <p className="mt-1 text-sm text-red-600">{errors.supplier}</p>
                )}
              </div>

              {selectedSupplier && (
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    {selectedSupplier.email && (
                      <div>
                        <span className="font-medium text-gray-600">Email:</span>
                        <p className="text-gray-900">{selectedSupplier.email}</p>
                      </div>
                    )}
                    {selectedSupplier.phone && (
                      <div>
                        <span className="font-medium text-gray-600">Téléphone:</span>
                        <p className="text-gray-900">{selectedSupplier.phone}</p>
                      </div>
                    )}
                    {selectedSupplier.address && (
                      <div className="md:col-span-2">
                        <span className="font-medium text-gray-600">Adresse:</span>
                        <p className="text-gray-900">{selectedSupplier.address}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Détails du bon de commande */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de commande
              </label>
              <input
                type="date"
                value={formData.order_date}
                onChange={(e) => setFormData({ ...formData, order_date: e.target.value })}
                disabled={loading}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de livraison prévue *
              </label>
              <input
                type="date"
                value={formData.expected_delivery_date}
                onChange={(e) => {
                  setFormData({ ...formData, expected_delivery_date: e.target.value })
                  if (errors.expected_delivery_date) {
                    setErrors({ ...errors, expected_delivery_date: '' })
                  }
                }}
                disabled={loading}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100 ${
                  errors.expected_delivery_date ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date().toISOString().split('T')[0]}
              />
              {errors.expected_delivery_date && (
                <p className="mt-1 text-sm text-red-600">{errors.expected_delivery_date}</p>
              )}
            </div>
          </div>

          {/* Sélection des matériaux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Package className="w-4 h-4 inline mr-2" />
              Matériaux disponibles
            </label>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {materials.length === 0 ? (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Aucun matériau disponible
                </div>
              ) : (
                materials.map((material) => (
                  <div key={material.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <div className="flex-1 min-w-0">
                        <span className="text-sm font-medium text-gray-900 block truncate">
                          {material.name}
                        </span>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="px-2 py-1 text-xs rounded-full font-medium bg-gray-100 text-gray-800 border border-gray-200">
                            {material.reference}
                          </span>
                          <span className="text-xs text-gray-500">
                            Prix: {parseFloat(material.price).toLocaleString()} DT / {material.unit}
                          </span>
                          <span className={`text-xs font-medium ${
                            material.is_low_stock ? 'text-red-600' : 'text-green-600'
                          }`}>
                            Stock: {parseFloat(material.stock).toLocaleString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => addMaterialToForm(material)}
                      disabled={loading}
                      className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors disabled:opacity-50 flex-shrink-0"
                      title={`Ajouter ${material.name}`}
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
            {errors.items && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.items}
              </p>
            )}
          </div>

          {/* Articles sélectionnés */}
          {formData.items.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  Articles sélectionnés ({formData.items.length})
                </span>
                <span className="text-xl font-bold text-green-700">
                  Total: {calculateTotal().toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DT
                </span>
              </h4>
              
              <div className="space-y-3">
                {formData.items.map((item, index) => {
                  const material = materials.find(m => m.id === item.material)
                  return (
                    <div key={item.material} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center space-x-3 min-w-0">
                          <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full text-xs font-bold text-green-800 flex-shrink-0">
                            {index + 1}
                          </div>
                          <div className="w-3 h-3 rounded-full bg-blue-500 flex-shrink-0" />
                          <div className="min-w-0">
                            <span className="text-sm font-medium text-gray-900 block truncate">
                              {item.material_name || material?.name || `Matériau #${item.material}`}
                            </span>
                            {material && (
                              <span className="text-xs text-gray-500">
                                Ref: {material.reference} • Unité: {material.unit}
                              </span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-4 flex-shrink-0">
                          {/* Quantité */}
                          <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.material, (parseFloat(item.quantity) - 1).toString())}
                              disabled={loading}
                              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold disabled:opacity-50"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              value={item.quantity}
                              onChange={(e) => updateItemQuantity(item.material, e.target.value)}
                              disabled={loading}
                              className="w-16 text-center text-sm font-bold text-gray-900 border border-gray-300 rounded px-1 py-1 disabled:bg-gray-100"
                              min="0"
                              step="1"
                            />
                            <button
                              type="button"
                              onClick={() => updateItemQuantity(item.material, (parseFloat(item.quantity) + 1).toString())}
                              disabled={loading}
                              className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold disabled:opacity-50"
                            >
                              +
                            </button>
                          </div>

                          {/* Prix unitaire */}
                          <div className="flex items-center space-x-2">
                            <span className="text-sm text-gray-600">Prix:</span>
                            <input
                              type="number"
                              value={item.unit_price}
                              onChange={(e) => updateItemPrice(item.material, e.target.value)}
                              disabled={loading}
                              className="w-24 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500 disabled:bg-gray-100"
                              min="0"
                              step="0.01"
                            />
                            <span className="text-sm text-gray-600">DT</span>
                          </div>

                          {/* Sous-total */}
                          <div className="text-right min-w-[100px]">
                            <div className="text-xs text-gray-600">Sous-total:</div>
                            <div className="text-sm font-bold text-gray-900">
                              {(parseFloat(item.quantity) * parseFloat(item.unit_price)).toLocaleString('fr-FR', { minimumFractionDigits: 2 })} DT
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeItemFromForm(item.material)}
                            disabled={loading}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes et instructions
            </label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              disabled={loading}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none disabled:bg-gray-100"
              placeholder="Instructions de livraison, spécifications particulières, conditions de paiement..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Optionnel - Ces informations seront transmises au fournisseur
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Champs obligatoires:</span> Fournisseur, date de livraison et au moins un article
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSave}
              disabled={loading}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Créer le bon de commande</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}