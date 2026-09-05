import { Eye, FileText, Search } from "lucide-react";
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
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
} from "../lib/utils";
import { getCustomers } from "../services/customerService";
import { getInvoices } from "../services/invoiceService";
import type { Customer } from "../types/customer";
import type {
  Invoice,
  InvoiceStatus,
} from "../types/invoice";

const STATUS_TONE: Record<
  InvoiceStatus,
  "neutral" | "success" | "warning" | "danger"
> = {
  UNPAID: "warning",
  PARTIALLY_PAID: "neutral",
  PAID: "success",
  CANCELLED: "danger",
};

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [status, setStatus] =
    useState<"" | InvoiceStatus>("");

  const [customerId, setCustomerId] = useState("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadInvoices = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getInvoices({
        page,
        size: 10,
        search: query || undefined,
        status: status || undefined,
        customerId: customerId
          ? Number(customerId)
          : undefined,
      });

      setInvoices(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load invoices"
        )
      );
    } finally {
      setLoading(false);
    }
  }, [page, query, status, customerId]);

  useEffect(() => {
    void loadInvoices();
  }, [loadInvoices]);

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
      title="Invoices"
      description="Generate invoices from confirmed orders and track payment status."
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
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search by invoice number"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
            />
          </form>

          <select
            value={status}
            onChange={(event) => {
              setStatus(
                event.target.value as
                  | ""
                  | InvoiceStatus
              );
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="">All statuses</option>
            <option value="UNPAID">Unpaid</option>
            <option value="PARTIALLY_PAID">
              Partially paid
            </option>
            <option value="PAID">Paid</option>
            <option value="CANCELLED">
              Cancelled
            </option>
          </select>

          <select
            value={customerId}
            onChange={(event) => {
              setCustomerId(event.target.value);
              setPage(0);
            }}
            className={selectClass}
          >
            <option value="">All customers</option>

            {customers.map((customer) => (
              <option
                key={customer.id}
                value={customer.id}
              >
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
      {loading ? (
        <LoadingState message="Loading invoices..." />
      ) : null}

      {error ? (
        <ErrorState message={error} />
      ) : null}

      {!loading &&
      !error &&
      invoices.length === 0 ? (
        <EmptyState
          title="No invoices found"
          description="Generate an invoice from a confirmed sales order."
        />
      ) : null}

      {/* Invoice table */}
      {!loading &&
      !error &&
      invoices.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-[1100px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Invoice
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Customer
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Sales Order
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Invoice Date
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Total
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Paid
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Balance
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {invoices.map((invoice) => (
                  <tr
                    key={invoice.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    {/* Invoice */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/app/invoices/${invoice.id}`}
                        className="inline-flex items-center gap-2 font-semibold text-blue-600 transition-colors hover:text-blue-700 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <FileText className="h-4 w-4" />
                        {invoice.invoiceNumber}
                      </Link>
                    </td>

                    {/* Customer */}
                    <td className="px-4 py-3">
                      <span className="font-medium text-slate-900 dark:text-slate-100">
                        {invoice.customer.name}
                      </span>
                    </td>

                    {/* Sales order */}
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs text-slate-600 dark:text-slate-400">
                        {invoice.salesOrderNumber}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(
                        invoice.invoiceDate
                      )}
                    </td>

                    {/* Total */}
                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                      {formatCurrency(
                        invoice.totalAmount
                      )}
                    </td>

                    {/* Paid */}
                    <td className="px-4 py-3 text-right font-medium text-emerald-700 dark:text-emerald-400">
                      {formatCurrency(
                        invoice.amountPaid
                      )}
                    </td>

                    {/* Balance */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={
                          invoice.balanceDue > 0
                            ? "font-semibold text-amber-700 dark:text-amber-400"
                            : "font-medium text-slate-600 dark:text-slate-400"
                        }
                      >
                        {formatCurrency(
                          invoice.balanceDue
                        )}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="px-4 py-3">
                      <StatusBadge
                        label={invoice.status.replace(
                          "_",
                          " "
                        )}
                        tone={
                          STATUS_TONE[
                            invoice.status
                          ]
                        }
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3">
                      <Link
                        to={`/app/invoices/${invoice.id}`}
                        className="inline-flex rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                        aria-label="View invoice"
                        title="View invoice"
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

const selectClass =
  "rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500";