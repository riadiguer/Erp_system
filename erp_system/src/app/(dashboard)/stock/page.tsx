"use client";
import Link from "next/link";

export default function StockHomePage() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Gestion des Stocks</h1>
      <p className="mb-6 text-gray-600">
        Accédez aux sous-modules de gestion : produits finis, services, matières premières/entrepôts.
      </p>
      <div className="grid gap-8 grid-cols-1 md:grid-cols-3">
        {/* Carte Produits finis */}
        <Link href="/stock/products/finished-products">
          <div className="cursor-pointer bg-blue-100 hover:bg-blue-200 transition rounded-2xl shadow p-8 flex flex-col items-center">
            <span className="text-5xl mb-3">📦</span>
            <div className="text-xl font-semibold mb-2">Produits finis</div>
            <div className="text-gray-500 text-sm text-center">Gestion du stock de tous les produits finis fabriqués ou en vente.</div>
          </div>
        </Link>
        {/* Carte Services */}
        <Link href="/stock/products/services">
          <div className="cursor-pointer bg-green-100 hover:bg-green-200 transition rounded-2xl shadow p-8 flex flex-col items-center">
            <span className="text-5xl mb-3">🛠️</span>
            <div className="text-xl font-semibold mb-2">Services</div>
            <div className="text-gray-500 text-sm text-center">Gestion des stocks et demandes liées aux services proposés.</div>
          </div>
        </Link>
        {/* Carte Matières premières */}
        <Link href="/stock/warehouses">
          <div className="cursor-pointer bg-orange-100 hover:bg-orange-200 transition rounded-2xl shadow p-8 flex flex-col items-center">
            <span className="text-5xl mb-3">🏭</span>
            <div className="text-xl font-semibold mb-2">Matières premières (Entrepôts)</div>
            <div className="text-gray-500 text-sm text-center">Gestion et suivi des matières premières dans les entrepôts.</div>
          </div>
        </Link>
      </div>
    </div>
  );
}