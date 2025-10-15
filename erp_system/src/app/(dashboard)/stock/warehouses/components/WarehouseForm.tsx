"use client";
import React, { useState, useEffect } from "react";
import {
  X,
  Save,
  Package,
  Tag,
  Box,
  TrendingUp,
  Truck,
  DollarSign,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { useCategories, useSuppliers } from "@/lib/features/warehouse/hooks";

type Id = number | string;

type MaterialForm = {
  name: string;
  reference: string;
  category?: Id;
  stock: string;     // keep as string in state
  min_stock: string; // keep as string in state
  unit: string;
  supplier?: Id;
  price: string;     // keep as string in state
};

const initialState: MaterialForm = {
  name: "",
  reference: "",
  category: undefined,
  stock: "0",
  min_stock: "1",
  unit: "",
  supplier: undefined,
  price: "0",
};

type Props = {
  material?: any;
  onSave: (payload: Record<string, any>) => void;
  onClose: () => void;
};

export default function WarehouseForm({ material, onSave, onClose }: Props) {
  const [form, setForm] = useState<MaterialForm>(initialState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const { categories: apiCategories, loading: loadingCategories } = useCategories();
  const { suppliers: apiSuppliers, loading: loadingSuppliers } = useSuppliers();

  const units = ["mètre", "rouleau", "litre", "kg", "pièce", "boîte"];

  // Normalize incoming material into the form shape
  useEffect(() => {
    if (!material) {
      setForm(initialState);
      return;
    }

    const norm = {
      name: material.name ?? "",
      reference: material.reference ?? "",
      category:
        typeof material.category === "object"
          ? material.category?.id
          : material.category ?? undefined,
      stock:
        material.stock !== undefined && material.stock !== null
          ? String(material.stock)
          : "0",
      min_stock:
        material.min_stock !== undefined && material.min_stock !== null
          ? String(material.min_stock)
          : "1",
      unit: material.unit ?? "",
      supplier:
        typeof material.supplier === "object"
          ? material.supplier?.id
          : material.supplier ?? undefined,
      price:
        material.price !== undefined && material.price !== null
          ? String(material.price)
          : "0",
    } as MaterialForm;

    setForm(norm);
    setErrors({});
    setTouched({});
  }, [material]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    // Keep strings in state; only coerce on submit.
    // But normalize select empty string to undefined for ids.
    const finalValue =
      (name === "category" || name === "supplier") && value === "" ? undefined : value;

    setForm((prev) => ({
      ...prev,
      [name]: finalValue as any,
    }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleBlur = (field: keyof MaterialForm | string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof MaterialForm | string) => {
    const newErrors = { ...errors };

    const stockNum = Number(form.stock);
    const minStockNum = Number(form.min_stock);
    const priceNum = Number(form.price);

    switch (field) {
      case "name":
        if (!form.name?.trim()) newErrors.name = "Le nom est obligatoire";
        else if (form.name.trim().length < 3)
          newErrors.name = "Le nom doit contenir au moins 3 caractères";
        else delete newErrors.name;
        break;

      case "reference":
        if (!form.reference?.trim())
          newErrors.reference = "La référence est obligatoire";
        else delete newErrors.reference;
        break;

      case "stock":
        if (form.stock === "") newErrors.stock = "Le stock est obligatoire";
        else if (isNaN(stockNum)) newErrors.stock = "Le stock doit être un nombre";
        else if (stockNum < 0) newErrors.stock = "Le stock ne peut pas être négatif";
        else delete newErrors.stock;
        break;

      case "min_stock":
        if (form.min_stock === "") newErrors.min_stock = "Le stock minimum est obligatoire";
        else if (isNaN(minStockNum))
          newErrors.min_stock = "Le stock minimum doit être un nombre";
        else if (minStockNum <= 0)
          newErrors.min_stock = "Le stock minimum doit être supérieur à 0";
        else delete newErrors.min_stock;
        break;

      case "price":
        if (form.price === "") newErrors.price = "Le prix est obligatoire";
        else if (isNaN(priceNum)) newErrors.price = "Le prix doit être un nombre";
        else if (priceNum < 0) newErrors.price = "Le prix ne peut pas être négatif";
        else delete newErrors.price;
        break;

      case "unit":
        if (!form.unit) newErrors.unit = "L'unité est obligatoire";
        else delete newErrors.unit;
        break;
    }

    setErrors(newErrors);
    // return field-specific validity
    return !newErrors[field as string];
  };

  const validateForm = () => {
    const fields: (keyof MaterialForm)[] = ["name", "reference", "stock", "min_stock", "price", "unit"];
    let ok = true;
    for (const f of fields) {
      const thisOk = validateField(f);
      if (!thisOk) ok = false;
    }
    return ok;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields touched
    const allTouched: Record<string, boolean> = {};
    Object.keys(form).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);

    if (!validateForm()) return;

    // Coerce numbers at the very end
    const payload: Record<string, any> = {
      ...form,
      stock: Number(form.stock),
      min_stock: Number(form.min_stock),
      price: Number(form.price),
      category: form.category === "" ? undefined : form.category,
      supplier: form.supplier === "" ? undefined : form.supplier,
    };

    // Drop empty/undefined
    Object.keys(payload).forEach((key) => {
      if (
        payload[key] === undefined ||
        payload[key] === "" ||
        (typeof payload[key] === "number" && Number.isNaN(payload[key]))
      ) {
        delete payload[key];
      }
    });

    onSave(payload);
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
  }: {
    label: string;
    name: keyof MaterialForm;
    type?: "text" | "number";
    icon?: any;
    required?: boolean;
    placeholder?: string;
    min?: number | string;
    step?: number | string;
  }) => {
    const hasError = touched[name] && !!errors[name];
    const isValid =
      touched[name] && !errors[name] && form[name] !== "" && form[name] !== undefined;

    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <input
            type={type}
            name={name}
            value={form[name] ?? ""}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            min={min as any}
            step={step as any}
            placeholder={placeholder}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                : isValid
                ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                : "border-gray-300 focus:border-purple-500 focus:ring-purple-200"
            }`}
            required={required}
            inputMode={type === "number" ? "decimal" : undefined}
          />
          {hasError && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
              <AlertCircle className="w-5 h-5" />
            </div>
          )}
          {isValid && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
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
    isLoading = false,
  }: {
    label: string;
    name: keyof MaterialForm;
    options: any[] | undefined | null;
    icon?: any;
    required?: boolean;
    isLoading?: boolean;
  }) => {
    const opts = options ?? [];
    return (
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
        <div className="relative">
          {Icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none z-10">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <select
            name={name}
            value={(form[name] as any) ?? ""}
            onChange={handleChange}
            onBlur={() => handleBlur(name)}
            disabled={isLoading}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-200 focus:border-purple-500 focus:outline-none appearance-none bg-white cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed`}
            required={required}
          >
            <option value="">-- Choisir --</option>
            {opts.map((option: any) => {
              const val = option?.id ?? option;
              const label = option?.name ?? option;
              return (
                <option key={val} value={val}>
                  {label}
                </option>
              );
            })}
          </select>
          <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg
              className="w-5 h-5 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </div>
        </div>
        {touched[name] && errors[name] && (
          <p className="mt-1 text-sm text-red-600 flex items-center">
            <AlertCircle className="w-4 h-4 mr-1" />
            {errors[name]}
          </p>
        )}
      </div>
    );
  };

  // Safe class mapping for Tailwind (no dynamic template strings)
  const stockNum = Number(form.stock || 0);
  const minStockNum = Number(form.min_stock || 0);
  const stockPercentage = minStockNum > 0 ? (stockNum / minStockNum) * 100 : 0;

  const stockStatus =
    stockPercentage < 50
      ? { badge: "bg-red-100 text-red-700", bar: "bg-red-500", text: "Critique" }
      : stockPercentage < 100
      ? { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-500", text: "Bas" }
      : { badge: "bg-green-100 text-green-700", bar: "bg-green-500", text: "Normal" };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative overflow-hidden">
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
                {material ? "Modifier la matière première" : "Ajouter une matière première"}
              </h2>
            </div>
            <p className="text-white/80 text-sm">
              {material
                ? "Modifiez les informations de la matière première"
                : "Remplissez les informations de la nouvelle matière première"}
            </p>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Infos générales */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <Package className="w-5 h-5 mr-2 text-purple-600" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Nom de la matière"
                  name="name"
                  icon={Tag}
                  required
                  placeholder="Ex: Bâche PVC 450g"
                />
                <InputField
                  label="Référence"
                  name="reference"
                  icon={Tag}
                  required
                  placeholder="Ex: MP-001"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <SelectField
                  label="Catégorie"
                  name="category"
                  options={apiCategories}
                  icon={Box}
                  isLoading={loadingCategories}
                />
                <SelectField
                  label="Fournisseur"
                  name="supplier"
                  options={apiSuppliers}
                  icon={Truck}
                  isLoading={loadingSuppliers}
                />
              </div>
            </div>

            {/* Stock */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Stock et inventaire
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <InputField
                  label="Stock actuel"
                  name="stock"
                  type="number"
                  icon={Package}
                  required
                  min={0}
                  placeholder="0"
                  step="0.01"
                />
                <InputField
                  label="Stock minimum"
                  name="min_stock"
                  type="number"
                  icon={AlertCircle}
                  required
                  min={1}
                  placeholder="1"
                  step="0.01"
                />
                <SelectField
                  label="Unité de mesure"
                  name="unit"
                  options={units.map((u) => ({ id: u, name: u }))}
                  icon={Box}
                  required
                />
              </div>

              {stockNum > 0 && minStockNum > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Niveau de stock</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${stockStatus.badge}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-full ${stockStatus.bar} transition-all duration-500 rounded-full`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
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

            {/* Finances */}
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                Informations financières
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Prix unitaire (€)"
                  name="price"
                  type="number"
                  icon={DollarSign}
                  min={0}
                  step={0.01}
                  placeholder="0.00"
                  required
                />
                {Number(form.price) > 0 && Number(form.stock) > 0 && (
                  <div className="flex items-end">
                    <div className="w-full p-4 bg-purple-50 border border-purple-200 rounded-lg">
                      <p className="text-sm text-gray-600 mb-1">Valeur totale du stock</p>
                      <p className="text-2xl font-bold text-purple-600">
                        {(Number(form.price) * Number(form.stock)).toFixed(2)}€
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
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
                className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl font-medium"
              >
                <Save className="w-5 h-5 mr-2" />
                {material ? "Enregistrer les modifications" : "Ajouter la matière"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
