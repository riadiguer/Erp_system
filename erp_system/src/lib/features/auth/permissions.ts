import type { User } from './types';


export function hasPermission(user: User | null, needed: string | string[]): boolean {
if (!user) return false;
const need = Array.isArray(needed) ? needed : [needed];
const granted = new Set([...(user.permissions || []), ...(user.roles || [])]);
return need.every((n) => granted.has(n));
}