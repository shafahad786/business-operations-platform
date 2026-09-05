import { Eye, Plus, Search } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import PageCard from "../components/ui/PageCard";
import Pagination from "../components/ui/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import { formatCurrency, formatDate, getErrorMessage } from "../lib/utils";
import { getCustomers } from "../services/customerService";
import { getOrders } from "../services/orderService";
import type { Customer } from "../types/customer";
import type { SalesOrder, SalesOrderStatus } from "../types/order";

const STATUS_TONE: Record<
  SalesOrderStatus,
  "neutral" | "success" | "warning"
> = {
  DRAFT: "neutral",
  CONFIRMED: "success",
  CANCELLED: "warning",
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [status, setStatus] = useState<"" | SalesOrderStatus>("");
  const [customerId, setCustomerId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getOrders({
        page,
        size: 10,
        search: query || undefined,
        status: status || undefined,
        customerId: customerId ? Number(customerId) : undefined,
      });

      setOrders(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load orders"));
    } finally {
      setLoading(false);
    }
  }, [page, query, status, customerId]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        const response = await getCustomers({
          page: 0,
          size: 100,
        });

        setCustomers(response.content);
      } catch {
        setCustomers([]);
      }
    };

    void loadCustomers();
  }, []);

  return (
    <PageCard
      title="Sales Orders"
      description="Create, confirm, and track customer sales orders."
      action={
        <Link
          to="/app/orders/new"
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Create Order
        </Link>
      }
    >
      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-colors dark:border-slate-800 dark:bg-slate-950/60">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_220px_auto]">
          <form
            className="relative"
            onSubmit={(event) => {
              event.preventDefault();
              setPage(0);
              setQuery(search.trim());
            }}
          >
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by order number"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
            />
          </form>

          <select
            value={status}
            onChange={(event) => {
              setStatus(event.target.value as "" | SalesOrderStatus);
              setPage(0);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="CANCELLED">Cancelled</option>
          </select>

          <select
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
          >
            <option value="">All customers</option>

            {customers.map((customer) => (
              <option key={customer.id} value={customer.id}>
                {customer.name}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => {
              setPage(0);
              setQuery(search.trim());
            }}
            className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-100 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
          >
            Apply
          </button>
        </div>
      </div>

      {/* States */}
      {loading ? <LoadingState message="Loading orders..." /> : null}

      {error ? <ErrorState message={error} /> : null}

      {!loading && !error && orders.length === 0 ? (
        <EmptyState
          title="No orders found"
          description="Create a sales order to get started."
        />
      ) : null}

      {/* Orders table */}
      {!loading && !error && orders.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-[950px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Order Number</th>
                  <th className="px-4 py-3 font-medium">Customer</th>
                  <th className="px-4 py-3 font-medium">Date</th>
                  <th className="px-4 py-3 text-center font-medium">
                    Items
                  </th>
                  <th className="px-4 py-3 text-right font-medium">
                    Total
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((order) => (
                  <tr
                    key={order.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3">
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        {order.orderNumber}
                      </Link>
                    </td>

                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {order.customer.name}
                        </p>
                      </div>
                    </td>

                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(order.orderDate)}
                    </td>

                    <td className="px-4 py-3 text-center text-slate-700 dark:text-slate-300">
                      <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                        {order.itemCount}
                      </span>
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(order.totalAmount)}
                    </td>

                    <td className="px-4 py-3">
                      <StatusBadge
                        label={order.status}
                        tone={STATUS_TONE[order.status]}
                      />
                    </td>

                    <td className="px-4 py-3">
                      <Link
                        to={`/app/orders/${order.id}`}
                        className="inline-flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                        aria-label="View order"
                        title="View order"
                      >
                        <Eye className="h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            page={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      ) : null}
    </PageCard>
  );
}