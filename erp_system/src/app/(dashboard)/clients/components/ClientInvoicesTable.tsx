"use client";
import React, { useEffect, useMemo, useState } from "react";
import { 
  Search, 
  Download, 
  Eye, 
  CheckCircle, 
  XCircle, 
  Calendar,
  Filter,
  FileText,
  Trash2,
  CheckSquare,
  Square,
  Loader
} from "lucide-react";

export type Invoice = {
  id: string;
  date: string;
  clientId?: string;
  clientName?: string;
  amount: number;
  paid?: boolean;
  reference?: string;
  dueDate?: string;
  fileUrl?: string;
  note?: string;
};

type Props = {
  invoices?: Invoice[];
  pageSize?: number;
  onView?: (inv: Invoice) => void;
  onDownload?: (inv: Invoice) => void;
  onMarkPaid?: (ids: string[]) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onExport?: (items: Invoice[]) => void;
};

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

export default function ClientInvoicesTable({
  invoices = [],
  pageSize = 10,
  onView = () => {},
  onDownload = () => {},
  onMarkPaid = () => {},
  onDelete = () => {},
  onExport = () => {},
}: Props) {
  const [query, setQuery] = useState("");
  const [filterPaid, setFilterPaid] = useState<"" | "paid" | "unpaid">("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [sortBy, setSortBy] = useState<"date" | "amount">("date");
  const [sortDir, setSortDir] = useState<"desc" | "asc">("desc");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [loadingBulk, setLoadingBulk] = useState(false);

  useEffect(() => {
    setPage(1);
  }, [query, filterPaid, dateFrom, dateTo, sortBy, sortDir]);

  const normalized = useMemo(() => invoices || [], [invoices]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return normalized
      .filter((inv) => {
        if (filterPaid === "paid" && !inv.paid) return false;
        if (filterPaid === "unpaid" && inv.paid) return false;
        if (dateFrom) {
          const from = new Date(dateFrom + "T00:00:00").getTime();
          if (new Date(inv.date).getTime() < from) return false;
        }
        if (dateTo) {
          const to = new Date(dateTo + "T23:59:59").getTime();
          if (new Date(inv.date).getTime() > to) return false;
        }
        if (!q) return true;
        const hay = `${inv.id} ${inv.reference ?? ""} ${inv.clientName ?? ""} ${inv.note ?? ""}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if (sortBy === "amount") {
          return sortDir === "asc" ? a.amount - b.amount : b.amount - a.amount;
        }
        const da = new Date(a.date).getTime();
        const db = new Date(b.date).getTime();
        return sortDir === "asc" ? da - db : db - da;
      });
  }, [normalized, query, filterPaid, dateFrom, dateTo, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));
  const selectAllPage = (checked: boolean) => {
    if (checked) {
      const n: Record<string, boolean> = {};
      current.forEach((c) => (n[c.id] = true));
      setSelected((s) => ({ ...s, ...n }));
    } else {
      setSelected((s) => {
        const copy = { ...s };
        current.forEach((c) => delete copy[c.id]);
        return copy;
      });
    }
  };
  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => k), [selected]);

  const handleMarkPaid = async (ids: string[]) => {
    if (ids.length === 0) return;
    const ok = confirm(`Confirmer marquer ${ids.length} facture(s) comme payée(s) ?`);
    if (!ok) return;
    try {
      setLoadingBulk(true);
      await onMarkPaid(ids);
      setSelected({});
    } catch (err) {
      console.error("Mark paid failed", err);
      alert("Échec lors du marquage comme payée.");
    } finally {
      setLoadingBulk(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Supprimer définitivement cette facture ?");
    if (!ok) return;
    try {
      await onDelete(id);
    } catch (err) {
      console.error("Delete invoice failed", err);
      alert("Impossible de supprimer la facture.");
    }
  };

  const handleExportCSV = (allFiltered = true) => {
    const items = allFiltered ? filtered : current;
    onExport(items);
    const headers = ["id", "date", "clientName", "reference", "amount", "paid", "dueDate", "note"];
    const rows = items.map((it) =>
      headers.map((h) => {
        const v = (it as any)[h];
        if (v === undefined || v === null) return "";
        return String(v).replace(/"/g, '""');
      })
    );
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    downloadCSV(`invoices_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  const formatDate = (iso?: string) => {
    if (!iso) return "-";
    const d = new Date(iso);
    return d.toLocaleDateString();
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FileText className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Factures</h3>
              <p className="text-sm text-gray-500">{filtered.length} facture(s)</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-2.5 text-gray-400" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Recherche (id, référence, client...)"
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              aria-label="Recherche factures"
            />
          </div>

          <select 
            value={filterPaid} 
            onChange={(e) => setFilterPaid(e.target.value as any)} 
            className="border border-gray-300 px-3 py-2 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous statuts</option>
            <option value="paid">Payées</option>
            <option value="unpaid">Impayées</option>
          </select>

          <div className="flex items-center gap-2">
            <input 
              type="date" 
              value={dateFrom} 
              onChange={(e) => setDateFrom(e.target.value)} 
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" 
            />
            <span className="text-gray-400">→</span>
            <input 
              type="date" 
              value={dateTo} 
              onChange={(e) => setDateTo(e.target.value)} 
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500" 
            />
          </div>

          <button 
            onClick={() => { setQuery(""); setFilterPaid(""); setDateFrom(""); setDateTo(""); }} 
            className="px-3 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50"
          >
            Réinit
          </button>
        </div>
      </div>

      {/* Bulk actions */}
      <div className="px-4 py-3 bg-gray-50 border-b border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          {selectedIds.length > 0 ? (
            <span className="font-medium">{selectedIds.length} sélectionnée(s)</span>
          ) : (
            <span>{invoices.length} facture(s)</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => handleMarkPaid(selectedIds)}
            disabled={selectedIds.length === 0 || loadingBulk}
            className={`inline-flex items-center px-3 py-1.5 rounded-lg text-sm font-medium ${
              selectedIds.length === 0 
                ? "opacity-50 cursor-not-allowed border border-gray-300" 
                : "bg-green-600 text-white hover:bg-green-700"
            }`}
          >
            {loadingBulk ? (
              <>
                <Loader className="w-4 h-4 mr-2 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Marquer payée(s)
              </>
            )}
          </button>

          <button
            onClick={() => handleExportCSV(true)}
            className="inline-flex items-center px-3 py-1.5 rounded-lg border border-gray-300 text-sm font-medium hover:bg-gray-50"
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <button
                  onClick={(e) => {
                    const allSelected = current.every(inv => selected[inv.id]);
                    selectAllPage(!allSelected);
                  }}
                  className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded"
                >
                  {current.length > 0 && current.every(inv => selected[inv.id]) ? (
                    <CheckSquare className="w-4 h-4 text-blue-600" />
                  ) : (
                    <Square className="w-4 h-4 text-gray-400" />
                  )}
                </button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Référence</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Montant</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Échéance</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {current.length === 0 ? (
              <tr>
                <td colSpan={9} className="px-4 py-12 text-center">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600">Aucune facture trouvée</p>
                </td>
              </tr>
            ) : (
              current.map((inv) => (
                <tr key={inv.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <button
                      onClick={() => toggleSelect(inv.id)}
                      className="flex items-center justify-center w-5 h-5 border-2 border-gray-300 rounded"
                    >
                      {selected[inv.id] ? (
                        <CheckSquare className="w-4 h-4 text-blue-600" />
                      ) : (
                        <Square className="w-4 h-4 text-gray-400" />
                      )}
                    </button>
                  </td>

                  <td className="px-4 py-3 text-sm font-medium text-gray-900">{inv.id}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4 text-gray-400" />
                      {formatDate(inv.date)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-700">{inv.clientName ?? "-"}</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{inv.reference ?? "-"}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-gray-900">{inv.amount.toLocaleString()} DA</td>
                  <td className="px-4 py-3 text-sm text-gray-700">{formatDate(inv.dueDate)}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${
                      inv.paid 
                        ? "bg-green-50 text-green-700 border-green-200" 
                        : "bg-red-50 text-red-700 border-red-200"
                    }`}>
                      {inv.paid ? (
                        <>
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Payée
                        </>
                      ) : (
                        <>
                          <XCircle className="w-3 h-3 mr-1" />
                          Impayée
                        </>
                      )}
                    </span>
                  </td>

                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => onView(inv)}
                        className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                        title="Voir"
                      >
                        <Eye className="w-4 h-4 text-gray-600" />
                      </button>
                      <button
                        onClick={() => onDownload(inv)}
                        className="p-1.5 rounded-lg border border-gray-300 hover:bg-gray-50"
                        title="Télécharger"
                      >
                        <Download className="w-4 h-4 text-gray-600" />
                      </button>
                      {!inv.paid && (
                        <button
                          onClick={() => handleMarkPaid([inv.id])}
                          className="p-1.5 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100"
                          title="Marquer payée"
                        >
                          <CheckCircle className="w-4 h-4 text-green-600" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(inv.id)}
                        className="p-1.5 rounded-lg border border-red-300 hover:bg-red-50"
                        title="Supprimer"
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Affichage {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} sur {filtered.length}
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setPage(1)} 
            disabled={page === 1} 
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            «
          </button>
          <button 
            onClick={() => setPage((p) => Math.max(1, p - 1))} 
            disabled={page === 1} 
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            ‹
          </button>

          <span className="text-sm">
            Page <strong>{page}</strong> / {totalPages}
          </span>

          <button 
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
            disabled={page === totalPages} 
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            ›
          </button>
          <button 
            onClick={() => setPage(totalPages)} 
            disabled={page === totalPages} 
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 hover:bg-gray-50"
          >
            »
          </button>
        </div>
      </div>
    </div>
  );
}