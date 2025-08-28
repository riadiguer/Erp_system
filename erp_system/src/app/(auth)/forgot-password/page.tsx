'use client';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useState } from 'react';
import { AuthApi } from '@/lib/features/auth/api';
import { Mail, ArrowLeft, CheckCircle, Loader2, Key } from 'lucide-react';

const schema = z.object({ email: z.string().email('Invalid email') });
type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } =
    useForm<FormValues>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormValues) => {
    try {
      setError('');
      await AuthApi.forgotPassword(data);
      setSent(true);
    } catch (e: any) {
      setError(e?.detail || 'Could not send reset email. Please try again.');
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
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-orange-500 to-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg">
              <Key className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent">
              Forgot Password?
            </h1>
            <p className="text-slate-600">
              No worries! Enter your email and we'll send you a reset link.
            </p>
          </div>

          {sent ? (
            /* Success state */
            <div className="text-center space-y-4">
              <div className="mx-auto w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center shadow-lg">
                <CheckCircle className="w-8 h-8 text-white" />
              </div>
              <div className="space-y-2">
                <h2 className="text-xl font-semibold text-slate-800">Check your email</h2>
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm">
                  If an account exists for that email, a reset link has been sent.
                  Check your inbox and spam folder.
                </div>
              </div>
            </div>
          ) : (
            /* Form state */
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-semibold text-slate-700 flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <div className="relative">
                  <input
                    {...register('email')}
                    type="email"
                    placeholder="you@company.com"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all duration-200 bg-white/50 backdrop-blur-sm hover:bg-white/70"
                  />
                  <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-slate-400" />
                  </div>
                </div>
                {errors.email && (
                  <p className="text-sm text-red-500 flex items-center gap-1 mt-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.email.message}
                  </p>
                )}
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
                className="w-full bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-semibold py-3 px-4 rounded-xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                {isSubmitting ? (
                  <span className="flex items-center justify-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Sending reset link...
                  </span>
                ) : (
                  'Send reset link'
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
              <p>Reset links are valid for 24 hours</p>
              <p>Check your spam folder if you don't see the email</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}