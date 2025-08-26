import AuthGuard from '@/components/guards/AuthGuard';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
return (
<AuthGuard>
<div className="min-h-screen flex">
{/* Sidebar */}
<aside className="w-64 border-r p-4 hidden md:block">ERP Menu</aside>
{/* Content */}
<main className="flex-1 p-4">{children}</main>
</div>
</AuthGuard>
);
}