'use client'
import React, { useState, useEffect } from 'react'
import { 
  X, 
  CreditCard, 
  DollarSign, 
  Calendar, 
  AlertTriangle, 
  Check, 
  Receipt, 
  Building, 
  Calculator,
  Banknote,
  Wallet,
  FileText,
  Info
} from 'lucide-react'

interface PayInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onPay: (paymentData: any) => void
  facture: {
    id: string
    numeroFacture: string
    dateFacture: string
    dateEcheance: string
    montantTTC: number
    montantPaye: number
    montantDu: number
    statut: string
  }
  fournisseur: {
    id: string
    nom: string
    email: string
    telephone: string
  }
}

export default function PayInvoiceModal({ 
  isOpen, 
  onClose, 
  onPay, 
  facture, 
  fournisseur 
}: PayInvoiceModalProps) {
  const [paymentData, setPaymentData] = useState({
    montantPaiement: facture?.montantDu || 0,
    typePaiement: 'virement',
    dateTransaction: new Date().toISOString().split('T')[0],
    reference: '',
    commentaires: '',
    fraisBancaires: 0,
    taux: 0,
    compteDebit: 'compte-principal'
  })

  const [errors, setErrors] = useState({
    montantPaiement: '',
    reference: '',
    dateTransaction: ''
  })

  const [showCalculator, setShowCalculator] = useState(false)

  useEffect(() => {
    if (facture && isOpen) {
      setPaymentData(prev => ({
        ...prev,
        montantPaiement: facture.montantDu,
        reference: `PAY-${facture.numeroFacture}-${Date.now().toString().slice(-6)}`
      }))
    }
  }, [facture, isOpen])

  if (!isOpen || !facture) return null

  const validateForm = () => {
    const newErrors = {
      montantPaiement: '',
      reference: '',
      dateTransaction: ''
    }

    if (!paymentData.montantPaiement || paymentData.montantPaiement <= 0) {
      newErrors.montantPaiement = 'Le montant doit être supérieur à 0'
    }

    if (paymentData.montantPaiement > facture.montantDu) {
      newErrors.montantPaiement = 'Le montant ne peut pas dépasser le montant dû'
    }

    if (!paymentData.reference.trim()) {
      newErrors.reference = 'La référence de transaction est requise'
    }

    if (!paymentData.dateTransaction) {
      newErrors.dateTransaction = 'La date de transaction est requise'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handlePay = () => {
    if (validateForm()) {
      const finalPaymentData = {
        ...paymentData,
        factureId: facture.id,
        montantAvantPaiement: facture.montantDu,
        montantApres: facture.montantDu - paymentData.montantPaiement,
        nouveauStatut: (facture.montantDu - paymentData.montantPaiement) <= 0 ? 'Payée' : 'Partiellement payée'
      }
      onPay(finalPaymentData)
    }
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isPartialPayment = paymentData.montantPaiement < facture.montantDu
  const isOverpayment = paymentData.montantPaiement > facture.montantDu
  const isFullPayment = paymentData.montantPaiement === facture.montantDu

  const getPaymentTypeIcon = (type) => {
    switch (type) {
      case 'virement': return <Banknote className="w-4 h-4" />
      case 'cheque': return <FileText className="w-4 h-4" />
      case 'especes': return <Wallet className="w-4 h-4" />
      case 'carte': return <CreditCard className="w-4 h-4" />
      default: return <DollarSign className="w-4 h-4" />
    }
  }

  const calculerDelaiRetard = () => {
    const aujourdhui = new Date()
    const echeance = new Date(facture.dateEcheance)
    const diffTime = aujourdhui - echeance
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays > 0 ? diffDays : 0
  }

  const delaiRetard = calculerDelaiRetard()

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-green-500 rounded-lg mr-3">
              <CreditCard className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Paiement de facture</div>
              <div className="text-sm font-normal text-gray-600">
                {facture.numeroFacture} - {fournisseur.nom}
              </div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Alerte de retard si nécessaire */}
          {delaiRetard > 0 && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                <div>
                  <h4 className="font-semibold text-red-900">Facture en retard</h4>
                  <p className="text-sm text-red-700">
                    Cette facture est en retard de <strong>{delaiRetard} jour{delaiRetard > 1 ? 's' : ''}</strong> 
                    (échéance : {formatDate(facture.dateEcheance)})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Informations de la facture */}
          <div className="bg-gray-50 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2 text-gray-600" />
              Détails de la facture
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Fournisseur:</span>
                  <span className="font-medium text-gray-900">{fournisseur.nom}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Numéro:</span>
                  <span className="font-medium text-gray-900">{facture.numeroFacture}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Date facture:</span>
                  <span className="font-medium text-gray-900">{formatDate(facture.dateFacture)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Échéance:</span>
                  <span className={`font-medium ${delaiRetard > 0 ? 'text-red-600' : 'text-gray-900'}`}>
                    {formatDate(facture.dateEcheance)}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Montant total:</span>
                  <span className="font-bold text-gray-900">{formatCurrency(facture.montantTTC)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Déjà payé:</span>
                  <span className="font-medium text-green-600">{formatCurrency(facture.montantPaye)}</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="text-gray-600 font-medium">Montant dû:</span>
                  <span className="font-bold text-red-600 text-lg">{formatCurrency(facture.montantDu)}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Formulaire de paiement */}
          <div className="bg-white border border-gray-200 rounded-xl p-6">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Détails du paiement
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Montant du paiement */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Montant à payer *
                </label>
                <div className="relative">
                  <input
                    type="number"
                    value={paymentData.montantPaiement}
                    onChange={(e) => {
                      const value = parseFloat(e.target.value) || 0
                      setPaymentData({ ...paymentData, montantPaiement: value })
                      if (errors.montantPaiement) {
                        setErrors({ ...errors, montantPaiement: '' })
                      }
                    }}
                    className={`w-full px-4 py-3 text-lg border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                      errors.montantPaiement ? 'border-red-500' : 'border-gray-300'
                    }`}
                    placeholder="0.00"
                    min="0"
                    max={facture.montantDu}
                    step="0.01"
                  />
                  <div className="absolute right-3 top-3 text-gray-500 font-medium">DT</div>
                </div>
                {errors.montantPaiement && (
                  <p className="mt-1 text-sm text-red-600">{errors.montantPaiement}</p>
                )}
                
                {/* Boutons de montant rapide */}
                <div className="flex space-x-2 mt-3">
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, montantPaiement: facture.montantDu })}
                    className="px-3 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200 transition-colors"
                  >
                    Montant total ({formatCurrency(facture.montantDu)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentData({ ...paymentData, montantPaiement: facture.montantDu / 2 })}
                    className="px-3 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
                  >
                    50% ({formatCurrency(facture.montantDu / 2)})
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCalculator(!showCalculator)}
                    className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors flex items-center"
                  >
                    <Calculator className="w-3 h-3 mr-1" />
                    Calculer
                  </button>
                </div>
              </div>

              {/* Type de paiement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement *
                </label>
                <select
                  value={paymentData.typePaiement}
                  onChange={(e) => setPaymentData({ ...paymentData, typePaiement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="virement">🏦 Virement bancaire</option>
                  <option value="cheque">📄 Chèque</option>
                  <option value="especes">💵 Espèces</option>
                  <option value="carte">💳 Carte bancaire</option>
                  <option value="traite">📋 Traite</option>
                </select>
              </div>

              {/* Date de transaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de transaction *
                </label>
                <input
                  type="date"
                  value={paymentData.dateTransaction}
                  onChange={(e) => {
                    setPaymentData({ ...paymentData, dateTransaction: e.target.value })
                    if (errors.dateTransaction) {
                      setErrors({ ...errors, dateTransaction: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
                    errors.dateTransaction ? 'border-red-500' : 'border-gray-300'
                  }`}
                  max={new Date().toISOString().split('T')[0]}
                />
                {errors.dateTransaction && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateTransaction}</p>
                )}
              </div>

              {/* Référence de transaction */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence de transaction *
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
                  placeholder="Ex: VIR-2024-001234"
                />
                {errors.reference && (
                  <p className="mt-1 text-sm text-red-600">{errors.reference}</p>
                )}
              </div>

              {/* Compte de débit */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Compte de débit
                </label>
                <select
                  value={paymentData.compteDebit}
                  onChange={(e) => setPaymentData({ ...paymentData, compteDebit: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="compte-principal">Compte principal - 123456789</option>
                  <option value="compte-courant">Compte courant - 987654321</option>
                  <option value="compte-tresorerie">Compte trésorerie - 456789123</option>
                </select>
              </div>

              {/* Frais bancaires */}
              <div className="md:col-span-2">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Frais bancaires (optionnel)
                    </label>
                    <input
                      type="number"
                      value={paymentData.fraisBancaires}
                      onChange={(e) => setPaymentData({ ...paymentData, fraisBancaires: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="0.00"
                      min="0"
                      step="0.01"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Taux de change (si différent)
                    </label>
                    <input
                      type="number"
                      value={paymentData.taux}
                      onChange={(e) => setPaymentData({ ...paymentData, taux: parseFloat(e.target.value) || 0 })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="1.000"
                      min="0"
                      step="0.001"
                    />
                  </div>
                </div>
              </div>

              {/* Commentaires */}
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Commentaires
                </label>
                <textarea
                  value={paymentData.commentaires}
                  onChange={(e) => setPaymentData({ ...paymentData, commentaires: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  placeholder="Notes additionnelles sur ce paiement..."
                />
              </div>
            </div>
          </div>

          {/* Résumé du paiement */}
          <div className={`rounded-xl p-6 border-2 ${
            isOverpayment ? 'bg-red-50 border-red-200' :
            isPartialPayment ? 'bg-orange-50 border-orange-200' :
            'bg-green-50 border-green-200'
          }`}>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Info className="w-5 h-5 mr-2" />
              Résumé du paiement
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Montant à payer</p>
                <p className="text-xl font-bold text-green-600">{formatCurrency(paymentData.montantPaiement)}</p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Restant dû après paiement</p>
                <p className={`text-xl font-bold ${
                  (facture.montantDu - paymentData.montantPaiement) > 0 ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {formatCurrency(Math.max(0, facture.montantDu - paymentData.montantPaiement))}
                </p>
              </div>
              <div className="text-center p-4 bg-white rounded-lg">
                <p className="text-sm text-gray-600">Nouveau statut</p>
                <p className={`text-sm font-bold ${
                  isOverpayment ? 'text-red-600' :
                  isPartialPayment ? 'text-orange-600' : 'text-green-600'
                }`}>
                  {isOverpayment ? 'Surpaiement' :
                   isPartialPayment ? 'Partiellement payée' : 'Entièrement payée'}
                </p>
              </div>
            </div>

            {/* Messages d'alerte */}
            {isOverpayment && (
              <div className="mt-4 p-3 bg-red-100 border border-red-300 rounded-lg">
                <p className="text-sm text-red-800">
                  ⚠️ Le montant saisi dépasse le montant dû. Un avoir sera généré pour la différence.
                </p>
              </div>
            )}
            
            {isPartialPayment && (
              <div className="mt-4 p-3 bg-orange-100 border border-orange-300 rounded-lg">
                <p className="text-sm text-orange-800">
                  ℹ️ Paiement partiel. Il restera {formatCurrency(facture.montantDu - paymentData.montantPaiement)} à payer.
                </p>
              </div>
            )}

            {isFullPayment && (
              <div className="mt-4 p-3 bg-green-100 border border-green-300 rounded-lg">
                <p className="text-sm text-green-800">
                  ✅ Paiement complet. La facture sera marquée comme entièrement payée.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Total avec frais :</span> 
            {formatCurrency(paymentData.montantPaiement + paymentData.fraisBancaires)}
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              onClick={handlePay}
              disabled={isOverpayment}
              className={`px-6 py-2 text-sm font-medium text-white rounded-lg transition-colors flex items-center space-x-2 shadow-sm ${
                isOverpayment 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>
                {isPartialPayment ? 'Payer partiellement' : 'Payer intégralement'}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}