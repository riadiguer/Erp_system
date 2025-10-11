"use client";
import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingDown,
  Boxes,
  ShoppingBag,
  Archive
} from "lucide-react";
import WarehouseList from "./components/WarehouseList";
import WarehouseModal from "./components/WarehouseModal";
import WarehouseForm from "./components/WarehouseForm";
import StockAlert from "./components/StockAlert";

// Exemples de matières premières (mock)
const mockMaterials = [
  {
    id: 1,
    name: "Bâche PVC 450g",
    reference: "MP-001",
    stock: 75,
    minStock: 50,
    unit: "mètre",
    supplier: "Plastico",
    category: "Support d'impression",
    price: 12.50,
  },
  {
    id: 2,
    name: "Adhésif polymère",
    reference: "MP-002",
    stock: 10,
    minStock: 20,
    unit: "rouleau",
    supplier: "StickerPro",
    category: "Vinyle",
    price: 8.30,
  },
  {
    id: 3,
    name: "Encre UV Cyan",
    reference: "MP-003",
    stock: 45,
    minStock: 30,
    unit: "litre",
    supplier: "InkMaster",
    category: "Encres",
    price: 25.00,
  },
  {
    id: 4,
    name: "Vinyle adhésif blanc",
    reference: "MP-004",
    stock: 120,
    minStock: 100,
    unit: "mètre",
    supplier: "VinylPro",
    category: "Vinyle",
    price: 6.80,
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

export default function WarehousesPage() {
  const [materials, setMaterials] = useState(mockMaterials);
  const [selectedMaterial, setSelectedMaterial] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Handlers ---
  const handleViewDetails = (mat) => {
    setSelectedMaterial(mat);
    setShowModal(true);
  };

  const handleEdit = (mat) => {
    setSelectedMaterial(mat);
    setShowForm(true);
  };

  const handleDelete = (matId) => {
    setMaterials(materials.filter((m) => m.id !== matId));
    setShowModal(false);
  };

  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    setShowForm(true);
  };

  const handleSaveMaterial = (mat) => {
    if (mat.id) {
      // Update existing
      setMaterials(materials.map((m) => (m.id === mat.id ? mat : m)));
    } else {
      // Add new
      setMaterials([
        ...materials,
        { ...mat, id: Math.max(...materials.map(m => m.id)) + 1 },
      ]);
    }
    setShowForm(false);
  };

  // Calculs pour les statistiques
  const lowStockMaterials = materials.filter((m) => m.stock < m.minStock);
  const totalValue = materials.reduce((sum, m) => sum + (m.stock * (m.price || 0)), 0);
  const categories = [...new Set(materials.map(m => m.category))].length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* En-tête */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Package className="w-6 h-6 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Gestion des Entrepôts
                </h1>
                <p className="text-gray-600">
                  Matières premières et stocks
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
            icon={<Boxes />}
            title="Total articles"
            value={materials.length}
            subtitle="Matières premières"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          
          <StatCard
            icon={<AlertTriangle />}
            title="Stock bas"
            value={lowStockMaterials.length}
            subtitle="Nécessite réapprovisionnement"
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
          
          <StatCard
            icon={<ShoppingBag />}
            title="Valeur totale"
            value={`${totalValue.toFixed(2)}€`}
            subtitle="Stock actuel"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatCard
            icon={<Archive />}
            title="Catégories"
            value={categories}
            subtitle="Types de matières"
            bgColor="bg-purple-100"
            iconColor="text-purple-600"
          />
        </div>

        {/* Alerte stock bas */}
        <StockAlert materials={lowStockMaterials} />

        {/* Actions principales */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, référence ou fournisseur..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddMaterial}
            className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter une matière première
          </button>
        </div>

        {/* Liste des matières premières */}
        <WarehouseList
          materials={materials}
          searchTerm={searchTerm}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* Modale Détails */}
      {showModal && selectedMaterial && (
        <WarehouseModal
          material={selectedMaterial}
          onClose={() => setShowModal(false)}
          onEdit={handleEdit}
          onDelete={() => handleDelete(selectedMaterial.id)}
        />
      )}

      {/* Modale Formulaire (Ajout/Modif) */}
      {showForm && (
        <WarehouseForm
          material={selectedMaterial}
          onSave={handleSaveMaterial}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}