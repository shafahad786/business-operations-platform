import {
  AlertTriangle,
  Boxes,
  ClipboardList,
  IndianRupee,
  Package,
  TrendingUp,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import ActivityWidget from "../components/dashboard/ActivityWidget";
import LowStockWidget from "../components/dashboard/LowStockWidget";
import RecentOrders from "../components/dashboard/RecentOrders";
import RecentPayments from "../components/dashboard/RecentPayments";
import SalesChart from "../components/dashboard/SalesChart";
import StatCard from "../components/dashboard/StatCard";
import PageCard from "../components/ui/PageCard";
import { ErrorState, LoadingState } from "../components/ui/StateBlocks";
import { useAuth } from "../contexts/AuthContext";
import { getAuditLogs } from "../services/auditLogService";
import {
  getDashboardSummary,
  getLowStock,
  getRecentOrders,
  getRecentPayments,
  getSalesSummary,
} from "../services/dashboardService";
import type { AuditLog } from "../types/auditLog";
import type {
  DashboardLowStock,
  DashboardRecentOrder,
  DashboardRecentPayment,
  DashboardSummary,
  MonthlySales,
} from "../types/dashboard";
import { formatCurrency, getErrorMessage } from "../lib/utils";

export default function DashboardPage() {
  const { user } = useAuth();

  const canViewFinancials =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const canViewActivity = canViewFinancials;

  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [sales, setSales] = useState<MonthlySales[]>([]);
  const [orders, setOrders] = useState<DashboardRecentOrder[]>([]);
  const [payments, setPayments] = useState<DashboardRecentPayment[]>([]);
  const [lowStock, setLowStock] = useState<DashboardLowStock[]>([]);
  const [activity, setActivity] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const [
        summaryData,
        salesData,
        ordersData,
        paymentsData,
        lowStockData,
      ] = await Promise.all([
        getDashboardSummary(),
        getSalesSummary(),
        getRecentOrders(),
        getRecentPayments(),
        getLowStock(),
      ]);

      setSummary(summaryData);
      setSales(salesData);
      setOrders(ordersData);
      setPayments(paymentsData);
      setLowStock(lowStockData);

      if (canViewActivity) {
        const auditResponse = await getAuditLogs({
          page: 0,
          size: 5,
        });

        setActivity(auditResponse.content);
      } else {
        setActivity([]);
      }
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load dashboard"));
    } finally {
      setLoading(false);
    }
  }, [canViewActivity]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (loading) {
    return <LoadingState message="Loading dashboard..." />;
  }

  if (error || !summary) {
    return (
      <ErrorState
        message={error ?? "Dashboard unavailable"}
        onRetry={() => void loadDashboard()}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Dashboard header */}
      <section className="flex flex-col gap-1">
        <h2 className="text-xl font-semibold tracking-tight text-slate-900 dark:text-white sm:text-2xl">
          Business overview
        </h2>

        <p className="text-sm leading-6 text-slate-500 dark:text-slate-400">
          Key metrics, recent activity, and operational alerts for your
          workspace.
        </p>
      </section>

      {/* Primary metrics */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Customers"
          value={summary.totalCustomers}
          icon={Users}
        />

        <StatCard
          label="Active Products"
          value={summary.activeProducts}
          icon={Package}
        />

        <StatCard
          label="Total Orders"
          value={summary.totalOrders}
          icon={ClipboardList}
        />

        <StatCard
          label="Outstanding Invoices"
          value={
            canViewFinancials
              ? formatCurrency(summary.outstandingAmount)
              : "Restricted"
          }
          icon={IndianRupee}
          tone={summary.outstandingAmount > 0 ? "warning" : "default"}
        />
      </div>

      {/* Financial and operational metrics */}
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total Sales"
          value={
            canViewFinancials ? formatCurrency(summary.totalSales) : "—"
          }
          icon={TrendingUp}
        />

        <StatCard
          label="Paid Amount"
          value={canViewFinancials ? formatCurrency(summary.totalPaid) : "—"}
          icon={IndianRupee}
          tone="success"
        />

        <StatCard
          label="Low Stock Items"
          value={summary.lowStockCount}
          icon={AlertTriangle}
          tone={summary.lowStockCount > 0 ? "warning" : "default"}
        />

        <StatCard
          label="Unpaid Invoices"
          value={canViewFinancials ? summary.unpaidInvoices : "—"}
          icon={Boxes}
          tone={summary.unpaidInvoices > 0 ? "danger" : "default"}
        />
      </div>

      {/* Sales and inventory */}
      <div className="grid gap-6 xl:grid-cols-3">
        <PageCard
          title="Sales (last 6 months)"
          className="xl:col-span-2"
        >
          <SalesChart data={sales} />
        </PageCard>

        <PageCard title="Low stock">
          <LowStockWidget items={lowStock.slice(0, 5)} />
        </PageCard>
      </div>

      {/* Recent business activity */}
      <div className="grid gap-6 xl:grid-cols-2">
        <PageCard title="Recent orders">
          <RecentOrders orders={orders} />
        </PageCard>

        <PageCard title="Recent payments">
          <RecentPayments payments={payments} />
        </PageCard>
      </div>

      {/* Audit activity */}
      {canViewActivity ? (
        <PageCard title="Recent activity">
          <ActivityWidget logs={activity} />
        </PageCard>
      ) : null}

      {/* Order and invoice summary */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">
            {summary.draftOrders}
          </span>{" "}
          draft orders
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          <span className="font-semibold text-slate-900 dark:text-white">
            {summary.confirmedOrders}
          </span>{" "}
          confirmed orders
        </div>

        {canViewFinancials ? (
          <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm transition-colors dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
            <span className="font-semibold text-slate-900 dark:text-white">
              {summary.partiallyPaidInvoices}
            </span>{" "}
            partially paid invoices
          </div>
        ) : null}
      </div>
    </div>
  );
}