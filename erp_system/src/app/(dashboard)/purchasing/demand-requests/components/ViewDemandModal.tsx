'use client'
import React from 'react'
import { X, Eye, Calendar, User, Package, MessageSquare, AlertTriangle, Check, Building2, Hash, DollarSign } from 'lucide-react'
import type { DemandRequest } from '@/lib/features/purchasing/api'
import { priorityFromApi, statusFromApi } from '@/lib/features/purchasing/api'

interface ViewDemandModalProps {
  isOpen: boolean
  onClose: () => void
  demande: DemandRequest | null
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

  // Convert API status and priority to French
  const prioriteFr = priorityFromApi(demande.priority)
  const statutFr = statusFromApi(demande.status)

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
              <p className="text-sm text-gray-600">Consultation complète de la demande d&apos;achat</p>
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
                  <Hash className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Numéro</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{demande.number}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Date de création</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDate(demande.date)}
                </p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Package className="w-5 h-5 text-blue-600" />
                  <span className="text-sm font-medium text-gray-600">Total articles</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{demande.lines.length}</p>
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
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">Nom complet</span>
                <p className="text-lg font-bold text-gray-900">{demande.requester_name}</p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">Site</span>
                <p className="text-lg font-bold text-gray-900 flex items-center">
                  <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                  {demande.site}
                </p>
              </div>
              <div className="bg-white p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-600 block mb-1">Catégorie</span>
                <p className="text-lg font-bold text-gray-900">{demande.category}</p>
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
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getPrioriteColor(prioriteFr)}`}>
                    {prioriteFr === 'Haute' && '🔴'}
                    {prioriteFr === 'Moyenne' && '🟡'}
                    {prioriteFr === 'Basse' && '🟢'}
                    {' '}{prioriteFr}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Statut actuel</span>
                <div className="flex items-center space-x-3">
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(statutFr)}`}>
                    {statutFr}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Date nécessaire */}
          {demande.needed_date && (
            <div className="bg-purple-50 border border-purple-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-purple-600" />
                <div>
                  <span className="text-sm font-medium text-gray-600 block">Date nécessaire</span>
                  <p className="text-lg font-bold text-gray-900">{formatDate(demande.needed_date)}</p>
                </div>
              </div>
            </div>
          )}

          {/* Résumé financier */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Résumé financier
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-blue-600">{demande.lines.length}</div>
                  <div className="text-sm text-gray-600">Articles</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">{getTotalQuantity()}</div>
                  <div className="text-sm text-gray-600">Quantité totale</div>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-2xl font-bold text-purple-600">{getTotalEstimatedAmount()} DA</div>
                  <div className="text-sm text-gray-600">Montant estimé</div>
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des articles */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Articles demandés ({demande.lines.length})
            </h4>
            
            <div className="space-y-4">
              {demande.lines.map((line, index) => (
                <div key={line.id || index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4 flex-1">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full text-white font-bold text-lg shadow-lg flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <h5 className="text-lg font-bold text-gray-900 mb-2">{line.material_name}</h5>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                          <div>
                            <span className="text-gray-600 block">ID Matériel</span>
                            <span className="font-semibold text-gray-900">{line.material_id}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Unité</span>
                            <span className="font-semibold text-gray-900">{line.uom}</span>
                          </div>
                          <div>
                            <span className="text-gray-600 block">Quantité</span>
                            <span className="font-semibold text-blue-600">{line.quantity}</span>
                          </div>
                          {line.estimated_price && (
                            <div>
                              <span className="text-gray-600 block">Prix estimé</span>
                              <span className="font-semibold text-green-600">{parseFloat(line.estimated_price).toFixed(2)} DA</span>
                            </div>
                          )}
                        </div>
                        {line.suggested_supplier && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-600">Fournisseur suggéré: </span>
                            <span className="font-semibold text-gray-900">{line.suggested_supplier}</span>
                          </div>
                        )}
                        {line.needed_date && (
                          <div className="mt-2 text-sm">
                            <span className="text-gray-600">Date nécessaire: </span>
                            <span className="font-semibold text-purple-600">{formatDate(line.needed_date)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {line.estimated_price && (
                      <div className="text-right bg-gray-50 rounded-lg p-4 ml-4 flex-shrink-0">
                        <div className="text-sm font-medium text-gray-600 mb-1">Total</div>
                        <div className="text-2xl font-bold text-gray-900">
                          {(parseFloat(line.quantity) * parseFloat(line.estimated_price)).toFixed(2)} DA
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commentaires */}
          {demande.comment && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Commentaires et justifications</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 leading-relaxed text-base">
                  {demande.comment}
                </p>
              </div>
            </div>
          )}

          {/* Informations d'approbation/rejet */}
          {(demande.approved_by || demande.rejected_by) && (
            <div className={`border rounded-xl p-6 ${demande.approved_by ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                {demande.approved_by ? '✓ Approuvée' : '✗ Rejetée'}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {demande.approved_by && (
                  <>
                    <div className="bg-white p-4 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 block mb-1">Approuvée par</span>
                      <p className="text-lg font-bold text-gray-900">{demande.approved_by}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 block mb-1">Date d&apos;approbation</span>
                      <p className="text-lg font-bold text-gray-900">{formatDate(demande.approved_date!)}</p>
                    </div>
                  </>
                )}
                {demande.rejected_by && (
                  <>
                    <div className="bg-white p-4 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 block mb-1">Rejetée par</span>
                      <p className="text-lg font-bold text-gray-900">{demande.rejected_by}</p>
                    </div>
                    <div className="bg-white p-4 rounded-lg">
                      <span className="text-sm font-medium text-gray-600 block mb-1">Date de rejet</span>
                      <p className="text-lg font-bold text-gray-900">{formatDate(demande.rejected_date!)}</p>
                    </div>
                    {demande.rejection_reason && (
                      <div className="bg-white p-4 rounded-lg md:col-span-2">
                        <span className="text-sm font-medium text-gray-600 block mb-1">Raison du rejet</span>
                        <p className="text-base text-gray-900">{demande.rejection_reason}</p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Conversion en PO */}
          {demande.converted_to_po && (
            <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6">
              <h4 className="text-xl font-bold text-gray-900 mb-4">
                🔄 Convertie en bon de commande
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-white p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 block mb-1">Numéro PO</span>
                  <p className="text-lg font-bold text-indigo-600">{demande.converted_to_po}</p>
                </div>
                <div className="bg-white p-4 rounded-lg">
                  <span className="text-sm font-medium text-gray-600 block mb-1">Date de conversion</span>
                  <p className="text-lg font-bold text-gray-900">{formatDate(demande.converted_date!)}</p>
                </div>
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