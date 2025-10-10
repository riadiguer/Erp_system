"use client";
import React from "react";
import { 
  ArrowLeft, 
  Edit, 
  CreditCard, 
  ShoppingCart, 
  FileText, 
  Bell,
  MoreVertical,
  User,
  Building2,
  DollarSign
} from "lucide-react";

export type ClientMini = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  type?: "Particulier" | "Société";
  balance?: number;
  lastOrder?: string;
  createdAt?: string;
  status?: "Actif" | "Inactif";
};

type Props = {
  client: ClientMini | null;
  onClose?: () => void;
  onEdit?: (c: ClientMini) => void;
  onAddPayment?: (c: ClientMini) => void;
  onNewOrder?: (c: ClientMini) => void;
  onGenerateReport?: (c: ClientMini) => void;
  onSendReminder?: (c: ClientMini) => void;
  showBack?: boolean;
};

function initials(name?: string, surname?: string) {
  const a = (name ?? "").trim();
  const b = (surname ?? "").trim();
  if (a && b) return `${a[0].toUpperCase()}${b[0].toUpperCase()}`;
  if (a) return a[0].toUpperCase();
  if (b) return b[0].toUpperCase();
  return "?";
}

export default function ClientDetailsHeader({
  client,
  onClose = () => {},
  onEdit = () => {},
  onAddPayment = () => {},
  onNewOrder = () => {},
  onGenerateReport = () => {},
  onSendReminder = () => {},
  showBack = true,
}: Props) {
  if (!client) return null;

  const name = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client";
  const bal = typeof client.balance === "number" ? client.balance : null;
  const isOverdue = bal !== null && bal < 0;

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm">
      <div className="px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Left section */}
          <div className="flex items-center gap-4">
            {showBack && (
              <button
                onClick={onClose}
                aria-label="Retour"
                className="flex items-center justify-center w-10 h-10 rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
                title="Retour"
              >
                <ArrowLeft className="w-5 h-5 text-gray-600" />
              </button>
            )}

            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative">
                <div className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-semibold bg-gradient-to-br ${
                  client.type === "Société" 
                    ? "from-purple-500 to-indigo-500" 
                    : "from-blue-500 to-cyan-500"
                } text-white shadow-lg`}>
                  {initials(client.firstName, client.lastName)}
                </div>
                <div className={`absolute bottom-0 right-0 w-5 h-5 rounded-full border-2 border-white ${
                  client.status === "Actif" ? "bg-green-500" : "bg-gray-400"
                }`} />
              </div>

              {/* Client info */}
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-xl font-bold text-gray-900">{name}</h1>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    client.status === "Actif" 
                      ? "bg-green-100 text-green-800 border border-green-200" 
                      : "bg-gray-100 text-gray-700 border border-gray-200"
                  }`}>
                    {client.status ?? "Inconnu"}
                  </span>
                </div>

                <div className="flex items-center gap-3 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    {client.type === "Société" ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>{client.type ?? "-"}</span>
                  </div>
                  <span className="text-gray-400">•</span>
                  <span>Ajouté: {client.createdAt ?? "-"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right section */}
          <div className="flex items-center gap-3">
            {/* Balance card */}
            <div className="hidden lg:block bg-gray-50 rounded-lg border border-gray-200 px-4 py-3">
              <div className="flex items-center gap-2 mb-1">
                <DollarSign className="w-4 h-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Solde</span>
              </div>
              <div className={`text-lg font-bold ${isOverdue ? "text-red-600" : "text-green-600"}`}>
                {bal !== null ? `${bal.toFixed(2)} DA` : "-"}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onAddPayment(client)}
                className="hidden md:inline-flex items-center px-3 py-2 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors shadow-sm"
                title="Ajouter paiement"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Paiement
              </button>

              <button
                onClick={() => onNewOrder(client)}
                className="hidden md:inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                title="Nouvelle commande"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Commande
              </button>

              <div className="hidden lg:flex items-center gap-2">
                <button
                  onClick={() => onGenerateReport(client)}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  title="Générer rapport"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  Rapport
                </button>

                <button
                  onClick={() => onSendReminder(client)}
                  className="inline-flex items-center px-3 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
                  title="Envoyer rappel paiement"
                >
                  <Bell className="w-4 h-4 mr-2" />
                  Rappel
                </button>
              </div>

              <button
                onClick={() => onEdit(client)}
                className="inline-flex items-center px-3 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm"
                title="Modifier client"
              >
                <Edit className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Modifier</span>
              </button>

              {/* Mobile overflow menu */}
              <div className="lg:hidden">
                <details className="relative">
                  <summary className="flex items-center justify-center w-10 h-10 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <MoreVertical className="w-5 h-5 text-gray-600" />
                  </summary>
                  <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg border border-gray-200 z-10 py-1">
                    <button
                      onClick={() => onAddPayment(client)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <CreditCard className="w-4 h-4" />
                      Paiement
                    </button>
                    <button
                      onClick={() => onNewOrder(client)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <ShoppingCart className="w-4 h-4" />
                      Commande
                    </button>
                    <button
                      onClick={() => onGenerateReport(client)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <FileText className="w-4 h-4" />
                      Rapport
                    </button>
                    <button
                      onClick={() => onSendReminder(client)}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-gray-50 flex items-center gap-2"
                    >
                      <Bell className="w-4 h-4" />
                      Rappel
                    </button>
                  </div>
                </details>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}