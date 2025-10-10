'use client'
import React from 'react'
import { X, Eye, CreditCard, Calendar, Building, DollarSign, MessageSquare, AlertTriangle, User, FileText, Check, Clock } from 'lucide-react'

interface ViewPaymentModalProps {
  isOpen: boolean
  onClose: () => void
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
  getStatutColor: (statut: string) => string
}

export default function ViewPaymentModal({ 
  isOpen, 
  onClose, 
  paiement, 
  getStatutColor 
}: ViewPaymentModalProps) {
  if (!isOpen || !paiement) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const isOverdue = () => {
    if (paiement.statut === 'Payé') return false
    return new Date(paiement.dateEcheance) < new Date()
  }

  const getDaysUntilExpiration = () => {
    const today = new Date()
    const expiration = new Date(paiement.dateEcheance)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getPaymentProgress = () => {
    return (paiement.montantPaye / paiement.montantDu) * 100
  }

  const getMethodeIcon = () => {
    switch (paiement.methodePaiement) {
      case 'Virement bancaire': return '🏦'
      case 'Chèque': return '📝'
      case 'Espèces': return '💵'
      case 'Carte bancaire': return '💳'
      case 'Traite': return '📋'
      default: return '💰'
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-indigo-50 to-purple-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-indigo-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Détails du paiement</h3>
              <p className="text-sm text-gray-600">Consultation complète du paiement fournisseur</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-8">
          
          {/* En-tête du paiement */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <CreditCard className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">Référence</span>
                </div>
                <p className="text-xl font-bold text-gray-900">{paiement.numeroReference}</p>
                <p className="text-xs text-gray-500">ID: {paiement.id}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">Facture</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{paiement.numeroFacture}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span className="text-sm font-medium text-gray-600">Gestionnaire</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">{paiement.gestionnaire}</p>
              </div>
            </div>
          </div>

          {/* Informations du fournisseur */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Informations fournisseur</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Nom:</span>
                    <p className="text-base font-bold text-gray-900">{paiement.fournisseur.nom}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">ID:</span>
                    <p className="text-base text-gray-900">{paiement.fournisseur.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-base text-gray-900">{paiement.fournisseur.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Téléphone:</span>
                    <p className="text-base text-gray-900">{paiement.fournisseur.telephone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Statut et échéances */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-600" />
              Statut et échéances
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Statut actuel</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(paiement.statut)}`}>
                    {paiement.statut}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Date d'échéance</span>
                <div className="flex items-center space-x-3">
                  <Calendar className="w-5 h-5 text-gray-500" />
                  <div>
                    <p className={`text-lg font-bold ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(paiement.dateEcheance)}
                    </p>
                    {isOverdue() ? (
                      <p className="text-xs text-red-600 font-medium">En retard</p>
                    ) : (
                      <p className="text-xs text-gray-500">{getDaysUntilExpiration()} jours restants</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Méthode de paiement</span>
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getMethodeIcon()}</span>
                  <span className="text-lg font-bold text-gray-900">{paiement.methodePaiement}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Informations financières */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Informations financières
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Montant dû</div>
                <div className="text-3xl font-bold text-gray-900">{paiement.montantDu.toLocaleString()}</div>
                <div className="text-sm text-gray-500">DT</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Montant payé</div>
                <div className="text-3xl font-bold text-green-600">{paiement.montantPaye.toLocaleString()}</div>
                <div className="text-sm text-gray-500">DT</div>
              </div>
              
              <div className="bg-white p-6 rounded-lg border border-green-200 text-center">
                <div className="text-sm font-medium text-gray-600 mb-2">Reste à payer</div>
                <div className={`text-3xl font-bold ${paiement.montantRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {paiement.montantRestant.toLocaleString()}
                </div>
                <div className="text-sm text-gray-500">DT</div>
              </div>
            </div>

            {/* Barre de progression du paiement */}
            <div className="bg-white p-6 rounded-lg border border-green-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm font-medium text-gray-600">Progression du paiement</span>
                <span className="text-sm font-bold text-gray-900">{getPaymentProgress().toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4">
                <div 
                  className={`h-4 rounded-full transition-all duration-300 ${
                    getPaymentProgress() === 100 ? 'bg-green-500' : 
                    getPaymentProgress() > 0 ? 'bg-yellow-500' : 'bg-gray-400'
                  }`}
                  style={{ width: `${Math.max(getPaymentProgress(), 5)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500 mt-2">
                <span>0 DT</span>
                <span>{paiement.montantDu.toLocaleString()} DT</span>
              </div>
            </div>
          </div>

          {/* Historique des paiements */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Clock className="w-5 h-5 mr-2 text-gray-600" />
              Historique des paiements
            </h4>
            
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              {paiement.datePaiement ? (
                <div className="flex items-center space-x-4 p-4 bg-green-50 rounded-lg border border-green-200">
                  <div className="flex items-center justify-center w-10 h-10 bg-green-500 rounded-full">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-semibold text-gray-900">Paiement effectué</h5>
                        <p className="text-sm text-gray-600">
                          Le {formatDate(paiement.datePaiement)} via {paiement.methodePaiement}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-green-600">
                          +{paiement.montantPaye.toLocaleString()} DT
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="flex items-center space-x-4 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <div className="flex items-center justify-center w-10 h-10 bg-orange-500 rounded-full">
                    <Clock className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900">Aucun paiement effectué</h5>
                    <p className="text-sm text-gray-600">
                      En attente de paiement - Échéance: {new Date(paiement.dateEcheance).toLocaleDateString('fr-FR')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Commentaires */}
          {paiement.commentaires && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Commentaires et notes</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 leading-relaxed text-base">
                  {paiement.commentaires}
                </p>
              </div>
            </div>
          )}

          {/* Alertes */}
          {isOverdue() && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="text-lg font-bold text-red-900">Paiement en retard</h4>
                  <p className="text-red-700">
                    Ce paiement a dépassé sa date d'échéance du {formatDate(paiement.dateEcheance)}. 
                    Une relance fournisseur pourrait être nécessaire.
                  </p>
                </div>
              </div>
            </div>
          )}

          {paiement.statut === 'Partiel' && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <h4 className="text-lg font-bold text-orange-900">Paiement partiel</h4>
                  <p className="text-orange-700">
                    Il reste {paiement.montantRestant.toLocaleString()} DT à régler sur ce paiement. 
                    Pensez à programmer le solde.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-indigo-600 rounded-lg hover:bg-indigo-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  )
}