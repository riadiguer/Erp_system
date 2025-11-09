"use client";
import React, { useState } from "react";
import { 
  X,
  ShoppingCart,
  FileText,
  FolderOpen,
  MessageSquare,
  Activity,
  CreditCard,
  Plus,
  Mail,
  User,
  Building2,
  DollarSign,
  Calendar,
  Edit,
  Phone,
  Loader2,
  AlertCircle,
  Users,
} from "lucide-react";
import { useCustomer, useCustomerContacts, useActivateCustomer, useDeactivateCustomer } from "@/lib/features/customer/hooks";

export type OrderItem = {
  id: string;
  date: string;
  total: number;
  status?: string;
};

export type InvoiceItem = {
  id: string;
  date: string;
  amount: number;
  paid?: boolean;
};

export type DocumentItem = {
  id: string;
  name: string;
  url?: string;
  date?: string;
  type?: string;
};

export type Activity = {
  id: string;
  date: string;
  note: string;
  amount?: number;
  kind?: "commande" | "paiement" | "relance" | "note";
};

export type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  // widen union to match ClientTable
  type: "Particulier" | "Société" | "INDIVIDUAL" | "BUSINESS";
  balance: number;
  revenue?: number;
  lastOrder?: string;
  createdAt: string;
  status: "Actif" | "Inactif";
};

type Props = {
  client: Client | null;
  open: boolean;
  onClose?: () => void;
  onEdit?: (c: Client) => void;
  onAddPayment?: (c: Client) => void;
  onNewOrder?: (c: Client) => void;
  onGenerateReport?: (c: Client) => void;
  onSendReminder?: (c: Client) => void;
};

const TABS = ["Overview", "Contacts", "Orders", "Invoices", "Documents", "Activities"] as const;
type Tab = (typeof TABS)[number];

const TAB_ICONS = {
  Overview: Activity,
  Contacts: Users,
  Orders: ShoppingCart,
  Invoices: FileText,
  Documents: FolderOpen,
  Activities: Activity,
};

function initials(name?: string, surname?: string) {
  const a = (name ?? "").trim();
  const b = (surname ?? "").trim();
  if (a && b) return `${a[0].toUpperCase()}${b[0].toUpperCase()}`;
  if (a) return a[0].toUpperCase();
  if (b) return b[0].toUpperCase();
  return "?";
}

