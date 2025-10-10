'use client'
import React from 'react'
import { X, Trash2, AlertTriangle, User, Package, Calendar } from 'lucide-react'

interface DeleteDemandModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
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
}

export default function DeleteDemandModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  demande 
}: DeleteDemandModalProps) {
  if (!isOpen || !demande) return null

  const handleDelete = () => {
    onDelete(demande.id)
  }

  const getTotalQuantity = () => {
    return demande.produits.reduce((total, produit) => total + produit.quantite, 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
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
              Êtes-vous sûr de vouloir supprimer cette demande ?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cette action est <strong>définitive</strong> et ne peut pas être annulée. 
              Toutes les informations associées à cette demande seront perdues.
            </p>
          </div>

          {/* Détails de la demande à supprimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Demande qui sera supprimée
            </h4>
            
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Package className="w-4 h-4 mr-2" />
                      Numéro de demande
                    </div>
                    <div className="text-lg font-bold text-gray-900">{demande.id}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date de création
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{formatDate(demande.dateCreation)}</div>
                  </div>
                </div>
              </div>

              {/* Informations utilisateur */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <User className="w-4 h-4 mr-2" />
                  Demandeur
                </div>
                <div className="text-base font-semibold text-gray-900">
                  {demande.utilisateur.nom} ({demande.utilisateur.id})
                </div>
              </div>

              {/* Statut et priorité */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Priorité</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      demande.priorite === 'Haute' ? 'bg-red-100 text-red-800' :
                      demande.priorite === 'Moyenne' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {demande.priorite}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Statut</div>
                    <span className="inline-block px-3 py-1 text-sm font-semibold rounded-full bg-orange-100 text-orange-800">
                      {demande.statut}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste des articles qui seront perdus */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2" />
              Articles qui seront perdus ({demande.produits.length})
            </h4>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200 max-h-48 overflow-y-auto">
              <div className="text-center mb-4 text-yellow-800">
                <div className="text-2xl font-bold">{getTotalQuantity()}</div>
                <div className="text-sm">articles au total</div>
              </div>
              
              <div className="space-y-2">
                {demande.produits.map((produit, index) => (
                  <div key={produit.id} className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded border border-yellow-200">
                    <div className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
                        {index + 1}
                      </div>
                      <div className={`w-2 h-2 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                      <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                    </div>
                    <div className="text-sm font-bold text-gray-900">
                      Qté: {produit.quantite}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commentaires qui seront perdus */}
          {demande.commentaires && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Commentaires qui seront perdus :</h5>
              <p className="text-sm text-gray-700 italic bg-white p-3 rounded border-l-4 border-gray-400">
                "{demande.commentaires}"
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
                  <li>La demande {demande.id} sera définitivement supprimée</li>
                  <li>{demande.produits.length} article{demande.produits.length > 1 ? 's' : ''} et {getTotalQuantity()} unité{getTotalQuantity() > 1 ? 's' : ''} seront perdu{getTotalQuantity() > 1 ? 'es' : 'e'}</li>
                  <li>L'historique et les commentaires associés seront effacés</li>
                  <li>Cette action ne pourra pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-t-2 border-red-200 rounded-b-xl">
          <div className="text-sm text-red-700">
            <strong>Attention :</strong> Cette action est irréversible
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