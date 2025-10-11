import React from 'react'
import { useState } from 'react'
import { User, Mail, Phone, X, Shield, Trash2, Check, AlertTriangle, Edit3, Crown, Eye, EyeOff } from 'lucide-react'

export default function UserDetailsModal({ open, onClose, user, onUpdate, allRoles }: {
  open: boolean, 
  onClose: () => void,
  user: any,
  onUpdate: (user: any) => void
  allRoles: { id: number, name: string }[]
}) {
  const [form, setForm] = useState(user || {})
  const [isLoading, setIsLoading] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  React.useEffect(() => {
    setForm(user || {})
  }, [user, open])

  if (!open || !user) return null

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async () => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 800))
    onUpdate(form)
    setIsLoading(false)
    onClose()
  }

  const handleDelete = () => {
    onUpdate({ ...form, _delete: true })
    onClose()
  }

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose()
    }
  }

  return (
    <div 
      className="fixed inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-indigo-900/20 backdrop-blur-md flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden border border-white/20 flex flex-col">
        {/* Animated Header */}
        <div className="relative bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 pt-4 pb-20 px-8 overflow-hidden">
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-white/10 rounded-full blur-3xl"></div>
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-pink-300/20 rounded-full blur-2xl"></div>
          
          <button
            onClick={onClose}
            className="absolute top-6 right-6 p-3 rounded-2xl bg-white/10 hover:bg-white/20 transition-all duration-300 group backdrop-blur-sm"
          >
            <X size={20} className="text-white group-hover:rotate-90 transition-transform duration-300" />
          </button>

          <div className="relative flex items-start space-x-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-white/20 to-white/10 rounded-3xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                <User size={36} className="text-white" />
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-green-400 rounded-full flex items-center justify-center shadow-lg">
                <Check size={14} className="text-white" />
              </div>
            </div>
            
            <div className="flex-1 text-white">
              <div className="flex items-center space-x-3 mb-2">
                <h1 className="text-3xl font-bold">{form.username || 'Utilisateur'}</h1>
                <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${
                  form.status === 'actif' 
                    ? 'bg-green-400/20 text-green-100 border-green-400/30' 
                    : 'bg-red-400/20 text-red-100 border-red-400/30'
                }`}>
                  {form.status === 'actif' ? 'ACTIF' : 'SUSPENDU'}
                </div>
              </div>
              <p className="text-white/80 text-lg mb-4">{form.email}</p>
              
              <div className="flex flex-wrap gap-2">
                {form.roles && form.roles.map((role: string, index: number) => (
                  <span key={index} className="px-3 py-1 bg-white/15 rounded-full text-sm font-medium text-white/90 backdrop-blur-sm border border-white/10">
                    {role}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* Left Column - Personal Information */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                  <Edit3 size={18} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Informations personnelles</h2>
              </div>

              <div className="space-y-6">
                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Nom d'utilisateur
                  </label>
                  <div className="relative">
                    <User size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="username"
                      value={form.username || ''}
                      placeholder="Nom d'utilisateur"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white transition-all duration-300 outline-none text-gray-900 placeholder-gray-400"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Adresse email
                  </label>
                  <div className="relative">
                    <Mail size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="email"
                      value={form.email || ''}
                      placeholder="exemple@email.com"
                      type="email"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white transition-all duration-300 outline-none text-gray-900 placeholder-gray-400"
                      onChange={handleChange}
                    />
                  </div>
                </div>

                <div className="group">
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">
                    Numéro de téléphone
                  </label>
                  <div className="relative">
                    <Phone size={18} className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      name="phone"
                      value={form.phone || ''}
                      placeholder="+33 6 12 34 56 78"
                      type="tel"
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-400 focus:bg-white transition-all duration-300 outline-none text-gray-900 placeholder-gray-400"
                      onChange={handleChange}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Roles & Permissions */}
            <div className="space-y-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl flex items-center justify-center">
                  <Crown size={18} className="text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Rôles & Permissions</h2>
              </div>

              <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 border border-purple-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Rôles assignés</h3>
                
                <div className="flex flex-wrap gap-3 mb-6 min-h-[60px] items-start">
                  {form.roles && form.roles.length > 0 ? (
                    form.roles.map((role: string, index: number) => (
                      <div
                        key={index}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow-sm border border-purple-200 group hover:shadow-md transition-all duration-200"
                      >
                        <Shield size={14} className="text-purple-600" />
                        <span className="text-gray-800 font-medium">{role}</span>
                        <button
                          type="button"
                          className="p-1 rounded-full hover:bg-red-100 transition-colors group-hover:opacity-100 opacity-60"
                          onClick={() => setForm((f: { roles: any[] }) => ({
                            ...f,
                            roles: f.roles.filter((_: string, i: number) => i !== index)
                          }))}
                        >
                          <X size={12} className="text-red-500" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center justify-center w-full h-16 border-2 border-dashed border-purple-200 rounded-xl">
                      <span className="text-purple-400 italic">Aucun rôle assigné</span>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-semibold text-gray-700 block">
                    Ajouter un nouveau rôle
                  </label>
                  <select
                    className="w-full px-4 py-3 bg-white border-2 border-purple-200 rounded-xl focus:border-purple-400 transition-all duration-300 outline-none text-gray-900"
                    value=""
                    onChange={e => {
                      const value = e.target.value
                      if (value && !(form.roles || []).includes(value)) {
                        setForm((f: { roles: any }) => ({
                          ...f,
                          roles: [...(f.roles || []), value]
                        }))
                      }
                    }}
                  >
                    <option value="">Sélectionner un rôle...</option>
                    {allRoles
                      .filter(role => !(form.roles || []).includes(role.name))
                      .map(role => (
                        <option key={role.id} value={role.name}>{role.name}</option>
                      ))}
                  </select>
                </div>
              </div>

              {/* Account Status */}
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-6 border border-blue-100">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center space-x-2">
                  <Eye size={18} className="text-blue-600" />
                  <span>Statut du compte</span>
                </h3>
                
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      form.status === 'actif' 
                        ? 'bg-green-500 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-green-600 border-2 border-green-200 hover:bg-green-50 hover:border-green-300'
                    }`}
                    onClick={() => setForm((f: any) => ({ ...f, status: 'actif' }))}
                  >
                    <Check size={16} />
                    <span>Activer</span>
                  </button>
                  <button
                    type="button"
                    className={`px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center space-x-2 ${
                      form.status === 'suspendu' 
                        ? 'bg-red-500 text-white shadow-lg transform scale-105' 
                        : 'bg-white text-red-600 border-2 border-red-200 hover:bg-red-50 hover:border-red-300'
                    }`}
                    onClick={() => {
                      if (window.confirm("Voulez-vous suspendre cet utilisateur ?")) {
                        setForm((f: any) => ({ ...f, status: 'suspendu' }))
                      }
                    }}
                  >
                    <EyeOff size={16} />
                    <span>Suspendre</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Danger Zone */}
          <div className="mt-8 bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-6 border-2 border-red-100">
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-xl flex items-center justify-center">
                <AlertTriangle size={18} className="text-white" />
              </div>
              <h3 className="text-xl font-bold text-red-800">Zone de danger</h3>
            </div>
            
            <p className="text-red-700 mb-6">
              Cette action supprimera définitivement l'utilisateur et toutes ses données associées. Cette action est irréversible.
            </p>
            
            {!showDeleteConfirm ? (
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(true)}
                className="px-6 py-3 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-all duration-300 font-semibold flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Trash2 size={16} />
                <span>Supprimer l'utilisateur</span>
              </button>
            ) : (
              <div className="flex items-center space-x-4">
                <span className="text-red-800 font-semibold">Êtes-vous absolument sûr ?</span>
                <button
                  onClick={handleDelete}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium"
                >
                  Oui, supprimer
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                >
                  Annuler
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Action Footer */}
        <div className="border-t border-gray-200 bg-gradient-to-r from-gray-50 to-white p-6">
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={onClose}
              className="px-8 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-all duration-300 font-medium border-2 border-gray-200 hover:border-gray-300"
            >
              Annuler
            </button>
            <button
              type="button"
              disabled={isLoading}
              onClick={handleSubmit}
              className="px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Check size={18} />
                  <span>Enregistrer les modifications</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}