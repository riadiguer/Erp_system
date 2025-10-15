"use client";

import { X, FileText, CreditCard, ClipboardList, Download, Share2 } from "lucide-react";
import { useState, useMemo } from "react";
import { Supplier } from "@/lib/features/warehouse/types";
import { usePurchaseOrders } from "@/lib/features/warehouse/hooks";
import SupplierDetailsHeader from "./SupplierDetailsHeader";
import SupplierDocuments from "./SupplierDocuments";
import SupplierHistoryTable from "./SupplierHistoryTable";
import SupplierInvoicesTable from "./SupplierInvoicesTable";
import { toast } from "sonner";

interface SupplierDetailsModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: Supplier | null;
}

export default function SupplierDetailsModal({
  open,
  onClose,
  supplier,
}: SupplierDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"history" | "invoices" | "documents">("history");
  const { orders } = usePurchaseOrders();

  // Calculate tab counts from real data
  const tabCounts = useMemo(() => {
    if (!supplier?.id) return { history: 0, invoices: 0, documents: 0 };

    const supplierOrders = orders.filter(o => o.supplier === supplier.id);
    const historyCount = supplierOrders.length;
    const invoicesCount = supplierOrders.filter(o => o.status === 'received').length;
    
    // Documents count would come from a documents API when implemented
    const documentsCount = 0;

    return { history: historyCount, invoices: invoicesCount, documents: documentsCount };
  }, [supplier?.id, orders]);

  if (!open || !supplier) return null;

  const TabButton = ({
    icon: Icon,
    label,
    tab,
    count,
  }: {
    icon: any;
    label: string;
    tab: "history" | "invoices" | "documents";
    count?: number;
  }) => (
    <button
      onClick={() => setActiveTab(tab)}
      className={`relative flex items-center space-x-2 px-6 py-3 text-sm font-semibold transition-all duration-200 border-b-2 ${
        activeTab === tab
          ? "text-blue-600 border-blue-600 bg-blue-50"
          : "text-gray-600 border-transparent hover:text-gray-900 hover:bg-gray-50"
      }`}
    >
      <Icon className="w-4 h-4" />
      <span>{label}</span>
      {count !== undefined && (
        <span
          className={`ml-2 px-2 py-0.5 text-xs font-bold rounded-full ${
            activeTab === tab
              ? "bg-blue-600 text-white"
              : "bg-gray-200 text-gray-700"
          }`}
        >
          {count}
        </span>
      )}
    </button>
  );

  const handleExportPDF = () => {
    // TODO: Implement PDF export functionality
    toast.info("Export PDF en cours de développement");
  };

  const handleShare = () => {
    // Copy supplier details to clipboard
    const details = `
Fournisseur: ${supplier.name}
Contact: ${supplier.contact_name || 'N/A'}
Téléphone: ${supplier.phone || 'N/A'}
Email: ${supplier.email || 'N/A'}
Adresse: ${supplier.address || 'N/A'}
    `.trim();

    navigator.clipboard.writeText(details).then(() => {
      toast.success("Informations copiées dans le presse-papiers");
    }).catch(() => {
      toast.error("Erreur lors de la copie");
    });
  };

  // Format last update date
  const lastUpdateDate = new Date(supplier.updated_at).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-200">
        
        {/* Header avec actions */}
        <div className="flex-shrink-0 flex items-center justify-between px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-600 rounded-lg shadow-lg">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                Détails du fournisseur
              </h2>
              <p className="text-sm text-gray-600">
                Informations complètes et historique
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            {/* Boutons d'action */}
            <button
              onClick={handleShare}
              className="p-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 transition-all duration-200 hover:scale-105"
              title="Partager"
            >
              <Share2 className="w-4 h-4" />
            </button>
            
            <button
              onClick={handleExportPDF}
              className="flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              title="Exporter en PDF"
            >
              <Download className="w-4 h-4" />
              <span className="text-sm">Exporter PDF</span>
            </button>

            <button
              onClick={onClose}
              className="p-2.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-all duration-200"
              title="Fermer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Header détaillé du fournisseur */}
        <div className="flex-shrink-0 border-b border-gray-200">
          <SupplierDetailsHeader supplier={supplier} />
        </div>

        {/* Onglets de navigation */}
        <div className="flex-shrink-0 bg-white border-b border-gray-200 shadow-sm">
          <div className="flex space-x-1 px-6">
            <TabButton
              icon={ClipboardList}
              label="Historique des achats"
              tab="history"
              count={tabCounts.history}
            />
            <TabButton
              icon={FileText}
              label="Factures"
              tab="invoices"
              count={tabCounts.invoices}
            />
            <TabButton
              icon={CreditCard}
              label="Documents"
              tab="documents"
              count={tabCounts.documents}
            />
          </div>
        </div>

        {/* Contenu scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <div className="p-6">
            {/* Historique des commandes */}
            {activeTab === "history" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Historique des achats
                  </h3>
                  <p className="text-sm text-gray-600">
                    Liste complète des bons de commande
                  </p>
                </div>
                <SupplierHistoryTable supplier={supplier} />
              </div>
            )}

            {/* Factures */}
            {activeTab === "invoices" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Factures du fournisseur
                  </h3>
                  <p className="text-sm text-gray-600">
                    Suivi des factures et paiements
                  </p>
                </div>
                <SupplierInvoicesTable supplier={supplier} />
              </div>
            )}

            {/* Documents */}
            {activeTab === "documents" && (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="mb-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">
                    Documents joints
                  </h3>
                  <p className="text-sm text-gray-600">
                    Contrats, attestations et autres fichiers
                  </p>
                </div>
                <SupplierDocuments supplier={supplier} />
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex-shrink-0 px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Dernière modification : <span className="font-semibold text-gray-900">{lastUpdateDate}</span>
          </div>
          <button
            onClick={onClose}
            className="px-6 py-2.5 border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-100 transition-all duration-200 hover:scale-105"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}