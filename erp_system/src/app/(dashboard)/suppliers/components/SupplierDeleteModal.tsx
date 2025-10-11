"use client";

import { AlertTriangle, X, Trash2, Shield } from "lucide-react";

interface SupplierDeleteModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: any;
}

export default function SupplierDeleteModal({
  open,
  onClose,
  supplier,
}: SupplierDeleteModalProps) {
  if (!open) return null;

  const handleDelete = () => {
    console.log("Fournisseur supprimé :", supplier?.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform animate-in zoom-in-95 duration-200">
        
        {/* Header avec icône d'alerte */}
        <div className="relative px-6 pt-6 pb-4">
          {/* Decorative background */}
          <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-br from-red-50 to-orange-50 rounded-t-2xl opacity-50"></div>
          
          <div className="relative flex items-start justify-between">
            <div className="flex items-start space-x-4">
              {/* Icon avec animation */}
              <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg shadow-red-200 flex items-center justify-center animate-pulse">
                <AlertTriangle className="w-7 h-7 text-white" />
              </div>
              
              <div>
                <h2 className="text-xl font-bold text-gray-900 mb-1">
                  Confirmer la suppression
                </h2>
                <p className="text-sm text-gray-600">
                  Cette action est irréversible
                </p>
              </div>
            </div>
            
            {/* Bouton fermer */}
            <button
              onClick={onClose}
              className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Corps du modal */}
        <div className="px-6 py-4 space-y-4">
          {/* Nom du fournisseur en surbrillance */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4">
            <p className="text-sm text-gray-700 mb-2">
              Vous êtes sur le point de supprimer le fournisseur :
            </p>
            <p className="text-lg font-bold text-red-600">
              {supplier?.name || "—"}
            </p>
          </div>

          {/* Avertissement détaillé */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Shield className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-gray-700 space-y-2">
                <p className="font-semibold text-amber-900">
                  Données qui seront supprimées :
                </p>
                <ul className="list-disc list-inside space-y-1 text-gray-600">
                  <li>Toutes les informations du fournisseur</li>
                  <li>Historique des commandes</li>
                  <li>Factures et paiements associés</li>
                  <li>Documents joints</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Message final */}
          <p className="text-sm text-gray-600 text-center">
            Cette opération ne peut pas être annulée.
          </p>
        </div>

        {/* Footer avec boutons */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-medium hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            Annuler
          </button>
          <button
            onClick={handleDelete}
            className="group px-5 py-2.5 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-semibold shadow-lg shadow-red-200 hover:shadow-xl hover:shadow-red-300 transition-all duration-200 hover:scale-105 flex items-center space-x-2"
          >
            <Trash2 className="w-4 h-4 group-hover:rotate-12 transition-transform duration-200" />
            <span>Supprimer définitivement</span>
          </button>
        </div>
      </div>
    </div>
  );
}