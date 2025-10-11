'use client'
import React from 'react'
import { X, Trash2, AlertTriangle, Receipt, Calendar, DollarSign, Building, FileText, CreditCard } from 'lucide-react'

interface DeleteInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  facture: {
    id: string
    numeroFacture: string
    fournisseurId: string
    dateFacture: string
    dateEcheance: string
    type: 'Achat' | 'Retour' | 'Avoir'
    statut: 'Payée' | 'En attente' | 'En retard' | 'Traitée' | 'Annulée'
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
  fournisseur?: {
    id: string
    nom: string
    email: string
    telephone: string
  }
}

export default function DeleteInvoiceModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  facture,
  fournisseur 
}: DeleteInvoiceModalProps) {
  if (!isOpen || !facture) return null

  const handleDelete = () => {
    onDelete(facture.id)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'Payée': return 'bg-green-100 text-green-800'
      case 'En attente': return 'bg-orange-100 text-orange-800'
      case 'En retard': return 'bg-red-100 text-red-800'
      case 'Traitée': return 'bg-blue-100 text-blue-800'
      case 'Annulée': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Achat': return 'bg-blue-100 text-blue-800'
      case 'Retour': return 'bg-red-100 text-red-800'
      case 'Avoir': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const hasFinancialImpact = () => {
    return facture.montantPaye > 0 || facture.montantDu > 0
  }

  const isOverdue = () => {
    return new Date(facture.dateEcheance) < new Date() && facture.statut === 'En retard'
  }

  const getFinancialWarnings = () => {
    const warnings = []
    
    if (facture.montantPaye > 0) {
      warnings.push(`${facture.montantPaye.toLocaleString()} DT déjà payés seront perdus dans l'historique`)
    }
    
    if (facture.montantDu > 0) {
      warnings.push(`${facture.montantDu.toLocaleString()} DT de dette ne seront plus suivis`)
    }
    
    if (facture.type === 'Retour' && facture.montantTTC < 0) {
      warnings.push(`Crédit de ${Math.abs(facture.montantTTC).toLocaleString()} DT sera supprimé`)
    }

    return warnings
  }

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
              Êtes-vous sûr de vouloir supprimer cette facture ?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cette action est <strong>définitive</strong> et ne peut pas être annulée. 
              Toutes les informations financières et l'historique associés seront perdus.
            </p>
          </div>

          {/* Détails de la facture à supprimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Receipt className="w-5 h-5 mr-2" />
              Facture qui sera supprimée
            </h4>
            
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <FileText className="w-4 h-4 mr-2" />
                      Numéro de facture
                    </div>
                    <div className="text-lg font-bold text-gray-900">{facture.numeroFacture}</div>
                    <div className="text-sm text-gray-500">ID: {facture.id}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date de facture
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{formatDate(facture.dateFacture)}</div>
                    <div className="text-sm text-gray-500">
                      Échéance: {formatDate(facture.dateEcheance)}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informations fournisseur */}
              {fournisseur && (
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="flex items-center text-sm text-gray-600 mb-2">
                    <Building className="w-4 h-4 mr-2" />
                    Fournisseur
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <div className="text-base font-semibold text-gray-900">{fournisseur.nom}</div>
                      <div className="text-sm text-gray-500">{fournisseur.id}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600">{fournisseur.email}</div>
                      <div className="text-sm text-gray-600">{fournisseur.telephone}</div>
                    </div>
                  </div>
                </div>
              )}

              {/* Type et statut */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Type</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getTypeColor(facture.type)}`}>
                      {facture.type}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Statut</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatutColor(facture.statut)}`}>
                      {facture.statut}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations financières qui seront perdues */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-900 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <DollarSign className="w-5 h-5 mr-2" />
                Données financières qui seront perdues
              </span>
              <div className="text-2xl font-bold text-orange-700">
                {facture.montantTTC.toLocaleString()} DT
              </div>
            </h4>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{facture.montantHT.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Montant HT (DT)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{facture.montantTTC.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Montant TTC (DT)</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{facture.montantPaye.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Montant payé (DT)</div>
                </div>
              </div>

              {facture.montantDu > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                  <div className="flex items-center text-red-800 text-sm">
                    <CreditCard className="w-4 h-4 mr-2" />
                    <span className="font-medium">
                      Montant encore dû: {facture.montantDu.toLocaleString()} DT
                    </span>
                  </div>
                </div>
              )}
              
              <div className="max-h-32 overflow-y-auto">
                <div className="space-y-2">
                  {facture.produits.map((produit, index) => (
                    <div key={index} className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {produit.quantite} × {produit.prixUnitaire.toLocaleString()} DT
                        </div>
                        <div className="text-xs text-gray-600">
                          = {(produit.quantite * produit.prixUnitaire).toLocaleString()} DT
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires qui seront perdus */}
          {facture.commentaires && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Commentaires qui seront perdus :</h5>
              <p className="text-sm text-gray-700 italic bg-white p-3 rounded border-l-4 border-gray-400">
                "{facture.commentaires}"
              </p>
            </div>
          )}

          {/* Avertissements spéciaux */}
          {hasFinancialImpact() && (
            <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-orange-900 mb-2">Impact financier critique !</h5>
                  <ul className="text-sm text-orange-800 space-y-1 list-disc list-inside">
                    {getFinancialWarnings().map((warning, index) => (
                      <li key={index}>{warning}</li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {isOverdue() && (
            <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-red-900 mb-2">Facture en retard !</h5>
                  <p className="text-sm text-red-800">
                    Cette facture est en retard de paiement depuis le {formatDate(facture.dateEcheance)}. 
                    La suppression effacera le suivi de cette dette.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Avertissement final */}
          <div className="bg-red-100 border-2 border-red-300 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-red-900 mb-2">Conséquences de la suppression :</h5>
                <ul className="text-sm text-red-800 space-y-1 list-disc list-inside">
                  <li>La facture {facture.numeroFacture} sera définitivement supprimée</li>
                  <li>L'historique des {facture.produits.length} produit{facture.produits.length > 1 ? 's' : ''} sera perdu</li>
                  <li>Le montant de {facture.montantTTC.toLocaleString()} DT ne sera plus suivi</li>
                  <li>Les informations de paiement ({facture.montantPaye.toLocaleString()} DT payés) seront effacées</li>
                  {facture.montantDu > 0 && (
                    <li>La dette de {facture.montantDu.toLocaleString()} DT ne sera plus suivie</li>
                  )}
                  <li>Cette action ne pourra pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-t-2 border-red-200 rounded-b-xl">
          <div className="text-sm text-red-700">
            <strong>Attention :</strong> Cette action est irréversible et peut impacter la comptabilité
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