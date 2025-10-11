"use client";

import { X, Plus, Trash2, Save, ShoppingCart, Building2, MapPin, DollarSign, Package } from "lucide-react";
import { useState } from "react";

interface SupplierOrderModalProps {
  open: boolean;
  onClose: () => void;
  supplier?: any;
}

interface OrderLine {
  id: number;
  article: string;
  quantity: number;
  price: number;
}

export default function SupplierOrderModal({
  open,
  onClose,
  supplier,
}: SupplierOrderModalProps) {
  const [lines, setLines] = useState<OrderLine[]>([
    { id: 1, article: "", quantity: 1, price: 0 },
  ]);

  const [header, setHeader] = useState({
    date: new Date().toISOString().split("T")[0],
    site: "",
    delay: "",
    currency: "DZD",
  });

  const handleHeaderChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setHeader({ ...header, [e.target.name]: e.target.value });
  };

  const handleLineChange = (id: number, field: keyof OrderLine, value: any) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const handleAddLine = () => {
    setLines([...lines, { id: Date.now(), article: "", quantity: 1, price: 0 }]);
  };

  const handleRemoveLine = (id: number) => {
    if (lines.length > 1) {
      setLines(lines.filter((l) => l.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const total = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
    console.log("Bon de commande créé :", { supplier, header, lines, total });
    onClose();
  };

  if (!open) return null;

  const totalAmount = lines.reduce((sum, l) => sum + l.quantity * l.price, 0);
  const totalItems = lines.reduce((sum, l) => sum + l.quantity, 0);

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-black/70 via-purple-900/30 to-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl max-h-[95vh] flex flex-col overflow-hidden transform animate-in zoom-in-95 duration-300">
        
        {/* Header Premium */}
        <div className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-green-600 via-emerald-700 to-teal-600"></div>
          <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA3IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          
          <div className="relative z-10 px-8 py-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="p-3 bg-white/20 backdrop-blur-xl rounded-2xl shadow-lg border border-white/30">
                  <ShoppingCart className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h2 className="text-3xl font-black text-white mb-1">
                    Nouveau bon de commande
                  </h2>
                  <p className="text-green-100 text-sm font-medium flex items-center space-x-2">
                    <Building2 className="w-4 h-4" />
                    <span>{supplier?.name || "Fournisseur"}</span>
                  </p>
                </div>
              </div>
              
              <button
                onClick={onClose}
                className="p-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/20 backdrop-blur-sm transition-all duration-200 hover:scale-110"
                title="Fermer"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto bg-gradient-to-br from-gray-50 to-green-50/20">
          <div className="p-8 space-y-6">
            
            {/* Header Info */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center space-x-3 mb-5">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Package className="w-5 h-5 text-blue-600" />
                </div>
                <h3 className="text-lg font-bold text-gray-900">Informations générales</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    Date de commande
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={header.date}
                    onChange={handleHeaderChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <div className="flex items-center space-x-2">
                      <MapPin className="w-4 h-4 text-green-600" />
                      <span>Site de réception</span>
                    </div>
                  </label>
                  <input
                    type="text"
                    name="site"
                    value={header.site}
                    onChange={handleHeaderChange}
                    placeholder="ex: Dépôt Alger"
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-green-500 focus:ring-4 focus:ring-green-100 focus:outline-none transition-all duration-200"
                  />
                </div>

                <div className="group">
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    <div className="flex items-center space-x-2">
                      <DollarSign className="w-4 h-4 text-amber-600" />
                      <span>Devise</span>
                    </div>
                  </label>
                  <select
                    name="currency"
                    value={header.currency}
                    onChange={handleHeaderChange}
                    className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-xl text-sm font-medium text-gray-900 focus:border-amber-500 focus:ring-4 focus:ring-amber-100 focus:outline-none transition-all duration-200 appearance-none cursor-pointer"
                  >
                    <option value="DZD">DZD - Dinar Algérien</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="USD">USD - Dollar</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Order Lines */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <ShoppingCart className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900">Articles commandés</h3>
                    <p className="text-xs text-gray-600">{lines.length} ligne(s) - {totalItems} article(s)</p>
                  </div>
                </div>
                
                <button
                  onClick={handleAddLine}
                  type="button"
                  className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-xl text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  <span>Ajouter une ligne</span>
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-green-50/30 border-b-2 border-gray-200">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase">
                        Article / Description
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase w-32">
                        Quantité
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase w-40">
                        Prix unitaire
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-bold text-gray-700 uppercase w-40">
                        Total
                      </th>
                      <th className="px-4 py-3 text-center text-xs font-bold text-gray-700 uppercase w-20">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lines.map((line, index) => (
                      <tr key={line.id} className="group hover:bg-green-50/30 transition-colors duration-150">
                        <td className="px-4 py-3">
                          <input
                            type="text"
                            value={line.article}
                            onChange={(e) => handleLineChange(line.id, "article", e.target.value)}
                            placeholder="Nom de l'article"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:border-green-500 focus:ring-2 focus:ring-green-100 focus:outline-none transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={line.quantity}
                            onChange={(e) => handleLineChange(line.id, "quantity", Number(e.target.value))}
                            min="1"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-center focus:border-blue-500 focus:ring-2 focus:ring-blue-100 focus:outline-none transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <input
                            type="number"
                            value={line.price}
                            onChange={(e) => handleLineChange(line.id, "price", Number(e.target.value))}
                            min="0"
                            step="0.01"
                            className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium focus:border-amber-500 focus:ring-2 focus:ring-amber-100 focus:outline-none transition-all duration-200"
                          />
                        </td>
                        <td className="px-4 py-3">
                          <div className="px-3 py-2 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg">
                            <p className="text-sm font-bold text-green-700">
                              {(line.quantity * line.price).toLocaleString()} DA
                            </p>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <button
                            onClick={() => handleRemoveLine(line.id)}
                            type="button"
                            disabled={lines.length === 1}
                            className={`p-2 rounded-lg transition-all duration-200 ${
                              lines.length === 1
                                ? "text-gray-300 cursor-not-allowed"
                                : "text-red-600 hover:bg-red-50 hover:scale-110"
                            }`}
                            title="Supprimer la ligne"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Summary */}
            <div className="bg-gradient-to-br from-green-600 to-emerald-700 rounded-2xl shadow-lg p-6 text-white">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-green-100 mb-1">Total de la commande</p>
                  <p className="text-4xl font-black">{totalAmount.toLocaleString()} DA</p>
                </div>
                <div className="text-right space-y-2">
                  <div className="flex items-center justify-end space-x-2 text-sm">
                    <span className="text-green-100">Total articles:</span>
                    <span className="font-bold">{totalItems}</span>
                  </div>
                  <div className="flex items-center justify-end space-x-2 text-sm">
                    <span className="text-green-100">Lignes:</span>
                    <span className="font-bold">{lines.length}</span>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </form>

        {/* Footer */}
        <div className="flex-shrink-0 px-8 py-5 bg-gradient-to-r from-gray-50 to-green-50/30 border-t border-gray-200 flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Le bon de commande sera envoyé à <span className="font-bold text-gray-900">{supplier?.name}</span>
          </p>
          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              type="button"
              className="px-6 py-2.5 border-2 border-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              type="submit"
              className="flex items-center space-x-2 px-6 py-2.5 bg-gradient-to-r from-green-600 to-emerald-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105"
            >
              <Save className="w-5 h-5" />
              <span>Enregistrer la commande</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}