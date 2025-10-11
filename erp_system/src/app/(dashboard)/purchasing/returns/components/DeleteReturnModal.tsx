'use client'
import React from 'react'
import { X, Trash2, AlertTriangle, Building, Package, Calendar, DollarSign, RotateCcw } from 'lucide-react'

interface DeleteReturnModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (id: string) => void
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
}

export default function DeleteReturnModal({ 
  isOpen, 
  onClose, 
  onDelete, 
  retourFournisseur 
}: DeleteReturnModalProps) {
  if (!isOpen || !retourFournisseur) return null

  const handleDelete = () => {
    onDelete(retourFournisseur.id)
  }

  const getTotalQuantiteRetournee = () => {
    return retourFournisseur.produits.reduce((total, produit) => total + produit.quantiteRetournee, 0)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatutColor = () => {
    switch (retourFournisseur.statut) {
      case 'En cours': return 'bg-orange-100 text-orange-800'
      case 'Accepté': return 'bg-green-100 text-green-800'
      case 'Refusé': return 'bg-red-100 text-red-800'
      case 'Traité': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getMotifColor = () => {
    switch (retourFournisseur.motifRetour) {
      case 'Produit défectueux': return 'bg-red-100 text-red-800'
      case 'Erreur de commande': return 'bg-yellow-100 text-yellow-800'
      case 'Livraison endommagée': return 'bg-orange-100 text-orange-800'
      case 'Non-conformité': return 'bg-purple-100 text-purple-800'
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
              Êtes-vous sûr de vouloir supprimer ce retour fournisseur ?
            </h3>
            <p className="text-sm text-gray-600 leading-relaxed">
              Cette action est <strong>définitive</strong> et ne peut pas être annulée. 
              Toutes les informations associées à ce retour seront perdues.
            </p>
          </div>

          {/* Détails du retour à supprimer */}
          <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-red-900 mb-4 flex items-center">
              <Trash2 className="w-5 h-5 mr-2" />
              Retour fournisseur qui sera supprimé
            </h4>
            
            <div className="space-y-4">
              {/* Informations de base */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <RotateCcw className="w-4 h-4 mr-2" />
                      Numéro de retour
                    </div>
                    <div className="text-lg font-bold text-gray-900">{retourFournisseur.numeroRetour}</div>
                    <div className="text-sm text-gray-500">ID: {retourFournisseur.id}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date de retour
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{formatDate(retourFournisseur.dateRetour)}</div>
                  </div>
                </div>
              </div>

              {/* Informations fournisseur */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="flex items-center text-sm text-gray-600 mb-2">
                  <Building className="w-4 h-4 mr-2" />
                  Fournisseur concerné
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-base font-semibold text-gray-900">{retourFournisseur.fournisseur.nom}</div>
                    <div className="text-sm text-gray-500">{retourFournisseur.fournisseur.id}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600">{retourFournisseur.fournisseur.email}</div>
                    <div className="text-sm text-gray-600">{retourFournisseur.fournisseur.telephone}</div>
                  </div>
                </div>
              </div>

              {/* Motif, statut et gestionnaire */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Motif du retour</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getMotifColor()}`}>
                      {retourFournisseur.motifRetour}
                    </span>
                    {retourFournisseur.descriptionMotif && (
                      <p className="text-sm text-gray-600 mt-2 italic">
                        "{retourFournisseur.descriptionMotif}"
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Statut</div>
                      <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${getStatutColor()}`}>
                        {retourFournisseur.statut}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm text-gray-600 mb-1">Gestionnaire</div>
                      <div className="text-sm font-semibold text-gray-900">{retourFournisseur.gestionnaire}</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Commande liée */}
              {retourFournisseur.numeroCommande && (
                <div className="bg-white rounded-lg p-4 border border-red-200">
                  <div className="text-sm text-gray-600 mb-1">Commande associée</div>
                  <div className="text-base font-semibold text-gray-900">{retourFournisseur.numeroCommande}</div>
                </div>
              )}
            </div>
          </div>

          {/* Articles et montants qui seront perdus */}
          <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-yellow-900 mb-4 flex items-center justify-between">
              <span className="flex items-center">
                <AlertTriangle className="w-5 h-5 mr-2" />
                Articles et montants qui seront perdus
              </span>
              <div className="flex items-center text-2xl font-bold text-red-700">
                <DollarSign className="w-6 h-6 mr-1" />
                {retourFournisseur.montantRetour.toLocaleString()} DT
              </div>
            </h4>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{retourFournisseur.produits.length}</div>
                  <div className="text-sm text-gray-600">articles différents</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getTotalQuantiteRetournee()}</div>
                  <div className="text-sm text-gray-600">unités retournées</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-red-600">{retourFournisseur.montantRetour.toLocaleString()}</div>
                  <div className="text-sm text-gray-600">montant retour (DT)</div>
                </div>
              </div>
              
              <div className="max-h-40 overflow-y-auto">
                <div className="space-y-2">
                  {retourFournisseur.produits.map((produit, index) => (
                    <div key={produit.id} className="flex items-center justify-between py-2 px-3 bg-yellow-50 rounded border border-yellow-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
                          {index + 1}
                        </div>
                        <div className={`w-2 h-2 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                        <div>
                          <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                          <div className="text-xs text-gray-600">
                            {produit.type === 'produit' ? 'Produit' : 'Matière première'}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-bold text-gray-900">
                          {produit.quantiteRetournee} / {produit.quantite} retournées
                        </div>
                        <div className="text-xs text-gray-600">
                          = {(produit.quantiteRetournee * produit.prixUnitaire).toLocaleString()} DT
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Récapitulatif financier */}
            <div className="mt-4 bg-white p-4 rounded-lg border border-yellow-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-700">Montant d'achat initial:</span>
                  <span className="font-bold text-gray-900">{retourFournisseur.prixAchat.toLocaleString()} DT</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-red-700">Montant du retour:</span>
                  <span className="font-bold text-red-700 text-lg">{retourFournisseur.montantRetour.toLocaleString()} DT</span>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires qui seront perdus */}
          {retourFournisseur.commentaires && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Commentaires qui seront perdus :</h5>
              <p className="text-sm text-gray-700 italic bg-white p-3 rounded border-l-4 border-gray-400">
                "{retourFournisseur.commentaires}"
              </p>
            </div>
          )}

          {/* Avertissement spécial pour les retours en cours */}
          {retourFournisseur.statut === 'En cours' && (
            <div className="bg-orange-100 border-2 border-orange-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-orange-900 mb-2">Attention : Retour en cours de traitement !</h5>
                  <p className="text-sm text-orange-800">
                    Ce retour a le statut "En cours", ce qui signifie qu'il est probablement en cours de négociation 
                    avec le fournisseur. La suppression n'annulera pas automatiquement les démarches en cours. 
                    Vous devrez peut-être informer le fournisseur séparément.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Avertissement spécial pour les retours acceptés */}
          {retourFournisseur.statut === 'Accepté' && (
            <div className="bg-green-100 border-2 border-green-300 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <AlertTriangle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div>
                  <h5 className="font-bold text-green-900 mb-2">Attention : Retour accepté par le fournisseur !</h5>
                  <p className="text-sm text-green-800">
                    Ce retour a été accepté et le montant de {retourFournisseur.montantRetour.toLocaleString()} DT 
                    devrait être remboursé. Assurez-vous que le remboursement a bien été traité avant de supprimer 
                    ce retour pour éviter les pertes financières.
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
                  <li>Le retour {retourFournisseur.numeroRetour} sera définitivement supprimé</li>
                  <li>{retourFournisseur.produits.length} article{retourFournisseur.produits.length > 1 ? 's' : ''} et {getTotalQuantiteRetournee()} unité{getTotalQuantiteRetournee() > 1 ? 's' : ''} retournée{getTotalQuantiteRetournee() > 1 ? 's' : ''} seront perdu{getTotalQuantiteRetournee() > 1 ? 'es' : 'e'}</li>
                  <li>Le montant de {retourFournisseur.montantRetour.toLocaleString()} DT ne sera plus suivi</li>
                  <li>L'historique et les commentaires associés seront effacés</li>
                  <li>Les informations du fournisseur {retourFournisseur.fournisseur.nom} seront perdues pour ce retour</li>
                  <li>Le motif "{retourFournisseur.motifRetour}" et sa description seront supprimés</li>
                  <li>Cette action ne pourra pas être annulée</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-red-50 border-t-2 border-red-200 rounded-b-xl">
          <div className="text-sm text-red-700">
            <strong>Attention :</strong> Cette action est irréversible et peut impacter les relations fournisseur
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