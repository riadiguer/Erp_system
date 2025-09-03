'use client'
import { useState } from 'react'
import { Plus, Settings } from 'lucide-react'

type Role = {
  id: number
  name: string
  description?: string
  users_count?: number
  scope?: string // global, par site…
  permissions?: string[]
}

const mockRoles: Role[] = [
  { id: 1, name: 'admin', description: "Super administrateur", users_count: 2, scope: "global", permissions: ["*"] },
  { id: 2, name: 'vendeur', description: "Peut gérer les ventes", users_count: 4, scope: "showroom", permissions: ["vente:create", "vente:update"] },
  { id: 3, name: 'stock', description: "Gère le stock", users_count: 1, scope: "dépôt", permissions: ["stock:read", "stock:update"] },
]

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>(mockRoles)
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Settings className="text-purple-600" size={28} />
          Gestion des Rôles
        </h1>
        <button className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition"
          onClick={() => setModalOpen(true)}>
          <Plus size={18} />
          Nouveau rôle
        </button>
      </div>

      <table className="w-full border shadow">
        <thead>
          <tr className="bg-gray-50">
            <th>ID</th>
            <th>Nom</th>
            <th>Description</th>
            <th>Nb utilisateurs</th>
            <th>Scope</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {roles.map(role => (
            <tr key={role.id} className="border-b">
              <td>{role.id}</td>
              <td className="font-bold">{role.name}</td>
              <td>{role.description}</td>
              <td>{role.users_count || 0}</td>
              <td>{role.scope || '-'}</td>
              <td>
                {/* Boutons détails, éditer, supprimer */}
                <button className="text-blue-600 hover:underline mr-2">Détails</button>
                <button className="text-yellow-600 hover:underline mr-2">Éditer</button>
                <button className="text-red-600 hover:underline">Supprimer</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modale de création de rôle (à faire à l'étape suivante) */}
      {/* <CreateRoleModal open={modalOpen} onClose={() => setModalOpen(false)} onCreate={...} /> */}
    </div>
  )
}
