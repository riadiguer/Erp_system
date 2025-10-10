'use client'
import React from 'react'
import { X, Eye, FileText, Calendar, Building, Package, MessageSquare, AlertTriangle, User, Phone, Mail, MapPin, DollarSign } from 'lucide-react'

interface ViewOrderModalProps {
  isOpen: boolean
  onClose: () => void
  bonCommande: {
    id: string
    numeroBon: string
    dateCreation: string
    dateExpiration: string
    fournisseur: { 
      id: string
      nom: string
      email: string
      telephone: string
      adresse?: string
    }
    statut: string
    priorite: string
    produits: Array<{
      id: string
      nom: string
      type: 'produit' | 'matiere'
      quantite: number
      prixUnitaire: number
    }>
    commentaires: string
    montantTotal: number
    gestionnaire: string
  }
  getPrioriteColor: (priorite: string) => string
  getStatutColor: (statut: string) => string
}

export default function ViewOrderModal({ 
  isOpen, 
  onClose, 
  bonCommande, 
  getPrioriteColor, 
  getStatutColor 
}: ViewOrderModalProps) {
  if (!isOpen || !bonCommande) return null

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
    return bonCommande.produits.reduce((total, produit) => total + produit.quantite, 0)
  }

  const getProduitsCount = () => {
    return bonCommande.produits.filter(p => p.type === 'produit').length
  }

  const getMatieresCount = () => {
    return bonCommande.produits.filter(p => p.type === 'matiere').length
  }

  const isExpired = () => {
    return new Date(bonCommande.dateExpiration) < new Date()
  }

  const getDaysUntilExpiration = () => {
    const today = new Date()
    const expiration = new Date(bonCommande.dateExpiration)
    const diffTime = expiration.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-green-50 to-blue-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-green-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Détails du bon de commande</h3>
              <p className="text-sm text-gray-600">Consultation complète du bon de commande</p>
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
          
          {/* En-tête du bon de commande */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <FileText className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Numéro</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{bonCommande.numeroBon}</p>
                <p className="text-xs text-gray-500">ID: {bonCommande.id}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Date création</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(bonCommande.dateCreation).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Expiration</span>
                </div>
                <p className={`text-lg font-semibold ${isExpired() ? 'text-red-600' : 'text-gray-900'}`}>
                  {new Date(bonCommande.dateExpiration).toLocaleDateString('fr-FR')}
                </p>
                {isExpired() ? (
                  <p className="text-xs text-red-600 font-medium">Expiré</p>
                ) : (
                  <p className="text-xs text-gray-500">{getDaysUntilExpiration()} jours restants</p>
                )}
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-5 h-5 text-green-600" />
                  <span className="text-sm font-medium text-gray-600">Montant total</span>
                </div>
                <p className="text-xl font-bold text-green-600">{bonCommande.montantTotal.toLocaleString()} DT</p>
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
                    <p className="text-base font-bold text-gray-900">{bonCommande.fournisseur.nom}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">ID:</span>
                    <p className="text-base text-gray-900">{bonCommande.fournisseur.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-base text-gray-900">{bonCommande.fournisseur.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Téléphone:</span>
                    <p className="text-base text-gray-900">{bonCommande.fournisseur.telephone}</p>
                  </div>
                  {bonCommande.fournisseur.adresse && (
                    <div className="flex items-start space-x-2">
                      <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                      <span className="text-sm font-medium text-gray-600">Adresse:</span>
                      <p className="text-base text-gray-900">{bonCommande.fournisseur.adresse}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Statut, priorité et gestionnaire */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-600" />
              Informations de gestion
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Niveau de priorité</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getPrioriteColor(bonCommande.priorite)}`}>
                    {bonCommande.priorite === 'Haute' && '🔴'}
                    {bonCommande.priorite === 'Moyenne' && '🟡'}
                    {bonCommande.priorite === 'Basse' && '🟢'}
                    {' '}{bonCommande.priorite}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Statut actuel</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(bonCommande.statut)}`}>
                    {bonCommande.statut}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Gestionnaire</span>
                <div className="flex items-center space-x-3">
                  <User className="w-5 h-5 text-gray-500" />
                  <span className="text-lg font-bold text-gray-900">{bonCommande.gestionnaire}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des articles */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-green-600" />
              Résumé des articles commandés
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
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
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-700">{bonCommande.montantTotal.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Montant (DT)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des produits */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Articles commandés ({bonCommande.produits.length})
            </h4>
            
            <div className="space-y-4">
              {bonCommande.produits.map((produit, index) => (
                <div key={produit.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-green-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg">
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
                    
                    <div className="flex items-center space-x-6">
                      {/* Quantité */}
                      <div className="text-center bg-gray-50 rounded-lg p-4 min-w-[80px]">
                        <div className="text-sm font-medium text-gray-600 mb-1">Quantité</div>
                        <div className="text-2xl font-bold text-gray-900">{produit.quantite}</div>
                      </div>
                      
                      {/* Prix unitaire */}
                      <div className="text-center bg-gray-50 rounded-lg p-4 min-w-[100px]">
                        <div className="text-sm font-medium text-gray-600 mb-1">Prix unitaire</div>
                        <div className="text-xl font-bold text-blue-600">{produit.prixUnitaire.toLocaleString()} DT</div>
                      </div>
                      
                      {/* Sous-total */}
                      <div className="text-center bg-green-50 rounded-lg p-4 min-w-[120px] border-2 border-green-200">
                        <div className="text-sm font-medium text-green-700 mb-1">Sous-total</div>
                        <div className="text-xl font-bold text-green-600">
                          {(produit.quantite * produit.prixUnitaire).toLocaleString()} DT
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total général */}
            <div className="mt-6 bg-gradient-to-r from-green-100 to-blue-100 border-2 border-green-300 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-green-500 rounded-full">
                    <DollarSign className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Montant total de la commande</h3>
                    <p className="text-gray-600">TVA et frais inclus selon conditions fournisseur</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-600">
                    {bonCommande.montantTotal.toLocaleString()} DT
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          {bonCommande.commentaires && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Commentaires et instructions</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 leading-relaxed text-base">
                  {bonCommande.commentaires}
                </p>
              </div>
            </div>
          )}

          {/* Alertes d'expiration */}
          {isExpired() && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="text-lg font-bold text-red-900">Bon de commande expiré</h4>
                  <p className="text-red-700">
                    Ce bon de commande a expiré le {formatDate(bonCommande.dateExpiration)}. 
                    Veuillez contacter le fournisseur pour renouveler la commande si nécessaire.
                  </p>
                </div>
              </div>
            </div>
          )}

          {!isExpired() && getDaysUntilExpiration() <= 7 && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
                <div>
                  <h4 className="text-lg font-bold text-orange-900">Expiration proche</h4>
                  <p className="text-orange-700">
                    Ce bon de commande expire dans {getDaysUntilExpiration()} jour{getDaysUntilExpiration() > 1 ? 's' : ''}.
                    Assurez-vous que la commande soit traitée avant le {formatDate(bonCommande.dateExpiration)}.
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
            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  )
}