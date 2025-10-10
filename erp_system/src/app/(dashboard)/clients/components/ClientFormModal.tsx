"use client";
import React, { useEffect, useState } from "react";
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

export default function ClientFormModal({ open, initialData = null, onClose, onSave }: Props) {
  const empty: Client = {
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
  };

  const [form, setForm] = useState<Client>(empty);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (!open) return;
    if (initialData) {
      setForm({ ...initialData });
    } else {
      setForm({ ...empty, id: generateId(), createdAt: new Date().toISOString().slice(0, 10) });
    }
    setErrors({});
    setTouched({});
  }, [open, initialData]);

  if (!open) return null;

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
  };

  const InputField = ({ 
    label, 
    name, 
    type = "text", 
    icon: Icon, 
    required = false,
    placeholder = ""
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
            value={form[name] || ""}
            onChange={(e) => setForm((s) => ({ ...s, [name]: e.target.value }))}
            onBlur={() => handleBlur(name)}
            placeholder={placeholder}
            className={`w-full ${Icon ? "pl-10" : "pl-4"} pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all ${
              hasError
                ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                : isValid
                ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
            }`}
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          
          <div className="relative z-10">
            <button
              type="button"
              onClick={onClose}
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
                <InputField
                  label="Prénom"
                  name="firstName"
                  icon={User}
                  required
                  placeholder="Ex: Ahmed"
                />
                <InputField
                  label="Nom"
                  name="lastName"
                  icon={User}
                  required
                  placeholder="Ex: Benali"
                />
              </div>
            </div>

            {/* Section: Contact */}
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <InputField
                  label="Email"
                  name="email"
                  type="email"
                  icon={Mail}
                  placeholder="client@example.com"
                />
                <InputField
                  label="Téléphone"
                  name="phone"
                  icon={Phone}
                  placeholder="+213 6X XX XX XX"
                />
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
                    onChange={(e) => setForm((s) => ({ ...s, type: e.target.value as Client["type"] }))}
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
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as Client["status"] }))}
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
                        if (isNaN(num)) return;
                        setForm((s) => ({ ...s, balance: num }));
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
                      onChange={(e) => setForm((s) => ({ ...s, createdAt: e.target.value }))}
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
                onChange={(e) => setForm((s) => ({ ...s, lastOrder: e.target.value }))}
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
            onClick={onClose}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-medium"
          >
            Annuler
          </button>

          <button
            type="submit"
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium"
          >
            <Save className="w-5 h-5 mr-2" />
            {initialData ? "Enregistrer les modifications" : "Créer le client"}
          </button>
        </div>
      </form>
    </div>
  );
}