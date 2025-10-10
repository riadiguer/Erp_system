'use client'
import React from 'react'
import { X, Trash2, AlertTriangle, Building, Package, Calendar, DollarSign, User, Truck } from 'lucide-react'

interface DeleteReceptionModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
  reception: {
    id: string
    numeroReception: string
    bonCommande: {
      id: string
      numeroBon: string
      fournisseur: { 
        id: string
        nom: string
        email: string
      }
    }
    dateReception: string
    heureReception: string
    receptionnePar: string
    numeroBonLivraison: string
    transporteur: string
    etatLivraison: string
    produits: Array<{
      id: string
      nom: string
      quantiteCommandee: number
      quantiteRecue: number
      etat: string
      prixUnitaire: number
      commentaire: string
    }>
    commentairesReception: string
    montantTotal: number
    statut: string
  }
}

export default function DeleteReceptionModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  reception 
}: DeleteReceptionModalProps) {
  if (!isOpen || !reception) return null

  const handleDelete = () => {
    onDelete(reception.id)
  }

  const getTotalQuantiteRecue = () => {
    return reception.produits.reduce((total, produit) => total + produit.quantiteRecue, 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatutColor = () => {
    switch (reception.statut) {
      case 'Réceptionné': return 'bg-green-100 text-green-800'
      case 'Problème': return 'bg-red-100 text-red-800'
      case 'En cours': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getEtatColor = () => {
    switch (reception.etatLivraison) {
      case 'Conforme': return 'bg-green-100 text-green-800'
      case 'Partiellement conforme': return 'bg-orange-100 text-orange-800'
      case 'Non conforme': return 'bg-red-100 text-red-800'
      case 'Endommagé': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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
              Êtes-vous sûr de vouloir supprimer cette réception ?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cette action est <strong>définitive</strong> et ne peut pas être annulée. 
              Toutes les informations de réception et de traçabilité seront perdues.
            </p>
          </div>

          {/* Détails de la réception à supprimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Réception qui sera supprimée
            </h4>
            
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Package className="w-4 h-4 mr-2" />
                      Numéro de réception
                    </div>
                    <div className="text-lg font-bold text-gray-900">{reception.numeroReception}</div>
                    <div className="text-sm text-gray-500">ID: {reception.id}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date et heure
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{formatDate(reception.dateReception)}</div>
                    <div className="text-sm text-gray-500">{reception.heureReception}</div>
                  </div>
                </div>
              </div>

              {/* Bon de commande associé */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Package className="w-4 h-4 mr-2" />
                  Bon de commande associé
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{reception.bonCommande.numeroBon}</div>
                    <div className="text-sm text-gray-500">{reception.bonCommande.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{reception.bonCommande.fournisseur.nom}</div>
                    <div className="text-sm text-gray-500">{reception.bonCommande.fournisseur.email}</div>
                  </div>
                </div>
              </div>

              {/* Informations de réception */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Réceptionné par</div>
                    <div className="flex items-center">
                      <User className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-semibold text-gray-900">{reception.receptionnePar}</span>
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Bon de livraison</div>
                    <div className="text-sm font-semibold text-gray-900">{reception.numeroBonLivraison}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Transporteur</div>
                    <div className="flex items-center">
                      <Truck className="w-4 h-4 text-gray-400 mr-1" />
                      <span className="text-sm font-semibold text-gray-900">{reception.transporteur || 'Non spécifié'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* État et statut */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">État de livraison</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getEtatColor()}`}>
                      {reception.etatLivraison}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Statut de traitement</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatutColor()}`}>
                      {reception.statut}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Articles et montants qui seront perdus */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-900 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Données qui seront perdues
              </span>
              <div className="flex items-center text-2xl font-bold text-green-700">
                <DollarSign className="w-6 h-6 mr-1" />
                {reception.montantTotal.toLocaleString()} DT
              </div>
            </h4>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{reception.produits.length}</div>
                  <div className="text-sm text-gray-600">articles différents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getTotalQuantiteRecue()}</div>
                  <div className="text-sm text-gray-600">quantité totale reçue</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{reception.montantTotal.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">montant total (DT)</div>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {reception.produits.map((produit, index) => (
                    <div key={produit.id} className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
                          {index + 1}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${
                          produit.etat === 'Conforme' ? 'bg-green-500' :
                          produit.etat === 'Partiel' ? 'bg-orange-500' :
                          produit.etat === 'Endommagé' ? 'bg-red-500' : 'bg-gray-500'
                        }`} />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                          <div className="text-xs text-gray-600">
                            État: {produit.etat}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {produit.quantiteRecue} reçues
                        </div>
                        <div className="text-xs text-gray-600">
                          {(produit.quantiteRecue * produit.prixUnitaire).toLocaleString()} DT
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires qui seront perdus */}
          {reception.commentairesReception && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Commentaires qui seront perdus :</h5>
              <p className="text-sm text-gray-700 italic bg-white p-3 rounded border-l-4 border-gray-400">
                "{reception.commentairesReception}"
              </p>
            </div>
          )}

          {/* Avertissement spécial pour les réceptions avec problèmes */}
          {reception.statut === 'Problème' && (
            <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-orange-900 mb-2">Attention : Réception avec problèmes !</h5>
                  <p className="text-sm text-orange-800">
                    Cette réception présente des anomalies (articles manquants, endommagés ou partiels). 
                    La suppression pourrait impacter le suivi des problèmes avec le fournisseur 
                    <strong> {reception.bonCommande.fournisseur.nom}</strong>.
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
                  <li>La réception {reception.numeroReception} sera définitivement supprimée</li>
                  <li>{reception.produits.length} article{reception.produits.length > 1 ? 's' : ''} et {getTotalQuantiteRecue()} unité{getTotalQuantiteRecue() > 1 ? 's' : ''} reçue{getTotalQuantiteRecue() > 1 ? 's' : ''} seront perdu{getTotalQuantiteRecue() > 1 ? 'es' : 'e'}</li>
                  <li>Le montant de {reception.montantTotal.toLocaleString()} DT ne sera plus tracé</li>
                  <li>L'historique de réception du bon {reception.bonCommande.numeroBon} sera effacé</li>
                  <li>Les informations de traçabilité (transporteur, bon de livraison) seront perdues</li>
                  <li>Les commentaires et observations de réception seront supprimés</li>
                  <li>Cette action ne pourra pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Impact sur la traçabilité */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <Package className="w-5 h-5 text-blue-600 flex-shrink-0 mt-1" />
              <div>
                <h5 className="font-bold text-blue-900 mb-2">Impact sur la traçabilité :</h5>
                <div className="text-sm text-blue-800 space-y-1">
                  <p>• Le bon de commande <strong>{reception.bonCommande.numeroBon}</strong> perdra son historique de réception</p>
                  <p>• La relation avec le fournisseur <strong>{reception.bonCommande.fournisseur.nom}</strong> ne pourra plus être tracée</p>
                  <p>• Les données de livraison (transporteur: {reception.transporteur || 'Non spécifié'}, BL: {reception.numeroBonLivraison}) seront perdues</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-t-2 border-red-200 rounded-b-xl">
          <div className="text-sm text-red-700">
            <strong>Attention :</strong> Cette action supprime définitivement toutes les données de réception
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