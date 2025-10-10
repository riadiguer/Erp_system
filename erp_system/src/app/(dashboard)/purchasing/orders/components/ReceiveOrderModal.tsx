'use client'
import React, { useState } from 'react'
import { X, Check, Package, Calendar, Building, AlertTriangle, FileText, User, Truck } from 'lucide-react'

interface ReceiveOrderModalProps {
  isOpen: boolean
  onClose: () => void
  onReceive: (id: string, receptionData: any) => void
  bonCommande: {
    id: string
    numeroBon: string
    dateCreation: string
    dateExpiration: string
    fournisseur: { 
      id: string
      nom: string
      email: string
      telephone: string
    }
    statut: string
    priorite: string
    produits: Array<{
      id: string
      nom: string
      type: 'produit' | 'matiere'
      quantite: number
      prixUnitaire: number
    }>
    commentaires: string
    montantTotal: number
    gestionnaire: string
  }
}

export default function ReceiveOrderModal({ 
  isOpen, 
  onClose, 
  onReceive, 
  bonCommande 
}: ReceiveOrderModalProps) {
  const [receptionData, setReceptionData] = useState({
    dateReception: new Date().toISOString().split('T')[0],
    heureReception: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    receptionnePar: '',
    numeroBonLivraison: '',
    transporteur: '',
    etatLivraison: 'Conforme',
    produitsRecus: bonCommande ? bonCommande.produits.map(p => ({
      ...p,
      quantiteRecue: p.quantite,
      etat: 'Conforme',
      commentaire: ''
    })) : [],
    commentairesReception: '',
    documentsJoints: [] as string[]
  })

  const [errors, setErrors] = useState({
    receptionnePar: '',
    numeroBonLivraison: ''
  })

  if (!isOpen || !bonCommande) return null

  const validateForm = () => {
    const newErrors = {
      receptionnePar: '',
      numeroBonLivraison: ''
    }

    if (!receptionData.receptionnePar.trim()) {
      newErrors.receptionnePar = 'Le nom de la personne qui réceptionne est requis'
    }

    if (!receptionData.numeroBonLivraison.trim()) {
      newErrors.numeroBonLivraison = 'Le numéro du bon de livraison est requis'
    }

    setErrors(newErrors)
    return !Object.values(newErrors).some(error => error !== '')
  }

  const handleReceive = () => {
    if (validateForm()) {
      onReceive(bonCommande.id, {
        dateReception: receptionData.dateReception,
        heureReception: receptionData.heureReception,
        ...receptionData
      })
    }
  }

  const updateProduitRecu = (produitId: string, field: string, value: any) => {
    setReceptionData({
      ...receptionData,
      produitsRecus: receptionData.produitsRecus.map(p => 
        p.id === produitId ? { ...p, [field]: value } : p
      )
    })
  }

  const getTotalQuantiteCommandee = () => {
    return bonCommande.produits.reduce((total, produit) => total + produit.quantite, 0)
  }

  const getTotalQuantiteRecue = () => {
    return receptionData.produitsRecus.reduce((total, produit) => total + produit.quantiteRecue, 0)
  }

  const getProduitsNonConformes = () => {
    return receptionData.produitsRecus.filter(p => p.etat !== 'Conforme').length
  }

  const isReceptionComplete = () => {
    return receptionData.produitsRecus.every(p => p.quantiteRecue === p.quantite)
  }

  const getMontantRecu = () => {
    return receptionData.produitsRecus.reduce((total, produit) => 
      total + (produit.quantiteRecue * produit.prixUnitaire), 0
    )
  }

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50 flex items-center justify-center p-4">
      <div className="relative bg-white rounded-xl shadow-xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-purple-100">
          <h3 className="text-xl font-semibold text-gray-900 flex items-center">
            <div className="p-2 bg-purple-500 rounded-lg mr-3">
              <Truck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-bold">Réception de commande</div>
              <div className="text-sm font-normal text-gray-600">
                Bon n° {bonCommande.numeroBon}
              </div>
            </div>
          </h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 rounded-full hover:bg-white/50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 space-y-6">
          
          {/* Résumé de la commande */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <FileText className="w-5 h-5 mr-2 text-blue-600" />
              Informations de la commande
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center text-sm text-blue-600 mb-1">
                  <Building className="w-4 h-4 mr-2" />
                  Fournisseur
                </div>
                <div className="font-bold text-gray-900">{bonCommande.fournisseur.nom}</div>
                <div className="text-sm text-gray-500">{bonCommande.fournisseur.email}</div>
              </div>
              
              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center text-sm text-blue-600 mb-1">
                  <Calendar className="w-4 h-4 mr-2" />
                  Date commande
                </div>
                <div className="font-bold text-gray-900">
                  {new Date(bonCommande.dateCreation).toLocaleDateString('fr-FR')}
                </div>
                <div className="text-sm text-gray-500">
                  Gestionnaire: {bonCommande.gestionnaire}
                </div>
              </div>

              <div className="bg-white p-4 rounded-lg border border-blue-200">
                <div className="flex items-center text-sm text-blue-600 mb-1">
                  <Package className="w-4 h-4 mr-2" />
                  Montant total
                </div>
                <div className="font-bold text-gray-900">
                  {bonCommande.montantTotal.toLocaleString()} DT
                </div>
                <div className="text-sm text-gray-500">
                  {bonCommande.produits.length} article{bonCommande.produits.length > 1 ? 's' : ''}
                </div>
              </div>
            </div>
          </div>

          {/* Informations de réception */}
          <div className="bg-green-50 border border-green-200 rounded-xl p-6">
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Truck className="w-5 h-5 mr-2 text-green-600" />
              Détails de la réception
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de réception *
                </label>
                <input
                  type="date"
                  value={receptionData.dateReception}
                  onChange={(e) => setReceptionData({ ...receptionData, dateReception: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  max={new Date().toISOString().split('T')[0]}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Heure de réception
                </label>
                <input
                  type="time"
                  value={receptionData.heureReception}
                  onChange={(e) => setReceptionData({ ...receptionData, heureReception: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Réceptionné par *
                </label>
                <input
                  type="text"
                  value={receptionData.receptionnePar}
                  onChange={(e) => {
                    setReceptionData({ ...receptionData, receptionnePar: e.target.value })
                    if (errors.receptionnePar) {
                      setErrors({ ...errors, receptionnePar: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                  État général
                </label>
                <select
                  value={receptionData.etatLivraison}
                  onChange={(e) => setReceptionData({ ...receptionData, etatLivraison: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                >
                  <option value="Conforme">✅ Conforme</option>
                  <option value="Partiellement conforme">⚠️ Partiellement conforme</option>
                  <option value="Non conforme">❌ Non conforme</option>
                  <option value="Endommagé">💔 Endommagé</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  N° bon de livraison *
                </label>
                <input
                  type="text"
                  value={receptionData.numeroBonLivraison}
                  onChange={(e) => {
                    setReceptionData({ ...receptionData, numeroBonLivraison: e.target.value })
                    if (errors.numeroBonLivraison) {
                      setErrors({ ...errors, numeroBonLivraison: '' })
                    }
                  }}
                  className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 ${
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
                  value={receptionData.transporteur}
                  onChange={(e) => setReceptionData({ ...receptionData, transporteur: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  placeholder="Nom du transporteur"
                />
              </div>
            </div>
          </div>

          {/* Détail par produit */}
          <div>
            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center">
              <Package className="w-5 h-5 mr-2 text-gray-600" />
              Vérification des articles reçus ({bonCommande.produits.length})
            </h4>
            
            <div className="space-y-4">
              {receptionData.produitsRecus.map((produit, index) => (
                <div key={produit.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-r from-purple-500 to-blue-600 rounded-full text-white font-bold text-lg shadow-lg">
                        {index + 1}
                      </div>
                      <div>
                        <h5 className="text-lg font-bold text-gray-900">{produit.nom}</h5>
                        <div className="flex items-center space-x-2 mt-1">
                          <div className={`w-3 h-3 rounded-full ${produit.type === 'produit' ? 'bg-blue-500' : 'bg-green-500'}`} />
                          <span className={`px-3 py-1 text-sm font-medium rounded-full border-2 ${
                            produit.type === 'produit' 
                              ? 'bg-blue-100 text-blue-800 border-blue-200' 
                              : 'bg-green-100 text-green-800 border-green-200'
                          }`}>
                            {produit.type === 'produit' ? '🔧 Produit' : '🧱 Matière première'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* Quantité commandée */}
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                      <div className="text-sm font-medium text-blue-700">Commandée</div>
                      <div className="text-xl font-bold text-blue-600">{produit.quantite}</div>
                    </div>

                    {/* Quantité reçue */}
                    <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                      <div className="text-sm font-medium text-green-700 mb-1">Reçue</div>
                      <input
                        type="number"
                        value={produit.quantiteRecue}
                        onChange={(e) => updateProduitRecu(produit.id, 'quantiteRecue', parseInt(e.target.value) || 0)}
                        className="w-full px-2 py-1 text-lg font-bold bg-white border border-green-300 rounded focus:ring-1 focus:ring-green-500 focus:border-green-500"
                        min="0"
                        max={produit.quantite}
                      />
                    </div>

                    {/* État */}
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="text-sm font-medium text-gray-700 mb-1">État</div>
                      <select
                        value={produit.etat}
                        onChange={(e) => updateProduitRecu(produit.id, 'etat', e.target.value)}
                        className="w-full px-2 py-1 text-sm bg-white border border-gray-300 rounded focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      >
                        <option value="Conforme">✅ Conforme</option>
                        <option value="Défectueux">⚠️ Défectueux</option>
                        <option value="Endommagé">💔 Endommagé</option>
                        <option value="Manquant">❌ Manquant</option>
                      </select>
                    </div>

                    {/* Prix et sous-total */}
                    <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                      <div className="text-sm font-medium text-purple-700">Sous-total</div>
                      <div className="text-lg font-bold text-purple-600">
                        {(produit.quantiteRecue * produit.prixUnitaire).toLocaleString()} DT
                      </div>
                      <div className="text-xs text-gray-500">
                        {produit.prixUnitaire} DT/unité
                      </div>
                    </div>
                  </div>

                  {/* Commentaire par produit */}
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Commentaire sur cet article
                    </label>
                    <input
                      type="text"
                      value={produit.commentaire}
                      onChange={(e) => updateProduitRecu(produit.id, 'commentaire', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                      placeholder="Observations spécifiques pour cet article..."
                    />
                  </div>

                  {/* Indicateur de conformité */}
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {produit.quantiteRecue === produit.quantite && produit.etat === 'Conforme' ? (
                        <>
                          <Check className="w-5 h-5 text-green-600" />
                          <span className="text-sm font-medium text-green-600">Article conforme et complet</span>
                        </>
                      ) : (
                        <>
                          <AlertTriangle className="w-5 h-5 text-orange-600" />
                          <span className="text-sm font-medium text-orange-600">
                            {produit.quantiteRecue !== produit.quantite && 'Quantité différente • '}
                            {produit.etat !== 'Conforme' && `État: ${produit.etat}`}
                          </span>
                        </>
                      )}
                    </div>
                    
                    {produit.quantiteRecue !== produit.quantite && (
                      <div className="text-sm">
                        <span className={`font-medium ${produit.quantiteRecue > produit.quantite ? 'text-blue-600' : 'text-red-600'}`}>
                          {produit.quantiteRecue > produit.quantite ? '+' : ''}{produit.quantiteRecue - produit.quantite}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Commentaires généraux */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Commentaires généraux sur la réception
            </label>
            <textarea
              value={receptionData.commentairesReception}
              onChange={(e) => setReceptionData({ ...receptionData, commentairesReception: e.target.value })}
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 resize-none"
              placeholder="Observations générales, problèmes rencontrés, qualité de l'emballage, ponctualité de la livraison..."
            />
            <div className="mt-1 text-xs text-gray-500">
              Ces commentaires seront ajoutés au historique de réception
            </div>
          </div>

          {/* Récapitulatif final */}
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 border-2 border-purple-300 rounded-xl p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
              <Check className="w-6 h-6 mr-2 text-purple-600" />
              Récapitulatif de la réception
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Quantité totale commandée:</span>
                  <span className="font-bold text-gray-900">{getTotalQuantiteCommandee()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Quantité totale reçue:</span>
                  <span className={`font-bold ${getTotalQuantiteRecue() === getTotalQuantiteCommandee() ? 'text-green-600' : 'text-orange-600'}`}>
                    {getTotalQuantiteRecue()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Articles non conformes:</span>
                  <span className={`font-bold ${getProduitsNonConformes() === 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {getProduitsNonConformes()}
                  </span>
                </div>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Montant commandé:</span>
                  <span className="font-bold text-gray-900">{bonCommande.montantTotal.toLocaleString()} DT</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">Montant reçu:</span>
                  <span className={`font-bold ${getMontantRecu() === bonCommande.montantTotal ? 'text-green-600' : 'text-orange-600'}`}>
                    {getMontantRecu().toLocaleString()} DT
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium text-gray-700">État général:</span>
                  <span className={`font-bold px-3 py-1 rounded-full text-sm ${
                    receptionData.etatLivraison === 'Conforme' ? 'bg-green-100 text-green-800' :
                    receptionData.etatLivraison === 'Partiellement conforme' ? 'bg-orange-100 text-orange-800' :
                    'bg-red-100 text-red-800'
                  }`}>
                    {receptionData.etatLivraison}
                  </span>
                </div>
              </div>
            </div>

            {/* Alertes */}
            {getMontantRecu() !== bonCommande.montantTotal && (
              <div className="mt-4 bg-orange-100 border border-orange-300 rounded-lg p-3">
                <div className="flex items-center text-orange-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    Différence de montant détectée: {(getMontantRecu() - bonCommande.montantTotal).toLocaleString()} DT
                  </span>
                </div>
              </div>
            )}

            {getProduitsNonConformes() > 0 && (
              <div className="mt-2 bg-red-100 border border-red-300 rounded-lg p-3">
                <div className="flex items-center text-red-800">
                  <AlertTriangle className="w-5 h-5 mr-2" />
                  <span className="font-medium">
                    {getProduitsNonConformes()} article{getProduitsNonConformes() > 1 ? 's' : ''} non conforme{getProduitsNonConformes() > 1 ? 's' : ''} - Vérifiez les actions à prendre
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 bg-gradient-to-r from-purple-50 to-blue-50 border-t border-gray-200 rounded-b-xl">
          <div className="text-sm text-gray-600">
            <span className="font-medium">Attention :</span> Cette action marquera le bon de commande comme "Reçu"
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Annuler
            </button>
            
            <button
              onClick={handleReceive}
              className="px-6 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2 shadow-sm"
            >
              <Check className="w-4 h-4" />
              <span>Confirmer la réception</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}