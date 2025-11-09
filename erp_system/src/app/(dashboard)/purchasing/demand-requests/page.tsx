'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  ArrowLeft,
  AlertTriangle,
  User,
  Package,
  Check,
  X as XIcon,
  FileText,
  Loader2
} from 'lucide-react'

// Import API hooks
import { 
  useDemandRequests,
  useDemandStatistics,
  submitDemandRequest,
  approveDemandRequest,
  rejectDemandRequest,
  deleteDemandRequest,
  updateDemandRequest
} from '@/lib/features/purchasing/hooks'
import { statusFromApi, priorityFromApi } from '@/lib/features/purchasing/api'
import type { DemandRequest, DemandRequestInput } from '@/lib/features/purchasing/api'

// Import modals
import AddDemandModal from './components/AddDemandModal'
import ViewDemandModal from './components/ViewDemandModal'
import EditDemandModal from './components/EditDemandModal'
import DeleteDemandModal from './components/DeleteDemandModal'

// Mock materials data - replace with real API call
const MOCK_MATERIALS = [
  { id: 'MAT001', name: 'Acier inoxydable 304', uom: 'KG' },
  { id: 'MAT002', name: 'Aluminium 6061', uom: 'KG' },
  { id: 'MAT003', name: 'Cuivre électrolytique', uom: 'KG' },
  { id: 'MAT004', name: 'Plastique PVC', uom: 'M' },
  { id: 'MAT005', name: 'Bois de chêne', uom: 'M3' },
  { id: 'MAT006', name: 'Verre trempé', uom: 'M2' },
  { id: 'MAT007', name: 'Caoutchouc naturel', uom: 'KG' },
  { id: 'MAT008', name: 'Fibre de carbone', uom: 'M2' },
]

