'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/providers/auth-provider';
import { 
  ChevronDown, 
  User, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Home,
  Package,
  ShoppingCart,
  Building2,
  Users,
  BarChart3,
  FileText,
  Cog,
  HelpCircle
} from 'lucide-react';
import { useState } from 'react';
import { MENU, type MenuItem } from './menu';

function canSee(need?: string | string[], perms?: string[]) {
  if (!need) return true;
  const have = new Set(perms || []);
  if (typeof need === 'string') return have.has(need);
  return need.some((n) => have.has(n));
}

const iconMap: Record<string, React.ReactNode> = {
  '/dashboard': <Home className="w-5 h-5" />,
  '/products': <Package className="w-5 h-5" />,
  '/purchasing': <ShoppingCart className="w-5 h-5" />,
  '/sales': <BarChart3 className="w-5 h-5" />,
  '/stock': <Building2 className="w-5 h-5" />,
  '/settings': <Cog className="w-5 h-5" />,
  '/users': <Users className="w-5 h-5" />,
  '/reports': <FileText className="w-5 h-5" />,
};

function Row({ 
  item, 
  depth = 0, 
  perms,
  expandedItems,
  setExpandedItems,
  onItemClick
}: { 
  item: MenuItem; 
  depth?: number; 
  perms?: string[];
  expandedItems: Set<string>;
  setExpandedItems: React.Dispatch<React.SetStateAction<Set<string>>>;
  onItemClick?: () => void;
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

  const handleClick = () => {
    if (onItemClick) onItemClick();
  };

  const getIcon = () => {
    return iconMap[item.href] || <div className="w-4 h-4 rounded-full bg-current opacity-50"></div>;
  };

  return (
    <div>
      <div className="relative group">
        <Link
          href={item.href}
          onClick={handleClick}
          className={`
            flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 relative
            ${active 
              ? 'bg-blue-600 text-white shadow-md' 
              : hasActiveChild
                ? 'bg-blue-50 text-blue-700'
                : 'text-gray-700 hover:bg-gray-100'
            }
          `}
          style={{ marginLeft: depth * 12 }}
        >
          <div className={`
            flex items-center justify-center shrink-0
            ${active 
              ? 'text-white' 
              : hasActiveChild
                ? 'text-blue-600'
                : 'text-gray-500'
            }
          `}>
            {getIcon()}
          </div>
          
          <span className="flex-1 truncate">{item.label}</span>
          
          {hasChildren && (
            <button
              onClick={toggleExpanded}
              className={`
                p-0.5 rounded transition-transform duration-200
                ${active 
                  ? 'text-white/80' 
                  : 'text-gray-400'
                }
                ${isExpanded ? 'rotate-0' : '-rotate-90'}
              `}
            >
              <ChevronDown className="w-4 h-4" />
            </button>
          )}

          {active && (
            <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-blue-800 rounded-r-full"></div>
          )}
        </Link>
      </div>

      {hasChildren && (
        <div 
          className={`
            overflow-hidden transition-all duration-200
            ${isExpanded || hasActiveChild ? 'max-h-[600px] opacity-100 mt-1' : 'max-h-0 opacity-0'}
          `}
        >
          <div className="space-y-0.5 relative">
            {(isExpanded || hasActiveChild) && depth === 0 && (
              <div 
                className="absolute left-5 top-0 bottom-0 w-px bg-gray-200" 
              />
            )}
            {item.children?.map((child) => (
              <Row 
                key={child.href} 
                item={child} 
                depth={depth + 1} 
                perms={perms}
                expandedItems={expandedItems}
                setExpandedItems={setExpandedItems}
                onItemClick={onItemClick}
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
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(() => {
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

  const closeMobile = () => setIsMobileOpen(false);

  const SidebarContent = () => (
    <>
      

      {/* Profil utilisateur */}
      {user && (
        <div className="mb-6 px-2">
          <div className="relative">
            

            {showUserMenu && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-50">
                <Link
                  href="/profile"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <User className="w-4 h-4" />
                  Mon profil
                </Link>
                <Link
                  href="/settings"
                  onClick={() => setShowUserMenu(false)}
                  className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  <Settings className="w-4 h-4" />
                  Paramètres
                </Link>
                <hr className="my-1 border-gray-200" />
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    // Logique de déconnexion ici
                  }}
                  className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto">
        <div className="mb-3">
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wide px-3">
            Navigation
          </h2>
        </div>
        
        <nav className="space-y-1 px-2">
          {MENU.map((item) => (
            <Row 
              key={item.href} 
              item={item} 
              perms={perms}
              expandedItems={expandedItems}
              setExpandedItems={setExpandedItems}
              onItemClick={closeMobile}
            />
          ))}
        </nav>
      </div>

      
    </>
  );

  return (
    <>
      {/* Bouton menu mobile */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="md:hidden fixed top-4 left-4 z-50 p-2.5 rounded-lg bg-white border border-gray-200 shadow-md hover:shadow-lg transition-shadow"
      >
        <Menu className="w-5 h-5 text-gray-700" />
      </button>

      {/* Overlay mobile */}
      {isMobileOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Desktop */}
      <aside className="hidden md:flex w-72 shrink-0 border-r border-gray-200 bg-white">
        <div className="flex flex-col w-full p-4 sticky top-0 h-screen">
          <SidebarContent />
        </div>
      </aside>

      {/* Sidebar Mobile */}
      <aside className={`
        md:hidden fixed left-0 top-0 z-50 w-72 h-full bg-white transform transition-transform duration-300 border-r border-gray-200 shadow-2xl
        ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col w-full p-4 h-full">
          <button
            onClick={() => setIsMobileOpen(false)}
            className="absolute top-4 right-4 p-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5 text-gray-600" />
          </button>
          <SidebarContent />
        </div>
      </aside>
    </>
  );
}