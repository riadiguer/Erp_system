"use client";
import React, { useState, useRef } from "react";
import { 
  Upload, 
  Download, 
  Eye, 
  Trash2, 
  File, 
  FileText, 
  Image as ImageIcon,
  X,
  Loader,
  FolderOpen
} from "lucide-react";

export type DocumentItem = {
  id: string;
  name: string;
  url?: string;
  type?: string;
  date?: string;
  size?: number;
};

type Props = {
  documents?: DocumentItem[];
  maxItems?: number;
  accept?: string;
  onUpload?: (files: File[]) => Promise<DocumentItem[]> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onDownload?: (doc: DocumentItem) => void;
};

const MOCK: DocumentItem[] = [
  { id: "d1", name: "Contrat_Client_Amine.pdf", date: "2024-11-12", type: "application/pdf", size: 124_000, url: "#" },
  { id: "d2", name: "Facture_2025-08.pdf", date: "2025-08-21", type: "application/pdf", size: 24_560, url: "#" },
];

function formatBytes(bytes?: number) {
  if (!bytes && bytes !== 0) return "-";
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileIcon(type?: string) {
  if (type?.startsWith("image/")) return <ImageIcon className="w-5 h-5" />;
  if (type === "application/pdf") return <FileText className="w-5 h-5" />;
  return <File className="w-5 h-5" />;
}

export default function ClientDocuments({
  documents = MOCK,
  maxItems = 50,
  accept = ".pdf,.docx,application/pdf,image/*",
  onUpload,
  onDelete,
  onDownload,
}: Props) {
  const [items, setItems] = useState<DocumentItem[]>(documents.slice(0, maxItems));
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<{ name: string; mime?: string; dataUrl?: string } | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  const triggerFileInput = () => inputRef.current?.click();

  const handleFilesSelected = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    const files = Array.from(filesList);
    setUploading(true);

    try {
      if (onUpload) {
        const res = await onUpload(files);
        if (Array.isArray(res) && res.length > 0) {
          setItems((prev) => [...res, ...prev].slice(0, maxItems));
        } else {
          const placeholders = files.map((f) => ({
            id: `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
            name: f.name,
            type: f.type || undefined,
            date: new Date().toISOString().slice(0, 10),
            size: f.size,
            url: undefined,
          }));
          setItems((prev) => [...placeholders, ...prev].slice(0, maxItems));
        }
      } else {
        const placeholders = files.map((f) => ({
          id: `local_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`,
          name: f.name,
          type: f.type || undefined,
          date: new Date().toISOString().slice(0, 10),
          size: f.size,
          url: undefined,
        }));
        setItems((prev) => [...placeholders, ...prev].slice(0, maxItems));
      }
    } catch (err) {
      console.error("Upload error", err);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  };

  const handleDelete = async (doc: DocumentItem) => {
    const ok = confirm(`Supprimer le document "${doc.name}" ? Cette action est irréversible.`);
    if (!ok) return;
    try {
      if (onDelete) await onDelete(doc.id);
      setItems((prev) => prev.filter((d) => d.id !== doc.id));
    } catch (err) {
      console.error("Delete failed", err);
      alert("Impossible de supprimer le document (voir console).");
    }
  };

  const handleDownload = (doc: DocumentItem) => {
    if (onDownload) return onDownload(doc);
    if (doc.url && doc.url !== "#") {
      window.open(doc.url, "_blank", "noopener");
      return;
    }
    alert("Téléchargement non disponible pour ce document (URL manquante).");
  };

  const handlePreview = (doc: DocumentItem) => {
    if (!doc.url) {
      alert("Aperçu non disponible (URL manquante).");
      return;
    }
    if (doc.type?.startsWith("image/")) {
      setPreview({ name: doc.name, mime: doc.type, dataUrl: doc.url });
      return;
    }
    if (doc.type === "application/pdf") {
      window.open(doc.url, "_blank", "noopener");
      return;
    }
    window.open(doc.url, "_blank", "noopener");
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FolderOpen className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-base font-semibold text-gray-900">Documents associés</h4>
              <p className="text-sm text-gray-500">{items.length} document(s)</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              multiple
              onChange={(e) => handleFilesSelected(e.target.files)}
              className="hidden"
            />
            <button
              onClick={triggerFileInput}
              className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
              title="Ajouter un document"
              disabled={uploading}
            >
              {uploading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Ajouter
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      <div className="p-4">
        {items.length === 0 ? (
          <div className="text-center py-12">
            <FolderOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-sm text-gray-600">Aucun document associé</p>
            <button
              onClick={triggerFileInput}
              className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium"
            >
              Ajouter votre premier document
            </button>
          </div>
        ) : (
          <ul className="space-y-2">
            {items.map((d) => (
              <li key={d.id} className="p-3 border border-gray-200 rounded-lg hover:shadow-md transition-shadow flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    d.type?.startsWith("image/") ? "bg-green-100 text-green-600" :
                    d.type === "application/pdf" ? "bg-red-100 text-red-600" :
                    "bg-gray-100 text-gray-600"
                  }`}>
                    {getFileIcon(d.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm text-gray-900 truncate">{d.name}</div>
                    <div className="text-xs text-gray-500 flex items-center gap-2">
                      <span>{d.date ?? "-"}</span>
                      <span>•</span>
                      <span>{formatBytes(d.size)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => handlePreview(d)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Aperçu"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDownload(d)}
                    className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                    title="Télécharger"
                  >
                    <Download className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(d)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title="Supprimer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Preview modal */}
      {preview && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
            <div className="p-4 border-b flex items-center justify-between">
              <div className="text-sm font-medium text-gray-900 truncate">{preview.name}</div>
              <button
                onClick={() => setPreview(null)}
                className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-gray-100 transition-colors"
              >
                <X className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            <div className="p-4 overflow-auto flex-1">
              {preview.mime?.startsWith("image/") && preview.dataUrl ? (
                <img src={preview.dataUrl} alt={preview.name} className="w-full h-auto rounded-lg" />
              ) : preview.mime === "application/pdf" && preview.dataUrl ? (
                <iframe src={preview.dataUrl} title={preview.name} className="w-full h-[70vh] rounded-lg" />
              ) : (
                <div className="text-center py-12">
                  <File className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">Aperçu non disponible pour ce document.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}