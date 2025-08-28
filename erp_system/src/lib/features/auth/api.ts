import { apiFetch } from '@/lib/api/client';
import type { User } from './types';


export type LoginDto = { email?: string; username?: string; password: string };



export type ForgotPasswordDto = { email: string };
export type ResetPasswordDto = {
  uid: string;      // backend-provided UID (from email link)
  token: string;    // backend-provided token (from email link)
  new_password: string;
};

export const AuthApi = {
  me: () => apiFetch<User>('/auth/me/'),
  login: (payload: LoginDto) =>
    apiFetch<{ ok: true }>('/auth/token/', { method: 'POST', body: JSON.stringify(payload) }),

  logout: () => apiFetch<{ ok: true }>('/auth/logout/', { method: 'POST' }),

   forgotPassword: (payload: ForgotPasswordDto) =>
    apiFetch<{ ok: true }>('/auth/password/reset/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  resetPassword: (payload: ResetPasswordDto) =>
    apiFetch<{ ok: true }>('/auth/password/reset/confirm/', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
};