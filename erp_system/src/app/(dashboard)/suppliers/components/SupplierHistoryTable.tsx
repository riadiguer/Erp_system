"use client";

import { FileText, Eye, Download, Calendar, MapPin, DollarSign, CheckCircle, Clock, AlertCircle, XCircle, Loader2 } from "lucide-react";
import { Supplier, PurchaseOrder } from "@/lib/features/warehouse/types";
import { usePurchaseOrders } from "@/lib/features/warehouse/hooks";
import { useMemo } from "react";

interface SupplierHistoryTableProps {
  supplier?: Supplier | null;
}

export default function SupplierHistoryTable({ supplier }: SupplierHistoryTableProps) {
  const { orders, loading } = usePurchaseOrders();

  // Filter orders for this supplier
  const supplierOrders = useMemo(() => {
    if (!supplier?.id) return [];
    return orders.filter(order => order.supplier === supplier.id);
  }, [orders, supplier?.id]);

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: Record<string, {
      icon: any;
      color: string;
      dotColor: string;
      label: string;
    }> = {
      "draft": {
        icon: AlertCircle,
        color: "bg-gray-100 text-gray-700 border-gray-200",
        dotColor: "bg-gray-500",
        label: "Brouillon"
      },
      "sent": {
        icon: Clock,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500",
        label: "Envoyé"
      },
      "confirmed": {
        icon: CheckCircle,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        dotColor: "bg-purple-500",
        label: "Confirmé"
      },
      "received": {
        icon: CheckCircle,
        color: "bg-green-100 text-green-700 border-green-200",
        dotColor: "bg-green-500",
        label: "Reçu"
      },
      "cancelled": {
        icon: XCircle,
        color: "bg-red-100 text-red-700 border-red-200",
        dotColor: "bg-red-500",
        label: "Annulé"
      }
    };

    const config = statusConfig[status] || statusConfig["draft"];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-semibold text-xs ${config.color}`}>
        <div className={`w-2 h-2 rounded-full ${config.dotColor} ${status !== 'cancelled' ? 'animate-pulse' : ''}`}></div>
        <Icon className="w-3.5 h-3.5" />
        <span>{config.label}</span>
      </div>
    );
  };

  // Calculate totals
  const stats = useMemo(() => {
    const total = supplierOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || '0'), 0);
    const received = supplierOrders.filter(o => o.status === 'received').length;
    const pending = supplierOrders.filter(o => ['sent', 'confirmed'].includes(o.status)).length;
    
    return { total, received, pending };
  }, [supplierOrders]);

  if (loading) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-2" />
            <p className="text-sm text-gray-600">Chargement de l'historique...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!supplier) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Aucun fournisseur sélectionné</p>
        </div>
      </div>
    );
  }

  if (supplierOrders.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aucun bon de commande</p>
            <p className="text-sm text-gray-400 mt-1">Ce fournisseur n'a pas encore de commandes</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-gray-50 to-blue-50/30">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                #
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Bon de commande
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Date de commande
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Livraison prévue
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Montant total
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Statut
              </th>
              <th className="px-6 py-4 text-center text-xs font-bold text-gray-700 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-100">
            {supplierOrders.map((order, index) => (
              <tr 
                key={order.id} 
                className="hover:bg-blue-50/50 transition-colors duration-200 group"
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center w-8 h-8 bg-gray-100 rounded-lg group-hover:bg-blue-100 transition-colors duration-200">
                    <span className="text-sm font-bold text-gray-600 group-hover:text-blue-600">
                      {index + 1}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{order.order_number}</p>
                      <p className="text-xs text-gray-500">
                        {order.items_count || 0} article{(order.items_count || 0) > 1 ? 's' : ''}
                      </p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {new Date(order.order_date).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    {order.expected_delivery_date ? (
                      <>
                        <MapPin className="w-4 h-4 text-purple-500" />
                        <span className="text-sm font-medium text-gray-700">
                          {new Date(order.expected_delivery_date).toLocaleDateString('fr-FR')}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm text-gray-400 italic">Non définie</span>
                    )}
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-gray-900">
                      {parseFloat(order.total_amount || '0').toLocaleString('fr-FR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })} DA
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={order.status} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                      title="Voir détails"
                      onClick={() => {
                        // TODO: Open order details modal
                        console.log('View order:', order.id);
                      }}
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-110"
                      title="Télécharger PDF"
                      onClick={() => {
                        // TODO: Generate and download PDF
                        console.log('Download order:', order.id);
                      }}
                    >
                      <Download className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer avec statistiques */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">
                {stats.received} Reçue{stats.received > 1 ? 's' : ''}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">
                {stats.pending} En attente
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-900">
                Total: {stats.total.toLocaleString('fr-FR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })} DA
              </span>
            </div>
          </div>

          <div className="text-sm text-gray-600">
            <span className="font-semibold">{supplierOrders.length}</span> commande{supplierOrders.length > 1 ? 's' : ''} au total
          </div>
        </div>
      </div>
    </div>
  );
}