"use client";
import React, { useEffect } from "react";
import { X, AlertTriangle, Trash2, Loader } from "lucide-react";

export type DeleteItem = {
  id: string;
  name?: string;
};

type Props = {
  open: boolean;
  items?: DeleteItem[];
  loading?: boolean;
  onConfirm: (ids: string[]) => void;
  onClose: () => void;
};

export default function ClientDeleteModal({ 
  open, 
  items = [], 
  loading = false, 
  onConfirm, 
  onClose 
}: Props) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, loading]);

  if (!open) return null;

  const ids = items.map((i) => i.id);
  const names = items.map((i) => i.name ?? i.id);

  const previewList = () => {
    if (names.length === 0) return null;
    if (names.length <= 5) {
      return (
        <ul className="mt-3 space-y-2">
          {names.map((n, idx) => (
            <li key={idx} className="flex items-center text-sm text-gray-700 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <div className="w-2 h-2 bg-red-500 rounded-full mr-2"></div>
              {n}
            </li>
          ))}
        </ul>
      );
    }
    return (
      <div className="mt-3 bg-gray-50 px-4 py-3 rounded-lg border border-gray-200">
        <div className="text-sm text-gray-700">
          <span className="font-medium">{names.slice(0, 5).join(", ")}</span>
          <span className="text-gray-500"> et {names.length - 5} autre(s)</span>
        </div>
      </div>
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
    >
      <div className="relative bg-white rounded-2xl shadow-2xl max-w-lg w-full overflow-hidden">
        {/* Header avec dégradé rouge */}
        <div className="bg-gradient-to-r from-red-600 to-red-700 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16" />
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12" />
          
          <div className="relative z-10">
            <button
              onClick={() => !loading && onClose()}
              aria-label="Fermer"
              className="absolute right-0 top-0 text-white/80 hover:text-white transition-colors"
              disabled={loading}
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 id="delete-modal-title" className="text-xl font-bold">
                Confirmer la suppression
              </h3>
            </div>
            <p className="text-sm text-red-100">
              Cette action est <strong>irréversible</strong>. Les éléments sélectionnés seront définitivement supprimés.
            </p>
          </div>
        </div>

        {/* Body */}
        <div className="p-6">
          <div className="mb-4">
            {ids.length === 0 ? (
              <div className="text-center py-4">
                <p className="text-gray-600">Aucun élément sélectionné.</p>
              </div>
            ) : ids.length === 1 ? (
              <div>
                <p className="text-gray-800 mb-2">
                  Êtes-vous sûr de vouloir supprimer :
                </p>
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div className="flex items-center space-x-3">
                    <Trash2 className="w-5 h-5 text-red-600" />
                    <span className="font-semibold text-gray-900">{names[0]}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div>
                <p className="text-gray-800 mb-2">
                  Êtes-vous sûr de vouloir supprimer <strong className="text-red-600">{ids.length}</strong> éléments ?
                </p>
                {previewList()}
              </div>
            )}
          </div>

          {/* Warning box */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
              <div className="text-xs text-yellow-800 space-y-1">
                <p>• Les données liées (commandes, factures) ne seront pas forcément supprimées automatiquement selon la logique backend.</p>
                <p>• Pensez à vérifier avant d'exécuter l'opération.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            onClick={() => !loading && onClose()}
            className="px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-medium"
            disabled={loading}
          >
            Annuler
          </button>

          <button
            onClick={() => !loading && onConfirm(ids)}
            className={`inline-flex items-center px-6 py-2 rounded-lg text-white font-medium transition-all ${
              loading 
                ? "bg-red-400 cursor-not-allowed" 
                : "bg-red-600 hover:bg-red-700 shadow-lg hover:shadow-xl"
            }`}
            disabled={loading || ids.length === 0}
          >
            {loading ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Suppression...
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4 mr-2" />
                {ids.length <= 1 ? "Supprimer" : `Supprimer (${ids.length})`}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}