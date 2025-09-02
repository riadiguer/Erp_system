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
    label: "Dashboard",
    href: "/dashboard",
    // no `need` → visible to any logged-in user
  },
  {
    label: "Sales",
    href: "/sales",
    need: ["sales_view"],
    children: [
      { label: "Orders", href: "/sales/orders", need: ["sales_view"] },
      { label: "Invoices", href: "/sales/invoices", need: ["invoices_view"] },
    ],
  },
  {
    label: "Stock",
    href: "/stock",
    need: ["stock_view"],
    children: [
      { label: "Products", href: "/stock/products", need: ["stock_view"] },
      { label: "Warehouses", href: "/stock/warehouses", need: ["stock_view"] },
    ],
  },
  {
    label: "Purchasing",
    href: "/purchasing",
    need: ["purchasing_view"],
  },
  {
    label: "Users & Roles",
    href: "/settings/users",
     need: ["users_manage", "sales_manage"], // admin-like permission
      children: [
      { label: "Users & Roles", href: "/settings/users", need: ["users_manage"] },
      { label: "Sales Points", href: "/settings/sales-points", need: ["sales_manage"] },
    ],
  },
];
