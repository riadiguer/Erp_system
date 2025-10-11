"use client";
import React, { useState } from "react";
import {
  X,
  Save,
  Package,
  Tag,
  Box,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";

const initialState = {
  name: "",
  reference: "",
  category: "",
  stock: 0,
  minStock: 1,
  unit: "",
  price: 0,
};

export default function ProductForm({ product, onSave, onClose }) {
  const [form, setForm] = useState(product || initialState);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  const categories = ["Affichage", "Impression", "Signalétique", "Décoration", "Autre"];
  const units = ["pièce", "mètre", "paquet", "boîte", "rouleau"];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]:
        name === "stock" || name === "minStock" || name === "price"
          ? Number(value)
          : value,
    }));
    
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!form.name.trim()) {
          newErrors.name = "Le nom est obligatoire";
        } else if (form.name.length < 3) {
          newErrors.name = "Le nom doit contenir au moins 3 caractères";
        } else {
          delete newErrors.name;
        }
        break;
      case "reference":
        if (!form.reference.trim()) {
          newErrors.reference = "La référence est obligatoire";
        } else {
          delete newErrors.reference;
        }
        break;
      case "stock":
        if (form.stock < 0) {
          newErrors.stock = "Le stock ne peut pas être négatif";
        } else {
          delete newErrors.stock;
        }
        break;
      case "minStock":
        if (form.minStock < 0) {
          newErrors.minStock = "Le stock minimum ne peut pas être négatif";
        } else if (form.minStock === 0) {
          newErrors.minStock = "Le stock minimum doit être supérieur à 0";
        } else {
          delete newErrors.minStock;
        }
        break;
      case "price":
        if (form.price < 0) {
          newErrors.price = "Le prix ne peut pas être négatif";
        } else {
          delete newErrors.price;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = ["name", "reference", "stock", "minStock", "price"];
    let isValid = true;

    fields.forEach((field) => {
      if (!validateField(field)) {
        isValid = false;
      }
    });

    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const allTouched = {};
    Object.keys(form).forEach((key) => {
      allTouched[key] = true;
    });
    setTouched(allTouched);

    if (!validateForm()) {
      return;
    }

    onSave(form);
  };

  const InputField = ({
    label,
    name,
    type = "text",
    icon: Icon,
    required = false,
    placeholder = "",
    min,
    step,
  }) => {
    const hasError = touched[name] && errors[name];
    const isValid = touched[name] && !errors[name] && form[name];

    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            type={type}
            name={name}
            value={form[name]}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            min={min}
            step={step}
            placeholder={placeholder}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                : isValid
                ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                : "border-gray-300 focus:border-green-500 focus:ring-green-200"
            }`}
            required={required}
          />
          {hasError && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {isValid && (
            <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
              <CheckCircle className="w-5 h-5" />
            </div>
          )}
        </div>
        {hasError && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  const SelectField = ({
    label,
    name,
    options,
    icon: Icon,
    required = false,
  }) => {
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <select
            name={name}
            value={form[name]}
            onChange={handleChange}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-200 focus:border-green-500 focus:outline-none appearance-none bg-white cursor-pointer transition-all`}
            required={required}
          >
            <option value="">-- Choisir --</option>
            {options.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </div>
        </div>
      </div>
    );
  };

  const stockPercentage = form.minStock > 0 ? (form.stock / form.minStock) * 100 : 0;
  const stockStatus =
    stockPercentage < 50
      ? { color: "red", text: "Critique" }
      : stockPercentage < 100
      ? { color: "orange", text: "Bas" }
      : { color: "green", text: "Normal" };

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
              type="button"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <Package className="w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold">
                {product ? "Modifier le produit" : "Ajouter un produit"}
              </h2>
            </div>
            <p className="text-white/80 text-sm">
              {product
                ? "Modifiez les informations du produit fini"
                : "Remplissez les informations du nouveau produit fini"}
            </p>
          </div>
        </div>

        {/* Corps du formulaire */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Section: Informations générales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <Package className="w-5 h-5 mr-2 text-green-600" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Nom du produit"
                  name="name"
                  icon={Tag}
                  required
                  placeholder="Ex: Roll-up Publicitaire"
                />
                <InputField
                  label="Référence"
                  name="reference"
                  icon={Tag}
                  required
                  placeholder="Ex: PR-001"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <SelectField
                  label="Catégorie"
                  name="category"
                  options={categories}
                  icon={Box}
                />
                <SelectField
                  label="Unité de mesure"
                  name="unit"
                  options={units}
                  icon={Box}
                />
              </div>
            </div>

            {/* Section: Stock et inventaire */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-green-600" />
                Stock et inventaire
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Stock actuel"
                  name="stock"
                  type="number"
                  icon={Package}
                  required
                  min={0}
                  placeholder="0"
                />
                <InputField
                  label="Stock minimum"
                  name="minStock"
                  type="number"
                  icon={AlertCircle}
                  required
                  min={1}
                  placeholder="1"
                />
              </div>

              {/* Indicateur visuel du stock */}
              {form.stock > 0 && form.minStock > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">
                      Niveau de stock
                    </span>
                    <span
                      className={`text-sm font-semibold px-2 py-1 rounded bg-${stockStatus.color}-100 text-${stockStatus.color}-700`}
                    >
                      {stockStatus.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full bg-${stockStatus.color}-500 transition-all duration-500 rounded-full`}
                      style={{
                        width: `${Math.min(stockPercentage, 100)}%`,
                      }}
                    />
                  </div>
                  <div className="flex justify-between mt-1 text-xs text-gray-500">
                    <span>
                      {form.stock} {form.unit || "unité(s)"}
                    </span>
                    <span>{Math.round(stockPercentage)}%</span>
                  </div>
                </div>
              )}
            </div>

            {/* Section: Informations financières */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                Informations financières
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Prix unitaire (DA)"
                  name="price"
                  type="number"
                  icon={DollarSign}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                />
                {form.price > 0 && form.stock > 0 && (
                  <div className="flex items-end">
                    <div className="w-full p-4 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">
                        Valeur totale du stock
                      </p>
                      <p className="text-2xl font-bold text-green-600">
                        {(form.price * form.stock).toLocaleString()} DA
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer avec actions */}
          <div className="border-t border-gray-200 p-6 bg-gray-50">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg hover:from-green-700 hover:to-emerald-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <Save className="w-5 h-5 mr-2" />
                {product ? "Enregistrer les modifications" : "Ajouter le produit"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}