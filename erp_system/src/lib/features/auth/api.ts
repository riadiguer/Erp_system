import { apiFetch } from '@/lib/api/client';
import type { User } from './types';


export type LoginDto = { email?: string; username?: string; password: string };

export type RegisterDto = {
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  username?: string; // optional if you use email login
};

export const AuthApi = {
  me: () => apiFetch<User>('/auth/me/'),
  login: (payload: LoginDto) =>
    apiFetch<{ ok: true }>('/auth/token/', { method: 'POST', body: JSON.stringify(payload) }),
  logout: () => apiFetch<{ ok: true }>('/auth/logout/', { method: 'POST' }),
  register: (payload: RegisterDto) =>
    apiFetch<{ ok: true }>('/auth/register/', { method: 'POST', body: JSON.stringify(payload) }),
};