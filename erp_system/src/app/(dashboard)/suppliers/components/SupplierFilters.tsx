"use client";

import { X, Search, RotateCcw, Filter } from "lucide-react";
import { useState } from "react";

interface SupplierFiltersProps {
  open: boolean;
  onClose: () => void;
}

export default function SupplierFilters({ open, onClose }: SupplierFiltersProps) {
  const [filters, setFilters] = useState({
    name: "",
    contact: "",
    nif: "",
    payment: "",
    status: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ name: "", contact: "", nif: "", payment: "", status: "" });
  };

  const handleApply = () => {
    console.log("Filtres appliqués :", filters);
    onClose();
  };

  if (!open) return null;

  const InputField = ({
    label,
    name,
    type = "text",
    placeholder,
    value,
  }: {
    label: string;
    name: string;
    type?: string;
    placeholder: string;
    value: string;
  }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <input
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        placeholder={placeholder}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 hover:border-gray-300"
      />
    </div>
  );

  const SelectField = ({
    label,
    name,
    options,
    value,
  }: {
    label: string;
    name: string;
    options: { value: string; label: string }[];
    value: string;
  }) => (
    <div className="group">
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <select
        name={name}
        value={value}
        onChange={handleChange}
        className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all duration-200 hover:border-gray-300 bg-white"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex justify-end z-50 animate-in fade-in duration-200">
      <div className="bg-white w-full sm:w-[420px] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* Header */}
        <div className="flex-shrink-0 bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                <Filter className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Filtres</h2>
                <p className="text-sm text-blue-100">Affinez votre recherche</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-white/80 hover:text-white hover:bg-white/20 transition-all duration-200"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto px-6 py-6 bg-gray-50">
          <div className="space-y-5">
            
            {/* Section: Informations générales */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Informations générales
              </h3>
              <div className="space-y-4">
                <InputField
                  label="Nom du fournisseur"
                  name="name"
                  placeholder="ex: Global Print"
                  value={filters.name}
                />

                <InputField
                  label="Contact principal"
                  name="contact"
                  placeholder="ex: Ahmed Benali"
                  value={filters.contact}
                />
              </div>
            </div>

            {/* Section: Informations fiscales */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Informations fiscales
              </h3>
              <InputField
                label="NIF / RC"
                name="nif"
                placeholder="ex: 0123456789"
                value={filters.nif}
              />
            </div>

            {/* Section: Conditions commerciales */}
            <div className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm">
              <h3 className="text-sm font-bold text-gray-900 mb-4 uppercase tracking-wide">
                Conditions commerciales
              </h3>
              <div className="space-y-4">
                <SelectField
                  label="Mode de paiement"
                  name="payment"
                  value={filters.payment}
                  options={[
                    { value: "", label: "Tous" },
                    { value: "cash", label: "Espèces" },
                    { value: "bank", label: "Virement bancaire" },
                    { value: "check", label: "Chèque" },
                    { value: "credit", label: "Crédit" },
                  ]}
                />

                <SelectField
                  label="Statut"
                  name="status"
                  value={filters.status}
                  options={[
                    { value: "", label: "Tous" },
                    { value: "active", label: "Actif" },
                    { value: "inactive", label: "Inactif" },
                    { value: "pending", label: "En attente" },
                  ]}
                />
              </div>
            </div>

            {/* Compteur de filtres actifs */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Search className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-semibold text-blue-900">
                    Filtres actifs
                  </span>
                </div>
                <span className="px-3 py-1 bg-blue-600 text-white text-sm font-bold rounded-full">
                  {Object.values(filters).filter(v => v !== "").length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer - Actions */}
        <div className="flex-shrink-0 px-6 py-4 bg-white border-t border-gray-200 shadow-lg">
          <div className="flex items-center gap-3">
            <button
              onClick={handleReset}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Réinitialiser</span>
            </button>
            <button
              onClick={handleApply}
              className="flex-1 flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300 transition-all duration-200 hover:scale-105"
            >
              <Search className="w-4 h-4" />
              <span>Appliquer</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}