"use client";
import React, { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Download, 
  ChevronLeft, 
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  ShoppingCart,
  CreditCard,
  Bell,
  FileText,
  Calendar,
  Filter,
  Eye
} from "lucide-react";

export type HistoryItem = {
  id: string;
  kind: "commande" | "paiement" | "relance" | "note";
  date: string;
  reference?: string;
  amount?: number;
  status?: string;
  user?: string;
  note?: string;
};

type Props = {
  items?: HistoryItem[];
  pageSize?: number;
  onView?: (item: HistoryItem) => void;
  onExport?: (items: HistoryItem[]) => void;
};

function formatDate(iso?: string) {
  if (!iso) return "-";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("fr-FR", { 
      day: "2-digit", 
      month: "short", 
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  } catch {
    return iso;
  }
}

function downloadCSV(filename: string, csvContent: string) {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.setAttribute("download", filename);
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

const kindConfig = {
  commande: { 
    icon: <ShoppingCart className="w-4 h-4" />, 
    bg: "bg-blue-100", 
    text: "text-blue-800",
    border: "border-blue-200",
    label: "Commande"
  },
  paiement: { 
    icon: <CreditCard className="w-4 h-4" />, 
    bg: "bg-green-100", 
    text: "text-green-800",
    border: "border-green-200",
    label: "Paiement"
  },
  relance: { 
    icon: <Bell className="w-4 h-4" />, 
    bg: "bg-yellow-100", 
    text: "text-yellow-800",
    border: "border-yellow-200",
    label: "Relance"
  },
  note: { 
    icon: <FileText className="w-4 h-4" />, 
    bg: "bg-gray-100", 
    text: "text-gray-800",
    border: "border-gray-200",
    label: "Note"
  },
};

export default function ClientHistoryTable({
  items = [],
  pageSize = 8,
  onView = () => {},
  onExport,
}: Props) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<"" | HistoryItem["kind"] | "all">("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);

  useEffect(() => setPage(1), [query, typeFilter, dateFrom, dateTo, sortDir]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return items
      .filter((it) => {
        if (typeFilter && typeFilter !== "all") {
          if (it.kind !== typeFilter) return false;
        }
        if (dateFrom) {
          const from = new Date(dateFrom + "T00:00:00");
          const itDate = new Date(it.date);
          if (itDate < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo + "T23:59:59");
          const itDate = new Date(it.date);
          if (itDate > to) return false;
        }
        if (!q) return true;
        const hay = `${it.reference ?? ""} ${it.note ?? ""} ${it.user ?? ""} ${it.status ?? ""} ${it.kind}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortDir === "desc" ? db - da : da - db;
      });
  }, [items, query, typeFilter, dateFrom, dateTo, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const handleExportCSV = (allFiltered = true) => {
    const toExport = allFiltered ? filtered : current;
    if (onExport) onExport(toExport);

    const headers = ["id", "date", "kind", "reference", "amount", "status", "user", "note"];
    const rows = toExport.map((r) =>
      headers.map((h) => {
        const val = (r as any)[h];
        if (val === undefined || val === null) return "";
        return String(val).replace(/"/g, '""');
      })
    );

    const csvLines = [
      headers.join(","),
      ...rows.map((r) => r.map((c) => `"${c}"`).join(",")),
    ];
    const csvContent = csvLines.join("\n");
    downloadCSV(`client_history_${new Date().toISOString().slice(0, 10)}.csv`, csvContent);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">Historique des activités</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExportCSV(false)}
              className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter page
            </button>
            <button
              onClick={() => handleExportCSV(true)}
              className="inline-flex items-center px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Download className="w-4 h-4 mr-2" />
              Tout exporter
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher (réf, note, utilisateur...)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Recherche historique"
            />
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as any)}
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Filtrer par type"
          >
            <option value="">Tous types</option>
            <option value="commande">Commande</option>
            <option value="paiement">Paiement</option>
            <option value="relance">Relance</option>
            <option value="note">Note</option>
          </select>

          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
              aria-label="Date de début"
            />
            <span className="text-gray-400">→</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm"
              aria-label="Date de fin"
            />
          </div>

          <select
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value as any)}
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
            aria-label="Trier"
          >
            <option value="desc">Récent → Ancien</option>
            <option value="asc">Ancien → Récent</option>
          </select>

          <button
            onClick={() => { 
              setQuery(""); 
              setTypeFilter(""); 
              setDateFrom(""); 
              setDateTo(""); 
              setSortDir("desc"); 
            }}
            className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 whitespace-nowrap"
          >
            Réinitialiser
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilisateur</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {current.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-8 text-center text-gray-500">
                  <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                  <p>Aucune entrée trouvée</p>
                </td>
              </tr>
            )}

            {current.map((h) => {
              const config = kindConfig[h.kind];
              return (
                <tr key={h.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {formatDate(h.date)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${config.border}`}>
                      {config.icon}
                      {config.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                    {h.reference ?? "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {typeof h.amount === "number" ? `${h.amount.toLocaleString()} DA` : "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {h.status ?? "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700">
                    {h.user ?? "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700 max-w-xs truncate">
                    {h.note ?? "-"}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right">
                    <button 
                      onClick={() => onView(h)} 
                      className="inline-flex items-center px-3 py-1 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1" />
                      Voir
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 border-t border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            Affichage {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} sur {filtered.length}
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={() => setPage(1)} 
              disabled={page === 1} 
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Première page"
            >
              <ChevronsLeft className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage((p) => Math.max(1, p - 1))} 
              disabled={page === 1} 
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Page précédente"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            <span className="px-3 py-2 text-sm">
              Page <strong>{page}</strong> / {totalPages}
            </span>

            <button 
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
              disabled={page === totalPages} 
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Page suivante"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setPage(totalPages)} 
              disabled={page === totalPages} 
              className="p-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-100 transition-colors"
              aria-label="Dernière page"
            >
              <ChevronsRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}