'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Check, 
  FileText, 
  ArrowLeft,
  AlertTriangle,
  User,
  Package,
  Calendar,
  Building,
  Clock,
  MoreHorizontal,
  ChevronDown
} from 'lucide-react'

// Import des composants modals (à créer séparément)
import AddOrderModal from './components/AddOrderModal'
import ViewOrderModal from './components/ViewOrderModal'
import EditOrderModal from './components/EditOrderModal'
import DeleteOrderModal from './components/DeleteOrderModal'
import ReceiveOrderModal from './components/ReceiveOrderModal'

export default function OrdersPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState({})
  
  // Données d'exemple pour les bons de commande
  const [bonsCommande, setBonsCommande] = useState([
    {
      id: 'BC001',
      numeroBon: 'BC-2024-001',
      dateCreation: '2024-09-10',
      dateExpiration: '2024-10-10',
      fournisseur: { 
        id: 'F001', 
        nom: 'TechSupply SARL',
        email: 'contact@techsupply.tn',
        telephone: '+216 70 123 456'
      },
      statut: 'En attente',
      priorite: 'Haute',
      produits: [
        { id: 'P001', nom: 'Ordinateur portable Dell', quantite: 2, prixUnitaire: 2500, type: 'produit' },
        { id: 'M001', nom: 'Câbles réseau Cat6', quantite: 10, prixUnitaire: 15, type: 'matiere' }
      ],
      commentaires: 'Livraison urgente demandée avant fin septembre',
      montantTotal: 5150,
      gestionnaire: 'Ahmed Benali'
    },
    {
      id: 'BC002',
      numeroBon: 'BC-2024-002',
      dateCreation: '2024-09-12',
      dateExpiration: '2024-10-15',
      fournisseur: { 
        id: 'F002', 
        nom: 'Office Plus',
        email: 'commandes@officeplus.tn',
        telephone: '+216 71 456 789'
      },
      statut: 'Commandé',
      priorite: 'Moyenne',
      produits: [
        { id: 'P002', nom: 'Imprimante laser HP', quantite: 1, prixUnitaire: 800, type: 'produit' },
        { id: 'M003', nom: 'Cartouches d\'encre', quantite: 5, prixUnitaire: 45, type: 'matiere' }
      ],
      commentaires: 'Commande standard - livraison normale',
      montantTotal: 1025,
      gestionnaire: 'Fatima Zouari'
    },
    {
      id: 'BC003',
      numeroBon: 'BC-2024-003',
      dateCreation: '2024-09-08',
      dateExpiration: '2024-10-05',
      fournisseur: { 
        id: 'F003', 
        nom: 'Supplies Direct',
        email: 'orders@suppliesdirect.tn',
        telephone: '+216 72 789 123'
      },
      statut: 'Reçu',
      priorite: 'Basse',
      produits: [
        { id: 'M002', nom: 'Papier A4', quantite: 50, prixUnitaire: 8, type: 'matiere' },
        { id: 'M005', nom: 'Stylos à bille', quantite: 100, prixUnitaire: 1.5, type: 'matiere' }
      ],
      commentaires: 'Réapprovisionnement mensuel des fournitures',
      montantTotal: 550,
      gestionnaire: 'Mohamed Trabelsi'
    },
    {
      id: 'BC004',
      numeroBon: 'BC-2024-004',
      dateCreation: '2024-09-14',
      dateExpiration: '2024-10-20',
      fournisseur: { 
        id: 'F001', 
        nom: 'TechSupply SARL',
        email: 'contact@techsupply.tn',
        telephone: '+216 70 123 456'
      },
      statut: 'En attente',
      priorite: 'Moyenne',
      produits: [
        { id: 'P003', nom: 'Écran 24 pouces Samsung', quantite: 3, prixUnitaire: 450, type: 'produit' }
      ],
      commentaires: 'Pour les nouveaux postes de travail',
      montantTotal: 1350,
      gestionnaire: 'Ahmed Benali'
    }
  ])

  const [fournisseursDispo] = useState([
    { 
      id: 'F001', 
      nom: 'TechSupply SARL',
      email: 'contact@techsupply.tn',
      telephone: '+216 70 123 456',
      adresse: 'Zone Industrielle, Sfax'
    },
    { 
      id: 'F002', 
      nom: 'Office Plus',
      email: 'commandes@officeplus.tn',
      telephone: '+216 71 456 789',
      adresse: 'Avenue Habib Bourguiba, Tunis'
    },
    { 
      id: 'F003', 
      nom: 'Supplies Direct',
      email: 'orders@suppliesdirect.tn',
      telephone: '+216 72 789 123',
      adresse: 'Route de Sousse, Monastir'
    }
  ])

  const [produitsDispo] = useState([
    { id: 'P001', nom: 'Ordinateur portable Dell', type: 'produit', prixUnitaire: 2500 },
    { id: 'P002', nom: 'Imprimante laser HP', type: 'produit', prixUnitaire: 800 },
    { id: 'P003', nom: 'Écran 24 pouces Samsung', type: 'produit', prixUnitaire: 450 },
    { id: 'P004', nom: 'Clavier sans fil', type: 'produit', prixUnitaire: 75 },
    { id: 'P005', nom: 'Souris optique', type: 'produit', prixUnitaire: 25 },
    { id: 'M001', nom: 'Câbles réseau Cat6', type: 'matiere', prixUnitaire: 15 },
    { id: 'M002', nom: 'Papier A4', type: 'matiere', prixUnitaire: 8 },
    { id: 'M003', nom: 'Cartouches d\'encre', type: 'matiere', prixUnitaire: 45 },
    { id: 'M004', nom: 'Toner pour imprimante', type: 'matiere', prixUnitaire: 120 },
    { id: 'M005', nom: 'Stylos à bille', type: 'matiere', prixUnitaire: 1.5 }
  ])

  const openModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setShowModal(true)
    setShowMobileMenu({}) // Fermer tous les menus mobiles
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
  }

  const handleAddBonCommande = (formData) => {
    const newBonCommande = {
      id: `BC${String(bonsCommande.length + 1).padStart(3, '0')}`,
      numeroBon: `BC-2024-${String(bonsCommande.length + 1).padStart(3, '0')}`,
      ...formData,
      dateCreation: new Date().toISOString().split('T')[0],
      statut: 'En attente'
    }
    setBonsCommande([...bonsCommande, newBonCommande])
    closeModal()
  }

  const handleEditBonCommande = (formData) => {
    setBonsCommande(bonsCommande.map(bc => 
      bc.id === selectedItem.id ? { ...bc, ...formData } : bc
    ))
    closeModal()
  }

  const handleDeleteBonCommande = (id) => {
    setBonsCommande(bonsCommande.filter(bc => bc.id !== id))
    closeModal()
  }

  const handleReceiveBonCommande = (id, receptionData) => {
    setBonsCommande(bonsCommande.map(bc => 
      bc.id === id ? { ...bc, statut: 'Reçu', ...receptionData } : bc
    ))
    closeModal()
  }

  const filteredBonsCommande = bonsCommande.filter(bon =>
    bon.numeroBon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bon.gestionnaire.toLowerCase().includes(searchTerm.toLowerCase())
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
      case 'Commandé': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'Reçu': return 'text-green-700 bg-green-100 border-green-200'
      case 'Annulé': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getTotalMontant = () => {
    return bonsCommande.reduce((total, bon) => total + bon.montantTotal, 0)
  }

  const canReceive = (statut) => {
    return statut === 'En attente' || statut === 'Commandé'
  }

  const toggleMobileMenu = (id) => {
    setShowMobileMenu(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              <Link 
                href="../purchasing" 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
              >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                <span className="hidden sm:inline text-sm">Retour</span>
              </Link>
              <div className="h-4 w-px bg-gray-300 flex-shrink-0" />
              <div className="flex items-center space-x-2 min-w-0">
                <div className="p-1.5 bg-green-100 rounded-lg flex-shrink-0">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Bons de Commande</h1>
                  <p className="text-xs text-gray-600 hidden sm:block truncate">Gestion des commandes</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <FileText className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{bonsCommande.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-orange-100 flex-shrink-0">
                <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Attente</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {bonsCommande.filter(bc => bc.statut === 'En attente').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 flex-shrink-0">
                <Package className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Commandées</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {bonsCommande.filter(bc => bc.statut === 'Commandé').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-purple-100 flex-shrink-0">
                <Building className="w-3 h-3 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Montant</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">{getTotalMontant().toLocaleString()} DT</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
          <div className="flex-1 min-w-0">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Nouveau</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* Liste des bons de commande */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {filteredBonsCommande.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun bon de commande trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre premier bon de commande.'}
              </p>
            </div>
          ) : (
            <>
              {/* Vue Desktop */}
              <div className="hidden xl:block">
                <div className="overflow-x-auto">
                  <table className="w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Bon
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Fournisseur
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Priorité
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Montant
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredBonsCommande.map((bon) => (
                        <tr key={bon.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-green-600">
                                  {bon.numeroBon.slice(-2)}
                                </span>
                              </div>
                              <div className="ml-2 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{bon.numeroBon}</div>
                                <div className="text-xs text-gray-500 truncate">ID: {bon.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="flex items-center min-w-0">
                              <Building className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{bon.fournisseur.nom}</div>
                                <div className="text-xs text-gray-500 truncate">{bon.fournisseur.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs text-gray-900">
                              {new Date(bon.dateCreation).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: '2-digit' 
                              })}
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPrioriteColor(bon.priorite)}`}>
                              {bon.priorite}
                            </span>
                          </td>
                          
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(bon.statut)}`}>
                              {bon.statut}
                            </span>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs font-medium text-gray-900">
                              {bon.montantTotal.toLocaleString()} DT
                            </div>
                            <div className="text-xs text-gray-500">
                              {bon.produits.length} art.
                            </div>
                          </td>
                          
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openModal('view', bon)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Voir"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              {bon.statut !== 'Reçu' && (
                                <button
                                  onClick={() => openModal('edit', bon)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="Modifier"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                              {canReceive(bon.statut) && (
                                <button
                                  onClick={() => openModal('receive', bon)}
                                  className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                  title="Recevoir"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => openModal('delete', bon)}
                                className="text-red-600 hover:text-red-900 p-1 rounded"
                                title="Supprimer"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Vue Mobile/Tablet */}
              <div className="xl:hidden">
                {filteredBonsCommande.map((bon) => (
                  <div key={bon.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-green-600">
                              {bon.numeroBon.slice(-2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{bon.numeroBon}</div>
                            <div className="text-xs text-gray-500 truncate">{bon.fournisseur.nom}</div>
                          </div>
                        </div>
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => toggleMobileMenu(bon.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {showMobileMenu[bon.id] && (
                            <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => openModal('view', bon)}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Eye className="w-3 h-3 mr-2" />
                                  Voir
                                </button>
                                {bon.statut !== 'Reçu' && (
                                  <button
                                    onClick={() => openModal('edit', bon)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <Edit className="w-3 h-3 mr-2" />
                                    Modifier
                                  </button>
                                )}
                                {canReceive(bon.statut) && (
                                  <button
                                    onClick={() => openModal('receive', bon)}
                                    className="w-full text-left px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center"
                                  >
                                    <Check className="w-3 h-3 mr-2" />
                                    Recevoir
                                  </button>
                                )}
                                <button
                                  onClick={() => openModal('delete', bon)}
                                  className="w-full text-left px-3 py-2 text-xs text-red-700 hover:bg-red-50 flex items-center"
                                >
                                  <Trash2 className="w-3 h-3 mr-2" />
                                  Supprimer
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs mb-2">
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="font-medium text-gray-900">
                            {new Date(bon.dateCreation).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Montant:</span>
                          <div className="font-medium text-gray-900 truncate">
                            {bon.montantTotal.toLocaleString()} DT
                          </div>
                        </div>
                      </div>

                      {/* Actions rapides mobiles */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        <button
                          onClick={() => openModal('view', bon)}
                          className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Voir
                        </button>
                        {bon.statut !== 'Reçu' && (
                          <button
                            onClick={() => openModal('edit', bon)}
                            className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Modifier
                          </button>
                        )}
                        {canReceive(bon.statut) && (
                          <button
                            onClick={() => openModal('receive', bon)}
                            className="flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100 transition-colors"
                          >
                            <Check className="w-3 h-3 mr-1" />
                            Recevoir
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Résumé pour mobile */}
        <div className="mt-3 bg-white rounded-lg p-3 xl:hidden">
          <div className="text-xs text-gray-600 text-center">
            {filteredBonsCommande.length} bon{filteredBonsCommande.length > 1 ? 's' : ''}
            {filteredBonsCommande.length > 0 && (
              <> • {getTotalMontant().toLocaleString()} DT</>
            )}
          </div>
        </div>
      </div>

      {/* Modals conditionnels */}
      {showModal && modalType === 'add' && (
        <AddOrderModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleAddBonCommande}
          fournisseursDispo={fournisseursDispo}
          produitsDispo={produitsDispo}
        />
      )}

      {showModal && modalType === 'view' && selectedItem && (
        <ViewOrderModal
          isOpen={showModal}
          onClose={closeModal}
          bonCommande={selectedItem}
          getPrioriteColor={getPrioriteColor}
          getStatutColor={getStatutColor}
        />
      )}

      {showModal && modalType === 'edit' && selectedItem && (
        <EditOrderModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleEditBonCommande}
          bonCommande={selectedItem}
          fournisseursDispo={fournisseursDispo}
          produitsDispo={produitsDispo}
        />
      )}

      {showModal && modalType === 'receive' && selectedItem && (
        <ReceiveOrderModal
          isOpen={showModal}
          onClose={closeModal}
          onReceive={handleReceiveBonCommande}
          bonCommande={selectedItem}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeleteOrderModal
          isOpen={showModal}
          onClose={closeModal}
          onDelete={handleDeleteBonCommande}
          bonCommande={selectedItem}
        />
      )}

      {/* Overlay pour fermer les menus mobiles */}
      {Object.values(showMobileMenu).some(Boolean) && (
        <div 
          className="fixed inset-0 z-5 xl:hidden" 
          onClick={() => setShowMobileMenu({})}
        />
      )}
    </div>
  )
}