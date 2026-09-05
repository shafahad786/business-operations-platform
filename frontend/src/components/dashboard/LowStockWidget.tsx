import { Link } from "react-router-dom";
import type { DashboardLowStock } from "../../types/dashboard";
import StatusBadge from "../ui/StatusBadge";

type LowStockWidgetProps = {
  items: DashboardLowStock[];
  loading?: boolean;
};

export default function LowStockWidget({
  items,
  loading,
}: LowStockWidgetProps) {
  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    );
  }

  if (items.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        All products are above minimum stock levels.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.productId}
          className="flex items-center justify-between rounded-lg border border-amber-100 bg-amber-50/60 px-3 py-2 transition-colors dark:border-amber-900/60 dark:bg-amber-950/30"
        >
          <div className="min-w-0">
            <Link
              to="/app/products"
              className="font-medium text-slate-900 transition-colors hover:text-blue-600 dark:text-slate-100 dark:hover:text-blue-400"
            >
              {item.productName}
            </Link>

            <p className="text-xs text-slate-500 dark:text-slate-400">
              SKU: {item.sku}
            </p>
          </div>

          <div className="ml-3 shrink-0 text-right">
            <StatusBadge label="Low stock" tone="warning" />

            <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">
              {item.quantity} / min {item.minimumStockLevel}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}