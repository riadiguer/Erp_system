'use client'
import React, { useState, useEffect } from 'react'
import { X, Edit, Check, Package, Calendar, Building, User, Truck, AlertTriangle } from 'lucide-react'

interface EditReceptionModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (formData: any) => void
  reception: {
    id: string
    numeroReception: string
    bonCommande: {
      id: string
      numeroBon: string
      fournisseur: { 
        id: string
        nom: string
        email: string
      }
    }
    dateReception: string
    heureReception: string
    receptionnePar: string
    numeroBonLivraison: string
    transporteur: string
    etatLivraison: string
    produits: Array<{
      id: string
      nom: string
      quantiteCommandee: number
      quantiteRecue: number
      etat: string
      prixUnitaire: number
      commentaire: string
    }>
    commentairesReception: string
    montantTotal: number
    statut: string
  }
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

export default function EditReceptionModal({ 
  isOpen, 
  onClose, 
  onSave, 
  reception,
  fournisseursDispo, 
  bonsCommandeDispo 
}: EditReceptionModalProps) {
  const [formData, setFormData] = useState({
    bonCommande: { id: '', numeroBon: '', fournisseur: { id: '', nom: '', email: '' } },
    dateReception: '',
    heureReception: '',
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
    receptionnePar: '',
    numeroBonLivraison: ''
  })

  // Initialiser le formulaire avec les données de la réception
  useEffect(() => {
    if (reception && isOpen) {
      setFormData({
        bonCommande: reception.bonCommande,
        dateReception: reception.dateReception,
        heureReception: reception.heureReception,
        receptionnePar: reception.receptionnePar,
        numeroBonLivraison: reception.numeroBonLivraison,
        transporteur: reception.transporteur,
        etatLivraison: reception.etatLivraison,
        produits: reception.produits,
        commentairesReception: reception.commentairesReception,
        montantTotal: reception.montantTotal
      })
    }
  }, [reception, isOpen])

  if (!isOpen || !reception) return null

  const validateForm = () => {
    const newErrors = {
      receptionnePar: '',
      numeroBonLivraison: ''
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
    const updatedFormData = {
      ...formData,
      montantTotal: calculateMontantTotal()
    }

    if (validateForm()) {
      onSave(updatedFormData)
    }
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
    setErrors({ receptionnePar: '', numeroBonLivraison: '' })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-blue-500 rounded-lg mr-3">
              <Edit className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Modifier la réception</div>
              <div className="text-sm font-normal text-gray-600">
                {reception.numeroReception} • {reception.statut}
              </div>
            </div>
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
          
          {/* Info de la réception existante */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="text-sm text-blue-800">
              <strong>Réception créée le :</strong> {new Date(reception.dateReception).toLocaleDateString('fr-FR')}
              <span className="mx-2">•</span>
              <strong>Bon de commande :</strong> {reception.bonCommande.numeroBon}
              <span className="mx-2">•</span>
              <strong>Montant actuel :</strong> {reception.montantTotal.toLocaleString()} DT
            </div>
          </div>

          {/* Section Bon de commande (lecture seule) */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-center mb-4">
              <Package className="w-5 h-5 text-gray-500 mr-2" />
              <h4 className="text-lg font-semibold text-gray-900">Bon de commande (non modifiable)</h4>
            </div>
            
            <div className="bg-white p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-600">Numéro bon:</span>
                  <p className="text-gray-900">{formData.bonCommande.numeroBon}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Fournisseur:</span>
                  <p className="text-gray-900">{formData.bonCommande.fournisseur.nom}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">Email:</span>
                  <p className="text-gray-900">{formData.bonCommande.fournisseur.email}</p>
                </div>
                <div>
                  <span className="font-medium text-gray-600">ID:</span>
                  <p className="text-gray-900">{formData.bonCommande.id}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Détails de la réception - Modifiables */}
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="Conforme">✅ Conforme</option>
                  <option value="Partiellement conforme">⚠️ Partiellement conforme</option>
                  <option value="Non conforme">❌ Non conforme</option>
                  <option value="Endommagé">💔 Endommagé</option>
                </select>
              </div>
            </div>
          </div>

          {/* Modification des produits */}
          <div>
            <h4 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <Check className="w-5 h-5 mr-2 text-blue-600" />
              Modification des articles reçus ({formData.produits.length})
            </h4>
            
            <div className="space-y-4">
              {formData.produits.map((produit, index) => (
                <div key={produit.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-full text-sm font-bold text-blue-800">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="font-semibold text-gray-900">{produit.nom}</h5>
                        <div className="text-sm text-gray-500">Prix unitaire: {produit.prixUnitaire} DT</div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {/* Quantité commandée (lecture seule) */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-700">Commandée</div>
                      <div className="text-xl font-bold text-blue-600">{produit.quantiteCommandee}</div>
                      <div className="text-xs text-gray-500">Non modifiable</div>
                    </div>

                    {/* Quantité reçue - Modifiable */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700 mb-1">Reçue</div>
                      <input
                        type="number"
                        value={produit.quantiteRecue}
                        onChange={(e) => updateProduitRecu(produit.id, 'quantiteRecue', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-lg font-bold bg-white border border-green-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                      />
                    </div>

                    {/* État - Modifiable */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-1">État</div>
                      <select
                        value={produit.etat}
                        onChange={(e) => updateProduitRecu(produit.id, 'etat', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      >
                        <option value="Conforme">✅ Conforme</option>
                        <option value="Partiel">⚠️ Partiel</option>
                        <option value="Endommagé">💔 Endommagé</option>
                        <option value="Manquant">❌ Manquant</option>
                      </select>
                    </div>

                    {/* Sous-total calculé */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="text-sm font-medium text-purple-700">Sous-total</div>
                      <div className="text-lg font-bold text-purple-600">
                        {(produit.quantiteRecue * produit.prixUnitaire).toLocaleString()} DT
                      </div>
                      <div className="text-xs text-gray-500">Calculé auto.</div>
                    </div>
                  </div>

                  {/* Commentaire - Modifiable */}
                  <div className="mt-3">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Commentaire sur cet article
                    </label>
                    <input
                      type="text"
                      value={produit.commentaire}
                      onChange={(e) => updateProduitRecu(produit.id, 'commentaire', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="Observations, remarques..."
                    />
                  </div>

                  {/* Indicateur de changement */}
                  <div className="mt-3 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {produit.quantiteRecue === produit.quantiteCommandee && produit.etat === 'Conforme' ? (
                        <>
                          <Check className="w-4 h-4 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Article conforme</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-4 h-4 text-orange-600" />
                          <span className="text-sm font-medium text-orange-600">
                            {produit.quantiteRecue !== produit.quantiteCommandee && 'Quantité modifiée • '}
                            {produit.etat !== 'Conforme' && `État: ${produit.etat}`}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {produit.quantiteRecue !== produit.quantiteCommandee && (
                      <div className="text-sm">
                        <span className={`font-medium ${produit.quantiteRecue > produit.quantiteCommandee ? 'text-blue-600' : 'text-red-600'}`}>
                          {produit.quantiteRecue > produit.quantiteCommandee ? '+' : ''}{produit.quantiteRecue - produit.quantiteCommandee}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Total mis à jour */}
            <div className="bg-blue-100 border border-blue-300 rounded-lg p-4 mt-4">
              <div className="flex justify-between items-center">
                <span className="text-lg font-semibold text-blue-900">Nouveau montant total:</span>
                <span className="text-2xl font-bold text-blue-600">
                  {calculateMontantTotal().toLocaleString()} DT
                </span>
              </div>
              {calculateMontantTotal() !== reception.montantTotal && (
                <div className="text-sm text-blue-700 mt-2">
                  <span>Différence: </span>
                  <span className={`font-medium ${calculateMontantTotal() > reception.montantTotal ? 'text-green-600' : 'text-red-600'}`}>
                    {calculateMontantTotal() > reception.montantTotal ? '+' : ''}
                    {(calculateMontantTotal() - reception.montantTotal).toLocaleString()} DT
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Commentaires généraux - Modifiables */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires généraux sur la réception
            </label>
            <textarea
              value={formData.commentairesReception}
              onChange={(e) => setFormData({ ...formData, commentairesReception: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              placeholder="Modifiez les observations générales..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Mettez à jour les commentaires si nécessaire
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Attention :</span> Les modifications seront appliquées à la réception {reception.numeroReception}
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
              className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Sauvegarder les modifications</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}