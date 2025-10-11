'use client'
import React, { useState, useEffect } from 'react'
import { X, Plus, Check, Building, AlertTriangle, Receipt, Calendar, DollarSign, Package, Edit } from 'lucide-react'

interface EditInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  facture: {
    id: string
    numeroFacture: string
    fournisseurId: string
    dateFacture: string
    dateEcheance: string
    type: 'Achat' | 'Retour' | 'Avoir'
    statut: string
    montantHT: number
    montantTTC: number
    montantPaye: number
    montantDu: number
    produits: Array<{
      nom: string
      quantite: number
      prixUnitaire: number
    }>
    commentaires: string
  }
  fournisseur: {
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
  }
}

export default function EditInvoiceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  facture,
  fournisseur
}: EditInvoiceModalProps) {
  const [formData, setFormData] = useState({
    numeroFacture: '',
    dateFacture: '',
    dateEcheance: '',
    type: 'Achat' as 'Achat' | 'Retour' | 'Avoir',
    statut: 'En attente',
    montantHT: 0,
    montantTTC: 0,
    montantPaye: 0,
    montantDu: 0,
    produits: [] as Array<{
      nom: string
      quantite: number
      prixUnitaire: number
    }>,
    commentaires: '',
    tauxTVA: 20
  })

  const [errors, setErrors] = useState({
    numeroFacture: '',
    dateFacture: '',
    dateEcheance: '',
    produits: '',
    montantPaye: ''
  })

  const [newProduit, setNewProduit] = useState({
    nom: '',
    quantite: 1,
    prixUnitaire: 0
  })

  // Initialiser le formulaire avec les données de la facture
  useEffect(() => {
    if (facture && isOpen) {
      setFormData({
        numeroFacture: facture.numeroFacture,
        dateFacture: facture.dateFacture,
        dateEcheance: facture.dateEcheance,
        type: facture.type,
        statut: facture.statut,
        montantHT: facture.montantHT,
        montantTTC: facture.montantTTC,
        montantPaye: facture.montantPaye,
        montantDu: facture.montantDu,
        produits: [...facture.produits],
        commentaires: facture.commentaires,
        tauxTVA: facture.montantHT > 0 ? Math.round(((facture.montantTTC - facture.montantHT) / facture.montantHT) * 100) : 20
      })
    }
  }, [facture, isOpen])

  if (!isOpen || !facture) return null

  const validateForm = () => {
    const newErrors = {
      numeroFacture: '',
      dateFacture: '',
      dateEcheance: '',
      produits: '',
      montantPaye: ''
    }

    if (!formData.numeroFacture.trim()) {
      newErrors.numeroFacture = 'Le numéro de facture est requis'
    }

    if (!formData.dateFacture) {
      newErrors.dateFacture = 'La date de facture est requise'
    }

    if (!formData.dateEcheance) {
      newErrors.dateEcheance = 'La date d\'échéance est requise'
    } else if (new Date(formData.dateEcheance) < new Date(formData.dateFacture)) {
      newErrors.dateEcheance = 'La date d\'échéance doit être après la date de facture'
    }

    if (formData.produits.length === 0) {
      newErrors.produits = 'Au moins un produit doit être ajouté'
    }

    if (formData.montantPaye < 0) {
      newErrors.montantPaye = 'Le montant payé ne peut pas être négatif'
    }

    if (formData.montantPaye > formData.montantTTC) {
      newErrors.montantPaye = 'Le montant payé ne peut pas dépasser le montant TTC'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const calculateMontants = (produits, tauxTVA, type = formData.type) => {
    const sousTotal = produits.reduce((sum, p) => sum + (p.quantite * p.prixUnitaire), 0)
    const montantHT = type === 'Retour' ? -Math.abs(sousTotal) : sousTotal
    const montantTTC = montantHT + (montantHT * tauxTVA / 100)
    return { montantHT, montantTTC }
  }

  const updateMontants = (produits = formData.produits, tauxTVA = formData.tauxTVA) => {
    const { montantHT, montantTTC } = calculateMontants(produits, tauxTVA)
    const montantDu = montantTTC - formData.montantPaye
    
    setFormData(prev => ({
      ...prev,
      montantHT,
      montantTTC,
      montantDu: Math.max(0, montantDu)
    }))
  }

  const handleSave = () => {
    if (validateForm()) {
      const finalData = {
        ...formData,
        montantDu: Math.max(0, formData.montantTTC - formData.montantPaye)
      }
      onSave(finalData)
    }
  }

  const addProduit = () => {
    if (newProduit.nom.trim() && newProduit.quantite > 0 && newProduit.prixUnitaire !== 0) {
      const updatedProduits = [...formData.produits, { ...newProduit }]
      setFormData(prev => ({ ...prev, produits: updatedProduits }))
      updateMontants(updatedProduits)
      setNewProduit({ nom: '', quantite: 1, prixUnitaire: 0 })
      if (errors.produits) {
        setErrors(prev => ({ ...prev, produits: '' }))
      }
    }
  }

  const removeProduit = (index) => {
    const updatedProduits = formData.produits.filter((_, i) => i !== index)
    setFormData(prev => ({ ...prev, produits: updatedProduits }))
    updateMontants(updatedProduits)
  }

  const updateProduit = (index, field, value) => {
    const updatedProduits = formData.produits.map((p, i) => 
      i === index ? { ...p, [field]: field === 'quantite' || field === 'prixUnitaire' ? parseFloat(value) || 0 : value } : p
    )
    setFormData(prev => ({ ...prev, produits: updatedProduits }))
    updateMontants(updatedProduits)
  }

  const handleTypeChange = (newType) => {
    setFormData(prev => ({ ...prev, type: newType }))
    // Recalculer les montants avec le nouveau type
    const { montantHT, montantTTC } = calculateMontants(formData.produits, formData.tauxTVA, newType)
    const montantDu = montantTTC - formData.montantPaye
    
    setFormData(prev => ({
      ...prev,
      type: newType,
      montantHT,
      montantTTC,
      montantDu: Math.max(0, montantDu)
    }))
  }

  const handleMontantPayeChange = (value) => {
    const montantPaye = parseFloat(value) || 0
    setFormData(prev => ({
      ...prev,
      montantPaye,
      montantDu: Math.max(0, prev.montantTTC - montantPaye)
    }))
    
    if (errors.montantPaye) {
      setErrors(prev => ({ ...prev, montantPaye: '' }))
    }
  }

  const handleTVAChange = (value) => {
    const tauxTVA = parseFloat(value) || 0
    setFormData(prev => ({ ...prev, tauxTVA }))
    updateMontants(formData.produits, tauxTVA)
  }

  const handleClose = () => {
    setErrors({ numeroFacture: '', dateFacture: '', dateEcheance: '', produits: '', montantPaye: '' })
    onClose()
  }

  const getStatutOptions = () => {
    const baseOptions = ['En attente', 'Payée', 'Annulée']
    if (formData.type === 'Retour') {
      return [...baseOptions, 'Traitée']
    }
    if (formData.montantDu > 0) {
      return [...baseOptions, 'En retard', 'Partiellement payée']
    }
    return baseOptions
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg mr-3">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Modifier la facture</div>
              <div className="text-sm font-normal text-gray-600">
                {facture.numeroFacture} • {fournisseur.nom}
              </div>
            </div>
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Info de la facture existante */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
            <div className="text-sm text-orange-800">
              <strong>Facture créée le :</strong> {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}
              <span className="mx-2">•</span>
              <strong>Montant original :</strong> {facture.montantTTC.toLocaleString()} DT
              <span className="mx-2">•</span>
              <strong>Statut :</strong> {facture.statut}
            </div>
          </div>

          {/* Section Fournisseur (lecture seule) */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center mb-3">
              <Building className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Fournisseur</h4>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Nom:</span>
                <p className="text-gray-900">{fournisseur.nom}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Email:</span>
                <p className="text-gray-900">{fournisseur.email}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Téléphone:</span>
                <p className="text-gray-900">{fournisseur.telephone}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Adresse:</span>
                <p className="text-gray-900">{fournisseur.adresse}</p>
              </div>
            </div>
          </div>

          {/* Détails de la facture */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Receipt className="w-4 h-4 inline mr-2" />
                Numéro de facture *
              </label>
              <input
                type="text"
                value={formData.numeroFacture}
                onChange={(e) => {
                  setFormData({ ...formData, numeroFacture: e.target.value })
                  if (errors.numeroFacture) {
                    setErrors({ ...errors, numeroFacture: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.numeroFacture ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: FAC-2024-001"
              />
              {errors.numeroFacture && (
                <p className="mt-1 text-sm text-red-600">{errors.numeroFacture}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date de facture *
              </label>
              <input
                type="date"
                value={formData.dateFacture}
                onChange={(e) => {
                  setFormData({ ...formData, dateFacture: e.target.value })
                  if (errors.dateFacture) {
                    setErrors({ ...errors, dateFacture: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.dateFacture ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateFacture && (
                <p className="mt-1 text-sm text-red-600">{errors.dateFacture}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date d'échéance *
              </label>
              <input
                type="date"
                value={formData.dateEcheance}
                onChange={(e) => {
                  setFormData({ ...formData, dateEcheance: e.target.value })
                  if (errors.dateEcheance) {
                    setErrors({ ...errors, dateEcheance: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                  errors.dateEcheance ? 'border-red-500' : 'border-gray-300'
                }`}
                min={formData.dateFacture}
              />
              {errors.dateEcheance && (
                <p className="mt-1 text-sm text-red-600">{errors.dateEcheance}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type de facture *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleTypeChange(e.target.value as 'Achat' | 'Retour' | 'Avoir')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                <option value="Achat">💰 Achat</option>
                <option value="Retour">↩️ Retour</option>
                <option value="Avoir">💳 Avoir</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut *
              </label>
              <select
                value={formData.statut}
                onChange={(e) => setFormData({ ...formData, statut: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              >
                {getStatutOptions().map(statut => (
                  <option key={statut} value={statut}>{statut}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Taux TVA (%)
              </label>
              <input
                type="number"
                value={formData.tauxTVA}
                onChange={(e) => handleTVAChange(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                min="0"
                max="100"
                step="0.1"
              />
            </div>
          </div>

          {/* Produits actuels */}
          {formData.produits.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Package className="w-5 h-5 text-green-600 mr-2" />
                Produits/Services ({formData.produits.length})
              </h4>
              
              <div className="space-y-3">
                {formData.produits.map((produit, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-green-200">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Nom du produit/service
                        </label>
                        <input
                          type="text"
                          value={produit.nom}
                          onChange={(e) => updateProduit(index, 'nom', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Quantité
                        </label>
                        <input
                          type="number"
                          value={produit.quantite}
                          onChange={(e) => updateProduit(index, 'quantite', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                          min="0"
                          step="1"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Prix unitaire (DT)
                        </label>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={produit.prixUnitaire}
                            onChange={(e) => updateProduit(index, 'prixUnitaire', e.target.value)}
                            className="flex-1 px-3 py-2 border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                            step="0.01"
                          />
                          <button
                            type="button"
                            onClick={() => removeProduit(index)}
                            className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50"
                            title="Supprimer ce produit"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="mt-2 text-right">
                      <span className="text-sm text-gray-600">Sous-total: </span>
                      <span className="font-semibold text-gray-900">
                        {(produit.quantite * produit.prixUnitaire).toLocaleString()} DT
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Ajouter un nouveau produit */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
              <Plus className="w-5 h-5 text-gray-600 mr-2" />
              Ajouter un produit/service
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom du produit/service
                </label>
                <input
                  type="text"
                  value={newProduit.nom}
                  onChange={(e) => setNewProduit({ ...newProduit, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Ex: Ordinateur portable, Service maintenance..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantité
                </label>
                <input
                  type="number"
                  value={newProduit.quantite}
                  onChange={(e) => setNewProduit({ ...newProduit, quantite: parseInt(e.target.value) || 1 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix unitaire (DT)
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    value={newProduit.prixUnitaire}
                    onChange={(e) => setNewProduit({ ...newProduit, prixUnitaire: parseFloat(e.target.value) || 0 })}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    step="0.01"
                    placeholder="0.00"
                  />
                  <button
                    type="button"
                    onClick={addProduit}
                    disabled={!newProduit.nom.trim() || newProduit.quantite <= 0 || newProduit.prixUnitaire === 0}
                    className="bg-orange-600 text-white p-2 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                    title="Ajouter ce produit"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
            {errors.produits && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.produits}
              </p>
            )}
          </div>

          {/* Récapitulatif financier */}
          <div className="bg-gradient-to-r from-orange-100 to-orange-50 border-2 border-orange-300 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-6 h-6 mr-2 text-orange-600" />
              Récapitulatif financier
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Montant HT:</span>
                  <span className="font-bold text-gray-900">{formData.montantHT.toLocaleString()} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">TVA ({formData.tauxTVA}%):</span>
                  <span className="font-bold text-gray-900">
                    {(formData.montantTTC - formData.montantHT).toLocaleString()} DT
                  </span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-gray-900">Montant TTC:</span>
                  <span className="font-bold text-lg text-orange-600">{formData.montantTTC.toLocaleString()} DT</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Montant payé (DT)
                  </label>
                  <input
                    type="number"
                    value={formData.montantPaye}
                    onChange={(e) => handleMontantPayeChange(e.target.value)}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                      errors.montantPaye ? 'border-red-500' : 'border-gray-300'
                    }`}
                    min="0"
                    max={formData.montantTTC}
                    step="0.01"
                  />
                  {errors.montantPaye && (
                    <p className="mt-1 text-sm text-red-600">{errors.montantPaye}</p>
                  )}
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-gray-900">Montant dû:</span>
                  <span className={`font-bold text-lg ${formData.montantDu > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formData.montantDu.toLocaleString()} DT
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et notes
            </label>
            <textarea
              value={formData.commentaires}
              onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder="Notes sur la facture, conditions de paiement, observations..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Attention :</span> Les modifications seront appliquées à la facture {facture.numeroFacture}
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
              className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 shadow-sm"
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