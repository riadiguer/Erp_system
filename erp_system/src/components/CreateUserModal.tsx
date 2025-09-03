import { useState } from 'react'
import { X, User, Mail, Phone, Lock, Shield, Globe } from 'lucide-react'

export default function CreateUserModal({ open, onClose, onCreate }: { open: boolean, onClose: () => void, onCreate: (user: any) => void }) {
  const [form, setForm] = useState({
    username: '', 
    email: '', 
    phone: '', 
    password: '', 
    roles: [], 
    sites: []
  })

  const [isLoading, setIsLoading] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setForm({ ...form, [name]: value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    onCreate(form)
    setIsLoading(false)
    onClose()
    
    // Reset form
    setForm({
      username: '', 
      email: '', 
      phone: '', 
      password: '', 
      roles: [], 
      sites: []
    })
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-100">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Nouvel utilisateur</h2>
              <p className="text-sm text-gray-500">Créer un nouveau compte utilisateur</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-gray-100 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4 text-gray-500" />
          </button>
        </div>

        {/* Form */}
        <div className="p-6 space-y-4">
          {/* Username */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <User className="w-4 h-4" />
              Nom d'utilisateur
            </label>
            <input 
              name="username" 
              placeholder="Entrez le nom d'utilisateur" 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              onChange={handleChange} 
              value={form.username}
              required 
            />
          </div>

          {/* Email */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Mail className="w-4 h-4" />
              Email
            </label>
            <input 
              name="email" 
              placeholder="utilisateur@exemple.com" 
              type="email" 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              onChange={handleChange} 
              value={form.email}
              required 
            />
          </div>

          {/* Phone */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Phone className="w-4 h-4" />
              Téléphone
            </label>
            <input 
              name="phone" 
              placeholder="+33 6 12 34 56 78" 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              onChange={handleChange} 
              value={form.phone}
            />
          </div>

          {/* Password */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Mot de passe
            </label>
            <input 
              name="password" 
              placeholder="Mot de passe sécurisé" 
              type="password" 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all" 
              onChange={handleChange} 
              value={form.password}
              required 
            />
          </div>

          {/* Role Selection (placeholder) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Rôle
            </label>
            <select 
              name="role" 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Sélectionner un rôle</option>
              <option value="admin">Administrateur</option>
              <option value="user">Utilisateur</option>
              <option value="moderator">Modérateur</option>
            </select>
          </div>

          {/* Site Selection (placeholder) */}
          <div className="space-y-1">
            <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
              <Globe className="w-4 h-4" />
              Site
            </label>
            <select 
              name="site" 
              className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
            >
              <option value="">Sélectionner un site</option>
              <option value="main">Site principal</option>
              <option value="blog">Blog</option>
              <option value="shop">Boutique</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-3">
            <button 
              type="button" 
              className="flex-1 px-4 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors font-medium" 
              onClick={onClose}
              disabled={isLoading}
            >
              Annuler
            </button>
            <button 
              type="button" 
              onClick={handleSubmit}
              className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-medium shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Création...
                </>
              ) : (
                'Créer l\'utilisateur'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}