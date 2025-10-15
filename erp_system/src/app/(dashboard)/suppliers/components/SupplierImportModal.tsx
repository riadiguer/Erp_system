"use client";

import { X, UploadCloud, FileSpreadsheet, CheckCircle, AlertCircle, Download, Info } from "lucide-react";
import { useState } from "react";

interface SupplierImportModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: (imported?: any) => void;
}

export default function SupplierImportModal({ open, onClose }: SupplierImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle");
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setStatus("idle");
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0]);
      setStatus("idle");
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleImport = () => {
    if (!file) {
      setStatus("error");
      return;
    }

    console.log("Fichier importé :", file.name);
    setStatus("success");
    setTimeout(() => {
      onClose();
      setFile(null);
      setStatus("idle");
    }, 2000);
  };

  const handleDownloadTemplate = () => {
    console.log("Téléchargement du modèle Excel...");
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl transform animate-in zoom-in-95 duration-200 overflow-hidden">
        
        {/* Header */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-600 to-teal-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA3IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
          
          <div className="relative z-10 px-6 py-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 bg-white/20 backdrop-blur-xl rounded-xl shadow-lg border border-white/30">
                  <UploadCloud className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">Importer des fournisseurs</h2>
                  <p className="text-sm text-green-100">Importez vos données depuis Excel ou CSV</p>
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
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          
          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-900">
                <p className="font-semibold mb-2">Format du fichier requis :</p>
                <ul className="list-disc list-inside space-y-1 text-blue-800">
                  <li>Nom du fournisseur</li>
                  <li>Contact principal</li>
                  <li>Téléphone</li>
                  <li>Email</li>
                  <li>NIF / RC</li>
                  <li>Mode de paiement</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Template Download */}
          <button
            onClick={handleDownloadTemplate}
            className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Download className="w-5 h-5" />
            <span>Télécharger le modèle Excel</span>
          </button>

          {/* Upload Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            className={`relative border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
              isDragging
                ? "border-green-500 bg-green-50 scale-105"
                : status === "success"
                ? "border-green-400 bg-green-50"
                : status === "error"
                ? "border-red-400 bg-red-50"
                : "border-gray-300 bg-gray-50 hover:border-green-400 hover:bg-green-50/50"
            }`}
          >
            <div className="flex flex-col items-center justify-center text-center space-y-4">
              {/* Icon */}
              <div
                className={`p-4 rounded-2xl transition-all duration-300 ${
                  status === "success"
                    ? "bg-green-100"
                    : status === "error"
                    ? "bg-red-100"
                    : "bg-blue-100"
                }`}
              >
                {status === "success" ? (
                  <CheckCircle className="w-12 h-12 text-green-600" />
                ) : status === "error" ? (
                  <AlertCircle className="w-12 h-12 text-red-600" />
                ) : (
                  <FileSpreadsheet className="w-12 h-12 text-blue-600" />
                )}
              </div>

              {/* Text */}
              {status === "success" ? (
                <div>
                  <p className="text-lg font-bold text-green-600">Fichier prêt à importer !</p>
                  <p className="text-sm text-green-700 mt-1">{file?.name}</p>
                </div>
              ) : status === "error" ? (
                <div>
                  <p className="text-lg font-bold text-red-600">Veuillez sélectionner un fichier</p>
                  <p className="text-sm text-red-700 mt-1">Aucun fichier détecté</p>
                </div>
              ) : file ? (
                <div>
                  <p className="text-base font-semibold text-gray-900">{file.name}</p>
                  <p className="text-sm text-gray-600 mt-1">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-base font-semibold text-gray-700 mb-1">
                    Glissez votre fichier ici
                  </p>
                  <p className="text-sm text-gray-500">ou cliquez pour parcourir</p>
                </div>
              )}

              {/* Hidden Input */}
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileChange}
                className="hidden"
                id="fileUpload"
              />
              
              {!file && (
                <label
                  htmlFor="fileUpload"
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200 cursor-pointer hover:scale-105"
                >
                  Sélectionner un fichier
                </label>
              )}

              {file && (
                <button
                  onClick={() => {
                    setFile(null);
                    setStatus("idle");
                  }}
                  className="text-sm text-red-600 hover:text-red-700 font-medium underline"
                >
                  Changer le fichier
                </button>
              )}
            </div>
          </div>

          {/* Supported Formats */}
          <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
            <FileSpreadsheet className="w-4 h-4" />
            <span>Formats acceptés : .xlsx, .xls, .csv</span>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2.5 border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            Annuler
          </button>
          <button
            onClick={handleImport}
            disabled={!file}
            className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-white shadow-lg transition-all duration-200 hover:scale-105 ${
              file
                ? "bg-gradient-to-r from-green-600 to-emerald-600 hover:shadow-xl"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            <UploadCloud className="w-4 h-4" />
            <span>Importer les données</span>
          </button>
        </div>
      </div>
    </div>
  );
}