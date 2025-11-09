'use client'
import React from 'react'
import { X, Trash2, AlertTriangle, User, Package, Calendar, Building2 } from 'lucide-react'
import type { DemandRequest } from '@/lib/features/purchasing/api'
import { priorityFromApi, statusFromApi } from '@/lib/features/purchasing/api'

interface DeleteDemandModalProps {
  isOpen: boolean
  onClose: () => void
  onDelete: (id: number) => void
  demande: DemandRequest | null
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
    return demande.lines.reduce((total, line) => total + parseFloat(line.quantity || '0'), 0)
  }

  const getTotalEstimatedAmount = () => {
    if (demande.total_estimated_amount) {
      return parseFloat(demande.total_estimated_amount).toFixed(2)
    }
    return demande.lines.reduce((total, line) => {
      const qty = parseFloat(line.quantity || '0')
      const price = parseFloat(line.estimated_price || '0')
      return total + (qty * price)
    }, 0).toFixed(2)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const prioriteFr = priorityFromApi(demande.priority)
  const statutFr = statusFromApi(demande.status)

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
                    <div className="text-lg font-bold text-gray-900">{demande.number}</div>
                    <div className="text-xs text-gray-500 mt-1">ID: {demande.id}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-1">
                      <Calendar className="w-4 h-4 mr-2" />
                      Date de création
                    </div>
                    <div className="text-lg font-semibold text-gray-900">{formatDate(demande.date)}</div>
                  </div>
                </div>
              </div>

              {/* Informations utilisateur */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <User className="w-4 h-4 mr-2" />
                      Demandeur
                    </div>
                    <div className="text-base font-semibold text-gray-900">
                      {demande.requester_name}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">ID: {demande.requester_id}</div>
                  </div>
                  <div>
                    <div className="flex items-center text-sm text-gray-600 mb-2">
                      <Building2 className="w-4 h-4 mr-2" />
                      Site
                    </div>
                    <div className="text-base font-semibold text-gray-900">{demande.site}</div>
                  </div>
                </div>
              </div>

              {/* Catégorie */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="text-sm text-gray-600 mb-1">Catégorie</div>
                <div className="text-base font-semibold text-gray-900">{demande.category}</div>
              </div>

              {/* Statut et priorité */}
              <div className="bg-white rounded-lg p-4 border border-red-200">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Priorité</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full ${
                      demande.priority === 'high' ? 'bg-red-100 text-red-800 border border-red-200' :
                      demande.priority === 'medium' ? 'bg-yellow-100 text-yellow-800 border border-yellow-200' :
                      'bg-green-100 text-green-800 border border-green-200'
                    }`}>
                      {prioriteFr}
                    </span>
                  </div>
                  <div>
                    <div className="text-sm text-gray-600 mb-1">Statut</div>
                    <span className={`inline-block px-3 py-1 text-sm font-semibold rounded-full border ${
                      demande.status === 'draft' ? 'bg-gray-100 text-gray-800 border-gray-200' :
                      demande.status === 'submitted' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      demande.status === 'approved' ? 'bg-green-100 text-green-800 border-green-200' :
                      demande.status === 'rejected' ? 'bg-red-100 text-red-800 border-red-200' :
                      'bg-orange-100 text-orange-800 border-orange-200'
                    }`}>
                      {statutFr}
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
              Articles qui seront perdus ({demande.lines.length})
            </h4>
            
            <div className="bg-white rounded-lg p-4 border border-yellow-200">
              <div className="grid grid-cols-2 gap-4 mb-4 text-center">
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800">{getTotalQuantity()}</div>
                  <div className="text-sm text-yellow-700">Quantité totale</div>
                </div>
                <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                  <div className="text-2xl font-bold text-yellow-800">{getTotalEstimatedAmount()} DA</div>
                  <div className="text-sm text-yellow-700">Montant estimé</div>
                </div>
              </div>
              
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {demande.lines.map((line, index) => (
                  <div key={line.id || index} className="flex items-center justify-between py-3 px-4 bg-yellow-50 rounded-lg border border-yellow-200">
                    <div className="flex items-center space-x-3 flex-1">
                      <div className="w-7 h-7 bg-yellow-200 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800 flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-semibold text-gray-900 truncate">{line.material_name}</div>
                        <div className="text-xs text-gray-600">ID: {line.material_id} • {line.uom}</div>
                      </div>
                    </div>
                    <div className="text-right ml-3 flex-shrink-0">
                      <div className="text-sm font-bold text-gray-900">Qté: {line.quantity}</div>
                      {line.estimated_price && (
                        <div className="text-xs text-gray-600">
                          {parseFloat(line.estimated_price).toFixed(2)} DA
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Commentaires qui seront perdus */}
          {demande.comment && (
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <h5 className="font-semibold text-gray-900 mb-2">Commentaires qui seront perdus :</h5>
              <p className="text-sm text-gray-700 italic bg-white p-3 rounded border-l-4 border-gray-400">
                &ldquo;{demande.comment}&rdquo;
              </p>
            </div>
          )}

          {/* Date nécessaire */}
          {demande.needed_date && (
            <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
              <div className="flex items-center text-sm text-purple-700">
                <Calendar className="w-4 h-4 mr-2" />
                <span className="font-medium">Date nécessaire:</span>
                <span className="ml-2 font-bold">{formatDate(demande.needed_date)}</span>
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
                  <li>La demande {demande.number} (ID: {demande.id}) sera définitivement supprimée</li>
                  <li>{demande.lines.length} article{demande.lines.length > 1 ? 's' : ''} représentant {getTotalQuantity()} unités seront perdu{getTotalQuantity() > 1 ? 'es' : 'e'}</li>
                  <li>Le montant estimé de {getTotalEstimatedAmount()} DA sera perdu</li>
                  <li>L&apos;historique et les commentaires associés seront effacés</li>
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