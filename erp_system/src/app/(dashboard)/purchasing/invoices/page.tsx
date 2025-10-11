'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  Receipt, 
  ArrowLeft,
  Building,
  DollarSign,
  Calendar,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Phone,
  Mail,
  MapPin,
  FileText,
  Package,
  RotateCcw,
  CreditCard,
  MoreHorizontal
} from 'lucide-react'

// Import des composants modals
import AddInvoiceModal from './components/AddInvoiceModal'
import ViewInvoiceModal from './components/ViewInvoiceModal'
import EditInvoiceModal from './components/EditInvoiceModal'
import DeleteInvoiceModal from './components/DeleteInvoiceModal'
import SupplierDetailsModal from './components/SupplierDetailsModal'
import PayInvoiceModal from './components/PayInvoiceModal'

export default function InvoicesPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [selectedSupplier, setSelectedSupplier] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState({})
  const [viewMode, setViewMode] = useState('suppliers') // 'suppliers' ou 'invoices'
  
  // Données d'exemple pour les fournisseurs
  const [fournisseurs, setFournisseurs] = useState([
    {
      id: 'F001',
      nom: 'TechSupply SARL',
      email: 'contact@techsupply.tn',
      telephone: '+216 70 123 456',
      adresse: 'Zone Industrielle, Sfax',
      dateCreation: '2023-01-15',
      statut: 'Actif',
      totalAchats: 15750,
      totalFactures: 8,
      totalDettes: 2500,
      dernierAchat: '2024-09-12'
    },
    {
      id: 'F002',
      nom: 'Office Plus',
      email: 'commandes@officeplus.tn',
      telephone: '+216 71 456 789',
      adresse: 'Avenue Habib Bourguiba, Tunis',
      dateCreation: '2023-03-20',
      statut: 'Actif',
      totalAchats: 8920,
      totalFactures: 5,
      totalDettes: 0,
      dernierAchat: '2024-09-10'
    },
    {
      id: 'F003',
      nom: 'Supplies Direct',
      email: 'orders@suppliesdirect.tn',
      telephone: '+216 72 789 123',
      adresse: 'Route de Sousse, Monastir',
      dateCreation: '2023-02-10',
      statut: 'Actif',
      totalAchats: 5650,
      totalFactures: 3,
      totalDettes: 1200,
      dernierAchat: '2024-09-08'
    },
    {
      id: 'F004',
      nom: 'Industrial Equipment Co',
      email: 'sales@indequip.tn',
      telephone: '+216 73 654 321',
      adresse: 'Zone Technologique, Sousse',
      dateCreation: '2023-06-05',
      statut: 'Inactif',
      totalAchats: 12300,
      totalFactures: 6,
      totalDettes: 0,
      dernierAchat: '2024-07-15'
    }
  ])

  // Données d'exemple pour les factures
  const [factures, setFactures] = useState([
    {
      id: 'INV001',
      numeroFacture: 'FAC-2024-001',
      fournisseurId: 'F001',
      dateFacture: '2024-09-12',
      dateEcheance: '2024-10-12',
      type: 'Achat',
      statut: 'Payée',
      montantHT: 4200,
      montantTTC: 5040,
      montantPaye: 5040,
      montantDu: 0,
      produits: [
        { nom: 'Ordinateur portable Dell', quantite: 2, prixUnitaire: 2100 }
      ],
      commentaires: 'Facture pour livraison du 10/09/2024'
    },
    {
      id: 'INV002',
      numeroFacture: 'FAC-2024-002',
      fournisseurId: 'F001',
      dateFacture: '2024-09-08',
      dateEcheance: '2024-10-08',
      type: 'Achat',
      statut: 'En attente',
      montantHT: 2500,
      montantTTC: 3000,
      montantPaye: 500,
      montantDu: 2500,
      produits: [
        { nom: 'Câbles réseau Cat6', quantite: 100, prixUnitaire: 25 }
      ],
      commentaires: 'Paiement partiel effectué'
    },
    {
      id: 'INV003',
      numeroFacture: 'RET-2024-001',
      fournisseurId: 'F001',
      dateFacture: '2024-09-05',
      dateEcheance: '2024-09-20',
      type: 'Retour',
      statut: 'Traitée',
      montantHT: -800,
      montantTTC: -960,
      montantPaye: -960,
      montantDu: 0,
      produits: [
        { nom: 'Écrans défectueux', quantite: 2, prixUnitaire: -400 }
      ],
      commentaires: 'Retour pour défaut de fabrication'
    },
    {
      id: 'INV004',
      numeroFacture: 'FAC-2024-003',
      fournisseurId: 'F002',
      dateFacture: '2024-09-10',
      dateEcheance: '2024-10-10',
      type: 'Achat',
      statut: 'Payée',
      montantHT: 1200,
      montantTTC: 1440,
      montantPaye: 1440,
      montantDu: 0,
      produits: [
        { nom: 'Imprimante laser HP', quantite: 1, prixUnitaire: 1200 }
      ],
      commentaires: 'Livraison express'
    },
    {
      id: 'INV005',
      numeroFacture: 'FAC-2024-004',
      fournisseurId: 'F003',
      dateFacture: '2024-09-08',
      dateEcheance: '2024-09-25',
      type: 'Achat',
      statut: 'En retard',
      montantHT: 1500,
      montantTTC: 1800,
      montantPaye: 600,
      montantDu: 1200,
      produits: [
        { nom: 'Fournitures de bureau', quantite: 50, prixUnitaire: 30 }
      ],
      commentaires: 'Paiement en retard'
    }
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

  const handleSelectSupplier = (supplier) => {
    setSelectedSupplier(supplier)
    setViewMode('invoices')
  }

  const handleBackToSuppliers = () => {
    setSelectedSupplier(null)
    setViewMode('suppliers')
  }

  const handlePayInvoice = (paymentData) => {
    // Mettre à jour la facture avec le nouveau paiement
    setFactures(prev => prev.map(f => 
      f.id === paymentData.factureId 
        ? {
            ...f,
            montantPaye: f.montantPaye + paymentData.montantPaiement,
            montantDu: Math.max(0, f.montantDu - paymentData.montantPaiement),
            statut: paymentData.nouveauStatut
          }
        : f
    ))
    
    // Mettre à jour le fournisseur correspondant
    setFournisseurs(prev => prev.map(fournisseur => {
      if (fournisseur.id === selectedSupplier?.id) {
        return {
          ...fournisseur,
          totalDettes: Math.max(0, fournisseur.totalDettes - paymentData.montantPaiement)
        }
      }
      return fournisseur
    }))
    
    closeModal()
  }

  const getSupplierFactures = (supplierId) => {
    return factures.filter(f => f.fournisseurId === supplierId)
  }

  const getSupplierStats = (supplierId) => {
    const supplierFactures = getSupplierFactures(supplierId)
    const achats = supplierFactures.filter(f => f.type === 'Achat')
    const retours = supplierFactures.filter(f => f.type === 'Retour')
    
    return {
      totalFactures: supplierFactures.length,
      totalAchats: achats.reduce((sum, f) => sum + f.montantTTC, 0),
      totalRetours: Math.abs(retours.reduce((sum, f) => sum + f.montantTTC, 0)),
      totalDettes: supplierFactures.reduce((sum, f) => sum + f.montantDu, 0),
      facturesEnRetard: supplierFactures.filter(f => f.statut === 'En retard').length
    }
  }

  const filteredFournisseurs = fournisseurs.filter(fournisseur =>
    fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    fournisseur.id.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const filteredFactures = selectedSupplier 
    ? getSupplierFactures(selectedSupplier.id).filter(facture =>
        facture.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        facture.statut.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : []

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Payée': return 'text-green-700 bg-green-100 border-green-200'
      case 'En attente': return 'text-orange-700 bg-orange-100 border-orange-200'
      case 'En retard': return 'text-red-700 bg-red-100 border-red-200'
      case 'Traitée': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'Annulée': return 'text-gray-700 bg-gray-100 border-gray-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getTypeColor = (type) => {
    switch (type) {
      case 'Achat': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'Retour': return 'text-red-700 bg-red-100 border-red-200'
      case 'Avoir': return 'text-green-700 bg-green-100 border-green-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const toggleMobileMenu = (id) => {
    setShowMobileMenu(prev => ({
      ...prev,
      [id]: !prev[id]
    }))
  }

  const getTotalStats = () => {
    return {
      totalFournisseurs: fournisseurs.length,
      fournisseursActifs: fournisseurs.filter(f => f.statut === 'Actif').length,
      totalAchats: fournisseurs.reduce((sum, f) => sum + f.totalAchats, 0),
      totalDettes: fournisseurs.reduce((sum, f) => sum + f.totalDettes, 0)
    }
  }

  const stats = getTotalStats()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête avec navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="w-full px-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between py-3 sm:py-4">
            <div className="flex items-center space-x-2 min-w-0 flex-1">
              {viewMode === 'invoices' ? (
                <button
                  onClick={handleBackToSuppliers}
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  <span className="text-sm">Fournisseurs</span>
                </button>
              ) : (
                <Link 
                  href="../purchasing" 
                  className="flex items-center text-gray-500 hover:text-gray-700 transition-colors flex-shrink-0"
                >
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-1" />
                  <span className="hidden sm:inline text-sm">Retour</span>
                </Link>
              )}
              <div className="h-4 w-px bg-gray-300 flex-shrink-0" />
              <div className="flex items-center space-x-2 min-w-0">
                <div className="p-1.5 bg-orange-100 rounded-lg flex-shrink-0">
                  <Receipt className="w-4 h-4 sm:w-5 sm:h-5 text-orange-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">
                    {viewMode === 'suppliers' ? 'Factures Fournisseur' : `Factures - ${selectedSupplier?.nom}`}
                  </h1>
                  <p className="text-xs text-gray-600 hidden sm:block truncate">
                    {viewMode === 'suppliers' 
                      ? 'Gestion des factures par fournisseur' 
                      : 'Historique des transactions'
                    }
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="w-full px-3 sm:px-4 lg:px-6 py-3 sm:py-6">
        
        {viewMode === 'suppliers' ? (
          <>
            {/* Statistiques générales */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-6">
              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 rounded-full bg-orange-100 flex-shrink-0">
                    <Building className="w-3 h-3 sm:w-5 sm:h-5 text-orange-600" />
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">Fournisseurs</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.totalFournisseurs}</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                    <TrendingUp className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">Actifs</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900">{stats.fournisseursActifs}</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 rounded-full bg-blue-100 flex-shrink-0">
                    <DollarSign className="w-3 h-3 sm:w-5 sm:h-5 text-blue-600" />
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">Total achats</p>
                    <p className="text-sm sm:text-lg font-bold text-gray-900 truncate">{stats.totalAchats.toLocaleString()} DT</p>
                  </div>
                </div>
              </div>

              <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
                <div className="flex items-center">
                  <div className="p-1.5 sm:p-2 rounded-full bg-red-100 flex-shrink-0">
                    <AlertTriangle className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" />
                  </div>
                  <div className="ml-2 min-w-0">
                    <p className="text-xs font-medium text-gray-600 truncate">Total dettes</p>
                    <p className="text-sm sm:text-lg font-bold text-red-600 truncate">{stats.totalDettes.toLocaleString()} DT</p>
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
                    placeholder="Rechercher un fournisseur..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  />
                </div>
              </div>
              
              <button
                onClick={() => openModal('add')}
                className="inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm text-sm flex-shrink-0"
              >
                <Plus className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">Nouvelle facture</span>
                <span className="sm:hidden">+</span>
              </button>
            </div>

            {/* Liste des fournisseurs */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 sm:gap-4">
              {filteredFournisseurs.map((fournisseur) => {
                const supplierStats = getSupplierStats(fournisseur.id)
                return (
                  <div 
                    key={fournisseur.id} 
                    className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
                    onClick={() => handleSelectSupplier(fournisseur)}
                  >
                    <div className="p-4 sm:p-6">
                      {/* En-tête du fournisseur */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center">
                            <Building className="w-5 h-5 text-orange-600" />
                          </div>
                          <div className="min-w-0">
                            <h3 className="font-semibold text-gray-900 truncate">{fournisseur.nom}</h3>
                            <p className="text-xs text-gray-500">{fournisseur.id}</p>
                          </div>
                        </div>
                        <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                          fournisseur.statut === 'Actif' 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-gray-100 text-gray-800'
                        }`}>
                          {fournisseur.statut}
                        </div>
                      </div>

                      {/* Informations de contact */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-xs text-gray-600">
                          <Mail className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span className="truncate">{fournisseur.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <Phone className="w-3 h-3 mr-2 flex-shrink-0" />
                          <span>{fournisseur.telephone}</span>
                        </div>
                        <div className="flex items-start text-xs text-gray-600">
                          <MapPin className="w-3 h-3 mr-2 flex-shrink-0 mt-0.5" />
                          <span className="truncate">{fournisseur.adresse}</span>
                        </div>
                      </div>

                      {/* Statistiques financières */}
                      <div className="grid grid-cols-2 gap-3 mb-4">
                        <div className="bg-blue-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-blue-600 font-medium">Total achats</p>
                              <p className="text-sm font-bold text-blue-900">{supplierStats.totalAchats.toLocaleString()} DT</p>
                            </div>
                            <TrendingUp className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                        <div className="bg-red-50 p-3 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-xs text-red-600 font-medium">Dettes</p>
                              <p className="text-sm font-bold text-red-900">{supplierStats.totalDettes.toLocaleString()} DT</p>
                            </div>
                            <AlertTriangle className="w-4 h-4 text-red-600" />
                          </div>
                        </div>
                      </div>

                      {/* Métriques */}
                      <div className="flex items-center justify-between text-xs text-gray-600">
                        <div className="flex items-center">
                          <Receipt className="w-3 h-3 mr-1" />
                          <span>{supplierStats.totalFactures} facture{supplierStats.totalFactures > 1 ? 's' : ''}</span>
                        </div>
                        <div className="flex items-center">
                          <Calendar className="w-3 h-3 mr-1" />
                          <span>Depuis {new Date(fournisseur.dateCreation).getFullYear()}</span>
                        </div>
                      </div>

                      {/* Alertes */}
                      {supplierStats.facturesEnRetard > 0 && (
                        <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-2">
                          <div className="flex items-center text-red-800 text-xs">
                            <AlertTriangle className="w-3 h-3 mr-1" />
                            <span>{supplierStats.facturesEnRetard} facture{supplierStats.facturesEnRetard > 1 ? 's' : ''} en retard</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>

            {filteredFournisseurs.length === 0 && (
              <div className="text-center py-12">
                <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun fournisseur trouvé</h3>
                <p className="text-gray-500">
                  {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter vos premiers fournisseurs.'}
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            {/* Vue des factures pour un fournisseur sélectionné */}
            {selectedSupplier && (
              <>
                {/* Informations du fournisseur sélectionné */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 sm:p-6 mb-4 sm:mb-6">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4">
                    <div className="flex items-center space-x-3 mb-3 sm:mb-0">
                      <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                        <Building className="w-6 h-6 text-orange-600" />
                      </div>
                      <div className="min-w-0">
                        <h2 className="text-lg font-bold text-gray-900">{selectedSupplier.nom}</h2>
                        <p className="text-sm text-gray-600">{selectedSupplier.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => openModal('supplier-details', selectedSupplier)}
                        className="text-orange-600 hover:text-orange-700 text-sm font-medium"
                      >
                        Détails complets
                      </button>
                    </div>
                  </div>

                  {/* Statistiques du fournisseur */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {(() => {
                      const stats = getSupplierStats(selectedSupplier.id)
                      return (
                        <>
                          <div className="bg-blue-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-blue-600 font-medium">Total Achats</p>
                            <p className="text-sm font-bold text-blue-900">{stats.totalAchats.toLocaleString()} DT</p>
                          </div>
                          <div className="bg-red-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-red-600 font-medium">Retours</p>
                            <p className="text-sm font-bold text-red-900">{stats.totalRetours.toLocaleString()} DT</p>
                          </div>
                          <div className="bg-orange-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-orange-600 font-medium">Dettes</p>
                            <p className="text-sm font-bold text-orange-900">{stats.totalDettes.toLocaleString()} DT</p>
                          </div>
                          <div className="bg-green-50 p-3 rounded-lg text-center">
                            <p className="text-xs text-green-600 font-medium">Factures</p>
                            <p className="text-sm font-bold text-green-900">{stats.totalFactures}</p>
                          </div>
                        </>
                      )
                    })()}
                  </div>
                </div>

                {/* Actions pour les factures */}
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="flex-1 min-w-0">
                    <div className="relative">
                      <Search className="w-4 h-4 absolute left-2 top-2.5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Rechercher une facture..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                      />
                    </div>
                  </div>
                  
                  <button
                    onClick={() => openModal('add', { fournisseurId: selectedSupplier.id })}
                    className="inline-flex items-center justify-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors shadow-sm text-sm flex-shrink-0"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    <span className="hidden sm:inline">Nouvelle facture</span>
                    <span className="sm:hidden">+</span>
                  </button>
                </div>

                {/* Liste des factures */}
                <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
                  {filteredFactures.length === 0 ? (
                    <div className="text-center py-12">
                      <Receipt className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune facture trouvée</h3>
                      <p className="text-gray-500">
                        {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Aucune facture pour ce fournisseur.'}
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Vue Desktop */}
                      <div className="hidden lg:block">
                        <div className="overflow-x-auto">
                          <table className="w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Facture
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Date
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Type
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Statut
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Montant TTC
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Payé
                                </th>
                                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                                  Dû
                                </th>
                                <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                                  Actions
                                </th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {filteredFactures.map((facture) => (
                                <tr key={facture.id} className="hover:bg-gray-50 transition-colors">
                                  <td className="px-3 py-3">
                                    <div className="flex items-center">
                                      <div className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                        <Receipt className="w-3 h-3 text-orange-600" />
                                      </div>
                                      <div className="ml-2 min-w-0">
                                        <div className="text-xs font-medium text-gray-900 truncate">{facture.numeroFacture}</div>
                                        <div className="text-xs text-gray-500 truncate">ID: {facture.id}</div>
                                      </div>
                                    </div>
                                  </td>
                                  
                                  <td className="px-3 py-3">
                                    <div className="text-xs text-gray-900">
                                      {new Date(facture.dateFacture).toLocaleDateString('fr-FR', { 
                                        day: '2-digit', 
                                        month: '2-digit',
                                        year: '2-digit'
                                      })}
                                    </div>
                                    <div className="text-xs text-gray-500">
                                      Éch: {new Date(facture.dateEcheance).toLocaleDateString('fr-FR', { 
                                        day: '2-digit', 
                                        month: '2-digit' 
                                      })}
                                    </div>
                                  </td>
                                  
                                  <td className="px-3 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getTypeColor(facture.type)}`}>
                                      {facture.type}
                                    </span>
                                  </td>
                                  
                                  <td className="px-3 py-3">
                                    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(facture.statut)}`}>
                                      {facture.statut}
                                    </span>
                                  </td>
                                  
                                  <td className="px-3 py-3">
                                    <div className={`text-xs font-medium ${facture.montantTTC < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                      {facture.montantTTC.toLocaleString()} DT
                                    </div>
                                  </td>

                                  <td className="px-3 py-3">
                                    <div className="text-xs font-medium text-green-600">
                                      {facture.montantPaye.toLocaleString()} DT
                                    </div>
                                  </td>

                                  <td className="px-3 py-3">
                                    <div className={`text-xs font-medium ${facture.montantDu > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                      {facture.montantDu.toLocaleString()} DT
                                    </div>
                                  </td>
                                  
                                  <td className="px-3 py-3 text-right">
                                    <div className="flex items-center justify-end space-x-1">
                                      <button
                                        onClick={() => openModal('view', facture)}
                                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                        title="Voir"
                                      >
                                        <Eye className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => openModal('edit', facture)}
                                        className="text-green-600 hover:text-green-900 p-1 rounded"
                                        title="Modifier"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      {facture.montantDu > 0 && (
                                        <button
                                          onClick={() => openModal('pay', facture)}
                                          className="text-purple-600 hover:text-purple-900 p-1 rounded"
                                          title="Payer"
                                        >
                                          <CreditCard className="w-3 h-3" />
                                        </button>
                                      )}
                                      <button
                                        onClick={() => openModal('delete', facture)}
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
                      <div className="lg:hidden">
                        {filteredFactures.map((facture) => (
                          <div key={facture.id} className="border-b border-gray-200 last:border-b-0">
                            <div className="p-3 sm:p-4">
                              <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center space-x-2 min-w-0 flex-1">
                                  <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center flex-shrink-0">
                                    <Receipt className="w-4 h-4 text-orange-600" />
                                  </div>
                                  <div className="min-w-0">
                                    <div className="font-medium text-gray-900 text-sm truncate">{facture.numeroFacture}</div>
                                    <div className="text-xs text-gray-500">
                                      {new Date(facture.dateFacture).toLocaleDateString('fr-FR')}
                                    </div>
                                  </div>
                                </div>
                                <div className="relative flex-shrink-0">
                                  <button
                                    onClick={() => toggleMobileMenu(facture.id)}
                                    className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                                  >
                                    <MoreHorizontal className="w-4 h-4" />
                                  </button>
                                  {showMobileMenu[facture.id] && (
                                    <div className="absolute right-0 top-10 w-36 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                                      <div className="py-1">
                                        <button
                                          onClick={() => openModal('view', facture)}
                                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                          <Eye className="w-3 h-3 mr-2" />
                                          Voir
                                        </button>
                                        <button
                                          onClick={() => openModal('edit', facture)}
                                          className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                        >
                                          <Edit className="w-3 h-3 mr-2" />
                                          Modifier
                                        </button>
                                        {facture.montantDu > 0 && (
                                          <button
                                            onClick={() => openModal('pay', facture)}
                                            className="w-full text-left px-3 py-2 text-xs text-purple-700 hover:bg-purple-50 flex items-center"
                                          >
                                            <CreditCard className="w-3 h-3 mr-2" />
                                            Payer
                                          </button>
                                        )}
                                        <button
                                          onClick={() => openModal('delete', facture)}
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

                              <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                                <div>
                                  <span className="text-gray-500">Type:</span>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-1 ${getTypeColor(facture.type)}`}>
                                    {facture.type}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Statut:</span>
                                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ml-1 ${getStatutColor(facture.statut)}`}>
                                    {facture.statut}
                                  </span>
                                </div>
                              </div>

                              <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                                <div>
                                  <span className="text-gray-500">Montant TTC:</span>
                                  <div className={`font-medium ${facture.montantTTC < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                                    {facture.montantTTC.toLocaleString()} DT
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Payé:</span>
                                  <div className="font-medium text-green-600">
                                    {facture.montantPaye.toLocaleString()} DT
                                  </div>
                                </div>
                                <div>
                                  <span className="text-gray-500">Dû:</span>
                                  <div className={`font-medium ${facture.montantDu > 0 ? 'text-red-600' : 'text-gray-500'}`}>
                                    {facture.montantDu.toLocaleString()} DT
                                  </div>
                                </div>
                              </div>

                              {/* Actions rapides mobiles */}
                              <div className="flex flex-wrap gap-1">
                                <button
                                  onClick={() => openModal('view', facture)}
                                  className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Voir
                                </button>
                                <button
                                  onClick={() => openModal('edit', facture)}
                                  className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                                >
                                  <Edit className="w-3 h-3 mr-1" />
                                  Modifier
                                </button>
                                {facture.montantDu > 0 && (
                                  <button
                                    onClick={() => openModal('pay', facture)}
                                    className="flex items-center px-2 py-1 bg-purple-50 text-purple-700 rounded text-xs font-medium hover:bg-purple-100 transition-colors"
                                  >
                                    <CreditCard className="w-3 h-3 mr-1" />
                                    Payer
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
                <div className="mt-3 bg-white rounded-lg p-3 lg:hidden">
                  <div className="text-xs text-gray-600 text-center">
                    {filteredFactures.length} facture{filteredFactures.length > 1 ? 's' : ''}
                  </div>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {/* Modals conditionnels */}
      {showModal && modalType === 'add' && (
        <AddInvoiceModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={() => closeModal()}
          fournisseur={selectedSupplier}
          fournisseurs={fournisseurs}
        />
      )}

      {showModal && modalType === 'view' && selectedItem && (
        <ViewInvoiceModal
          isOpen={showModal}
          onClose={closeModal}
          facture={selectedItem}
          fournisseur={fournisseurs.find(f => f.id === selectedItem.fournisseurId)}
          getStatutColor={getStatutColor}
          getTypeColor={getTypeColor}
        />
      )}

      {showModal && modalType === 'edit' && selectedItem && (
        <EditInvoiceModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={() => closeModal()}
          facture={selectedItem}
          fournisseur={fournisseurs.find(f => f.id === selectedItem.fournisseurId)}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeleteInvoiceModal
          isOpen={showModal}
          onClose={closeModal}
          onDelete={() => closeModal()}
          facture={selectedItem}
        />
      )}

      {showModal && modalType === 'pay' && selectedItem && (
        <PayInvoiceModal
          isOpen={showModal}
          onClose={closeModal}
          onPay={handlePayInvoice}
          facture={selectedItem}
          fournisseur={fournisseurs.find(f => f.id === selectedItem.fournisseurId)}
        />
      )}

      {showModal && modalType === 'supplier-details' && selectedItem && (
        <SupplierDetailsModal
          isOpen={showModal}
          onClose={closeModal}
          fournisseur={selectedItem}
          factures={getSupplierFactures(selectedItem.id)}
          stats={getSupplierStats(selectedItem.id)}
        />
      )}

      {/* Overlay pour fermer les menus mobiles */}
      {Object.values(showMobileMenu).some(Boolean) && (
        <div 
          className="fixed inset-0 z-5 lg:hidden" 
          onClick={() => setShowMobileMenu({})}
        />
      )}
    </div>
  )
}