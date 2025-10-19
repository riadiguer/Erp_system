'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { ChevronRight, Home } from 'lucide-react';
import { MENU, type MenuItem } from './menu';

type Crumb = { label: string; href: string };

// Helper: flatten MENU tree into a map { href: label }
function flattenMenu(items: MenuItem[], map: Record<string, string> = {}) {
  for (const it of items) {
    map[it.href] = it.label;
    if (it.children) flattenMenu(it.children, map);
  }
  return map;
}

const LABEL_MAP = flattenMenu(MENU);

export function Breadcrumbs() {
  const pathname = usePathname();
  
  // Split path into segments: /sales/orders -> ["sales","orders"]
  const parts = pathname.split('/').filter(Boolean);
  
  // Build crumbs progressively: /sales -> /sales/orders
  const crumbs: Crumb[] = parts.map((part, idx) => {
    const href = '/' + parts.slice(0, idx + 1).join('/');
    return { href, label: LABEL_MAP[href] || capitalize(part) };
  });

  return (
    <nav className="mb-6" aria-label="Breadcrumb">
      <div className="flex items-center gap-1 px-1">
        {/* Home link */}
        <Link 
          href="/dashboard" 
          className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 group"
        >
          <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span className="hidden sm:inline">Home</span>
        </Link>

        {/* Breadcrumb items */}
        {crumbs.map((crumb, idx) => (
          <div key={crumb.href} className="flex items-center gap-1">
            {/* Separator */}
            <ChevronRight className="w-4 h-4 text-slate-400" />
            
            {/* Breadcrumb item */}
            {idx === crumbs.length - 1 ? (
              // Current page - not clickable
              <div className="flex items-center px-3 py-2 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-100">
                <span className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  {crumb.label}
                </span>
              </div>
            ) : (
              // Intermediate pages - clickable
              <Link
                href={crumb.href}
                className="px-3 py-2 rounded-lg text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-all duration-200 group"
              >
                <span className="group-hover:underline decoration-2 decoration-slate-300">
                  {crumb.label}
                </span>
              </Link>
            )}
          </div>
        ))}
      </div>

      {/* Optional: Show current page description */}
      {crumbs.length > 0 && (
        <div className="mt-3 px-4">
          <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent"></div>
          <div className="mt-3 text-xs text-slate-500">
            En cours de visualisation: <span className="font-medium text-slate-700">{crumbs[crumbs.length - 1]?.label}</span>
          </div>
        </div>
      )}
    </nav>
  );
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}