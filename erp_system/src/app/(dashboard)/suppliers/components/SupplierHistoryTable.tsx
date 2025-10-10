"use client";

import { FileText, Eye, Download, Calendar, MapPin, DollarSign, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface SupplierHistoryTableProps {
  supplier?: any;
}

export default function SupplierHistoryTable({ supplier }: SupplierHistoryTableProps) {
  const history = supplier?.history || [
    {
      id: 101,
      orderNumber: "BC-2025-0045",
      date: "2025-09-25",
      site: "Showroom Alger",
      total: 450000,
      status: "Livré",
    },
    {
      id: 102,
      orderNumber: "BC-2025-0041",
      date: "2025-09-12",
      site: "Usine Tipaza",
      total: 780000,
      status: "En attente de paiement",
    },
    {
      id: 103,
      orderNumber: "BC-2025-0039",
      date: "2025-08-28",
      site: "Dépôt Blida",
      total: 320000,
      status: "Reçu",
    },
    {
      id: 104,
      orderNumber: "BC-2025-0035",
      date: "2025-08-15",
      site: "Showroom Alger",
      total: 580000,
      status: "Livré",
    },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const statusConfig: any = {
      "Livré": {
        icon: CheckCircle,
        color: "bg-green-100 text-green-700 border-green-200",
        dotColor: "bg-green-500"
      },
      "En attente de paiement": {
        icon: Clock,
        color: "bg-amber-100 text-amber-700 border-amber-200",
        dotColor: "bg-amber-500"
      },
      "Reçu": {
        icon: CheckCircle,
        color: "bg-blue-100 text-blue-700 border-blue-200",
        dotColor: "bg-blue-500"
      },
      "En cours": {
        icon: AlertCircle,
        color: "bg-purple-100 text-purple-700 border-purple-200",
        dotColor: "bg-purple-500"
      }
    };

    const config = statusConfig[status] || statusConfig["En cours"];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center space-x-2 px-3 py-1.5 rounded-lg border font-semibold text-xs ${config.color}`}>
        <div className={`w-2 h-2 rounded-full ${config.dotColor} animate-pulse`}></div>
        <Icon className="w-3.5 h-3.5" />
        <span>{status}</span>
      </div>
    );
  };

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
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Site
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
            {history.map((h, index) => (
              <tr 
                key={h.id} 
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
                      <p className="text-sm font-bold text-gray-900">{h.orderNumber}</p>
                      <p className="text-xs text-gray-500">Commande #{h.id}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2 text-sm text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">{h.date}</span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <MapPin className="w-4 h-4 text-purple-500" />
                    <span className="text-sm font-medium text-gray-700">{h.site}</span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-bold text-gray-900">
                      {h.total.toLocaleString()} DA
                    </span>
                  </div>
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <StatusBadge status={h.status} />
                </td>

                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-110"
                      title="Télécharger PDF"
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
                {history.filter(h => h.status === "Livré").length} Livrées
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
              <span className="text-sm font-semibold text-gray-700">
                {history.filter(h => h.status === "En attente de paiement").length} En attente
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <DollarSign className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-bold text-gray-900">
                Total: {history.reduce((sum, h) => sum + h.total, 0).toLocaleString()} DA
              </span>
            </div>
          </div>

          <button className="px-5 py-2.5 bg-white border border-gray-300 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-all duration-200 hover:scale-105 shadow-sm">
            Voir tout l'historique
          </button>
        </div>
      </div>
    </div>
  );
}