export default function ClientDetailsModal({
  client,
  open,
  onClose = () => {},
  onEdit = () => {},
  onAddPayment = () => {},
  onNewOrder = () => {},
}: Props) {
  const [activeTab, setActiveTab] = useState<Tab>("Overview");

  // Fetch customer data from API
  const { data: customerData, isLoading, error } = useCustomer(
    open && client ? Number(client.id) : null
  );

  // Fetch customer contacts
  const { data: contactsData } = useCustomerContacts(
    open && client ? { customer: Number(client.id) } : undefined,
    { enabled: open && !!client }
  );

  // Activate/Deactivate mutations
  const activateMutation = useActivateCustomer({
    onSuccess: () => {
      alert("Client activé avec succès!");
    },
  });

  const deactivateMutation = useDeactivateCustomer({
    onSuccess: () => {
      alert("Client désactivé avec succès!");
    },
  });

  if (!open || !client) return null;

  const contacts = contactsData?.results || [];

  // Mock data for orders, invoices, documents, activities
  // TODO: Replace with actual API calls when these modules are ready
  const orders: OrderItem[] = [
    { id: "o-001", date: "2025-09-05", total: 1200, status: "Livrée" },
    { id: "o-023", date: "2025-07-11", total: 450, status: "En cours" },
  ];

  const invoices: InvoiceItem[] = [
    { id: "inv-2025-08", date: "2025-08-21", amount: 120, paid: false },
    { id: "inv-2025-06", date: "2025-06-02", amount: 980, paid: true },
  ];

  const documents: DocumentItem[] = [
    { id: "d1", name: "Contrat.pdf", date: "2024-11-12", type: "Contrat" },
    { id: "d2", name: "Facture_Aug-2025.pdf", date: "2025-08-21", type: "Facture" },
  ];

  const name = `${client.firstName ?? ""} ${client.lastName ?? ""}`.trim() || "Client";
  const bal = typeof client.balance === "number" ? client.balance : null;
  const isOverdue = bal !== null && bal < 0;

  const totalOrders = orders.reduce((s, o) => s + (o.total ?? 0), 0);
  const unpaidInvoices = invoices.filter((i) => !i.paid).length;

  const handleToggleStatus = () => {
    if (!client) return;
    
    if (client.status === "Actif") {
      deactivateMutation.mutate(Number(client.id));
    } else {
      activateMutation.mutate(Number(client.id));
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 flex flex-col items-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-4" />
          <p className="text-gray-600">Chargement des détails...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
        <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md">
          <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-center text-gray-900 font-semibold mb-2">Erreur de chargement</p>
          <p className="text-center text-gray-600 mb-4">{error.message}</p>
          <button
            onClick={onClose}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Fermer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <button
              onClick={onClose}
              className="absolute right-0 top-0 text-white/80 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center gap-4 mb-4">
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
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold">{name}</h1>
                  <button
                    onClick={handleToggleStatus}
                    disabled={activateMutation.isPending || deactivateMutation.isPending}
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium cursor-pointer transition-colors ${
                      client.status === "Actif" 
                        ? "bg-green-100 text-green-800 border border-green-200 hover:bg-green-200" 
                        : "bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {activateMutation.isPending || deactivateMutation.isPending ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : null}
                    {client.status ?? "Inconnu"}
                  </button>
                </div>

                <div className="flex items-center gap-3 text-sm text-blue-100">
                  <div className="flex items-center gap-1">
                    {client.type === "Société" ? (
                      <Building2 className="w-4 h-4" />
                    ) : (
                      <User className="w-4 h-4" />
                    )}
                    <span>{client.type ?? "-"}</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-4 h-4" />
                    <span>Ajouté: {client.createdAt ?? "-"}</span>
                  </div>
                  {customerData?.email && (
                    <>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <Mail className="w-4 h-4" />
                        <span>{customerData.email}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Balance */}
              <div className="bg-white/20 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/30">
                <div className="flex items-center gap-2 mb-1">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-xs font-medium">Solde</span>
                </div>
                <div className={`text-lg font-bold ${isOverdue ? "text-red-200" : "text-green-200"}`}>
                  {bal !== null ? `${bal.toFixed(2)} DA` : "-"}
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onEdit(client)}
                className="inline-flex items-center px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors border border-white/30"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>

              <button
                onClick={() => onAddPayment(client)}
                className="inline-flex items-center px-3 py-2 bg-white text-blue-600 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors"
              >
                <CreditCard className="w-4 h-4 mr-2" />
                Paiement
              </button>

              <button
                onClick={() => onNewOrder(client)}
                className="inline-flex items-center px-3 py-2 bg-white/20 backdrop-blur-sm text-white rounded-lg text-sm font-medium hover:bg-white/30 transition-colors border border-white/30"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Commande
              </button>
            </div>
          </div>
        </div>

        {/* Tabs Navigation */}
        <div className="bg-white border-b border-gray-200 px-6 py-3">
          <div className="flex gap-2 overflow-x-auto scrollbar-hide">
            {TABS.map((t) => {
              const Icon = TAB_ICONS[t];
              return (
                <button
                  key={t}
                  onClick={() => setActiveTab(t)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                    activeTab === t 
                      ? "bg-blue-600 text-white shadow-md" 
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {t}
                  {t === "Contacts" && contacts.length > 0 && (
                    <span className="ml-1 px-1.5 py-0.5 bg-white/20 rounded-full text-xs">
                      {contacts.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Content - Scrollable */}
        <div className="flex-1 overflow-y-auto bg-gray-50 p-6">
          {activeTab === "Overview" && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="w-4 h-4 text-indigo-600" />
                    <span className="text-xs text-gray-600">Contacts</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{contacts.length}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <ShoppingCart className="w-4 h-4 text-blue-600" />
                    <span className="text-xs text-gray-600">Total commandes</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{totalOrders.toLocaleString()} DA</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-4 h-4 text-red-600" />
                    <span className="text-xs text-gray-600">Factures impayées</span>
                  </div>
                  <div className="text-2xl font-bold text-red-600">{unpaidInvoices}</div>
                </div>

                <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <FolderOpen className="w-4 h-4 text-purple-600" />
                    <span className="text-xs text-gray-600">Documents</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900">{documents.length}</div>
                </div>
              </div>

              {/* Customer Details Card */}
              <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-4">
                <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <User className="w-4 h-4 text-blue-600" />
                  Informations client
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {customerData?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Email:</span>
                      <span className="font-medium text-gray-900">{customerData.email}</span>
                    </div>
                  )}
                  {customerData?.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">Téléphone:</span>
                      <span className="font-medium text-gray-900">{customerData.phone}</span>
                    </div>
                  )}
                  {customerData?.tax_id && (
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600">N° fiscal:</span>
                      <span className="font-medium text-gray-900">{customerData.tax_id}</span>
                    </div>
                  )}
                  {customerData?.billing_address && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <Building2 className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Adresse facturation:</span>
                        <p className="font-medium text-gray-900 whitespace-pre-line">{customerData.billing_address}</p>
                      </div>
                    </div>
                  )}
                  {customerData?.notes && (
                    <div className="flex items-start gap-2 md:col-span-2">
                      <MessageSquare className="w-4 h-4 text-gray-400 mt-0.5" />
                      <div>
                        <span className="text-gray-600">Notes:</span>
                        <p className="font-medium text-gray-900 whitespace-pre-line">{customerData.notes}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === "Contacts" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <Users className="w-5 h-5 text-blue-600" />
                  Contacts ({contacts.length})
                </h3>
                <button 
                  onClick={() => alert("Ajouter contact - à implémenter")}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nouveau contact
                </button>
              </div>

              {contacts.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <Users className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Aucun contact</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {contacts.map((contact) => (
                    <div key={contact.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white font-semibold">
                            {contact.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900">{contact.name}</div>
                            {contact.role && (
                              <div className="text-xs text-gray-500">{contact.role}</div>
                            )}
                          </div>
                        </div>
                        {contact.is_primary && (
                          <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-xs font-medium rounded-full">
                            Principal
                          </span>
                        )}
                      </div>
                      <div className="space-y-1 text-sm">
                        {contact.email && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Mail className="w-4 h-4 flex-shrink-0" />
                            <span className="truncate">{contact.email}</span>
                          </div>
                        )}
                        {contact.phone && (
                          <div className="flex items-center gap-2 text-gray-600">
                            <Phone className="w-4 h-4 flex-shrink-0" />
                            <span>{contact.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "Orders" && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                  <ShoppingCart className="w-5 h-5 text-blue-600" />
                  Commandes
                </h3>
                <button 
                  onClick={() => onNewOrder(client)}
                  className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700"
                >
                  <Plus className="w-4 h-4 mr-1" />
                  Nouvelle
                </button>
              </div>

              {orders.length === 0 ? (
                <div className="bg-white rounded-lg border border-gray-200 p-8 text-center">
                  <ShoppingCart className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">Aucune commande</p>
                </div>
              ) : (
                <ul className="space-y-3">
                  {orders.map((o) => (
                    <li key={o.id} className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold text-gray-900">{o.id}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {o.date} • <span className={`font-medium ${o.status === "Livrée" ? "text-green-600" : "text-orange-600"}`}>{o.status ?? "-"}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-lg font-bold text-gray-900">{o.total.toLocaleString()} DA</div>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Other tabs can be similarly implemented */}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-200 bg-white flex items-center justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 font-medium"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
}