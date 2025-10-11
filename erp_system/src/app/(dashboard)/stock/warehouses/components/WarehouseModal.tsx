"use client";
import React from "react";
import {
  X,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  Calendar,
  Truck,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  ShoppingCart,
  Tag,
  Box,
} from "lucide-react";

export default function WarehouseModal({
  material,
  onClose,
  onEdit,
  onDelete,
}) {
  if (!material) return null;

  // Mock stats (en production, ces données viendraient de votre API)
  const mockStats = {
    totalUsed: 145,
    lastEntry: "2024-09-18",
    avgMonthlyUsage: 28,
    lastOrder: "2024-08-25",
    estimatedDuration: 12, // jours
    totalValue: material.stock * (material.price || 0),
  };

  // Calcul du statut du stock
  const getStockStatus = () => {
    const percentage = (material.stock / material.minStock) * 100;
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
  const percentage = Math.round((material.stock / material.minStock) * 100);

  // Données pour le mini graphique (mock)
  const usageData = [65, 72, 58, 80, 85, 90, 78, 85, 92, 88, 95, 100];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header avec dégradé */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative overflow-hidden">
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
                <Package className="w-8 h-8" />
              </div>
              <div className="flex-1">
                <h2 className="text-2xl font-bold mb-2">{material.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/90">
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {material.reference}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Box className="w-4 h-4 mr-1" />
                    {material.category}
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

            {/* Barre de progression du stock */}
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
              <div className="flex items-center justify-between mb-2 text-sm">
                <span>Stock actuel</span>
                <span className="font-bold">
                  {material.stock} / {material.minStock} {material.unit}
                </span>
              </div>
              <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                <div
                  className="h-full bg-white rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>
              <div className="flex justify-between mt-2 text-xs text-white/80">
                <span>{percentage}% du minimum</span>
                <span>
                  Durée estimée: {mockStats.estimatedDuration} jours
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Corps scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Statistiques en grille */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <TrendingUp className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">
                  UTILISÉ
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.totalUsed}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total utilisé</div>
            </div>

            <div className="bg-green-50 rounded-xl p-4 border border-green-200">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-green-600" />
                <span className="text-xs font-medium text-green-600">
                  MENSUEL
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.avgMonthlyUsage}
              </div>
              <div className="text-xs text-gray-600 mt-1">
                Conso. moyenne
              </div>
            </div>

            <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
              <div className="flex items-center justify-between mb-2">
                <Calendar className="w-5 h-5 text-purple-600" />
                <span className="text-xs font-medium text-purple-600">
                  DERNIÈRE
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {new Date(mockStats.lastEntry).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
              <div className="text-xs text-gray-600 mt-1">Entrée stock</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <DollarSign className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">
                  VALEUR
                </span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.totalValue.toFixed(2)}€
              </div>
              <div className="text-xs text-gray-600 mt-1">Stock actuel</div>
            </div>
          </div>

          {/* Graphique d'utilisation (simulé) */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
              Évolution de l'utilisation (12 derniers mois)
            </h3>
            <div className="flex items-end justify-between h-32 space-x-2">
              {usageData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-purple-600 to-purple-400 rounded-t-lg transition-all hover:from-purple-700 hover:to-purple-500 relative group"
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
                <Package className="w-4 h-4 mr-2 text-purple-600" />
                Informations produit
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Référence</span>
                  <span className="text-sm font-medium text-gray-900">
                    {material.reference}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Catégorie</span>
                  <span className="text-sm font-medium text-gray-900 bg-purple-100 px-2 py-1 rounded">
                    {material.category}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unité</span>
                  <span className="text-sm font-medium text-gray-900">
                    {material.unit}
                  </span>
                </div>
                {material.price && (
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Prix unitaire</span>
                    <span className="text-sm font-medium text-gray-900">
                      {material.price.toFixed(2)}€
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center border-b border-gray-200 pb-2">
                <Truck className="w-4 h-4 mr-2 text-purple-600" />
                Fournisseur et commandes
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Fournisseur</span>
                  <span className="text-sm font-medium text-gray-900">
                    {material.supplier}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">
                    Dernière commande
                  </span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(mockStats.lastOrder).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Stock minimum</span>
                  <span className="text-sm font-medium text-gray-900">
                    {material.minStock} {material.unit}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Alerte si stock bas */}
          {material.stock < material.minStock && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    Stock insuffisant
                  </h4>
                  <p className="text-sm text-red-700">
                    Le stock actuel est inférieur au seuil minimum. Il est
                    recommandé de passer une commande rapidement pour éviter
                    une rupture.
                  </p>
                  <button className="mt-3 inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
                    <ShoppingCart className="w-4 h-4 mr-2" />
                    Commander maintenant
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer avec actions */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => onEdit(material)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
              <button
                onClick={() => {
                  if (
                    window.confirm(
                      `Êtes-vous sûr de vouloir supprimer ${material.name} ?`
                    )
                  ) {
                    onDelete(material.id);
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