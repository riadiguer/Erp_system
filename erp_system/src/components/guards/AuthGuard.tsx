'use client';
import { useAuth } from '@/providers/auth-provider';
import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';


export default function AuthGuard({ children }: { children: React.ReactNode }) {
const { user, loading } = useAuth();
const router = useRouter();
const pathname = usePathname();


useEffect(() => {
if (!loading && !user) router.replace(`/login?next=${encodeURIComponent(pathname || '/')}`);
}, [loading, user, router, pathname]);


if (loading) return <div className="w-full h-[60vh] grid place-items-center">Loading…</div>;
if (!user) return null; // while redirecting
return <>{children}</>;
}