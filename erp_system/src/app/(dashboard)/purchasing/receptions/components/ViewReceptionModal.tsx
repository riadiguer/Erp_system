'use client'
import React from 'react'
import { X, Eye, Package, Calendar, Building, User, MessageSquare, AlertTriangle, Truck, Check, DollarSign, Clock } from 'lucide-react'

interface ViewReceptionModalProps {
  isOpen: boolean
  onClose: () => void
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
  getEtatColor: (etat: string) => string
  getStatutColor: (statut: string) => string
}

export default function ViewReceptionModal({ 
  isOpen, 
  onClose, 
  reception, 
  getEtatColor, 
  getStatutColor 
}: ViewReceptionModalProps) {
  if (!isOpen || !reception) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalQuantiteCommandee = () => {
    return reception.produits.reduce((total, produit) => total + produit.quantiteCommandee, 0)
  }

  const getTotalQuantiteRecue = () => {
    return reception.produits.reduce((total, produit) => total + produit.quantiteRecue, 0)
  }

  const getProduitsConformes = () => {
    return reception.produits.filter(p => p.etat === 'Conforme').length
  }

  const getProduitsAvecProblemes = () => {
    return reception.produits.filter(p => p.etat !== 'Conforme').length
  }

  const getEtatProduitColor = (etat: string) => {
    switch (etat) {
      case 'Conforme': return 'text-green-700 bg-green-100 border-green-200'
      case 'Partiel': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'Endommagé': return 'text-red-700 bg-red-100 border-red-200'
      case 'Manquant': return 'text-gray-700 bg-gray-100 border-gray-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getTauxConformite = () => {
    const conformes = getProduitsConformes()
    const total = reception.produits.length
    return total > 0 ? Math.round((conformes / total) * 100) : 0
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-purple-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Détails de la réception</h3>
              <p className="text-sm text-gray-600">Consultation complète de la réception de marchandises</p>
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
          
          {/* En-tête de la réception */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Numéro</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{reception.numeroReception}</p>
                <p className="text-xs text-gray-500">ID: {reception.id}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Date réception</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(reception.dateReception).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500">{reception.heureReception}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Montant reçu</span>
                </div>
                <p className="text-xl font-bold text-purple-600">{reception.montantTotal.toLocaleString()} DT</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Check className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-gray-600">Taux conformité</span>
                </div>
                <p className="text-xl font-bold text-green-600">{getTauxConformite()}%</p>
              </div>
            </div>
          </div>

          {/* Informations du bon de commande */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Package className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Bon de commande associé</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Numéro bon:</span>
                    <p className="text-base font-bold text-gray-900">{reception.bonCommande.numeroBon}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">ID:</span>
                    <p className="text-base text-gray-900">{reception.bonCommande.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Fournisseur:</span>
                    <p className="text-base font-bold text-gray-900">{reception.bonCommande.fournisseur.nom}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-base text-gray-900">{reception.bonCommande.fournisseur.email}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de réception */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-500 rounded-lg">
                <Truck className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Détails de la réception</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Réceptionné par:</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{reception.receptionnePar}</p>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Bon de livraison:</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{reception.numeroBonLivraison}</p>
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Truck className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-medium text-gray-600">Transporteur:</span>
                  </div>
                  <p className="text-base font-bold text-gray-900">{reception.transporteur || 'Non spécifié'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* État et statut */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-600" />
              État de la réception
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">État de la livraison</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getEtatColor(reception.etatLivraison)}`}>
                    {reception.etatLivraison === 'Conforme' && '✅'}
                    {reception.etatLivraison === 'Partiellement conforme' && '⚠️'}
                    {reception.etatLivraison === 'Non conforme' && '❌'}
                    {reception.etatLivraison === 'Endommagé' && '💔'}
                    {' '}{reception.etatLivraison}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Statut de traitement</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(reception.statut)}`}>
                    {reception.statut}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des articles */}
          <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-purple-600" />
              Résumé des articles
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getTotalQuantiteCommandee()}</div>
                  <div className="text-sm text-gray-600">Quantité commandée</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getTotalQuantiteRecue()}</div>
                  <div className="text-sm text-gray-600">Quantité reçue</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getProduitsConformes()}</div>
                  <div className="text-sm text-gray-600">Articles conformes</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-purple-200">
                <div className="text-center">
                  <div className={`text-2xl font-bold ${getProduitsAvecProblemes() > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {getProduitsAvecProblemes()}
                  </div>
                  <div className="text-sm text-gray-600">Articles avec problèmes</div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des produits */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Détail des articles reçus ({reception.produits.length})
            </h4>
            
            <div className="space-y-4">
              {reception.produits.map((produit, index) => (
                <div key={produit.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-gray-900 mb-1">{produit.nom}</h5>
                        <div className="text-sm text-gray-500">Prix unitaire: {produit.prixUnitaire.toLocaleString()} DT</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <span className={`px-3 py-1 text-sm font-bold rounded-full border-2 ${getEtatProduitColor(produit.etat)}`}>
                        {produit.etat === 'Conforme' && '✅'}
                        {produit.etat === 'Partiel' && '⚠️'}
                        {produit.etat === 'Endommagé' && '💔'}
                        {produit.etat === 'Manquant' && '❌'}
                        {' '}{produit.etat}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Quantité commandée */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-700 mb-1">Commandée</div>
                      <div className="text-2xl font-bold text-blue-600">{produit.quantiteCommandee}</div>
                    </div>

                    {/* Quantité reçue */}
                    <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700 mb-1">Reçue</div>
                      <div className="text-2xl font-bold text-green-600">{produit.quantiteRecue}</div>
                    </div>

                    {/* Écart */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-1">Écart</div>
                      <div className={`text-2xl font-bold ${
                        produit.quantiteRecue === produit.quantiteCommandee ? 'text-green-600' :
                        produit.quantiteRecue > produit.quantiteCommandee ? 'text-blue-600' : 'text-red-600'
                      }`}>
                        {produit.quantiteRecue > produit.quantiteCommandee ? '+' : ''}
                        {produit.quantiteRecue - produit.quantiteCommandee}
                      </div>
                    </div>

                    {/* Sous-total */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
                      <div className="text-sm font-medium text-purple-700 mb-1">Sous-total</div>
                      <div className="text-xl font-bold text-purple-600">
                        {(produit.quantiteRecue * produit.prixUnitaire).toLocaleString()} DT
                      </div>
                    </div>
                  </div>

                  {/* Commentaire sur le produit */}
                  {produit.commentaire && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                      <div className="flex items-start space-x-2">
                        <MessageSquare className="w-4 h-4 text-yellow-600 mt-0.5 flex-shrink-0" />
                        <div>
                          <div className="text-sm font-medium text-yellow-800">Commentaire:</div>
                          <div className="text-sm text-yellow-700">{produit.commentaire}</div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Total général */}
            <div className="mt-6 bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-purple-500 rounded-full">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Montant total de la réception</h3>
                    <p className="text-gray-600">Basé sur les quantités effectivement reçues</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-purple-600">
                    {reception.montantTotal.toLocaleString()} DT
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires généraux */}
          {reception.commentairesReception && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Commentaires généraux</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 leading-relaxed text-base">
                  {reception.commentairesReception}
                </p>
              </div>
            </div>
          )}

          {/* Alertes selon le statut */}
          {reception.statut === 'Problème' && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="text-lg font-bold text-red-900">Réception avec problèmes</h4>
                  <p className="text-red-700">
                    Cette réception présente des anomalies qui nécessitent un suivi avec le fournisseur.
                    Vérifiez les articles marqués comme non conformes, partiels ou manquants.
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
            className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  )
}