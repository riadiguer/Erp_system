'use client'

import { useState } from 'react'
import { 
  BarChart3, TrendingUp, Search, User, Bell, MessageCircle, 
  CreditCard, ShoppingCart, AlertTriangle, Users, Package, 
  PlusCircle, Receipt, Building2, FileText, Layers, Eye,
  ArrowUpRight, ArrowDownRight, Calendar, Filter, Download,
  Clock, CheckCircle, XCircle, DollarSign, Target, Zap
} from 'lucide-react'

// Enhanced StatCard Component
function StatCard({
  icon,
  label,
  value,
  trend,
  color,
  subtitle,
  actionLabel
}: {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  trend: number;
  color: string;
  subtitle?: string;
  actionLabel?: string;
}) {
  const isPositive = trend > 0
  
  return (
    <div className="group bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl shadow-lg ${color}`}>
          {icon}
        </div>
        <div className={`flex items-center space-x-1 text-sm font-medium ${
          isPositive ? 'text-emerald-600' : 'text-red-500'
        }`}>
          {isPositive ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
          <span>{Math.abs(trend)}%</span>
        </div>
      </div>
      
      <div className="space-y-2">
        <h3 className="text-3xl font-bold text-gray-900">{value}</h3>
        <p className="text-sm font-medium text-gray-600">{label}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
        {actionLabel && (
          <button className="text-xs text-blue-600 hover:text-blue-700 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            {actionLabel} →
          </button>
        )}
      </div>
    </div>
  )
}

// Enhanced Shortcut Component
function QuickAction({
  icon,
  label,
  color,
  onClick,
  badge
}: {
  icon: React.ReactNode;
  label: string;
  color: string;
  onClick?: () => void;
  badge?: string | number;
}) {
  return (
    <button
      className={`relative group flex flex-col items-center justify-center p-4 rounded-2xl border border-gray-100 bg-white hover:shadow-lg transition-all duration-300 hover:-translate-y-1 ${color}`}
      onClick={onClick}
    >
      {badge && (
        <div className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
          {badge}
        </div>
      )}
      <div className={`p-3 rounded-xl mb-3 group-hover:scale-110 transition-transform ${color.replace('hover:', '')}`}>
        {icon}
      </div>
      <span className="text-sm font-medium text-gray-700 text-center leading-tight">{label}</span>
    </button>
  )
}

// Notification Component
function NotificationCard({
  type,
  message,
  time,
  priority = 'normal'
}: {
  type: string;
  message: string;
  time: string;
  priority?: 'high' | 'normal' | 'low';
}) {
  const priorityColors = {
    high: 'border-red-200 bg-red-50',
    normal: 'border-blue-200 bg-blue-50',
    low: 'border-gray-200 bg-gray-50'
  }
  
  return (
    <div className={`flex items-center space-x-3 p-4 rounded-xl border ${priorityColors[priority]} transition-colors`}>
      <div className={`p-2 rounded-lg ${
        priority === 'high' ? 'bg-red-100' : priority === 'normal' ? 'bg-blue-100' : 'bg-gray-100'
      }`}>
        <Bell className={`w-4 h-4 ${
          priority === 'high' ? 'text-red-600' : priority === 'normal' ? 'text-blue-600' : 'text-gray-600'
        }`} />
      </div>
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-900">{message}</p>
        <p className="text-xs text-gray-500">{time}</p>
      </div>
    </div>
  )
}

// Chart Placeholder Component
function ChartPlaceholder({ title, icon, type = 'line' }: { title: string; icon: React.ReactNode; type?: string }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            {icon}
          </div>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
          <Eye className="w-4 h-4 text-gray-500" />
        </button>
      </div>
      
      <div className="h-64 flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl border-2 border-dashed border-gray-300">
        <div className="text-center">
          <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-2" />
          <p className="text-gray-500 font-medium">Graphique {type}</p>
          <p className="text-xs text-gray-400">Données à intégrer</p>
        </div>
      </div>
    </div>
  )
}

