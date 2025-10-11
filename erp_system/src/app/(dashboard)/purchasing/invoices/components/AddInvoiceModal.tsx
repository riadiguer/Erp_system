'use client'
import React, { useState, useEffect } from 'react'
import { X, Plus, Check, Building, Receipt, Calendar, DollarSign, Package, AlertTriangle, FileText } from 'lucide-react'

interface AddInvoiceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  fournisseur?: {
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
  }
  fournisseurs: Array<{
    id: string
    nom: string
    email: string
    telephone: string
    adresse: string
    statut: string
  }>
}

export default function AddInvoiceModal({ 
  isOpen, 
  onClose, 
  onSave, 
  fournisseur,
  fournisseurs 
}: AddInvoiceModalProps) {
  const [formData, setFormData] = useState({
    fournisseurId: '',
    numeroFacture: '',
    dateFacture: new Date().toISOString().split('T')[0],
    dateEcheance: '',
    type: 'Achat',
    statut: 'En attente',
    montantHT: 0,
    tauxTVA: 20,
    montantTTC: 0,
    montantPaye: 0,
    montantDu: 0,
    produits: [] as Array<{
      id: string
      nom: string
      quantite: number
      prixUnitaire: number
      montantTotal: number
    }>,
    commentaires: '',
    referenceCommande: '',
    modePaiement: 'Virement',
    delaiPaiement: 30
  })

  const [errors, setErrors] = useState({
    fournisseurId: '',
    numeroFacture: '',
    dateEcheance: '',
    montantHT: '',
    produits: ''
  })

  const [selectedFournisseur, setSelectedFournisseur] = useState(null)

  // Produits disponibles pour la facture
  const [produitsDisponibles] = useState([
    { id: 'P001', nom: 'Ordinateur portable Dell', type: 'produit', prixDefaut: 2500 },
    { id: 'P002', nom: 'Imprimante laser HP', type: 'produit', prixDefaut: 800 },
    { id: 'P003', nom: 'Écran 24 pouces Samsung', type: 'produit', prixDefaut: 450 },
    { id: 'P004', nom: 'Clavier sans fil', type: 'produit', prixDefaut: 75 },
    { id: 'P005', nom: 'Souris optique', type: 'produit', prixDefaut: 25 },
    { id: 'M001', nom: 'Câbles réseau Cat6', type: 'matiere', prixDefaut: 15 },
    { id: 'M002', nom: 'Papier A4', type: 'matiere', prixDefaut: 8 },
    { id: 'M003', nom: 'Cartouches d\'encre', type: 'matiere', prixDefaut: 45 },
    { id: 'M004', nom: 'Toner pour imprimante', type: 'matiere', prixDefaut: 120 },
    { id: 'M005', nom: 'Stylos à bille', type: 'matiere', prixDefaut: 1.5 }
  ])

  // Initialiser avec le fournisseur sélectionné si fourni
  useEffect(() => {
    if (fournisseur && isOpen) {
      setFormData(prev => ({
        ...prev,
        fournisseurId: fournisseur.id
      }))
      setSelectedFournisseur(fournisseur)
    }
  }, [fournisseur, isOpen])

  // Générer un numéro de facture automatique
  useEffect(() => {
    if (isOpen && !formData.numeroFacture) {
      const today = new Date()
      const year = today.getFullYear()
      const month = String(today.getMonth() + 1).padStart(2, '0')
      const day = String(today.getDate()).padStart(2, '0')
      const random = Math.floor(Math.random() * 999) + 1
      
      const typePrefix = formData.type === 'Achat' ? 'FAC' : formData.type === 'Retour' ? 'RET' : 'AV'
      const numeroAuto = `${typePrefix}-${year}-${month}${day}-${String(random).padStart(3, '0')}`
      
      setFormData(prev => ({
        ...prev,
        numeroFacture: numeroAuto
      }))
    }
  }, [isOpen, formData.type])

  // Calculer automatiquement les montants
  useEffect(() => {
    const montantHT = formData.produits.reduce((sum, p) => sum + p.montantTotal, 0)
    const montantTVA = (montantHT * formData.tauxTVA) / 100
    const montantTTC = montantHT + montantTVA
    const montantDu = montantTTC - formData.montantPaye

    setFormData(prev => ({
      ...prev,
      montantHT: montantHT,
      montantTTC: montantTTC,
      montantDu: Math.max(0, montantDu)
    }))
  }, [formData.produits, formData.tauxTVA, formData.montantPaye])

  // Calculer la date d'échéance automatiquement
  useEffect(() => {
    if (formData.dateFacture && formData.delaiPaiement) {
      const dateFacture = new Date(formData.dateFacture)
      dateFacture.setDate(dateFacture.getDate() + formData.delaiPaiement)
      setFormData(prev => ({
        ...prev,
        dateEcheance: dateFacture.toISOString().split('T')[0]
      }))
    }
  }, [formData.dateFacture, formData.delaiPaiement])

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      fournisseurId: '',
      numeroFacture: '',
      dateEcheance: '',
      montantHT: '',
      produits: ''
    }

    if (!formData.fournisseurId) {
      newErrors.fournisseurId = 'Veuillez sélectionner un fournisseur'
    }

    if (!formData.numeroFacture.trim()) {
      newErrors.numeroFacture = 'Le numéro de facture est requis'
    }

    if (!formData.dateEcheance) {
      newErrors.dateEcheance = 'La date d\'échéance est requise'
    } else {
      const today = new Date().toISOString().split('T')[0]
      if (formData.dateEcheance < formData.dateFacture) {
        newErrors.dateEcheance = 'La date d\'échéance doit être après la date de facture'
      }
    }

    if (formData.produits.length === 0) {
      newErrors.produits = 'Au moins un produit doit être ajouté'
    }

    if (formData.montantHT <= 0) {
      newErrors.montantHT = 'Le montant doit être supérieur à 0'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      handleClose()
    }
  }

  const handleClose = () => {
    setFormData({
      fournisseurId: '',
      numeroFacture: '',
      dateFacture: new Date().toISOString().split('T')[0],
      dateEcheance: '',
      type: 'Achat',
      statut: 'En attente',
      montantHT: 0,
      tauxTVA: 20,
      montantTTC: 0,
      montantPaye: 0,
      montantDu: 0,
      produits: [],
      commentaires: '',
      referenceCommande: '',
      modePaiement: 'Virement',
      delaiPaiement: 30
    })
    setErrors({ fournisseurId: '', numeroFacture: '', dateEcheance: '', montantHT: '', produits: '' })
    setSelectedFournisseur(null)
    onClose()
  }

  const handleFournisseurChange = (fournisseurId) => {
    const fournisseur = fournisseurs.find(f => f.id === fournisseurId)
    setFormData(prev => ({ ...prev, fournisseurId }))
    setSelectedFournisseur(fournisseur || null)
    if (errors.fournisseurId) {
      setErrors(prev => ({ ...prev, fournisseurId: '' }))
    }
  }

  const addProduit = (produit) => {
    const existing = formData.produits.find(p => p.id === produit.id)
    if (existing) {
      updateProduitQuantite(produit.id, existing.quantite + 1)
    } else {
      const newProduit = {
        id: produit.id,
        nom: produit.nom,
        quantite: 1,
        prixUnitaire: produit.prixDefaut,
        montantTotal: produit.prixDefaut
      }
      setFormData(prev => ({
        ...prev,
        produits: [...prev.produits, newProduit]
      }))
    }
    if (errors.produits) {
      setErrors(prev => ({ ...prev, produits: '' }))
    }
  }

  const updateProduitQuantite = (produitId, newQuantite) => {
    if (newQuantite <= 0) {
      removeProduit(produitId)
    } else {
      setFormData(prev => ({
        ...prev,
        produits: prev.produits.map(p => 
          p.id === produitId 
            ? { ...p, quantite: newQuantite, montantTotal: newQuantite * p.prixUnitaire }
            : p
        )
      }))
    }
  }

  const updateProduitPrix = (produitId, newPrix) => {
    setFormData(prev => ({
      ...prev,
      produits: prev.produits.map(p => 
        p.id === produitId 
          ? { ...p, prixUnitaire: newPrix, montantTotal: p.quantite * newPrix }
          : p
      )
    }))
  }

  const removeProduit = (produitId) => {
    setFormData(prev => ({
      ...prev,
      produits: prev.produits.filter(p => p.id !== produitId)
    }))
  }

  const handleTypeChange = (newType) => {
    setFormData(prev => ({
      ...prev,
      type: newType,
      statut: newType === 'Retour' ? 'Traitée' : 'En attente'
    }))
    
    // Régénérer le numéro de facture avec le bon préfixe
    const today = new Date()
    const year = today.getFullYear()
    const month = String(today.getMonth() + 1).padStart(2, '0')
    const day = String(today.getDate()).padStart(2, '0')
    const random = Math.floor(Math.random() * 999) + 1
    
    const typePrefix = newType === 'Achat' ? 'FAC' : newType === 'Retour' ? 'RET' : 'AV'
    const numeroAuto = `${typePrefix}-${year}-${month}${day}-${String(random).padStart(3, '0')}`
    
    setFormData(prev => ({
      ...prev,
      numeroFacture: numeroAuto
    }))
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-orange-50 to-orange-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-orange-500 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Nouvelle facture fournisseur
          </h3>
          <button 
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Section Fournisseur et Type */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fournisseur */}
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Building className="w-5 h-5 text-blue-500 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Fournisseur</h4>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Sélectionner le fournisseur *
                </label>
                <select
                  value={formData.fournisseurId}
                  onChange={(e) => handleFournisseurChange(e.target.value)}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.fournisseurId ? 'border-red-500' : 'border-gray-300'
                  }`}
                  disabled={!!fournisseur}
                >
                  <option value="">Choisir un fournisseur</option>
                  {fournisseurs.filter(f => f.statut === 'Actif').map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nom} - {f.email}
                    </option>
                  ))}
                </select>
                {errors.fournisseurId && (
                  <p className="mt-1 text-sm text-red-600">{errors.fournisseurId}</p>
                )}
              </div>

              {selectedFournisseur && (
                <div className="mt-4 bg-white p-3 rounded-lg border border-blue-200">
                  <div className="text-sm space-y-1">
                    <div><strong>Nom:</strong> {selectedFournisseur.nom}</div>
                    <div><strong>Email:</strong> {selectedFournisseur.email}</div>
                    <div><strong>Téléphone:</strong> {selectedFournisseur.telephone}</div>
                    <div><strong>Adresse:</strong> {selectedFournisseur.adresse}</div>
                  </div>
                </div>
              )}
            </div>

            {/* Type et Informations */}
            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center mb-4">
                <Receipt className="w-5 h-5 text-green-500 mr-2" />
                <h4 className="text-lg font-semibold text-gray-900">Type de facture</h4>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type *
                  </label>
                  <select
                    value={formData.type}
                    onChange={(e) => handleTypeChange(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="Achat">📦 Facture d'achat</option>
                    <option value="Retour">↩️ Note de retour</option>
                    <option value="Avoir">💰 Avoir fournisseur</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Statut
                  </label>
                  <select
                    value={formData.statut}
                    onChange={(e) => setFormData(prev => ({ ...prev, statut: e.target.value }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  >
                    <option value="En attente">⏳ En attente</option>
                    <option value="Payée">✅ Payée</option>
                    <option value="En retard">⚠️ En retard</option>
                    <option value="Traitée">🔄 Traitée</option>
                    <option value="Annulée">❌ Annulée</option>
                  </select>
                </div>
              </div>
            </div>
          </div>

          {/* Informations de facture */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <FileText className="w-5 h-5 text-gray-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Détails de la facture</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Numéro de facture *
                </label>
                <input
                  type="text"
                  value={formData.numeroFacture}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, numeroFacture: e.target.value }))
                    if (errors.numeroFacture) {
                      setErrors(prev => ({ ...prev, numeroFacture: '' }))
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.numeroFacture ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="FAC-2024-001"
                />
                {errors.numeroFacture && (
                  <p className="mt-1 text-sm text-red-600">{errors.numeroFacture}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de facture *
                </label>
                <input
                  type="date"
                  value={formData.dateFacture}
                  onChange={(e) => setFormData(prev => ({ ...prev, dateFacture: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Délai de paiement (jours)
                </label>
                <select
                  value={formData.delaiPaiement}
                  onChange={(e) => setFormData(prev => ({ ...prev, delaiPaiement: parseInt(e.target.value) }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value={0}>Immédiat</option>
                  <option value={15}>15 jours</option>
                  <option value={30}>30 jours</option>
                  <option value={45}>45 jours</option>
                  <option value={60}>60 jours</option>
                  <option value={90}>90 jours</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date d'échéance *
                </label>
                <input
                  type="date"
                  value={formData.dateEcheance}
                  onChange={(e) => {
                    setFormData(prev => ({ ...prev, dateEcheance: e.target.value }))
                    if (errors.dateEcheance) {
                      setErrors(prev => ({ ...prev, dateEcheance: '' }))
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 ${
                    errors.dateEcheance ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
                {errors.dateEcheance && (
                  <p className="mt-1 text-sm text-red-600">{errors.dateEcheance}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Référence commande
                </label>
                <input
                  type="text"
                  value={formData.referenceCommande}
                  onChange={(e) => setFormData(prev => ({ ...prev, referenceCommande: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="BC-2024-001"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Mode de paiement
                </label>
                <select
                  value={formData.modePaiement}
                  onChange={(e) => setFormData(prev => ({ ...prev, modePaiement: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="Virement">🏦 Virement bancaire</option>
                  <option value="Cheque">📝 Chèque</option>
                  <option value="Especes">💵 Espèces</option>
                  <option value="Carte">💳 Carte bancaire</option>
                  <option value="Traite">📄 Traite</option>
                </select>
              </div>
            </div>
          </div>

          {/* Sélection des produits */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">
              <Package className="w-4 h-4 inline mr-2" />
              Produits et services disponibles
            </label>
            <div className="border border-gray-300 rounded-lg max-h-48 overflow-y-auto">
              {produitsDisponibles.map((produit) => (
                <div key={produit.id} className="flex items-center justify-between p-3 border-b border-gray-100 last:border-b-0 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                    <div>
                      <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                      <div className="flex items-center space-x-2 mt-1">
                        <span className={`px-2 py-1 text-xs rounded-full font-medium ${
                          produit.type === 'produit' 
                            ? 'bg-blue-100 text-blue-800 border border-blue-200' 
                            : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                          {produit.type === 'produit' ? 'Produit' : 'Matière première'}
                        </span>
                        <span className="text-xs text-gray-500">
                          Prix suggéré: {produit.prixDefaut} DT
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => addProduit(produit)}
                    className="text-orange-600 hover:text-orange-800 p-2 rounded-full hover:bg-orange-50 transition-colors"
                    title={`Ajouter ${produit.nom}`}
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
            {errors.produits && (
              <p className="mt-2 text-sm text-red-600 flex items-center">
                <AlertTriangle className="w-4 h-4 mr-1" />
                {errors.produits}
              </p>
            )}
          </div>

          {/* Produits sélectionnés */}
          {formData.produits.length > 0 && (
            <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-gray-900 mb-3 flex items-center justify-between">
                <span className="flex items-center">
                  <Check className="w-5 h-5 text-orange-600 mr-2" />
                  Articles de la facture ({formData.produits.length})
                </span>
              </h4>
              
              <div className="space-y-3">
                {formData.produits.map((produit, index) => (
                  <div key={produit.id} className="bg-white rounded-lg p-4 border border-orange-200 shadow-sm">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 bg-orange-100 rounded-full text-xs font-bold text-orange-800">
                          {index + 1}
                        </div>
                        <div>
                          <span className="text-sm font-medium text-gray-900">{produit.nom}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        {/* Quantité */}
                        <div className="flex items-center space-x-2 bg-gray-50 rounded-lg p-2">
                          <button
                            type="button"
                            onClick={() => updateProduitQuantite(produit.id, produit.quantite - 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold text-xs"
                          >
                            -
                          </button>
                          <span className="w-8 text-center text-sm font-bold text-gray-900">{produit.quantite}</span>
                          <button
                            type="button"
                            onClick={() => updateProduitQuantite(produit.id, produit.quantite + 1)}
                            className="w-6 h-6 rounded-full bg-gray-200 flex items-center justify-center hover:bg-gray-300 transition-colors text-gray-600 font-bold text-xs"
                          >
                            +
                          </button>
                        </div>

                        {/* Prix unitaire */}
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-600">Prix:</span>
                          <input
                            type="number"
                            value={produit.prixUnitaire}
                            onChange={(e) => updateProduitPrix(produit.id, parseFloat(e.target.value) || 0)}
                            className="w-20 px-2 py-1 text-sm border border-gray-300 rounded focus:ring-1 focus:ring-orange-500 focus:border-orange-500"
                            min="0"
                            step="0.01"
                          />
                          <span className="text-sm text-gray-600">DT</span>
                        </div>

                        {/* Montant total */}
                        <div className="text-right min-w-[80px]">
                          <div className="text-sm text-gray-600">Total:</div>
                          <div className="text-sm font-bold text-gray-900">
                            {produit.montantTotal.toLocaleString()} DT
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => removeProduit(produit.id)}
                          className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-red-50 transition-colors"
                          title={`Supprimer ${produit.nom}`}
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Calculs financiers */}
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <DollarSign className="w-5 h-5 text-purple-600 mr-2" />
              Calculs financiers
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Calculs automatiques */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-gray-600">Montant HT:</span>
                    <span className="text-lg font-bold text-gray-900">{formData.montantHT.toLocaleString()} DT</span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium text-gray-600">TVA ({formData.tauxTVA}%):</span>
                      <input
                        type="number"
                        value={formData.tauxTVA}
                        onChange={(e) => setFormData(prev => ({ ...prev, tauxTVA: parseFloat(e.target.value) || 0 }))}
                        className="w-16 px-2 py-1 text-xs border border-gray-300 rounded focus:ring-1 focus:ring-purple-500"
                        min="0"
                        max="100"
                        step="0.1"
                      />
                    </div>
                    <span className="text-lg font-bold text-purple-600">
                      {((formData.montantHT * formData.tauxTVA) / 100).toLocaleString()} DT
                    </span>
                  </div>
                  <div className="border-t pt-2">
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-800">Montant TTC:</span>
                      <span className="text-xl font-bold text-purple-700">{formData.montantTTC.toLocaleString()} DT</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Paiements */}
              <div className="space-y-4">
                <div className="bg-white p-4 rounded-lg border border-purple-200">
                  <div className="mb-3">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Montant déjà payé
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={formData.montantPaye}
                        onChange={(e) => setFormData(prev => ({ ...prev, montantPaye: parseFloat(e.target.value) || 0 }))}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                        min="0"
                        max={formData.montantTTC}
                        step="0.01"
                        placeholder="0.00"
                      />
                      <span className="text-sm text-gray-600">DT</span>
                    </div>
                  </div>
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium text-gray-600">Montant payé:</span>
                      <span className="text-base font-bold text-green-600">{formData.montantPaye.toLocaleString()} DT</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-base font-bold text-gray-800">Reste dû:</span>
                      <span className={`text-xl font-bold ${formData.montantDu > 0 ? 'text-red-600' : 'text-green-600'}`}>
                        {formData.montantDu.toLocaleString()} DT
                      </span>
                    </div>
                  </div>
                </div>

                {/* Indicateur de statut de paiement */}
                <div className={`p-3 rounded-lg border-2 ${
                  formData.montantDu === 0 
                    ? 'bg-green-50 border-green-200' 
                    : formData.montantPaye > 0 
                      ? 'bg-orange-50 border-orange-200' 
                      : 'bg-red-50 border-red-200'
                }`}>
                  <div className="flex items-center text-sm font-medium">
                    {formData.montantDu === 0 ? (
                      <>
                        <Check className="w-4 h-4 text-green-600 mr-2" />
                        <span className="text-green-800">Facture entièrement payée</span>
                      </>
                    ) : formData.montantPaye > 0 ? (
                      <>
                        <AlertTriangle className="w-4 h-4 text-orange-600 mr-2" />
                        <span className="text-orange-800">Paiement partiel effectué</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-4 h-4 text-red-600 mr-2" />
                        <span className="text-red-800">Aucun paiement enregistré</span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Commentaires */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires et notes
            </label>
            <textarea
              value={formData.commentaires}
              onChange={(e) => setFormData(prev => ({ ...prev, commentaires: e.target.value }))}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 resize-none"
              placeholder="Notes sur la facture, conditions particulières, observations..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Optionnel - Ces informations seront ajoutées à l'historique de la facture
            </div>
          </div>

          {/* Récapitulatif */}
          <div className="bg-gradient-to-r from-orange-100 to-purple-100 border-2 border-orange-300 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Receipt className="w-6 h-6 mr-2 text-orange-600" />
              Récapitulatif de la facture
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Type de facture:</span>
                  <span className="font-bold text-gray-900">{formData.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Nombre d'articles:</span>
                  <span className="font-bold text-gray-900">{formData.produits.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Mode de paiement:</span>
                  <span className="font-bold text-gray-900">{formData.modePaiement}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Délai de paiement:</span>
                  <span className="font-bold text-gray-900">{formData.delaiPaiement} jours</span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Montant HT:</span>
                  <span className="font-bold text-gray-900">{formData.montantHT.toLocaleString()} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">TVA ({formData.tauxTVA}%):</span>
                  <span className="font-bold text-gray-900">{((formData.montantHT * formData.tauxTVA) / 100).toLocaleString()} DT</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-bold text-gray-800">Total TTC:</span>
                  <span className="font-bold text-orange-600 text-lg">{formData.montantTTC.toLocaleString()} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Reste dû:</span>
                  <span className={`font-bold ${formData.montantDu > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {formData.montantDu.toLocaleString()} DT
                  </span>
                </div>
              </div>
            </div>

            {/* Alertes */}
            {formData.montantHT <= 0 && (
              <div className="mt-4 bg-red-100 border border-red-300 rounded-lg p-3">
                <div className="flex items-center text-red-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    Attention: Le montant de la facture doit être supérieur à 0
                  </span>
                </div>
              </div>
            )}

            {formData.montantPaye > formData.montantTTC && (
              <div className="mt-4 bg-yellow-100 border border-yellow-300 rounded-lg p-3">
                <div className="flex items-center text-yellow-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    Attention: Le montant payé dépasse le montant de la facture
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-orange-50 to-purple-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Champs obligatoires :</span> Fournisseur, numéro, dates et au moins un article
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              onClick={handleSave}
              disabled={formData.produits.length === 0 || !formData.fournisseurId || formData.montantHT <= 0}
              className="px-6 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Créer la facture</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}