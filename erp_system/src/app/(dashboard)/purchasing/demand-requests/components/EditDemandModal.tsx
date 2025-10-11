'use client'
import React, { useState, useEffect } from 'react'
import { X, Plus, Check, User, AlertTriangle, Edit } from 'lucide-react'

interface EditDemandModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  demande: {
    id: string
    utilisateur: { id: string; nom: string }
    dateCreation: string
    priorite: string
    statut: string
    produits: Array<{
      id: string
      nom: string
      type: 'produit' | 'matiere'
      quantite: number
    }>
    commentaires: string
  }
  produitsDispo: Array<{
    id: string
    nom: string
    type: 'produit' | 'matiere'
  }>
}

export default function EditDemandModal({ 
  isOpen, 
  onClose, 
  onSave, 
  demande, 
  produitsDispo 
}: EditDemandModalProps) {
  const [formData, setFormData] = useState({
    utilisateur: { id: '', nom: '' },
    priorite: 'Moyenne',
    produits: [] as Array<{
      id: string
      nom: string
      type: 'produit' | 'matiere'
      quantite: number
    }>,
    commentaires: ''
  })

  const [errors, setErrors] = useState({
    utilisateurId: '',
    utilisateurNom: '',
    produits: ''
  })

  // Initialiser le formulaire avec les données de la demande
  useEffect(() => {
    if (demande && isOpen) {
      setFormData({
        utilisateur: demande.utilisateur,
        priorite: demande.priorite,
        produits: demande.produits,
        commentaires: demande.commentaires
      })
    }
  }, [demande, isOpen])

  if (!isOpen || !demande) return null

  const validateForm = () => {
    const newErrors = {
      utilisateurId: '',
      utilisateurNom: '',
      produits: ''
    }

    if (!formData.utilisateur.id.trim()) {
      newErrors.utilisateurId = 'L\'ID utilisateur est requis'
    }

    if (!formData.utilisateur.nom.trim()) {
      newErrors.utilisateurNom = 'Le nom utilisateur est requis'
    }

    if (formData.produits.length === 0) {
      newErrors.produits = 'Au moins un produit doit être sélectionné'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
    }
  }

  const addProduitToForm = (produit: any) => {
    const existing = formData.produits.find(p => p.id === produit.id)
    if (existing) {
      setFormData({
        ...formData,
        produits: formData.produits.map(p => 
          p.id === produit.id ? { ...p, quantite: p.quantite + 1 } : p
        )
      })
    } else {
      setFormData({
        ...formData,
        produits: [...formData.produits, { ...produit, quantite: 1 }]
      })
    }
    if (errors.produits) {
      setErrors({ ...errors, produits: '' })
    }
  }

  const updateProduitQuantity = (produitId: string, newQuantite: number) => {
    if (newQuantite <= 0) {
      removeProduitFromForm(produitId)
    } else {
      setFormData({
        ...formData,
        produits: formData.produits.map(p => 
          p.id === produitId ? { ...p, quantite: newQuantite } : p
        )
      })
    }
  }

  const removeProduitFromForm = (produitId: string) => {
    setFormData({
      ...formData,
      produits: formData.produits.filter(p => p.id !== produitId)
    })
  }

  const handleClose = () => {
    setErrors({ utilisateurId: '', utilisateurNom: '', produits: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-green-500 rounded-lg mr-3">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Modifier la demande</div>
              <div className="text-sm font-normal text-gray-600">Demande n° {demande.id}</div>
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
          
          {/* Info de la demande existante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Demande créée le :</strong> {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
              <span className="mx-2">•</span>
              <strong>Statut actuel :</strong> {demande.statut}
            </div>
          </div>

          {/* Section Utilisateur */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <User className="w-5 h-5 text-gray-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Informations du demandeur</h4>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  ID Utilisateur *
                </label>
                <input
                  type="text"
                  value={formData.utilisateur.id}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      utilisateur: { ...formData.utilisateur, id: e.target.value }
                    })
                    if (errors.utilisateurId) {
                      setErrors({ ...errors, utilisateurId: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.utilisateurId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: U001"
                />
                {errors.utilisateurId && (
                  <p className="mt-1 text-sm text-red-600">{errors.utilisateurId}</p>
                )}
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom Utilisateur *
                </label>
                <input
                  type="text"
                  value={formData.utilisateur.nom}
                  onChange={(e) => {
                    setFormData({
                      ...formData,
                      utilisateur: { ...formData.utilisateur, nom: e.target.value }
                    })
                    if (errors.utilisateurNom) {
                      setErrors({ ...errors, utilisateurNom: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.utilisateurNom ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom complet"
                />
                {errors.utilisateurNom && (
                  <p className="mt-1 text-sm text-red-600">{errors.utilisateurNom}</p>
                )}
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
              value={formData.priorite}
              onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="Basse">🟢 Basse</option>
              <option value="Moyenne">🟡 Moyenne</option>
              <option value="Haute">🔴 Haute</option>
            </select>
          </div>

          {/* Produits sélectionnés actuels */}
          {formData.produits.length > 0 && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                <Check className="w-5 h-5 text-green-600 mr-2" />
                Articles actuellement sélectionnés ({formData.produits.length})
              </h4>
              <div className="space-y-3">
                {formData.produits.map((produit, index) => (
                  <div key={produit.id} className="flex items-center justify-between p-3 bg-white rounded-lg shadow-sm border border-green-200">
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
                    
                    <div className="flex items-center space-x-3">
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
                ))}
              </div>
            </div>
          )}

          {/* Ajouter de nouveaux produits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Ajouter d'autres produits et matières premières
            </label>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {produitsDispo
                .filter(produit => !formData.produits.find(p => p.id === produit.id))
                .map((produit) => (
                <div key={produit.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                    <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                      produit.type === 'produit' 
                        ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                        : 'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {produit.type === 'produit' ? 'Produit' : 'Matière première'}
                    </span>
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
              {produitsDispo.filter(produit => !formData.produits.find(p => p.id === produit.id)).length === 0 && (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Tous les produits disponibles sont déjà sélectionnés
                </div>
              )}
            </div>
            {errors.produits && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.produits}
              </p>
            )}
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et justifications
            </label>
            <textarea
              value={formData.commentaires}
              onChange={(e) => setFormData({ ...formData, commentaires: e.target.value })}
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
            <span className="font-medium">Attention :</span> Les modifications seront appliquées à la demande {demande.id}
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