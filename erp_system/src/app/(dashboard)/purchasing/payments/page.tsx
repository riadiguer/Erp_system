'use client'
import React, { useState } from 'react'
import Link from 'next/link'
import { 
  Search, 
  Plus, 
  Eye, 
  Edit, 
  Trash2, 
  CreditCard, 
  ArrowLeft,
  AlertTriangle,
  Building,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  MoreHorizontal
} from 'lucide-react'

// Import des composants modals (à créer séparément)
import AddPaymentModal from './components/AddPaymentModal'
import ViewPaymentModal from './components/ViewPaymentModal'
import EditPaymentModal from './components/EditPaymentModal'
import DeletePaymentModal from './components/DeletePaymentModal'
import PayDebtModal from './components/PayDebtModal'

export default function PaymentsPage() {
  const [showModal, setShowModal] = useState(false)
  const [modalType, setModalType] = useState('')
  const [selectedItem, setSelectedItem] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [showMobileMenu, setShowMobileMenu] = useState({})
  
  // Données d'exemple pour les paiements fournisseur
  const [paiements, setPaiements] = useState([
    {
      id: 'PAY001',
      numeroReference: 'PAY-2024-001',
      fournisseur: {
        id: 'F001',
        nom: 'TechSupply SARL',
        email: 'contact@techsupply.tn',
        telephone: '+216 70 123 456'
      },
      datePaiement: '2024-09-10',
      dateEcheance: '2024-09-15',
      montantDu: 5150,
      montantPaye: 5150,
      montantRestant: 0,
      statut: 'Payé',
      methodePaiement: 'Virement bancaire',
      numeroFacture: 'BC-2024-001',
      commentaires: 'Paiement effectué à temps',
      gestionnaire: 'Ahmed Benali'
    },
    {
      id: 'PAY002',
      numeroReference: 'PAY-2024-002',
      fournisseur: {
        id: 'F002',
        nom: 'Office Plus',
        email: 'commandes@officeplus.tn',
        telephone: '+216 71 456 789'
      },
      datePaiement: null,
      dateEcheance: '2024-09-20',
      montantDu: 1025,
      montantPaye: 500,
      montantRestant: 525,
      statut: 'Partiel',
      methodePaiement: 'Chèque',
      numeroFacture: 'BC-2024-002',
      commentaires: 'Paiement partiel - reste à régler',
      gestionnaire: 'Fatima Zouari'
    },
    {
      id: 'PAY003',
      numeroReference: 'PAY-2024-003',
      fournisseur: {
        id: 'F003',
        nom: 'Supplies Direct',
        email: 'orders@suppliesdirect.tn',
        telephone: '+216 72 789 123'
      },
      datePaiement: null,
      dateEcheance: '2024-09-25',
      montantDu: 1350,
      montantPaye: 0,
      montantRestant: 1350,
      statut: 'En attente',
      methodePaiement: 'Virement bancaire',
      numeroFacture: 'BC-2024-004',
      commentaires: 'Paiement en attente de validation',
      gestionnaire: 'Mohamed Trabelsi'
    },
    {
      id: 'PAY004',
      numeroReference: 'PAY-2024-004',
      fournisseur: {
        id: 'F001',
        nom: 'TechSupply SARL',
        email: 'contact@techsupply.tn',
        telephone: '+216 70 123 456'
      },
      datePaiement: null,
      dateEcheance: '2024-09-12',
      montantDu: 2800,
      montantPaye: 0,
      montantRestant: 2800,
      statut: 'En retard',
      methodePaiement: 'Virement bancaire',
      numeroFacture: 'BC-2024-005',
      commentaires: 'Paiement en retard - relance nécessaire',
      gestionnaire: 'Ahmed Benali'
    }
  ])

  const [fournisseurs] = useState([
    {
      id: 'F001',
      nom: 'TechSupply SARL',
      email: 'contact@techsupply.tn',
      telephone: '+216 70 123 456',
      adresse: 'Zone Industrielle, Sfax',
      totalDettes: 2800,
      derniereFacture: '2024-09-14'
    },
    {
      id: 'F002',
      nom: 'Office Plus',
      email: 'commandes@officeplus.tn',
      telephone: '+216 71 456 789',
      adresse: 'Avenue Habib Bourguiba, Tunis',
      totalDettes: 525,
      derniereFacture: '2024-09-12'
    },
    {
      id: 'F003',
      nom: 'Supplies Direct',
      email: 'orders@suppliesdirect.tn',
      telephone: '+216 72 789 123',
      adresse: 'Route de Sousse, Monastir',
      totalDettes: 1350,
      derniereFacture: '2024-09-14'
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

  const handleAddPaiement = (formData) => {
    const newPaiement = {
      id: `PAY${String(paiements.length + 1).padStart(3, '0')}`,
      numeroReference: `PAY-2024-${String(paiements.length + 1).padStart(3, '0')}`,
      ...formData,
      datePaiement: formData.statut === 'Payé' ? new Date().toISOString().split('T')[0] : null
    }
    setPaiements([...paiements, newPaiement])
    closeModal()
  }

  const handleEditPaiement = (formData) => {
    setPaiements(paiements.map(p => 
      p.id === selectedItem.id ? { ...p, ...formData } : p
    ))
    closeModal()
  }

  const handleDeletePaiement = (id) => {
    setPaiements(paiements.filter(p => p.id !== id))
    closeModal()
  }

  const handlePayDebt = (id, paymentData) => {
    setPaiements(paiements.map(p => 
      p.id === id ? { 
        ...p, 
        datePaiement: new Date().toISOString().split('T')[0],
        montantPaye: p.montantPaye + paymentData.montant,
        montantRestant: p.montantRestant - paymentData.montant,
        statut: p.montantRestant - paymentData.montant === 0 ? 'Payé' : 'Partiel',
        methodePaiement: paymentData.methodePaiement,
        commentaires: paymentData.commentaires
      } : p
    ))
    closeModal()
  }

  const filteredPaiements = paiements.filter(paiement =>
    paiement.numeroReference.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paiement.fournisseur.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paiement.statut.toLowerCase().includes(searchTerm.toLowerCase()) ||
    paiement.numeroFacture.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatutColor = (statut) => {
    switch (statut) {
      case 'Payé': return 'text-green-700 bg-green-100 border-green-200'
      case 'Partiel': return 'text-yellow-700 bg-yellow-100 border-yellow-200'
      case 'En attente': return 'text-blue-700 bg-blue-100 border-blue-200'
      case 'En retard': return 'text-red-700 bg-red-100 border-red-200'
      case 'Annulé': return 'text-gray-700 bg-gray-100 border-gray-200'
      default: return 'text-gray-700 bg-gray-100 border-gray-200'
    }
  }

  const getTotalDettes = () => {
    return paiements.reduce((total, p) => total + p.montantRestant, 0)
  }

  const getTotalPaye = () => {
    return paiements.reduce((total, p) => total + p.montantPaye, 0)
  }

  const canPay = (statut) => {
    return statut === 'En attente' || statut === 'Partiel' || statut === 'En retard'
  }

  const isOverdue = (dateEcheance, statut) => {
    if (statut === 'Payé') return false
    return new Date(dateEcheance) < new Date()
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
                <div className="p-1.5 bg-indigo-100 rounded-lg flex-shrink-0">
                  <CreditCard className="w-4 h-4 sm:w-5 sm:h-5 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-base sm:text-xl lg:text-2xl font-bold text-gray-900 truncate">Paiements Fournisseur</h1>
                  <p className="text-xs text-gray-600 hidden sm:block truncate">Gestion des paiements et dettes</p>
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
              <div className="p-1.5 sm:p-2 rounded-full bg-indigo-100 flex-shrink-0">
                <CreditCard className="w-3 h-3 sm:w-5 sm:h-5 text-indigo-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total paiements</p>
                <p className="text-sm sm:text-lg font-bold text-gray-900">{paiements.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-red-100 flex-shrink-0">
                <AlertTriangle className="w-3 h-3 sm:w-5 sm:h-5 text-red-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Dettes totales</p>
                <p className="text-sm sm:text-lg font-bold text-red-600">{getTotalDettes().toLocaleString()} DT</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-green-100 flex-shrink-0">
                <CheckCircle className="w-3 h-3 sm:w-5 sm:h-5 text-green-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">Total payé</p>
                <p className="text-sm sm:text-lg font-bold text-green-600">{getTotalPaye().toLocaleString()} DT</p>
              </div>
            </div>
          </div>

          <div className="bg-white p-2 sm:p-4 rounded-lg shadow-sm border border-gray-200 col-span-2 lg:col-span-1">
            <div className="flex items-center">
              <div className="p-1.5 sm:p-2 rounded-full bg-orange-100 flex-shrink-0">
                <Clock className="w-3 h-3 sm:w-5 sm:h-5 text-orange-600" />
              </div>
              <div className="ml-2 min-w-0">
                <p className="text-xs font-medium text-gray-600 truncate">En retard</p>
                <p className="text-sm sm:text-lg font-bold text-orange-600">
                  {paiements.filter(p => p.statut === 'En retard').length}
                </p>
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
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>
          
          <button
            onClick={() => openModal('add')}
            className="inline-flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm text-sm flex-shrink-0"
          >
            <Plus className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Nouveau paiement</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>

        {/* Liste des paiements */}
        <div className="bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          {filteredPaiements.length === 0 ? (
            <div className="text-center py-12">
              <CreditCard className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun paiement trouvé</h3>
              <p className="text-gray-500">
                {searchTerm ? 'Essayez de modifier vos critères de recherche.' : 'Commencez par ajouter votre premier paiement.'}
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
                          Référence
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Fournisseur
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Échéance
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Montant dû
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Reste
                        </th>
                        <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">
                          Statut
                        </th>
                        <th className="px-3 py-2 text-right text-xs font-medium text-gray-500 uppercase">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredPaiements.map((paiement) => (
                        <tr key={paiement.id} className="hover:bg-gray-50 transition-colors">
                          <td className="px-3 py-3">
                            <div className="flex items-center">
                              <div className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-medium text-indigo-600">
                                  {paiement.numeroReference.slice(-2)}
                                </span>
                              </div>
                              <div className="ml-2 min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{paiement.numeroReference}</div>
                                <div className="text-xs text-gray-500 truncate">Facture: {paiement.numeroFacture}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="flex items-center min-w-0">
                              <Building className="w-3 h-3 text-gray-400 mr-1 flex-shrink-0" />
                              <div className="min-w-0">
                                <div className="text-xs font-medium text-gray-900 truncate">{paiement.fournisseur.nom}</div>
                                <div className="text-xs text-gray-500 truncate">{paiement.fournisseur.id}</div>
                              </div>
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className={`text-xs ${isOverdue(paiement.dateEcheance, paiement.statut) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                              {new Date(paiement.dateEcheance).toLocaleDateString('fr-FR', { 
                                day: '2-digit', 
                                month: '2-digit' 
                              })}
                              {isOverdue(paiement.dateEcheance, paiement.statut) && (
                                <div className="text-xs text-red-500">En retard</div>
                              )}
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <div className="text-xs font-medium text-gray-900">
                              {paiement.montantDu.toLocaleString()} DT
                            </div>
                          </td>

                          <td className="px-3 py-3">
                            <div className={`text-xs font-medium ${paiement.montantRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                              {paiement.montantRestant.toLocaleString()} DT
                            </div>
                          </td>
                          
                          <td className="px-3 py-3">
                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(paiement.statut)}`}>
                              {paiement.statut}
                            </span>
                          </td>
                          
                          <td className="px-3 py-3 text-right">
                            <div className="flex items-center justify-end space-x-1">
                              <button
                                onClick={() => openModal('view', paiement)}
                                className="text-blue-600 hover:text-blue-900 p-1 rounded"
                                title="Voir"
                              >
                                <Eye className="w-3 h-3" />
                              </button>
                              <button
                                onClick={() => openModal('edit', paiement)}
                                className="text-green-600 hover:text-green-900 p-1 rounded"
                                title="Modifier"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                              {canPay(paiement.statut) && (
                                <button
                                  onClick={() => openModal('pay', paiement)}
                                  className="text-indigo-600 hover:text-indigo-900 p-1 rounded"
                                  title="Payer"
                                >
                                  <CreditCard className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={() => openModal('delete', paiement)}
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
                {filteredPaiements.map((paiement) => (
                  <div key={paiement.id} className="border-b border-gray-200 last:border-b-0">
                    <div className="p-3 sm:p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center space-x-2 min-w-0 flex-1">
                          <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-medium text-indigo-600">
                              {paiement.numeroReference.slice(-2)}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium text-gray-900 text-sm truncate">{paiement.numeroReference}</div>
                            <div className="text-xs text-gray-500 truncate">{paiement.fournisseur.nom}</div>
                          </div>
                        </div>
                        <div className="relative flex-shrink-0">
                          <button
                            onClick={() => toggleMobileMenu(paiement.id)}
                            className="p-2 text-gray-400 hover:text-gray-600 rounded-full"
                          >
                            <MoreHorizontal className="w-4 h-4" />
                          </button>
                          {showMobileMenu[paiement.id] && (
                            <div className="absolute right-0 top-10 w-40 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
                              <div className="py-1">
                                <button
                                  onClick={() => openModal('view', paiement)}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Eye className="w-3 h-3 mr-2" />
                                  Voir
                                </button>
                                <button
                                  onClick={() => openModal('edit', paiement)}
                                  className="w-full text-left px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 flex items-center"
                                >
                                  <Edit className="w-3 h-3 mr-2" />
                                  Modifier
                                </button>
                                {canPay(paiement.statut) && (
                                  <button
                                    onClick={() => openModal('pay', paiement)}
                                    className="w-full text-left px-3 py-2 text-xs text-indigo-700 hover:bg-indigo-50 flex items-center"
                                  >
                                    <CreditCard className="w-3 h-3 mr-2" />
                                    Payer
                                  </button>
                                )}
                                <button
                                  onClick={() => openModal('delete', paiement)}
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
                          <span className="text-gray-500">Échéance:</span>
                          <div className={`font-medium ${isOverdue(paiement.dateEcheance, paiement.statut) ? 'text-red-600' : 'text-gray-900'}`}>
                            {new Date(paiement.dateEcheance).toLocaleDateString('fr-FR', { 
                              day: '2-digit', 
                              month: '2-digit' 
                            })}
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Montant dû:</span>
                          <div className="font-medium text-gray-900">
                            {paiement.montantDu.toLocaleString()} DT
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Reste:</span>
                          <div className={`font-medium ${paiement.montantRestant > 0 ? 'text-red-600' : 'text-green-600'}`}>
                            {paiement.montantRestant.toLocaleString()} DT
                          </div>
                        </div>
                        <div>
                          <span className="text-gray-500">Statut:</span>
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatutColor(paiement.statut)} mt-1`}>
                            {paiement.statut}
                          </span>
                        </div>
                      </div>

                      {/* Actions rapides mobiles */}
                      <div className="mt-3 flex flex-wrap gap-1">
                        <button
                          onClick={() => openModal('view', paiement)}
                          className="flex items-center px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium hover:bg-blue-100 transition-colors"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Voir
                        </button>
                        <button
                          onClick={() => openModal('edit', paiement)}
                          className="flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs font-medium hover:bg-green-100 transition-colors"
                        >
                          <Edit className="w-3 h-3 mr-1" />
                          Modifier
                        </button>
                        {canPay(paiement.statut) && (
                          <button
                            onClick={() => openModal('pay', paiement)}
                            className="flex items-center px-2 py-1 bg-indigo-50 text-indigo-700 rounded text-xs font-medium hover:bg-indigo-100 transition-colors"
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

        {/* Section Dettes par Fournisseur */}
        <div className="mt-6 bg-white shadow-sm rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900 flex items-center">
              <Building className="w-5 h-5 mr-2 text-gray-600" />
              Dettes par fournisseur
            </h3>
          </div>
          
          <div className="p-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {fournisseurs.map((fournisseur) => (
                <div key={fournisseur.id} className="bg-gray-50 rounded-lg p-4 border">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                        <Building className="w-4 h-4 text-indigo-600" />
                      </div>
                      <div>
                        <h4 className="font-medium text-gray-900 text-sm">{fournisseur.nom}</h4>
                        <p className="text-xs text-gray-500">{fournisseur.id}</p>
                      </div>
                    </div>
                    <div className={`text-right ${fournisseur.totalDettes > 0 ? 'text-red-600' : 'text-green-600'}`}>
                      <div className="text-lg font-bold">
                        {fournisseur.totalDettes.toLocaleString()} DT
                      </div>
                      <div className="text-xs">
                        {fournisseur.totalDettes > 0 ? 'À payer' : 'Soldé'}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-xs text-gray-600 mb-3">
                    <div>Email: {fournisseur.email}</div>
                    <div>Dernière facture: {new Date(fournisseur.derniereFacture).toLocaleDateString('fr-FR')}</div>
                  </div>

                  {fournisseur.totalDettes > 0 && (
                    <button
                      onClick={() => openModal('pay', { fournisseur, montantRestant: fournisseur.totalDettes })}
                      className="w-full flex items-center justify-center px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-xs"
                    >
                      <CreditCard className="w-3 h-3 mr-1" />
                      Payer dette
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Résumé pour mobile */}
        <div className="mt-3 bg-white rounded-lg p-3 xl:hidden">
          <div className="text-xs text-gray-600 text-center">
            {filteredPaiements.length} paiement{filteredPaiements.length > 1 ? 's' : ''}
            {filteredPaiements.length > 0 && (
              <> • Dettes: {getTotalDettes().toLocaleString()} DT</>
            )}
          </div>
        </div>
      </div>

      {/* Modals conditionnels */}
      {showModal && modalType === 'add' && (
        <AddPaymentModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleAddPaiement}
          fournisseurs={fournisseurs}
        />
      )}

      {showModal && modalType === 'view' && selectedItem && (
        <ViewPaymentModal
          isOpen={showModal}
          onClose={closeModal}
          paiement={selectedItem}
          getStatutColor={getStatutColor}
        />
      )}

      {showModal && modalType === 'edit' && selectedItem && (
        <EditPaymentModal
          isOpen={showModal}
          onClose={closeModal}
          onSave={handleEditPaiement}
          paiement={selectedItem}
          fournisseurs={fournisseurs}
        />
      )}

      {showModal && modalType === 'pay' && selectedItem && (
        <PayDebtModal
          isOpen={showModal}
          onClose={closeModal}
          onPay={handlePayDebt}
          item={selectedItem}
        />
      )}

      {showModal && modalType === 'delete' && selectedItem && (
        <DeletePaymentModal
          isOpen={showModal}
          onClose={closeModal}
          onDelete={handleDeletePaiement}
          paiement={selectedItem}
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