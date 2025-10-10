'use client'
import React from 'react'
import { X, Eye, ShoppingCart, Calendar, User, Package, MessageSquare, AlertTriangle, Check } from 'lucide-react'

interface ViewDemandModalProps {
  isOpen: boolean
  onClose: () => void
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
  getPrioriteColor: (priorite: string) => string
  getStatutColor: (statut: string) => string
}

export default function ViewDemandModal({ 
  isOpen, 
  onClose, 
  demande, 
  getPrioriteColor, 
  getStatutColor 
}: ViewDemandModalProps) {
  if (!isOpen || !demande) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalQuantity = () => {
    return demande.produits.reduce((total, produit) => total + produit.quantite, 0)
  }

  const getProduitsCount = () => {
    return demande.produits.filter(p => p.type === 'produit').length
  }

  const getMatieresCount = () => {
    return demande.produits.filter(p => p.type === 'matiere').length
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Détails de la demande</h3>
              <p className="text-sm text-gray-600">Consultation complète de la demande d'achat</p>
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
          
          {/* En-tête de la demande */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Numéro</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{demande.id}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Date de création</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(demande.dateCreation)}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total articles</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{getTotalQuantity()}</p>
              </div>
            </div>
          </div>

          {/* Informations du demandeur */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <User className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Informations du demandeur</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">Nom complet</span>
                <p className="text-lg font-bold text-gray-900">{demande.utilisateur.nom}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">ID Utilisateur</span>
                <p className="text-lg font-bold text-gray-900">{demande.utilisateur.id}</p>
              </div>
            </div>
          </div>

          {/* Priorité et statut */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-600" />
              Statut de la demande
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Niveau de priorité</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getPrioriteColor(demande.priorite)}`}>
                    {demande.priorite === 'Haute' && '🔴'}
                    {demande.priorite === 'Moyenne' && '🟡'}
                    {demande.priorite === 'Basse' && '🟢'}
                    {' '}{demande.priorite}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Statut actuel</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(demande.statut)}`}>
                    {demande.statut}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des articles */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-600" />
              Résumé des articles
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getProduitsCount()}</div>
                  <div className="text-sm text-gray-600">Produits</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getMatieresCount()}</div>
                  <div className="text-sm text-gray-600">Matières premières</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getTotalQuantity()}</div>
                  <div className="text-sm text-gray-600">Quantité totale</div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des produits */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Articles demandés ({demande.produits.length})
            </h4>
            
            <div className="space-y-4">
              {demande.produits.map((produit, index) => (
                <div key={produit.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-gray-900 mb-1">{produit.nom}</h5>
                        <div className="flex items-center space-x-2">
                          <div className={`w-3 h-3 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border-2 ${
                            produit.type === 'produit' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {produit.type === 'produit' ? '🔧 Produit' : '🧱 Matière première'}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right bg-gray-50 rounded-lg p-4 min-w-[100px]">
                      <div className="text-sm font-medium text-gray-600 mb-1">Quantité</div>
                      <div className="text-3xl font-bold text-gray-900">{produit.quantite}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commentaires */}
          {demande.commentaires && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Commentaires et justifications</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 leading-relaxed text-base">
                  {demande.commentaires}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <Check className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  )
}