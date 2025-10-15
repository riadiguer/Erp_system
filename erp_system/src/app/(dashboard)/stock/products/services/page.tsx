"use client";

import React, { useState, useMemo } from "react";
import { 
  Briefcase, 
  Plus, 
  Search, 
  AlertTriangle, 
  DollarSign,
  Layers,
  Loader2
} from "lucide-react";
import { useProducts } from "@/lib/features/sales/hooks";
import { SalesApi, type Product } from "@/lib/features/sales/api";
import ServiceList from "./components/ServiceList";
import ServiceModal from "./components/ServiceModal";
import ServiceForm from "./components/ServiceForm";
import StockAlert from "./components/StockAlert";

type StatCardProps = {
  icon: React.ReactElement<any>;
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
        {React.cloneElement(icon, { className: `w-6 h-6 ${iconColor}` })}
      </div>
    </div>
  </div>
);

export default function ServicesPage() {
  const { products, loading, error, refresh } = useProducts();
  const [selectedService, setSelectedService] = useState<Product | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter only SERVICE type products that are active
  const services = useMemo(() => 
    products.filter(p => p.type === "SERVICE" && p.is_active), 
    [products]
  );

  // Filter by search term
  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    const term = searchTerm.toLowerCase();
    return services.filter(s => 
      s.name.toLowerCase().includes(term) ||
      s.sku.toLowerCase().includes(term) ||
      (s.description && s.description.toLowerCase().includes(term))
    );
  }, [services, searchTerm]);

  // --- Handlers ---
  const handleViewDetails = (service: Product) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleEdit = (service: Product) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleDelete = async (serviceId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce service ?")) {
      return;
    }
    
    try {
      await SalesApi.products.remove(serviceId);
      setShowModal(false);
      setSelectedService(null);
      await refresh();
    } catch (err: any) {
      console.error("Failed to delete service:", err);
      if (err.message?.includes("JSON") || err.message?.includes("Unexpected end")) {
        console.log("Delete might have succeeded despite JSON error, refreshing...");
        setShowModal(false);
        setSelectedService(null);
        await refresh();
      } else {
        alert("Erreur lors de la suppression du service: " + (err.message || err));
      }
    }
  };

  const handleAddService = () => {
    setSelectedService(null);
    setShowForm(true);
  };

  const handleSaveService = async (serviceData: Partial<Product>) => {
    try {
      // Ensure type is SERVICE
      const payload = { ...serviceData, type: "SERVICE" as const };
      
      if (selectedService?.id) {
        // Update existing service
        await SalesApi.products.update(selectedService.id, payload);
      } else {
        // Create new service
        await SalesApi.products.create(payload);
      }
      setShowForm(false);
      refresh();
    } catch (err) {
      console.error("Failed to save service:", err);
      alert("Erreur lors de l'enregistrement du service");
    }
  };

  // Calculate statistics
  const stats = useMemo(() => {
    // Services don't typically track stock, but we can still show capacity metrics
    const lowCapacity = services.filter(s => 
      s.track_stock && parseFloat(s.stock_qty || "0") < 5
    );
    
    const totalValue = services.reduce((sum, s) => {
      const qty = parseFloat(s.stock_qty || "0");
      const price = parseFloat(s.unit_price || "0");
      return sum + (qty * price);
    }, 0);
    
    const averageCapacity = services.length > 0
      ? Math.round(services.reduce((sum, s) => 
          sum + parseFloat(s.stock_qty || "0"), 0) / services.length)
      : 0;

    return { lowCapacity, totalValue, averageCapacity };
  }, [services]);

  // Loading state
  if (loading && !products.length) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement des services...</p>
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
          <p className="text-gray-600 mb-4">Impossible de charger les services</p>
          <button
            onClick={() => refresh()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-100 rounded-lg">
                <Briefcase className="w-6 h-6 text-indigo-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Services Proposés
                </h1>
                <p className="text-gray-600">
                  Gestion du catalogue de services
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <StatCard
            icon={<Briefcase />}
            title="Total services"
            value={services.length}
            subtitle="Services disponibles"
            bgColor="bg-blue-100"
            iconColor="text-blue-600"
          />
          
          <StatCard
            icon={<AlertTriangle />}
            title="Capacité basse"
            value={stats.lowCapacity.length}
            subtitle="Nécessite attention"
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
          
          <StatCard
            icon={<DollarSign />}
            title="Valeur totale"
            value={`${(stats.totalValue || 0).toLocaleString('fr-DZ')} DA`}
            subtitle="Capacité disponible"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatCard
            icon={<Layers />}
            title="Capacité moyenne"
            value={stats.averageCapacity}
            subtitle={`${services.length} services`}
            bgColor="bg-indigo-100"
            iconColor="text-indigo-600"
          />
        </div>

        <StockAlert services={stats.lowCapacity} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, référence ou description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
          </div>

          <button
            onClick={handleAddService}
            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus className="w-5 h-5 mr-2" />
            Ajouter un service
          </button>
        </div>

        <ServiceList
          services={filteredServices}
          searchTerm={searchTerm}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {showModal && selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => {
            setShowModal(false);
            setSelectedService(null);
          }}
          onEdit={handleEdit}
          onDelete={() => handleDelete(selectedService.id)}
        />
      )}

      {showForm && (
        <ServiceForm
          service={selectedService}
          onSave={handleSaveService}
          onClose={() => setShowForm(false)}
        />
      )}
    </div>
  );
}