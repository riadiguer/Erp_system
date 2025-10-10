"use client";

import { useState } from "react";
import { 
  Users, 
  Plus, 
  Download, 
  Upload, 
  Filter,
  TrendingUp,
  TrendingDown,
  Activity,
  CreditCard,
  FileText,
  Package,
  DollarSign,
  ShoppingBag,
  AlertCircle,
  ArrowUpRight
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

const StatCard = ({ 
  icon, 
  title, 
  value, 
  change, 
  changeType,
  gradient 
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  changeType: "positive" | "negative";
  gradient: string;
}) => (
  <div className="group relative bg-white p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300 overflow-hidden">
    {/* Gradient background on hover */}
    <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>
    
    {/* Decorative circle */}
    <div className="absolute -top-10 -right-10 w-32 h-32 bg-blue-50 rounded-full opacity-20 group-hover:scale-150 transition-transform duration-500"></div>
    
    <div className="relative z-10">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} shadow-lg group-hover:scale-110 transition-transform duration-300`}>
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

const ActionButton = ({ 
  icon: Icon, 
  label, 
  onClick, 
  variant = "default" 
}: any) => {
  const variants = {
    default: "border border-gray-300 hover:border-gray-400 bg-white hover:bg-gray-50 text-gray-700 shadow-sm",
    primary: "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white shadow-lg shadow-blue-200 hover:shadow-xl hover:shadow-blue-300"
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

const QuickActionCard = ({ 
  icon: Icon, 
  title, 
  count, 
  color,
  onClick 
}: any) => (
  <button
    onClick={onClick}
    className="group flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-lg transition-all duration-300"
  >
    <div className="flex items-center space-x-3">
      <div className={`p-2.5 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
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
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isOrderOpen, setIsOrderOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<any>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Header Section */}
        <div className="relative">
          {/* Decorative background */}
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl blur-3xl"></div>
          
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
                <ActionButton 
                  icon={Filter} 
                  label="Filtres" 
                  onClick={() => setIsFilterOpen(true)} 
                />
                <ActionButton 
                  icon={Upload} 
                  label="Importer" 
                  onClick={() => setIsImportOpen(true)} 
                />
                <ActionButton 
                  icon={Download} 
                  label="Exporter" 
                  onClick={() => setIsExportOpen(true)} 
                />
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

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            icon={<Users className="w-6 h-6 text-white" />}
            title="Total fournisseurs"
            value="15"
            change="+3 ce mois"
            changeType="positive"
            gradient="from-blue-500 to-blue-600"
          />
          <StatCard
            icon={<CreditCard className="w-6 h-6 text-white" />}
            title="Solde dû"
            value="390K DA"
            change="-8%"
            changeType="positive"
            gradient="from-amber-500 to-orange-600"
          />
          <StatCard
            icon={<ShoppingBag className="w-6 h-6 text-white" />}
            title="Commandes actives"
            value="12"
            change="+5"
            changeType="positive"
            gradient="from-green-500 to-emerald-600"
          />
          <StatCard
            icon={<DollarSign className="w-6 h-6 text-white" />}
            title="Achats ce mois"
            value="2.45M DA"
            change="+15%"
            changeType="positive"
            gradient="from-purple-500 to-purple-600"
          />
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <QuickActionCard
            icon={FileText}
            title="Factures en attente"
            count="8"
            color="bg-blue-500"
            onClick={() => {}}
          />
          <QuickActionCard
            icon={AlertCircle}
            title="Paiements en retard"
            count="3"
            color="bg-red-500"
            onClick={() => {}}
          />
          <QuickActionCard
            icon={Package}
            title="Livraisons prévues"
            count="5"
            color="bg-green-500"
            onClick={() => {}}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <SupplierStatsChart />
          </div>
          <div className="transform hover:scale-[1.02] transition-transform duration-300">
            <SupplierEvolutionChart />
          </div>
        </div>

        {/* Main Table Section */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-xl overflow-hidden">
          <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-8 py-6 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-1">Liste des fournisseurs</h2>
                <p className="text-sm text-gray-600">Gérez et consultez tous vos fournisseurs</p>
              </div>
              <div className="flex items-center space-x-3 px-4 py-2 bg-white rounded-xl border border-gray-200 shadow-sm">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-semibold text-gray-700">15 fournisseurs actifs</span>
              </div>
            </div>
          </div>
          
          <div className="p-6">
            <SupplierTable
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
        />

        <SupplierDeleteModal
          open={isDeleteOpen}
          onClose={() => setIsDeleteOpen(false)}
          supplier={selectedSupplier}
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
        />
        
        <SupplierExportModal 
          open={isExportOpen} 
          onClose={() => setIsExportOpen(false)} 
        />
        
        <SupplierFilters 
          open={isFilterOpen} 
          onClose={() => setIsFilterOpen(false)} 
        />
      </div>
    </div>
  );
}