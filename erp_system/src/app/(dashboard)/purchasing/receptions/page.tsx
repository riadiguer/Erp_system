'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Package, 
  ArrowLeft,
  AlertTriangle,
  User,
  Calendar,
  Building,
  Clock,
  MoreHorizontal,
  CheckCircle,
  XCircle,
  Truck
} from 'lucide-react'

// Import des composants modals (à créer séparément)
import AddReceptionModal from './components/AddReceptionModal'
import ViewReceptionModal from './components/ViewReceptionModal'
import EditReceptionModal from './components/EditReceptionModal'
import DeleteReceptionModal from './components/DeleteReceptionModal'

export default function ReceptionsPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState({})
  
  // Données d'exemple pour les réceptions
  const [receptions, setReceptions] = useState([
    {
      id: 'REC001',
      numeroReception: 'REC-2024-001',
      bonCommande: {
        id: 'BC001',
        numeroBon: 'BC-2024-001',
        fournisseur: { 
          id: 'F001', 
          nom: 'TechSupply SARL',
          email: 'contact@techsupply.tn'
        }
      },
      dateReception: '2024-09-15',
      heureReception: '14:30',
      receptionnePar: 'Ahmed Benali',
      numeroBonLivraison: 'BL-2024-001',
      transporteur: 'Express Logistic',
      etatLivraison: 'Conforme',
      produits: [
        { 
          id: 'P001', 
          nom: 'Ordinateur portable Dell', 
          quantiteCommandee: 2, 
          quantiteRecue: 2, 
          etat: 'Conforme',
          prixUnitaire: 2500,
          commentaire: ''
        },
        { 
          id: 'M001', 
          nom: 'Câbles réseau Cat6', 
          quantiteCommandee: 10, 
          quantiteRecue: 8, 
          etat: 'Partiel',
          prixUnitaire: 15,
          commentaire: '2 câbles manquants'
        }
      ],
      commentairesReception: 'Livraison globalement conforme, quelques câbles manquants',
      montantTotal: 5120,
      statut: 'Réceptionné'
    },
    {
      id: 'REC002',
      numeroReception: 'REC-2024-002',
      bonCommande: {
        id: 'BC002',
        numeroBon: 'BC-2024-002',
        fournisseur: { 
          id: 'F002', 
          nom: 'Office Plus',
          email: 'commandes@officeplus.tn'
        }
      },
      dateReception: '2024-09-16',
      heureReception: '10:15',
      receptionnePar: 'Fatima Zouari',
      numeroBonLivraison: 'BL-2024-002',
      transporteur: 'Rapid Transport',
      etatLivraison: 'Conforme',
      produits: [
        { 
          id: 'P002', 
          nom: 'Imprimante laser HP', 
          quantiteCommandee: 1, 
          quantiteRecue: 1, 
          etat: 'Conforme',
          prixUnitaire: 800,
          commentaire: ''
        },
        { 
          id: 'M003', 
          nom: 'Cartouches d\'encre', 
          quantiteCommandee: 5, 
          quantiteRecue: 5, 
          etat: 'Conforme',
          prixUnitaire: 45,
          commentaire: ''
        }
      ],
      commentairesReception: 'Réception parfaite, tous les articles conformes',
      montantTotal: 1025,
      statut: 'Réceptionné'
    },
    {
      id: 'REC003',
      numeroReception: 'REC-2024-003',
      bonCommande: {
        id: 'BC003',
        numeroBon: 'BC-2024-003',
        fournisseur: { 
          id: 'F003', 
          nom: 'Supplies Direct',
          email: 'orders@suppliesdirect.tn'
        }
      },
      dateReception: '2024-09-14',
      heureReception: '16:45',
      receptionnePar: 'Mohamed Trabelsi',
      numeroBonLivraison: 'BL-2024-003',
      transporteur: 'Direct Delivery',
      etatLivraison: 'Partiellement conforme',
      produits: [
        { 
          id: 'M002', 
          nom: 'Papier A4', 
          quantiteCommandee: 50, 
          quantiteRecue: 45, 
          etat: 'Partiel',
          prixUnitaire: 8,
          commentaire: '5 ramettes endommagées'
        },
        { 
          id: 'M005', 
          nom: 'Stylos à bille', 
          quantiteCommandee: 100, 
          quantiteRecue: 0, 
          etat: 'Manquant',
          prixUnitaire: 1.5,
          commentaire: 'Article non livré'
        }
      ],
      commentairesReception: 'Problèmes de livraison, articles manquants et endommagés',
      montantTotal: 360,
      statut: 'Problème'
    }
  ])

  const [fournisseursDispo] = useState([
    { 
      id: 'F001', 
      nom: 'TechSupply SARL',
      email: 'contact@techsupply.tn',
      telephone: '+216 70 123 456'
    },
    { 
      id: 'F002', 
      nom: 'Office Plus',
      email: 'commandes@officeplus.tn',
      telephone: '+216 71 456 789'
    },
    { 
      id: 'F003', 
      nom: 'Supplies Direct',
      email: 'orders@suppliesdirect.tn',
      telephone: '+216 72 789 123'
    }
  ])

  const [bonsCommandeDispo] = useState([
    { id: 'BC001', numeroBon: 'BC-2024-001', fournisseur: 'TechSupply SARL', montant: 5150 },
    { id: 'BC002', numeroBon: 'BC-2024-002', fournisseur: 'Office Plus', montant: 1025 },
    { id: 'BC004', numeroBon: 'BC-2024-004', fournisseur: 'TechSupply SARL', montant: 1350 }
  ])

  const openModal = (type, item = null) => {
    setModalType(type)
    setSelectedItem(item)
    setShowModal(true)
    setShowMobileMenu({})
  }

  const closeModal = () => {
    setShowModal(false)
    setModalType('')
    setSelectedItem(null)
  }

  const handleAddReception = (formData) => {
    const newReception = {
      id: `REC${String(receptions.length + 1).padStart(3, '0')}`,
      numeroReception: `REC-2024-${String(receptions.length + 1).padStart(3, '0')}`,
      ...formData,
      statut: determineStatut(formData.produits)
    }
    setReceptions([...receptions, newReception])
    closeModal()
  }

  const handleEditReception = (formData) => {
    setReceptions(receptions.map(r => 
      r.id === selectedItem.id ? { 
        ...r, 
        ...formData, 
        statut: determineStatut(formData.produits) 
      } : r
    ))
    closeModal()
  }

  const handleDeleteReception = (id) => {
    setReceptions(receptions.filter(r => r.id !== id))
    closeModal()
  }

  const determineStatut = (produits) => {
    const hasProblems = produits.some(p => p.etat === 'Manquant' || p.etat === 'Endommagé' || p.etat === 'Partiel')
    return hasProblems ? 'Problème' : 'Réceptionné'
  }

  const filteredReceptions = receptions.filter(reception =>
    reception.numeroReception.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reception.bonCommande.numeroBon.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reception.bonCommande.fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reception.receptionnePar.toLowerCase().includes(searchTerm.toLowerCase()) ||
    reception.statut.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getEtatColor = (etat) => {
    switch (etat) {
      case 'Conforme': return 'text-green-700 bg-green-100 border-green-200'
      case 'Partiellement conforme': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'Non conforme': return 'text-red-700 bg-red-100 border-red-200'
      case 'Endommagé': return 'text-red-700 bg-red-100 border-red-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Réceptionné': return 'text-green-700 bg-green-100 border-green-200'
      case 'Problème': return 'text-red-700 bg-red-100 border-red-200'
      case 'En cours': return 'text-blue-700 bg-blue-100 border-blue-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getTotalMontant = () => {
    return receptions.reduce((total, reception) => total + reception.montantTotal, 0)
  }

  const getTotalArticles = () => {
    return receptions.reduce((total, reception) => 
      total + reception.produits.reduce((subTotal, produit) => subTotal + produit.quantiteRecue, 0), 0
    )
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
                <div className="p-1.5 bg-purple-100 rounded-lg flex-shrink-0">
                  <Package className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Réceptions</h1>
                  <p className="text-xs text-gray-600 hidden sm:block truncate">Gestion des réceptions de marchandises</p>
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
              <div className="p-1.5 sm:p-2 rounded-full bg-purple-100 flex-shrink-0">
                <Package className="w-3 h-3 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{receptions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Conformes</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {receptions.filter(r => r.statut === 'Réceptionné').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-red-100 flex-shrink-0">
                <XCircle className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Problèmes</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {receptions.filter(r => r.statut === 'Problème').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 flex-shrink-0">
                <Truck className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Articles reçus</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">{getTotalArticles()}</p>
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
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center justify-center px-3 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Nouvelle réception</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* Liste des réceptions */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {filteredReceptions.length === 0 ? (
            <div className="text-center py-12">
              <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune réception trouvée</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par enregistrer votre première réception.'}
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
                          Réception
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Bon commande
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Fournisseur
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          État
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
                      {filteredReceptions.map((reception) => (
                        <tr key={reception.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-purple-600">
                                  {reception.numeroReception.slice(-2)}
                                </span>
                              </div>
                              <div className="ml-2 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{reception.numeroReception}</div>
                                <div className="text-xs text-gray-500 truncate">ID: {reception.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs font-medium text-gray-900 truncate">{reception.bonCommande.numeroBon}</div>
                            <div className="text-xs text-gray-500 truncate">{reception.bonCommande.id}</div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="flex items-center min-w-0">
                              <Building className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                              <div className="text-xs font-medium text-gray-900 truncate">{reception.bonCommande.fournisseur.nom}</div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs text-gray-900">
                              {new Date(reception.dateReception).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: '2-digit' 
                              })}
                            </div>
                            <div className="text-xs text-gray-500">{reception.heureReception}</div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEtatColor(reception.etatLivraison)}`}>
                              {reception.etatLivraison}
                            </span>
                          </td>
                          
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(reception.statut)}`}>
                              {reception.statut}
                            </span>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs font-medium text-gray-900">
                              {reception.montantTotal.toLocaleString()} DT
                            </div>
                            <div className="text-xs text-gray-500">
                              {reception.produits.length} art.
                            </div>
                          </td>
                          
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openModal('view', reception)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Voir"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openModal('edit', reception)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Modifier"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openModal('delete', reception)}
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
                {filteredReceptions.map((reception) => (
                  <div key={reception.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-purple-600">
                              {reception.numeroReception.slice(-2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{reception.numeroReception}</div>
                            <div className="text-xs text-gray-500 truncate">{reception.bonCommande.numeroBon}</div>
                          </div>
                        </div>
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => toggleMobileMenu(reception.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {showMobileMenu[reception.id] && (
                            <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => openModal('view', reception)}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Eye className="w-3 h-3 mr-2" />
                                  Voir
                                </button>
                                <button
                                  onClick={() => openModal('edit', reception)}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Edit className="w-3 h-3 mr-2" />
                                  Modifier
                                </button>
                                <button
                                  onClick={() => openModal('delete', reception)}
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
                          <span className="text-gray-500">Fournisseur:</span>
                          <div className="font-medium text-gray-900 truncate">
                            {reception.bonCommande.fournisseur.nom}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Date:</span>
                          <div className="font-medium text-gray-900">
                            {new Date(reception.dateReception).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEtatColor(reception.etatLivraison)}`}>
                            {reception.etatLivraison}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(reception.statut)}`}>
                            {reception.statut}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {reception.produits.length} art.
                        </div>
                      </div>

                      <div className="text-xs text-gray-500 mb-2">
                        <span>Montant: </span>
                        <span className="font-medium text-gray-900">{reception.montantTotal.toLocaleString()} DT</span>
                      </div>

                      {/* Actions rapides mobiles */}
                      <div className="flex flex-wrap gap-1">
                        <button
                          onClick={() => openModal('view', reception)}
                          className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Voir
                        </button>
                        <button
                          onClick={() => openModal('edit', reception)}
                          className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Modifier
                        </button>
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
            {filteredReceptions.length} réception{filteredReceptions.length > 1 ? 's' : ''}
            {filteredReceptions.length > 0 && (
              <> • {getTotalMontant().toLocaleString()} DT • {getTotalArticles()} articles</>
            )}
          </div>
        </div>
      </div>

      {/* Modals conditionnels */}
      {showModal && modalType === 'add' && (
        <AddReceptionModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleAddReception}
          fournisseursDispo={fournisseursDispo}
          bonsCommandeDispo={bonsCommandeDispo}
        />
      )}

      {showModal && modalType === 'view' && selectedItem && (
        <ViewReceptionModal
          isOpen={showModal}
          onClose={closeModal}
          reception={selectedItem}
          getEtatColor={getEtatColor}
          getStatutColor={getStatutColor}
        />
      )}

      {showModal && modalType === 'edit' && selectedItem && (
        <EditReceptionModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleEditReception}
          reception={selectedItem}
          fournisseursDispo={fournisseursDispo}
          bonsCommandeDispo={bonsCommandeDispo}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeleteReceptionModal
          isOpen={showModal}
          onClose={closeModal}
          onDelete={handleDeleteReception}
          reception={selectedItem}
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