"use client";

import React, { useState, useMemo } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  DollarSign,
  Layers,
  Loader2
} from "lucide-react";
import { useProducts } from "@/lib/features/sales/hooks";
import { SalesApi, type Product } from "@/lib/features/sales/api";
import ProductList from "./components/ProductList";
import ProductModal from "./components/ProductModal";
import ProductForm from "./components/ProductForm";
import StockAlert from "./components/StockAlert";

type StatCardProps = {
  icon: React.ReactElement;
  title: string;
  value: React.ReactNode;
  subtitle?: string;
  bgColor: string;
  iconColor: string;
};

const StatCard: React.FC<StatCardProps> = ({ icon, title, value, subtitle, bgColor, iconColor }) => (
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
        {React.cloneElement(icon as React.ReactElement<any>, { className: `w-6 h-6 ${iconColor}` })}
      </div>
    </div>
  </div>
);

export default function FinishedProductsPage() {
  const { products, loading, error, refresh } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter active products
  const activeProducts = useMemo(() => 
    products.filter(p => p.is_active), 
    [products]
  );

  // Filter by search term
  const filteredProducts = useMemo(() => {
    if (!searchTerm) return activeProducts;
    const term = searchTerm.toLowerCase();
    return activeProducts.filter(p => 
      p.name.toLowerCase().includes(term) ||
      p.sku.toLowerCase().includes(term) ||
      (p.description && p.description.toLowerCase().includes(term))
    );
  }, [activeProducts, searchTerm]);

  // --- Handlers ---
  const handleViewDetails = (product: Product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleEdit = (product: Product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleDelete = async (productId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce produit ?")) {
      return;
    }
    
    try {
      await SalesApi.products.remove(productId);
      setShowModal(false);
      setSelectedProduct(null);
      refresh();
    } catch (err) {
      console.error("Failed to delete product:", err);
      alert("Erreur lors de la suppression du produit");
    }
  };

  const handleAddProduct = () => {
    setSelectedProduct(null);
    setShowForm(true);
  };

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (selectedProduct?.id) {
        // Update existing product
        await SalesApi.products.update(selectedProduct.id, productData);
      } else {
        // Create new product
        await SalesApi.products.create(productData);
      }
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error("Failed to save product:", err);
      alert("Erreur lors de l'enregistrement du produit");
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    const lowStock = activeProducts.filter(p => 
      p.track_stock && parseFloat(p.stock_qty || "0") < 10 // You can adjust threshold
    );
    
    const totalValue = activeProducts.reduce((sum, p) => 
      sum + (parseFloat(p.stock_qty || "0") * parseFloat(p.unit_price || "0")), 0
    );
    
    const categories = new Set(activeProducts.map(p => p.type)).size;
    
    const averageStock = activeProducts.length > 0
      ? Math.round(activeProducts.reduce((sum, p) => 
          sum + parseFloat(p.stock_qty || "0"), 0) / activeProducts.length)
      : 0;

    return { lowStock, totalValue, categories, averageStock };
  }, [activeProducts]);

  // Loading state
  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-green-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des produits...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-900 font-semibold mb-2">Erreur de chargement</p>
          <p className="text-gray-600 mb-4">Impossible de charger les produits</p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

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
            value={activeProducts.length}
            subtitle="Produits actifs"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          
          <StatCard
            icon={<AlertTriangle />}
            title="Stock bas"
            value={stats.lowStock.length}
            subtitle="Nécessite réapprovisionnement"
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
          
          <StatCard
            icon={<DollarSign />}
            title="Valeur totale"
            value={`${(stats.totalValue || 0).toLocaleString('fr-DZ')} DA`}
            subtitle="Stock actuel"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatCard
            icon={<Layers />}
            title="Stock moyen"
            value={stats.averageStock}
            subtitle={`${stats.categories} types`}
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Alerte stock bas */}
        <StockAlert products={stats.lowStock} />

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, référence ou description..."
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
          products={filteredProducts}
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
          onClose={() => {
            setShowModal(false);
            setSelectedProduct(null);
          }}
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