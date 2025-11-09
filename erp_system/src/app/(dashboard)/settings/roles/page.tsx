'use client'
import { useState, useEffect } from 'react'
import { Plus, Settings, Shield, Users, Edit2, Trash2, Eye } from 'lucide-react'
import RolesModal from '@/components/RolesModal'
import { RolesApi, type Role } from '@/lib/features/roles/api'

export default function RolesPage() {
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedRole, setSelectedRole] = useState<Role | null>(null)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [roleToEdit, setRoleToEdit] = useState<Role | null>(null)

  useEffect(() => {
    fetchRoles()
  }, [])

  const fetchRoles = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await RolesApi.list()
      setRoles(data)
    } catch (err: unknown) {
      console.error('Error fetching roles:', err)
      const error = err as { detail?: string }
      setError(error?.detail || 'Failed to load roles')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (role: Role) => {
    if (role.user_count > 0) {
      alert(`Cannot delete role "${role.name}" because it has ${role.user_count} assigned user(s)`)
      return
    }

    if (!window.confirm(`Are you sure you want to delete the role "${role.name}"?`)) {
      return
    }

    try {
      await RolesApi.delete(role.id)
      await fetchRoles()
    } catch (err: unknown) {
      const error = err as { detail?: string }
      alert(error?.detail || 'Failed to delete role')
    }
  }

  const handleViewDetails = (role: Role) => {
    setSelectedRole(role)
    setShowDetailsModal(true)
  }

  const handleOpenEditModal = (role: Role) => {
    setRoleToEdit(role)
    setModalOpen(true)
  }

  const handleCloseModal = () => {
    setModalOpen(false)
    setRoleToEdit(null)
    fetchRoles()
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <Shield className="text-purple-600" size={32} />
                Gestion des Rôles
              </h1>
              <p className="text-gray-600 mt-1">Gérez les rôles et leurs permissions</p>
            </div>
            <button 
              className="flex items-center gap-2 px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors shadow-sm"
              onClick={() => {
                setRoleToEdit(null)
                setModalOpen(true)
              }}
            >
              <Plus size={18} />
              Gérer les rôles
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700">
            {error}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Rôles</p>
                <p className="text-2xl font-bold text-gray-900">{roles.length}</p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Shield className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Utilisateurs Assignés</p>
                <p className="text-2xl font-bold text-blue-600">
                  {roles.reduce((sum, role) => sum + role.user_count, 0)}
                </p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Permissions</p>
                <p className="text-2xl font-bold text-green-600">
                  {roles.reduce((sum, role) => sum + role.permissions.length, 0)}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Settings className="text-green-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Roles Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roles.map((role) => (
            <div 
              key={role.id} 
              className="bg-white rounded-lg shadow-sm border hover:shadow-md transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <Shield size={24} className="text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{role.name}</h3>
                      <p className="text-sm text-gray-500">ID: {role.id}</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Utilisateurs</span>
                    <span className="font-semibold text-gray-900 flex items-center gap-1">
                      <Users size={14} />
                      {role.user_count}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Permissions</span>
                    <span className="font-semibold text-gray-900">
                      {role.permissions.length}
                    </span>
                  </div>
                </div>

                {/* Permissions Preview */}
                {role.permissions.length > 0 && (
                  <div className="mb-4">
                    <p className="text-xs text-gray-500 mb-2">Permissions:</p>
                    <div className="flex flex-wrap gap-1">
                      {role.permissions.slice(0, 3).map((perm) => (
                        <span 
                          key={perm.id}
                          className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded"
                        >
                          {perm.name}
                        </span>
                      ))}
                      {role.permissions.length > 3 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded">
                          +{role.permissions.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleViewDetails(role)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-blue-50 text-blue-700 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Eye size={14} />
                    Détails
                  </button>
                  <button
                    onClick={() => handleOpenEditModal(role)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 text-sm bg-yellow-50 text-yellow-700 rounded-lg hover:bg-yellow-100 transition-colors"
                  >
                    <Edit2 size={14} />
                    Éditer
                  </button>
                  <button
                    onClick={() => handleDelete(role)}
                    disabled={role.user_count > 0}
                    className={`px-3 py-2 text-sm rounded-lg transition-colors ${
                      role.user_count > 0
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-red-50 text-red-700 hover:bg-red-100'
                    }`}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {roles.length === 0 && !loading && (
          <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
            <Shield size={48} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun rôle</h3>
            <p className="text-gray-600 mb-4">Commencez par créer votre premier rôle</p>
            <button
              onClick={() => {
                setRoleToEdit(null)
                setModalOpen(true)
              }}
              className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              Créer un rôle
            </button>
          </div>
        )}
      </div>

      {/* Roles Management Modal */}
      <RolesModal 
        open={modalOpen} 
        onClose={handleCloseModal}
        initialRole={roleToEdit}
      />

      {/* Role Details Modal */}
      {showDetailsModal && selectedRole && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-purple-600 to-indigo-600">
              <div className="flex items-center gap-3">
                <Shield className="text-white" size={24} />
                <h2 className="text-xl font-bold text-white">{selectedRole.name}</h2>
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="w-8 h-8 rounded-lg hover:bg-white/10 flex items-center justify-center transition-colors"
              >
                <Plus className="w-5 h-5 text-white rotate-45" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(80vh-100px)]">
              <div className="space-y-6">
                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">Informations</h3>
                  <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">ID:</span>
                      <span className="font-semibold">{selectedRole.id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Utilisateurs assignés:</span>
                      <span className="font-semibold">{selectedRole.user_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nombre de permissions:</span>
                      <span className="font-semibold">{selectedRole.permissions.length}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-gray-700 mb-2">
                    Permissions ({selectedRole.permissions.length})
                  </h3>
                  <div className="space-y-2">
                    {selectedRole.permissions.map((perm) => (
                      <div 
                        key={perm.id}
                        className="flex items-start gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100"
                      >
                        <Shield size={16} className="text-purple-600 mt-0.5" />
                        <div>
                          <div className="font-medium text-gray-900">{perm.name}</div>
                          <div className="text-sm text-gray-600">{perm.description}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 p-4 flex justify-end gap-3">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  handleOpenEditModal(selectedRole)
                }}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700"
              >
                Éditer ce rôle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}