export default function DemandRequestsPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState<'add' | 'view' | 'edit' | 'delete' | ''>('')
  const [selectedItem, setSelectedItem] = useState<DemandRequest | null>(null)
  const [searchTerm, setSearchTerm] = useState('')

  // Fetch data from API
  const { demands, loading, error, refresh } = useDemandRequests()
  const { statistics } = useDemandStatistics()

  console.log('Page state:', { demands, loading, error, demandsLength: demands?.length })

  const openModal = (type: 'add' | 'view' | 'edit' | 'delete', item: DemandRequest | null = null) => {
    console.log('Opening modal:', type, item)
    setModalType(type)
    setSelectedItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    console.log('Closing modal')
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
  }

  const handleDeleteDemand = async (id: number) => {
    try {
      await deleteDemandRequest(id)
      await refresh()
      closeModal()
    } catch (error) {
      console.error('Failed to delete demand:', error)
      alert('Erreur lors de la suppression')
    }
  }

  const handleUpdateDemand = async (formData: Partial<DemandRequestInput>) => {
    if (!selectedItem) return
    
    try {
      await updateDemandRequest(selectedItem.id, formData)
      await refresh()
      closeModal()
    } catch (error) {
      console.error('Failed to update demand:', error)
      alert('Erreur lors de la modification')
    }
  }

  const handleSubmitDemand = async (id: number) => {
    try {
      await submitDemandRequest(id)
      await refresh()
    } catch (error) {
      console.error('Failed to submit demand:', error)
      alert('Erreur lors de la soumission')
    }
  }

  const handleApproveDemand = async (id: number) => {
    try {
      await approveDemandRequest(id)
      await refresh()
    } catch (error) {
      console.error('Failed to approve demand:', error)
      alert("Erreur lors de l'approbation")
    }
  }

  const handleRejectDemand = async (id: number) => {
    try {
      await rejectDemandRequest(id)
      await refresh()
    } catch (error) {
      console.error('Failed to reject demand:', error)
      alert('Erreur lors du rejet')
    }
  }

  const filteredDemands = useMemo(() => {
    if (!searchTerm.trim()) return demands

    const search = searchTerm.toLowerCase()
    return demands.filter(demand =>
      demand.number.toLowerCase().includes(search) ||
      demand.requester_name.toLowerCase().includes(search) ||
      statusFromApi(demand.status).toLowerCase().includes(search) ||
      demand.category.toLowerCase().includes(search)
    )
  }, [demands, searchTerm])

  const getPrioriteColor = (priorite: string) => {
    switch (priorite) {
      case 'high':
      case 'Haute': return 'text-red-700 bg-red-100 border-red-200'
      case 'medium':
      case 'Moyenne': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'low':
      case 'Basse': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatutColor = (statut: string) => {
    switch (statut) {
      case 'draft':
      case 'Brouillon': return 'text-gray-700 bg-gray-100 border-gray-200'
      case 'submitted':
      case 'Soumise': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'approved':
      case 'Approuvée': return 'text-green-700 bg-green-100 border-green-200'
      case 'rejected':
      case 'Rejetée': return 'text-red-700 bg-red-100 border-red-200'
      case 'converted':
      case 'Convertie': return 'text-purple-700 bg-purple-100 border-purple-200'
      case 'cancelled':
      case 'Annulée': return 'text-orange-700 bg-orange-100 border-orange-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatutIcon = (statut: string) => {
    switch (statut) {
      case 'draft':
      case 'Brouillon': return '📝'
      case 'submitted':
      case 'Soumise': return '📤'
      case 'approved':
      case 'Approuvée': return '✅'
      case 'rejected':
      case 'Rejetée': return '❌'
      case 'converted':
      case 'Convertie': return '🔄'
      case 'cancelled':
      case 'Annulée': return '⛔'
      default: return '📄'
    }
  }

  // Calculate statistics
  const stats = useMemo(() => ({
    total: statistics?.total || demands.length,
    brouillon: statistics?.draft || demands.filter(d => d.status === 'draft').length,
    soumise: statistics?.submitted || demands.filter(d => d.status === 'submitted').length,
    approuvee: statistics?.approved || demands.filter(d => d.status === 'approved').length,
    rejetee: statistics?.rejected || demands.filter(d => d.status === 'rejected').length,
    convertie: statistics?.converted || demands.filter(d => d.status === 'converted').length,
    hautePriorite: statistics?.high_priority || demands.filter(d => d.priority === 'high').length
  }), [statistics, demands])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement des demandes...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Erreur de chargement</h3>
          <p className="text-gray-600 mb-4">Impossible de charger les demandes.</p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Link 
                href="/purchasing" 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline text-sm">Retour</span>
              </Link>
              <div className="h-4 w-px bg-gray-300 flex-shrink-0" />
              <div className="flex items-center space-x-2 min-w-0">
                <div className="p-1.5 bg-blue-100 rounded-lg flex-shrink-0">
                  <ShoppingCart className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    Demandes d&apos;Achat
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block truncate">
                    Gestion des demandes internes
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
        {/* Statistics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 flex-shrink-0">
                <ShoppingCart className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.total}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 flex-shrink-0">
                <FileText className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Soumises</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.soumise}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <Check className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Approuvées</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.approuvee}</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-red-100 flex-shrink-0">
                <AlertTriangle className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Haute priorité</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.hautePriorite}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par numéro, demandeur, statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center justify-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span>Nouvelle demande</span>
          </button>
        </div>

        {/* Demands List */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {filteredDemands.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-500 mb-4">
                {searchTerm 
                  ? 'Essayez de modifier vos critères de recherche.' 
                  : "Commencez par créer votre première demande d'achat."}
              </p>
              {!searchTerm && (
                <button
                  onClick={() => openModal('add')}
                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Créer une demande
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop View */}
              <div className="hidden xl:block overflow-x-auto">
                <table className="w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demande
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Demandeur
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Priorité
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Statut
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Articles
                      </th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredDemands.map((demand) => (
                      <tr key={demand.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                              <span className="text-xs font-medium text-blue-600">
                                {demand.number.slice(-2)}
                              </span>
                            </div>
                            <div className="ml-3">
                              <div className="text-sm font-medium text-gray-900">{demand.number}</div>
                              <div className="text-xs text-gray-500">{demand.category}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <User className="w-4 h-4 text-gray-400 mr-2" />
                            <div>
                              <div className="text-sm font-medium text-gray-900">{demand.requester_name}</div>
                              <div className="text-xs text-gray-500">{demand.site}</div>
                            </div>
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                          {new Date(demand.date).toLocaleDateString('fr-FR')}
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getPrioriteColor(demand.priority)}`}>
                            {priorityFromApi(demand.priority)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2.5 py-1 text-xs font-semibold rounded-full border ${getStatutColor(demand.status)}`}>
                            {getStatutIcon(demand.status)} {statusFromApi(demand.status)}
                          </span>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <Package className="w-4 h-4 text-gray-400 mr-2" />
                            {(demand.lines?.length || 0)} article{(demand.lines?.length || 0) > 1 ? 's' : ''}
                          </div>
                        </td>
                        
                        <td className="px-4 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button
                              onClick={() => openModal('view', demand)}
                              className="text-blue-600 hover:text-blue-900 p-1.5 rounded hover:bg-blue-50"
                              title="Voir"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                            {demand.status === 'draft' && (
                              <>
                                <button
                                  onClick={() => openModal('edit', demand)}
                                  className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                                  title="Modifier"
                                >
                                  <Edit className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleSubmitDemand(demand.id)}
                                  className="text-purple-600 hover:text-purple-900 p-1.5 rounded hover:bg-purple-50"
                                  title="Soumettre"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {demand.status === 'submitted' && (
                              <>
                                <button
                                  onClick={() => handleApproveDemand(demand.id)}
                                  className="text-green-600 hover:text-green-900 p-1.5 rounded hover:bg-green-50"
                                  title="Approuver"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleRejectDemand(demand.id)}
                                  className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                  title="Rejeter"
                                >
                                  <XIcon className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {demand.status !== 'converted' && demand.status !== 'cancelled' && (
                              <button
                                onClick={() => openModal('delete', demand)}
                                className="text-red-600 hover:text-red-900 p-1.5 rounded hover:bg-red-50"
                                title="Supprimer"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Mobile/Tablet View */}
              <div className="xl:hidden divide-y divide-gray-200">
                {filteredDemands.map((demand) => (
                  <div key={demand.id} className="p-4 hover:bg-gray-50">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3 min-w-0 flex-1">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <ShoppingCart className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-900 truncate">{demand.number}</div>
                          <div className="text-sm text-gray-500 truncate">{demand.requester_name}</div>
                        </div>
                      </div>
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatutColor(demand.status)}`}>
                        {getStatutIcon(demand.status)} {statusFromApi(demand.status)}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm mb-3">
                      <div>
                        <span className="text-gray-500">Date:</span>
                        <div className="font-medium text-gray-900">
                          {new Date(demand.date).toLocaleDateString('fr-FR')}
                        </div>
                      </div>
                      <div>
                        <span className="text-gray-500">Articles:</span>
                        <div className="font-medium text-gray-900">{demand.lines?.length || 0}</div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => openModal('view', demand)}
                        className="flex items-center px-3 py-1.5 bg-blue-50 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-100"
                      >
                        <Eye className="w-4 h-4 mr-1.5" />
                        Voir
                      </button>
                      {demand.status === 'draft' && (
                        <>
                          <button
                            onClick={() => openModal('edit', demand)}
                            className="flex items-center px-3 py-1.5 bg-green-50 text-green-700 rounded-lg text-sm font-medium hover:bg-green-100"
                          >
                            <Edit className="w-4 h-4 mr-1.5" />
                            Modifier
                          </button>
                          <button
                            onClick={() => handleSubmitDemand(demand.id)}
                            className="flex items-center px-3 py-1.5 bg-purple-50 text-purple-700 rounded-lg text-sm font-medium hover:bg-purple-100"
                          >
                            <Check className="w-4 h-4 mr-1.5" />
                            Soumettre
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Modals */}
      {showModal && modalType === 'add' && (
        <AddDemandModal
          isOpen={showModal}
          onClose={async () => {
            closeModal()
            await refresh() // Refresh the list after adding
          }}
        />
      )}

      {showModal && modalType === 'view' && selectedItem && (
        <ViewDemandModal
          isOpen={showModal}
          onClose={closeModal}
          demande={selectedItem}
          getPrioriteColor={getPrioriteColor}
          getStatutColor={getStatutColor}
        />
      )}

      {showModal && modalType === 'edit' && selectedItem && (
        <EditDemandModal
          isOpen={showModal}
          onClose={() => {
            closeModal()
            refresh()
          }}
          onSave={handleUpdateDemand}
          demande={selectedItem}
          availableMaterials={MOCK_MATERIALS}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeleteDemandModal
          isOpen={showModal}
          onClose={closeModal}
          onDelete={handleDeleteDemand}
          demande={selectedItem}
        />
      )}
    </div>
  )
}