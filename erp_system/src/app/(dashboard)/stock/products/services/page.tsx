"use client";

import React, { useState } from "react";
import { 
  Briefcase, 
  Plus, 
  Search, 
  AlertTriangle, 
  TrendingUp,
  Users,
  Layers,
  DollarSign
} from "lucide-react";
import ServiceList from "./components/ServiceList";
import ServiceModal from "./components/ServiceModal";
import ServiceForm from "./components/ServiceForm";
import StockAlert from "./components/StockAlert";

const mockServices = [
  {
    id: 1,
    name: "Conception graphique",
    reference: "SV-001",
    stock: 5,
    minStock: 3,
    unit: "forfait",
    price: 8000,
    category: "Création",
  },
  {
    id: 2,
    name: "Installation sur site",
    reference: "SV-002",
    stock: 15,
    minStock: 5,
    unit: "prestation",
    price: 3000,
    category: "Pose/Montage",
  },
  {
    id: 3,
    name: "Maintenance mensuelle",
    reference: "SV-003",
    stock: 8,
    minStock: 10,
    unit: "forfait",
    price: 5000,
    category: "Maintenance",
  },
  {
    id: 4,
    name: "Consulting stratégique",
    reference: "SV-004",
    stock: 12,
    minStock: 8,
    unit: "heure",
    price: 15000,
    category: "Consulting",
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

export default function ServicesPage() {
  const [services, setServices] = useState(mockServices);
  const [selectedService, setSelectedService] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const handleViewDetails = (service) => {
    setSelectedService(service);
    setShowModal(true);
  };

  const handleEdit = (service) => {
    setSelectedService(service);
    setShowForm(true);
  };

  const handleDelete = (serviceId) => {
    setServices(services.filter((s) => s.id !== serviceId));
    setShowModal(false);
  };

  const handleAddService = () => {
    setSelectedService(null);
    setShowForm(true);
  };

  const handleSaveService = (service) => {
    if (service.id) {
      setServices(services.map((s) => (s.id === service.id ? service : s)));
    } else {
      setServices([
        ...services,
        { ...service, id: Math.max(...services.map(s => s.id)) + 1 },
      ]);
    }
    setShowForm(false);
  };

  const lowStockServices = services.filter((s) => s.stock < s.minStock);
  const totalValue = services.reduce((sum, s) => sum + (s.stock * s.price), 0);
  const categories = [...new Set(services.map(s => s.category))].length;
  const averageStock = Math.round(services.reduce((sum, s) => sum + s.stock, 0) / services.length);

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
            value={lowStockServices.length}
            subtitle="Nécessite attention"
            bgColor="bg-red-100"
            iconColor="text-red-600"
          />
          
          <StatCard
            icon={<DollarSign />}
            title="Valeur totale"
            value={`${totalValue.toLocaleString()} DA`}
            subtitle="Capacité disponible"
            bgColor="bg-green-100"
            iconColor="text-green-600"
          />
          
          <StatCard
            icon={<Layers />}
            title="Capacité moyenne"
            value={averageStock}
            subtitle={`${categories} catégories`}
            bgColor="bg-indigo-100"
            iconColor="text-indigo-600"
          />
        </div>

        <StockAlert services={lowStockServices} />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div className="flex-1 max-w-lg">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher par nom, référence ou catégorie..."
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
          services={services}
          searchTerm={searchTerm}
          onViewDetails={handleViewDetails}
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {showModal && selectedService && (
        <ServiceModal
          service={selectedService}
          onClose={() => setShowModal(false)}
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