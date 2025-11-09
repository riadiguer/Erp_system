'use client'
import React, { useState, useEffect } from 'react'
import { X, Plus, Check, User, AlertTriangle, Edit, Building2, Package, Calendar } from 'lucide-react'
import type { DemandRequest, DemandLine, DemandPriority } from '@/lib/features/purchasing/api'
import { statusFromApi } from '@/lib/features/purchasing/api'

interface Material {
  id: string
  name: string
  uom: string
}

interface EditDemandModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: {
    site: string
    requester_id: string
    requester_name: string
    priority: DemandPriority
    category: string
    needed_date?: string
    comment?: string
    lines: DemandLine[]
  }) => void
  demande: DemandRequest | null
  availableMaterials: Material[]
}

export default function EditDemandModal({ 
  isOpen, 
  onClose, 
  onSave, 
  demande,
  availableMaterials
}: EditDemandModalProps) {
  const [formData, setFormData] = useState({
    site: '',
    requester_id: '',
    requester_name: '',
    priority: 'medium' as DemandPriority,
    category: '',
    needed_date: '',
    comment: '',
    lines: [] as DemandLine[]
  })

  const [errors, setErrors] = useState({
    site: '',
    requester_name: '',
    category: '',
    lines: ''
  })

  // Initialize form with demand data
  useEffect(() => {
    if (demande && isOpen) {
      setFormData({
        site: demande.site,
        requester_id: demande.requester_id,
        requester_name: demande.requester_name,
        priority: demande.priority,
        category: demande.category,
        needed_date: demande.needed_date || '',
        comment: demande.comment || '',
        lines: demande.lines.map(line => ({ ...line }))
      })
    }
  }, [demande, isOpen])

  if (!isOpen || !demande) return null

  const validateForm = () => {
    const newErrors = {
      site: '',
      requester_name: '',
      category: '',
      lines: ''
    }

    if (!formData.site.trim()) {
      newErrors.site = 'Le site est requis'
    }

    if (!formData.requester_name.trim()) {
      newErrors.requester_name = 'Le nom du demandeur est requis'
    }

    if (!formData.category.trim()) {
      newErrors.category = 'La catégorie est requise'
    }

    if (formData.lines.length === 0) {
      newErrors.lines = 'Au moins un article doit être ajouté'
    }

    // Validate each line
    const hasInvalidLines = formData.lines.some(line => 
      !line.material_id || 
      !line.material_name || 
      !line.quantity || 
      parseFloat(line.quantity) <= 0
    )

    if (hasInvalidLines) {
      newErrors.lines = 'Tous les articles doivent avoir un matériel et une quantité valide'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  const addMaterialToForm = (material: Material) => {
    const newLine: DemandLine = {
      material_id: material.id,
      material_name: material.name,
      uom: material.uom,
      quantity: '1',
      suggested_supplier: '',
      estimated_price: '',
      needed_date: formData.needed_date || ''
    }
    
    setFormData({
      ...formData,
      lines: [...formData.lines, newLine]
    })
    
    if (errors.lines) {
      setErrors({ ...errors, lines: '' })
    }
  }

  const updateLineQuantity = (index: number, quantity: string) => {
    const newLines = [...formData.lines]
    newLines[index].quantity = quantity
    setFormData({ ...formData, lines: newLines })
  }

  const updateLineField = (index: number, field: keyof DemandLine, value: string) => {
    const newLines = [...formData.lines]
    newLines[index] = { ...newLines[index], [field]: value }
    setFormData({ ...formData, lines: newLines })
  }

  const removeLineFromForm = (index: number) => {
    setFormData({
      ...formData,
      lines: formData.lines.filter((_, i) => i !== index)
    })
  }

  const handleClose = () => {
    setErrors({ site: '', requester_name: '', category: '', lines: '' })
    onClose()
  }

  const statutFr = statusFromApi(demande.status)

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-green-500 rounded-lg">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">Modifier la demande</div>
              <div className="text-sm text-gray-600">Demande n° {demande.number}</div>
            </div>
          </div>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Info de la demande existante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Créée le :</strong> {new Date(demande.date).toLocaleDateString('fr-FR')}
              <span className="mx-2">•</span>
              <strong>Statut actuel :</strong> {statutFr}
              <span className="mx-2">•</span>
              <strong>ID :</strong> {demande.id}
            </div>
          </div>

          {/* Section Informations générales */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-4">
            <div className="flex items-center mb-2">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Informations générales</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom du demandeur *
                </label>
                <input
                  type="text"
                  value={formData.requester_name}
                  onChange={(e) => {
                    setFormData({ ...formData, requester_name: e.target.value })
                    if (errors.requester_name) {
                      setErrors({ ...errors, requester_name: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.requester_name ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom complet"
                />
                {errors.requester_name && (
                  <p className="mt-1 text-sm text-red-600">{errors.requester_name}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Building2 className="w-4 h-4 inline mr-1" />
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.site ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Usine Alger"
                />
                {errors.site && (
                  <p className="mt-1 text-sm text-red-600">{errors.site}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie *
                </label>
                <input
                  type="text"
                  value={formData.category}
                  onChange={(e) => {
                    setFormData({ ...formData, category: e.target.value })
                    if (errors.category) {
                      setErrors({ ...errors, category: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.category ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: Matières premières, Fournitures..."
                />
                {errors.category && (
                  <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date nécessaire
                </label>
                <input
                  type="date"
                  value={formData.needed_date}
                  onChange={(e) => setFormData({ ...formData, needed_date: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>
            </div>
          </div>

          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <AlertTriangle className="w-4 h-4 inline mr-2" />
              Priorité *
            </label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value as DemandPriority })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="low">🟢 Basse</option>
              <option value="medium">🟡 Moyenne</option>
              <option value="high">🔴 Haute</option>
            </select>
          </div>

          {/* Articles actuellement sélectionnés */}
          {formData.lines.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                Articles sélectionnés ({formData.lines.length})
              </h4>
              <div className="space-y-4">
                {formData.lines.map((line, index) => (
                  <div key={index} className="p-4 bg-white rounded-lg shadow-sm border border-green-200">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 flex-1">
                        <div className="flex items-center justify-center w-8 h-8 bg-green-100 rounded-full text-sm font-bold text-green-800">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="font-semibold text-gray-900">{line.material_name}</div>
                          <div className="text-sm text-gray-600">ID: {line.material_id}</div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeLineFromForm(index)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title="Supprimer"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Quantité * ({line.uom})
                        </label>
                        <input
                          type="number"
                          value={line.quantity}
                          onChange={(e) => updateLineQuantity(index, e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                          min="0.01"
                          step="0.01"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Prix estimé (DA)
                        </label>
                        <input
                          type="number"
                          value={line.estimated_price || ''}
                          onChange={(e) => updateLineField(index, 'estimated_price', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                          min="0"
                          step="0.01"
                          placeholder="0.00"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Fournisseur suggéré
                        </label>
                        <input
                          type="text"
                          value={line.suggested_supplier || ''}
                          onChange={(e) => updateLineField(index, 'suggested_supplier', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 text-sm"
                          placeholder="Nom du fournisseur"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ajouter de nouveaux articles */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Plus className="w-4 h-4 inline mr-1" />
              Ajouter d&apos;autres matériels
            </label>
            <div className="border border-gray-300 rounded-lg max-h-60 overflow-y-auto">
              {availableMaterials
                .filter(material => !formData.lines.find(l => l.material_id === material.id))
                .map((material) => (
                <div key={material.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{material.name}</div>
                    <div className="text-xs text-gray-600">ID: {material.id} • Unité: {material.uom}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addMaterialToForm(material)}
                    className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
                    title={`Ajouter ${material.name}`}
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {availableMaterials.filter(material => !formData.lines.find(l => l.material_id === material.id)).length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Tous les matériels disponibles sont déjà sélectionnés
                </div>
              )}
            </div>
            {errors.lines && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.lines}
              </p>
            )}
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et justifications
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Décrivez la raison de cette demande, l'urgence, les spécifications particulières, ou toute information utile..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Modifiez les commentaires si nécessaire pour justifier les changements
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Attention :</span> Les modifications seront appliquées à la demande {demande.number}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSave}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Sauvegarder les modifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}