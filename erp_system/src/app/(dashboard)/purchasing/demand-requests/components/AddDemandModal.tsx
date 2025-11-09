'use client'

import React, { useState } from 'react'
import { X, Plus, Check, User, AlertTriangle, Package, Calendar, MapPin, Loader2 } from 'lucide-react'
import { createDemandRequest } from '@/lib/features/purchasing/hooks'
import type { DemandPriority } from '@/lib/features/purchasing/api'

interface AddDemandModalProps {
  isOpen: boolean
  onClose: () => void
}

// Type for available materials
interface Material {
  id: string
  name: string
  uom: string
  estimatedPrice: number
}

// Type for form line items
interface FormLine {
  materialId: string
  materialName: string
  uom: string
  quantity: number
  suggestedSupplier?: string
  estimatedPrice?: number
}

export default function AddDemandModal({ isOpen, onClose }: AddDemandModalProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  
  const [formData, setFormData] = useState({
    site: '',
    requesterId: '1', // Default to user ID 1
    requesterName: '',
    priority: 'medium' as DemandPriority,
    category: '',
    neededDate: '',
    lines: [] as FormLine[],
    comment: ''
  })

  // Example materials - in real app, fetch from API or props
  const [availableMaterials] = useState<Material[]>([
    { id: 'MAT001', name: 'Ordinateur portable Dell', uom: 'pièce', estimatedPrice: 2500 },
    { id: 'MAT002', name: 'Imprimante laser HP', uom: 'pièce', estimatedPrice: 800 },
    { id: 'MAT003', name: 'Écran 24 pouces', uom: 'pièce', estimatedPrice: 450 },
    { id: 'MAT004', name: 'Clavier sans fil', uom: 'pièce', estimatedPrice: 75 },
    { id: 'MAT005', name: 'Câbles réseau Cat6', uom: 'mètre', estimatedPrice: 15 },
    { id: 'MAT006', name: 'Papier A4', uom: 'ramette', estimatedPrice: 8 },
    { id: 'MAT007', name: 'Cartouches d&apos;encre', uom: 'pièce', estimatedPrice: 45 }
  ])

  const [errors, setErrors] = useState({
    site: '',
    requesterId: '',
    category: '',
    lines: ''
  })

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      site: '',
      requesterId: '',
      category: '',
      lines: ''
    }

    if (!formData.site.trim()) {
      newErrors.site = 'Le site est requis'
    }

    if (!formData.requesterId.trim()) {
      newErrors.requesterId = 'L&apos;ID du demandeur est requis'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La catégorie est requise'
    }

    if (formData.lines.length === 0) {
      newErrors.lines = 'Au moins un article doit être sélectionné'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSave = async () => {
    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)
    
    try {
      // Prepare the payload for API
      // Backend expects requester_name to be a user ID, not a name string
      const payload = {
        date: new Date().toISOString().split('T')[0],
        site: formData.site,
        requester_id: formData.requesterId, // User ID
        requester_name: formData.requesterId, // ALSO send as user ID (backend expects FK)
        priority: formData.priority,
        category: formData.category,
        needed_date: formData.neededDate || undefined,
        comment: formData.comment || undefined,
        lines: formData.lines.map(line => ({
          material_id: line.materialId,
          material_name: line.materialName,
          uom: line.uom,
          quantity: line.quantity.toString(),
          suggested_supplier: line.suggestedSupplier || '',
          estimated_price: line.estimatedPrice?.toString() || '',
          needed_date: formData.neededDate || ''
        }))
      }

      console.log('Creating demand with payload:', payload)

      // Call the API
      await createDemandRequest(payload)
      
      console.log('Demand created successfully')
      
      // Reset form
      setFormData({
        site: '',
        requesterId: '1',
        requesterName: '',
        priority: 'medium',
        category: '',
        neededDate: '',
        lines: [],
        comment: ''
      })
      setErrors({ site: '', requesterId: '', category: '', lines: '' })
      
      // Close modal - this will trigger refresh in parent
      onClose()
    } catch (error) {
      console.error('Failed to create demand:', error)
      
      // Show more detailed error message
      let errorMessage = 'Erreur lors de la création de la demande'
      
      if (error instanceof Error) {
        errorMessage = error.message
      } else if (typeof error === 'object' && error !== null) {
        if ('detail' in error && typeof error.detail === 'string') {
          errorMessage = error.detail
        } else if ('status' in error) {
          errorMessage = `Erreur HTTP ${error.status}`
        }
      }
      
      alert(`Erreur: ${errorMessage}`)
    } finally {
      setIsSubmitting(false)
    }
  }

  const addMaterialToForm = (material: Material) => {
    const existing = formData.lines.find(l => l.materialId === material.id)
    if (existing) {
      setFormData({
        ...formData,
        lines: formData.lines.map(l => 
          l.materialId === material.id ? { ...l, quantity: l.quantity + 1 } : l
        )
      })
    } else {
      setFormData({
        ...formData,
        lines: [...formData.lines, {
          materialId: material.id,
          materialName: material.name,
          uom: material.uom,
          quantity: 1,
          estimatedPrice: material.estimatedPrice
        }]
      })
    }
    if (errors.lines) {
      setErrors({ ...errors, lines: '' })
    }
  }

  const updateLineQuantity = (materialId: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeLineFromForm(materialId)
    } else {
      setFormData({
        ...formData,
        lines: formData.lines.map(l => 
          l.materialId === materialId ? { ...l, quantity: newQuantity } : l
        )
      })
    }
  }

  const updateLinePrice = (materialId: string, newPrice: number) => {
    setFormData({
      ...formData,
      lines: formData.lines.map(l => 
        l.materialId === materialId ? { ...l, estimatedPrice: newPrice } : l
      )
    })
  }

  const removeLineFromForm = (materialId: string) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter(l => l.materialId !== materialId)
    })
  }

  const handleClose = () => {
    setFormData({
      site: '',
      requesterId: '1',
      requesterName: '',
      priority: 'medium',
      category: '',
      neededDate: '',
      lines: [],
      comment: ''
    })
    setErrors({ site: '', requesterId: '', category: '', lines: '' })
    onClose()
  }

  const getTotalEstimated = () => {
    return formData.lines.reduce((total, line) => {
      return total + (line.quantity * (line.estimatedPrice || 0))
    }, 0)
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Nouvelle demande d&apos;achat
          </h3>
          <button 
            onClick={handleClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors disabled:opacity-50"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Requester Information */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Informations du demandeur</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Demandeur * (User ID)
                </label>
                <input
                  type="text"
                  value={formData.requesterId}
                  onChange={(e) => {
                    setFormData({ ...formData, requesterId: e.target.value })
                    if (errors.requesterId) {
                      setErrors({ ...errors, requesterId: '' })
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                    errors.requesterId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: 1, 2, 3..."
                />
                {errors.requesterId && (
                  <p className="mt-1 text-sm text-red-600">{errors.requesterId}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">ID numérique de l&apos;utilisateur</p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Complet (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.requesterName}
                  onChange={(e) => setFormData({ ...formData, requesterName: e.target.value })}
                  disabled={isSubmitting}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                  placeholder="Prénom Nom"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <MapPin className="w-4 h-4 inline mr-1" />
                  Site *
                </label>
                <input
                  type="text"
                  value={formData.site}
                  onChange={(e) => {
                    setFormData({ ...formData, site: e.target.value })
                    if (errors.site) {
                      setErrors({ ...errors, site: '' })
                    }
                  }}
                  disabled={isSubmitting}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                    errors.site ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Bureau principal"
                />
                {errors.site && (
                  <p className="mt-1 text-sm text-red-600">{errors.site}</p>
                )}
              </div>
            </div>
          </div>

          {/* Request Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Package className="w-4 h-4 inline mr-1" />
                Catégorie *
              </label>
              <select
                value={formData.category}
                onChange={(e) => {
                  setFormData({ ...formData, category: e.target.value })
                  if (errors.category) {
                    setErrors({ ...errors, category: '' })
                  }
                }}
                disabled={isSubmitting}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 ${
                  errors.category ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Sélectionner...</option>
                <option value="Informatique">Informatique</option>
                <option value="Fournitures">Fournitures</option>
                <option value="Équipement">Équipement</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Autre">Autre</option>
              </select>
              {errors.category && (
                <p className="mt-1 text-sm text-red-600">{errors.category}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-1" />
                Priorité *
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value as DemandPriority })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
              >
                <option value="low">🟢 Basse</option>
                <option value="medium">🟡 Moyenne</option>
                <option value="high">🔴 Haute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-1" />
                Date souhaitée
              </label>
              <input
                type="date"
                value={formData.neededDate}
                onChange={(e) => setFormData({ ...formData, neededDate: e.target.value })}
                disabled={isSubmitting}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          {/* Material Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Articles disponibles
            </label>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {availableMaterials
                .filter(m => !formData.lines.find(l => l.materialId === m.id))
                .map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm font-medium text-gray-900 block truncate">{material.name}</span>
                    <div className="text-xs text-gray-500">
                      {material.uom} • Prix estimé: {material.estimatedPrice?.toLocaleString() || 0} DA
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addMaterialToForm(material)}
                    disabled={isSubmitting}
                    className="text-blue-600 hover:text-blue-800 p-2 rounded-full hover:bg-blue-50 transition-colors flex-shrink-0 disabled:opacity-50"
                    title={`Ajouter ${material.name}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.lines && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.lines}
              </p>
            )}
          </div>

          {/* Selected Items */}
          {formData.lines.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  Articles sélectionnés ({formData.lines.length})
                </span>
                <span className="text-lg font-bold text-green-700">
                  Total: {getTotalEstimated().toLocaleString()} DA
                </span>
              </h4>
              <div className="space-y-3">
                {formData.lines.map((line, index) => (
                  <div key={line.materialId} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-green-200">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full text-xs font-bold text-green-800 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0">
                        <span className="text-sm font-medium text-gray-900 block truncate">{line.materialName}</span>
                        <span className="text-xs text-gray-500">{line.uom}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 flex-shrink-0">
                      {/* Quantity */}
                      <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                        <button
                          type="button"
                          onClick={() => updateLineQuantity(line.materialId, line.quantity - 1)}
                          disabled={isSubmitting}
                          className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold disabled:opacity-50"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-gray-900">{line.quantity}</span>
                        <button
                          type="button"
                          onClick={() => updateLineQuantity(line.materialId, line.quantity + 1)}
                          disabled={isSubmitting}
                          className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold disabled:opacity-50"
                        >
                          +
                        </button>
                      </div>

                      {/* Price */}
                      <div className="flex items-center space-x-1">
                        <input
                          type="number"
                          value={line.estimatedPrice || 0}
                          onChange={(e) => updateLinePrice(line.materialId, parseFloat(e.target.value) || 0)}
                          disabled={isSubmitting}
                          className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                          min="0"
                          step="0.01"
                        />
                        <span className="text-xs text-gray-600">DA</span>
                      </div>

                      {/* Subtotal */}
                      <div className="text-right min-w-[80px]">
                        <div className="text-xs text-gray-600">Total:</div>
                        <div className="text-sm font-bold text-gray-900">
                          {((line.quantity || 0) * (line.estimatedPrice || 0)).toLocaleString()} DA
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeLineFromForm(line.materialId)}
                        disabled={isSubmitting}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors disabled:opacity-50"
                        title="Supprimer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Comments */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et justifications
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              disabled={isSubmitting}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none disabled:opacity-50"
              placeholder="Décrivez la raison de cette demande, l&apos;urgence, les spécifications particulières..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Champs obligatoires:</span> ID demandeur, site, catégorie et articles
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              disabled={isSubmitting}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSave}
              disabled={isSubmitting}
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Création en cours...</span>
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>Créer la demande</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}