import type { Role } from "../types/auth";

export type NavItem = {
  label: string;
  path: string;
  roles: Role[];
};

export const NAV_ITEMS: NavItem[] = [
  { label: "Dashboard", path: "/app/dashboard", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Customers", path: "/app/customers", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Products", path: "/app/products", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Inventory", path: "/app/inventory", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Orders", path: "/app/orders", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Invoices", path: "/app/invoices", roles: ["ADMIN", "MANAGER", "STAFF"] },
  { label: "Audit Logs", path: "/app/audit-logs", roles: ["ADMIN", "MANAGER"] },
];

export const MODULE_TITLES: Record<string, string> = {
  dashboard: "Dashboard",
  customers: "Customers",
  products: "Products",
  inventory: "Inventory",
  orders: "Orders",
  invoices: "Invoices",
  "audit-logs": "Audit Logs",
  notifications: "Notifications",
};

export function getNavItemsForRole(role: Role): NavItem[] {
  return NAV_ITEMS.filter((item) => item.roles.includes(role));
}
