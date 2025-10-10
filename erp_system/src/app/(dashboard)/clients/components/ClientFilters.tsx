"use client";
import React, { useEffect, useState } from "react";
import { Search, X, Filter, Calendar, SlidersHorizontal } from "lucide-react";

export type ClientFilters = {
  query?: string;
  status?: "" | "Actif" | "Inactif";
  type?: "" | "Particulier" | "Société";
  dateFrom?: string;
  dateTo?: string;
  sortBy?: string;
};

type Props = {
  value?: ClientFilters;
  onChange?: (filters: ClientFilters) => void;
  onReset?: () => void;
};

export default function ClientFilters({ 
  value = {}, 
  onChange = () => {}, 
  onReset = () => {} 
}: Props) {
  const [local, setLocal] = useState<ClientFilters>({
    query: value.query ?? "",
    status: value.status ?? "",
    type: value.type ?? "",
    dateFrom: value.dateFrom ?? "",
    dateTo: value.dateTo ?? "",
    sortBy: value.sortBy ?? "",
  });

  useEffect(() => {
    setLocal({
      query: value.query ?? "",
      status: value.status ?? "",
      type: value.type ?? "",
      dateFrom: value.dateFrom ?? "",
      dateTo: value.dateTo ?? "",
      sortBy: value.sortBy ?? "",
    });
  }, [value]);

  useEffect(() => {
    const t = setTimeout(() => {
      onChange(cleanFilters(local));
    }, 250);
    return () => clearTimeout(t);
  }, [local.query]);

  useEffect(() => {
    onChange(cleanFilters(local));
  }, [local.status, local.type, local.dateFrom, local.dateTo, local.sortBy]);

  function cleanFilters(f: ClientFilters): ClientFilters {
    const out: ClientFilters = {};
    if (f.query && f.query.trim() !== "") out.query = f.query.trim();
    if (f.status && f.status !== "") out.status = f.status;
    if (f.type && f.type !== "") out.type = f.type;
    if (f.dateFrom) out.dateFrom = f.dateFrom;
    if (f.dateTo) out.dateTo = f.dateTo;
    if (f.sortBy) out.sortBy = f.sortBy;
    return out;
  }

  const handleReset = () => {
    const cleared: ClientFilters = { 
      query: "", 
      status: "", 
      type: "", 
      dateFrom: "", 
      dateTo: "", 
      sortBy: "" 
    };
    setLocal(cleared);
    onReset();
    onChange({});
  };

  const activeCount = Object.keys(cleanFilters(local)).length;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Filter className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900">Filtres</h4>
              <p className="text-sm text-gray-500">
                {activeCount > 0 ? `${activeCount} filtre(s) actif(s)` : "Aucun filtre actif"}
              </p>
            </div>
          </div>
          
          {activeCount > 0 && (
            <button
              onClick={handleReset}
              className="inline-flex items-center px-3 py-1.5 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              <X className="w-4 h-4 mr-1" />
              Réinitialiser
            </button>
          )}
        </div>

        {/* Search bar */}
        <div className="relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            value={local.query ?? ""}
            onChange={(e) => setLocal((s) => ({ ...s, query: e.target.value }))}
            placeholder="Recherche (nom, email, téléphone)..."
            className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
            aria-label="Recherche client"
          />
          {local.query && (
            <button
              onClick={() => setLocal((s) => ({ ...s, query: "" }))}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      <div className="p-4">
        {/* Advanced filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Statut</label>
            <select
              value={local.status ?? ""}
              onChange={(e) => setLocal((s) => ({ ...s, status: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filtrer par statut"
            >
              <option value="">Tous statuts</option>
              <option value="Actif">Actif</option>
              <option value="Inactif">Inactif</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5">Type</label>
            <select
              value={local.type ?? ""}
              onChange={(e) => setLocal((s) => ({ ...s, type: e.target.value as any }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Filtrer par type"
            >
              <option value="">Tous types</option>
              <option value="Particulier">Particulier</option>
              <option value="Société">Société</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Date de début
            </label>
            <input
              type="date"
              value={local.dateFrom ?? ""}
              onChange={(e) => setLocal((s) => ({ ...s, dateFrom: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Date de début"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              Date de fin
            </label>
            <input
              type="date"
              value={local.dateTo ?? ""}
              onChange={(e) => setLocal((s) => ({ ...s, dateTo: e.target.value }))}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Date de fin"
            />
          </div>
        </div>

        <div className="mb-4">
          <label className="block text-xs font-medium text-gray-700 mb-1.5 flex items-center gap-1">
            <SlidersHorizontal className="w-3 h-3" />
            Trier par
          </label>
          <select
            value={local.sortBy ?? ""}
            onChange={(e) => setLocal((s) => ({ ...s, sortBy: e.target.value }))}
            className="w-full md:w-64 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            aria-label="Trier par"
          >
            <option value="">Par défaut</option>
            <option value="createdAt_desc">Ajouté (récent)</option>
            <option value="createdAt_asc">Ajouté (ancien)</option>
            <option value="balance_desc">Solde (décroissant)</option>
            <option value="balance_asc">Solde (croissant)</option>
          </select>
        </div>

        {/* Quick filter chips */}
        <div>
          <div className="text-xs font-medium text-gray-700 mb-2">Filtres rapides</div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setLocal((s) => ({ ...s, status: s.status === "Actif" ? "" : "Actif" }))}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                local.status === "Actif" 
                  ? "bg-green-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Actifs
            </button>

            <button
              onClick={() => setLocal((s) => ({ ...s, status: s.status === "Inactif" ? "" : "Inactif" }))}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                local.status === "Inactif" 
                  ? "bg-gray-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Inactifs
            </button>

            <button
              onClick={() => setLocal((s) => ({ ...s, type: s.type === "Particulier" ? "" : "Particulier" }))}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                local.type === "Particulier" 
                  ? "bg-blue-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Particuliers
            </button>

            <button
              onClick={() => setLocal((s) => ({ ...s, type: s.type === "Société" ? "" : "Société" }))}
              className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                local.type === "Société" 
                  ? "bg-purple-600 text-white shadow-md" 
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              Sociétés
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}