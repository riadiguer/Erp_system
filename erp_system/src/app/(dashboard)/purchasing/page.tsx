'use client'
import Link from 'next/link'
import { 
  ShoppingCart, 
  FileText, 
  Package, 
  Receipt, 
  RotateCcw, 
  CreditCard,
  TrendingUp,
  Activity
} from 'lucide-react'

interface ModuleCardProps {
  href: string
  icon: React.ReactNode
  title: string
  description: string
  color: string
  bgGradient: string
}

const ModuleCard = ({ href, icon, title, description, color, bgGradient }: ModuleCardProps) => (
  <Link href={href} className="group block">
    <div className={`relative p-6 rounded-xl border border-gray-200 bg-gradient-to-br ${bgGradient} hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden`}>
      {/* Background pattern */}
      <div className="absolute top-0 right-0 w-32 h-32 opacity-10">
        <div className="w-full h-full bg-white rounded-full transform translate-x-16 -translate-y-16"></div>
      </div>
      
      <div className="relative z-10">
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${color} mb-4 group-hover:scale-110 transition-transform duration-300`}>
          {icon}
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
)

const StatCard = ({ icon, title, value, change, changeType }: {
  icon: React.ReactNode
  title: string
  value: string
  change: string
  changeType: 'positive' | 'negative'
}) => (
  <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
    <div className="flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="p-2 bg-blue-50 rounded-lg">
          {icon}
        </div>
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900">{value}</p>
        </div>
      </div>
      <div className={`flex items-center space-x-1 text-sm ${changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
        <TrendingUp className="w-4 h-4" />
        <span>{change}</span>
      </div>
    </div>
  </div>
)

export default function PurchasingDashboard() {
    const modules = [
    {
      href: "./purchasing/demand-requests",
      icon: <ShoppingCart className="w-6 h-6 text-white" />,
      title: "Demandes d'achat",
      description: "Gérez les demandes d'achat internes et suivez leur statut d'approbation",
      color: "bg-blue-500",
      bgGradient: "from-blue-50 to-blue-100"
    },
    {
      href: "./purchasing/orders",
      icon: <FileText className="w-6 h-6 text-white" />,
      title: "Bons de commande",
      description: "Créez et suivez vos bons de commande auprès des fournisseurs",
      color: "bg-green-500",
      bgGradient: "from-green-50 to-green-100"
    },
    {
      href: "./purchasing/receptions",
      icon: <Package className="w-6 h-6 text-white" />,
      title: "Réceptions",
      description: "Enregistrez les réceptions de marchandises et vérifiez la conformité",
      color: "bg-purple-500",
      bgGradient: "from-purple-50 to-purple-100"
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
  ]

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
            title="Commandes en cours"
            value="24"
            change="+12%"
            changeType="positive"
          />
          <StatCard 
            icon={<Package className="w-5 h-5 text-blue-600" />}
            title="En attente réception"
            value="8"
            change="-5%"
            changeType="negative"
          />
          <StatCard 
            icon={<Receipt className="w-5 h-5 text-blue-600" />}
            title="Factures à traiter"
            value="12"
            change="+8%"
            changeType="positive"
          />
          <StatCard 
            icon={<Activity className="w-5 h-5 text-blue-600" />}
            title="Montant mensuel"
            value="€45,320"
            change="+15%"
            changeType="positive"
          />
        </div>

        {/* Module Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((module, index) => (
            <ModuleCard key={index} {...module} />
          ))}
        </div>

        {/* Quick Actions */}

       
      </div>
    </div>
  )
}