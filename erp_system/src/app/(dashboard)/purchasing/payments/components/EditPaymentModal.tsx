'use client'
import React, { useState, useEffect } from 'react'
import { X, Check, Edit, Building, CreditCard, Calendar, DollarSign, FileText, AlertTriangle } from 'lucide-react'

interface EditPaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  paiement: {
    id: string
    numeroReference: string
    fournisseur: {
      id: string
      nom: string
      email: string
      telephone: string
    }
    datePaiement: string | null
    dateEcheance: string
    montantDu: number
    montantPaye: number
    montantRestant: number
    statut: string
    methodePaiement: string
    numeroFacture: string
    commentaires: string
    gestionnaire: string
  }
  fournisseurs: Array<{
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
    totalDettes: number
  }>
}

export default function EditPaymentModal({ 
  isOpen, 
  onClose, 
  onSave, 
  paiement,
  fournisseurs 
}: EditPaymentModalProps) {
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

  // Initialiser le formulaire avec les données du paiement
  useEffect(() => {
    if (paiement && isOpen) {
      setFormData({
        fournisseur: paiement.fournisseur,
        dateEcheance: paiement.dateEcheance,
        montantDu: paiement.montantDu,
        montantPaye: paiement.montantPaye,
        statut: paiement.statut,
        methodePaiement: paiement.methodePaiement,
        numeroFacture: paiement.numeroFacture,
        commentaires: paiement.commentaires,
        gestionnaire: paiement.gestionnaire
      })
    }
  }, [paiement, isOpen])

  if (!isOpen || !paiement) return null

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
    setErrors({ fournisseur: '', dateEcheance: '', montantDu: '', numeroFacture: '', gestionnaire: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Modifier le paiement</div>
              <div className="text-sm font-normal text-gray-600">
                Référence: {paiement.numeroReference}
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
          
          {/* Info du paiement existant */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Paiement créé le :</strong> {paiement.datePaiement ? new Date(paiement.datePaiement).toLocaleDateString('fr-FR') : 'Non payé'}
              <span className="mx-2">•</span>
              <strong>Statut actuel :</strong> {paiement.statut}
              <span className="mx-2">•</span>
              <strong>Montant restant :</strong> {paiement.montantRestant.toLocaleString()} DT
            </div>
          </div>

          {/* Section Fournisseur */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Building className="w-5 h-5 text-gray-500 mr-2" />
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                <div className="bg-white p-4 rounded-lg border border-gray-200">
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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

            {/* Comparaison des montants */}
            <div className="mt-4 bg-white p-4 rounded-lg border border-gray-200">
              <h5 className="font-semibold text-gray-900 mb-3">Comparaison avant/après modification</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Ancien montant dû:</span>
                  <div className="font-bold text-gray-900">{paiement.montantDu.toLocaleString()} DT</div>
                </div>
                <div>
                  <span className="text-gray-600">Nouveau montant dû:</span>
                  <div className={`font-bold ${formData.montantDu !== paiement.montantDu ? 'text-orange-600' : 'text-gray-900'}`}>
                    {formData.montantDu.toLocaleString()} DT
                  </div>
                </div>
                <div>
                  <span className="text-gray-600">Ancien montant payé:</span>
                  <div className="font-bold text-gray-900">{paiement.montantPaye.toLocaleString()} DT</div>
                </div>
                <div>
                  <span className="text-gray-600">Nouveau montant payé:</span>
                  <div className={`font-bold ${formData.montantPaye !== paiement.montantPaye ? 'text-orange-600' : 'text-gray-900'}`}>
                    {formData.montantPaye.toLocaleString()} DT
                  </div>
                </div>
              </div>

              {(formData.montantDu !== paiement.montantDu || formData.montantPaye !== paiement.montantPaye) && (
                <div className="mt-3 bg-orange-100 border border-orange-300 rounded-lg p-3">
                  <div className="flex items-center text-orange-800">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Modifications détectées dans les montants</span>
                  </div>
                </div>
              )}
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Conditions de paiement, références bancaires, notes particulières..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Modifiez les commentaires si nécessaire pour documenter les changements
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Attention :</span> Les modifications seront appliquées au paiement {paiement.numeroReference}
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
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
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