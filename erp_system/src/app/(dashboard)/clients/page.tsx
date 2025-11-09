"use client";

import React, { useMemo, useState, useCallback } from "react";
import { 
  Users, 
  Plus, 
  TrendingUp,
  AlertTriangle,
  DollarSign,
  UserCheck,
} from "lucide-react";
import TopBar from "./components/TopBar";
import ClientTable from "./components/ClientTable";
import ClientFormModal from "./components/ClientFormModal";
import ClientDetailsModal from "./components/ClientDetailsModal";
import ClientSalesEvolution from "./components/Charts/ClientSalesEvolution";
import ClientsPieChart from "./components/Charts/ClientsPieChart";
import { useCustomers, useDeleteCustomer } from "@/lib/features/customer/hooks";
import { customerKeys } from "@/lib/features/customer/hooks";
import type { Customer } from "@/lib/features/customer/api";
import { useQueryClient } from "@tanstack/react-query";

// Map backend Customer to your Client type
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

function mapCustomerToClient(customer: Customer): Client {
  // Map backend type to frontend type
  let clientType: Client["type"];
  if (customer.type === "BUSINESS") {
    clientType = "Société";
  } else if (customer.type === "INDIVIDUAL") {
    clientType = "Particulier";
  } else {
    // Fallback for any unexpected values
    clientType = "Particulier";
  }

  return {
    id: String(customer.id),
    firstName: customer.name.split(" ")[0] || "",
    lastName: customer.name.split(" ").slice(1).join(" ") || "",
    email: customer.email,
    phone: customer.phone,
    type: clientType,
    balance: parseFloat(customer.balance) || 0, // ✅ FIXED: Use actual balance from API
    revenue: 0, // Backend doesn't have revenue - needs separate calculation
    lastOrder: undefined,
    createdAt: customer.created_at.slice(0, 10),
    status: customer.is_active ? "Actif" : "Inactif",
  };
}

function monthKeyFromDate(d: string) {
  if (!d) return "";
  return d.slice(0, 7);
}

function getMonthRange(startISO: string, endISO: string) {
  const start = new Date(startISO + "T00:00:00");
  const end = new Date(endISO + "T00:00:00");
  const months: string[] = [];
  const cur = new Date(start.getFullYear(), start.getMonth(), 1);
  const last = new Date(end.getFullYear(), end.getMonth(), 1);
  while (cur <= last) {
    const ks = `${cur.getFullYear()}-${String(cur.getMonth() + 1).padStart(2, "0")}`;
    months.push(ks);
    cur.setMonth(cur.getMonth() + 1);
  }
  return months;
}

type StatCardProps = {
  icon: React.ReactElement<{ className?: string }>;
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  trend?: string;
  bgColor: string;
  iconColor: string;
};

const StatCard = ({
  icon,
  title,
  value,
  subtitle,
  trend,
  bgColor,
  iconColor,
}: StatCardProps) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${bgColor}`}>
        {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}` })}
      </div>
    </div>
    {trend && (
      <div className="mt-3 flex items-center text-sm text-green-600">
        <TrendingUp className="w-4 h-4 mr-1" />
        {trend}
      </div>
    )}
  </div>
);

