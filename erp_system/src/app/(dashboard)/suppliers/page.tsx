"use client";

import { useState, useMemo } from "react";
import {
  Users,
  Plus,
  Download,
  Upload,
  Filter,
  TrendingUp,
  TrendingDown,
  CreditCard,
  FileText,
  Package,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  ArrowUpRight,
  Loader2,
} from "lucide-react";

import SupplierTable from "./components/SupplierTable";
import SupplierFilters from "./components/SupplierFilters";
import SupplierFormModal from "./components/SupplierFormModal";
import SupplierDeleteModal from "./components/SupplierDeleteModal";
import SupplierDetailsModal from "./components/SupplierDetailsModal";
import SupplierImportModal from "./components/SupplierImportModal";
import SupplierExportModal from "./components/SupplierExportModal";
import SupplierPaymentsModal from "./components/SupplierPaymentsModal";
import SupplierOrderModal from "./components/SupplierOrderModal";
import SupplierStatsChart from "./components/Charts/SupplierStatsChart";
import SupplierEvolutionChart from "./components/Charts/SupplierEvolutionChart";
import { useSuppliers, usePurchaseOrders, useSupplierStatistics } from "@/lib/features/warehouse/hooks";
import { Supplier } from "@/lib/features/warehouse/types";
import { toast } from "sonner";

type StatCardProps = {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  gradient: string;
};

const StatCard = ({
  icon,
  title,
  value,
  change,
  changeType,
  gradient,
}: StatCardProps) => (
  <div className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
    <div
      className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}
    />
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500" />

    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}
        >
          {icon}
        </div>
        <div
          className={`flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
            changeType === "positive"
              ? "bg-green-50 text-green-700"
              : "bg-red-50 text-red-700"
          }`}
        >
          {changeType === "positive" ? (
            <TrendingUp className="w-3 h-3" />
          ) : (
            <TrendingDown className="w-3 h-3" />
          )}
          <span>{change}</span>
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
      </div>
    </div>
  </div>
);

type Variant = "default" | "primary";

type ActionButtonProps = {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  onClick: () => void;
  variant?: Variant;
};

const ActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
}: ActionButtonProps) => {
  const variants: Record<Variant, string> = {
    default:
      "border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 shadow-sm",
    primary:
      "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300",
  };
  return (
    <button
      onClick={onClick}
      className={`flex items-center px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:scale-105 ${variants[variant]}`}
    >
      <Icon className="mr-2 h-4 w-4" />
      {label}
    </button>
  );
};

type QuickActionCardProps = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  count: string | number;
  color: string;
  onClick: () => void;
};

