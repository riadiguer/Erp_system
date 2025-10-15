"use client";
import React, { useState } from "react";
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle,
  Boxes,
  ShoppingBag,
  Archive
} from "lucide-react";
import WarehouseList from "./components/WarehouseList";
import WarehouseModal from "./components/WarehouseModal";
import WarehouseForm from "./components/WarehouseForm";
import StockAlert from "./components/StockAlert";
import { WarehouseApi, type Material } from "@/lib/features/warehouse/api";
import { useMaterials, useDashboard } from "@/lib/features/warehouse/hooks";
import { toast } from "sonner"; // ou votre système de notification

interface StatCardProps {
  icon: React.ReactElement;
  title: string;
  value: string | number;
  subtitle?: string;
  bgColor: string;
  iconColor: string;
}

const StatCard = ({ icon, title, value, subtitle, bgColor, iconColor }: StatCardProps) => (
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
        <div className={`w-6 h-6 ${iconColor}`}>
          {icon}
        </div>
      </div>
    </div>
  </div>
);

export default function WarehousesPage() {
  // Utilisation des hooks pour récupérer les données
  const { materials, loading, error, refresh } = useMaterials();
  const { stats } = useDashboard();
  
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // --- Handlers ---
  const handleViewDetails = (mat: Material) => {
    setSelectedMaterial(mat);
    setShowModal(true);
  };

  const handleEdit = (mat: Material) => {
    setSelectedMaterial(mat);
    setShowForm(true);
  };

const handleDelete = async (matId: number) => {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette matière ?")) {
    return;
  }
  
  try {
    await WarehouseApi.materials.remove(matId);
    toast.success("Matière supprimée avec succès");
    refresh(); // Rafraîchir la liste
    setShowModal(false);
  } catch (err: any) {
    console.error("Erreur complète:", err);
    
    let errorMessage = "Erreur lors de la suppression";
    if (err.detail) {
      errorMessage = err.detail;
    }
    
    toast.error(errorMessage);
  }
};

  const handleAddMaterial = () => {
    setSelectedMaterial(null);
    setShowForm(true);
  };

const handleSaveMaterial = async (mat: any) => {
  console.log("=== DEBUT handleSaveMaterial ===");
  console.log("Données envoyées:", mat);
  console.log("ID présent?", !!mat.id);
  
  try {
    let result;
    if (mat.id) {
      console.log("Mode: UPDATE, ID:", mat.id);
      result = await WarehouseApi.materials.update(mat.id, mat);
      console.log("Résultat update:", result);
      toast.success("Matière modifiée avec succès");
    } else {
      console.log("Mode: CREATE");
      result = await WarehouseApi.materials.create(mat);
      console.log("Résultat create:", result);
      toast.success("Matière ajoutée avec succès");
    }
    
    console.log("Appel refresh...");
    await refresh(); // Rafraîchir la liste
    console.log("Fermeture form...");
    setShowForm(false);
    console.log("=== FIN handleSaveMaterial SUCCESS ===");
  } catch (err: any) {
    console.error("=== ERREUR CAPTURÉE ===");
    console.error("Type:", typeof err);
    console.error("Erreur complète:", err);
    console.error("err.status:", err?.status);
    console.error("err.detail:", err?.detail);
    console.error("err.message:", err?.message);
    console.error("Object.keys:", Object.keys(err || {}));
    console.error("JSON.stringify:", JSON.stringify(err, null, 2));
    
    let errorMessage = "Erreur lors de l'enregistrement";
    
    if (err?.detail) {
      errorMessage = err.detail;
    } else if (err?.message) {
      errorMessage = err.message;
    } else if (err?.status) {
      errorMessage = `Erreur ${err.status}`;
    }
    
    // Afficher les erreurs de validation
    if (err?.errors) {
      console.error("Erreurs de validation:", err.errors);
      const errors = Object.entries(err.errors)
        .map(([field, msgs]) => `${field}: ${(msgs as string[]).join(', ')}`)
        .join('\n');
      errorMessage = errors || errorMessage;
    }
    
    toast.error(errorMessage);
    console.error("=== FIN handleSaveMaterial ERROR ===");
  }
};

  // Calculs pour les statistiques (depuis le dashboard ou calculés localement)
  const lowStockMaterials = materials.filter((m) => m.is_low_stock);
  const totalValue = materials.reduce((sum, m) => sum + parseFloat(m.total_value || '0'), 0);
  const categories = [...new Set(materials.map(m => m.category_name))].length;

  // Loading state
  if (loading && !materials.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Package className="w-16 h-16 text-purple-600 mx-auto mb-4 animate-pulse" />
          <p className="text-gray-600">Chargement des données...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600">Erreur lors du chargement des données</p>
          <button 
            onClick={() => refresh()} 
            className="mt-4 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
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
            value={stats?.total_materials || materials.length}
            subtitle="Matières premières"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          
          <StatCard
            icon={<AlertTriangle />}
            title="Stock bas"
            value={stats?.low_stock_count || lowStockMaterials.length}
            subtitle="Nécessite réapprovisionnement"
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
          
          <StatCard
            icon={<ShoppingBag />}
            title="Valeur totale"
            value={`${parseFloat(stats?.total_value || totalValue.toString()).toFixed(2)}€`}
            subtitle="Stock actuel"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatCard
            icon={<Archive />}
            title="Catégories"
            value={stats?.categories_count || categories}
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