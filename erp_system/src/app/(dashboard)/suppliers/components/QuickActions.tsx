"use client";

import { Eye, Pencil, Trash2, CreditCard, FileText } from "lucide-react";

interface QuickActionsProps {
  supplier: any;
  onViewDetails: (supplier: any) => void;
  onEdit: (supplier: any) => void;
  onDelete: (supplier: any) => void;
  onPayment: (supplier: any) => void;
  onOrder: (supplier: any) => void;
}

export default function QuickActions({
  supplier,
  onViewDetails,
  onEdit,
  onDelete,
  onPayment,
  onOrder,
}: QuickActionsProps) {
  
  const ActionButton = ({ 
    icon: Icon, 
    onClick, 
    title, 
    color,
    hoverColor 
  }: {
    icon: any;
    onClick: () => void;
    title: string;
    color: string;
    hoverColor: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`group relative p-2.5 rounded-lg ${color} transition-all duration-200 hover:scale-110 hover:shadow-lg ${hoverColor}`}
    >
      <Icon className="w-4 h-4" />
      
      {/* Tooltip on hover */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none">
        {title}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </button>
  );

  return (
    <div className="flex items-center justify-center gap-2">
      <ActionButton
        icon={Eye}
        onClick={() => onViewDetails(supplier)}
        title="Voir détails"
        color="bg-blue-50 text-blue-600"
        hoverColor="hover:bg-blue-100"
      />

      <ActionButton
        icon={Pencil}
        onClick={() => onEdit(supplier)}
        title="Modifier"
        color="bg-amber-50 text-amber-600"
        hoverColor="hover:bg-amber-100"
      />

      <ActionButton
        icon={CreditCard}
        onClick={() => onPayment(supplier)}
        title="Ajouter paiement"
        color="bg-green-50 text-green-600"
        hoverColor="hover:bg-green-100"
      />

      <ActionButton
        icon={FileText}
        onClick={() => onOrder(supplier)}
        title="Créer bon de commande"
        color="bg-purple-50 text-purple-600"
        hoverColor="hover:bg-purple-100"
      />

      <ActionButton
        icon={Trash2}
        onClick={() => onDelete(supplier)}
        title="Supprimer"
        color="bg-red-50 text-red-600"
        hoverColor="hover:bg-red-100"
      />
    </div>
  );
}