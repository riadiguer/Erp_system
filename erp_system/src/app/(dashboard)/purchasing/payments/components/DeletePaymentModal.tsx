'use client'
import React from 'react'
import { X, Trash2, AlertTriangle, Building, CreditCard, DollarSign, Calendar, FileText, User } from 'lucide-react'

interface DeletePaymentModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
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
}

export default function DeletePaymentModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  paiement 
}: DeletePaymentModalProps) {
  if (!isOpen || !paiement) return null

  const handleDelete = () => {
    onDelete(paiement.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatutColor = () => {
    switch (paiement.statut) {
      case 'Payé': return 'bg-green-100 text-green-800'
      case 'Partiel': return 'bg-yellow-100 text-yellow-800'
      case 'En attente': return 'bg-blue-100 text-blue-800'
      case 'En retard': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const isOverdue = () => {
    if (paiement.statut === 'Payé') return false
    return new Date(paiement.dateEcheance) < new Date()
  }

  const getImpactFinancier = () => {
    if (paiement.montantPaye > 0) {
      return {
        type: 'warning',
        message: `Ce paiement a déjà été partiellement ou totalement effectué (${paiement.montantPaye.toLocaleString()} DT)`,
        details: `La suppression remettra ${paiement.montantPaye.toLocaleString()} DT en dette impayée`
      }
    }
    return {
      type: 'info',
      message: 'Aucun paiement n\'a encore été effectué pour cette facture',
      details: 'La suppression n\'aura pas d\'impact financier direct'
    }
  }

  const impact = getImpactFinancier()

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-3xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-red-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-red-500 rounded-lg mr-3">
              <Trash2 className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold text-red-900">Confirmer la suppression</div>
              <div className="text-sm font-normal text-red-700">Action irréversible</div>
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
          
          {/* Avertissement principal */}
          <div className="text-center">
            <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Êtes-vous sûr de vouloir supprimer ce paiement ?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cette action est <strong>définitive</strong> et ne peut pas être annulée. 
              Toutes les informations financières associées seront perdues.
            </p>
          </div>

          {/* Détails du paiement à supprimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Paiement qui sera supprimé
            </h4>
            
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <CreditCard className="w-4 h-4 mr-2" />
                      Référence paiement
                    </div>
                    <div className="text-lg font-bold text-gray-900">{paiement.numeroReference}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Numéro de facture
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{paiement.numeroFacture}</div>
                  </div>
                </div>
              </div>

              {/* Informations fournisseur */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Building className="w-4 h-4 mr-2" />
                  Fournisseur
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{paiement.fournisseur.nom}</div>
                    <div className="text-sm text-gray-500">{paiement.fournisseur.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{paiement.fournisseur.email}</div>
                    <div className="text-sm text-gray-600">{paiement.fournisseur.telephone}</div>
                  </div>
                </div>
              </div>

              {/* Informations financières */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Montant dû</div>
                    <div className="text-lg font-bold text-gray-900">
                      {paiement.montantDu.toLocaleString()} DT
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Montant payé</div>
                    <div className={`text-lg font-bold ${paiement.montantPaye > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                      {paiement.montantPaye.toLocaleString()} DT
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Montant restant</div>
                    <div className={`text-lg font-bold ${paiement.montantRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      {paiement.montantRestant.toLocaleString()} DT
                    </div>
                  </div>
                </div>
              </div>

              {/* Dates et statut */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date d'échéance
                    </div>
                    <div className={`text-base font-semibold ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                      {formatDate(paiement.dateEcheance)}
                    </div>
                    {isOverdue() && (
                      <div className="text-xs text-red-600 font-medium">En retard</div>
                    )}
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Statut</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatutColor()}`}>
                      {paiement.statut}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Méthode de paiement</div>
                    <div className="text-base font-semibold text-gray-900">{paiement.methodePaiement}</div>
                  </div>
                </div>
              </div>

              {/* Date de paiement et gestionnaire */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date de paiement
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {paiement.datePaiement ? formatDate(paiement.datePaiement) : 'Non payé'}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <User className="w-4 h-4 mr-2" />
                      Gestionnaire
                    </div>
                    <div className="text-base font-semibold text-gray-900">{paiement.gestionnaire}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Impact financier */}
          <div className={`border-2 rounded-xl p-6 ${
            impact.type === 'warning' 
              ? 'bg-orange-50 border-orange-300' 
              : 'bg-blue-50 border-blue-300'
          }`}>
            <div className="flex items-start space-x-3">
              <AlertTriangle className={`w-6 h-6 flex-shrink-0 mt-1 ${
                impact.type === 'warning' ? 'text-orange-600' : 'text-blue-600'
              }`} />
              <div>
                <h5 className={`font-bold mb-2 ${
                  impact.type === 'warning' ? 'text-orange-900' : 'text-blue-900'
                }`}>
                  Impact financier de la suppression
                </h5>
                <p className={`text-sm mb-2 ${
                  impact.type === 'warning' ? 'text-orange-800' : 'text-blue-800'
                }`}>
                  {impact.message}
                </p>
                <p className={`text-sm font-medium ${
                  impact.type === 'warning' ? 'text-orange-900' : 'text-blue-900'
                }`}>
                  {impact.details}
                </p>
              </div>
            </div>
          </div>

          {/* Commentaires qui seront perdus */}
          {paiement.commentaires && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Commentaires qui seront perdus :</h5>
              <p className="text-sm text-gray-700 italic bg-white p-3 rounded border-l-4 border-gray-400">
                "{paiement.commentaires}"
              </p>
            </div>
          )}

          {/* Avertissement final */}
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-red-900 mb-2">Conséquences de la suppression :</h5>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>Le paiement {paiement.numeroReference} sera définitivement supprimé</li>
                  <li>La facture {paiement.numeroFacture} perdra son lien de paiement</li>
                  {paiement.montantPaye > 0 && (
                    <li className="font-medium">
                      {paiement.montantPaye.toLocaleString()} DT repasseront en dette impayée
                    </li>
                  )}
                  <li>L'historique des transactions avec {paiement.fournisseur.nom} sera impacté</li>
                  <li>Les informations de {paiement.gestionnaire} seront perdues</li>
                  <li>Cette action ne pourra pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Alerte spéciale pour paiements effectués */}
          {paiement.montantPaye > 0 && (
            <div className="bg-yellow-100 border-2 border-yellow-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <DollarSign className="w-6 h-6 text-yellow-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-yellow-900 mb-2">
                    ⚠️ Attention : Paiement déjà effectué !
                  </h5>
                  <p className="text-sm text-yellow-800">
                    Ce paiement a déjà été partiellement ou totalement effectué pour un montant de{' '}
                    <strong>{paiement.montantPaye.toLocaleString()} DT</strong>. 
                    La suppression ne récupérera pas cet argent mais remettra cette somme en dette impayée 
                    dans votre système comptable.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-t-2 border-red-200 rounded-b-xl">
          <div className="text-sm text-red-700">
            <strong>Attention :</strong> Cette action affectera la comptabilité et ne peut pas être annulée
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              onClick={handleDelete}
              className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-sm border-2 border-red-700"
            >
              <Trash2 className="w-4 h-4" />
              <span>Supprimer définitivement</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}