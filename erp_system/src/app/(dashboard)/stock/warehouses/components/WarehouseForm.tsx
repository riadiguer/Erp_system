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
  stock: string;
  min_stock: string;
  unit: string;
  supplier?: Id;
  price: string;
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

  // Normalize incoming material
  useEffect(() => {
    if (!material) {
      setForm(initialState);
      return;
    }
    setForm({
      name: material.name ?? "",
      reference: material.reference ?? "",
      category: typeof material.category === "object" ? material.category?.id : material.category ?? undefined,
      stock: material.stock !== undefined ? String(material.stock) : "0",
      min_stock: material.min_stock !== undefined ? String(material.min_stock) : "1",
      unit: material.unit ?? "",
      supplier: typeof material.supplier === "object" ? material.supplier?.id : material.supplier ?? undefined,
      price: material.price !== undefined ? String(material.price) : "0",
    });
    setErrors({});
    setTouched({});
  }, [material]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    const finalValue =
      (name === "category" || name === "supplier") && value === "" ? undefined : value;
    setForm((prev) => ({ ...prev, [name]: finalValue as any }));
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const handleBlur = (field: keyof MaterialForm) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: keyof MaterialForm) => {
    const newErrors = { ...errors };
    const stockNum = Number(form.stock);
    const minStockNum = Number(form.min_stock);
    const priceNum = Number(form.price);

    switch (field) {
      case "name":
        if (!form.name.trim()) newErrors.name = "Le nom est obligatoire";
        else if (form.name.trim().length < 3)
          newErrors.name = "Le nom doit contenir au moins 3 caractères";
        else delete newErrors.name;
        break;
      case "reference":
        if (!form.reference.trim()) newErrors.reference = "La référence est obligatoire";
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
        else if (isNaN(minStockNum)) newErrors.min_stock = "Le stock minimum doit être un nombre";
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
    return !newErrors[field];
  };

  const validateForm = () => {
    const fields: (keyof MaterialForm)[] = ["name", "reference", "stock", "min_stock", "price", "unit"];
    let ok = true;
    for (const f of fields) if (!validateField(f)) ok = false;
    return ok;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched: Record<string, boolean> = {};
    Object.keys(form).forEach((k) => (allTouched[k] = true));
    setTouched(allTouched);
    if (!validateForm()) return;

    const payload = {
      ...form,
      stock: Number(form.stock),
      min_stock: Number(form.min_stock),
      price: Number(form.price),
      category: form.category === "" ? undefined : form.category,
      supplier: form.supplier === "" ? undefined : form.supplier,
    };

    Object.keys(payload).forEach((key) => {
      if (payload[key] === undefined || payload[key] === "" || Number.isNaN(payload[key])) {
        delete payload[key];
      }
    });

    onSave(payload);
  };

  const stockNum = Number(form.stock || 0);
  const minStockNum = Number(form.min_stock || 0);
  const stockPercentage = minStockNum > 0 ? (stockNum / minStockNum) * 100 : 0;
  const stockStatus =
    stockPercentage < 50
      ? { badge: "bg-red-100 text-red-700", bar: "bg-red-500", text: "Critique" }
      : stockPercentage < 100
      ? { badge: "bg-orange-100 text-orange-700", bar: "bg-orange-500", text: "Bas" }
      : { badge: "bg-green-100 text-green-700", bar: "bg-green-500", text: "Normal" };

  const renderError = (name: keyof MaterialForm) =>
    touched[name] && errors[name] && (
      <p className="mt-1 text-sm text-red-600 flex items-center">
        <AlertCircle className="w-4 h-4 mr-1" />
        {errors[name]}
      </p>
    );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-white relative overflow-hidden">
          <button
            onClick={onClose}
            type="button"
            className="absolute right-4 top-4 text-white/80 hover:text-white"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="flex items-center space-x-3 mb-2">
            <Package className="w-6 h-6" />
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

        {/* Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
          <div className="p-6 space-y-6">
            {/* Section générale */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center border-b pb-2">
                <Package className="w-5 h-5 mr-2 text-purple-600" />
                Informations générales
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Nom */}
                <div>
                  <label className="font-semibold text-sm">Nom de la matière *</label>
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    onBlur={() => handleBlur("name")}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                    placeholder="Ex: Bâche PVC 450g"
                  />
                  {renderError("name")}
                </div>
                {/* Référence */}
                <div>
                  <label className="font-semibold text-sm">Référence *</label>
                  <input
                    type="text"
                    name="reference"
                    value={form.reference}
                    onChange={handleChange}
                    onBlur={() => handleBlur("reference")}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                    placeholder="Ex: MP-001"
                  />
                  {renderError("reference")}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                {/* Catégorie */}
                <div>
                  <label className="font-semibold text-sm">Catégorie</label>
                  <select
                    name="category"
                    value={form.category ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">-- Choisir --</option>
                    {apiCategories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                {/* Fournisseur */}
                <div>
                  <label className="font-semibold text-sm">Fournisseur</label>
                  <select
                    name="supplier"
                    value={form.supplier ?? ""}
                    onChange={handleChange}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">-- Choisir --</option>
                    {apiSuppliers?.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </section>

            {/* Stock */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center border-b pb-2">
                <TrendingUp className="w-5 h-5 mr-2 text-purple-600" />
                Stock et inventaire
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Stock */}
                <div>
                  <label className="font-semibold text-sm">Stock actuel *</label>
                  <input
                    type="number"
                    name="stock"
                    value={form.stock}
                    onChange={handleChange}
                    onBlur={() => handleBlur("stock")}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                  />
                  {renderError("stock")}
                </div>
                {/* Stock min */}
                <div>
                  <label className="font-semibold text-sm">Stock minimum *</label>
                  <input
                    type="number"
                    name="min_stock"
                    value={form.min_stock}
                    onChange={handleChange}
                    onBlur={() => handleBlur("min_stock")}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                  />
                  {renderError("min_stock")}
                </div>
                {/* Unité */}
                <div>
                  <label className="font-semibold text-sm">Unité *</label>
                  <select
                    name="unit"
                    value={form.unit}
                    onChange={handleChange}
                    onBlur={() => handleBlur("unit")}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                  >
                    <option value="">-- Choisir --</option>
                    {units.map((u) => (
                      <option key={u} value={u}>
                        {u}
                      </option>
                    ))}
                  </select>
                  {renderError("unit")}
                </div>
              </div>

              {stockNum > 0 && minStockNum > 0 && (
                <div className="mt-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Niveau de stock</span>
                    <span className={`text-sm font-semibold px-2 py-1 rounded ${stockStatus.badge}`}>
                      {stockStatus.text}
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-full ${stockStatus.bar}`}
                      style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              )}
            </section>

            {/* Finances */}
            <section>
              <h3 className="text-lg font-semibold mb-4 flex items-center border-b pb-2">
                <DollarSign className="w-5 h-5 mr-2 text-purple-600" />
                Informations financières
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prix */}
                <div>
                  <label className="font-semibold text-sm">Prix unitaire (€) *</label>
                  <input
                    type="number"
                    name="price"
                    value={form.price}
                    onChange={handleChange}
                    onBlur={() => handleBlur("price")}
                    className="w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-purple-300"
                  />
                  {renderError("price")}
                </div>

                {Number(form.price) > 0 && Number(form.stock) > 0 && (
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg flex flex-col justify-center">
                    <p className="text-sm text-gray-600 mb-1">Valeur totale du stock</p>
                    <p className="text-2xl font-bold text-purple-600">
                      {(Number(form.price) * Number(form.stock)).toFixed(2)} €
                    </p>
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Footer */}
          <div className="border-t p-6 bg-gray-50 flex justify-between">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
            <button
              type="submit"
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
            >
              <Save className="w-5 h-5 inline mr-2" />
              {material ? "Enregistrer les modifications" : "Ajouter la matière"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
