"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Briefcase,
  Tag,
  Box,
  TrendingUp,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { type Product } from "@/lib/features/sales/api";

/* ======================================================
   🔹 Sous-composants externes pour éviter la recréation
   ====================================================== */

export const InputField = ({
  label,
  name,
  type = "text",
  icon: Icon,
  required = false,
  placeholder = "",
  min,
  max,
  step,
  form,
  handleChange,
  handleBlur,
  errors,
  touched,
}: any) => {
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
          max={max}
          step={step}
          placeholder={placeholder}
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
            hasError
              ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
              : isValid
              ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
              : "border-gray-300 focus:border-indigo-500 focus:ring-indigo-200"
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

export const SelectField = ({
  label,
  name,
  options,
  icon: Icon,
  required = false,
  form,
  handleChange,
}: any) => {
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
          className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none appearance-none bg-white cursor-pointer transition-all`}
          required={required}
        >
          <option value="">-- Choisir --</option>
          {options.map((option: any) => (
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

export const TextAreaField = ({
  label,
  name,
  placeholder = "",
  form,
  handleChange,
}: any) => {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-2">
        {label}
      </label>
      <textarea
        name={name}
        value={form[name]}
        onChange={handleChange}
        rows={3}
        placeholder={placeholder}
        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-200 focus:border-indigo-500 focus:outline-none transition-all"
      />
    </div>
  );
};

/* ======================================================
   🔸 Composant principal ServiceForm
   ====================================================== */

const initialState = {
  name: "",
  sku: "",
  description: "",
  unit: "forfait",
  stock_qty: "0",
  unit_price: "0",
  tax_rate: "19",
  track_stock: false,
  is_active: true,
};

export default function ServiceForm({
  service,
  onSave,
  onClose,
}: {
  service: Product | null;
  onSave: (service: Partial<Product>) => void;
  onClose: () => void;
}) {
  const [form, setForm] = useState(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const units = ["forfait", "prestation", "heure", "jour", "projet", "consultation"];

  useEffect(() => {
    if (service) {
      setForm({
        name: service.name || "",
        sku: service.sku || "",
        description: service.description || "",
        unit: service.unit || "forfait",
        stock_qty: service.stock_qty || "0",
        unit_price: service.unit_price || "0",
        tax_rate: service.tax_rate || "19",
        track_stock: service.track_stock ?? false,
        is_active: service.is_active ?? true,
      });
    }
  }, [service]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target;
    if (type === "checkbox") {
      const checked = (e.target as HTMLInputElement).checked;
      setForm((prev) => ({ ...prev, [name]: checked }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string) => {
    const newErrors = { ...errors };
    switch (field) {
      case "name":
        if (!form.name.trim()) newErrors.name = "Le nom est obligatoire";
        else if (form.name.trim().length < 3)
          newErrors.name = "Le nom doit contenir au moins 3 caractères";
        else delete newErrors.name;
        break;
      case "sku":
        if (!form.sku.trim()) newErrors.sku = "La référence est obligatoire";
        else delete newErrors.sku;
        break;
      case "unit_price":
        const price = parseFloat(form.unit_price);
        if (isNaN(price) || price < 0)
          newErrors.unit_price = "Le prix ne peut pas être négatif";
        else delete newErrors.unit_price;
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateForm = () => {
    const fields = ["name", "sku", "unit", "unit_price"];
    let valid = true;
    fields.forEach((f) => {
      if (!validateField(f)) valid = false;
    });
    return valid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    Object.keys(form).forEach((k) => setTouched((t) => ({ ...t, [k]: true })));
    if (!validateForm()) return;
    const payload: Partial<Product> = {
      name: form.name.trim(),
      sku: form.sku.trim(),
      description: form.description.trim(),
      type: "SERVICE",
      unit: form.unit.trim(),
      unit_price: form.unit_price,
      stock_qty: form.stock_qty,
      tax_rate: form.tax_rate,
      track_stock: form.track_stock,
      is_active: form.is_active,
    };
    onSave(payload);
  };

  const stockQty = parseFloat(form.stock_qty || "0");
  const unitPrice = parseFloat(form.unit_price || "0");
  const totalValue = stockQty * unitPrice;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* HEADER */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 p-6 text-white relative overflow-hidden">
          <button
            className="absolute right-4 top-4 text-white/80 hover:text-white"
            onClick={onClose}
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold">
              {service ? "Modifier le service" : "Ajouter un service"}
            </h2>
          </div>
          <p className="text-white/80 text-sm">
            {service
              ? "Modifiez les informations du service"
              : "Remplissez les informations du nouveau service"}
          </p>
        </div>

        {/* FORM */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Infos générales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <Briefcase className="w-5 h-5 mr-2 text-indigo-600" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Nom du service"
                  name="name"
                  icon={Tag}
                  required
                  placeholder="Ex: Conception graphique"
                  form={form}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                <InputField
                  label="Référence (SKU)"
                  name="sku"
                  icon={Tag}
                  required
                  placeholder="Ex: SV-001"
                  form={form}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
              </div>
              <div className="mt-4">
                <TextAreaField
                  label="Description"
                  name="description"
                  placeholder="Description détaillée du service..."
                  form={form}
                  handleChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 mt-4">
                <SelectField
                  label="Unité de facturation"
                  name="unit"
                  options={units}
                  icon={Box}
                  required
                  form={form}
                  handleChange={handleChange}
                />
              </div>
            </div>

            {/* Tarification */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <DollarSign className="w-5 h-5 mr-2 text-indigo-600" />
                Tarification
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Prix unitaire (DA)"
                  name="unit_price"
                  type="number"
                  icon={DollarSign}
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  required
                  form={form}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
                <InputField
                  label="Taux de TVA (%)"
                  name="tax_rate"
                  type="number"
                  icon={DollarSign}
                  min={0}
                  max={100}
                  step="0.01"
                  placeholder="19"
                  form={form}
                  handleChange={handleChange}
                  handleBlur={handleBlur}
                  errors={errors}
                  touched={touched}
                />
              </div>
              {unitPrice > 0 && stockQty > 0 && form.track_stock && (
                <div className="mt-4">
                  <div className="w-full p-4 bg-indigo-50 border border-indigo-200 rounded-lg">
                    <p className="text-sm text-gray-600 mb-1">
                      Valeur totale de la capacité
                    </p>
                    <p className="text-2xl font-bold text-indigo-600">
                      {totalValue.toLocaleString("fr-DZ")} DA
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Statut */}
            <div>
              <label className="flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={form.is_active}
                  onChange={handleChange}
                  className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">
                  Service actif
                </span>
              </label>
            </div>
          </div>

          {/* FOOTER */}
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
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-lg hover:from-indigo-700 hover:to-purple-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <Save className="w-5 h-5 mr-2" />
                {service ? "Enregistrer les modifications" : "Ajouter le service"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
