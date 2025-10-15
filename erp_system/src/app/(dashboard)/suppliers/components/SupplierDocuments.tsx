"use client";

import { Paperclip, Eye, Download, Upload, FileText, File, Trash2, AlertCircle } from "lucide-react";
import { useState } from "react";
import { Supplier } from "@/lib/features/warehouse/types";
import { toast } from "sonner";

interface SupplierDocumentsProps {
  supplier?: Supplier | null;
}

// Document type definition (add this to your types.ts later)
type SupplierDocument = {
  id: number;
  name: string;
  type: string;
  date: string;
  fileUrl: string;
  size: string;
  icon: any;
};

export default function SupplierDocuments({ supplier }: SupplierDocumentsProps) {
  const [uploading, setUploading] = useState(false);

  // Mock documents - Replace with real API call when document management is implemented
  // TODO: Create backend endpoint for supplier documents
  const documents: SupplierDocument[] = [];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Contrat":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "RIB":
        return "bg-green-50 text-green-700 border-green-200";
      case "Attestation":
        return "bg-purple-50 text-purple-700 border-purple-200";
      case "Facture":
        return "bg-amber-50 text-amber-700 border-amber-200";
      case "Autre":
        return "bg-gray-50 text-gray-700 border-gray-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const handleUpload = () => {
    // TODO: Implement file upload
    toast.info("Fonctionnalité de téléversement en développement");
  };

  const handleView = (doc: SupplierDocument) => {
    // TODO: Open document in new tab or modal
    toast.info(`Ouverture de: ${doc.name}`);
  };

  const handleDownload = (doc: SupplierDocument) => {
    // TODO: Download document
    toast.info(`Téléchargement de: ${doc.name}`);
  };

  const handleDelete = (doc: SupplierDocument) => {
    // TODO: Implement delete with confirmation
    toast.info(`Suppression de: ${doc.name}`);
  };

  if (!supplier) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <AlertCircle className="w-12 h-12 text-gray-400 mb-3" />
          <p className="text-gray-500">Aucun fournisseur sélectionné</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-purple-50/30 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-600 rounded-lg shadow-lg">
              <Paperclip className="w-5 h-5 text-white" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-gray-900">Documents</h4>
              <p className="text-sm text-gray-600">
                {documents.length} fichier{documents.length !== 1 ? 's' : ''} disponible{documents.length !== 1 ? 's' : ''}
              </p>
            </div>
          </div>
          <button 
            onClick={handleUpload}
            disabled={uploading}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            <span>{uploading ? 'Téléversement...' : 'Ajouter un document'}</span>
          </button>
        </div>
      </div>

      {/* Liste des documents */}
      {documents.length > 0 ? (
        <div className="divide-y divide-gray-100">
          {documents.map((doc) => {
            const IconComponent = doc.icon;
            return (
              <div
                key={doc.id}
                className="group flex items-center justify-between p-5 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200"
              >
                <div className="flex items-center space-x-4 flex-1 min-w-0">
                  {/* Icône du fichier */}
                  <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <IconComponent className="w-6 h-6 text-gray-600" />
                  </div>

                  {/* Informations du document */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="text-sm font-semibold text-gray-900 truncate">
                        {doc.name}
                      </h5>
                      <span
                        className={`px-2.5 py-0.5 text-xs font-semibold rounded-full border ${getTypeColor(
                          doc.type
                        )}`}
                      >
                        {doc.type}
                      </span>
                    </div>
                    <div className="flex items-center space-x-3 text-xs text-gray-500">
                      <span>Ajouté le {new Date(doc.date).toLocaleDateString('fr-FR')}</span>
                      <span>•</span>
                      <span>{doc.size}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <button
                    onClick={() => handleView(doc)}
                    className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                    title="Afficher"
                  >
                    <Eye className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDownload(doc)}
                    className="p-2.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-110"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(doc)}
                    className="p-2.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-all duration-200 hover:scale-110"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty state */
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Paperclip className="w-8 h-8 text-gray-400" />
          </div>
          <h5 className="text-lg font-semibold text-gray-900 mb-1">
            Aucun document
          </h5>
          <p className="text-sm text-gray-600 text-center mb-4">
            Commencez par ajouter des documents pour {supplier.name}
          </p>
          <button 
            onClick={handleUpload}
            className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Upload className="w-4 h-4" />
            <span>Ajouter un document</span>
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm">
          <p className="text-gray-600">
            Formats acceptés : PDF, DOC, DOCX, XLS, XLSX, JPG, PNG
          </p>
          <p className="text-gray-500">
            Taille max : <span className="font-semibold text-gray-700">10 MB</span>
          </p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-blue-50 border-t border-blue-100 px-6 py-3">
        <p className="text-xs text-center text-blue-700">
          💡 <span className="font-semibold">Note:</span> La gestion des documents sera disponible prochainement
        </p>
      </div>
    </div>
  );
}