'use client'
import React from 'react'
import { X, Eye, RotateCcw, Calendar, Building, Package, MessageSquare, AlertTriangle, User, DollarSign, FileText } from 'lucide-react'

interface ViewReturnModalProps {
  isOpen: boolean
  onClose: () => void
  retourFournisseur: {
    id: string
    numeroRetour: string
    dateRetour: string
    fournisseur: { 
      id: string
      nom: string
      email: string
      telephone: string
    }
    statut: string
    produits: Array<{
      id: string
      nom: string
      type: 'produit' | 'matiere'
      quantite: number
      quantiteRetournee: number
      prixUnitaire: number
    }>
    motifRetour: string
    descriptionMotif: string
    prixAchat: number
    montantRetour: number
    commentaires: string
    gestionnaire: string
    numeroCommande?: string
  }
  getStatutColor: (statut: string) => string
  getMotifColor: (motif: string) => string
}

export default function ViewReturnModal({ 
  isOpen, 
  onClose, 
  retourFournisseur, 
  getStatutColor, 
  getMotifColor 
}: ViewReturnModalProps) {
  if (!isOpen || !retourFournisseur) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getTotalQuantiteAchetee = () => {
    return retourFournisseur.produits.reduce((total, produit) => total + produit.quantite, 0)
  }

  const getTotalQuantiteRetournee = () => {
    return retourFournisseur.produits.reduce((total, produit) => total + produit.quantiteRetournee, 0)
  }

  const getPourcentageRetour = () => {
    const totalAchetee = getTotalQuantiteAchetee()
    const totalRetournee = getTotalQuantiteRetournee()
    return totalAchetee > 0 ? Math.round((totalRetournee / totalAchetee) * 100) : 0
  }

  const getProduitsCount = () => {
    return retourFournisseur.produits.filter(p => p.type === 'produit').length
  }

  const getMatieresCount = () => {
    return retourFournisseur.produits.filter(p => p.type === 'matiere').length
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-red-50 to-orange-50">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-red-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Détails du retour fournisseur</h3>
              <p className="text-sm text-gray-600">Consultation complète du retour</p>
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
          
          {/* En-tête du retour */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <RotateCcw className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Numéro</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{retourFournisseur.numeroRetour}</p>
                <p className="text-xs text-gray-500">ID: {retourFournisseur.id}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Date retour</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(retourFournisseur.dateRetour).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Articles</span>
                </div>
                <p className="text-lg font-bold text-gray-900">{retourFournisseur.produits.length}</p>
                <p className="text-xs text-gray-500">{getTotalQuantiteRetournee()} unités</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <DollarSign className="w-5 h-5 text-red-600" />
                  <span className="text-sm font-medium text-gray-600">Montant</span>
                </div>
                <p className="text-xl font-bold text-red-600">{retourFournisseur.montantRetour.toLocaleString()} DT</p>
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
                    <p className="text-base font-bold text-gray-900">{retourFournisseur.fournisseur.nom}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">ID:</span>
                    <p className="text-base text-gray-900">{retourFournisseur.fournisseur.id}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-base text-gray-900">{retourFournisseur.fournisseur.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">Téléphone:</span>
                    <p className="text-base text-gray-900">{retourFournisseur.fournisseur.telephone}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Motif et statut */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <AlertTriangle className="w-5 h-5 mr-2 text-gray-600" />
              Motif et statut du retour
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Motif du retour</span>
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getMotifColor(retourFournisseur.motifRetour)}`}>
                    {retourFournisseur.motifRetour}
                  </span>
                </div>
                {retourFournisseur.descriptionMotif && (
                  <div className="bg-gray-50 p-3 rounded-lg mt-3">
                    <p className="text-sm text-gray-700">{retourFournisseur.descriptionMotif}</p>
                  </div>
                )}
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Statut actuel</span>
                <div className="flex items-center space-x-3 mb-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(retourFournisseur.statut)}`}>
                    {retourFournisseur.statut}
                  </span>
                </div>
                
                <div className="mt-4 space-y-2">
                  {retourFournisseur.gestionnaire && (
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Gestionnaire:</span>
                      <span className="text-sm font-bold text-gray-900">{retourFournisseur.gestionnaire}</span>
                    </div>
                  )}
                  {retourFournisseur.numeroCommande && (
                    <div className="flex items-center space-x-2">
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-600">Commande:</span>
                      <span className="text-sm font-bold text-gray-900">{retourFournisseur.numeroCommande}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Résumé des retours */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <RotateCcw className="w-5 h-5 mr-2 text-red-600" />
              Résumé des retours
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{getProduitsCount()}</div>
                  <div className="text-sm text-gray-600">Produits</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getMatieresCount()}</div>
                  <div className="text-sm text-gray-600">Matières premières</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getPourcentageRetour()}%</div>
                  <div className="text-sm text-gray-600">Taux de retour</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-red-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-700">{retourFournisseur.montantRetour.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">Montant (DT)</div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des produits */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Articles retournés ({retourFournisseur.produits.length})
            </h4>
            
            <div className="space-y-4">
              {retourFournisseur.produits.map((produit, index) => (
                <div key={produit.id} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-red-500 to-orange-600 rounded-full text-white font-bold text-lg shadow-lg">
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
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Quantité achetée */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-center">
                      <div className="text-sm font-medium text-blue-700 mb-1">Quantité achetée</div>
                      <div className="text-2xl font-bold text-blue-600">{produit.quantite}</div>
                    </div>

                    {/* Quantité retournée */}
                    <div className="bg-red-50 p-4 rounded-lg border border-red-200 text-center">
                      <div className="text-sm font-medium text-red-700 mb-1">Quantité retournée</div>
                      <div className="text-2xl font-bold text-red-600">{produit.quantiteRetournee}</div>
                    </div>

                    {/* Prix unitaire */}
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 text-center">
                      <div className="text-sm font-medium text-gray-700 mb-1">Prix unitaire</div>
                      <div className="text-xl font-bold text-gray-900">{produit.prixUnitaire.toLocaleString()} DT</div>
                    </div>

                    {/* Montant retour */}
                    <div className="bg-purple-50 p-4 rounded-lg border border-purple-200 text-center">
                      <div className="text-sm font-medium text-purple-700 mb-1">Montant retour</div>
                      <div className="text-xl font-bold text-purple-600">
                        {(produit.quantiteRetournee * produit.prixUnitaire).toLocaleString()} DT
                      </div>
                    </div>
                  </div>

                  {/* Indicateur de retour partiel/total */}
                  <div className="mt-4 flex items-center justify-center">
                    {produit.quantiteRetournee === produit.quantite ? (
                      <div className="flex items-center space-x-2 text-red-600">
                        <RotateCcw className="w-5 h-5" />
                        <span className="font-medium">Retour total</span>
                      </div>
                    ) : (
                      <div className="flex items-center space-x-2 text-orange-600">
                        <AlertTriangle className="w-5 h-5" />
                        <span className="font-medium">
                          Retour partiel ({Math.round((produit.quantiteRetournee / produit.quantite) * 100)}%)
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total général */}
            <div className="mt-6 bg-gradient-to-r from-red-100 to-orange-100 border-2 border-red-300 rounded-xl p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-blue-500 rounded-full">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Montant d'achat total</h3>
                      <p className="text-gray-600">Valeur initiale des produits</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">
                      {retourFournisseur.prixAchat.toLocaleString()} DT
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="p-3 bg-red-500 rounded-full">
                      <RotateCcw className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">Montant du retour</h3>
                      <p className="text-gray-600">Valeur remboursée</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-red-600">
                      {retourFournisseur.montantRetour.toLocaleString()} DT
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          {retourFournisseur.commentaires && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Commentaires et observations</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 leading-relaxed text-base">
                  {retourFournisseur.commentaires}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  )
}