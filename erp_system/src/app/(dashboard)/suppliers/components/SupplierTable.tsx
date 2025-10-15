"use client";

import { Eye, Pencil, Trash2, CreditCard, FileText, TrendingUp, AlertCircle, Loader2, Package } from "lucide-react";
import { type Supplier } from "@/lib/features/warehouse/types";

interface SupplierTableProps {
  suppliers: Supplier[];
  loading?: boolean;
  onViewDetails: (supplier: Supplier) => void;
  onDelete: (supplier: Supplier) => void;
  onEdit: (supplier: Supplier) => void;
  onPayment: (supplier: Supplier) => void;
  onOrder: (supplier: Supplier) => void;
  onRefresh?: () => void;
}

export default function SupplierTable({
  suppliers,
  loading,
  onViewDetails,
  onDelete,
  onEdit,
  onPayment,
  onOrder,
}: SupplierTableProps) {

  const BalanceBadge = ({ materialsCount }: { materialsCount?: number }) => {
    if (!materialsCount || materialsCount === 0) {
      return (
        <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-gray-100 border border-gray-200 rounded-lg">
          <Package className="w-3.5 h-3.5 text-gray-500" />
          <span className="text-xs font-bold text-gray-600">Aucune matière</span>
        </div>
      );
    }
    
    return (
      <div className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-green-100 border border-green-200 rounded-lg">
        <TrendingUp className="w-3.5 h-3.5 text-green-600" />
        <span className="text-xs font-bold text-green-700">{materialsCount} matière{materialsCount > 1 ? 's' : ''}</span>
      </div>
    );
  };

  const ActionButton = ({ 
    icon: Icon, 
    onClick, 
    title, 
    color 
  }: {
    icon: any;
    onClick: () => void;
    title: string;
    color: string;
  }) => (
    <button
      onClick={onClick}
      title={title}
      className={`group relative p-2.5 rounded-lg transition-all duration-200 hover:scale-110 ${color}`}
    >
      <Icon className="w-4 h-4" />
      
      {/* Tooltip */}
      <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap pointer-events-none z-10">
        {title}
        <span className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-gray-900"></span>
      </span>
    </button>
  );

  // Empty state
  if (!loading && suppliers.length === 0) {
    return (
      <div className="text-center py-16">
        <Package className="w-16 h-16 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun fournisseur</h3>
        <p className="text-gray-600">Commencez par ajouter votre premier fournisseur</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full">
          <thead>
            <tr className="bg-gradient-to-r from-gray-50 to-blue-50/30 border-y border-gray-200">
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Fournisseur
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Contact
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Coordonnées
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Adresse
                </span>
              </th>
              <th className="px-6 py-4 text-left">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Matières
                </span>
              </th>
              <th className="px-6 py-4 text-center">
                <span className="text-xs font-bold text-gray-700 uppercase tracking-wider">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center">
                  <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
                  <p className="text-gray-600">Chargement des fournisseurs...</p>
                </td>
              </tr>
            ) : (
              suppliers.map((s) => (
                <tr 
                  key={s.id} 
                  className="group hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/30 transition-all duration-200"
                >
                  {/* Fournisseur */}
                  <td className="px-6 py-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform duration-200">
                        <span className="text-white font-bold text-sm">
                          {s.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">{s.name}</p>
                        <p className="text-xs text-gray-500">ID: {s.id}</p>
                      </div>
                    </div>
                  </td>

                  {/* Contact */}
                  <td className="px-6 py-4">
                    {s.contact_name ? (
                      <p className="text-sm font-semibold text-gray-900">{s.contact_name}</p>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Coordonnées */}
                  <td className="px-6 py-4">
                    <div className="space-y-1">
                      {s.phone ? (
                        <p className="text-xs font-medium text-gray-700">{s.phone}</p>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                      {s.email ? (
                        <p className="text-xs text-gray-500">{s.email}</p>
                      ) : (
                        <p className="text-xs text-gray-400">—</p>
                      )}
                    </div>
                  </td>

                  {/* Adresse */}
                  <td className="px-6 py-4">
                    {s.address ? (
                      <p className="text-xs text-gray-600 max-w-xs truncate" title={s.address}>
                        {s.address}
                      </p>
                    ) : (
                      <span className="text-xs text-gray-400">—</span>
                    )}
                  </td>

                  {/* Matières */}
                  <td className="px-6 py-4">
                    <BalanceBadge materialsCount={s.materials_count} />
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-center gap-1">
                      <ActionButton
                        icon={Eye}
                        onClick={() => onViewDetails(s)}
                        title="Voir détails"
                        color="bg-blue-50 text-blue-600 hover:bg-blue-100"
                      />

                      <ActionButton
                        icon={Pencil}
                        onClick={() => onEdit(s)}
                        title="Modifier"
                        color="bg-amber-50 text-amber-600 hover:bg-amber-100"
                      />

                      <ActionButton
                        icon={CreditCard}
                        onClick={() => onPayment(s)}
                        title="Ajouter paiement"
                        color="bg-green-50 text-green-600 hover:bg-green-100"
                      />

                      <ActionButton
                        icon={FileText}
                        onClick={() => onOrder(s)}
                        title="Créer bon de commande"
                        color="bg-purple-50 text-purple-600 hover:bg-purple-100"
                      />

                      <ActionButton
                        icon={Trash2}
                        onClick={() => onDelete(s)}
                        title="Supprimer"
                        color="bg-red-50 text-red-600 hover:bg-red-100"
                      />
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination / Footer */}
      {!loading && suppliers.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Affichage de <span className="font-semibold text-gray-900">{suppliers.length}</span> fournisseur{suppliers.length > 1 ? 's' : ''}
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Précédent
            </button>
            <div className="flex items-center space-x-1">
              <button className="w-8 h-8 bg-blue-600 text-white rounded-lg text-sm font-semibold">
                1
              </button>
            </div>
            <button 
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled
            >
              Suivant
            </button>
          </div>
        </div>
      )}
    </div>
  );
}