// components/layout/menu.ts
export type MenuItem = {
  label: string;
  href: string;
  icon?: React.ReactNode;
  /**
   * Permission(s) required to see this item.
   * - string → must have that permission
   * - string[] → user must have at least one (OR)
   */
  need?: string | string[];
  children?: MenuItem[];
};

// Sidebar menu structure
export const MENU: MenuItem[] = [
  {
    label: "Tableau de bord",
    href: "/dashboard",
    // no `need` → visible to any logged-in user
  },
  {
    label: "Ventes",
    href: "/sales/orders",
    need: ["sales_view"],
    children: [
      { label: "Commandes", href: "/sales/orders", need: ["sales_view"] },
      { label: "Factures", href: "/sales/invoices", need: ["invoices_view"] },
      { label: "Devis", href: "/sales/quotes", need: ["sales_view"] },
      { label: "Notes de livraison", href: "/sales/delivery-notes", need: ["sales_view"] },
    ],
  },
  {
    label: "Clients",
    href: "/clients",
    
  },
  {
    label: "Fournisseurs",
    href: "/suppliers",
    
  },
  {
    label: "Stock",
    href: "/stock",
    need: ["stock_view"],
    children: [
      { label: "Produits", href: "/stock/products", need: ["stock_view"] },
      { label: "Entrepôts", href: "/stock/warehouses", need: ["stock_view"] },
    ],
  },
  {
    label: "Achat",
    href: "/purchasing",
    need: ["purchasing_view"],
  },
  {
    label: "Utilisateurs et rôles",
    href: "/settings/users",
     need: ["users_manage", "sales_manage"], // admin-like permission
      children: [
      { label: "Utilisateurs et rôles", href: "/settings/users", need: ["users_manage"] },
      { label: "Points de vente", href: "/settings/sales-points", need: ["sales_manage"] },
    ],
  },
];
