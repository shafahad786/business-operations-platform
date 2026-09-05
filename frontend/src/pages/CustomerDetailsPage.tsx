import { ArrowLeft } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import PageCard from "../components/ui/PageCard";
import StatusBadge from "../components/ui/StatusBadge";
import { ErrorState, LoadingState } from "../components/ui/StateBlocks";
import { formatCurrency, formatDate, getErrorMessage } from "../lib/utils";
import { getCustomer } from "../services/customerService";
import { getInvoices } from "../services/invoiceService";
import { getOrders } from "../services/orderService";
import type { Customer } from "../types/customer";
import type { Invoice, InvoiceStatus } from "../types/invoice";
import type { SalesOrder, SalesOrderStatus } from "../types/order";

const ORDER_STATUS_TONE: Record<
  SalesOrderStatus,
  "neutral" | "success" | "warning"
> = {
  DRAFT: "neutral",
  CONFIRMED: "success",
  CANCELLED: "warning",
};

const INVOICE_STATUS_TONE: Record<
  InvoiceStatus,
  "neutral" | "success" | "warning" | "danger"
> = {
  UNPAID: "warning",
  PARTIALLY_PAID: "neutral",
  PAID: "success",
  CANCELLED: "danger",
};

export default function CustomerDetailsPage() {
  const { id } = useParams();

  const [customer, setCustomer] = useState<Customer | null>(null);
  const [orders, setOrders] = useState<SalesOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      if (!id) return;

      setLoading(true);
      setError(null);

      try {
        const customerId = Number(id);

        const [customerData, orderData, invoiceData] = await Promise.all([
          getCustomer(customerId),
          getOrders({
            page: 0,
            size: 5,
            customerId,
          }),
          getInvoices({
            page: 0,
            size: 5,
            customerId,
          }),
        ]);

        setCustomer(customerData);
        setOrders(orderData.content);
        setInvoices(invoiceData.content);
      } catch (err) {
        setError(getErrorMessage(err, "Failed to load customer"));
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [id]);

  if (loading) {
    return <LoadingState message="Loading customer..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!customer) {
    return <ErrorState message="Customer not found" />;
  }

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        to="/app/customers"
        className="group inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Back to customers
      </Link>

      {/* Customer profile */}
      <PageCard
        title={customer.name}
        description="Customer profile and contact details"
      >
        <div className="grid gap-6 md:grid-cols-2">
          <DetailBlock title="Customer information">
            <DetailItem label="Name" value={customer.name} />
            <DetailItem label="Company" value={customer.company} />
            <DetailItem
              label="Created"
              value={formatDate(customer.createdAt)}
            />
          </DetailBlock>

          <DetailBlock title="Contact information">
            <DetailItem label="Email" value={customer.email} />
            <DetailItem label="Phone" value={customer.phone} />
            <DetailItem label="Address" value={customer.address} />
          </DetailBlock>
        </div>
      </PageCard>

      {/* Sales orders */}
      <PageCard
        title="Sales orders"
        description="Recent orders for this customer."
      >
        {orders.length === 0 ? (
          <EmptyMessage message="No sales orders yet." />
        ) : (
          <DataTable>
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
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
                      className="font-medium text-blue-700 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {order.orderNumber}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {formatDate(order.orderDate)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      label={order.status}
                      tone={ORDER_STATUS_TONE[order.status]}
                    />
                  </td>

                  <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                    {formatCurrency(order.totalAmount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </PageCard>

      {/* Invoices */}
      <PageCard
        title="Invoices"
        description="Recent invoices for this customer."
      >
        {invoices.length === 0 ? (
          <EmptyMessage message="No invoices yet." />
        ) : (
          <DataTable>
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">Invoice</th>
                <th className="px-4 py-3 font-medium">Order</th>
                <th className="px-4 py-3 font-medium">Date</th>
                <th className="px-4 py-3 font-medium text-right">Total</th>
                <th className="px-4 py-3 font-medium text-right">Paid</th>
                <th className="px-4 py-3 font-medium text-right">Balance</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>

            <tbody>
              {invoices.map((invoice) => (
                <tr
                  key={invoice.id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-3">
                    <Link
                      to={`/app/invoices/${invoice.id}`}
                      className="font-medium text-blue-700 transition-colors hover:text-blue-800 hover:underline dark:text-blue-400 dark:hover:text-blue-300"
                    >
                      {invoice.invoiceNumber}
                    </Link>
                  </td>

                  <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                    {invoice.salesOrderNumber}
                  </td>

                  <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                    {formatDate(invoice.invoiceDate)}
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(invoice.totalAmount)}
                  </td>

                  <td className="px-4 py-3 text-right text-emerald-700 dark:text-emerald-400">
                    {formatCurrency(invoice.amountPaid)}
                  </td>

                  <td className="px-4 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                    {formatCurrency(invoice.balanceDue)}
                  </td>

                  <td className="px-4 py-3">
                    <StatusBadge
                      label={invoice.status.replace("_", " ")}
                      tone={INVOICE_STATUS_TONE[invoice.status]}
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </DataTable>
        )}
      </PageCard>
    </div>
  );
}

function DetailBlock({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
      <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
        {title}
      </h3>

      <dl className="mt-4 space-y-4">{children}</dl>
    </div>
  );
}

function DetailItem({
  label,
  value,
}: {
  label: string;
  value?: string | null;
}) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
        {label}
      </dt>

      <dd className="mt-1 break-words text-sm font-medium text-slate-900 dark:text-slate-100">
        {value || "-"}
      </dd>
    </div>
  );
}

function DataTable({ children }: { children: React.ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
      <table className="min-w-full text-left text-sm">{children}</table>
    </div>
  );
}

function EmptyMessage({ message }: { message: string }) {
  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950">
      <p className="text-sm text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
}