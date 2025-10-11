"use client";
import React from "react";
import { UserPlus, ShoppingCart, DollarSign, FileText, Bell, ArrowRight } from "lucide-react";

type Props = {
  onAddClient?: () => void;
  onNewOrder?: () => void;
  onAddPayment?: () => void;
  onGenerateReport?: () => void;
  onSendReminder?: () => void;
  className?: string;
};

const ActionButton = ({ 
  icon, 
  label, 
  description, 
  onClick, 
  variant = "default" 
}: { 
  icon: React.ReactNode; 
  label: string; 
  description?: string;
  onClick: () => void;
  variant?: "default" | "primary";
}) => {
  const baseClasses = "w-full text-left flex items-center justify-between p-4 rounded-lg transition-all group";
  const variantClasses = variant === "primary"
    ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-lg"
    : "border border-gray-200 hover:border-blue-300 hover:bg-blue-50";

  return (
    <button
      onClick={onClick}
      className={`${baseClasses} ${variantClasses}`}
      aria-label={label}
    >
      <div className="flex items-center space-x-3 flex-1">
        <div className={`p-2 rounded-lg ${
          variant === "primary" 
            ? "bg-white/20" 
            : "bg-blue-100 group-hover:bg-blue-200"
        } transition-colors`}>
          {React.cloneElement(icon as React.ReactElement, {
            className: `w-5 h-5 ${variant === "primary" ? "text-white" : "text-blue-600"}`
          })}
        </div>
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-sm ${
            variant === "primary" ? "text-white" : "text-gray-900"
          }`}>
            {label}
          </div>
          {description && (
            <div className={`text-xs mt-0.5 ${
              variant === "primary" ? "text-blue-100" : "text-gray-500"
            }`}>
              {description}
            </div>
          )}
        </div>
      </div>
      <ArrowRight className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
        variant === "primary" ? "text-white/80" : "text-gray-400"
      }`} />
    </button>
  );
};

export default function QuickActions({
  onAddClient = () => {},
  onNewOrder = () => {},
  onAddPayment = () => {},
  onGenerateReport = () => {},
  onSendReminder = () => {},
  className = "",
}: Props) {
  return (
    <div className={`bg-white rounded-xl shadow-sm border border-gray-200 ${className}`}>
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <ShoppingCart className="w-5 h-5 text-blue-600" />
          </div>
          <div>
            <h4 className="text-base font-semibold text-gray-900">Actions rapides</h4>
            <p className="text-xs text-gray-500">Accès direct aux fonctions principales</p>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-2">
        <ActionButton
          icon={<UserPlus />}
          label="Ajouter un client"
          description="Nouveau client dans la base"
          onClick={onAddClient}
          variant="primary"
        />

        <ActionButton
          icon={<ShoppingCart />}
          label="Créer une commande"
          description="Nouvelle vente"
          onClick={onNewOrder}
        />

        <ActionButton
          icon={<DollarSign />}
          label="Enregistrer règlement"
          description="Paiement reçu"
          onClick={onAddPayment}
        />

        <ActionButton
          icon={<FileText />}
          label="Générer rapport client"
          description="Statistiques et historique"
          onClick={onGenerateReport}
        />

        <ActionButton
          icon={<Bell />}
          label="Envoyer rappel paiement"
          description="Relance automatique"
          onClick={onSendReminder}
        />
      </div>

      <div className="p-4 bg-gray-50 border-t border-gray-200 rounded-b-xl">
        <div className="flex items-start space-x-2">
          <div className="w-1 h-1 bg-blue-500 rounded-full mt-1.5"></div>
          <p className="text-xs text-gray-600 leading-relaxed">
            <strong>Astuce :</strong> Utilisez les raccourcis clavier pour accéder rapidement à ces actions (à implémenter).
          </p>
        </div>
      </div>
    </div>
  );
}