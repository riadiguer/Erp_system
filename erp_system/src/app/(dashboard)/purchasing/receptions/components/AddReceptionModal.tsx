'use client'
import React, { useState } from 'react'
import { X, Plus, Check, Package, Calendar, Building, User, Truck, AlertTriangle } from 'lucide-react'

interface AddReceptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  fournisseursDispo: Array<{
    id: string
    nom: string
    email: string
    telephone: string
  }>
  bonsCommandeDispo: Array<{
    id: string
    numeroBon: string
    fournisseur: string
    montant: number
  }>
}

export default function AddReceptionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  fournisseursDispo, 
  bonsCommandeDispo 
}: AddReceptionModalProps) {
  const [formData, setFormData] = useState({
    bonCommande: { id: '', numeroBon: '', fournisseur: { id: '', nom: '', email: '' } },
    dateReception: new Date().toISOString().split('T')[0],
    heureReception: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    receptionnePar: '',
    numeroBonLivraison: '',
    transporteur: '',
    etatLivraison: 'Conforme',
    produits: [] as Array<{
      id: string
      nom: string
      quantiteCommandee: number
      quantiteRecue: number
      etat: string
      prixUnitaire: number
      commentaire: string
    }>,
    commentairesReception: '',
    montantTotal: 0
  })

  const [errors, setErrors] = useState({
    bonCommande: '',
    receptionnePar: '',
    numeroBonLivraison: ''
  })

  if (!isOpen) return null

  const validateForm = () => {
    const newErrors = {
      bonCommande: '',
      receptionnePar: '',
      numeroBonLivraison: ''
    }

    if (!formData.bonCommande.id) {
      newErrors.bonCommande = 'Veuillez sélectionner un bon de commande'
    }

    if (!formData.receptionnePar.trim()) {
      newErrors.receptionnePar = 'Le nom de la personne qui réceptionne est requis'
    }

    if (!formData.numeroBonLivraison.trim()) {
      newErrors.numeroBonLivraison = 'Le numéro du bon de livraison est requis'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleSave = () => {
    if (validateForm()) {
      onSave(formData)
      // Reset form
      setFormData({
        bonCommande: { id: '', numeroBon: '', fournisseur: { id: '', nom: '', email: '' } },
        dateReception: new Date().toISOString().split('T')[0],
        heureReception: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        receptionnePar: '',
        numeroBonLivraison: '',
        transporteur: '',
        etatLivraison: 'Conforme',
        produits: [],
        commentairesReception: '',
        montantTotal: 0
      })
      setErrors({ bonCommande: '', receptionnePar: '', numeroBonLivraison: '' })
    }
  }

  const handleBonCommandeChange = (bonId) => {
    const bon = bonsCommandeDispo.find(b => b.id === bonId)
    if (bon) {
      const fournisseur = fournisseursDispo.find(f => f.nom === bon.fournisseur)
      setFormData({
        ...formData,
        bonCommande: {
          id: bon.id,
          numeroBon: bon.numeroBon,
          fournisseur: fournisseur || { id: '', nom: bon.fournisseur, email: '' }
        },
        // Simuler des produits pour le bon de commande sélectionné
        produits: generateProduitsForBon(bon),
        montantTotal: bon.montant
      })
      if (errors.bonCommande) {
        setErrors({ ...errors, bonCommande: '' })
      }
    }
  }

  const generateProduitsForBon = (bon) => {
    // Simulation de produits basée sur le bon de commande
    const produitsSimules = {
      'BC001': [
        { id: 'P001', nom: 'Ordinateur portable Dell', quantiteCommandee: 2, quantiteRecue: 2, etat: 'Conforme', prixUnitaire: 2500, commentaire: '' },
        { id: 'M001', nom: 'Câbles réseau Cat6', quantiteCommandee: 10, quantiteRecue: 10, etat: 'Conforme', prixUnitaire: 15, commentaire: '' }
      ],
      'BC002': [
        { id: 'P002', nom: 'Imprimante laser HP', quantiteCommandee: 1, quantiteRecue: 1, etat: 'Conforme', prixUnitaire: 800, commentaire: '' },
        { id: 'M003', nom: 'Cartouches d\'encre', quantiteCommandee: 5, quantiteRecue: 5, etat: 'Conforme', prixUnitaire: 45, commentaire: '' }
      ],
      'BC004': [
        { id: 'P003', nom: 'Écran 24 pouces Samsung', quantiteCommandee: 3, quantiteRecue: 3, etat: 'Conforme', prixUnitaire: 450, commentaire: '' }
      ]
    }
    return produitsSimules[bon.id] || []
  }

  const updateProduitRecu = (produitId, field, value) => {
    setFormData({
      ...formData,
      produits: formData.produits.map(p => 
        p.id === produitId ? { ...p, [field]: value } : p
      )
    })
  }

  const calculateMontantTotal = () => {
    return formData.produits.reduce((total, produit) => 
      total + (produit.quantiteRecue * produit.prixUnitaire), 0
    )
  }

  const handleClose = () => {
    setFormData({
      bonCommande: { id: '', numeroBon: '', fournisseur: { id: '', nom: '', email: '' } },
      dateReception: new Date().toISOString().split('T')[0],
      heureReception: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      receptionnePar: '',
      numeroBonLivraison: '',
      transporteur: '',
      etatLivraison: 'Conforme',
      produits: [],
      commentairesReception: '',
      montantTotal: 0
    })
    setErrors({ bonCommande: '', receptionnePar: '', numeroBonLivraison: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg mr-3">
              <Plus className="w-5 h-5 text-white" />
            </div>
            Nouvelle réception de marchandises
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
          
          {/* Section Bon de commande */}
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-blue-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Bon de commande à réceptionner</h4>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Sélectionner le bon de commande *
              </label>
              <select
                value={formData.bonCommande.id}
                onChange={(e) => handleBonCommandeChange(e.target.value)}
                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                  errors.bonCommande ? 'border-red-500' : 'border-gray-300'
                }`}
              >
                <option value="">Choisir un bon de commande</option>
                {bonsCommandeDispo.map((bon) => (
                  <option key={bon.id} value={bon.id}>
                    {bon.numeroBon} - {bon.fournisseur} ({bon.montant.toLocaleString()} DT)
                  </option>
                ))}
              </select>
              {errors.bonCommande && (
                <p className="mt-1 text-sm text-red-600">{errors.bonCommande}</p>
              )}
            </div>

            {formData.bonCommande.id && (
              <div className="mt-4 bg-white p-4 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium text-gray-600">Fournisseur:</span>
                    <p className="text-gray-900">{formData.bonCommande.fournisseur.nom}</p>
                  </div>
                  <div>
                    <span className="font-medium text-gray-600">Email:</span>
                    <p className="text-gray-900">{formData.bonCommande.fournisseur.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Détails de la réception */}
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Truck className="w-5 h-5 text-green-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Informations de réception</h4>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de réception *
                </label>
                <input
                  type="date"
                  value={formData.dateReception}
                  onChange={(e) => setFormData({ ...formData, dateReception: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de réception
                </label>
                <input
                  type="time"
                  value={formData.heureReception}
                  onChange={(e) => setFormData({ ...formData, heureReception: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réceptionné par *
                </label>
                <input
                  type="text"
                  value={formData.receptionnePar}
                  onChange={(e) => {
                    setFormData({ ...formData, receptionnePar: e.target.value })
                    if (errors.receptionnePar) {
                      setErrors({ ...errors, receptionnePar: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.receptionnePar ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Nom de la personne"
                />
                {errors.receptionnePar && (
                  <p className="mt-1 text-sm text-red-600">{errors.receptionnePar}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° bon de livraison *
                </label>
                <input
                  type="text"
                  value={formData.numeroBonLivraison}
                  onChange={(e) => {
                    setFormData({ ...formData, numeroBonLivraison: e.target.value })
                    if (errors.numeroBonLivraison) {
                      setErrors({ ...errors, numeroBonLivraison: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 ${
                    errors.numeroBonLivraison ? 'border-red-500' : 'border-gray-300'
                  }`}
                  placeholder="Ex: BL-2024-001"
                />
                {errors.numeroBonLivraison && (
                  <p className="mt-1 text-sm text-red-600">{errors.numeroBonLivraison}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Transporteur
                </label>
                <input
                  type="text"
                  value={formData.transporteur}
                  onChange={(e) => setFormData({ ...formData, transporteur: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                  placeholder="Nom du transporteur"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  État général de la livraison
                </label>
                <select
                  value={formData.etatLivraison}
                  onChange={(e) => setFormData({ ...formData, etatLivraison: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                >
                  <option value="Conforme">✅ Conforme</option>
                  <option value="Partiellement conforme">⚠️ Partiellement conforme</option>
                  <option value="Non conforme">❌ Non conforme</option>
                  <option value="Endommagé">💔 Endommagé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Vérification des produits */}
          {formData.produits.length > 0 && (
            <div>
              <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Check className="w-5 h-5 mr-2 text-purple-600" />
                Vérification des articles ({formData.produits.length})
              </h4>
              
              <div className="space-y-4">
                {formData.produits.map((produit, index) => (
                  <div key={produit.id} className="bg-white border border-gray-200 rounded-lg p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-purple-100 rounded-full text-sm font-bold text-purple-800">
                          {index + 1}
                        </div>
                        <div>
                          <h5 className="font-semibold text-gray-900">{produit.nom}</h5>
                          <div className="text-sm text-gray-500">Prix unitaire: {produit.prixUnitaire} DT</div>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      {/* Quantité commandée */}
                      <div className="bg-blue-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-blue-700">Commandée</div>
                        <div className="text-xl font-bold text-blue-600">{produit.quantiteCommandee}</div>
                      </div>

                      {/* Quantité reçue */}
                      <div className="bg-green-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-green-700 mb-1">Reçue</div>
                        <input
                          type="number"
                          value={produit.quantiteRecue}
                          onChange={(e) => updateProduitRecu(produit.id, 'quantiteRecue', parseInt(e.target.value) || 0)}
                          className="w-full px-2 py-1 text-lg font-bold bg-white border border-green-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                          min="0"
                          max={produit.quantiteCommandee}
                        />
                      </div>

                      {/* État */}
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-gray-700 mb-1">État</div>
                        <select
                          value={produit.etat}
                          onChange={(e) => updateProduitRecu(produit.id, 'etat', e.target.value)}
                          className="w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        >
                          <option value="Conforme">✅ Conforme</option>
                          <option value="Partiel">⚠️ Partiel</option>
                          <option value="Endommagé">💔 Endommagé</option>
                          <option value="Manquant">❌ Manquant</option>
                        </select>
                      </div>

                      {/* Sous-total */}
                      <div className="bg-purple-50 p-3 rounded-lg">
                        <div className="text-sm font-medium text-purple-700">Sous-total</div>
                        <div className="text-lg font-bold text-purple-600">
                          {(produit.quantiteRecue * produit.prixUnitaire).toLocaleString()} DT
                        </div>
                      </div>
                    </div>

                    {/* Commentaire */}
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Commentaire
                      </label>
                      <input
                        type="text"
                        value={produit.commentaire}
                        onChange={(e) => updateProduitRecu(produit.id, 'commentaire', e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        placeholder="Observations sur cet article..."
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="bg-purple-100 border border-purple-300 rounded-lg p-4 mt-4">
                <div className="flex justify-between items-center">
                  <span className="text-lg font-semibold text-purple-900">Montant total reçu:</span>
                  <span className="text-2xl font-bold text-purple-600">
                    {calculateMontantTotal().toLocaleString()} DT
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Commentaires généraux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires généraux sur la réception
            </label>
            <textarea
              value={formData.commentairesReception}
              onChange={(e) => setFormData({ ...formData, commentairesReception: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              placeholder="Observations générales, problèmes rencontrés, qualité de l'emballage..."
            />
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Champs obligatoires :</span> Bon de commande, réceptionné par, bon de livraison
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
              className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Enregistrer la réception</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}