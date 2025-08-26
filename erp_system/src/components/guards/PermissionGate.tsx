'use client';
import { hasPermission } from '@/lib/features/auth/permissions';
import { useAuth } from '@/providers/auth-provider';


export function PermissionGate({ need, children }: { need: string | string[]; children: React.ReactNode }) {
const { user } = useAuth();
if (!hasPermission(user, need)) return null;
return <>{children}</>;
}