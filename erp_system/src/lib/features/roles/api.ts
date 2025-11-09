// lib/api/features/roles/api.ts
import { apiFetch } from '@/lib/api/client';

export type Permission = {
  id: number;
  name: string;
  description: string;
};

export type Role = {
  id: number;
  name: string;
  permissions: Permission[];
  user_count: number;
};

export type GroupedPermissions = {
  [category: string]: Permission[];
};

export const RolesApi = {
  // Get all roles
  list: () => apiFetch<Role[]>('/admin/roles/'),

  // Get a specific role
  get: (id: number) => apiFetch<Role>(`/admin/roles/${id}/`),

  // Create a new role
  create: (data: { name: string; permissions: string[] }) =>
    apiFetch<Role>('/admin/roles/', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  // Update a role
  update: (id: number, data: { name?: string; permissions?: string[] }) =>
    apiFetch<Role>(`/admin/roles/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data)
    }),

  // Delete a role
  delete: (id: number) =>
    apiFetch<{ ok: true }>(`/admin/roles/${id}/`, {
      method: 'DELETE'
    }),

  // Get all available permissions grouped by category
  getAvailablePermissions: () => apiFetch<GroupedPermissions>('/admin/permissions/')
};