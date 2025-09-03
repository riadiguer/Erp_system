import { useState } from 'react'
import { Plus, Trash2, Edit3, Users, Shield, X, Search, Filter, Key, Lock, Unlock, Settings } from 'lucide-react'

type Permission = {
  id: string
  name: string
  description: string
  category: string
}

type Role = {
  id: number
  name: string
  description?: string
  users_count?: number
  scope?: string
  color?: string
  permissions: string[]
}

const availablePermissions: Permission[] = [
  // Gestion des utilisateurs
  { id: 'users.create', name: 'Créer utilisateur', description: 'Peut créer de nouveaux utilisateurs', category: 'Utilisateurs' },
  { id: 'users.read', name: 'Voir utilisateurs', description: 'Peut consulter la liste des utilisateurs', category: 'Utilisateurs' },
  { id: 'users.update', name: 'Modifier utilisateur', description: 'Peut modifier les informations utilisateur', category: 'Utilisateurs' },
  { id: 'users.delete', name: 'Supprimer utilisateur', description: 'Peut supprimer des utilisateurs', category: 'Utilisateurs' },
  
  // Gestion des ventes
  { id: 'sales.create', name: 'Créer vente', description: 'Peut créer de nouvelles ventes', category: 'Ventes' },
  { id: 'sales.read', name: 'Voir ventes', description: 'Peut consulter les ventes', category: 'Ventes' },
  { id: 'sales.update', name: 'Modifier vente', description: 'Peut modifier les ventes existantes', category: 'Ventes' },
  { id: 'sales.validate', name: 'Valider vente', description: 'Peut valider les ventes', category: 'Ventes' },
  { id: 'sales.cancel', name: 'Annuler vente', description: 'Peut annuler des ventes', category: 'Ventes' },
  
  // Gestion du stock
  { id: 'stock.read', name: 'Voir stock', description: 'Peut consulter les niveaux de stock', category: 'Stock' },
  { id: 'stock.update', name: 'Gérer stock', description: 'Peut modifier les quantités en stock', category: 'Stock' },
  { id: 'stock.transfer', name: 'Transférer stock', description: 'Peut effectuer des transferts de stock', category: 'Stock' },
  { id: 'stock.inventory', name: 'Inventaire', description: 'Peut faire des inventaires', category: 'Stock' },
  
  // Gestion financière
  { id: 'finance.read', name: 'Voir finances', description: 'Peut consulter les données financières', category: 'Finance' },
  { id: 'finance.reports', name: 'Rapports financiers', description: 'Peut générer des rapports financiers', category: 'Finance' },
  
  // Administration système
  { id: 'admin.settings', name: 'Paramètres système', description: 'Peut modifier les paramètres système', category: 'Administration' },
  { id: 'admin.roles', name: 'Gérer rôles', description: 'Peut gérer les rôles et permissions', category: 'Administration' },
  { id: 'admin.backup', name: 'Sauvegardes', description: 'Peut gérer les sauvegardes', category: 'Administration' },
]

const initialRoles: Role[] = [
  { 
    id: 1, 
    name: 'admin', 
    description: 'Super administrateur', 
    users_count: 2, 
    scope: 'global', 
    color: 'bg-red-100 text-red-700',
    permissions: ['users.create', 'users.read', 'users.update', 'users.delete', 'sales.read', 'sales.validate', 'stock.read', 'finance.read', 'finance.reports', 'admin.settings', 'admin.roles', 'admin.backup']
  },
  { 
    id: 2, 
    name: 'vendeur', 
    description: 'Gestion des ventes', 
    users_count: 4, 
    scope: 'showroom', 
    color: 'bg-blue-100 text-blue-700',
    permissions: ['sales.create', 'sales.read', 'sales.update', 'stock.read', 'users.read']
  },
  { 
    id: 3, 
    name: 'stock', 
    description: 'Gestion stock', 
    users_count: 1, 
    scope: 'dépôt', 
    color: 'bg-green-100 text-green-700',
    permissions: ['stock.read', 'stock.update', 'stock.transfer', 'stock.inventory']
  },
  { 
    id: 4, 
    name: 'manager', 
    description: 'Responsable équipe', 
    users_count: 3, 
    scope: 'showroom', 
    color: 'bg-purple-100 text-purple-700',
    permissions: ['users.read', 'users.update', 'sales.read', 'sales.validate', 'sales.cancel', 'stock.read', 'finance.read']
  },
  { 
    id: 5, 
    name: 'comptable', 
    description: 'Gestion financière', 
    users_count: 2, 
    scope: 'global', 
    color: 'bg-orange-100 text-orange-700',
    permissions: ['sales.read', 'finance.read', 'finance.reports']
  },
]

const scopeOptions = [
  { value: 'global', label: 'Global', icon: '🌐' },
  { value: 'showroom', label: 'Showroom', icon: '🏪' },
  { value: 'dépôt', label: 'Dépôt', icon: '📦' },
]

