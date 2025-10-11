'use client'
import React, { useState } from 'react'
import { X, Plus, Check, Building, AlertTriangle, Package, RotateCcw, DollarSign } from 'lucide-react'

interface AddReturnModalProps {
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
  motifsDispo: Array<string>
}

export default function AddReturnModal({ 
  isOpen, 
  onClose, 
  onSave, 
  fournisseursDispo, 
  produitsDispo,
  motifsDispo 
}: AddReturnModalProps) {
  const [formData, setFormData] = useState({
    fournisseur: { id: '', nom: '', email: '', telephone: '', adresse: '' },
    motifRetour: '',
    descriptionMotif: '',
    produits: [] as Array<{
      id: string
      nom: string
      type: 'produit' | 'matiere'
      quantite: number
      quantiteRetournee: number
      prixUnitaire: number
    }>,
    prixAchat: 0,
    montantRetour: 0,
    commentaires: '',
    gestionnaire: '',
    numeroCommande: ''
  })

  const [errors, setErrors] = useState({
    fournisseur: '',
    motifRetour: '',
    produits: '',
    gestionnaire: ''
  })

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      fournisseur: '',
      motifRetour: '',
      produits: '',
      gestionnaire: ''
    }

    if (!formData.fournisseur.id) {
      newErrors.fournisseur = 'Veuillez sélectionner un fournisseur'
    }

    if (!formData.motifRetour) {
      newErrors.motifRetour = 'Le motif de retour est requis'
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

  const calculateMontants = (produits) => {
    const prixAchat = produits.reduce((total, produit) => total + (produit.quantite * produit.prixUnitaire), 0)
    const montantRetour = produits.reduce((total, produit) => total + (produit.quantiteRetournee * produit.prixUnitaire), 0)
    return { prixAchat, montantRetour }
  }

  const handleSave = () => {
    const { prixAchat, montantRetour } = calculateMontants(formData.produits)
    const updatedFormData = {
      ...formData,
      prixAchat,
      montantRetour
    }

    if (validateForm()) {
      onSave(updatedFormData)
      // Reset form
      setFormData({
        fournisseur: { id: '', nom: '', email: '', telephone: '', adresse: '' },
        motifRetour: '',
        descriptionMotif: '',
        produits: [],
        prixAchat: 0,
        montantRetour: 0,
        commentaires: '',
        gestionnaire: '',
        numeroCommande: ''
      })
      setErrors({ fournisseur: '', motifRetour: '', produits: '', gestionnaire: '' })
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
        p.id === produit.id ? { 
          ...p, 
          quantite: p.quantite + 1,
          quantiteRetournee: p.quantiteRetournee + 1 
        } : p
      )
      const { prixAchat, montantRetour } = calculateMontants(updatedProduits)
      setFormData({
        ...formData,
        produits: updatedProduits,
        prixAchat,
        montantRetour
      })
    } else {
      const updatedProduits = [...formData.produits, { 
        ...produit, 
        quantite: 1,
        quantiteRetournee: 1 
      }]
      const { prixAchat, montantRetour } = calculateMontants(updatedProduits)
      setFormData({
        ...formData,
        produits: updatedProduits,
        prixAchat,
        montantRetour
      })
    }
    if (errors.produits) {
      setErrors({ ...errors, produits: '' })
    }
  }

  const updateProduitQuantity = (produitId, field, newQuantite) => {
    if (newQuantite <= 0) {
      removeProduitFromForm(produitId)
    } else {
      const updatedProduits = formData.produits.map(p => 
        p.id === produitId ? { ...p, [field]: newQuantite } : p
      )
      const { prixAchat, montantRetour } = calculateMontants(updatedProduits)
      setFormData({
        ...formData,
        produits: updatedProduits,
        prixAchat,
        montantRetour
      })
    }
  }

  const updateProduitPrice = (produitId, newPrice) => {
    const updatedProduits = formData.produits.map(p => 
      p.id === produitId ? { ...p, prixUnitaire: newPrice } : p
    )
    const { prixAchat, montantRetour } = calculateMontants(updatedProduits)
    setFormData({
      ...formData,
      produits: updatedProduits,
      prixAchat,
      montantRetour
    })
  }

  const removeProduitFromForm = (produitId) => {
    const updatedProduits = formData.produits.filter(p => p.id !== produitId)
    const { prixAchat, montantRetour } = calculateMontants(updatedProduits)
    setFormData({
      ...formData,
      produits: updatedProduits,
      prixAchat,
      montantRetour
    })
  }

  const handleClose = () => {
    setFormData({
      fournisseur: { id: '', nom: '', email: '', telephone: '', adresse: '' },
      motifRetour: '',
      descriptionMotif: '',
      produits: [],
      prixAchat: 0,
      montantRetour: 0,
      commentaires: '',
      gestionnaire: '',
      numeroCommande: ''
    })
    setErrors({ fournisseur: '', motifRetour: '', produits: '', gestionnaire: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-red-500 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Nouveau retour fournisseur
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
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

          {/* Motif de retour */}
          <div className="bg-red-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <RotateCcw className="w-5 h-5 text-red-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Motif du retour</h4>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Motif principal *
                </label>
                <select
                  value={formData.motifRetour}
                  onChange={(e) => {
                    setFormData({ ...formData, motifRetour: e.target.value })
                    if (errors.motifRetour) {
                      setErrors({ ...errors, motifRetour: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                    errors.motifRetour ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un motif</option>
                  {motifsDispo.map((motif) => (
                    <option key={motif} value={motif}>
                      {motif}
                    </option>
                  ))}
                </select>
                {errors.motifRetour && (
                  <p className="mt-1 text-sm text-red-600">{errors.motifRetour}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° de commande (optionnel)
                </label>
                <input
                  type="text"
                  value={formData.numeroCommande}
                  onChange={(e) => setFormData({ ...formData, numeroCommande: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                  placeholder="Ex: BC-2024-001"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description détaillée du problème
              </label>
              <textarea
                value={formData.descriptionMotif}
                onChange={(e) => setFormData({ ...formData, descriptionMotif: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
                placeholder="Décrivez précisément le problème rencontré..."
              />
            </div>
          </div>

          {/* Gestionnaire */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gestionnaire du retour *
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
              className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 ${
                errors.gestionnaire ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nom du gestionnaire"
            />
            {errors.gestionnaire && (
              <p className="mt-1 text-sm text-red-600">{errors.gestionnaire}</p>
            )}
          </div>

          {/* Sélection des produits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Package className="w-4 h-4 inline mr-2" />
              Produits et matières premières à retourner
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
                    className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <RotateCcw className="w-5 h-5 text-red-600 mr-2" />
                  Articles à retourner ({formData.produits.length})
                </span>
                <span className="text-xl font-bold text-red-700 flex items-center">
                  <DollarSign className="w-5 h-5 mr-1" />
                  {formData.montantRetour.toLocaleString()} DT
                </span>
              </h4>
              
              <div className="space-y-3">
                {formData.produits.map((produit, index) => (
                  <div key={produit.id} className="bg-white rounded-lg p-4 border border-red-200 shadow-sm">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-red-100 rounded-full text-xs font-bold text-red-800">
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
                      
                      <button
                        type="button"
                        onClick={() => removeProduitFromForm(produit.id)}
                        className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                        title={`Supprimer ${produit.nom}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Quantité achetée */}
                      <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                        <div className="text-sm font-medium text-blue-700 mb-1">Qté achetée</div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateProduitQuantity(produit.id, 'quantite', produit.quantite - 1)}
                            className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center hover:bg-blue-300 transition-colors text-blue-700 font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-blue-700">{produit.quantite}</span>
                          <button
                            type="button"
                            onClick={() => updateProduitQuantity(produit.id, 'quantite', produit.quantite + 1)}
                            className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center hover:bg-blue-300 transition-colors text-blue-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Quantité retournée */}
                      <div className="bg-red-50 p-3 rounded-lg border border-red-200">
                        <div className="text-sm font-medium text-red-700 mb-1">Qté retournée</div>
                        <div className="flex items-center space-x-2">
                          <button
                            type="button"
                            onClick={() => updateProduitQuantity(produit.id, 'quantiteRetournee', produit.quantiteRetournee - 1)}
                            className="w-7 h-7 rounded-full bg-red-200 flex items-center justify-center hover:bg-red-300 transition-colors text-red-700 font-bold"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-red-700">{produit.quantiteRetournee}</span>
                          <button
                            type="button"
                            onClick={() => updateProduitQuantity(produit.id, 'quantiteRetournee', Math.min(produit.quantiteRetournee + 1, produit.quantite))}
                            className="w-7 h-7 rounded-full bg-red-200 flex items-center justify-center hover:bg-red-300 transition-colors text-red-700 font-bold"
                          >
                            +
                          </button>
                        </div>
                      </div>

                      {/* Prix unitaire */}
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <div className="text-sm font-medium text-gray-700 mb-1">Prix unitaire</div>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={produit.prixUnitaire}
                            onChange={(e) => updateProduitPrice(produit.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-red-500 focus:border-red-500"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-sm text-gray-600">DT</span>
                        </div>
                      </div>

                      {/* Sous-total */}
                      <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                        <div className="text-sm font-medium text-purple-700 mb-1">Montant retour</div>
                        <div className="text-lg font-bold text-purple-700">
                          {(produit.quantiteRetournee * produit.prixUnitaire).toLocaleString()} DT
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Récapitulatif des montants */}
              <div className="mt-4 bg-white p-4 rounded-lg border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-gray-700">Montant d'achat total:</span>
                    <span className="font-bold text-gray-900">{formData.prixAchat.toLocaleString()} DT</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="font-medium text-red-700">Montant du retour:</span>
                    <span className="font-bold text-red-700 text-lg">{formData.montantRetour.toLocaleString()} DT</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et observations
            </label>
            <textarea
              value={formData.commentaires}
              onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              placeholder="Informations complémentaires sur le retour, état des produits, conditions de transport..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Ces informations seront transmises au fournisseur avec la demande de retour
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Champs obligatoires :</span> Fournisseur, motif, gestionnaire et au moins un produit
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
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Créer le retour</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}