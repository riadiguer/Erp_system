"use client";
import React, { useState, useEffect } from "react";
import {
  X, Save, User, Mail, Phone, Building2, CheckCircle, AlertCircle
} from "lucide-react";
import { useCreateCustomer, useUpdateCustomer, customerKeys } from "@/lib/features/customer/hooks";
import type { CustomerWrite, PaginatedResponse, Customer } from "@/lib/features/customer/api";
import { useQueryClient } from "@tanstack/react-query";

type Client = {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  type?: "Particulier" | "Société" | "INDIVIDUAL" | "BUSINESS";
  balance?: number;
  lastOrder?: string;
  createdAt?: string;
  status?: "Actif" | "Inactif";
};

type Props = {
  open: boolean;
  initialData?: Client | null;
  onClose: () => void;
};

const getEmptyClient = (): Client => ({
  id: "",
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

export default function ClientFormModal({ open, initialData = null, onClose }: Props) {
  const [form, setForm] = useState<Client>(getEmptyClient());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  const queryClient = useQueryClient();

  const createMutation = useCreateCustomer({
    onSuccess: (newCustomer) => {
      const lists = queryClient.getQueriesData<PaginatedResponse<Customer>>({
        queryKey: customerKeys.lists(),
      });

      for (const [key, old] of lists) {
        if (!old?.results) continue;
        queryClient.setQueryData<PaginatedResponse<Customer>>(key, {
          ...old,
          count: (old.count ?? old.results.length) + 1,
          results: [newCustomer, ...old.results],
        });
      }

      handleClose();
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });


  const updateMutation = useUpdateCustomer({
    onSuccess: (updatedCustomer) => {
      // Update the cache with the new customer data
      const lists = queryClient.getQueriesData<PaginatedResponse<Customer>>({
        queryKey: customerKeys.lists(),
      });

      for (const [key, old] of lists) {
        if (!old?.results) continue;
        queryClient.setQueryData<PaginatedResponse<Customer>>(key, {
          ...old,
          results: old.results.map(customer => 
            customer.id === updatedCustomer.id ? updatedCustomer : customer
          ),
        });
      }

      handleClose();
    },
    onError: (error) => {
      alert(`Erreur: ${error.message}`);
    },
  });

  useEffect(() => {
    if (open) {
      if (initialData) {
        const mappedType: "Particulier" | "Société" = 
          initialData.type === "BUSINESS" ? "Société" : 
          initialData.type === "INDIVIDUAL" ? "Particulier" : 
          (initialData.type as "Particulier" | "Société");
        setForm({ ...initialData, type: mappedType });
      } else {
        setForm(getEmptyClient());
      }
      setErrors({});
      setTouched({});
    }
  }, [open, initialData]);

  if (!open) return null;

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
        if (!form.firstName || form.firstName.trim().length < 2) e.firstName = "Prénom requis (≥2 caractères)";
        else delete e.firstName;
        break;
      case "lastName":
        if (!form.lastName || form.lastName.trim().length < 2) e.lastName = "Nom requis (≥2 caractères)";
        else delete e.lastName;
        break;
      case "email":
        if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Email invalide";
        else delete e.email;
        break;
      case "phone":
        if (form.phone && !/^[0-9+\s()-]{6,20}$/.test(form.phone)) e.phone = "Téléphone invalide";
        else delete e.phone;
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
      if (!validateField(field)) isValid = false;
    });
    setTouched(allTouched);
    return isValid;
  };

  const handleSubmit = (ev?: React.FormEvent) => {
    ev?.preventDefault();
    if (!validate()) return;

    const customerData: CustomerWrite = {
      name: `${form.firstName} ${form.lastName}`.trim(),
      email: form.email || undefined,
      phone: form.phone || undefined,
      is_active: form.status === "Actif",
      type: form.type === "Société" ? "BUSINESS" : "INDIVIDUAL",
      notes: "",
      tax_id: "",
      billing_address: "",
      shipping_address: "",
    };

    if (initialData?.id) {
      updateMutation.mutate({ id: Number(initialData.id), data: customerData });
    } else {
      createMutation.mutate(customerData);
    }
  };

  const updateField = <K extends keyof Client>(field: K, value: Client[K]) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6 text-white relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32" />
          <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full -ml-24 -mb-24" />
          <div className="relative z-10">
            <button
              type="button"
              onClick={handleClose}
              disabled={isSubmitting}
              className="absolute right-0 top-0 text-white/80 hover:text-white transition-colors disabled:opacity-50"
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

        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <User className="w-5 h-5 mr-2 text-blue-600" />
                Informations personnelles
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Prénom <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={form.firstName}
                      onChange={(e) => updateField("firstName", e.target.value)}
                      onBlur={() => handleBlur("firstName")}
                      placeholder="Ex: Ahmed"
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        touched.firstName && errors.firstName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.firstName && form.firstName
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.firstName && errors.firstName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.firstName && !errors.firstName && form.firstName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Nom <span className="text-red-500 ml-1">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={form.lastName}
                      onChange={(e) => updateField("lastName", e.target.value)}
                      onBlur={() => handleBlur("lastName")}
                      placeholder="Ex: Benali"
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        touched.lastName && errors.lastName
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.lastName && form.lastName
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.lastName && errors.lastName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.lastName && !errors.lastName && form.lastName && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
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

            <div>
              <h4 className="text-base font-semibold text-gray-900 mb-4 flex items-center border-b border-gray-200 pb-2">
                <Mail className="w-5 h-5 mr-2 text-blue-600" />
                Coordonnées
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Mail className="w-5 h-5" />
                    </div>
                    <input
                      type="email"
                      value={form.email ?? ""}
                      onChange={(e) => updateField("email", e.target.value)}
                      onBlur={() => handleBlur("email")}
                      placeholder="client@example.com"
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        touched.email && errors.email
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.email && form.email
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.email && errors.email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.email && !errors.email && form.email && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone</label>
                  <div className="relative">
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                      <Phone className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      value={form.phone ?? ""}
                      onChange={(e) => updateField("phone", e.target.value)}
                      onBlur={() => handleBlur("phone")}
                      placeholder="+213 6X XX XX XX"
                      disabled={isSubmitting}
                      className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:ring-2 focus:outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed ${
                        touched.phone && errors.phone
                          ? "border-red-300 focus:border-red-500 focus:ring-red-200 bg-red-50"
                          : touched.phone && form.phone
                          ? "border-green-300 focus:border-green-500 focus:ring-green-200 bg-green-50"
                          : "border-gray-300 focus:border-blue-500 focus:ring-blue-200"
                      }`}
                    />
                    {touched.phone && errors.phone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500">
                        <AlertCircle className="w-5 h-5" />
                      </div>
                    )}
                    {touched.phone && !errors.phone && form.phone && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500">
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
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
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
                    disabled={isSubmitting}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <option value="Actif">Actif</option>
                    <option value="Inactif">Inactif</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={handleClose}
            disabled={isSubmitting}
            className="px-6 py-3 rounded-lg border border-gray-300 hover:bg-gray-100 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Annuler
          </button>

          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg hover:from-blue-700 hover:to-indigo-700 transition-all shadow-lg hover:shadow-xl font-medium disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="w-5 h-5 mr-2" />
                {initialData ? "Enregistrer les modifications" : "Créer le client"}
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}