"use client";

import { useState } from "react";
import { Plus, Trash2, Edit2, MessageSquare, User, Calendar } from "lucide-react";

interface SupplierNotesProps {
  supplier?: any;
}

interface Note {
  id: number;
  text: string;
  author: string;
  date: string;
}

export default function SupplierNotes({ supplier }: SupplierNotesProps) {
  const [notes, setNotes] = useState<Note[]>(
    supplier?.notes || [
      { id: 1, text: "Bon fournisseur, délais respectés.", author: "Admin", date: "2025-09-12" },
      { id: 2, text: "À relancer pour la prochaine commande.", author: "Sami", date: "2025-09-28" },
    ]
  );

  const [newNote, setNewNote] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  const handleAddNote = () => {
    if (!newNote.trim()) return;
    const newEntry: Note = {
      id: Date.now(),
      text: newNote.trim(),
      author: "Utilisateur actuel",
      date: new Date().toISOString().split("T")[0],
    };
    setNotes([newEntry, ...notes]);
    setNewNote("");
    setIsAdding(false);
  };

  const handleDelete = (id: number) => {
    setNotes(notes.filter((n) => n.id !== id));
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 px-6 py-4 border-b border-purple-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <h4 className="text-base font-bold text-gray-900">Notes internes</h4>
              <p className="text-xs text-gray-600">{notes.length} note(s) enregistrée(s)</p>
            </div>
          </div>

          <button
            onClick={() => setIsAdding(!isAdding)}
            className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
          >
            <Plus className="w-4 h-4" />
            <span>Ajouter une note</span>
          </button>
        </div>
      </div>

      {/* Add Note Form */}
      {isAdding && (
        <div className="p-6 bg-purple-50/30 border-b border-purple-100 animate-in slide-in-from-top duration-300">
          <div className="space-y-3">
            <label className="block text-sm font-bold text-gray-800">
              Nouvelle note
            </label>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Ajoutez vos observations concernant ce fournisseur..."
              rows={4}
              className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 focus:outline-none transition-all duration-200 resize-none"
            />
            <div className="flex items-center justify-end space-x-2">
              <button
                onClick={() => {
                  setIsAdding(false);
                  setNewNote("");
                }}
                className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg text-sm font-semibold hover:bg-gray-50 transition-all duration-200"
              >
                Annuler
              </button>
              <button
                onClick={handleAddNote}
                className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-lg text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notes List */}
      <div className="p-6">
        {notes.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4">
              <MessageSquare className="w-8 h-8 text-gray-400" />
            </div>
            <p className="text-sm font-medium text-gray-500">Aucune note enregistrée</p>
            <p className="text-xs text-gray-400 mt-1">Ajoutez des observations pour ce fournisseur</p>
          </div>
        ) : (
          <ul className="space-y-3">
            {notes.map((note) => (
              <li
                key={note.id}
                className="group relative bg-gradient-to-br from-gray-50 to-purple-50/20 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-all duration-200 hover:border-purple-200"
              >
                {/* Note Content */}
                <div className="flex items-start justify-between space-x-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-800 leading-relaxed mb-3">
                      {note.text}
                    </p>
                    
                    {/* Author & Date */}
                    <div className="flex items-center space-x-4 text-xs text-gray-500">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5" />
                        <span className="font-semibold">{note.author}</span>
                      </div>
                      <div className="flex items-center space-x-1.5">
                        <Calendar className="w-3.5 h-3.5" />
                        <span>{note.date}</span>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                    <button
                      className="p-2 rounded-lg text-blue-600 hover:bg-blue-50 transition-all duration-200 hover:scale-110"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(note.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-all duration-200 hover:scale-110"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Footer */}
      {notes.length > 0 && (
        <div className="px-6 py-4 bg-gradient-to-r from-gray-50 to-purple-50/30 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            Les notes sont visibles uniquement par votre équipe
          </p>
        </div>
      )}
    </div>
  );
}