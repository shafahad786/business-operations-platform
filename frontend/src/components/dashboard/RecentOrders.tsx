import { Link } from "react-router-dom";
import type { DashboardRecentOrder } from "../../types/dashboard";
import StatusBadge from "../ui/StatusBadge";
import { formatCurrency, formatDateTime } from "../../lib/utils";

type RecentOrdersProps = {
  orders: DashboardRecentOrder[];
  loading?: boolean;
};

function orderTone(
  status: string
): "success" | "warning" | "danger" | "neutral" {
  if (status === "CONFIRMED") return "success";
  if (status === "DRAFT") return "warning";
  if (status === "CANCELLED") return "danger";
  return "neutral";
}

export default function RecentOrders({
  orders,
  loading,
}: RecentOrdersProps) {
  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    );
  }

  if (orders.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No recent orders.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="pb-2 pr-4 font-medium">Order</th>
            <th className="pb-2 pr-4 font-medium">Customer</th>
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 pr-4 font-medium">Status</th>
            <th className="pb-2 font-medium text-right">Total</th>
          </tr>
        </thead>

        <tbody>
          {orders.map((order) => (
            <tr
              key={order.id}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800"
            >
              <td className="py-3 pr-4">
                <Link
                  to={`/app/orders/${order.id}`}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {order.orderNumber}
                </Link>
              </td>

              <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                {order.customerName}
              </td>

              <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                {formatDateTime(order.orderDate)}
              </td>

              <td className="py-3 pr-4">
                <StatusBadge
                  label={order.status}
                  tone={orderTone(order.status)}
                />
              </td>

              <td className="py-3 text-right font-semibold text-slate-900 dark:text-white">
                {formatCurrency(order.totalAmount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}