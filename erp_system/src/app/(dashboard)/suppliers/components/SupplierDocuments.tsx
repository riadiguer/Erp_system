"use client";

import { Paperclip, Eye, Download, Upload, FileText, File, Trash2 } from "lucide-react";

interface SupplierDocumentsProps {
  supplier?: any;
}

export default function SupplierDocuments({ supplier }: SupplierDocumentsProps) {
  // Données fictives – à remplacer par les vrais fichiers depuis la base de données
  const documents = supplier?.documents || [
    {
      id: 1,
      name: "Contrat de collaboration",
      type: "Contrat",
      date: "2025-04-15",
      fileUrl: "#",
      size: "2.4 MB",
      icon: FileText,
    },
    {
      id: 2,
      name: "Relevé d'identité bancaire (RIB)",
      type: "RIB",
      date: "2025-01-03",
      fileUrl: "#",
      size: "156 KB",
      icon: File,
    },
    {
      id: 3,
      name: "Attestation fiscale",
      type: "Attestation",
      date: "2024-12-20",
      fileUrl: "#",
      size: "892 KB",
      icon: FileText,
    },
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case "Contrat":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "RIB":
        return "bg-green-50 text-green-700 border-green-200";
      case "Attestation":
        return "bg-purple-50 text-purple-700 border-purple-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

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
              <p className="text-sm text-gray-600">{documents.length} fichiers disponibles</p>
            </div>
          </div>
          <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
            <Upload className="w-4 h-4" />
            <span>Ajouter un document</span>
          </button>
        </div>
      </div>

      {/* Liste des documents */}
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
                    <span>Ajouté le {doc.date}</span>
                    <span>•</span>
                    <span>{doc.size}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <button
                  className="p-2.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                  title="Afficher"
                >
                  <Eye className="w-4 h-4" />
                </button>
                <button
                  className="p-2.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-110"
                  title="Télécharger"
                >
                  <Download className="w-4 h-4" />
                </button>
                <button
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

      {/* Empty state si pas de documents */}
      {documents.length === 0 && (
        <div className="flex flex-col items-center justify-center py-12 px-6">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Paperclip className="w-8 h-8 text-gray-400" />
          </div>
          <h5 className="text-lg font-semibold text-gray-900 mb-1">
            Aucun document
          </h5>
          <p className="text-sm text-gray-600 text-center mb-4">
            Commencez par ajouter des documents pour ce fournisseur
          </p>
          <button className="flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105">
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
    </div>
  );
}