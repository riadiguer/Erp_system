'use client'
import { useEffect, useState } from 'react'
import { Search, Plus, MoreVertical, Users, Mail, Phone, Shield, Globe, Clock } from 'lucide-react'
import CreateUserModal from '@/components/CreateUserModal'
import UserDetailsModal from '@/components/UserDetailsModal'
import RolesModal from '@/components/RolesModal'
import { apiFetch } from '@/lib/api/client'
import { RolesApi, type Role } from '@/lib/features/roles/api'

type User = {
  id: number
  username: string
  email: string
  first_name?: string
  last_name?: string
  phone?: string
  roles: string[]
  permissions?: string[]
  sites?: string[]
  status?: string
  last_login?: string
  avatar?: string
}

type ApiError = {
  detail?: string
  message?: string
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUsers, setSelectedUsers] = useState<number[]>([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [detailsOpen, setDetailsOpen] = useState(false)
  const [rolesModalOpen, setRolesModalOpen] = useState(false)

  // Fetch users and roles from backend
  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)
      const data = await apiFetch<User[]>('/admin/users/')
      setUsers(data)
    } catch (err) {
      console.error('Error fetching users:', err)
      const apiError = err as ApiError
      setError(apiError?.detail || 'Failed to load users')
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const data = await RolesApi.list()
      setRoles(data)
    } catch (err) {
      console.error('Error fetching roles:', err)
    }
  }

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || user.status === statusFilter
    const matchesRole = roleFilter === 'all' || user.roles.includes(roleFilter)
    return matchesSearch && matchesStatus && matchesRole
  })

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin': return 'bg-purple-100 text-purple-800'
      case 'manager': return 'bg-blue-100 text-blue-800'
      case 'moderator': return 'bg-orange-100 text-orange-800'
      case 'user': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const handleSelectUser = (userId: number) => {
    setSelectedUsers(prev => 
      prev.includes(userId) 
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSelectAll = () => {
    setSelectedUsers(
      selectedUsers.length === filteredUsers.length 
        ? [] 
        : filteredUsers.map(u => u.id)
    )
  }

  const handleCreateUser = async (userData: Record<string, unknown>) => {
    try {
      const response = await apiFetch('/admin/users/', {
        method: 'POST',
        body: JSON.stringify(userData)
      })
      console.log('User created successfully:', response)
      await fetchUsers()
      setModalOpen(false)
    } catch (err) {
      console.error('Error creating user:', err)
      const apiError = err as ApiError
      const errorMessage = apiError?.detail || apiError?.message || JSON.stringify(err) || 'Failed to create user'
      alert(`Error: ${errorMessage}`)
      throw err
    }
  }

  const handleUpdateUser = async (updatedUser: User & { _delete?: boolean }) => {
    console.log('handleUpdateUser called with:', updatedUser)
    
    if (updatedUser._delete) {
      try {
        console.log('Deleting user:', updatedUser.id)
        await apiFetch(`/admin/users/${updatedUser.id}/`, {
          method: 'DELETE'
        })
        setUsers(prev => prev.filter(user => user.id !== updatedUser.id))
        setDetailsOpen(false)
      } catch (err) {
        console.error('Error deleting user:', err)
        const apiError = err as ApiError
        alert(apiError?.detail || 'Failed to delete user')
        throw err
      }
    } else {
      try {
        console.log('Updating user with payload:', updatedUser)
        const response = await apiFetch<User>(`/admin/users/${updatedUser.id}/`, {
          method: 'PATCH',
          body: JSON.stringify(updatedUser)
        })
        console.log('Update response:', response)
        await fetchUsers()
        setDetailsOpen(false)
      } catch (err) {
        console.error('Error updating user:', err)
        const apiError = err as ApiError
        const errorMsg = apiError?.detail || apiError?.message || 'Failed to update user'
        alert(errorMsg)
        throw err
      }
    }
  }

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-10 bg-gray-200 rounded"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
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
                <Users className="text-blue-600" size={32} />
                Gestion des Utilisateurs
              </h1>
              <p className="text-gray-600 mt-1">Gérez les comptes utilisateurs et leurs permissions</p>
            </div>
            <div className="flex gap-3">
              <button
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setRolesModalOpen(true)}
              >
                <Shield size={18} />
                Gérer les rôles
              </button>
              <button 
                onClick={() => setModalOpen(true)} 
                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
              >
                <Plus size={18} />
                Nouvel utilisateur
              </button>
            </div>
          </div>
        </div>

        {/* Filters and Search */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par nom ou email..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les statuts</option>
                <option value="actif">Actif</option>
                <option value="suspendu">Suspendu</option>
                <option value="inactif">Inactif</option>
              </select>
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Tous les rôles</option>
                {roles.map(role => (
                  <option key={role.id} value={role.name}>{role.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Utilisateurs</p>
                <p className="text-2xl font-bold text-gray-900">{users.length}</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-lg">
                <Users className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Actifs</p>
                <p className="text-2xl font-bold text-green-600">
                  {users.filter(u => u.status === 'actif').length}
                </p>
              </div>
              <div className="bg-green-100 p-3 rounded-lg">
                <Shield className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Suspendus</p>
                <p className="text-2xl font-bold text-red-600">
                  {users.filter(u => u.status === 'suspendu').length}
                </p>
              </div>
              <div className="bg-red-100 p-3 rounded-lg">
                <Clock className="text-red-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Administrateurs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {users.filter(u => u.roles.includes('admin')).length}
                </p>
              </div>
              <div className="bg-purple-100 p-3 rounded-lg">
                <Globe className="text-purple-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold text-gray-900">
                Liste des Utilisateurs ({filteredUsers.length})
              </h2>
              {selectedUsers.length > 0 && (
                <div className="flex items-center gap-3">
                  <span className="text-sm text-gray-600">
                    {selectedUsers.length} sélectionné(s)
                  </span>
                  <button className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors">
                    Supprimer
                  </button>
                </div>
              )}
            </div>
          </div>

          {error && (
            <div className="p-4 bg-red-50 border-l-4 border-red-400">
              <p className="text-red-700">{error}</p>
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="w-12 px-6 py-4">
                    <input
                      type="checkbox"
                      checked={selectedUsers.length === filteredUsers.length && filteredUsers.length > 0}
                      onChange={handleSelectAll}
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Contact
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rôles
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sites
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dernière connexion
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <input
                        type="checkbox"
                        checked={selectedUsers.includes(user.id)}
                        onChange={() => handleSelectUser(user.id)}
                        className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center">
                          <span className="text-blue-600 font-medium text-sm">
                            {user.username.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.username}</div>
                          <div className="text-sm text-gray-500">ID: {user.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900 mb-1">
                        <Mail size={16} className="mr-2 text-gray-400" />
                        {user.email}
                      </div>
                      {user.phone && (
                        <div className="flex items-center text-sm text-gray-500">
                          <Phone size={16} className="mr-2 text-gray-400" />
                          {user.phone}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.roles.map((role) => (
                          <span
                            key={role}
                            className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getRoleColor(role)}`}
                          >
                            {role}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {user.sites?.map((site) => (
                          <span
                            key={site}
                            className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800"
                          >
                            {site}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${
                        user.status === 'actif'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {user.status === 'actif' ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {user.last_login ? new Date(user.last_login).toLocaleDateString('fr-FR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      }) : 'Jamais'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="relative inline-block">
                        <button 
                          onClick={() => { setSelectedUser(user); setDetailsOpen(true) }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <MoreVertical size={16} className="text-gray-400" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {filteredUsers.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">Aucun utilisateur trouvé</h3>
              <p className="mt-1 text-sm text-gray-500">
                Essayez de modifier vos critères de recherche.
              </p>
            </div>
          )}
        </div>
      </div>
      
      <UserDetailsModal
        open={detailsOpen}
        onClose={() => setDetailsOpen(false)}
        user={selectedUser}
        allRoles={roles.map(r => ({ id: r.id, name: r.name }))}
        onUpdate={handleUpdateUser}
      />
      
      <CreateUserModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onCreate={handleCreateUser}
      />
      
      <RolesModal 
        open={rolesModalOpen} 
        onClose={() => {
          setRolesModalOpen(false)
          fetchRoles() // Refresh roles after modal closes
        }} 
      />
    </div>
  )
}