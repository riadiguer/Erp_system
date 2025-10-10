"use client";
import Link from "next/link";

export default function ProductsHomePage() {
  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Module Produits</h1>
      <p className="mb-4 text-gray-600">Veuillez choisir un sous-module :</p>
      <div className="flex gap-8">
        <Link
          href="/stock/products/finished-products"
          className="bg-blue-100 hover:bg-blue-200 transition rounded-2xl shadow p-8 flex flex-col items-center w-64"
        >
          <span className="text-5xl mb-3">📦</span>
          <div className="text-xl font-semibold mb-2">Produits finis</div>
          <div className="text-gray-500 text-sm text-center">Gestion du stock des produits finis fabriqués ou en vente.</div>
        </Link>
        <Link
          href="/stock/products/services"
          className="bg-green-100 hover:bg-green-200 transition rounded-2xl shadow p-8 flex flex-col items-center w-64"
        >
          <span className="text-5xl mb-3">🛠️</span>
          <div className="text-xl font-semibold mb-2">Services</div>
          <div className="text-gray-500 text-sm text-center">Gestion des stocks et demandes liées aux services proposés.</div>
        </Link>
      </div>
    </div>
  );
}
