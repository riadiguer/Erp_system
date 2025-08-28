'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { AuthApi } from '@/lib/features/auth/api';
import { useState } from 'react';
import { Lock, Eye, EyeOff, CheckCircle, Loader2, ArrowLeft, Shield } from 'lucide-react';

const schema = z.object({
  password: z.string().min(8, 'Minimum 8 characters'),
  confirm: z.string().min(8),
}).refine(v => v.password === v.confirm, { path: ['confirm'], message: 'Passwords do not match' });

type FormValues = z.infer<typeof schema>;

export default function ResetPasswordPage() {
  const params = useSearchParams();
  const router = useRouter();
  const uid = params.get('uid') || '';
  const token = params.get('token') || '';
  const [done, setDone] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      setError('');
      await AuthApi.resetPassword({ uid, token, new_password: data.password });
      setDone(true);
      setTimeout(() => router.replace('/login'), 2000);
    } catch (e: any) {
      setError(e?.detail || 'Reset failed. The link may be invalid or expired.');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-100 p-4">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23f1f5f9\' fill-opacity=\'0.4\'%3E%3Cpath d=\'m36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>
      
      <div className="relative w-full max-w-md">
        {/* Glass card effect */}
        <div className="absolute inset-0 bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 to-transparent rounded-3xl"></div>
        
        <div className="relative p-8 space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Set New Password
            </h1>
            <p className="text-slate-600">
              Choose a strong password to secure your account.
            </p>
          </div>

          {done ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-800">Password Updated!</h2>
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  Your password has been successfully updated.
                  <br />
                  Redirecting you to login...
                </div>
              </div>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* New Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  New Password
                </label>
                <div className="relative">
                  <input
                    {...register('password')}
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your new password"
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.password.message}
                  </p>
                )}
              </div>

              {/* Confirm Password Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    {...register('confirm')}
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Confirm your new password"
                    className="w-full px-4 py-3 pr-12 border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirm(!showConfirm)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors"
                  >
                    {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirm && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.confirm.message}
                  </p>
                )}
              </div>

              {/* Password Requirements */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm">
                <h3 className="font-medium text-slate-800 mb-2">Password Requirements:</h3>
                <ul className="text-slate-600 space-y-1">
                  <li>• At least 8 characters long</li>
                  <li>• Use a mix of letters, numbers, and symbols</li>
                  <li>• Avoid common passwords</li>
                </ul>
              </div>

              {/* Error Message */}
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm">
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <button
                disabled={isSubmitting}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Saving new password...
                  </span>
                ) : (
                  'Save New Password'
                )}
              </button>
            </form>
          )}

          {/* Back to login link */}
          <div className="text-center">
            <a 
              href="/login" 
              className="inline-flex items-center gap-2 text-sm text-slate-600 hover:text-slate-800 transition-colors underline"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to login
            </a>
          </div>

          {/* Footer */}
          <div className="pt-4 border-t border-slate-200">
            <div className="text-xs text-slate-500 bg-slate-50 rounded-lg p-3">
              <div className="flex items-center gap-1 mb-1">
                <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                <span className="font-medium">Secure Connection</span>
              </div>
              <p>Your password is encrypted and stored securely</p>
              <p>You'll be automatically signed out of other devices</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}