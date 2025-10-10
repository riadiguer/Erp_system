"use client";

import { X, CreditCard, Calendar, DollarSign, FileText, Save, CheckCircle } from "lucide-react";
import { useState } from "react";

interface SupplierPaymentsModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: any;
}

export default function SupplierPaymentsModal({
  open,
  onClose,
  supplier,
}: SupplierPaymentsModalProps) {
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split("T")[0],
    amount: "",
    mode: "",
    reference: "",
    note: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Paiement enregistré :", { ...formData, supplier });
    onClose();
  };

  if (!open) return null;

  const paymentModes = [
    { value: "bank", label: "Virement bancaire", icon: "🏦" },
    { value: "cash", label: "Espèces", icon: "💵" },
    { value: "check", label: "Chèque", icon: "📝" },
    { value: "credit", label: "Crédit", icon: "💳" },
  ];

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-green-900/30 to-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Header Premium */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-700 to-teal-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA3IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="relative z-10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30">
                  <CreditCard className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">
                    Enregistrer un paiement
                  </h2>
                  <p className="text-green-100 text-sm font-medium">
                    Pour {supplier?.name || "le fournisseur"}
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                title="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Balance Info */}
        {supplier?.balance && (
          <div className="px-8 py-4 bg-gradient-to-r from-amber-50 to-orange-50 border-b border-amber-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-amber-100 rounded-lg">
                  <DollarSign className="w-5 h-5 text-amber-600" />
                </div>
                <div>
                  <p className="text-xs font-medium text-amber-700">Solde actuel</p>
                  <p className="text-xl font-bold text-amber-900">
                    {supplier.balance.toLocaleString()} DA
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium text-amber-700">Après paiement</p>
                <p className="text-xl font-bold text-green-700">
                  {(supplier.balance - (Number(formData.amount) || 0)).toLocaleString()} DA
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-green-50/20">
          <div className="p-8 space-y-6">
            
            {/* Date et Montant */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <div className="flex items-center space-x-2">
                      <Calendar className="w-4 h-4 text-blue-600" />
                      <span>Date du paiement <span className="text-red-500">*</span></span>
                    </div>
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-green-600" />
                      <span>Montant (DA) <span className="text-red-500">*</span></span>
                    </div>
                  </label>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleChange}
                    placeholder="ex: 150000"
                    required
                    min="0"
                    step="0.01"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Mode de paiement */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-bold text-gray-800 mb-4">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-purple-600" />
                  <span>Mode de paiement <span className="text-red-500">*</span></span>
                </div>
              </label>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {paymentModes.map((mode) => (
                  <button
                    key={mode.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, mode: mode.value })}
                    className={`relative p-4 rounded-xl border-2 transition-all duration-200 hover:scale-105 ${
                      formData.mode === mode.value
                        ? "border-purple-500 bg-purple-50 shadow-lg"
                        : "border-gray-200 bg-white hover:border-purple-200"
                    }`}
                  >
                    {formData.mode === mode.value && (
                      <div className="absolute -top-2 -right-2 w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center">
                        <CheckCircle className="w-4 h-4 text-white" />
                      </div>
                    )}
                    <div className="text-center">
                      <div className="text-2xl mb-2">{mode.icon}</div>
                      <p className={`text-xs font-semibold ${
                        formData.mode === mode.value ? "text-purple-900" : "text-gray-700"
                      }`}>
                        {mode.label}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Référence */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>Référence du paiement</span>
                </div>
              </label>
              <input
                type="text"
                name="reference"
                value={formData.reference}
                onChange={handleChange}
                placeholder="ex: TRX-2025-0012"
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
              />
            </div>

            {/* Remarques */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <label className="block text-sm font-bold text-gray-800 mb-2">
                <div className="flex items-center space-x-2">
                  <FileText className="w-4 h-4 text-gray-600" />
                  <span>Remarques / Notes</span>
                </div>
              </label>
              <textarea
                name="note"
                value={formData.note}
                onChange={handleChange}
                placeholder="ex: Paiement partiel sur facture FACF-2025-017"
                rows={4}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-gray-500 focus:ring-4 focus:ring-gray-100 focus:outline-none transition-all duration-200 resize-none"
              />
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 px-8 py-5 bg-gradient-to-r from-gray-50 to-green-50/30 border-t border-gray-200 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            type="button"
            className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105"
          >
            Annuler
          </button>
          <button
            type="submit"
            onClick={handleSubmit}
            className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Save className="w-5 h-5" />
            <span>Enregistrer le paiement</span>
          </button>
        </div>
      </div>
    </div>
  );
}