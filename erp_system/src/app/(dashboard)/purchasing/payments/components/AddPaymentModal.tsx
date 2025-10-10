'use client'
import React, { useState } from 'react'
import { X, Plus, Check, Building, CreditCard, Calendar, DollarSign, FileText } from 'lucide-react'

interface AddPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  fournisseurs: Array<{
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
    totalDettes: number
  }>
}

export default function AddPaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  fournisseurs 
}: AddPaymentModalProps) {
  const [formData, setFormData] = useState({
    fournisseur: { id: '', nom: '', email: '', telephone: '' },
    dateEcheance: '',
    montantDu: 0,
    montantPaye: 0,
    statut: 'En attente',
    methodePaiement: 'Virement bancaire',
    numeroFacture: '',
    commentaires: '',
    gestionnaire: ''
  })

  const [errors, setErrors] = useState({
    fournisseur: '',
    dateEcheance: '',
    montantDu: '',
    numeroFacture: '',
    gestionnaire: ''
  })

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      fournisseur: '',
      dateEcheance: '',
      montantDu: '',
      numeroFacture: '',
      gestionnaire: ''
    }

    if (!formData.fournisseur.id) {
      newErrors.fournisseur = 'Veuillez sélectionner un fournisseur'
    }

    if (!formData.dateEcheance) {
      newErrors.dateEcheance = 'La date d\'échéance est requise'
    }

    if (!formData.montantDu || formData.montantDu <= 0) {
      newErrors.montantDu = 'Le montant dû doit être supérieur à 0'
    }

    if (!formData.numeroFacture.trim()) {
      newErrors.numeroFacture = 'Le numéro de facture est requis'
    }

    if (!formData.gestionnaire.trim()) {
      newErrors.gestionnaire = 'Le nom du gestionnaire est requis'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSave = () => {
    const calculatedData = {
      ...formData,
      montantRestant: formData.montantDu - formData.montantPaye,
      statut: formData.montantPaye === 0 ? 'En attente' : 
              formData.montantPaye >= formData.montantDu ? 'Payé' : 'Partiel'
    }

    if (validateForm()) {
      onSave(calculatedData)
      // Reset form
      setFormData({
        fournisseur: { id: '', nom: '', email: '', telephone: '' },
        dateEcheance: '',
        montantDu: 0,
        montantPaye: 0,
        statut: 'En attente',
        methodePaiement: 'Virement bancaire',
        numeroFacture: '',
        commentaires: '',
        gestionnaire: ''
      })
      setErrors({ fournisseur: '', dateEcheance: '', montantDu: '', numeroFacture: '', gestionnaire: '' })
    }
  }

  const handleFournisseurChange = (fournisseurId) => {
    const fournisseur = fournisseurs.find(f => f.id === fournisseurId)
    setFormData({
      ...formData,
      fournisseur: fournisseur || { id: '', nom: '', email: '', telephone: '' }
    })
    if (errors.fournisseur) {
      setErrors({ ...errors, fournisseur: '' })
    }
  }

  const handleMontantPayeChange = (value) => {
    const montantPaye = parseFloat(value) || 0
    setFormData({
      ...formData,
      montantPaye,
      statut: montantPaye === 0 ? 'En attente' : 
              montantPaye >= formData.montantDu ? 'Payé' : 'Partiel'
    })
  }

  const handleClose = () => {
    setFormData({
      fournisseur: { id: '', nom: '', email: '', telephone: '' },
      dateEcheance: '',
      montantDu: 0,
      montantPaye: 0,
      statut: 'En attente',
      methodePaiement: 'Virement bancaire',
      numeroFacture: '',
      commentaires: '',
      gestionnaire: ''
    })
    setErrors({ fournisseur: '', dateEcheance: '', montantDu: '', numeroFacture: '', gestionnaire: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-indigo-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-indigo-500 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Nouveau paiement fournisseur
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.fournisseur ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  <option value="">Sélectionner un fournisseur</option>
                  {fournisseurs.map((fournisseur) => (
                    <option key={fournisseur.id} value={fournisseur.id}>
                      {fournisseur.nom} - Dette: {fournisseur.totalDettes.toLocaleString()} DT
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
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <FileText className="w-4 h-4 inline mr-2" />
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.numeroFacture ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Ex: FACT-2024-001"
              />
              {errors.numeroFacture && (
                <p className="mt-1 text-sm text-red-600">{errors.numeroFacture}</p>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.dateEcheance ? 'border-red-500' : 'border-gray-300'
                }`}
              />
              {errors.dateEcheance && (
                <p className="mt-1 text-sm text-red-600">{errors.dateEcheance}</p>
              )}
            </div>
          </div>

          {/* Montants */}
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-green-600 mr-2" />
              Informations financières
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant dû (DT) *
                </label>
                <input
                  type="number"
                  value={formData.montantDu}
                  onChange={(e) => {
                    setFormData({ ...formData, montantDu: parseFloat(e.target.value) || 0 })
                    if (errors.montantDu) {
                      setErrors({ ...errors, montantDu: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                    errors.montantDu ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.montantDu && (
                  <p className="mt-1 text-sm text-red-600">{errors.montantDu}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant payé (DT)
                </label>
                <input
                  type="number"
                  value={formData.montantPaye}
                  onChange={(e) => handleMontantPayeChange(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  min="0"
                  max={formData.montantDu}
                  step="0.01"
                  placeholder="0.00"
                />
                <div className="mt-1 text-xs text-gray-500">
                  Reste à payer: {(formData.montantDu - formData.montantPaye).toLocaleString()} DT
                </div>
              </div>
            </div>

            {/* Statut automatique */}
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Statut (calculé automatiquement)
              </label>
              <div className={`inline-flex px-3 py-2 text-sm font-semibold rounded-full ${
                formData.statut === 'Payé' ? 'bg-green-100 text-green-800' :
                formData.statut === 'Partiel' ? 'bg-yellow-100 text-yellow-800' :
                'bg-blue-100 text-blue-800'
              }`}>
                {formData.statut}
              </div>
            </div>
          </div>

          {/* Méthode de paiement et gestionnaire */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <CreditCard className="w-4 h-4 inline mr-2" />
                Méthode de paiement
              </label>
              <select
                value={formData.methodePaiement}
                onChange={(e) => setFormData({ ...formData, methodePaiement: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="Virement bancaire">Virement bancaire</option>
                <option value="Chèque">Chèque</option>
                <option value="Espèces">Espèces</option>
                <option value="Carte bancaire">Carte bancaire</option>
                <option value="Traite">Traite</option>
              </select>
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                  errors.gestionnaire ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nom du gestionnaire"
              />
              {errors.gestionnaire && (
                <p className="mt-1 text-sm text-red-600">{errors.gestionnaire}</p>
              )}
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 resize-none"
              placeholder="Conditions de paiement, références bancaires, notes particulières..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Optionnel - Ces informations faciliteront le suivi du paiement
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Champs obligatoires :</span> Fournisseur, facture, échéance, montant et gestionnaire
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
              className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Créer le paiement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}