'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Archive, 
  ShoppingCart, 
  ArrowLeft,
  AlertTriangle,
  User,
  Package,
  Calendar,
  Check
} from 'lucide-react'

// Import des composants modals (à créer séparément)
import AddDemandModal from './components/AddDemandModal'
import ViewDemandModal from './components/ViewDemandModal'
import EditDemandModal from './components/EditDemandModal'
import DeleteDemandModal from './components/DeleteDemandModal'

export default function DemandRequestsPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  
  // Données d'exemple pour les demandes d'achat
  const [demandesAchat, setDemandesAchat] = useState([
    {
      id: 'DA001',
      utilisateur: { id: 'U001', nom: 'Ahmed Benali' },
      dateCreation: '2024-09-10',
      priorite: 'Haute',
      statut: 'En attente',
      produits: [
        { id: 'P001', nom: 'Ordinateur portable Dell', quantite: 2, type: 'produit' },
        { id: 'M001', nom: 'Câbles réseau Cat6', quantite: 10, type: 'matiere' }
      ],
      commentaires: 'Urgent pour le nouveau département IT - Besoin avant fin du mois'
    },
    {
      id: 'DA002',
      utilisateur: { id: 'U002', nom: 'Fatima Zouari' },
      dateCreation: '2024-09-12',
      priorite: 'Moyenne',
      statut: 'Approuvée',
      produits: [
        { id: 'P002', nom: 'Imprimante laser HP', quantite: 1, type: 'produit' }
      ],
      commentaires: 'Remplacement de l\'ancienne imprimante du service comptabilité'
    },
    {
      id: 'DA003',
      utilisateur: { id: 'U003', nom: 'Mohamed Trabelsi' },
      dateCreation: '2024-09-11',
      priorite: 'Basse',
      statut: 'En attente',
      produits: [
        { id: 'M002', nom: 'Papier A4', quantite: 50, type: 'matiere' },
        { id: 'M003', nom: 'Cartouches d\'encre', quantite: 5, type: 'matiere' }
      ],
      commentaires: 'Réapprovisionnement mensuel des fournitures de bureau'
    }
  ])

  const [produitsDispo] = useState([
    { id: 'P001', nom: 'Ordinateur portable Dell', type: 'produit' },
    { id: 'P002', nom: 'Imprimante laser HP', type: 'produit' },
    { id: 'P003', nom: 'Écran 24 pouces Samsung', type: 'produit' },
    { id: 'P004', nom: 'Clavier sans fil', type: 'produit' },
    { id: 'P005', nom: 'Souris optique', type: 'produit' },
    { id: 'M001', nom: 'Câbles réseau Cat6', type: 'matiere' },
    { id: 'M002', nom: 'Papier A4', type: 'matiere' },
    { id: 'M003', nom: 'Cartouches d\'encre', type: 'matiere' },
    { id: 'M004', nom: 'Toner pour imprimante', type: 'matiere' },
    { id: 'M005', nom: 'Stylos à bille', type: 'matiere' }
  ])

  const openModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setShowModal(true)
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
  }

  const handleAddDemande = (formData) => {
    const newDemande = {
      id: `DA${String(demandesAchat.length + 1).padStart(3, '0')}`,
      ...formData,
      dateCreation: new Date().toISOString().split('T')[0],
      statut: 'En attente'
    }
    setDemandesAchat([...demandesAchat, newDemande])
    closeModal()
  }

  const handleEditDemande = (formData) => {
    setDemandesAchat(demandesAchat.map(d => 
      d.id === selectedItem.id ? { ...d, ...formData } : d
    ))
    closeModal()
  }

  const handleDeleteDemande = (id) => {
    setDemandesAchat(demandesAchat.filter(d => d.id !== id))
    closeModal()
  }

  const handleArchiveDemande = (id) => {
    setDemandesAchat(demandesAchat.map(d => 
      d.id === id ? { ...d, statut: 'Archivée' } : d
    ))
  }

  const filteredDemandes = demandesAchat.filter(demande =>
    demande.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.utilisateur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    demande.statut.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getPrioriteColor = (priorite) => {
    switch (priorite) {
      case 'Haute': return 'text-red-700 bg-red-100 border-red-200'
      case 'Moyenne': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'Basse': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'En attente': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'Approuvée': return 'text-green-700 bg-green-100 border-green-200'
      case 'Rejetée': return 'text-red-700 bg-red-100 border-red-200'
      case 'Archivée': return 'text-gray-700 bg-gray-100 border-gray-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <Link 
                href="../purchasing" 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Retour au module
              </Link>
              <div className="h-6 w-px bg-gray-300" />
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <ShoppingCart className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Demandes d'Achat</h1>
                  <p className="text-gray-600">Gestion des demandes d'achat des utilisateurs</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-blue-100">
                <ShoppingCart className="w-6 h-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Total demandes</p>
                <p className="text-2xl font-bold text-gray-900">{demandesAchat.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-orange-100">
                <AlertTriangle className="w-6 h-6 text-orange-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">En attente</p>
                <p className="text-2xl font-bold text-gray-900">
                  {demandesAchat.filter(d => d.statut === 'En attente').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-green-100">
                <Check className="w-6 h-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Approuvées</p>
                <p className="text-2xl font-bold text-gray-900">
                  {demandesAchat.filter(d => d.statut === 'Approuvée').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-red-100">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">Haute priorité</p>
                <p className="text-2xl font-bold text-gray-900">
                  {demandesAchat.filter(d => d.priorite === 'Haute').length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par ID, utilisateur ou statut..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Nouvelle demande
          </button>
        </div>

        {/* Liste des demandes */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {filteredDemandes.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune demande trouvée</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre première demande d\'achat.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Demande
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Utilisateur
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Priorité
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Statut
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Articles
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredDemandes.map((demande) => (
                    <tr key={demande.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-xs font-medium text-blue-600">
                                {demande.id.slice(-2)}
                              </span>
                            </div>
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">{demande.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <User className="w-4 h-4 text-gray-400 mr-2" />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{demande.utilisateur.nom}</div>
                            <div className="text-sm text-gray-500">{demande.utilisateur.id}</div>
                          </div>
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Calendar className="w-4 h-4 text-gray-400 mr-2" />
                          {new Date(demande.dateCreation).toLocaleDateString('fr-FR')}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getPrioriteColor(demande.priorite)}`}>
                          {demande.priorite}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full border ${getStatutColor(demande.statut)}`}>
                          {demande.statut}
                        </span>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center text-sm text-gray-900">
                          <Package className="w-4 h-4 text-gray-400 mr-2" />
                          {demande.produits.length} article{demande.produits.length > 1 ? 's' : ''}
                        </div>
                      </td>
                      
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button
                            onClick={() => openModal('view', demande)}
                            className="text-blue-600 hover:text-blue-900 p-1 rounded"
                            title="Voir les détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('edit', demande)}
                            className="text-green-600 hover:text-green-900 p-1 rounded"
                            title="Modifier"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleArchiveDemande(demande.id)}
                            className="text-gray-600 hover:text-gray-900 p-1 rounded"
                            title="Archiver"
                          >
                            <Archive className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => openModal('delete', demande)}
                            className="text-red-600 hover:text-red-900 p-1 rounded"
                            title="Supprimer"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modals conditionnels */}
      {showModal && modalType === 'add' && (
        <AddDemandModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleAddDemande}
          produitsDispo={produitsDispo}
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
          onClose={closeModal}
          onSave={handleEditDemande}
          demande={selectedItem}
          produitsDispo={produitsDispo}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeleteDemandModal
          isOpen={showModal}
          onClose={closeModal}
          onDelete={handleDeleteDemande}
          demande={selectedItem}
        />
      )}
    </div>
  )
}