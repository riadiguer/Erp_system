'use client'
import React, { useState } from 'react'
import { X, Plus, Check, Building, AlertTriangle, Package, Calendar } from 'lucide-react'

interface AddOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  fournisseursDispo: Array<{
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
  }>
  produitsDispo: Array<{
    id: string
    nom: string
    type: 'produit' | 'matiere'
    prixUnitaire: number
  }>
}

export default function AddOrderModal({ 
  isOpen, 
  onClose, 
  onSave, 
  fournisseursDispo, 
  produitsDispo 
}: AddOrderModalProps) {
  const [formData, setFormData] = useState({
    fournisseur: { id: '', nom: '', email: '', telephone: '', adresse: '' },
    priorite: 'Moyenne',
    dateExpiration: '',
    produits: [] as Array<{
      id: string
      nom: string
      type: 'produit' | 'matiere'
      quantite: number
      prixUnitaire: number
    }>,
    commentaires: '',
    gestionnaire: '',
    montantTotal: 0
  })

  const [errors, setErrors] = useState({
    fournisseur: '',
    dateExpiration: '',
    produits: '',
    gestionnaire: ''
  })

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      fournisseur: '',
      dateExpiration: '',
      produits: '',
      gestionnaire: ''
    }

    if (!formData.fournisseur.id) {
      newErrors.fournisseur = 'Veuillez sélectionner un fournisseur'
    }

    if (!formData.dateExpiration) {
      newErrors.dateExpiration = 'La date d\'expiration est requise'
    } else {
      const today = new Date().toISOString().split('T')[0]
      if (formData.dateExpiration <= today) {
        newErrors.dateExpiration = 'La date d\'expiration doit être dans le futur'
      }
    }

    if (formData.produits.length === 0) {
      newErrors.produits = 'Au moins un produit doit être sélectionné'
    }

    if (!formData.gestionnaire.trim()) {
      newErrors.gestionnaire = 'Le nom du gestionnaire est requis'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const calculateMontantTotal = (produits) => {
    return produits.reduce((total, produit) => total + (produit.quantite * produit.prixUnitaire), 0)
  }

  const handleSave = () => {
    const updatedFormData = {
      ...formData,
      montantTotal: calculateMontantTotal(formData.produits)
    }

    if (validateForm()) {
      onSave(updatedFormData)
      // Reset form
      setFormData({
        fournisseur: { id: '', nom: '', email: '', telephone: '', adresse: '' },
        priorite: 'Moyenne',
        dateExpiration: '',
        produits: [],
        commentaires: '',
        gestionnaire: '',
        montantTotal: 0
      })
      setErrors({ fournisseur: '', dateExpiration: '', produits: '', gestionnaire: '' })
    }
  }

  const handleFournisseurChange = (fournisseurId) => {
    const fournisseur = fournisseursDispo.find(f => f.id === fournisseurId)
    setFormData({
      ...formData,
      fournisseur: fournisseur || { id: '', nom: '', email: '', telephone: '', adresse: '' }
    })
    if (errors.fournisseur) {
      setErrors({ ...errors, fournisseur: '' })
    }
  }

  const addProduitToForm = (produit) => {
    const existing = formData.produits.find(p => p.id === produit.id)
    if (existing) {
      const updatedProduits = formData.produits.map(p => 
        p.id === produit.id ? { ...p, quantite: p.quantite + 1 } : p
      )
      setFormData({
        ...formData,
        produits: updatedProduits,
        montantTotal: calculateMontantTotal(updatedProduits)
      })
    } else {
      const updatedProduits = [...formData.produits, { ...produit, quantite: 1 }]
      setFormData({
        ...formData,
        produits: updatedProduits,
        montantTotal: calculateMontantTotal(updatedProduits)
      })
    }
    if (errors.produits) {
      setErrors({ ...errors, produits: '' })
    }
  }

  const updateProduitQuantity = (produitId, newQuantite) => {
    if (newQuantite <= 0) {
      removeProduitFromForm(produitId)
    } else {
      const updatedProduits = formData.produits.map(p => 
        p.id === produitId ? { ...p, quantite: newQuantite } : p
      )
      setFormData({
        ...formData,
        produits: updatedProduits,
        montantTotal: calculateMontantTotal(updatedProduits)
      })
    }
  }

  const updateProduitPrice = (produitId, newPrice) => {
    const updatedProduits = formData.produits.map(p => 
      p.id === produitId ? { ...p, prixUnitaire: newPrice } : p
    )
    setFormData({
      ...formData,
      produits: updatedProduits,
      montantTotal: calculateMontantTotal(updatedProduits)
    })
  }

  const removeProduitFromForm = (produitId) => {
    const updatedProduits = formData.produits.filter(p => p.id !== produitId)
    setFormData({
      ...formData,
      produits: updatedProduits,
      montantTotal: calculateMontantTotal(updatedProduits)
    })
  }

  const handleClose = () => {
    setFormData({
      fournisseur: { id: '', nom: '', email: '', telephone: '', adresse: '' },
      priorite: 'Moyenne',
      dateExpiration: '',
      produits: [],
      commentaires: '',
      gestionnaire: '',
      montantTotal: 0
    })
    setErrors({ fournisseur: '', dateExpiration: '', produits: '', gestionnaire: '' })
    onClose()
  }

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
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

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
                  value={formData.fournisseur.id}
                  onChange={(e) => handleFournisseurChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.fournisseur ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseursDispo.map((fournisseur) => (
                    <option key={fournisseur.id} value={fournisseur.id}>
                      {fournisseur.nom} - {fournisseur.email}
                    </option>
                  ))}
                </select>
                {errors.fournisseur && (
                  <p className="mt-1 text-sm text-red-600">{errors.fournisseur}</p>
                )}
              </div>

              {formData.fournisseur.id && (
                <div className="bg-white p-4 rounded-lg border border-blue-200">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Email:</span>
                      <p className="text-gray-900">{formData.fournisseur.email}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Téléphone:</span>
                      <p className="text-gray-900">{formData.fournisseur.telephone}</p>
                    </div>
                    <div className="md:col-span-2">
                      <span className="font-medium text-gray-600">Adresse:</span>
                      <p className="text-gray-900">{formData.fournisseur.adresse}</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Détails du bon de commande */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <AlertTriangle className="w-4 h-4 inline mr-2" />
                Priorité *
              </label>
              <select
                value={formData.priorite}
                onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                <option value="Basse">🟢 Basse</option>
                <option value="Moyenne">🟡 Moyenne</option>
                <option value="Haute">🔴 Haute</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Calendar className="w-4 h-4 inline mr-2" />
                Date d'expiration *
              </label>
              <input
                type="date"
                value={formData.dateExpiration}
                onChange={(e) => {
                  setFormData({ ...formData, dateExpiration: e.target.value })
                  if (errors.dateExpiration) {
                    setErrors({ ...errors, dateExpiration: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.dateExpiration ? 'border-red-500' : 'border-gray-300'
                }`}
                min={new Date(Date.now() + 86400000).toISOString().split('T')[0]}
              />
              {errors.dateExpiration && (
                <p className="mt-1 text-sm text-red-600">{errors.dateExpiration}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gestionnaire *
              </label>
              <input
                type="text"
                value={formData.gestionnaire}
                onChange={(e) => {
                  setFormData({ ...formData, gestionnaire: e.target.value })
                  if (errors.gestionnaire) {
                    setErrors({ ...errors, gestionnaire: '' })
                  }
                }}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                  errors.gestionnaire ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom du gestionnaire"
              />
              {errors.gestionnaire && (
                <p className="mt-1 text-sm text-red-600">{errors.gestionnaire}</p>
              )}
            </div>
          </div>

          {/* Sélection des produits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Package className="w-4 h-4 inline mr-2" />
              Produits et matières premières disponibles
            </label>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {produitsDispo.map((produit) => (
                <div key={produit.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          produit.type === 'produit' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {produit.type === 'produit' ? 'Produit' : 'Matière première'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Prix: {produit.prixUnitaire} DT
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProduitToForm(produit)}
                    className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-green-50 transition-colors"
                    title={`Ajouter ${produit.nom}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.produits && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.produits}
              </p>
            )}
          </div>

          {/* Produits sélectionnés */}
          {formData.produits.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <Check className="w-5 h-5 text-green-600 mr-2" />
                  Articles sélectionnés ({formData.produits.length})
                </span>
                <span className="text-xl font-bold text-green-700">
                  Total: {formData.montantTotal.toLocaleString()} DT
                </span>
              </h4>
              
              <div className="space-y-3">
                {formData.produits.map((produit, index) => (
                  <div key={produit.id} className="bg-white rounded-lg p-4 border border-green-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-green-100 rounded-full text-xs font-bold text-green-800">
                          {index + 1}
                        </div>
                        <div className={`w-3 h-3 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                          <div className={`inline-block ml-2 px-2 py-1 text-xs rounded-full ${
                            produit.type === 'produit' 
                              ? 'bg-blue-100 text-blue-800' 
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {produit.type === 'produit' ? 'Produit' : 'Matière première'}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Quantité */}
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                          <button
                            type="button"
                            onClick={() => updateProduitQuantity(produit.id, produit.quantite - 1)}
                            className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{produit.quantite}</span>
                          <button
                            type="button"
                            onClick={() => updateProduitQuantity(produit.id, produit.quantite + 1)}
                            className="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold"
                          >
                            +
                          </button>
                        </div>

                        {/* Prix unitaire */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Prix:</span>
                          <input
                            type="number"
                            value={produit.prixUnitaire}
                            onChange={(e) => updateProduitPrice(produit.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-sm text-gray-600">DT</span>
                        </div>

                        {/* Sous-total */}
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm text-gray-600">Sous-total:</div>
                          <div className="text-sm font-bold text-gray-900">
                            {(produit.quantite * produit.prixUnitaire).toLocaleString()} DT
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeProduitFromForm(produit.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title={`Supprimer ${produit.nom}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et instructions spéciales
            </label>
            <textarea
              value={formData.commentaires}
              onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
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
            <span className="font-medium">Champs obligatoires :</span> Fournisseur, date d'expiration, gestionnaire et au moins un produit
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
              <span>Créer le bon de commande</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}