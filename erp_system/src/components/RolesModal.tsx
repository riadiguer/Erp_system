'use client'
import { useState, useEffect } from 'react'
import { X, Shield, Plus, Trash2, Users, Check, ChevronDown, ChevronRight } from 'lucide-react'
import { RolesApi, type Role, type GroupedPermissions } from '@/lib/features/roles/api'

interface ApiError {
  detail?: string
}

export default function RolesModal({ 
  open, 
  onClose,
  initialRole
}: { 
  open: boolean
  onClose: () => void
  initialRole?: Role | null
}) {
  const [roles, setRoles] = useState<Role[]>([])
  const [availablePermissions, setAvailablePermissions] = useState<GroupedPermissions>({})
  const [loading, setLoading] = useState(true)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    permissions: [] as string[]
  })

  useEffect(() => {
    if (open) {
      fetchData()
    }
  }, [open])

  useEffect(() => {
    if (open && initialRole) {
      // Wait for data to be fetched first
      if (!loading && roles.length > 0) {
        handleEditRole(initialRole)
      }
    } else if (open && !initialRole) {
      resetForm()
    }
  }, [open, initialRole, loading, roles])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [rolesData, permsData] = await Promise.all([
        RolesApi.list(),
        RolesApi.getAvailablePermissions()
      ])
      setRoles(rolesData)
      setAvailablePermissions(permsData)
      // Expand all categories by default
      setExpandedCategories(new Set(Object.keys(permsData)))
    } catch (err) {
      console.error('Error fetching roles data:', err)
      alert('Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateRole = async () => {
    if (!formData.name.trim()) {
      alert('Role name is required')
      return
    }

    try {
      await RolesApi.create(formData)
      await fetchData()
      resetForm()
      setShowCreateForm(false)
    } catch (err) {
      const error = err as ApiError
      alert(error?.detail || 'Failed to create role')
    }
  }

  const handleUpdateRole = async () => {
    if (!editingRole) return

    try {
      await RolesApi.update(editingRole.id, formData)
      await fetchData()
      resetForm()
      setEditingRole(null)
    } catch (err) {
      const error = err as ApiError
      alert(error?.detail || 'Failed to update role')
    }
  }

  const handleDeleteRole = async (role: Role) => {
    if (role.user_count > 0) {
      alert(`Cannot delete role "${role.name}" because it has ${role.user_count} assigned user(s)`)
      return
    }

    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return
    }

    try {
      await RolesApi.delete(role.id)
      await fetchData()
    } catch (err) {
      const error = err as ApiError
      alert(error?.detail || 'Failed to delete role')
    }
  }

  const handleEditRole = (role: Role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      permissions: role.permissions.map(p => p.name)
    })
    setShowCreateForm(false)
  }

  const resetForm = () => {
    setFormData({ name: '', permissions: [] })
    setEditingRole(null)
    setShowCreateForm(false)
  }

  const togglePermission = (permName: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(permName)
        ? prev.permissions.filter(p => p !== permName)
        : [...prev.permissions, permName]
    }))
  }

  const toggleCategory = (category: string) => {
    setExpandedCategories(prev => {
      const next = new Set(prev)
      if (next.has(category)) {
        next.delete(category)
      } else {
        next.add(category)
      }
      return next
    })
  }

  const selectAllInCategory = (category: string) => {
    const categoryPerms = availablePermissions[category]?.map(p => p.name) || []
    setFormData(prev => ({
      ...prev,
      permissions: [...new Set([...prev.permissions, ...categoryPerms])]
    }))
  }

  const deselectAllInCategory = (category: string) => {
    const categoryPerms = new Set(availablePermissions[category]?.map(p => p.name) || [])
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.filter(p => !categoryPerms.has(p))
    }))
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">Gestion des Rôles</h2>
              <p className="text-white/80 text-sm">Gérer les rôles et leurs permissions</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-10 h-10 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5 text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden flex">
          {/* Left: Roles List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Rôles ({roles.length})</h3>
              <button
                onClick={() => {
                  resetForm()
                  setShowCreateForm(true)
                }}
                className="flex items-center gap-2 px-3 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors text-sm"
              >
                <Plus size={16} />
                Nouveau
              </button>
            </div>

            {loading ? (
              <div className="space-y-3">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            ) : (
              <div className="space-y-2">
                {roles.map((role) => (
                  <div
                    key={role.id}
                    className={`p-4 rounded-lg border-2 transition-all cursor-pointer ${
                      editingRole?.id === role.id
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                    }`}
                    onClick={() => handleEditRole(role)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900">{role.name}</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {role.permissions.length} permission(s)
                        </p>
                        <div className="flex items-center gap-1 mt-2 text-xs text-gray-500">
                          <Users size={12} />
                          <span>{role.user_count} utilisateur(s)</span>
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleDeleteRole(role)
                        }}
                        className="p-2 hover:bg-red-100 rounded-lg transition-colors"
                        disabled={role.user_count > 0}
                      >
                        <Trash2 size={16} className={role.user_count > 0 ? 'text-gray-400' : 'text-red-600'} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Role Editor */}
          <div className="flex-1 overflow-y-auto p-6">
            {!showCreateForm && !editingRole ? (
              <div className="h-full flex items-center justify-center text-gray-400">
                <div className="text-center">
                  <Shield size={48} className="mx-auto mb-4 opacity-50" />
                  <p>Sélectionnez un rôle ou créez-en un nouveau</p>
                </div>
              </div>
            ) : (
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-6">
                  {editingRole ? `Modifier: ${editingRole.name}` : 'Nouveau Rôle'}
                </h3>

                {/* Role Name */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom du rôle *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ex: Manager, Vendeur, etc."
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  />
                </div>

                {/* Permissions */}
                <div>
                  <h4 className="text-lg font-semibold text-gray-900 mb-4">
                    Permissions ({formData.permissions.length} sélectionnée(s))
                  </h4>

                  <div className="space-y-4">
                    {Object.entries(availablePermissions).map(([category, perms]) => {
                      const isExpanded = expandedCategories.has(category)
                      const categoryPerms = perms.map(p => p.name)
                      const selectedCount = categoryPerms.filter(p => formData.permissions.includes(p)).length

                      return (
                        <div key={category} className="border border-gray-200 rounded-lg overflow-hidden">
                          <div className="bg-gray-50 p-3 flex items-center justify-between">
                            <button
                              onClick={() => toggleCategory(category)}
                              className="flex items-center gap-2 text-left flex-1"
                            >
                              {isExpanded ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                              <span className="font-semibold text-gray-900">{category}</span>
                              <span className="text-sm text-gray-600">
                                ({selectedCount}/{perms.length})
                              </span>
                            </button>
                            <div className="flex gap-2">
                              <button
                                onClick={() => selectAllInCategory(category)}
                                className="text-xs px-2 py-1 bg-indigo-100 text-indigo-700 rounded hover:bg-indigo-200"
                              >
                                Tout
                              </button>
                              <button
                                onClick={() => deselectAllInCategory(category)}
                                className="text-xs px-2 py-1 bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                              >
                                Aucun
                              </button>
                            </div>
                          </div>

                          {isExpanded && (
                            <div className="p-3 space-y-2">
                              {perms.map((perm) => (
                                <label
                                  key={perm.id}
                                  className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={formData.permissions.includes(perm.name)}
                                    onChange={() => togglePermission(perm.name)}
                                    className="w-4 h-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                                  />
                                  <div>
                                    <div className="text-sm font-medium text-gray-900">{perm.name}</div>
                                    <div className="text-xs text-gray-500">{perm.description}</div>
                                  </div>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 mt-6 pt-6 border-t border-gray-200">
                  <button
                    onClick={resetForm}
                    className="flex-1 px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={editingRole ? handleUpdateRole : handleCreateRole}
                    className="flex-1 px-4 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <Check size={18} />
                    {editingRole ? 'Mettre à jour' : 'Créer le rôle'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}