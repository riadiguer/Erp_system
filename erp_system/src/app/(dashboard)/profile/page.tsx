'use client';

import { useAuth } from '@/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { 
  Edit3, 
  Mail, 
  Phone, 
  ShieldCheck, 
  ArrowLeft, 
  User, 
  Building2, 
  Calendar,
  MapPin,
  Award,
  Settings
} from 'lucide-react';

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-blue-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Chargement de votre profil...</p>
        </div>
      </div>
    );
  }

  const InfoCard = ({ 
    icon: Icon, 
    label, 
    value, 
    color 
  }: {
    icon: any;
    label: string;
    value: string;
    color: string;
  }) => (
    <div className="group bg-white rounded-xl border border-gray-200 p-4 hover:shadow-lg transition-all duration-200 hover:scale-105">
      <div className="flex items-center space-x-3">
        <div className={`p-2.5 ${color.replace('text-', 'bg-').replace('600', '100')} rounded-lg group-hover:scale-110 transition-transform duration-200`}>
          <Icon className={`w-5 h-5 ${color}`} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-0.5">
            {label}
          </p>
          <p className="text-sm font-bold text-gray-900 truncate">
            {value || '—'}
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-gray-50 p-6">
      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/5 to-purple-600/5 rounded-3xl blur-3xl"></div>
          
          <div className="relative bg-white/80 backdrop-blur-sm rounded-2xl border border-gray-200 shadow-xl p-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-2">
                  Mon Profil
                </h1>
                <p className="text-lg text-gray-600">
                  Gérez vos informations personnelles et paramètres
                </p>
              </div>
              
              <button
                onClick={() => router.back()}
                className="flex items-center space-x-2 px-5 py-2.5 bg-white border-2 border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-all duration-200 hover:scale-105"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Retour</span>
              </button>
            </div>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
          {/* Header with gradient */}
          <div className="relative h-32 bg-gradient-to-r from-blue-600 via-blue-700 to-purple-600 overflow-hidden">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjA3IiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>
          </div>

          {/* Profile content */}
          <div className="px-8 pb-8">
            {/* Avatar and main info */}
            <div className="flex items-end justify-between -mt-16 mb-6">
              <div className="flex items-end space-x-4">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl shadow-2xl flex items-center justify-center text-white text-4xl font-black border-4 border-white">
                    {user.first_name?.[0]}{user.last_name?.[0]}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-green-500 rounded-full border-4 border-white flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-white" />
                  </div>
                </div>
                
                <div className="pb-4">
                  <h2 className="text-3xl font-black text-gray-900 mb-1">
                    {user.first_name} {user.last_name}
                  </h2>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-blue-600" />
                    <p className="text-sm font-semibold text-blue-600">
                      {user.roles?.join(', ') || 'Utilisateur'}
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={() => router.push('/settings/profile')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl font-bold shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 mb-4"
              >
                <Edit3 className="w-4 h-4" />
                <span>Modifier</span>
              </button>
            </div>

            {/* Info Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <InfoCard
                icon={Mail}
                label="Email"
                value={user.email}
                color="text-blue-600"
              />
              <InfoCard
                icon={Phone}
                label="Téléphone"
                value={user.phone}
                color="text-green-600"
              />
              <InfoCard
                icon={ShieldCheck}
                label="Rôles"
                value={user.roles?.join(', ') || 'Aucun rôle'}
                color="text-purple-600"
              />
            </div>

            {/* Additional Info */}
            <div className="bg-gradient-to-br from-gray-50 to-blue-50/20 rounded-xl p-6 border border-gray-200">
              <h3 className="text-base font-bold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="w-5 h-5 text-blue-600" />
                <span>Informations supplémentaires</span>
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-start space-x-3">
                  <Building2 className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Entreprise</p>
                    <p className="text-sm font-semibold text-gray-900">ERP System DZ</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Calendar className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Membre depuis</p>
                    <p className="text-sm font-semibold text-gray-900">Janvier 2025</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <MapPin className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Localisation</p>
                    <p className="text-sm font-semibold text-gray-900">Alger, Algérie</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <Settings className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div>
                    <p className="text-xs font-semibold text-gray-500 uppercase mb-1">Statut</p>
                    <div className="flex items-center space-x-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                      <p className="text-sm font-semibold text-green-700">Actif</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-blue-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <Settings className="w-5 h-5 text-blue-600" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Paramètres</h4>
            </div>
            <p className="text-sm text-gray-600">Gérez vos préférences</p>
          </button>

          <button className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-green-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <ShieldCheck className="w-5 h-5 text-green-600" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Sécurité</h4>
            </div>
            <p className="text-sm text-gray-600">Mot de passe et 2FA</p>
          </button>

          <button className="bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-all duration-200 hover:scale-105 text-left group">
            <div className="flex items-center space-x-3 mb-3">
              <div className="p-2 bg-purple-100 rounded-lg group-hover:scale-110 transition-transform duration-200">
                <Mail className="w-5 h-5 text-purple-600" />
              </div>
              <h4 className="text-base font-bold text-gray-900">Notifications</h4>
            </div>
            <p className="text-sm text-gray-600">Alertes et emails</p>
          </button>
        </div>

      </div>
    </div>
  );
}