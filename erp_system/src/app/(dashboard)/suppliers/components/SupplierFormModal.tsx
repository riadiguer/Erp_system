"use client";

import { X, Save, Edit, Building2, User, Phone, Mail, MapPin, Hash, CreditCard, Calendar, FileEdit, Sparkles } from "lucide-react";
import { useState, useEffect } from "react";

interface SupplierFormModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: any;
  onSuccess?: (saved?: any) => void;  
}


// ✅ DÉPLACER CES COMPOSANTS EN DEHORS
const InputGroup = ({
  icon: Icon,
  label,
  name,
  type = "text",
  placeholder,
  required = false,
  value,
  description,
  onChange,
}: any) => (
  <div className="group">
    <label className="block mb-2">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-sm font-bold text-gray-800">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </span>
        {description && (
          <span className="text-xs text-gray-500">{description}</span>
        )}
      </div>
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200">
        <Icon className="w-5 h-5" />
      </div>
      <input
        type={type}
        name={name}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 hover:border-gray-300"
      />
    </div>
  </div>
);

const SelectGroup = ({
  icon: Icon,
  label,
  name,
  options,
  value,
  required = false,
  onChange,
}: any) => (
  <div className="group">
    <label className="block mb-2">
      <span className="text-sm font-bold text-gray-800">
        {label}
        {required && <span className="text-red-500 ml-1">*</span>}
      </span>
    </label>
    <div className="relative">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors duration-200 pointer-events-none">
        <Icon className="w-5 h-5" />
      </div>
      <select
        name={name}
        value={value}
        onChange={onChange}
        required={required}
        className="w-full pl-12 pr-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200 hover:border-gray-300 appearance-none cursor-pointer"
      >
        <option value="">Sélectionner</option>
        {options.map((opt: any) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </div>
    </div>
  </div>
);

const StepIndicator = ({ number, title, active }: any) => (
  <div className="flex items-center space-x-3">
    <div
      className={`flex items-center justify-center w-10 h-10 rounded-full font-bold text-sm transition-all duration-300 ${
        active
          ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-lg shadow-blue-200 scale-110"
          : "bg-gray-200 text-gray-500"
      }`}
    >
      {number}
    </div>
    <span
      className={`font-semibold text-sm transition-colors duration-300 ${
        active ? "text-blue-600" : "text-gray-400"
      }`}
    >
      {title}
    </span>
  </div>
);

// ✅ COMPOSANT PRINCIPAL
export default function SupplierFormModal({ open, onClose, supplier }: SupplierFormModalProps) {
  const isEditMode = !!supplier;
  const [activeStep, setActiveStep] = useState(1);

const [formData, setFormData] = useState({
  name: "",
  contact: "",       // ✅ camelCase
  phone: "",
  email: "",
  address: "",
  nif: "",
  rc: "",
  iban: "",
  paymentMode: "",   // ✅ camelCase
  delay: "",         // ✅ camelCase
  note: "",          // ✅ camelCase
});


  useEffect(() => {
    if (supplier) {
      setFormData({
        name: supplier.name || "",
        contact: supplier.contact || "",
        phone: supplier.phone || "",
        email: supplier.email || "",
        address: supplier.address || "",
        nif: supplier.nif || "",
        rc: supplier.rc || "",
        iban: supplier.iban || "",
        paymentMode: supplier.paymentMode || "",
        delay: supplier.delay || "",
        note: supplier.note || "",
      });
    }
  }, [supplier]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isEditMode) {
      console.log("Fournisseur mis à jour :", formData);
    } else {
      console.log("Nouveau fournisseur ajouté :", formData);
    }
    onClose();
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-blue-900/30 to-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Header Premium */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA3IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="relative z-10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30">
                  {isEditMode ? (
                    <Edit className="w-7 h-7 text-white" />
                  ) : (
                    <Sparkles className="w-7 h-7 text-white" />
                  )}
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">
                    {isEditMode ? "Modifier le fournisseur" : "Nouveau fournisseur"}
                  </h2>
                  <p className="text-blue-100 text-sm font-medium">
                    {isEditMode ? "Mettez à jour les informations du partenaire" : "Créez une nouvelle fiche fournisseur"}
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

            <div className="mt-6 flex items-center justify-center space-x-8">
              <StepIndicator number={1} title="Informations" active={activeStep === 1} />
              <div className="w-16 h-0.5 bg-white/30"></div>
              <StepIndicator number={2} title="Identifiants" active={activeStep === 2} />
              <div className="w-16 h-0.5 bg-white/30"></div>
              <StepIndicator number={3} title="Paiement" active={activeStep === 3} />
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-blue-50/20">
          <div className="p-8 space-y-8">
            
            {/* Step 1 */}
            {activeStep === 1 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Building2 className="w-5 h-5 text-blue-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Informations générales</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <InputGroup
                      icon={Building2}
                      label="Nom du fournisseur"
                      name="name"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="ex: Global Print SARL"
                      description="Raison sociale"
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputGroup
                        icon={User}
                        label="Contact principal"
                        name="contact"
                        value={formData.contact}
                        onChange={handleChange}
                        placeholder="ex: Ahmed Benali"
                      />
                      <InputGroup
                        icon={Phone}
                        label="Téléphone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="ex: +213 555 123 456"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <InputGroup
                        icon={Mail}
                        label="Email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="ex: contact@globalprint.dz"
                      />
                      <InputGroup
                        icon={MapPin}
                        label="Adresse"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="ex: Zone industrielle, Alger"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2 */}
            {activeStep === 2 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-amber-100 rounded-lg">
                      <Hash className="w-5 h-5 text-amber-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Identifiants fiscaux et bancaires</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      <InputGroup
                        icon={Hash}
                        label="NIF"
                        name="nif"
                        value={formData.nif}
                        onChange={handleChange}
                        placeholder="ex: 0123456789"
                      />
                      <InputGroup
                        icon={Hash}
                        label="RC"
                        name="rc"
                        value={formData.rc}
                        onChange={handleChange}
                        placeholder="ex: 22A45678"
                      />
                      <InputGroup
                        icon={CreditCard}
                        label="IBAN / RIB"
                        name="iban"
                        value={formData.iban}
                        onChange={handleChange}
                        placeholder="ex: DZ123..."
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep(1)}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                  >
                    ← Retour
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveStep(3)}
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                  >
                    Continuer →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3 */}
            {activeStep === 3 && (
              <div className="space-y-6 animate-in fade-in slide-in-from-right duration-300">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <CreditCard className="w-5 h-5 text-green-600" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Conditions de paiement</h3>
                  </div>
                  
                  <div className="space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                      <SelectGroup
                        icon={CreditCard}
                        label="Mode de paiement"
                        name="paymentMode"
                        value={formData.paymentMode}
                        onChange={handleChange}
                        options={[
                          { value: "cash", label: "Espèces" },
                          { value: "bank", label: "Virement bancaire" },
                          { value: "check", label: "Chèque" },
                          { value: "credit", label: "Crédit" },
                        ]}
                      />

                      <InputGroup
                        icon={Calendar}
                        label="Délai de paiement"
                        name="delay"
                        type="number"
                        value={formData.delay}
                        onChange={handleChange}
                        placeholder="ex: 30"
                        description="En jours"
                      />
                    </div>

                    <div className="group">
                      <label className="block mb-2">
                        <span className="text-sm font-bold text-gray-800 flex items-center space-x-2">
                          <FileEdit className="w-4 h-4 text-purple-600" />
                          <span>Notes / Observations</span>
                        </span>
                      </label>
                      <textarea
                        name="note"
                        rows={5}
                        value={formData.note}
                        onChange={handleChange}
                        placeholder="Ajoutez des notes importantes concernant ce fournisseur..."
                        className="w-full px-4 py-3.5 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-200 hover:border-gray-300 resize-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-between">
                  <button
                    type="button"
                    onClick={() => setActiveStep(2)}
                    className="px-8 py-3 border-2 border-gray-300 text-gray-700 rounded-xl font-bold hover:bg-gray-50 transition-all duration-200 hover:scale-105"
                  >
                    ← Retour
                  </button>
                  <button
                    type="submit"
                    className={`flex items-center space-x-2 px-8 py-3 rounded-xl font-bold text-white shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 ${
                      isEditMode
                        ? "bg-gradient-to-r from-amber-600 to-orange-600"
                        : "bg-gradient-to-r from-green-600 to-emerald-600"
                    }`}
                  >
                    <Save className="w-5 h-5" />
                    <span>{isEditMode ? "Mettre à jour" : "Enregistrer le fournisseur"}</span>
                  </button>
                </div>
              </div>
            )}

          </div>
        </form>
      </div>
    </div>
  );
}