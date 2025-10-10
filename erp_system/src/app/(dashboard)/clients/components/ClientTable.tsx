"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Eye, Edit, Trash2, User, Mail, Phone, ChevronUp, ChevronDown, Download, X } from "lucide-react";

export type Client = {
  id: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  type?: "Particulier" | "Société";
  balance?: number;
  revenue?: number;
  lastOrder?: string;
  createdAt?: string;
  status?: "Actif" | "Inactif";
};

type Props = {
  clients: Client[];
  onView: (c: Client) => void;
  onEdit: (c: Client) => void;
  onDelete: (id: string) => void;
  pageSize?: number;
  onSelectionChange?: (selectedIds: string[]) => void;
  onExportSelected?: (ids: string[]) => void;
};

export default function ClientTable({
  clients,
  onView,
  onEdit,
  onDelete,
  pageSize = 10,
  onSelectionChange,
  onExportSelected,
}: Props) {
  const [sortBy, setSortBy] = useState<keyof Client | "">("");
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc");
  const [page, setPage] = useState(1);
  const [localPageSize, setLocalPageSize] = useState<number>(pageSize);
  const [selected, setSelected] = useState<Record<string, boolean>>({});

  useEffect(() => {
    if (onSelectionChange) {
      const ids = Object.entries(selected).filter(([, v]) => v).map(([k]) => k);
      onSelectionChange(ids);
    }
  }, [selected, onSelectionChange]);

  useEffect(() => {
    setLocalPageSize(pageSize);
  }, [pageSize]);

  const toggleSort = (key: keyof Client) => {
    if (sortBy === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSortBy(key);
      setSortDir("asc");
    }
    setPage(1);
  };

  const sorted = useMemo(() => {
    if (!sortBy) return clients;
    return [...clients].sort((a, b) => {
      const va = (a[sortBy] ?? "") as any;
      const vb = (b[sortBy] ?? "") as any;
      if (typeof va === "number" && typeof vb === "number") return sortDir === "asc" ? va - vb : vb - va;
      return sortDir === "asc" ? String(va).localeCompare(String(vb)) : String(vb).localeCompare(String(va));
    });
  }, [clients, sortBy, sortDir]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / localPageSize));
  const current = useMemo(() => {
    const start = (page - 1) * localPageSize;
    return sorted.slice(start, start + localPageSize);
  }, [sorted, page, localPageSize]);

  const toggleSelect = (id: string) => setSelected((s) => ({ ...s, [id]: !s[id] }));

  const selectAllOnPage = (checked: boolean) => {
    if (checked) {
      const additions: Record<string, boolean> = {};
      current.forEach((c) => (additions[c.id] = true));
      setSelected((s) => ({ ...s, ...additions }));
    } else {
      setSelected((s) => {
        const copy = { ...s };
        current.forEach((c) => delete copy[c.id]);
        return copy;
      });
    }
  };

  const clearSelection = () => setSelected({});

  const selectedIds = useMemo(() => Object.entries(selected).filter(([, v]) => v).map(([k]) => k), [selected]);
  const selectedCount = selectedIds.length;

  const handleDelete = (id: string) => {
    const ok = confirm("Voulez-vous vraiment supprimer ce client ? Cette action est irréversible.");
    if (!ok) return;
    onDelete(id);
  };

  const handleExportSelected = () => {
    if (selectedCount === 0) {
      alert("Aucun client sélectionné.");
      return;
    }
    if (onExportSelected) onExportSelected(selectedIds);
    else {
      const header = ["id", "firstName", "lastName", "email", "phone", "type", "balance", "revenue", "createdAt", "status"];
      const rows = clients
        .filter((c) => selected[c.id])
        .map((c) =>
          header.map((h) => {
            const v = (c as any)[h];
            if (v === undefined || v === null) return "";
            return String(v).replace(/"/g, '""');
          })
        );
      const csv = [header.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.setAttribute("download", `clients_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const SortIcon = ({ column }: { column: keyof Client }) => {
    if (sortBy !== column) return null;
    return sortDir === "asc" ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />;
  };

  return (
    <div>
      {/* Selection toolbar */}
      {selectedCount > 0 && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-sm font-medium text-blue-900">
              {selectedCount} client(s) sélectionné(s)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSelected}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-blue-300 bg-white hover:bg-blue-50 transition-colors font-medium text-blue-700"
            >
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </button>
            <button
              onClick={() => {
                if (!confirm(`Supprimer ${selectedCount} client(s) sélectionné(s) ?`)) return;
                selectedIds.forEach((id) => onDelete(id));
                clearSelection();
              }}
              className="inline-flex items-center px-3 py-1.5 text-sm rounded-lg border border-red-300 bg-white hover:bg-red-50 transition-colors font-medium text-red-700"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Supprimer
            </button>
            <button
              onClick={clearSelection}
              className="inline-flex items-center px-2 py-1.5 text-sm rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
              title="Effacer sélection"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      <div className="overflow-x-auto rounded-lg border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left">
                <input
                  type="checkbox"
                  className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  aria-label="Sélectionner tout sur la page"
                  onChange={(e) => selectAllOnPage(e.target.checked)}
                />
              </th>

              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSort("firstName")}
              >
                <div className="flex items-center space-x-1">
                  <span>Client</span>
                  <SortIcon column="firstName" />
                </div>
              </th>

              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Contact
              </th>

              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSort("type")}
              >
                <div className="flex items-center space-x-1">
                  <span>Type</span>
                  <SortIcon column="type" />
                </div>
              </th>

              <th 
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100 transition-colors"
                onClick={() => toggleSort("balance")}
              >
                <div className="flex items-center space-x-1">
                  <span>Solde</span>
                  <SortIcon column="balance" />
                </div>
              </th>

              
              

              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="bg-white divide-y divide-gray-200">
            {current.length === 0 && (
              <tr>
                <td colSpan={8} className="px-4 py-12 text-center">
                  <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">Aucun client à afficher</p>
                  <p className="text-sm text-gray-500 mt-1">Commencez par ajouter votre premier client</p>
                </td>
              </tr>
            )}

            {current.map((c) => (
              <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-4">
                  <input
                    type="checkbox"
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    checked={!!selected[c.id]}
                    onChange={() => toggleSelect(c.id)}
                    aria-label={`Sélectionner ${c.firstName ?? c.id}`}
                  />
                </td>

                <td className="px-4 py-4">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-semibold">
                        {(c.firstName?.[0] ?? "?").toUpperCase()}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">
                        {c.firstName ?? "-"} {c.lastName ?? ""}
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                          c.status === "Actif" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-gray-100 text-gray-800"
                        }`}>
                          {c.status ?? "Inconnu"}
                        </span>
                      </div>
                    </div>
                  </div>
                </td>

                <td className="px-4 py-4">
                  <div className="space-y-1">
                    {c.email && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Mail className="w-3 h-3 mr-2 text-gray-400" />
                        {c.email}
                      </div>
                    )}
                    {c.phone && (
                      <div className="flex items-center text-sm text-gray-600">
                        <Phone className="w-3 h-3 mr-2 text-gray-400" />
                        {c.phone}
                      </div>
                    )}
                    {!c.email && !c.phone && (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </div>
                </td>

                <td className="px-4 py-4">
                  <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium ${
                    c.type === "Société" 
                      ? "bg-purple-100 text-purple-800" 
                      : "bg-blue-100 text-blue-800"
                  }`}>
                    {c.type ?? "-"}
                  </span>
                </td>

                <td className="px-4 py-4">
                  <span className={`text-sm font-semibold ${
                    Number(c.balance ?? 0) < 0 ? "text-red-600" : "text-green-600"
                  }`}>
                    {typeof c.balance === "number" ? `${c.balance.toFixed(2)} DA` : "-"}
                  </span>
                </td>

                
                <td className="px-4 py-4 text-right">
                  <div className="flex items-center justify-end space-x-2">
                    <button
                      onClick={() => onView(c)}
                      className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => onEdit(c)}
                      className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(c.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex items-center justify-between">
        <div className="text-sm text-gray-600">
          Affichage {sorted.length === 0 ? 0 : (page - 1) * localPageSize + 1} - {Math.min(page * localPageSize, sorted.length)} sur {sorted.length}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setPage(1)}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Premier
          </button>
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Précédent
          </button>

          <span className="px-4 py-1 text-sm font-medium">
            Page {page} / {totalPages}
          </span>

          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Suivant
          </button>
          <button
            onClick={() => setPage(totalPages)}
            disabled={page === totalPages}
            className="px-3 py-1 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 transition-colors"
          >
            Dernier
          </button>

          <select
            value={localPageSize}
            onChange={(e) => {
              const n = Number(e.target.value) || 10;
              setLocalPageSize(n);
              setPage(1);
            }}
            className="ml-3 border border-gray-300 px-3 py-1 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value={10}>10 / page</option>
            <option value={20}>20 / page</option>
            <option value={50}>50 / page</option>
          </select>
        </div>
      </div>
    </div>
  );
}