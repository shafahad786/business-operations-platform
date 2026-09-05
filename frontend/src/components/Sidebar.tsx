import {
  FileText,
  LayoutDashboard,
  Package,
  ScrollText,
  ShoppingCart,
  Users,
  Warehouse,
  X,
} from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { getNavItemsForRole } from "../lib/navigation";

const ICONS = {
  Dashboard: LayoutDashboard,
  Customers: Users,
  Products: Package,
  Inventory: Warehouse,
  Orders: ShoppingCart,
  Invoices: FileText,
  "Audit Logs": ScrollText,
} as const;

type SidebarProps = {
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuth();
  const navItems = user ? getNavItemsForRole(user.role) : [];

  return (
    <>
      {open ? (
        <button
          type="button"
          aria-label="Close navigation overlay"
          className="fixed inset-0 z-30 bg-slate-900/40 lg:hidden"
          onClick={onClose}
        />
      ) : null}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white transition-colors transition-transform dark:border-slate-800 dark:bg-slate-950 lg:static lg:translate-x-0 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Brand */}
        <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5 dark:border-slate-800">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
              <BriefcaseBusinessIcon />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 dark:text-white">
                Business Operations
              </p>

              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                Platform
              </p>
            </div>
          </div>

          <button
            type="button"
            className="rounded-lg p-1.5 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white lg:hidden"
            onClick={onClose}
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 overflow-y-auto p-3">
          {navItems.map((item) => {
            const Icon = ICONS[item.label as keyof typeof ICONS];

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${
                    isActive
                      ? "bg-blue-50 text-blue-700 shadow-sm dark:bg-blue-950/60 dark:text-blue-400"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-900 dark:hover:text-slate-100"
                  }`
                }
              >
                {Icon ? (
                  <Icon className="h-4 w-4 shrink-0 transition-transform group-hover:scale-105" />
                ) : null}

                {item.label}
              </NavLink>
            );
          })}
        </nav>

        {/* Bottom branding */}
        <div className="border-t border-slate-200 p-4 dark:border-slate-800">
          <p className="text-[11px] font-medium text-slate-400 dark:text-slate-500">
            Business Operations Platform
          </p>
        </div>
      </aside>
    </>
  );
}

function BriefcaseBusinessIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5"
      aria-hidden="true"
    >
      <rect width="20" height="14" x="2" y="7" rx="2" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M2 12h20" />
      <path d="M10 12v2h4v-2" />
    </svg>
  );
}