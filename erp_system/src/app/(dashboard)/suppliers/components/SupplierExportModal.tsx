"use client";

import { X, FileSpreadsheet, FileText, Download, Check } from "lucide-react";
import { useState } from "react";
import type { Supplier } from "@/lib/features/warehouse/types";

type FormatValue = "pdf" | "excel";
type ScopeValue  = "all" | "selected" | "details";

interface SupplierExportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (exported?: { format: FormatValue; scope: ScopeValue }) => void;
  suppliers?: Supplier[]; // ✅ add this
}

export default function SupplierExportModal({ open, onClose , onSuccess,
  suppliers = [],}: SupplierExportModalProps) {
  const [format, setFormat] = useState<"pdf" | "excel" | "">("");
  const [scope, setScope] = useState<"all" | "selected" | "details" | "">("");

  const handleExport = () => {
    if (!format || !scope) return alert("Veuillez sélectionner un format et une portée.");
    console.log("Export demandé :", { format, scope });
    onClose();
  };

  if (!open) return null;

  const FormatButton = ({ 
    value, 
    icon: Icon, 
    label, 
    color,
    gradientFrom,
    gradientTo 
  }: any) => (
    <button
      type="button"
      onClick={() => setFormat(value)}
      className={`relative flex items-center justify-center space-x-3 px-6 py-4 rounded-xl border-2 transition-all duration-200 ${
        format === value
          ? `bg-gradient-to-r ${gradientFrom} ${gradientTo} text-white border-transparent shadow-lg scale-105`
          : "border-gray-300 hover:border-gray-400 hover:bg-gray-50"
      }`}
    >
      {format === value && (
        <div className="absolute -top-2 -right-2 w-6 h-6 bg-white rounded-full flex items-center justify-center shadow-lg">
          <Check className="w-4 h-4 text-green-600" />
        </div>
      )}
      <Icon className={`w-6 h-6 ${format === value ? "text-white" : color}`} />
      <span className="font-semibold">{label}</span>
    </button>
  );

  const ScopeOption = ({ value, label, description }: any) => (
    <label className={`flex items-start space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
      scope === value
        ? "border-blue-600 bg-blue-50 shadow-md"
        : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
    }`}>
      <input
        type="radio"
        name="scope"
        value={value}
        checked={scope === value}
        onChange={() => setScope(value)}
        className="mt-1 w-5 h-5 text-blue-600 focus:ring-2 focus:ring-blue-500"
      />
      <div className="flex-1">
        <p className={`font-semibold mb-1 ${scope === value ? "text-blue-900" : "text-gray-900"}`}>
          {label}
        </p>
        <p className="text-sm text-gray-600">{description}</p>
      </div>
      {scope === value && (
        <Check className="w-5 h-5 text-blue-600 flex-shrink-0" />
      )}
    </label>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="relative px-6 py-5 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>
          
          <div className="relative flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl shadow-lg">
                <Download className="w-6 h-6 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  Exporter les fournisseurs
                </h2>
                <p className="text-sm text-gray-600">
                  Choisissez le format et la portée
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenu */}
        <div className="p-6 space-y-6">
          
          {/* Choix du format */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Format d'exportation
            </label>
            <div className="grid grid-cols-2 gap-4">
              <FormatButton
                value="pdf"
                icon={FileText}
                label="PDF"
                color="text-red-600"
                gradientFrom="from-red-500"
                gradientTo="to-red-600"
              />
              <FormatButton
                value="excel"
                icon={FileSpreadsheet}
                label="Excel"
                color="text-green-600"
                gradientFrom="from-green-500"
                gradientTo="to-green-600"
              />
            </div>
          </div>

          {/* Portée d'export */}
          <div>
            <label className="block text-sm font-bold text-gray-900 mb-3">
              Portée des données
            </label>
            <div className="space-y-3">
              <ScopeOption
                value="all"
                label="Liste complète"
                description="Exporter tous les fournisseurs avec leurs informations de base"
              />
              <ScopeOption
                value="selected"
                label="Fournisseurs sélectionnés"
                description="Exporter uniquement les fournisseurs que vous avez cochés"
              />
              <ScopeOption
                value="details"
                label="Fiches détaillées"
                description="Générer un PDF individuel pour chaque fournisseur avec historique complet"
              />
            </div>
          </div>

          {/* Aperçu de la sélection */}
          {format && scope && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 animate-in fade-in slide-in-from-top-2 duration-300">
              <div className="flex items-start space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Check className="w-5 h-5 text-blue-600" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-blue-900 mb-1">
                    Prêt à exporter
                  </p>
                  <p className="text-sm text-blue-700">
                    Format : <span className="font-bold">{format.toUpperCase()}</span> • 
                    Portée : <span className="font-bold">
                      {scope === "all" ? "Liste complète" : scope === "selected" ? "Sélectionnés" : "Fiches détaillées"}
                    </span>
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-5 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={!format || !scope}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold shadow-lg transition-all duration-200 ${
              format && scope
                ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:shadow-xl hover:scale-105"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Download className="w-4 h-4" />
            <span>Exporter maintenant</span>
          </button>
        </div>
      </div>
    </div>
  );
}