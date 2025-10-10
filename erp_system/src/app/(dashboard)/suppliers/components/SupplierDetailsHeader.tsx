"use client";

import { Building2, MapPin, Phone, Mail, Hash, CreditCard } from "lucide-react";

interface SupplierDetailsHeaderProps {
  supplier: any;
}

export default function SupplierDetailsHeader({ supplier }: SupplierDetailsHeaderProps) {
  if (!supplier) return null;

  const InfoItem = ({ 
    icon: Icon, 
    label, 
    value, 
    color = "text-gray-600" 
  }: {
    icon: any;
    label: string;
    value: string;
    color?: string;
  }) => (
    <div className="flex items-start space-x-3 group">
      <div className={`p-2 ${color.replace('text-', 'bg-').replace('600', '50')} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
        <Icon className={`w-4 h-4 ${color}`} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-0.5">
          {label}
        </p>
        <p className="text-sm font-semibold text-gray-900 truncate">
          {value || "—"}
        </p>
      </div>
    </div>
  );

  const StatusBadge = ({ balance }: { balance: number }) => {
    const isDebt = balance > 0;
    return (
      <div className={`inline-flex items-center px-4 py-2 rounded-xl font-semibold text-sm shadow-sm ${
        isDebt 
          ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' 
          : 'bg-gradient-to-r from-green-500 to-green-600 text-white'
      }`}>
        <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
        {isDebt ? 'Dette en cours' : 'Compte à jour'}
      </div>
    );
  };

  return (
    <div className="relative overflow-hidden">
      {/* Decorative background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 opacity-50"></div>
      <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-blue-200 to-purple-200 rounded-full blur-3xl opacity-20 translate-x-1/2 -translate-y-1/2"></div>

      <div className="relative z-10 p-6">
        {/* En-tête principal */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-start space-x-4">
            {/* Logo/Icon du fournisseur */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl shadow-lg shadow-blue-200 flex items-center justify-center flex-shrink-0">
              <Building2 className="w-8 h-8 text-white" />
            </div>
            
            <div>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">
                {supplier.name}
              </h3>
              <p className="text-sm text-gray-600">
                Fournisseur #{supplier.id || "N/A"}
              </p>
            </div>
          </div>

          {/* Badge de statut */}
          <StatusBadge balance={supplier.balance || 0} />
        </div>

        {/* Grille d'informations */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-5 border border-white/50 shadow-sm">
          <InfoItem
            icon={Phone}
            label="Téléphone"
            value={supplier.phone}
            color="text-blue-600"
          />
          <InfoItem
            icon={Mail}
            label="Email"
            value={supplier.email}
            color="text-green-600"
          />
          <InfoItem
            icon={MapPin}
            label="Adresse"
            value={supplier.address}
            color="text-purple-600"
          />
        </div>

        {/* Informations fiscales et bancaires */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-amber-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase">NIF</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{supplier.nif || "—"}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <Hash className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase">RC</span>
            </div>
            <p className="text-lg font-bold text-gray-900">{supplier.rc || "—"}</p>
          </div>

          <div className="bg-white/60 backdrop-blur-sm rounded-xl p-4 border border-white/50 shadow-sm">
            <div className="flex items-center space-x-2 mb-2">
              <CreditCard className="w-4 h-4 text-green-600" />
              <span className="text-xs font-semibold text-gray-600 uppercase">IBAN / RIB</span>
            </div>
            <p className="text-sm font-bold text-gray-900 truncate">{supplier.iban || "—"}</p>
          </div>
        </div>

        {/* Statistiques rapides */}
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-3 text-white shadow-lg">
            <p className="text-xs font-medium opacity-90 mb-1">Solde</p>
            <p className="text-lg font-bold">{(supplier.balance || 0).toLocaleString()} DA</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-3 text-white shadow-lg">
            <p className="text-xs font-medium opacity-90 mb-1">Commandes</p>
            <p className="text-lg font-bold">12</p>
          </div>
          
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-3 text-white shadow-lg">
            <p className="text-xs font-medium opacity-90 mb-1">Factures</p>
            <p className="text-lg font-bold">8</p>
          </div>
          
          <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-xl p-3 text-white shadow-lg">
            <p className="text-xs font-medium opacity-90 mb-1">Dernière commande</p>
            <p className="text-sm font-bold">{supplier.lastOrder || "—"}</p>
          </div>
        </div>
      </div>
    </div>
  );
}