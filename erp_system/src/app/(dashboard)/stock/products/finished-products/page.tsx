"use client";

import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp,
  ShoppingBag,
  Layers,
  DollarSign
} from "lucide-react";
import ProductList from "./components/ProductList";
import ProductModal from "./components/ProductModal";
import ProductForm from "./components/ProductForm";
import StockAlert from "./components/StockAlert";

const mockProducts = [
  {
    id: 1,
    name: "Roll-up Publicitaire",
    reference: "PR-001",
    stock: 8,
    minStock: 10,
    unit: "pièce",
    price: 3400,
    category: "Affichage",
  },
  {
    id: 2,
    name: "Banderole PVC",
    reference: "PR-002",
    stock: 35,
    minStock: 15,
    unit: "mètre",
    price: 1200,
    category: "Affichage",
  },
  {
    id: 3,
    name: "Panneau Akilux",
    reference: "PR-003",
    stock: 22,
    minStock: 20,
    unit: "pièce",
    price: 850,
    category: "Affichage",
  },
  {
    id: 4,
    name: "Stickers personnalisés",
    reference: "PR-004",
    stock: 150,
    minStock: 100,
    unit: "paquet",
    price: 450,
    category: "Impression",
  },
];

const StatCard = ({ icon, title, value, subtitle, bgColor, iconColor }) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-900">{value}</p>
        {subtitle && (
          <p className="text-sm text-gray-500 mt-1">{subtitle}</p>
        )}
      </div>
      <div className={`p-3 rounded-full ${bgColor}`}>
        {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}` })}
      </div>
    </div>
  </div>
);

export default function FinishedProductsPage() {
  const [products, setProducts] = useState(mockProducts);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Handlers ---
  const handleViewDetails = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleEdit = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = (productId) => {
    setProducts(products.filter((p) => p.id !== productId));
    setShowModal(false);
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleSaveProduct = (product) => {
    if (product.id) {
      setProducts(products.map((p) => (p.id === product.id ? product : p)));
    } else {
      setProducts([
        ...products,
        { ...product, id: Math.max(...products.map(p => p.id)) + 1 },
      ]);
    }
    setShowForm(false);
  };

  // Calculs pour les statistiques
  const lowStockProducts = products.filter((p) => p.stock < p.minStock);
  const totalValue = products.reduce((sum, p) => sum + (p.stock * p.price), 0);
  const categories = [...new Set(products.map(p => p.category))].length;
  const averageStock = Math.round(products.reduce((sum, p) => sum + p.stock, 0) / products.length);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <Package className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Produits Finis
                </h1>
                <p className="text-gray-600">
                  Gestion du catalogue et des stocks
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Package />}
            title="Total produits"
            value={products.length}
            subtitle="Produits finis"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          
          <StatCard
            icon={<AlertTriangle />}
            title="Stock bas"
            value={lowStockProducts.length}
            subtitle="Nécessite production"
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
          
          <StatCard
            icon={<DollarSign />}
            title="Valeur totale"
            value={`${totalValue.toLocaleString()} DA`}
            subtitle="Stock actuel"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatCard
            icon={<Layers />}
            title="Stock moyen"
            value={averageStock}
            subtitle={`${categories} catégories`}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Alerte stock bas */}
        <StockAlert products={lowStockProducts} />

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, référence ou catégorie..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddProduct}
            className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un produit
          </button>
        </div>

        {/* Liste des produits */}
        <ProductList
          products={products}
          searchTerm={searchTerm}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modale Détails */}
      {showModal && selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setShowModal(false)}
          onEdit={handleEdit}
          onDelete={() => handleDelete(selectedProduct.id)}
        />
      )}

      {/* Modale Formulaire */}
      {showForm && (
        <ProductForm
          product={selectedProduct}
          onSave={handleSaveProduct}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}