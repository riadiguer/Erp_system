"use client";
import React, { useState } from "react";
import { 
  Eye, 
  Edit, 
  Trash2, 
  ShoppingCart, 
  Package, 
  AlertCircle,
  CheckCircle,
  Grid3x3,
  List,
  DollarSign
} from "lucide-react";

export default function ProductList({
  products,
  searchTerm,
  onViewDetails,
  onEdit,
  onDelete,
}) {
  const [filterCategory, setFilterCategory] = useState("");
  const [viewMode, setViewMode] = useState("grid");

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.reference.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory
      ? product.category === filterCategory
      : true;
    return matchesSearch && matchesCategory;
  });

  const categories = Array.from(new Set(products.map((p) => p.category)));

  const getStockStatus = (stock, minStock) => {
    const percentage = (stock / minStock) * 100;
    if (percentage < 50) return { 
      status: "Critique", 
      color: "red", 
      icon: <AlertCircle className="w-4 h-4" />,
      bgColor: "bg-red-50",
      borderColor: "border-red-200",
      textColor: "text-red-700"
    };
    if (percentage < 100) return { 
      status: "Bas", 
      color: "orange", 
      icon: <AlertCircle className="w-4 h-4" />,
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
      textColor: "text-orange-700"
    };
    return { 
      status: "Normal", 
      color: "green", 
      icon: <CheckCircle className="w-4 h-4" />,
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      textColor: "text-green-700"
    };
  };

  const GridView = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {filteredProducts.map((product) => {
        const stockStatus = getStockStatus(product.stock, product.minStock);
        const percentage = Math.round((product.stock / product.minStock) * 100);

        return (
          <div
            key={product.id}
            className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 group"
          >
            <div className={`p-4 ${stockStatus.bgColor} border-b ${stockStatus.borderColor}`}>
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-2 flex-1">
                  <div className={`p-2 bg-${stockStatus.color}-100 rounded-lg`}>
                    <Package className={`w-5 h-5 text-${stockStatus.color}-600`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate group-hover:text-green-600 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-sm text-gray-500">{product.reference}</p>
                  </div>
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.textColor} border ${stockStatus.borderColor}`}>
                  {stockStatus.icon}
                  <span className="ml-1">{stockStatus.status}</span>
                </span>
              </div>
            </div>

            <div className="p-4">
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Catégorie</span>
                  <span className="font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded">
                    {product.category}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Prix unitaire</span>
                  <span className="font-medium text-gray-900 flex items-center">
                    <DollarSign className="w-4 h-4 mr-1" />
                    {product.price.toLocaleString()} DA
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">Unité</span>
                  <span className="font-medium text-gray-900">{product.unit}</span>
                </div>
              </div>

              <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700">Stock actuel</span>
                  <span className="text-sm font-bold text-gray-900">
                    {product.stock} / {product.minStock} {product.unit}
                  </span>
                </div>
                <div className="relative">
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-${stockStatus.color}-500 transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(percentage, 100)}%` }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{percentage}%</span>
                    <span className="text-xs text-gray-500">du minimum</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-4 border-t border-gray-100">
                <button
                  onClick={() => onViewDetails(product)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors text-sm font-medium"
                  title="Voir détails"
                >
                  <Eye className="w-4 h-4 mr-1" />
                  Détails
                </button>
                <button
                  onClick={() => onEdit(product)}
                  className="flex-1 flex items-center justify-center px-3 py-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors text-sm font-medium"
                  title="Modifier"
                >
                  <Edit className="w-4 h-4 mr-1" />
                  Modifier
                </button>
                <button
                  onClick={() => {
                    if (window.confirm(`Supprimer ${product.name} ?`)) {
                      onDelete(product.id);
                    }
                  }}
                  className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                  title="Supprimer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>

            {product.stock < product.minStock && (
              <div className="px-4 py-3 bg-gray-50 border-t border-gray-100">
                <button
                  className="w-full flex items-center justify-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                  onClick={() => alert("Demande de production à implémenter")}
                >
                  <ShoppingCart className="w-4 h-4 mr-2" />
                  Lancer production
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const ListView = () => (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Produit
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Catégorie
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Prix
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Stock
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredProducts.map((product) => {
              const stockStatus = getStockStatus(product.stock, product.minStock);
              
              return (
                <tr key={product.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className={`p-2 bg-${stockStatus.color}-100 rounded-lg`}>
                        <Package className={`w-4 h-4 text-${stockStatus.color}-600`} />
                      </div>
                      <div className="ml-3">
                        <div className="text-sm font-medium text-gray-900">{product.name}</div>
                        <div className="text-sm text-gray-500">{product.reference}</div>
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900 bg-gray-100 px-2 py-1 rounded">
                      {product.category}
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {product.price.toLocaleString()} DA
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm">
                      <div className="font-medium text-gray-900">
                        {product.stock} / {product.minStock} {product.unit}
                      </div>
                      <div className="w-24 bg-gray-200 rounded-full h-1.5 mt-1">
                        <div
                          className={`h-full bg-${stockStatus.color}-500 rounded-full`}
                          style={{ width: `${Math.min((product.stock / product.minStock) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center px-2 py-1 text-xs font-semibold rounded-full ${stockStatus.bgColor} ${stockStatus.textColor} border ${stockStatus.borderColor}`}>
                      {stockStatus.icon}
                      <span className="ml-1">{stockStatus.status}</span>
                    </span>
                  </td>
                  
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex items-center justify-end space-x-2">
                      <button
                        onClick={() => onViewDetails(product)}
                        className="text-blue-600 hover:text-blue-900 p-1 rounded"
                        title="Voir détails"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onEdit(product)}
                        className="text-green-600 hover:text-green-900 p-1 rounded"
                        title="Modifier"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (window.confirm(`Supprimer ${product.name} ?`)) {
                            onDelete(product.id);
                          }
                        }}
                        className="text-red-600 hover:text-red-900 p-1 rounded"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <select
            className="border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-green-500 focus:border-green-500"
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
          >
            <option value="">Toutes catégories</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
          
          <div className="text-sm text-gray-600">
            {filteredProducts.length} produit{filteredProducts.length > 1 ? "s" : ""}
          </div>
        </div>

        <div className="flex items-center bg-gray-100 rounded-lg p-1">
          <button
            onClick={() => setViewMode("grid")}
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              viewMode === "grid"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <Grid3x3 className="w-4 h-4 mr-2" />
            Grille
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`flex items-center px-3 py-2 rounded-md transition-colors ${
              viewMode === "list"
                ? "bg-white text-green-600 shadow-sm"
                : "text-gray-600 hover:text-gray-900"
            }`}
          >
            <List className="w-4 h-4 mr-2" />
            Liste
          </button>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Aucun produit trouvé
          </h3>
          <p className="text-gray-500">
            {searchTerm || filterCategory
              ? "Essayez de modifier vos critères de recherche."
              : "Commencez par ajouter votre premier produit fini."}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <GridView />
      ) : (
        <ListView />
      )}
    </div>
  );
}