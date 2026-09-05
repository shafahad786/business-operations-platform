import type { MonthlySales } from "../../types/dashboard";
import { formatCurrency, formatMonthLabel } from "../../lib/utils";

type SalesChartProps = {
  data: MonthlySales[];
  loading?: boolean;
};

export default function SalesChart({ data, loading }: SalesChartProps) {
  if (loading) {
    return (
      <div className="h-56 animate-pulse rounded-lg bg-slate-100 dark:bg-slate-800" />
    );
  }

  if (data.length === 0) {
    return (
      <div className="flex h-56 items-center justify-center rounded-lg border border-dashed border-slate-200 text-sm text-slate-500 dark:border-slate-700 dark:text-slate-400">
        No sales data available for your role.
      </div>
    );
  }

  const max = Math.max(...data.map((item) => item.total), 1);

  return (
    <div className="space-y-4">
      <div className="flex h-56 items-end gap-3 border-b border-slate-200 pb-2 dark:border-slate-700">
        {data.map((item) => {
          const height = Math.max(
            (item.total / max) * 100,
            item.total > 0 ? 8 : 2
          );

          return (
            <div
              key={item.month}
              className="flex flex-1 flex-col items-center gap-2"
            >
              <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400 sm:text-xs">
                {formatCurrency(item.total)}
              </span>

              <div
                className="w-full max-w-12 rounded-t-md bg-blue-600 transition-all hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-400"
                style={{ height: `${height}%` }}
                title={`${formatMonthLabel(item.month)}: ${formatCurrency(
                  item.total
                )}`}
              />

              <span className="text-[10px] text-slate-500 dark:text-slate-400 sm:text-xs">
                {formatMonthLabel(item.month)}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}