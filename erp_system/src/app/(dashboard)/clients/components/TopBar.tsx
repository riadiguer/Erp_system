"use client";
import React, { useRef } from "react";
import { Search, Plus, Upload, Download, Filter, X } from "lucide-react";

type Props = {
  query: string;
  onQueryChange: (q: string) => void;
  onNewClient?: () => void;
  onExport?: () => void;
  onImport?: (files: File[]) => void;
  onOpenFilters?: () => void;
};

export default function TopBar({
  query,
  onQueryChange,
  onNewClient = () => {},
  onExport = () => {},
  onImport = () => {},
  onOpenFilters = () => {},
}: Props) {
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFileChosen = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    const arr = Array.from(files);
    onImport(arr);
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4">
      <div className="flex flex-col md:flex-row md:items-center gap-3">
        {/* Search Bar */}
        <div className="flex-1 relative">
          <div className="relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => onQueryChange(e.target.value)}
              placeholder="Rechercher un client (nom, email, téléphone)..."
              className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              aria-label="Recherche client"
            />
            {query && (
              <button
                onClick={() => onQueryChange("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Effacer recherche"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2">
          {/* Filters Button */}
          <button
            onClick={onOpenFilters}
            className="inline-flex items-center px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            title="Filtres avancés"
            aria-label="Filtres"
          >
            <Filter className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Filtres</span>
          </button>

          {/* Import Button */}
          <input
            ref={fileRef}
            type="file"
            accept=".csv,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            multiple
            onChange={handleFileChosen}
            className="hidden"
          />
          <button
            onClick={() => fileRef.current?.click()}
            className="inline-flex items-center px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            title="Importer des clients (CSV, Excel)"
            aria-label="Importer"
          >
            <Upload className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Importer</span>
          </button>

          {/* Export Button */}
          <button
            onClick={onExport}
            className="inline-flex items-center px-3 py-2.5 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            title="Exporter (Excel, PDF)"
            aria-label="Exporter"
          >
            <Download className="w-4 h-4 md:mr-2" />
            <span className="hidden md:inline">Exporter</span>
          </button>

          {/* New Client Button */}
          <button
            onClick={onNewClient}
            className="inline-flex items-center px-4 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
            title="Nouveau client"
            aria-label="Nouveau client"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nouveau
          </button>
        </div>
      </div>

      {/* Quick Stats/Info (optional) */}
      {query && (
        <div className="mt-3 pt-3 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            Recherche active : <span className="font-medium text-gray-900">"{query}"</span>
          </p>
        </div>
      )}
    </div>
  );
}