// Recent Activity Item
function ActivityItem({
  icon,
  title,
  subtitle,
  time,
  amount,
  status
}: {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  time: string;
  amount?: string;
  status: 'success' | 'pending' | 'failed';
}) {
  const statusColors = {
    success: 'text-emerald-600 bg-emerald-50',
    pending: 'text-orange-600 bg-orange-50',
    failed: 'text-red-600 bg-red-50'
  }
  
  return (
    <div className="flex items-center space-x-4 p-4 hover:bg-gray-50 rounded-xl transition-colors">
      <div className="p-2 bg-blue-100 rounded-lg">
        {icon}
      </div>
      <div className="flex-1">
        <h4 className="font-medium text-gray-900">{title}</h4>
        <p className="text-sm text-gray-500">{subtitle}</p>
      </div>
      <div className="text-right">
        {amount && <p className="font-bold text-gray-900">{amount}</p>}
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[status]}`}>
            {status === 'success' ? 'Terminé' : status === 'pending' ? 'En cours' : 'Échoué'}
          </span>
          <span className="text-xs text-gray-400">{time}</span>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const [notifications] = useState([
    { type: "urgent", message: "2 commandes à préparer urgentes", time: "Il y a 5 min", priority: "high" },
    { type: "payment", message: "1 facture impayée depuis 7 jours", time: "Il y a 2h", priority: "normal" },
    { type: "stock", message: "Stock critique sur 3 articles", time: "Il y a 1h", priority: "high" },
    { type: "info", message: "Nouveau client inscrit", time: "Il y a 30 min", priority: "low" }
  ])

  const recentActivities = [
    { 
      icon: <Receipt className="w-4 h-4 text-blue-600" />, 
      title: "Facture #2024-001", 
      subtitle: "Client ABC Corp", 
      time: "14:30", 
      amount: "45,200 DZD", 
      status: "success" 
    },
    { 
      icon: <ShoppingCart className="w-4 h-4 text-green-600" />, 
      title: "Commande #CMD-445", 
      subtitle: "Client XYZ Ltd", 
      time: "13:15", 
      amount: "28,500 DZD", 
      status: "pending" 
    },
    { 
      icon: <Package className="w-4 h-4 text-orange-600" />, 
      title: "Livraison retardée", 
      subtitle: "Fournisseur PrintMax", 
      time: "11:45", 
      status: "failed" 
    },
    { 
      icon: <Users className="w-4 h-4 text-purple-600" />, 
      title: "Nouveau client", 
      subtitle: "Digital Solutions", 
      time: "10:20", 
      status: "success" 
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div className="flex-1">
            <div className="flex items-center space-x-4 mb-4">
              <div className="p-3 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg">
                <BarChart3 className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Tableau de bord</h1>
                <p className="text-gray-600 text-lg">Vue d'ensemble de votre activité</p>
              </div>
            </div>
            
            {/* Enhanced Search */}
            <div className="flex items-center space-x-3 max-w-2xl">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white shadow-sm"
                  placeholder="Recherche rapide (produit, client, commande, facture)..."
                />
              </div>
              <button className="px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-medium rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-lg shadow-blue-600/25">
                Rechercher
              </button>
            </div>
          </div>
          
          {/* User Profile Area */}
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <MessageCircle className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-blue-500 rounded-full"></div>
              </button>
              <button className="relative p-3 hover:bg-gray-100 rounded-xl transition-colors">
                <Bell className="w-5 h-5 text-gray-600" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></div>
              </button>
            </div>
            
            <div className="flex items-center space-x-3 p-3 bg-white rounded-xl border border-gray-200 shadow-sm">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="font-medium text-gray-900 text-sm">Admin User</p>
                <p className="text-xs text-gray-500">Gestionnaire</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <StatCard 
            icon={<CreditCard className="w-6 h-6 text-white" />} 
            label="Chiffre d'affaires" 
            value="175,800 DZD" 
            trend={8} 
            color="bg-gradient-to-br from-emerald-500 to-emerald-600"
            subtitle="Ce mois-ci"
            actionLabel="Voir détails"
          />
          <StatCard 
            icon={<ShoppingCart className="w-6 h-6 text-white" />} 
            label="Commandes actives" 
            value="18" 
            trend={-2} 
            color="bg-gradient-to-br from-blue-500 to-blue-600"
            subtitle="En cours de traitement"
            actionLabel="Gérer commandes"
          />
          <StatCard 
            icon={<AlertTriangle className="w-6 h-6 text-white" />} 
            label="Alertes stock" 
            value="3" 
            trend={0} 
            color="bg-gradient-to-br from-orange-500 to-orange-600"
            subtitle="Réapprovisionnement requis"
            actionLabel="Voir alertes"
          />
          <StatCard 
            icon={<Users className="w-6 h-6 text-white" />} 
            label="Nouveaux clients" 
            value="5" 
            trend={25} 
            color="bg-gradient-to-br from-purple-500 to-purple-600"
            subtitle="Cette semaine"
            actionLabel="Voir clients"
          />
        </div>

        {/* Enhanced Quick Actions */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Actions rapides</h2>
            <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
              Personnaliser →
            </button>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-4">
            <QuickAction 
              icon={<PlusCircle className="w-5 h-5 text-white" />} 
              label="Nouvelle vente" 
              color="bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700"
            />
            <QuickAction 
              icon={<ShoppingCart className="w-5 h-5 text-white" />} 
              label="Nouvel achat" 
              color="bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
            />
            <QuickAction 
              icon={<Package className="w-5 h-5 text-white" />} 
              label="Ajouter produit" 
              color="bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700"
            />
            <QuickAction 
              icon={<Layers className="w-5 h-5 text-white" />} 
              label="Ajouter matière" 
              color="bg-gradient-to-br from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
            />
            <QuickAction 
              icon={<Receipt className="w-5 h-5 text-white" />} 
              label="Créer facture" 
              color="bg-gradient-to-br from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700"
              badge="2"
            />
            <QuickAction 
              icon={<FileText className="w-5 h-5 text-white" />} 
              label="Créer devis" 
              color="bg-gradient-to-br from-cyan-500 to-cyan-600 hover:from-cyan-600 hover:to-cyan-700"
            />
            <QuickAction 
              icon={<User className="w-5 h-5 text-white" />} 
              label="Ajouter client" 
              color="bg-gradient-to-br from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700"
            />
            <QuickAction 
              icon={<Building2 className="w-5 h-5 text-white" />} 
              label="Ajouter fournisseur" 
              color="bg-gradient-to-br from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
            />
          </div>
        </div>

        {/* Enhanced Notifications */}
        <div className="mb-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900">Notifications importantes</h2>
            <div className="flex items-center space-x-3">
              <button className="text-sm text-gray-600 hover:text-gray-900">Tout marquer comme lu</button>
              <button className="px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Voir tout
              </button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {notifications.map((notification, i) => (
              <NotificationCard
                key={i}
                {...notification}
                priority={notification.priority as 'high' | 'normal' | 'low'}
              />
            ))}
          </div>
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          <ChartPlaceholder 
            title="Évolution des ventes" 
            icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
            type="line"
          />
          <ChartPlaceholder 
            title="Répartition par catégorie" 
            icon={<Target className="w-5 h-5 text-purple-600" />}
            type="pie"
          />
        </div>

        {/* Enhanced Activity Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Recent Activities */}
          <div className="lg:col-span-2 bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Clock className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900">Activité récente</h3>
              </div>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                Voir tout →
              </button>
            </div>
            <div className="space-y-2">
              {recentActivities.map((activity, i) => (
                <ActivityItem key={i} {...activity} status={activity.status as "success" | "pending" | "failed"} />
              ))}
            </div>
          </div>

          {/* Quick Stats */}
          <div className="space-y-6">
            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <Zap className="w-5 h-5 text-orange-600" />
                </div>
                <h3 className="font-bold text-gray-900">Produits populaires</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Roll-up Premium</span>
                  <span className="text-sm font-medium text-gray-900">24 ventes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Banderole PVC</span>
                  <span className="text-sm font-medium text-gray-900">18 ventes</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Flyers A4</span>
                  <span className="text-sm font-medium text-gray-900">15 ventes</span>
                </div>
              </div>
            </div>

            {/* Top Clients */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-center space-x-3 mb-4">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Users className="w-5 h-5 text-green-600" />
                </div>
                <h3 className="font-bold text-gray-900">Top clients</h3>
              </div>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">ABC Corporation</span>
                  <span className="text-sm font-medium text-emerald-600">102,000 DZD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">XYZ Limited</span>
                  <span className="text-sm font-medium text-emerald-600">87,400 DZD</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-700">Digital Solutions</span>
                  <span className="text-sm font-medium text-emerald-600">66,000 DZD</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}