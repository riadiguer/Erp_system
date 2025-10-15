'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { 
  ShoppingCart, 
  FileText, 
  Package, 
  Receipt, 
  RotateCcw, 
  CreditCard,
  TrendingUp,
  Activity,
  Loader2
} from 'lucide-react';
import { PurchaseOrderApi, getDemandStatistics } from './store';

interface ModuleCardProps {
  href: string;
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  bgGradient: string;
  badge?: string | number;
}

const ModuleCard = ({ href, icon, title, description, color, bgGradient, badge }: ModuleCardProps) => (
  <Link href={href} className="group block">
    <div className={`relative p-6 rounded-xl border border-gray-200 bg-gradient-to-br ${bgGradient} hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} group-hover:scale-110 transition-transform duration-300`}>
            {icon}
          </div>
          {badge !== undefined && (
            <span className="px-2.5 py-1 bg-white rounded-full text-xs font-bold text-gray-700 shadow-sm">
              {badge}
            </span>
          )}
        </div>
        
        <h3 className="text-lg font-semibold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        
        <p className="text-sm text-gray-600 leading-relaxed">
          {description}
        </p>
        
        {/* Arrow indicator */}
        <div className="mt-4 flex items-center text-blue-600 text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          Accéder au module
          <svg className="ml-2 w-4 h-4 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </div>
      </div>
    </div>
  </Link>
);

const StatCard = ({ icon, title, value, change, changeType, loading }: {
  icon: React.ReactNode;
  title: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative';
  loading?: boolean;
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow duration-200">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          {loading ? (
            <div className="flex items-center space-x-2 mt-1">
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
              <span className="text-sm text-gray-400">Chargement...</span>
            </div>
          ) : (
            <p className="text-2xl font-bold text-gray-900">{value}</p>
          )}
        </div>
      </div>
      {change && changeType && !loading && (
        <div className={`flex items-center space-x-1 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
          <TrendingUp className={`w-4 h-4 ${changeType === 'negative' ? 'rotate-180' : ''}`} />
          <span>{change}</span>
        </div>
      )}
    </div>
  </div>
);

export default function PurchasingDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    pendingReceptions: 0,
    totalAmount: 0,
    demands: {
      total: 0,
      soumise: 0,
      approuvee: 0,
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        
        // Get purchase order statistics from backend
        const orderStats = await PurchaseOrderApi.statistics();
        
        // Get demand statistics from localStorage
        const demandStats = getDemandStatistics();
        
        // Calculate pending receptions (sent + confirmed orders)
        const pendingReceptions = orderStats.pending_orders || 0;
        
        setStats({
          totalOrders: orderStats.total_orders || 0,
          pendingOrders: orderStats.pending_orders || 0,
          pendingReceptions,
          totalAmount: orderStats.total_amount || 0,
          demands: {
            total: demandStats.total,
            soumise: demandStats.soumise,
            approuvee: demandStats.approuvee,
          }
        });
      } catch (error) {
        console.error('Error fetching statistics:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-DZ', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount) + ' DA';
  };

  const modules = [
    {
      href: "./purchasing/demand-requests",
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      title: "Demandes d'achat",
      description: "Gérez les demandes d'achat internes et suivez leur statut d'approbation",
      color: "bg-blue-500",
      bgGradient: "from-blue-50 to-blue-100",
      badge: stats.demands.soumise > 0 ? stats.demands.soumise : undefined
    },
    {
      href: "./purchasing/orders",
      icon: <FileText className="w-6 h-6 text-white" />,
      title: "Bons de commande",
      description: "Créez et suivez vos bons de commande auprès des fournisseurs",
      color: "bg-green-500",
      bgGradient: "from-green-50 to-green-100",
      badge: stats.totalOrders > 0 ? stats.totalOrders : undefined
    },
    {
      href: "./purchasing/receptions",
      icon: <Package className="w-6 h-6 text-white" />,
      title: "Réceptions",
      description: "Enregistrez les réceptions de marchandises et vérifiez la conformité",
      color: "bg-purple-500",
      bgGradient: "from-purple-50 to-purple-100",
      badge: stats.pendingReceptions > 0 ? stats.pendingReceptions : undefined
    },
    {
      href: "./purchasing/invoices",
      icon: <Receipt className="w-6 h-6 text-white" />,
      title: "Factures fournisseur",
      description: "Traitez les factures reçues et gérez les validations comptables",
      color: "bg-orange-500",
      bgGradient: "from-orange-50 to-orange-100"
    },
    {
      href: "./purchasing/returns",
      icon: <RotateCcw className="w-6 h-6 text-white" />,
      title: "Retours fournisseur",
      description: "Gérez les retours de marchandises non conformes ou défectueuses",
      color: "bg-red-500",
      bgGradient: "from-red-50 to-red-100"
    },
    {
      href: "./purchasing/payments",
      icon: <CreditCard className="w-6 h-6 text-white" />,
      title: "Paiements fournisseur",
      description: "Suivez et effectuez les paiements dus aux fournisseurs",
      color: "bg-indigo-500",
      bgGradient: "from-indigo-50 to-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-blue-600 rounded-lg">
              <ShoppingCart className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900">Module Achats</h1>
          </div>
          <p className="text-lg text-gray-600">
            Gérez l'ensemble de votre processus d'achat, de la demande au paiement
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard 
            icon={<FileText className="w-5 h-5 text-blue-600" />}
            title="Commandes actives"
            value={stats.pendingOrders.toString()}
            change={stats.totalOrders > 0 ? `${stats.totalOrders} total` : undefined}
            changeType="positive"
            loading={loading}
          />
          <StatCard 
            icon={<Package className="w-5 h-5 text-blue-600" />}
            title="En attente réception"
            value={stats.pendingReceptions.toString()}
            change={stats.pendingReceptions > 0 ? "À recevoir" : "Aucune"}
            changeType={stats.pendingReceptions > 0 ? "negative" : "positive"}
            loading={loading}
          />
          <StatCard 
            icon={<ShoppingCart className="w-5 h-5 text-blue-600" />}
            title="Demandes en attente"
            value={stats.demands.soumise.toString()}
            change={stats.demands.approuvee > 0 ? `${stats.demands.approuvee} approuvées` : undefined}
            changeType="positive"
            loading={loading}
          />
          <StatCard 
            icon={<Activity className="w-5 h-5 text-blue-600" />}
            title="Montant total"
            value={loading ? "..." : formatCurrency(stats.totalAmount)}
            change={stats.totalOrders > 0 ? "Commandes" : undefined}
            changeType="positive"
            loading={loading}
          />
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <ModuleCard key={index} {...module} />
          ))}
        </div>

        {/* Info Footer */}
        {!loading && stats.totalOrders === 0 && (
          <div className="mt-8 p-6 bg-blue-50 border border-blue-200 rounded-xl">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <FileText className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-blue-900 mb-1">
                  Commencez par créer votre première commande
                </h3>
                <p className="text-sm text-blue-700 mb-4">
                  Aucune commande d'achat n'a encore été créée. Commencez par créer une demande d'achat ou directement un bon de commande.
                </p>
                <div className="flex space-x-3">
                  <Link 
                    href="./purchasing/demand-requests"
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-colors"
                  >
                    Créer une demande
                  </Link>
                  <Link 
                    href="./purchasing/orders"
                    className="px-4 py-2 bg-white text-blue-600 border border-blue-600 rounded-lg text-sm font-semibold hover:bg-blue-50 transition-colors"
                  >
                    Créer un bon de commande
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}