export default function ClientsPage() {
  const [query, setQuery] = useState("");
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  // Fetch customers from API
  const { data: customersData, isLoading, error } = useCustomers({
    search: query,
    is_active: undefined, // Show all by default
  });

  const queryClient = useQueryClient();

  // Delete customer mutation
  const deleteCustomerMutation = useDeleteCustomer({
    onSuccess: () => {
      // Invalidate and refetch the customers list
      queryClient.invalidateQueries({ queryKey: customerKeys.lists() });
      
      if (selectedClient) {
        setSelectedClient(null);
      }
    },
    onError: (error) => {
      alert(`Erreur lors de la suppression: ${error.message}`);
    }
  });

  // Map backend customers to frontend Client type
  const clients = useMemo(() => {
    if (!customersData?.results) return [];
    return customersData.results.map(mapCustomerToClient);
  }, [customersData]);

  const openNewClient = useCallback(() => {
    setEditingClient(null);
    setIsFormOpen(true);
  }, []);

  const openEditClient = useCallback((c: Client) => {
    setEditingClient(c);
    setIsFormOpen(true);
  }, []);

  const closeForm = useCallback(() => {
    setIsFormOpen(false);
  }, []);

  const deleteClient = useCallback((id: string) => {
    if (confirm("Êtes-vous sûr de vouloir supprimer ce client ?")) {
      deleteCustomerMutation.mutate(Number(id));
    }
  }, [deleteCustomerMutation]);

  // Filter clients based on search query (now handled by API)
  const filtered = clients;

  // Statistics
  const stats = useMemo(() => {
    const totalClients = clients.length;
    const activeClients = clients.filter(c => c.status === "Actif").length;
    const totalRevenue = clients.reduce((sum, c) => sum + (c.revenue || 0), 0);
    const negativeBalance = clients.filter(c => c.balance < 0).length;
    // ✅ Calculate total outstanding debt (sum of negative balances)
    const totalDebt = clients
      .filter(c => c.balance < 0)
      .reduce((sum, c) => sum + Math.abs(c.balance), 0);
    
    return { totalClients, activeClients, totalRevenue, negativeBalance, totalDebt };
  }, [clients]);

  // Charts data
  const clientsByType = useMemo(() => {
    const map = new Map<string, number>();
    for (const c of clients) {
      map.set(c.type, (map.get(c.type) ?? 0) + 1);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [clients]);

  const salesEvolution = useMemo(() => {
    if (clients.length === 0) return [];
    const dates = clients.map((c) => c.createdAt).filter(Boolean);
    const earliest = dates.reduce((a, b) => (a < b ? a : b), dates[0]);
    const latest = dates.reduce((a, b) => (a > b ? a : b), dates[0]);
    const months = getMonthRange(earliest, latest);
    const agg = new Map<string, number>();
    for (const m of months) agg.set(m, 0);
    for (const c of clients) {
      const key = monthKeyFromDate(c.createdAt) || months[0];
      agg.set(key, (agg.get(key) ?? 0) + (c.revenue ?? 0));
    }
    return months.map((m) => ({ date: m, value: Math.round((agg.get(m) ?? 0) * 100) / 100 }));
  }, [clients]);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des clients...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Erreur de chargement</p>
          <p className="text-gray-600">{error.message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header with gradient */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-8">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl shadow-lg">
                <Users className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">
                  Gestion des Clients
                </h1>
                <p className="text-blue-100 mt-1">
                  {stats.totalClients} clients • {stats.activeClients} actifs • {stats.totalRevenue.toLocaleString()} DA CA
                </p>
              </div>
            </div>
            <button
              onClick={openNewClient}
              className="inline-flex items-center px-6 py-3 bg-white text-blue-600 rounded-lg hover:bg-blue-50 transition-all shadow-lg hover:shadow-xl font-semibold"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouveau Client
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Users />}
            title="Total clients"
            value={stats.totalClients}
            subtitle={`${stats.activeClients} actifs`}
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
            trend="+12% ce mois"
          />
          
          <StatCard
            icon={<UserCheck />}
            title="Clients actifs"
            value={stats.activeClients}
            subtitle={`${Math.round((stats.activeClients / stats.totalClients) * 100) || 0}% du total`}
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatCard
            icon={<DollarSign />}
            title="CA Total"
            value={`${stats.totalRevenue.toLocaleString()} DA`}
            subtitle="Chiffre d'affaires"
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
            trend="+8% vs mois dernier"
          />
          
          <StatCard
            icon={<AlertTriangle />}
            title="Impayés"
            value={stats.negativeBalance}
            subtitle={`${stats.totalDebt.toLocaleString()} DA à recouvrer`}
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
        </div>

        {/* TopBar */}
        <TopBar 
          query={query} 
          onQueryChange={setQuery} 
          onNewClient={openNewClient} 
        />

        {/* Main Content Grid */}
        <div className="mt-6 grid grid-cols-1 gap-6">
          <div className="space-y-6">
            {/* Client Table */}
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900">Liste des clients</h2>
                <button
                  onClick={openNewClient}
                  className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Nouveau client
                </button>
              </div>
              <ClientTable
                clients={filtered}
                onView={(c) => setSelectedClient(c)}
                onEdit={openEditClient}
                onDelete={(id) => deleteClient(id)}
              />
            </section>

            {/* Charts Section */}
            <section className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
              <h2 className="text-lg font-semibold mb-4 text-gray-900">Tableaux & graphiques</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <ClientSalesEvolution data={salesEvolution} />
                </div>

                <div className="space-y-4">
                  <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                    <ClientsPieChart data={clientsByType} />
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>

      {/* Modals */}
      <ClientFormModal 
        open={isFormOpen} 
        initialData={editingClient} 
        onClose={closeForm}
      />

      <ClientDetailsModal
        open={!!selectedClient}
        client={selectedClient}
        onClose={() => setSelectedClient(null)}
        onEdit={(c) => {
          setSelectedClient(null);
          openEditClient(c);
        }}
        onAddPayment={() => alert("Ajouter paiement – à implémenter")}
        onNewOrder={() => alert("Créer commande – à implémenter")}
        onGenerateReport={() => alert("Générer rapport – à implémenter")}
        onSendReminder={() => alert("Envoyer rappel – à implémenter")}
      />
    </div>
  );
}