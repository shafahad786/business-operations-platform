import { Link } from "react-router-dom";
import type { DashboardRecentPayment } from "../../types/dashboard";
import { formatCurrency, formatDate } from "../../lib/utils";

type RecentPaymentsProps = {
  payments: DashboardRecentPayment[];
  loading?: boolean;
};

export default function RecentPayments({
  payments,
  loading,
}: RecentPaymentsProps) {
  if (loading) {
    return (
      <div className="h-40 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    );
  }

  if (payments.length === 0) {
    return (
      <p className="text-sm text-slate-500 dark:text-slate-400">
        No recent payments to display.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-left text-slate-500 dark:border-slate-700 dark:text-slate-400">
            <th className="pb-2 pr-4 font-medium">Invoice</th>
            <th className="pb-2 pr-4 font-medium">Customer</th>
            <th className="pb-2 pr-4 font-medium">Method</th>
            <th className="pb-2 pr-4 font-medium">Date</th>
            <th className="pb-2 font-medium text-right">Amount</th>
          </tr>
        </thead>

        <tbody>
          {payments.map((payment) => (
            <tr
              key={payment.id}
              className="border-b border-slate-100 last:border-0 dark:border-slate-800"
            >
              <td className="py-3 pr-4">
                <Link
                  to={`/app/invoices/${payment.invoiceId}`}
                  className="font-medium text-blue-600 hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                >
                  {payment.invoiceNumber}
                </Link>
              </td>

              <td className="py-3 pr-4 text-slate-700 dark:text-slate-300">
                {payment.customerName}
              </td>

              <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                {payment.method}
              </td>

              <td className="py-3 pr-4 text-slate-600 dark:text-slate-400">
                {formatDate(payment.paymentDate)}
              </td>

              <td className="py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                {formatCurrency(payment.amount)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}