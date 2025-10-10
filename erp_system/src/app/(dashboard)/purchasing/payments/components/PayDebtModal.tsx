'use client'
import React, { useState } from 'react'
import { X, CreditCard, Check, Building, DollarSign, AlertTriangle, Calendar } from 'lucide-react'

interface PayDebtModalProps {
  isOpen: boolean
  onClose: () => void
  onPay: (id: string, paymentData: any) => void
  item: {
    id?: string
    numeroReference?: string
    fournisseur: {
      id: string
      nom: string
      email: string
      telephone: string
    }
    montantRestant: number
    dateEcheance?: string
    numeroFacture?: string
  }
}

export default function PayDebtModal({ 
  isOpen, 
  onClose, 
  onPay, 
  item 
}: PayDebtModalProps) {
  const [paymentData, setPaymentData] = useState({
    montant: item?.montantRestant || 0,
    methodePaiement: 'Virement bancaire',
    datePaiement: new Date().toISOString().split('T')[0],
    reference: '',
    commentaires: ''
  })

  const [errors, setErrors] = useState({
    montant: '',
    reference: ''
  })

  if (!isOpen || !item) return null

  const validateForm = () => {
    const newErrors = {
      montant: '',
      reference: ''
    }

    if (!paymentData.montant || paymentData.montant <= 0) {
      newErrors.montant = 'Le montant doit être supérieur à 0'
    }

    if (paymentData.montant > item.montantRestant) {
      newErrors.montant = 'Le montant ne peut pas dépasser le montant restant'
    }

    if (!paymentData.reference.trim()) {
      newErrors.reference = 'La référence de paiement est requise'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handlePay = () => {
    if (validateForm()) {
      onPay(item.id, paymentData)
      // Reset form
      setPaymentData({
        montant: 0,
        methodePaiement: 'Virement bancaire',
        datePaiement: new Date().toISOString().split('T')[0],
        reference: '',
        commentaires: ''
      })
      setErrors({ montant: '', reference: '' })
    }
  }

  const handleClose = () => {
    setPaymentData({
      montant: item?.montantRestant || 0,
      methodePaiement: 'Virement bancaire',
      datePaiement: new Date().toISOString().split('T')[0],
      reference: '',
      commentaires: ''
    })
    setErrors({ montant: '', reference: '' })
    onClose()
  }

  const isPartialPayment = () => {
    return paymentData.montant < item.montantRestant && paymentData.montant > 0
  }

  const isFullPayment = () => {
    return paymentData.montant === item.montantRestant
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-green-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-green-500 rounded-lg mr-3">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Effectuer un paiement</div>
              <div className="text-sm font-normal text-gray-600">
                {item.numeroReference ? `Référence: ${item.numeroReference}` : 
                 `Fournisseur: ${item.fournisseur.nom}`}
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
          
          {/* Informations du fournisseur */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Informations fournisseur</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Nom:</span>
                    <p className="text-base font-bold text-gray-900">{item.fournisseur.nom}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">ID:</span>
                    <p className="text-base text-gray-900">{item.fournisseur.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-2">
                  <div>
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-base text-gray-900">{item.fournisseur.email}</p>
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">Téléphone:</span>
                    <p className="text-base text-gray-900">{item.fournisseur.telephone}</p>
                  </div>
                </div>
              </div>
            </div>

            {item.numeroFacture && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-blue-200">
                <span className="text-sm font-medium text-gray-600">Numéro de facture:</span>
                <p className="text-base font-bold text-gray-900">{item.numeroFacture}</p>
              </div>
            )}
          </div>

          {/* Montant à payer */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-red-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2" />
              Montant à régler
            </h4>
            
            <div className="bg-white p-6 rounded-lg border border-red-200 text-center">
              <div className="text-3xl font-bold text-red-600 mb-2">
                {item.montantRestant.toLocaleString()} DT
              </div>
              <div className="text-sm text-gray-600">
                {item.dateEcheance && (
                  <>
                    Échéance: {new Date(item.dateEcheance).toLocaleDateString('fr-FR')}
                    {new Date(item.dateEcheance) < new Date() && (
                      <span className="ml-2 text-red-600 font-medium">• En retard</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Détails du paiement */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <CreditCard className="w-5 h-5 mr-2 text-green-600" />
              Détails du paiement
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à payer (DT) *
                </label>
                <input
                  type="number"
                  value={paymentData.montant}
                  onChange={(e) => {
                    setPaymentData({ ...paymentData, montant: parseFloat(e.target.value) || 0 })
                    if (errors.montant) {
                      setErrors({ ...errors, montant: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.montant ? 'border-red-500' : 'border-gray-300'
                  }`}
                  min="0"
                  max={item.montantRestant}
                  step="0.01"
                  placeholder="0.00"
                />
                {errors.montant && (
                  <p className="mt-1 text-sm text-red-600">{errors.montant}</p>
                )}
                
                {/* Boutons de montant rapide */}
                <div className="mt-2 flex space-x-2">
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, montant: item.montantRestant / 2 })}
                    className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                  >
                    50%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, montant: item.montantRestant })}
                    className="px-2 py-1 text-xs bg-green-200 text-green-700 rounded hover:bg-green-300"
                  >
                    Tout payer
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de paiement
                </label>
                <input
                  type="date"
                  value={paymentData.datePaiement}
                  onChange={(e) => setPaymentData({ ...paymentData, datePaiement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Méthode de paiement
                </label>
                <select
                  value={paymentData.methodePaiement}
                  onChange={(e) => setPaymentData({ ...paymentData, methodePaiement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Virement bancaire">🏦 Virement bancaire</option>
                  <option value="Chèque">📝 Chèque</option>
                  <option value="Espèces">💵 Espèces</option>
                  <option value="Carte bancaire">💳 Carte bancaire</option>
                  <option value="Traite">📋 Traite</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence de paiement *
                </label>
                <input
                  type="text"
                  value={paymentData.reference}
                  onChange={(e) => {
                    setPaymentData({ ...paymentData, reference: e.target.value })
                    if (errors.reference) {
                      setErrors({ ...errors, reference: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.reference ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: VIRT-2024-001, CHQ-123456"
                />
                {errors.reference && (
                  <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                )}
              </div>
            </div>

            {/* Récapitulatif */}
            <div className="mt-6 bg-white p-4 rounded-lg border border-green-200">
              <h5 className="font-semibold text-gray-900 mb-3">Récapitulatif du paiement</h5>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Montant à payer:</span>
                  <div className="font-bold text-green-600">{paymentData.montant.toLocaleString()} DT</div>
                </div>
                <div>
                  <span className="text-gray-600">Montant restant après paiement:</span>
                  <div className={`font-bold ${(item.montantRestant - paymentData.montant) === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                    {(item.montantRestant - paymentData.montant).toLocaleString()} DT
                  </div>
                </div>
              </div>

              {/* Indicateur de type de paiement */}
              <div className="mt-3">
                {isFullPayment() && (
                  <div className="flex items-center text-green-700 bg-green-100 p-2 rounded">
                    <Check className="w-4 h-4 mr-2" />
                    <span className="font-medium">Paiement complet - Dette soldée</span>
                  </div>
                )}
                {isPartialPayment() && (
                  <div className="flex items-center text-orange-700 bg-orange-100 p-2 rounded">
                    <AlertTriangle className="w-4 h-4 mr-2" />
                    <span className="font-medium">Paiement partiel - Reste {(item.montantRestant - paymentData.montant).toLocaleString()} DT à payer</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et notes de paiement
            </label>
            <textarea
              value={paymentData.commentaires}
              onChange={(e) => setPaymentData({ ...paymentData, commentaires: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
              placeholder="Références bancaires, conditions particulières, notes..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Ces informations seront ajoutées à l'historique du paiement
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-green-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Attention :</span> Cette action mettra à jour le statut de paiement
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              onClick={handlePay}
              className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <CreditCard className="w-4 h-4" />
              <span>Confirmer le paiement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}