const QuickActionCard = ({
  icon: Icon,
  title,
  count,
  color,
  onClick,
}: QuickActionCardProps) => (
  <button
    onClick={onClick}
    className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center space-x-3">
      <div
        className={`p-2.5 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}
      >
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div className="text-left">
        <p className="text-sm font-medium text-gray-600">{title}</p>
        <p className="text-xl font-bold text-gray-900">{count}</p>
      </div>
    </div>
    <ArrowUpRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-all duration-300" />
  </button>
);

export default function SuppliersDashboard() {
  // Hooks API
  const { suppliers, loading, error, refresh, isValidating } = useSuppliers();
  const { orders } = usePurchaseOrders();
  const { statistics: supplierStats } = useSupplierStatistics();

  // Safeguards
  const suppliersList: Supplier[] = Array.isArray(suppliers) ? suppliers : [];
  const validating = Boolean(isValidating ?? loading);

  // State pour les modales
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Calculate real statistics
  const stats = useMemo(() => {
    const totalSuppliers = suppliersList.length;
    const activeSuppliers = suppliersList.filter(
      (s) => s.materials_count && s.materials_count > 0
    ).length;

    // Calculate balance due (pending orders)
    const balanceDue = orders
      .filter(o => ['sent', 'confirmed'].includes(o.status))
      .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);

    // Active orders (not received or cancelled)
    const activeOrders = orders.filter(
      o => !['received', 'cancelled'].includes(o.status)
    ).length;

    // This month's purchases
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const thisMonthPurchases = orders
      .filter(o => {
        const orderDate = new Date(o.order_date);
        return orderDate.getMonth() === currentMonth && 
               orderDate.getFullYear() === currentYear;
      })
      .reduce((sum, o) => sum + parseFloat(o.total_amount || '0'), 0);

    // Quick action counts
    const receivedOrders = orders.filter(o => o.status === 'received').length;
    const pendingPayments = orders.filter(o => ['sent', 'confirmed'].includes(o.status)).length;
    const expectedDeliveries = orders.filter(o => {
      if (!o.expected_delivery_date || o.status === 'received') return false;
      const deliveryDate = new Date(o.expected_delivery_date);
      const now = new Date();
      return deliveryDate >= now;
    }).length;

    return {
      totalSuppliers,
      activeSuppliers,
      balanceDue,
      activeOrders,
      thisMonthPurchases,
      receivedOrders,
      pendingPayments,
      expectedDeliveries,
    };
  }, [suppliersList, orders]);

  // Format numbers
  const formatCurrency = (amount: number) => {
    if (amount >= 1000000) {
      return `${(amount / 1000000).toFixed(2)}M DA`;
    } else if (amount >= 1000) {
      return `${(amount / 1000).toFixed(0)}K DA`;
    }
    return `${amount.toFixed(0)} DA`;
  };

  // Calculate percentage change (mock for now - would need historical data)
  const calculateChange = (current: number, previous: number) => {
    if (previous === 0) return "+100%";
    const change = ((current - previous) / previous) * 100;
    return `${change > 0 ? '+' : ''}${change.toFixed(0)}%`;
  };

  // Loading state
  if (loading && suppliersList.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Chargement des fournisseurs...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 flex items-center justify-center">
        <div className="text-center bg-white p-8 rounded-2xl shadow-xl border border-red-200">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Erreur de chargement</h2>
          <p className="text-gray-600 mb-4">Impossible de charger les fournisseurs</p>
          <button
            onClick={() => refresh?.()}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl blur-3xl" />
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-4 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-200">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                    Gestion des Fournisseurs
                  </h1>
                  <p className="text-lg text-gray-600">
                    Gérez vos fournisseurs, commandes et paiements en toute simplicité
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                <ActionButton icon={Filter} label="Filtres" onClick={() => setIsFilterOpen(true)} />
                <ActionButton icon={Upload} label="Importer" onClick={() => setIsImportOpen(true)} />
                <ActionButton icon={Download} label="Exporter" onClick={() => setIsExportOpen(true)} />
                <ActionButton
                  icon={Plus}
                  label="Nouveau fournisseur"
                  onClick={() => {
                    setSelectedSupplier(null);
                    setIsAddOpen(true);
                  }}
                  variant="primary"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Stats Grid - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Total fournisseurs"
            value={stats.totalSuppliers.toString()}
            change={`${stats.activeSuppliers} actifs`}
            changeType="positive"
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<CreditCard className="w-6 h-6 text-white" />}
            title="Solde dû"
            value={formatCurrency(stats.balanceDue)}
            change={stats.balanceDue === 0 ? "Aucune dette" : `${stats.pendingPayments} en attente`}
            changeType={stats.balanceDue === 0 ? "positive" : "negative"}
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            icon={<ShoppingBag className="w-6 h-6 text-white" />}
            title="Commandes actives"
            value={stats.activeOrders.toString()}
            change={`${stats.receivedOrders} reçues`}
            changeType="positive"
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-white" />}
            title="Achats ce mois"
            value={formatCurrency(stats.thisMonthPurchases)}
            change={stats.thisMonthPurchases > 0 ? "En cours" : "Aucun achat"}
            changeType="positive"
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Quick Actions - Real Data */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            icon={FileText}
            title="Factures reçues"
            count={stats.receivedOrders}
            color="bg-blue-500"
            onClick={() => toast.info("Fonctionnalité à venir")}
          />
          <QuickActionCard
            icon={AlertCircle}
            title="Paiements en attente"
            count={stats.pendingPayments}
            color="bg-red-500"
            onClick={() => toast.info("Fonctionnalité à venir")}
          />
          <QuickActionCard
            icon={Package}
            title="Livraisons prévues"
            count={stats.expectedDeliveries}
            color="bg-green-500"
            onClick={() => toast.info("Fonctionnalité à venir")}
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <SupplierStatsChart />
          </div>
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <SupplierEvolutionChart />
          </div>
        </div>

        {/* Main Table */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Liste des fournisseurs</h2>
                <p className="text-sm text-gray-600">Gérez et consultez tous vos fournisseurs</p>
              </div>
              <div className="flex items-center space-x-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                {validating ? (
                  <Loader2 className="w-4 h-4 text-blue-500 animate-spin" />
                ) : (
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                )}
                <span className="text-sm font-semibold text-gray-700">
                  {stats.totalSuppliers} fournisseur{stats.totalSuppliers > 1 ? "s" : ""}{" "}
                  {stats.activeSuppliers > 0 &&
                    `(${stats.activeSuppliers} actif${stats.activeSuppliers > 1 ? "s" : ""})`}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6">
            <SupplierTable
              suppliers={suppliersList}
              loading={validating}
              onViewDetails={(supplier) => {
                setSelectedSupplier(supplier);
                setIsDetailsOpen(true);
              }}
              onDelete={(supplier) => {
                setSelectedSupplier(supplier);
                setIsDeleteOpen(true);
              }}
              onEdit={(supplier) => {
                setSelectedSupplier(supplier);
                setIsAddOpen(true);
              }}
              onPayment={(supplier) => {
                setSelectedSupplier(supplier);
                setIsPaymentOpen(true);
              }}
              onOrder={(supplier) => {
                setSelectedSupplier(supplier);
                setIsOrderOpen(true);
              }}
              onRefresh={refresh}
            />
          </div>
        </div>

        {/* Modals */}
        <SupplierFormModal
          open={isAddOpen}
          onClose={() => {
            setIsAddOpen(false);
            setSelectedSupplier(null);
          }}
          supplier={selectedSupplier}
          onSuccess={() => {
            refresh?.();
            toast.success(
              selectedSupplier
                ? "Fournisseur modifié avec succès"
                : "Fournisseur ajouté avec succès"
            );
          }}
        />

        <SupplierDeleteModal
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          supplier={selectedSupplier}
          onSuccess={() => {
            refresh?.();
            toast.success("Fournisseur supprimé avec succès");
          }}
        />

        <SupplierDetailsModal
          open={isDetailsOpen}
          onClose={() => setIsDetailsOpen(false)}
          supplier={selectedSupplier}
        />

        <SupplierPaymentsModal
          open={isPaymentOpen}
          onClose={() => setIsPaymentOpen(false)}
          supplier={selectedSupplier}
        />

        <SupplierOrderModal
          open={isOrderOpen}
          onClose={() => setIsOrderOpen(false)}
          supplier={selectedSupplier}
        />

        <SupplierImportModal
          open={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          onSuccess={() => {
            refresh?.();
            toast.success("Fournisseurs importés avec succès");
          }}
        />

        <SupplierExportModal
          open={isExportOpen}
          onClose={() => setIsExportOpen(false)}
          suppliers={suppliersList}
        />

        <SupplierFilters open={isFilterOpen} onClose={() => setIsFilterOpen(false)} />
      </div>
    </div>
  );
}