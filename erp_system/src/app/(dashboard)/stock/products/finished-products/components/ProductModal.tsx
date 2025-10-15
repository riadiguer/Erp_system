"use client";
import React from "react";
import {
  X,
  Edit,
  Trash2,
  Package,
  TrendingUp,
  Calendar,
  ShoppingCart,
  DollarSign,
  BarChart3,
  AlertCircle,
  CheckCircle,
  Tag,
  Box,
  Layers,
} from "lucide-react";
import { type Product } from "@/lib/features/sales/api";

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  onEdit: (product: Product) => void;
  onDelete: () => void;
}

export default function ProductModal({
  product,
  onClose,
  onEdit,
  onDelete,
}: ProductModalProps) {
  if (!product) return null;

  const stockQty = parseFloat(product.stock_qty || "0");
  const unitPrice = parseFloat(product.unit_price || "0");
  const taxRate = parseFloat(product.tax_rate || "0");
  const minStock = 10; // You can adjust this threshold
  
  const mockStats = {
    totalSales: 12,
    totalDemand: 19,
    lastMovement: product.updated_at,
    avgMonthlyConsumption: 4,
    lastProduction: product.created_at,
    totalValue: stockQty * unitPrice,
  };

  const getStockStatus = () => {
    if (!product.track_stock) {
      return {
        status: "N/A",
        color: "gray",
        icon: <Package className="w-5 h-5" />,
        bgColor: "bg-gray-50",
        textColor: "text-gray-700",
        borderColor: "border-gray-200",
      };
    }

    const percentage = (stockQty / minStock) * 100;
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
  const percentage = product.track_stock ? Math.round((stockQty / minStock) * 100) : 100;

  const salesData = [45, 52, 48, 60, 65, 70, 58, 65, 72, 68, 75, 80];

  function handleDelete(event: React.MouseEvent<HTMLButtonElement>): void {
    throw new Error("Function not implemented.");
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white relative overflow-hidden">
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
                <h2 className="text-2xl font-bold mb-2">{product.name}</h2>
                <div className="flex items-center space-x-4 text-sm text-white/90">
                  <span className="flex items-center">
                    <Tag className="w-4 h-4 mr-1" />
                    {product.sku}
                  </span>
                  <span>•</span>
                  <span className="flex items-center">
                    <Box className="w-4 h-4 mr-1" />
                    {product.type === "GOOD" ? "Bien" : "Service"}
                  </span>
                  {!product.is_active && (
                    <>
                      <span>•</span>
                      <span className="flex items-center bg-white/20 px-2 py-1 rounded">
                        Inactif
                      </span>
                    </>
                  )}
                </div>
              </div>
              <div
                className={`px-4 py-2 rounded-full ${stockStatus.bgColor} ${stockStatus.textColor} border ${stockStatus.borderColor} flex items-center space-x-2 font-semibold`}
              >
                {stockStatus.icon}
                <span>{stockStatus.status}</span>
              </div>
            </div>

            {product.track_stock && (
              <div className="bg-white/20 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center justify-between mb-2 text-sm">
                  <span>Stock actuel</span>
                  <span className="font-bold">
                    {stockQty} {product.unit || "unité"}
                  </span>
                </div>
                <div className="w-full bg-white/30 rounded-full h-3 overflow-hidden">
                  <div
                    className="h-full bg-white rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(percentage, 100)}%` }}
                  />
                </div>
                <div className="flex justify-between mt-2 text-xs text-white/80">
                  <span>{percentage}% du seuil</span>
                  <span>Valeur: {(mockStats.totalValue || 0).toLocaleString("fr-DZ")} DA</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Corps */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Statistiques */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-blue-50 rounded-xl p-4 border border-blue-200">
              <div className="flex items-center justify-between mb-2">
                <ShoppingCart className="w-5 h-5 text-blue-600" />
                <span className="text-xs font-medium text-blue-600">VENTES</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.totalSales}
              </div>
              <div className="text-xs text-gray-600 mt-1">Total vendus</div>
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
                {new Date(mockStats.lastMovement).toLocaleDateString("fr-FR", {
                  day: "2-digit",
                  month: "short",
                })}
              </div>
              <div className="text-xs text-gray-600 mt-1">Mouvement</div>
            </div>

            <div className="bg-orange-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center justify-between mb-2">
                <BarChart3 className="w-5 h-5 text-orange-600" />
                <span className="text-xs font-medium text-orange-600">MENSUEL</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">
                {mockStats.avgMonthlyConsumption}
              </div>
              <div className="text-xs text-gray-600 mt-1">Conso. moyenne</div>
            </div>
          </div>

          {/* Graphique */}
          <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
            <h3 className="text-sm font-semibold text-gray-900 mb-4 flex items-center">
              <BarChart3 className="w-4 h-4 mr-2 text-green-600" />
              Évolution des ventes (12 derniers mois)
            </h3>
            <div className="flex items-end justify-between h-32 space-x-2">
              {salesData.map((value, index) => (
                <div
                  key={index}
                  className="flex-1 bg-gradient-to-t from-green-600 to-green-400 rounded-t-lg transition-all hover:from-green-700 hover:to-green-500 relative group"
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
                <Package className="w-4 h-4 mr-2 text-green-600" />
                Informations produit
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Référence (SKU)</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.sku}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Type</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    product.type === "GOOD" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-purple-100 text-purple-800"
                  }`}>
                    {product.type === "GOOD" ? "Bien" : "Service"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Unité</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.unit || "N/A"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prix unitaire HT</span>
                  <span className="text-sm font-medium text-gray-900">
                    {(unitPrice || 0).toLocaleString("fr-DZ")} DA
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">TVA</span>
                  <span className="text-sm font-medium text-gray-900">
                    {taxRate}%
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Prix TTC</span>
                  <span className="text-sm font-bold text-gray-900">
                    {((unitPrice * (1 + taxRate / 100)) || 0).toLocaleString("fr-DZ")} DA
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-gray-900 flex items-center border-b border-gray-200 pb-2">
                <Layers className="w-4 h-4 mr-2 text-green-600" />
                Stock et dates
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Suivi du stock</span>
                  <span className="text-sm font-medium text-gray-900">
                    {product.track_stock ? "Oui" : "Non"}
                  </span>
                </div>
                {product.track_stock && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Stock actuel</span>
                      <span className="text-sm font-medium text-gray-900">
                        {stockQty} {product.unit || "unité"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm text-gray-600">Valeur totale</span>
                      <span className="text-sm font-medium text-gray-900">
                        {(mockStats.totalValue || 0).toLocaleString("fr-DZ")} DA
                      </span>
                    </div>
                  </>
                )}
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Créé le</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(product.created_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Modifié le</span>
                  <span className="text-sm font-medium text-gray-900">
                    {new Date(product.updated_at).toLocaleDateString("fr-FR")}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Statut</span>
                  <span className={`text-sm font-medium px-2 py-1 rounded ${
                    product.is_active 
                      ? "bg-green-100 text-green-800" 
                      : "bg-gray-100 text-gray-800"
                  }`}>
                    {product.is_active ? "Actif" : "Inactif"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Description */}
          {product.description && (
            <div className="bg-gray-50 rounded-xl p-4 mb-6 border border-gray-200">
              <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
              <p className="text-sm text-gray-700">{product.description}</p>
            </div>
          )}

          {/* Alerte stock bas */}
          {product.track_stock && stockQty < minStock && (
            <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 mb-6">
              <div className="flex items-start">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5 mr-3 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-sm font-semibold text-red-900 mb-1">
                    Stock insuffisant
                  </h4>
                  <p className="text-sm text-red-700">
                    Le stock actuel ({stockQty} {product.unit}) est inférieur au seuil recommandé ({minStock} {product.unit}). 
                    Il est recommandé de réapprovisionner rapidement.
                  </p>
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
                onClick={() => onEdit(product)}
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier
              </button>
              <button
                onClick={handleDelete}
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