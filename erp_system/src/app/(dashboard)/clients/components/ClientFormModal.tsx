"use client";
import React, { useState, useEffect, useCallback } from "react";
import { X, Save, User, Mail, Phone, Building2, DollarSign, Calendar, CheckCircle, AlertCircle } from "lucide-react";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  type?: "Particulier" | "Société";
  balance?: number;
  lastOrder?: string;
  createdAt?: string;
  status?: "Actif" | "Inactif";
};

type Props = {
  open: boolean;
  initialData?: Client | null;
  onClose: () => void;
  onSave: (c: Client) => void;
};

function generateId() {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return (crypto as any).randomUUID();
    }
  } catch (e) {}
  return `id_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

const getEmptyClient = (): Client => ({
  id: generateId(),
  firstName: "",
  lastName: "",
  email: "",
  phone: "",
  type: "Particulier",
  balance: 0,
  lastOrder: undefined,
  createdAt: new Date().toISOString().slice(0, 10),
  status: "Actif",
});

export default function ClientFormModal({ open, initialData = null, onClose, onSave }: Props) {
  const [form, setForm] = useState<Client>(getEmptyClient());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Réinitialiser le formulaire quand open ou initialData change
  useEffect(() => {
    if (open) {
      if (initialData) {
        setForm({ ...initialData });
      } else {
        setForm(getEmptyClient());
      }
      setErrors({});
      setTouched({});
    }
  }, [open, initialData]);

  // Affiche le modal UNIQUEMENT si open === true
  if (!open) return null;

  // Reset manuel de l'état du formulaire à la fermeture du modal
  const handleClose = () => {
    setForm(getEmptyClient());
    setErrors({});
    setTouched({});
    onClose();
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    validateField(field);
  };

  const validateField = (field: string): boolean => {
    const e: Record<string, string> = { ...errors };

    switch (field) {
      case "firstName":
        if (!form.firstName || form.firstName.trim().length < 2) {
          e.firstName = "Prénom requis (≥2 caractères)";
        } else {
          delete e.firstName;
        }
        break;
      case "lastName":
        if (!form.lastName || form.lastName.trim().length < 2) {
          e.lastName = "Nom requis (≥2 caractères)";
        } else {
          delete e.lastName;
        }
        break;
      case "email":
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
          e.email = "Email invalide";
        } else {
          delete e.email;
        }
        break;
      case "phone":
        if (form.phone && !/^[0-9+\s()-]{6,20}$/.test(form.phone)) {
          e.phone = "Téléphone invalide";
        } else {
          delete e.phone;
        }
        break;
    }

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const validate = (): boolean => {
    const fields = ["firstName", "lastName", "email", "phone"];
    let isValid = true;
    const allTouched: Record<string, boolean> = {};

    fields.forEach((field) => {
      allTouched[field] = true;
      if (!validateField(field)) {
        isValid = false;
      }
    });

    setTouched(allTouched);
    return isValid;
  };

  const handleSubmit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;
    const payload: Client = {
      ...form,
      id: form.id ?? generateId(),
      createdAt: form.createdAt ?? new Date().toISOString().slice(0, 10),
      balance: Number(form.balance ?? 0),
    };
    onSave(payload);
    // Reset du form après enregistrement
    setForm(getEmptyClient());
    setErrors({});
    setTouched({});
  };

  // Fonction de mise à jour stable qui ne change pas à chaque render
  const updateField = (field: keyof Client, value: any) => {
    setForm((prevForm) => ({
      ...prevForm,
      [field]: value,
    }));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />

          <div className="relative z-10">
            <button
              type="button"
              onClick={handleClose}
              className="absolute right-0 top-0 text-white/80 hover:text-white transition-colors"
              aria-label="Fermer"
            >
              <X className="w-6 h-6" />
            </button>

            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2 bg-white/20 backdrop-blur-sm rounded-lg">
                <User className="w-6 h-6" />
              </div>
              <h3 className="text-2xl font-bold">
                {initialData ? "Modifier le client" : "Nouveau client"}
              </h3>
            </div>
            <p className="text-blue-100 text-sm">
              {initialData ? "Mettez à jour les informations du client" : "Remplissez les informations du nouveau client"}
            </p>
          </div>
        </div>

        {/* Body - Scrollable */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            {/* Section: Informations personnelles */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Prénom */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      placeholder="Ex: Ahmed"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                        touched.firstName && errors.firstName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.firstName && form.firstName
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.firstName && errors.firstName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.firstName && !errors.firstName && form.firstName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {touched.firstName && errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Nom */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom
                    <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="Ex: Benali"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                        touched.lastName && errors.lastName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.lastName && form.lastName
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.lastName && errors.lastName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.lastName && !errors.lastName && form.lastName && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {touched.lastName && errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Contact */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Email
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={form.email ?? ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="client@example.com"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                        touched.email && errors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.email && form.email
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.email && errors.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.email && !errors.email && form.email && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {touched.email && errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>

                {/* Téléphone */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Téléphone
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={form.phone ?? ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+213 6X XX XX XX"
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
                        touched.phone && errors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.phone && form.phone
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.phone && errors.phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.phone && !errors.phone && form.phone && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-green-500">
                        <CheckCircle className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                  {touched.phone && errors.phone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <AlertCircle className="w-4 h-4 mr-1" />
                      {errors.phone}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Section: Type et statut */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <Building2 className="w-5 h-5 mr-2 text-blue-600" />
                Type et statut
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Type de client</label>
                  <select
                    value={form.type}
                    onChange={(e) => updateField("type", e.target.value as Client["type"])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="Particulier">Particulier</option>
                    <option value="Société">Société</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Statut</label>
                  <select
                    value={form.status}
                    onChange={(e) => updateField("status", e.target.value as Client["status"])}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Section: Informations financières */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <DollarSign className="w-5 h-5 mr-2 text-blue-600" />
                Informations financières
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Solde (DA)</label>
                  <div className="relative">
                    <DollarSign className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      value={String(form.balance ?? 0)}
                      onChange={(e) => {
                        const v = e.target.value;
                        const num = v === "" ? 0 : Number(v);
                        if (!isNaN(num)) {
                          updateField("balance", num);
                        }
                      }}
                      type="number"
                      step="0.01"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Date d'ajout</label>
                  <div className="relative">
                    <Calendar className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      value={form.createdAt ?? ""}
                      onChange={(e) => updateField("createdAt", e.target.value)}
                      type="date"
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Dernière commande */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Dernière commande (ID / date)</label>
              <input
                value={form.lastOrder ?? ""}
                onChange={(e) => updateField("lastOrder", e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                placeholder="ex: #1234 - 2025-09-01"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-medium"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            {initialData ? "Enregistrer les modifications" : "Créer le client"}
          </button>
        </div>
      </div>
    </div>
  );
}