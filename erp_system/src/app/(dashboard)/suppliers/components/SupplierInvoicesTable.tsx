"use client";

import { FileText, CreditCard, Download, Eye, AlertCircle, CheckCircle, Clock } from "lucide-react";

interface SupplierInvoicesTableProps {
  supplier?: any;
}

export default function SupplierInvoicesTable({ supplier }: SupplierInvoicesTableProps) {
  const invoices = supplier?.invoices || [
    {
      id: 201,
      number: "FACF-2025-019",
      date: "2025-09-26",
      dueDate: "2025-10-26",
      total: 480000,
      paid: 300000,
      status: "Partiellement payée",
    },
    {
      id: 202,
      number: "FACF-2025-017",
      date: "2025-09-10",
      dueDate: "2025-09-25",
      total: 290000,
      paid: 290000,
      status: "Payée",
    },
    {
      id: 203,
      number: "FACF-2025-015",
      date: "2025-08-18",
      dueDate: "2025-09-18",
      total: 120000,
      paid: 0,
      status: "En retard",
    },
  ];

  const StatusBadge = ({ status }: { status: string }) => {
    const configs: any = {
      "Payée": {
        icon: CheckCircle,
        bg: "bg-green-100",
        text: "text-green-700",
        border: "border-green-200",
      },
      "Partiellement payée": {
        icon: Clock,
        bg: "bg-amber-100",
        text: "text-amber-700",
        border: "border-amber-200",
      },
      "En retard": {
        icon: AlertCircle,
        bg: "bg-red-100",
        text: "text-red-700",
        border: "border-red-200",
      },
    };

    const config = configs[status] || configs["En retard"];
    const Icon = config.icon;

    return (
      <div className={`inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border ${config.bg} ${config.text} ${config.border} font-semibold text-xs`}>
        <Icon className="w-3.5 h-3.5" />
        <span>{status}</span>
      </div>
    );
  };

  const ProgressBar = ({ paid, total }: { paid: number; total: number }) => {
    const percentage = (paid / total) * 100;
    return (
      <div className="w-full">
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium text-gray-600">
            {paid.toLocaleString()} DA / {total.toLocaleString()} DA
          </span>
          <span className="text-xs font-bold text-blue-600">{percentage.toFixed(0)}%</span>
        </div>
        <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              percentage === 100
                ? "bg-gradient-to-r from-green-500 to-green-600"
                : percentage > 0
                ? "bg-gradient-to-r from-amber-500 to-amber-600"
                : "bg-gray-300"
            }`}
            style={{ width: `${percentage}%` }}
          ></div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-gray-50 to-blue-50/30 px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Factures fournisseur</h4>
              <p className="text-xs text-gray-600">{invoices.length} facture(s) au total</p>
            </div>
          </div>
          
          {/* Summary stats */}
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600">Total dû</p>
              <p className="text-lg font-bold text-red-600">
                {invoices.reduce((sum, inv) => sum + (inv.total - inv.paid), 0).toLocaleString()} DA
              </p>
            </div>
            <div className="text-right">
              <p className="text-xs font-medium text-gray-600">Total payé</p>
              <p className="text-lg font-bold text-green-600">
                {invoices.reduce((sum, inv) => sum + inv.paid, 0).toLocaleString()} DA
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Facture
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Dates
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Montant
              </th>
              <th className="px-6 py-4 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">
                Progression
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
            {invoices.map((inv, index) => (
              <tr key={inv.id} className="hover:bg-blue-50/30 transition-colors duration-150 group">
                <td className="px-6 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors duration-200">
                      <FileText className="w-4 h-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-gray-900">{inv.number}</p>
                      <p className="text-xs text-gray-500">ID: {inv.id}</p>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">Émission:</span>
                      <span className="text-xs font-semibold text-gray-900">{inv.date}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-medium text-gray-500">Échéance:</span>
                      <span className="text-xs font-semibold text-gray-900">{inv.dueDate}</span>
                    </div>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <p className="text-sm font-bold text-gray-900">
                      {inv.total.toLocaleString()} DA
                    </p>
                    <p className="text-xs text-gray-500">
                      Reste: <span className="font-semibold text-red-600">{(inv.total - inv.paid).toLocaleString()} DA</span>
                    </p>
                  </div>
                </td>

                <td className="px-6 py-4">
                  <ProgressBar paid={inv.paid} total={inv.total} />
                </td>

                <td className="px-6 py-4">
                  <StatusBadge status={inv.status} />
                </td>

                <td className="px-6 py-4">
                  <div className="flex items-center justify-center space-x-2">
                    <button
                      className="p-2 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-all duration-200 hover:scale-110"
                      title="Voir facture"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    
                    <button
                      className="p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-all duration-200 hover:scale-110"
                      title="Effectuer un paiement"
                    >
                      <CreditCard className="w-4 h-4" />
                    </button>

                    <button
                      className="p-2 rounded-lg bg-gray-50 text-gray-600 hover:bg-gray-100 transition-all duration-200 hover:scale-110"
                      title="Télécharger"
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

      {/* Footer */}
      <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-blue-50/30 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Affichage de <span className="font-semibold text-gray-900">{invoices.length}</span> facture(s)
        </div>
        <button className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all duration-200 hover:scale-105">
          Voir toutes les factures
        </button>
      </div>
    </div>
  );
}