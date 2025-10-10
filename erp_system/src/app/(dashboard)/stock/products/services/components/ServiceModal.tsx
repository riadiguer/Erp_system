"use client";
import React from "react";
import {
  X,
  Edit,
  Trash2,
  Briefcase,
  TrendingUp,
  Calendar,
  Users,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Tag,
  Box,
  Clock,
} from "lucide-react";

export default function ServiceModal({
  service,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!service) return null;

  const mockStats = {
    totalSales: 7,
    totalDemand: 11,
    lastMovement: "2024-09-20",
    avgMonthlyConsumption: 2,
    lastBooking: "2024-09-18",
    totalValue: service.stock * service.price,
  };

  const getStockStatus = () => {
    const percentage = (service.stock / service.minStock) * 100;
    if (percentage < 50)
      return {
        status: "Critique",
        color: "red",
        icon: <AlertCircle className="w-5 h-5" />,
        bgColor: "bg-red-50",
        textColor: "text-red-700",
        borderColor: "border-red-200",
      };
    if (percentage < 100)
      return {
        status: "Bas",
        color: "orange",
        icon: <AlertCircle className="w-5 h-5" />,
        bgColor: "bg-orange-50",
        textColor: "text-orange-700",
        borderColor: "border-orange-200",
      };
    return {
      status: "Normal",
      color: "green",
      icon: <CheckCircle className="w-5 h-5" />,
      bgColor: "bg-green-50",
      textColor: "text-green-700",
      borderColor: "border-green-200",
    };
  };

  const stockStatus = getStockStatus();
  const percentage = Math.round((service.stock / service.minStock) * 100);

  const demandData = [35, 42, 38, 50, 55, 60, 48, 55, 62, 58, 65, 70];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <button
              className="absolute right-0 top-0 text-white/80 hover:text-white transition-colors"
              onClick={onClose}
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-start space-x-4 mb-4">
              <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl">
                <Briefcase className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{service.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/90">
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {service.reference}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Box className="w-4 h-4 mr-1" />
                    {service.category}
                  </span>
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full ${stockStatus.bgColor} ${stockStatus.textColor} border ${stockStatus.borderColor} flex items-center space-x-2 font-semibold`}
              >
                {stockStatus.icon}
                <span>{stockStatus.status}</span>
              </div>
            </div>

            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Capacité disponible</span>
                <span className="font-bold">
                  {service.stock} / {service.minStock} {service.unit}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/80">
                <span>{percentage}% de la capacité min.</span>
                <span>Valeur: {mockStats.totalValue.toLocaleString()} DA</span>
              </div>
            </div>
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <Users className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">VENTES</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.totalSales}
              </div>
              <div className="text-xs text-gray-600 mt-1">Services vendus</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-green-600">DEMANDES</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.totalDemand}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total demandes</div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">DERNIER</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {new Date(mockStats.lastBooking).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
              <div className="text-xs text-gray-600 mt-1">Réservation</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <Clock className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">MENSUEL</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.avgMonthlyConsumption}
              </div>
              <div className="text-xs text-gray-600 mt-1">Utilisation moy.</div>
            </div>
          </div>

          {/* Graphique */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-indigo-600" />
              Évolution de la demande (12 derniers mois)
            </h3>
            <div className="flex items-end justify-between h-32 space-x-2">
              {demandData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-lg transition-all hover:from-indigo-700 hover:to-indigo-500 relative group"
                  style={{ height: `${value}%` }}
                >
                  <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {value}%
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              <span>Jan</span>
              <span>Déc</span>
            </div>
          </div>

          {/* Informations détaillées */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center border-b border-gray-200 pb-2">
                <Briefcase className="w-4 h-4 mr-2 text-indigo-600" />
                Informations service
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Référence</span>
                  <span className="text-sm font-medium text-gray-900">
                    {service.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Catégorie</span>
                  <span className="text-sm font-medium text-gray-900 bg-indigo-100 px-2 py-1 rounded">
                    {service.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unité</span>
                  <span className="text-sm font-medium text-gray-900">
                    {service.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prix unitaire</span>
                  <span className="text-sm font-medium text-gray-900">
                    {service.price.toLocaleString()} DA
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center border-b border-gray-200 pb-2">
                <Calendar className="w-4 h-4 mr-2 text-indigo-600" />
                Disponibilité et capacité
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Dernière réservation</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(mockStats.lastBooking).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Capacité minimum</span>
                  <span className="text-sm font-medium text-gray-900">
                    {service.minStock} {service.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Capacité actuelle</span>
                  <span className="text-sm font-medium text-gray-900">
                    {service.stock} {service.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Valeur totale</span>
                  <span className="text-sm font-medium text-gray-900">
                    {mockStats.totalValue.toLocaleString()} DA
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerte capacité basse */}
          {service.stock < service.minStock && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    Capacité insuffisante
                  </h4>
                  <p className="text-sm text-red-700">
                    La capacité actuelle est inférieure au seuil minimum. Pensez à planifier ce service ou à augmenter la capacité disponible.
                  </p>
                  <button className="mt-3 inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                    <Calendar className="w-4 h-4 mr-2" />
                    Planifier maintenant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(service)}
                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Êtes-vous sûr de vouloir supprimer ${service.name} ?`
                    )
                  ) {
                    onDelete(service.id);
                  }
                }}
                className="inline-flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Supprimer
              </button>
            </div>
            <button
              onClick={onClose}
              className="inline-flex items-center px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
            >
              Fermer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}