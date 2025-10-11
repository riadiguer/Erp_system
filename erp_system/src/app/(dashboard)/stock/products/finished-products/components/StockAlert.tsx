"use client";
import React from "react";
import { AlertTriangle, Package, TrendingDown, ShoppingCart } from "lucide-react";

export default function StockAlert({ products }) {
  if (!products || products.length === 0) return null;

  const sortedProducts = [...products].sort((a, b) => {
    const percentA = (a.stock / a.minStock) * 100;
    const percentB = (b.stock / b.minStock) * 100;
    return percentA - percentB;
  });

  const getStockLevel = (stock, minStock) => {
    const percentage = (stock / minStock) * 100;
    if (percentage < 50) return { level: "Critique", color: "red", bgColor: "bg-red-50", borderColor: "border-red-200" };
    if (percentage < 75) return { level: "Très bas", color: "orange", bgColor: "bg-orange-50", borderColor: "border-orange-200" };
    return { level: "Bas", color: "yellow", bgColor: "bg-yellow-50", borderColor: "border-yellow-200" };
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-red-50 to-orange-50 border-l-4 border-red-500 rounded-lg shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-red-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-red-900">
                Alerte Stock Bas
              </h3>
              <p className="text-sm text-red-700">
                {products.length} produit{products.length > 1 ? "s" : ""} nécessite{products.length > 1 ? "nt" : ""} une production
              </p>
            </div>
          </div>
          <button className="inline-flex items-center px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 transition-colors">
            <ShoppingCart className="w-4 h-4 mr-2" />
            Produire tout
          </button>
        </div>

        <div className="space-y-3">
          {sortedProducts.map((p) => {
            const stockInfo = getStockLevel(p.stock, p.minStock);
            const percentage = Math.round((p.stock / p.minStock) * 100);

            return (
              <div
                key={p.id}
                className={`${stockInfo.bgColor} border ${stockInfo.borderColor} rounded-lg p-4 transition-all hover:shadow-md`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3 flex-1">
                    <div className={`p-2 bg-${stockInfo.color}-100 rounded-lg`}>
                      <Package className={`w-5 h-5 text-${stockInfo.color}-600`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">{p.name}</h4>
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-semibold rounded-full bg-${stockInfo.color}-100 text-${stockInfo.color}-800 border border-${stockInfo.color}-200`}>
                          {stockInfo.level}
                        </span>
                      </div>
                      <div className="flex items-center space-x-4 mt-1 text-sm text-gray-600">
                        <span className="font-medium">Réf: {p.reference}</span>
                        <span className="text-gray-400">•</span>
                        <span>{p.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right ml-4">
                    <div className="flex items-baseline space-x-1">
                      <span className="text-2xl font-bold text-gray-900">{p.stock}</span>
                      <span className="text-sm text-gray-500">/ {p.minStock}</span>
                      <span className="text-xs text-gray-400">{p.unit}</span>
                    </div>
                    <div className="flex items-center justify-end mt-1 text-xs text-gray-500">
                      <TrendingDown className="w-3 h-3 mr-1" />
                      {percentage}% du minimum
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-${stockInfo.color}-500 transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>Stock actuel</span>
                    <span>Stock minimum</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-4 pt-4 border-t border-red-200">
          <p className="text-sm text-red-700 flex items-center">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Pensez à lancer la production de ces produits pour éviter les ruptures de stock.
          </p>
        </div>
      </div>
    </div>
  );
}