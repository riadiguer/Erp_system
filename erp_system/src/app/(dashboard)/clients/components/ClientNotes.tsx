"use client";
import React, { useEffect, useMemo, useState } from "react";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Pin, 
  Tag, 
  User, 
  Calendar,
  Download,
  Search,
  X,
  Save
} from "lucide-react";

export type NoteItem = {
  id: string;
  author?: string;
  date: string;
  text: string;
  pinned?: boolean;
  tags?: string[];
};

type Props = {
  notes?: NoteItem[];
  pageSize?: number;
  onAdd?: (note: NoteItem) => Promise<void> | void;
  onEdit?: (note: NoteItem) => Promise<void> | void;
  onDelete?: (id: string) => Promise<void> | void;
  onExport?: (items: NoteItem[]) => void;
};

function generateId() {
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return (crypto as any).randomUUID();
    }
  } catch {}
  return `note_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
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

export default function ClientNotes({
  notes = [],
  pageSize = 6,
  onAdd = () => {},
  onEdit = () => {},
  onDelete = () => {},
  onExport = () => {},
}: Props) {
  const [query, setQuery] = useState("");
  const [onlyPinned, setOnlyPinned] = useState(false);
  const [tagFilter, setTagFilter] = useState("");
  const [page, setPage] = useState(1);
  const [localNotes, setLocalNotes] = useState<NoteItem[]>(notes);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<NoteItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => setLocalNotes(notes), [notes]);

  const allTags = useMemo(() => {
    const s = new Set<string>();
    for (const n of localNotes) (n.tags ?? []).forEach((t) => s.add(t));
    return Array.from(s).sort();
  }, [localNotes]);

  const filtered = useMemo(() => {
    const q = (query || "").trim().toLowerCase();
    return localNotes
      .filter((n) => {
        if (onlyPinned && !n.pinned) return false;
        if (tagFilter && !(n.tags ?? []).includes(tagFilter)) return false;
        if (!q) return true;
        const hay = `${n.author ?? ""} ${n.text} ${(n.tags ?? []).join(" ")}`.toLowerCase();
        return hay.includes(q);
      })
      .sort((a, b) => {
        if ((a.pinned ? 1 : 0) !== (b.pinned ? 1 : 0)) return a.pinned ? -1 : 1;
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      });
  }, [localNotes, query, onlyPinned, tagFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, page, pageSize]);

  useEffect(() => setPage(1), [query, onlyPinned, tagFilter, pageSize]);

  const [formAuthor, setFormAuthor] = useState("");
  const [formText, setFormText] = useState("");
  const [formPinned, setFormPinned] = useState(false);
  const [formTags, setFormTags] = useState("");

  const openNewNote = () => {
    setEditing(null);
    setFormAuthor("");
    setFormText("");
    setFormPinned(false);
    setFormTags("");
    setIsModalOpen(true);
  };

  const openEditNote = (n: NoteItem) => {
    setEditing(n);
    setFormAuthor(n.author ?? "");
    setFormText(n.text);
    setFormPinned(!!n.pinned);
    setFormTags((n.tags ?? []).join(", "));
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;
    setIsModalOpen(false);
    setEditing(null);
  };

  const handleSave = async (e?: React.FormEvent) => {
    e?.preventDefault?.();
    const textTrim = formText.trim();
    if (!textTrim) {
      alert("Le texte de la note est requis.");
      return;
    }

    const normalizedTags = formTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const payload: NoteItem = {
      id: editing?.id ?? generateId(),
      author: formAuthor.trim() || undefined,
      date: editing?.date ?? new Date().toISOString().slice(0, 10),
      text: textTrim,
      pinned: formPinned,
      tags: normalizedTags,
    };

    try {
      setSaving(true);
      if (editing) {
        setLocalNotes((prev) => prev.map((x) => (x.id === payload.id ? payload : x)));
        await onEdit(payload);
      } else {
        setLocalNotes((prev) => [payload, ...prev]);
        await onAdd(payload);
      }
      setIsModalOpen(false);
      setEditing(null);
    } catch (err) {
      console.error("Save note failed", err);
      alert("Erreur lors de l'enregistrement de la note.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    const ok = confirm("Supprimer cette note ?");
    if (!ok) return;
    try {
      await onDelete(id);
      setLocalNotes((prev) => prev.filter((n) => n.id !== id));
    } catch (err) {
      console.error("Delete note failed", err);
      alert("Impossible de supprimer la note.");
    }
  };

  const handleExportCSV = (all = true) => {
    const items = all ? filtered : current;
    onExport(items);
    const headers = ["id", "date", "author", "pinned", "tags", "text"];
    const rows = items.map((n) =>
      headers.map((h) => {
        const v = (n as any)[h];
        if (v === undefined || v === null) return "";
        if (Array.isArray(v)) return v.join("|");
        return String(v).replace(/"/g, '""');
      })
    );
    const csv = [headers.join(","), ...rows.map((r) => r.map((c) => `"${c}"`).join(","))].join("\n");
    downloadCSV(`client_notes_${new Date().toISOString().slice(0, 10)}.csv`, csv);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div className="flex-1">
            <div className="relative">
              <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Rechercher dans les notes..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                aria-label="Recherche notes"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setOnlyPinned((p) => !p)}
              className={`inline-flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                onlyPinned 
                  ? "bg-yellow-100 text-yellow-800 border border-yellow-200" 
                  : "border border-gray-300 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <Pin className="w-4 h-4 mr-2" />
              Épinglées
            </button>

            <select 
              value={tagFilter} 
              onChange={(e) => setTagFilter(e.target.value)} 
              className="border border-gray-300 px-3 py-2 rounded-lg text-sm focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Tous tags</option>
              {allTags.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>

            <button 
              onClick={openNewNote} 
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              <Plus className="w-4 h-4 mr-2" />
              Ajouter
            </button>

            <button 
              onClick={() => handleExportCSV(true)} 
              className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors text-sm"
            >
              <Download className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Notes list */}
      <div className="p-4">
        {current.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Tag className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-gray-600 font-medium">Aucune note trouvée</p>
            <p className="text-sm text-gray-500 mt-1">Créez votre première note pour commencer</p>
          </div>
        ) : (
          <div className="space-y-3">
            {current.map((n) => (
              <article 
                key={n.id} 
                className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                  n.pinned ? "border-yellow-300 bg-yellow-50" : "border-gray-200"
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-semibold text-white ${
                    n.pinned ? "bg-yellow-600" : "bg-gradient-to-br from-blue-500 to-cyan-500"
                  }`}>
                    {n.author ? (n.author[0] ?? "?").toUpperCase() : "N"}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {n.author && (
                            <span className="text-sm font-semibold text-gray-900">{n.author}</span>
                          )}
                          {n.pinned && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                              <Pin className="w-3 h-3 mr-1" />
                              Épinglée
                            </span>
                          )}
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(n.date).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 leading-relaxed">{n.text}</p>
                        {(n.tags ?? []).length > 0 && (
                          <div className="mt-2 flex items-center gap-2 flex-wrap">
                            {n.tags.map((t) => (
                              <span 
                                key={t} 
                                className="inline-flex items-center px-2 py-0.5 bg-gray-100 text-gray-700 rounded text-xs"
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {t}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="flex-shrink-0 flex gap-2">
                        <button 
                          onClick={() => openEditNote(n)} 
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Modifier"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete(n.id)} 
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Supprimer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {filtered.length > pageSize && (
          <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
            <div>
              Affichage {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} - {Math.min(page * pageSize, filtered.length)} sur {filtered.length}
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setPage(1)} 
                disabled={page === 1} 
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                «
              </button>
              <button 
                onClick={() => setPage((p) => Math.max(1, p - 1))} 
                disabled={page === 1} 
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                ‹
              </button>

              <span>Page <strong>{page}</strong> / {totalPages}</span>

              <button 
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))} 
                disabled={page === totalPages} 
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                ›
              </button>
              <button 
                onClick={() => setPage(totalPages)} 
                disabled={page === totalPages} 
                className="px-2 py-1 border rounded disabled:opacity-50"
              >
                »
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSave} className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-6 text-white relative">
              <button 
                type="button" 
                onClick={closeModal} 
                className="absolute right-4 top-4 text-white/80 hover:text-white"
              >
                <X className="w-6 h-6" />
              </button>
              <h3 className="text-xl font-bold">{editing ? "Modifier la note" : "Nouvelle note"}</h3>
              <p className="text-sm text-blue-100 mt-1">{editing ? "Mettez à jour la note" : "Rédigez une nouvelle note"}</p>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Auteur</label>
                <div className="relative">
                  <User className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                  <input 
                    value={formAuthor} 
                    onChange={(e) => setFormAuthor(e.target.value)} 
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                    placeholder="Nom de l'auteur (optionnel)" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Texte *</label>
                <textarea 
                  value={formText} 
                  onChange={(e) => setFormText(e.target.value)} 
                  rows={5} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                  placeholder="Écrivez votre note ici..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Tags (séparés par ,)</label>
                  <div className="relative">
                    <Tag className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input 
                      value={formTags} 
                      onChange={(e) => setFormTags(e.target.value)} 
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500" 
                      placeholder="ex: relance, urgent" 
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Options</label>
                  <label className="inline-flex items-center px-4 py-3 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50">
                    <input 
                      type="checkbox" 
                      checked={formPinned} 
                      onChange={(e) => setFormPinned(e.target.checked)} 
                      className="mr-2"
                    />
                    <Pin className="w-4 h-4 mr-2 text-yellow-600" />
                    <span className="text-sm font-medium">Épingler cette note</span>
                  </label>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50 flex items-center justify-end gap-3">
              <button 
                type="button" 
                onClick={closeModal} 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium" 
                disabled={saving}
              >
                Annuler
              </button>
              <button 
                type="submit" 
                className="inline-flex items-center px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-lg" 
                disabled={saving}
              >
                {saving ? (
                  "Enregistrement..."
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    {editing ? "Enregistrer" : "Créer"}
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}