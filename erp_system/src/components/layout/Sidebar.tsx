'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';
import { MENU, type MenuItem } from './menu';

/**
 * Checks if the current user has the required permissions for a menu item.
 * - string need → must have it
 * - string[] need → OR logic (must have at least one)
 */
function canSee(need?: string | string[], perms?: string[]) {
  if (!need) return true;
  const have = new Set(perms || []);
  if (typeof need === 'string') return have.has(need);
  return need.some((n) => have.has(n));
}

function Row({ 
  item, 
  depth = 0, 
  perms,
  expandedItems,
  setExpandedItems
}: { 
  item: MenuItem; 
  depth?: number; 
  perms?: string[];
  expandedItems: Set<string>;
  setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
}) {
  const pathname = usePathname();
  if (!canSee(item.need, perms)) return null;

  const active = pathname === item.href || pathname?.startsWith(item.href + '/');
  const hasChildren = item.children && item.children.length > 0;
  const isExpanded = expandedItems.has(item.href);
  const hasActiveChild = item.children?.some(child => 
    pathname === child.href || pathname?.startsWith(child.href + '/')
  );

  const toggleExpanded = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const newExpanded = new Set(expandedItems);
    if (isExpanded) {
      newExpanded.delete(item.href);
    } else {
      newExpanded.add(item.href);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div>
      <div className="relative group">
        <Link
          href={item.href}
          className={`
            flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 relative
            ${active 
              ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg' 
              : hasActiveChild
                ? 'bg-blue-50 text-blue-700 border border-blue-200'
                : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
            }
          `}
          style={{ marginLeft: depth * 16 }}
        >
          <span className={`flex items-center justify-center w-5 h-5 ${active ? 'text-white' : 'text-slate-500'}`}>
            {/* Icon placeholder - add your icons here */}
          </span>
          <span className="flex-1 truncate">{item.label}</span>
          
          {hasChildren && (
            <button
              onClick={toggleExpanded}
              className={`
                p-0.5 rounded transition-transform duration-200
                ${active ? 'text-white/80 hover:text-white' : 'text-slate-400 hover:text-slate-600'}
                ${isExpanded ? 'rotate-0' : '-rotate-90'}
              `}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}
        </Link>

        {/* Active indicator */}
        {active && (
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full shadow-sm" />
        )}
      </div>

      {/* Children with smooth expand/collapse */}
      {hasChildren && (
        <div 
          className={`
            overflow-hidden transition-all duration-300 ease-in-out
            ${isExpanded || hasActiveChild ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="mt-1 space-y-1">
            {item.children?.map((child) => (
              <Row 
                key={child.href} 
                item={child} 
                depth={depth + 1} 
                perms={perms}
                expandedItems={expandedItems}
                setExpandedItems={setExpandedItems}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function Sidebar() {
  const { user } = useAuth();
  const pathname = usePathname();
  const perms = user?.permissions || [];
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
    // Auto-expand items that have active children
    const expanded = new Set<string>();
    MENU.forEach(item => {
      if (item.children?.some(child => 
        pathname === child.href || pathname?.startsWith(child.href + '/')
      )) {
        expanded.add(item.href);
      }
    });
    return expanded;
  });

  return (
    <aside className="hidden w-72 shrink-0 border-r border-slate-200/60 bg-white/80 backdrop-blur-md p-6 md:block sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full"></div>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Navigation</h2>
        </div>
        <div className="h-px bg-gradient-to-r from-slate-200 via-slate-100 to-transparent"></div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {MENU.map((item) => (
          <Row 
            key={item.href} 
            item={item} 
            perms={perms}
            expandedItems={expandedItems}
            setExpandedItems={setExpandedItems}
          />
        ))}
      </nav>

      {/* User info footer */}
      {user && (
        <div className="mt-8 pt-6 border-t border-slate-200">
          <div className="flex items-center gap-3 px-4 py-3 bg-slate-50/50 rounded-xl">
            <div className="w-8 h-8 bg-gradient-to-br from-slate-400 to-slate-600 rounded-full flex items-center justify-center text-white text-sm font-medium">
              {user.first_name?.[0]}{user.last_name?.[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-slate-800 truncate">
                {user.first_name} {user.last_name}
              </div>
              <div className="text-xs text-slate-500 truncate">
                {user.permissions?.slice(0, 2).join(', ')}
                {user.permissions && user.permissions.length > 2 && '...'}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Scroll fade effect */}
      <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-white/80 to-transparent pointer-events-none"></div>
    </aside>
  );
}