'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  RotateCcw, 
  ArrowLeft,
  AlertTriangle,
  User,
  Package,
  Calendar,
  Building,
  DollarSign,
  MessageSquare,
  MoreHorizontal
} from 'lucide-react'

// Import des composants modals (à créer séparément)
import AddReturnModal from './components/AddReturnModal'
import ViewReturnModal from './components/ViewReturnModal'
import EditReturnModal from './components/EditReturnModal'
import DeleteReturnModal from './components/DeleteReturnModal'

export default function ReturnsPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState({})
  
  // Données d'exemple pour les retours fournisseur
  const [retoursFournisseur, setRetoursFournisseur] = useState([
    {
      id: 'RF001',
      numeroRetour: 'RF-2024-001',
      dateRetour: '2024-09-15',
      fournisseur: { 
        id: 'F001', 
        nom: 'TechSupply SARL',
        email: 'contact@techsupply.tn',
        telephone: '+216 70 123 456'
      },
      statut: 'En cours',
      produits: [
        { 
          id: 'P001', 
          nom: 'Ordinateur portable Dell défectueux', 
          quantite: 1, 
          prixUnitaire: 2500, 
          type: 'produit',
          quantiteRetournee: 1
        }
      ],
      motifRetour: 'Produit défectueux',
      descriptionMotif: 'Écran défaillant après 2 jours d\'utilisation',
      prixAchat: 2500,
      montantRetour: 2500,
      commentaires: 'Retour urgent - produit sous garantie',
      gestionnaire: 'Ahmed Benali',
      numeroCommande: 'BC-2024-001'
    },
    {
      id: 'RF002',
      numeroRetour: 'RF-2024-002',
      dateRetour: '2024-09-12',
      fournisseur: { 
        id: 'F002', 
        nom: 'Office Plus',
        email: 'commandes@officeplus.tn',
        telephone: '+216 71 456 789'
      },
      statut: 'Accepté',
      produits: [
        { 
          id: 'M003', 
          nom: 'Cartouches d\'encre incompatibles', 
          quantite: 3, 
          prixUnitaire: 45, 
          type: 'matiere',
          quantiteRetournee: 3
        }
      ],
      motifRetour: 'Erreur de commande',
      descriptionMotif: 'Cartouches non compatibles avec notre modèle d\'imprimante',
      prixAchat: 135,
      montantRetour: 135,
      commentaires: 'Erreur de référence lors de la commande',
      gestionnaire: 'Fatima Zouari',
      numeroCommande: 'BC-2024-002'
    },
    {
      id: 'RF003',
      numeroRetour: 'RF-2024-003',
      dateRetour: '2024-09-08',
      fournisseur: { 
        id: 'F003', 
        nom: 'Supplies Direct',
        email: 'orders@suppliesdirect.tn',
        telephone: '+216 72 789 123'
      },
      statut: 'Refusé',
      produits: [
        { 
          id: 'M002', 
          nom: 'Papier A4 endommagé', 
          quantite: 10, 
          prixUnitaire: 8, 
          type: 'matiere',
          quantiteRetournee: 10
        }
      ],
      motifRetour: 'Livraison endommagée',
      descriptionMotif: 'Emballages mouillés pendant le transport',
      prixAchat: 80,
      montantRetour: 0,
      commentaires: 'Retour refusé - délai de réclamation dépassé',
      gestionnaire: 'Mohamed Trabelsi',
      numeroCommande: 'BC-2024-003'
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

  const [motifsDispo] = useState([
    'Produit défectueux',
    'Erreur de commande',
    'Livraison endommagée',
    'Non-conformité',
    'Produit périmé',
    'Quantité incorrecte',
    'Mauvaise qualité',
    'Autre'
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

  const handleAddRetour = (formData) => {
    const newRetour = {
      id: `RF${String(retoursFournisseur.length + 1).padStart(3, '0')}`,
      numeroRetour: `RF-2024-${String(retoursFournisseur.length + 1).padStart(3, '0')}`,
      ...formData,
      dateRetour: new Date().toISOString().split('T')[0],
      statut: 'En cours'
    }
    setRetoursFournisseur([...retoursFournisseur, newRetour])
    closeModal()
  }

  const handleEditRetour = (formData) => {
    setRetoursFournisseur(retoursFournisseur.map(rf => 
      rf.id === selectedItem.id ? { ...rf, ...formData } : rf
    ))
    closeModal()
  }

  const handleDeleteRetour = (id) => {
    setRetoursFournisseur(retoursFournisseur.filter(rf => rf.id !== id))
    closeModal()
  }

  const filteredRetours = retoursFournisseur.filter(retour =>
    retour.numeroRetour.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retour.fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retour.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retour.motifRetour.toLowerCase().includes(searchTerm.toLowerCase()) ||
    retour.gestionnaire.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'En cours': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'Accepté': return 'text-green-700 bg-green-100 border-green-200'
      case 'Refusé': return 'text-red-700 bg-red-100 border-red-200'
      case 'Traité': return 'text-blue-700 bg-blue-100 border-blue-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getMotifColor = (motif) => {
    switch (motif) {
      case 'Produit défectueux': return 'text-red-700 bg-red-100 border-red-200'
      case 'Erreur de commande': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'Livraison endommagée': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'Non-conformité': return 'text-purple-700 bg-purple-100 border-purple-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getTotalMontantRetours = () => {
    return retoursFournisseur.reduce((total, retour) => total + retour.montantRetour, 0)
  }

  const getTotalMontantAchats = () => {
    return retoursFournisseur.reduce((total, retour) => total + retour.prixAchat, 0)
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
                <div className="p-1.5 bg-red-100 rounded-lg flex-shrink-0">
                  <RotateCcw className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Retours Fournisseur</h1>
                  <p className="text-xs text-gray-600 hidden sm:block truncate">Gestion des retours</p>
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
              <div className="p-1.5 sm:p-2 rounded-full bg-red-100 flex-shrink-0">
                <RotateCcw className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{retoursFournisseur.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-orange-100 flex-shrink-0">
                <AlertTriangle className="w-3 h-3 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">En cours</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {retoursFournisseur.filter(rf => rf.statut === 'En cours').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <Package className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Acceptés</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">
                  {retoursFournisseur.filter(rf => rf.statut === 'Accepté').length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-purple-100 flex-shrink-0">
                <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-purple-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Montant retours</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">{getTotalMontantRetours().toLocaleString()} DT</p>
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
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center justify-center px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors shadow-sm text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Nouveau retour</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* Liste des retours */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {filteredRetours.length === 0 ? (
            <div className="text-center py-12">
              <RotateCcw className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun retour trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par créer votre premier retour fournisseur.'}
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
                          Retour
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Fournisseur
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Date
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Motif
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
                      {filteredRetours.map((retour) => (
                        <tr key={retour.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-red-600">
                                  {retour.numeroRetour.slice(-2)}
                                </span>
                              </div>
                              <div className="ml-2 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{retour.numeroRetour}</div>
                                <div className="text-xs text-gray-500 truncate">ID: {retour.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="flex items-center min-w-0">
                              <Building className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{retour.fournisseur.nom}</div>
                                <div className="text-xs text-gray-500 truncate">{retour.fournisseur.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs text-gray-900">
                              {new Date(retour.dateRetour).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: '2-digit' 
                              })}
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMotifColor(retour.motifRetour)}`}>
                              {retour.motifRetour}
                            </span>
                          </td>
                          
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(retour.statut)}`}>
                              {retour.statut}
                            </span>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs font-medium text-gray-900">
                              {retour.montantRetour.toLocaleString()} DT
                            </div>
                            <div className="text-xs text-gray-500">
                              {retour.produits.length} art.
                            </div>
                          </td>
                          
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openModal('view', retour)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Voir"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              {retour.statut === 'En cours' && (
                                <button
                                  onClick={() => openModal('edit', retour)}
                                  className="text-green-600 hover:text-green-900 p-1 rounded"
                                  title="Modifier"
                                >
                                  <Edit className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => openModal('delete', retour)}
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
                {filteredRetours.map((retour) => (
                  <div key={retour.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-red-600">
                              {retour.numeroRetour.slice(-2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{retour.numeroRetour}</div>
                            <div className="text-xs text-gray-500 truncate">{retour.fournisseur.nom}</div>
                          </div>
                        </div>
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => toggleMobileMenu(retour.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {showMobileMenu[retour.id] && (
                            <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => openModal('view', retour)}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Eye className="w-3 h-3 mr-2" />
                                  Voir
                                </button>
                                {retour.statut === 'En cours' && (
                                  <button
                                    onClick={() => openModal('edit', retour)}
                                    className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                  >
                                    <Edit className="w-3 h-3 mr-2" />
                                    Modifier
                                  </button>
                                )}
                                <button
                                  onClick={() => openModal('delete', retour)}
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
                            {new Date(retour.dateRetour).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Montant:</span>
                          <div className="font-medium text-gray-900 truncate">
                            {retour.montantRetour.toLocaleString()} DT
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getMotifColor(retour.motifRetour)}`}>
                            {retour.motifRetour}
                          </span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(retour.statut)}`}>
                            {retour.statut}
                          </span>
                        </div>
                        <div className="text-xs text-gray-500">
                          {retour.produits.length} art.
                        </div>
                      </div>

                      {/* Actions rapides mobiles */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        <button
                          onClick={() => openModal('view', retour)}
                          className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Voir
                        </button>
                        {retour.statut === 'En cours' && (
                          <button
                            onClick={() => openModal('edit', retour)}
                            className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                          >
                            <Edit className="w-3 h-3 mr-1" />
                            Modifier
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
            {filteredRetours.length} retour{filteredRetours.length > 1 ? 's' : ''}
            {filteredRetours.length > 0 && (
              <> • {getTotalMontantRetours().toLocaleString()} DT</>
            )}
          </div>
        </div>
      </div>

      {/* Modals conditionnels */}
      {showModal && modalType === 'add' && (
        <AddReturnModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleAddRetour}
          fournisseursDispo={fournisseursDispo}
          produitsDispo={produitsDispo}
          motifsDispo={motifsDispo}
        />
      )}

      {showModal && modalType === 'view' && selectedItem && (
        <ViewReturnModal
          isOpen={showModal}
          onClose={closeModal}
          retourFournisseur={selectedItem}
          getStatutColor={getStatutColor}
          getMotifColor={getMotifColor}
        />
      )}

      {showModal && modalType === 'edit' && selectedItem && (
        <EditReturnModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleEditRetour}
          retourFournisseur={selectedItem}
          fournisseursDispo={fournisseursDispo}
          produitsDispo={produitsDispo}
          motifsDispo={motifsDispo}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeleteReturnModal
          isOpen={showModal}
          onClose={closeModal}
          onDelete={handleDeleteRetour}
          retourFournisseur={selectedItem}
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