const colorOptions = [
  'bg-red-100 text-red-700',
  'bg-blue-100 text-blue-700',
  'bg-green-100 text-green-700',
  'bg-purple-100 text-purple-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-indigo-100 text-indigo-700',
  'bg-teal-100 text-teal-700',
]

export default function RolesModal({ open, onClose }: { open: boolean, onClose: () => void }) {
  const [roles, setRoles] = useState<Role[]>(initialRoles)
  const [newRole, setNewRole] = useState({ 
    name: '', 
    description: '', 
    scope: 'global',
    color: colorOptions[0],
    permissions: [] as string[]
  })
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterScope, setFilterScope] = useState('all')
  const [showAddForm, setShowAddForm] = useState(false)
  const [showPermissionsModal, setShowPermissionsModal] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)

  const filteredRoles = roles.filter(role => {
    const matchesSearch = role.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         role.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesScope = filterScope === 'all' || role.scope === filterScope
    return matchesSearch && matchesScope
  })

  const handleAddRole = () => {
    if (newRole.name.trim() === '') return
    setRoles(prev => [
      ...prev,
      { ...newRole, id: Date.now(), users_count: 0 }
    ])
    setNewRole({ name: '', description: '', scope: 'global', color: colorOptions[0], permissions: [] })
    setShowAddForm(false)
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
  }

  const handleUpdateRole = () => {
    if (!editingRole || editingRole.name.trim() === '') return
    setRoles(prev => prev.map(r => r.id === editingRole.id ? editingRole : r))
    setEditingRole(null)
  }

  const handleDelete = (id: number) => {
    setRoles(prev => prev.filter(r => r.id !== id))
  }

  const handleManagePermissions = (role: Role) => {
    setSelectedRole(role)
    setShowPermissionsModal(true)
  }

  const handleUpdatePermissions = (permissions: string[]) => {
    if (!selectedRole) return
    setRoles(prev => prev.map(r => 
      r.id === selectedRole.id ? { ...r, permissions } : r
    ))
    setSelectedRole({ ...selectedRole, permissions })
  }

  const getScopeIcon = (scope: string) => {
    const option = scopeOptions.find(opt => opt.value === scope)
    return option ? option.icon : '⚪'
  }

  const getPermissionsByCategory = () => {
    const grouped: Record<string, Permission[]> = {}
    availablePermissions.forEach(permission => {
      if (!grouped[permission.category]) {
        grouped[permission.category] = []
      }
      grouped[permission.category].push(permission)
    })
    return grouped
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Shield className="w-6 h-6" />
            <h2 className="text-2xl font-bold">Gestion des Rôles & Permissions</h2>
            <span className="bg-black bg-opacity-20 px-3 py-1 rounded-full text-sm">
              {roles.length} rôle{roles.length > 1 ? 's' : ''}
            </span>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-black bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Search and Filters */}
        <div className="p-6 border-b bg-gray-50">
          <div className="flex gap-4 items-center mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher un rôle..."
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-500" />
              <select
                value={filterScope}
                onChange={e => setFilterScope(e.target.value)}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">Tous les scopes</option>
                {scopeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          
          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4" />
            Nouveau rôle
          </button>
        </div>

        {/* Add Role Form */}
        {showAddForm && (
          <div className="p-6 bg-blue-50 border-b">
            <h3 className="text-lg font-semibold mb-4 text-blue-800">Créer un nouveau rôle</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <input
                type="text"
                placeholder="Nom du rôle"
                value={newRole.name}
                onChange={e => setNewRole(r => ({ ...r, name: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <input
                type="text"
                placeholder="Description"
                value={newRole.description}
                onChange={e => setNewRole(r => ({ ...r, description: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <select
                value={newRole.scope}
                onChange={e => setNewRole(r => ({ ...r, scope: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {scopeOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.icon} {option.label}
                  </option>
                ))}
              </select>
              <select
                value={newRole.color}
                onChange={e => setNewRole(r => ({ ...r, color: e.target.value }))}
                className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {colorOptions.map((color, index) => (
                  <option key={color} value={color}>
                    Couleur {index + 1}
                  </option>
                ))}
              </select>
            </div>
            <div className="mt-4">
            <label className="font-semibold text-blue-800 mb-2 block">Permissions du rôle</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-40 overflow-auto border rounded p-2 bg-white">
                {availablePermissions.map((perm) => (
                <label key={perm.id} className="flex items-center gap-2 text-sm cursor-pointer">
                    <input
                    type="checkbox"
                    checked={newRole.permissions.includes(perm.id)}
                    onChange={() => {
                        setNewRole(r => ({
                        ...r,
                        permissions: r.permissions.includes(perm.id)
                            ? r.permissions.filter(p => p !== perm.id)
                            : [...r.permissions, perm.id]
                        }))
                    }}
                    />
                    <span className="font-medium">{perm.name}</span>
                    <span className="text-gray-400 text-xs">({perm.category})</span>
                </label>
                ))}
            </div>
            </div>

            <div className="flex gap-2 mt-4">
              <button 
                onClick={handleAddRole}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Ajouter
              </button>
              <button 
                onClick={() => setShowAddForm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        )}

        {/* Roles Grid */}
        <div className="flex-1 overflow-auto p-6">
          {filteredRoles.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <Shield className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg">Aucun rôle trouvé</p>
              <p className="text-sm">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRoles.map(role => (
                <div key={role.id} className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${role.color}`}>
                        {role.name}
                      </span>
                      <span className="text-lg">{getScopeIcon(role.scope || 'global')}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleManagePermissions(role)}
                        className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Gérer les permissions"
                      >
                        <Key className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleEditRole(role)}
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(role.id)}
                        className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  
                  <p className="text-gray-600 text-sm mb-4 min-h-[40px]">
                    {role.description || 'Aucune description'}
                  </p>
                  
                  <div className="mb-4">
                    <div className="flex items-center gap-2 mb-2">
                      <Lock className="w-4 h-4 text-gray-400" />
                      <span className="text-sm font-medium text-gray-700">
                        {role.permissions.length} permission{role.permissions.length > 1 ? 's' : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map(permId => {
                        const perm = availablePermissions.find(p => p.id === permId)
                        return perm ? (
                          <span key={permId} className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                            {perm.name}
                          </span>
                        ) : null
                      })}
                      {role.permissions.length > 3 && (
                        <span className="px-2 py-1 bg-gray-200 text-gray-500 rounded text-xs">
                          +{role.permissions.length - 3} autres
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-gray-500">
                      <Users className="w-4 h-4" />
                      <span>{role.users_count} utilisateur{(role.users_count || 0) > 1 ? 's' : ''}</span>
                    </div>
                    <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs font-medium">
                      {role.scope}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Edit Role Modal */}
        {editingRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
              <h3 className="text-lg font-semibold mb-4">Modifier le rôle</h3>
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Nom du rôle"
                  value={editingRole.name}
                  onChange={e => setEditingRole({ ...editingRole, name: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <input
                  type="text"
                  placeholder="Description"
                  value={editingRole.description || ''}
                  onChange={e => setEditingRole({ ...editingRole, description: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <select
                  value={editingRole.scope}
                  onChange={e => setEditingRole({ ...editingRole, scope: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {scopeOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.icon} {option.label}
                    </option>
                  ))}
                </select>
                <select
                  value={editingRole.color || colorOptions[0]}
                  onChange={e => setEditingRole({ ...editingRole, color: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {colorOptions.map((color, index) => (
                    <option key={color} value={color}>
                      Couleur {index + 1}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-2 mt-6">
                <button 
                  onClick={handleUpdateRole}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Sauvegarder
                </button>
                <button 
                  onClick={() => setEditingRole(null)}
                  className="flex-1 bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Permissions Management Modal */}
        {showPermissionsModal && selectedRole && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-60 p-4">
            <div className="bg-white rounded-xl shadow-xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
              <div className="p-6 border-b bg-gradient-to-r from-green-600 to-green-500 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Key className="w-6 h-6" />
                    <div>
                      <h3 className="text-xl font-semibold">Permissions pour "{selectedRole.name}"</h3>
                      <p className="text-green-100 text-sm">{selectedRole.permissions.length} permissions actives</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setShowPermissionsModal(false)}
                    className="w-8 h-8 rounded-full bg-white bg-opacity-20 flex items-center justify-center hover:bg-opacity-30 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
              
              <div className="flex-1 overflow-auto p-6">
                {Object.entries(getPermissionsByCategory()).map(([category, permissions]) => (
                  <div key={category} className="mb-8">
                    <h4 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                      <Settings className="w-5 h-5 text-gray-600" />
                      {category}
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {permissions.map(permission => {
                        const isSelected = selectedRole.permissions.includes(permission.id)
                        return (
                          <div
                            key={permission.id}
                            className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                              isSelected 
                                ? 'border-green-500 bg-green-50' 
                                : 'border-gray-200 hover:border-gray-300'
                            }`}
                            onClick={() => {
                              const newPermissions = isSelected
                                ? selectedRole.permissions.filter(p => p !== permission.id)
                                : [...selectedRole.permissions, permission.id]
                              handleUpdatePermissions(newPermissions)
                            }}
                          >
                            <div className="flex items-start gap-3">
                              <div className="mt-1">
                                {isSelected ? (
                                  <Unlock className="w-5 h-5 text-green-600" />
                                ) : (
                                  <Lock className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                              <div className="flex-1">
                                <h5 className={`font-medium ${isSelected ? 'text-green-800' : 'text-gray-800'}`}>
                                  {permission.name}
                                </h5>
                                <p className={`text-sm ${isSelected ? 'text-green-600' : 'text-gray-600'}`}>
                                  {permission.description}
                                </p>
                              </div>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="p-6 border-t bg-gray-50">
                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    {selectedRole.permissions.length} permission{selectedRole.permissions.length > 1 ? 's' : ''} sélectionnée{selectedRole.permissions.length > 1 ? 's' : ''}
                  </div>
                  <button
                    onClick={() => setShowPermissionsModal(false)}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg transition-colors"
                  >
                    Terminé
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}