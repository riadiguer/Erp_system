'use client'
import React, { useState } from 'react'
import { 
  X, 
  Building, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  Receipt, 
  Package, 
  CreditCard,
  FileText,
  Activity,
  BarChart3,
  PieChart,
  Eye,
  Download,
  Filter
} from 'lucide-react'

interface SupplierDetailsModalProps {
  isOpen: boolean
  onClose: () => void
  fournisseur: {
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
    dateCreation: string
    statut: string
    totalAchats: number
    totalFactures: number
    totalDettes: number
    dernierAchat: string
  }
  factures: Array<{
    id: string
    numeroFacture: string
    dateFacture: string
    dateEcheance: string
    type: string
    statut: string
    montantHT: number
    montantTTC: number
    montantPaye: number
    montantDu: number
    produits: Array<{
      nom: string
      quantite: number
      prixUnitaire: number
    }>
    commentaires: string
  }>
  stats: {
    totalFactures: number
    totalAchats: number
    totalRetours: number
    totalDettes: number
    facturesEnRetard: number
  }
}

export default function SupplierDetailsModal({ 
  isOpen, 
  onClose, 
  fournisseur, 
  factures, 
  stats 
}: SupplierDetailsModalProps) {
  const [activeTab, setActiveTab] = useState('overview')
  const [dateFilter, setDateFilter] = useState('all')

  if (!isOpen || !fournisseur) return null

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-TN', {
      style: 'currency',
      currency: 'TND',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const getMonthlyData = () => {
    const monthlyStats = {}
    factures.forEach(facture => {
      const month = new Date(facture.dateFacture).toLocaleDateString('fr-FR', { 
        year: 'numeric', 
        month: 'short' 
      })
      if (!monthlyStats[month]) {
        monthlyStats[month] = { achats: 0, retours: 0, factures: 0 }
      }
      
      if (facture.type === 'Achat') {
        monthlyStats[month].achats += facture.montantTTC
      } else if (facture.type === 'Retour') {
        monthlyStats[month].retours += Math.abs(facture.montantTTC)
      }
      monthlyStats[month].factures += 1
    })
    return monthlyStats
  }

  const getFilteredFactures = () => {
    if (dateFilter === 'all') return factures
    
    const now = new Date()
    const filterDate = new Date()
    
    switch (dateFilter) {
      case '30d':
        filterDate.setDate(now.getDate() - 30)
        break
      case '90d':
        filterDate.setDate(now.getDate() - 90)
        break
      case '1y':
        filterDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return factures
    }
    
    return factures.filter(f => new Date(f.dateFacture) >= filterDate)
  }

  const getPerformanceIndicators = () => {
    const totalFactures = factures.length
    const facturesPayees = factures.filter(f => f.statut === 'Payée').length
    const facturesEnRetard = factures.filter(f => f.statut === 'En retard').length
    const tauxPaiement = totalFactures > 0 ? (facturesPayees / totalFactures) * 100 : 0
    
    const moyenneMontant = totalFactures > 0 
      ? factures.reduce((sum, f) => sum + f.montantTTC, 0) / totalFactures 
      : 0
    
    return {
      tauxPaiement: tauxPaiement.toFixed(1),
      facturesPayees,
      facturesEnRetard,
      moyenneMontant,
      delaiMoyenPaiement: '15 jours' // À calculer selon vos besoins
    }
  }

  const performance = getPerformanceIndicators()
  const monthlyData = getMonthlyData()

  const tabs = [
    { id: 'overview', label: 'Vue d\'ensemble', icon: Activity },
    { id: 'finances', label: 'Finances', icon: DollarSign },
    { id: 'history', label: 'Historique', icon: FileText },
    { id: 'analytics', label: 'Analyses', icon: BarChart3 }
  ]

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-6xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 rounded-t-xl z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-orange-100 rounded-full">
                <Building className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">{fournisseur.nom}</h2>
                <p className="text-sm text-gray-600">Détails complets du fournisseur</p>
              </div>
            </div>
            <button 
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation Tabs */}
          <div className="mt-4 border-b border-gray-200">
            <nav className="flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`${
                      activeTab === tab.id
                        ? 'border-orange-500 text-orange-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    } whitespace-nowrap py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6">
          
          {/* Vue d'ensemble */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Informations de base */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Building className="w-5 h-5 mr-2 text-gray-600" />
                    Informations de contact
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center text-gray-700">
                      <Mail className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="font-medium">Email:</span>
                      <span className="ml-2">{fournisseur.email}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Phone className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="font-medium">Téléphone:</span>
                      <span className="ml-2">{fournisseur.telephone}</span>
                    </div>
                    <div className="flex items-start text-gray-700">
                      <MapPin className="w-4 h-4 mr-3 text-gray-400 mt-0.5" />
                      <span className="font-medium">Adresse:</span>
                      <span className="ml-2">{fournisseur.adresse}</span>
                    </div>
                    <div className="flex items-center text-gray-700">
                      <Calendar className="w-4 h-4 mr-3 text-gray-400" />
                      <span className="font-medium">Client depuis:</span>
                      <span className="ml-2">{formatDate(fournisseur.dateCreation)}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-orange-50 rounded-xl p-6 border border-orange-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <Activity className="w-5 h-5 mr-2 text-orange-600" />
                    Statut et performance
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Statut:</span>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        fournisseur.statut === 'Actif' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-gray-100 text-gray-800'
                      }`}>
                        {fournisseur.statut}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Taux de paiement:</span>
                      <span className="font-semibold text-green-600">{performance.tauxPaiement}%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Dernier achat:</span>
                      <span className="font-medium text-gray-900">
                        {formatDate(fournisseur.dernierAchat)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-gray-700">Délai moyen paiement:</span>
                      <span className="font-medium text-blue-600">{performance.delaiMoyenPaiement}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Statistiques rapides */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                    <Receipt className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{stats.totalFactures}</p>
                  <p className="text-sm text-gray-600">Factures totales</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(stats.totalAchats)}</p>
                  <p className="text-sm text-gray-600">Total achats</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="p-3 bg-red-100 rounded-full w-fit mx-auto mb-3">
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  </div>
                  <p className="text-2xl font-bold text-red-600">{formatCurrency(stats.totalRetours)}</p>
                  <p className="text-sm text-gray-600">Total retours</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                    <AlertTriangle className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">{formatCurrency(stats.totalDettes)}</p>
                  <p className="text-sm text-gray-600">Dettes en cours</p>
                </div>
              </div>

              {/* Alertes */}
              {stats.facturesEnRetard > 0 && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <div className="flex items-center">
                    <AlertTriangle className="w-5 h-5 text-red-600 mr-3" />
                    <div>
                      <h4 className="font-semibold text-red-900">Attention : Factures en retard</h4>
                      <p className="text-sm text-red-700">
                        {stats.facturesEnRetard} facture{stats.facturesEnRetard > 1 ? 's' : ''} en retard de paiement nécessite{stats.facturesEnRetard > 1 ? 'nt' : ''} une action.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Finances */}
          {activeTab === 'finances' && (
            <div className="space-y-6">
              
              {/* Résumé financier */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Résumé financier</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-blue-900">Chiffre d'affaires</h4>
                        <TrendingUp className="w-5 h-5 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-900">{formatCurrency(stats.totalAchats)}</p>
                      <p className="text-sm text-blue-700">Total des achats effectués</p>
                    </div>
                    <div className="bg-gradient-to-br from-red-50 to-red-100 rounded-xl p-6 border border-red-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-red-900">Retours</h4>
                        <TrendingDown className="w-5 h-5 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-red-900">{formatCurrency(stats.totalRetours)}</p>
                      <p className="text-sm text-red-700">Valeur des retours</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-green-900">Montant moyen</h4>
                        <BarChart3 className="w-5 h-5 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-900">{formatCurrency(performance.moyenneMontant)}</p>
                      <p className="text-sm text-green-700">Par facture</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-6 border border-orange-200">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-semibold text-orange-900">En attente</h4>
                        <CreditCard className="w-5 h-5 text-orange-600" />
                      </div>
                      <p className="text-2xl font-bold text-orange-900">{formatCurrency(stats.totalDettes)}</p>
                      <p className="text-sm text-orange-700">Montants à payer</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-xl p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                    <PieChart className="w-5 h-5 mr-2" />
                    Répartition
                  </h3>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Factures payées</span>
                        <span className="text-sm font-medium">{performance.facturesPayees}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full" 
                          style={{ width: `${performance.tauxPaiement}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">En retard</span>
                        <span className="text-sm font-medium text-red-600">{performance.facturesEnRetard}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-red-500 h-2 rounded-full" 
                          style={{ width: `${(performance.facturesEnRetard / stats.totalFactures) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between mb-2">
                        <span className="text-sm text-gray-600">Taux de retour</span>
                        <span className="text-sm font-medium">
                          {((stats.totalRetours / stats.totalAchats) * 100).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-orange-500 h-2 rounded-full" 
                          style={{ width: `${(stats.totalRetours / stats.totalAchats) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Évolution mensuelle */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Évolution mensuelle</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
                  {Object.entries(monthlyData).map(([month, data]) => (
                    <div key={month} className="text-center p-4 bg-gray-50 rounded-lg">
                      <p className="text-xs text-gray-600 mb-2">{month}</p>
                      <p className="text-sm font-bold text-blue-600">{formatCurrency(data.achats)}</p>
                      <p className="text-xs text-gray-500">{data.factures} facture{data.factures > 1 ? 's' : ''}</p>
                      {data.retours > 0 && (
                        <p className="text-xs text-red-600">-{formatCurrency(data.retours)}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Historique */}
          {activeTab === 'history' && (
            <div className="space-y-6">
              
              {/* Filtres */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <h3 className="text-lg font-semibold text-gray-900">Historique des transactions</h3>
                <div className="flex items-center space-x-3">
                  <Filter className="w-4 h-4 text-gray-400" />
                  <select
                    value={dateFilter}
                    onChange={(e) => setDateFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="all">Toutes les périodes</option>
                    <option value="30d">30 derniers jours</option>
                    <option value="90d">90 derniers jours</option>
                    <option value="1y">Dernière année</option>
                  </select>
                  <button className="flex items-center px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm">
                    <Download className="w-4 h-4 mr-2" />
                    Exporter
                  </button>
                </div>
              </div>

              {/* Timeline des factures */}
              <div className="space-y-4">
                {getFilteredFactures().map((facture, index) => (
                  <div key={facture.id} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between">
                      <div className="flex items-start space-x-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          facture.type === 'Achat' ? 'bg-blue-100' :
                          facture.type === 'Retour' ? 'bg-red-100' : 'bg-green-100'
                        }`}>
                          {facture.type === 'Achat' ? (
                            <Package className="w-5 h-5 text-blue-600" />
                          ) : facture.type === 'Retour' ? (
                            <TrendingDown className="w-5 h-5 text-red-600" />
                          ) : (
                            <TrendingUp className="w-5 h-5 text-green-600" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-gray-900">{facture.numeroFacture}</h4>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              facture.type === 'Achat' ? 'bg-blue-100 text-blue-800' :
                              facture.type === 'Retour' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                            }`}>
                              {facture.type}
                            </span>
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              facture.statut === 'Payée' ? 'bg-green-100 text-green-800' :
                              facture.statut === 'En retard' ? 'bg-red-100 text-red-800' :
                              'bg-orange-100 text-orange-800'
                            }`}>
                              {facture.statut}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600">{formatDate(facture.dateFacture)}</p>
                          <p className="text-xs text-gray-500 mt-1">{facture.commentaires}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-lg font-bold ${facture.montantTTC < 0 ? 'text-red-600' : 'text-gray-900'}`}>
                          {formatCurrency(facture.montantTTC)}
                        </p>
                        {facture.montantDu > 0 && (
                          <p className="text-sm text-red-600">Dû: {formatCurrency(facture.montantDu)}</p>
                        )}
                        <button className="mt-2 text-xs text-orange-600 hover:text-orange-700 flex items-center">
                          <Eye className="w-3 h-3 mr-1" />
                          Détails
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {getFilteredFactures().length === 0 && (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">Aucune facture trouvée pour cette période</p>
                </div>
              )}
            </div>
          )}

          {/* Analyses */}
          {activeTab === 'analytics' && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold text-gray-900">Analyses et tendances</h3>
              
              {/* Indicateurs de performance */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="p-3 bg-blue-100 rounded-full w-fit mx-auto mb-3">
                    <Activity className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{performance.tauxPaiement}%</p>
                  <p className="text-sm text-gray-600">Taux de paiement</p>
                  <p className="text-xs text-gray-500 mt-1">Excellent performance</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="p-3 bg-green-100 rounded-full w-fit mx-auto mb-3">
                    <Calendar className="w-6 h-6 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">15j</p>
                  <p className="text-sm text-gray-600">Délai moyen</p>
                  <p className="text-xs text-gray-500 mt-1">Dans les temps</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="p-3 bg-orange-100 rounded-full w-fit mx-auto mb-3">
                    <TrendingUp className="w-6 h-6 text-orange-600" />
                  </div>
                  <p className="text-2xl font-bold text-orange-600">
                    {((stats.totalRetours / stats.totalAchats) * 100).toFixed(1)}%
                  </p>
                  <p className="text-sm text-gray-600">Taux de retour</p>
                  <p className="text-xs text-gray-500 mt-1">Acceptable</p>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-6 text-center">
                  <div className="p-3 bg-purple-100 rounded-full w-fit mx-auto mb-3">
                    <BarChart3 className="w-6 h-6 text-purple-600" />
                  </div>
                  <p className="text-2xl font-bold text-purple-600">{formatCurrency(performance.moyenneMontant)}</p>
                  <p className="text-sm text-gray-600">Montant moyen</p>
                  <p className="text-xs text-gray-500 mt-1">Par transaction</p>
                </div>
              </div>

              {/* Analyse des tendances */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                    Tendances positives
                  </h4>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-green-50 rounded-lg">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-green-900">Paiements réguliers</p>
                        <p className="text-xs text-green-700">Taux de paiement de {performance.tauxPaiement}%</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-blue-50 rounded-lg">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Relation stable</p>
                        <p className="text-xs text-blue-700">Partenaire depuis {new Date().getFullYear() - new Date(fournisseur.dateCreation).getFullYear()} ans</p>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-purple-50 rounded-lg">
                      <div className="w-2 h-2 bg-purple-500 rounded-full mr-3"></div>
                      <div>
                        <p className="text-sm font-medium text-purple-900">Volume croissant</p>
                        <p className="text-xs text-purple-700">Augmentation des commandes</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white border border-gray-200 rounded-xl p-6">
                  <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                    <AlertTriangle className="w-5 h-5 mr-2 text-orange-600" />
                    Points d'attention
                  </h4>
                  <div className="space-y-3">
                    {stats.facturesEnRetard > 0 && (
                      <div className="flex items-center p-3 bg-red-50 rounded-lg">
                        <div className="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-red-900">Retards de paiement</p>
                          <p className="text-xs text-red-700">{stats.facturesEnRetard} facture{stats.facturesEnRetard > 1 ? 's' : ''} en retard</p>
                        </div>
                      </div>
                    )}
                    {stats.totalDettes > 0 && (
                      <div className="flex items-center p-3 bg-orange-50 rounded-lg">
                        <div className="w-2 h-2 bg-orange-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-orange-900">Dettes en cours</p>
                          <p className="text-xs text-orange-700">{formatCurrency(stats.totalDettes)} à régler</p>
                        </div>
                      </div>
                    )}
                    {stats.totalRetours > 0 && (
                      <div className="flex items-center p-3 bg-yellow-50 rounded-lg">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-yellow-900">Retours produits</p>
                          <p className="text-xs text-yellow-700">{formatCurrency(stats.totalRetours)} de retours</p>
                        </div>
                      </div>
                    )}
                    {stats.facturesEnRetard === 0 && stats.totalDettes === 0 && stats.totalRetours === 0 && (
                      <div className="flex items-center p-3 bg-green-50 rounded-lg">
                        <div className="w-2 h-2 bg-green-500 rounded-full mr-3"></div>
                        <div>
                          <p className="text-sm font-medium text-green-900">Aucun problème détecté</p>
                          <p className="text-xs text-green-700">Fournisseur exemplaire</p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recommandations */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold text-blue-900 mb-4 flex items-center">
                  <Activity className="w-5 h-5 mr-2" />
                  Recommandations
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Actions prioritaires</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      {stats.facturesEnRetard > 0 && (
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-red-500 rounded-full mr-2"></div>
                          Relancer les paiements en retard
                        </li>
                      )}
                      {stats.totalDettes > 0 && (
                        <li className="flex items-center">
                          <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mr-2"></div>
                          Négocier un échéancier de paiement
                        </li>
                      )}
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mr-2"></div>
                        Maintenir la relation commerciale
                      </li>
                    </ul>
                  </div>
                  <div className="bg-white rounded-lg p-4">
                    <h5 className="font-medium text-gray-900 mb-2">Opportunités</h5>
                    <ul className="text-sm text-gray-700 space-y-1">
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-green-500 rounded-full mr-2"></div>
                        Négocier de meilleures conditions
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mr-2"></div>
                        Étendre la gamme de produits
                      </li>
                      <li className="flex items-center">
                        <div className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></div>
                        Optimiser les délais de livraison
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Score de performance */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h4 className="font-semibold text-gray-900 mb-4 flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Score de performance fournisseur
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-green-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray={`${performance.tauxPaiement}, 100`}
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-green-600">{performance.tauxPaiement}%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Fiabilité</p>
                    <p className="text-xs text-gray-500">Paiements à temps</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-blue-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="85, 100"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-blue-600">85%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Qualité</p>
                    <p className="text-xs text-gray-500">Produits conformes</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-purple-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="78, 100"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-600">78%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Livraison</p>
                    <p className="text-xs text-gray-500">Respect des délais</p>
                  </div>

                  <div className="text-center">
                    <div className="relative w-20 h-20 mx-auto mb-3">
                      <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-gray-200"
                          stroke="currentColor"
                          strokeWidth="3"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                        <path
                          className="text-orange-500"
                          stroke="currentColor"
                          strokeWidth="3"
                          strokeDasharray="82, 100"
                          strokeLinecap="round"
                          fill="none"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-lg font-bold text-orange-600">82%</span>
                      </div>
                    </div>
                    <p className="text-sm font-medium text-gray-900">Global</p>
                    <p className="text-xs text-gray-500">Score général</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 rounded-b-xl">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Dernière mise à jour: {formatDate(new Date().toISOString())}
            </div>
            <div className="flex space-x-3">
              <button
                onClick={() => {/* Logique d'export */}}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center"
              >
                <Download className="w-4 h-4 mr-2" />
                Exporter rapport
              </button>
              <button
                onClick={onClose}
                className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}