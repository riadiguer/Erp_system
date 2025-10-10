'use client'
import React from 'react'
import { 
  X, 
  Eye, 
  Receipt, 
  Calendar, 
  Building, 
  DollarSign, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  FileText,
  Package,
  CreditCard,
  TrendingUp,
  TrendingDown,
  Mail,
  Phone,
  MapPin,
  Calculator
} from 'lucide-react'

interface ViewInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  facture: {
    id: string
    numeroFacture: string
    fournisseurId: string
    dateFacture: string
    dateEcheance: string
    type: 'Achat' | 'Retour' | 'Avoir'
    statut: 'Payée' | 'En attente' | 'En retard' | 'Traitée' | 'Annulée'
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
  }
  fournisseur: {
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
    statut: string
  }
  getStatutColor: (statut: string) => string
  getTypeColor: (type: string) => string
}

export default function ViewInvoiceModal({ 
  isOpen, 
  onClose, 
  facture, 
  fournisseur,
  getStatutColor, 
  getTypeColor 
}: ViewInvoiceModalProps) {
  if (!isOpen || !facture || !fournisseur) return null

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const formatDateShort = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR')
  }

  const isOverdue = () => {
    return new Date(facture.dateEcheance) < new Date() && facture.montantDu > 0
  }

  const getDaysUntilDue = () => {
    const today = new Date()
    const dueDate = new Date(facture.dateEcheance)
    const diffTime = dueDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getTotalQuantity = () => {
    return facture.produits.reduce((total, produit) => total + Math.abs(produit.quantite), 0)
  }

  const getTVA = () => {
    return facture.montantTTC - facture.montantHT
  }

  const getPaymentPercentage = () => {
    if (facture.montantTTC === 0) return 0
    return Math.round((Math.abs(facture.montantPaye) / Math.abs(facture.montantTTC)) * 100)
  }

  const getTypeIcon = () => {
    switch (facture.type) {
      case 'Achat': return <TrendingUp className="w-5 h-5" />
      case 'Retour': return <TrendingDown className="w-5 h-5" />
      case 'Avoir': return <CheckCircle className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getStatutIcon = () => {
    switch (facture.statut) {
      case 'Payée': return <CheckCircle className="w-5 h-5 text-green-600" />
      case 'En attente': return <Clock className="w-5 h-5 text-orange-600" />
      case 'En retard': return <AlertTriangle className="w-5 h-5 text-red-600" />
      case 'Traitée': return <CheckCircle className="w-5 h-5 text-blue-600" />
      case 'Annulée': return <X className="w-5 h-5 text-gray-600" />
      default: return <FileText className="w-5 h-5 text-gray-600" />
    }
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-orange-500 rounded-xl">
              <Eye className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Détails de la facture</h3>
              <p className="text-sm text-gray-600">Consultation complète de la facture fournisseur</p>
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
          
          {/* En-tête de la facture */}
          <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-xl">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Receipt className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Numéro de facture</span>
                </div>
                <p className="text-2xl font-bold text-gray-900">{facture.numeroFacture}</p>
                <p className="text-xs text-gray-500">ID: {facture.id}</p>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Date de facture</span>
                </div>
                <p className="text-lg font-semibold text-gray-900">
                  {formatDateShort(facture.dateFacture)}
                </p>
                <p className="text-xs text-gray-500">{formatDate(facture.dateFacture)}</p>
              </div>

              <div className="bg-white p-4 rounded-lg shadow-sm">
                <div className="flex items-center space-x-3 mb-2">
                  <Calendar className="w-5 h-5 text-orange-600" />
                  <span className="text-sm font-medium text-gray-600">Date d'échéance</span>
                </div>
                <p className={`text-lg font-semibold ${isOverdue() ? 'text-red-600' : 'text-gray-900'}`}>
                  {formatDateShort(facture.dateEcheance)}
                </p>
                {isOverdue() ? (
                  <p className="text-xs text-red-600 font-medium">En retard de {Math.abs(getDaysUntilDue())} jours</p>
                ) : (
                  <p className="text-xs text-gray-500">
                    {getDaysUntilDue() > 0 ? `Dans ${getDaysUntilDue()} jours` : 'Échue'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Informations fournisseur */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500 rounded-lg">
                <Building className="w-5 h-5 text-white" />
              </div>
              <h4 className="text-xl font-bold text-gray-900">Informations fournisseur</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Building className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Raison sociale:</span>
                    <p className="text-base font-bold text-gray-900">{fournisseur.nom}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-600">ID Fournisseur:</span>
                    <p className="text-base text-gray-900">{fournisseur.id}</p>
                  </div>
                  <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                    fournisseur.statut === 'Actif' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {fournisseur.statut}
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Mail className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Email:</span>
                    <p className="text-base text-gray-900">{fournisseur.email}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Phone className="w-4 h-4 text-blue-600" />
                    <span className="text-sm font-medium text-gray-600">Téléphone:</span>
                    <p className="text-base text-gray-900">{fournisseur.telephone}</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <MapPin className="w-4 h-4 text-blue-600 mt-0.5" />
                    <span className="text-sm font-medium text-gray-600">Adresse:</span>
                    <p className="text-base text-gray-900">{fournisseur.adresse}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Type, Statut et État de paiement */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-gray-600" />
              Statut de la facture
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Type de transaction</span>
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    facture.type === 'Achat' ? 'bg-blue-100' :
                    facture.type === 'Retour' ? 'bg-red-100' : 'bg-green-100'
                  }`}>
                    {getTypeIcon()}
                  </div>
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getTypeColor(facture.type)}`}>
                    {facture.type}
                  </span>
                </div>
              </div>
              
              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">Statut de traitement</span>
                <div className="flex items-center space-x-3">
                  {getStatutIcon()}
                  <span className={`inline-flex px-4 py-2 text-lg font-bold rounded-xl border-2 ${getStatutColor(facture.statut)}`}>
                    {facture.statut}
                  </span>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-lg p-6">
                <span className="text-sm font-medium text-gray-600 block mb-3">État de paiement</span>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Progression:</span>
                    <span className="text-sm font-bold text-gray-900">{getPaymentPercentage()}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ${
                        getPaymentPercentage() === 100 ? 'bg-green-500' :
                        getPaymentPercentage() > 50 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${getPaymentPercentage()}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Détails financiers */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 mr-2 text-green-600" />
              Détails financiers
            </h4>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium mb-1">Montant HT</div>
                  <div className={`text-xl font-bold ${facture.montantHT < 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {facture.montantHT.toLocaleString()} DT
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium mb-1">TVA (20%)</div>
                  <div className={`text-xl font-bold ${getTVA() < 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {getTVA().toLocaleString()} DT
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium mb-1">Montant TTC</div>
                  <div className={`text-2xl font-bold ${facture.montantTTC < 0 ? 'text-red-600' : 'text-green-700'}`}>
                    {facture.montantTTC.toLocaleString()} DT
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg shadow-sm border border-green-200">
                <div className="text-center">
                  <div className="text-sm text-green-600 font-medium mb-1">Articles</div>
                  <div className="text-xl font-bold text-green-700">
                    {facture.produits.length}
                  </div>
                  <div className="text-xs text-gray-500">
                    {getTotalQuantity()} unités
                  </div>
                </div>
              </div>
            </div>

            {/* État des paiements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Montant payé</span>
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <div className="text-2xl font-bold text-green-600">
                  {facture.montantPaye.toLocaleString()} DT
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {getPaymentPercentage()}% du montant total
                </div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-green-200">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-600">Montant dû</span>
                  <AlertTriangle className={`w-4 h-4 ${facture.montantDu > 0 ? 'text-red-600' : 'text-green-600'}`} />
                </div>
                <div className={`text-2xl font-bold ${facture.montantDu > 0 ? 'text-red-600' : 'text-green-600'}`}>
                  {facture.montantDu.toLocaleString()} DT
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {facture.montantDu > 0 ? 'Paiement en attente' : 'Intégralement payé'}
                </div>
              </div>
            </div>
          </div>

          {/* Liste détaillée des produits */}
          <div>
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Articles facturés ({facture.produits.length})
            </h4>
            
            <div className="space-y-4">
              {facture.produits.map((produit, index) => (
                <div key={index} className="border border-gray-200 rounded-xl p-6 hover:shadow-md transition-shadow bg-white">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-orange-500 to-red-600 rounded-full text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-gray-900 mb-1">{produit.nom}</h5>
                        <div className="flex items-center space-x-4 text-sm text-gray-600">
                          <div className="flex items-center">
                            <Package className="w-4 h-4 mr-1" />
                            <span>Quantité: {Math.abs(produit.quantite)}</span>
                          </div>
                          <div className="flex items-center">
                            <DollarSign className="w-4 h-4 mr-1" />
                            <span>Prix unitaire: {produit.prixUnitaire.toLocaleString()} DT</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="bg-orange-50 rounded-lg p-4 min-w-[120px]">
                        <div className="text-sm font-medium text-orange-700 mb-1">Sous-total</div>
                        <div className={`text-2xl font-bold ${(produit.quantite * produit.prixUnitaire) < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                          {(produit.quantite * produit.prixUnitaire).toLocaleString()} DT
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Total des produits */}
            <div className="mt-6 bg-gradient-to-r from-orange-100 to-red-100 border-2 border-orange-300 rounded-xl p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-3 bg-orange-500 rounded-full">
                    <Calculator className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">Total de la facture</h3>
                    <p className="text-gray-600">
                      {facture.produits.length} article{facture.produits.length > 1 ? 's' : ''} • 
                      {getTotalQuantity()} unité{getTotalQuantity() > 1 ? 's' : ''}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-3xl font-bold ${facture.montantTTC < 0 ? 'text-red-600' : 'text-orange-600'}`}>
                    {facture.montantTTC.toLocaleString()} DT
                  </div>
                  <div className="text-sm text-gray-600">TTC</div>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          {facture.commentaires && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-yellow-500 rounded-lg">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h4 className="text-xl font-bold text-gray-900">Commentaires et notes</h4>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-yellow-200">
                <p className="text-gray-700 leading-relaxed text-base">
                  {facture.commentaires}
                </p>
              </div>
            </div>
          )}

          {/* Alertes */}
          {isOverdue() && (
            <div className="bg-red-50 border-2 border-red-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
                <div>
                  <h4 className="text-lg font-bold text-red-900">Facture en retard</h4>
                  <p className="text-red-700">
                    Cette facture était due le {formatDate(facture.dateEcheance)} 
                    (il y a {Math.abs(getDaysUntilDue())} jours). 
                    Montant en attente: {facture.montantDu.toLocaleString()} DT.
                  </p>
                </div>
              </div>
            </div>
          )}

          {facture.montantDu === 0 && facture.statut === 'Payée' && (
            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-center space-x-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
                <div>
                  <h4 className="text-lg font-bold text-green-900">Facture intégralement payée</h4>
                  <p className="text-green-700">
                    Cette facture a été intégralement réglée. 
                    Montant total payé: {facture.montantPaye.toLocaleString()} DT.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-center px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <button
            onClick={onClose}
            className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2 shadow-sm"
          >
            <X className="w-4 h-4" />
            <span>Fermer</span>
          </button>
        </div>
      </div>
    </div>
  )
}