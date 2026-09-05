import { ArrowLeft, FileText, Pencil } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ConfirmDialog } from "../components/ui/Dialog";
import PageCard from "../components/ui/PageCard";
import StatusBadge from "../components/ui/StatusBadge";
import {
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import { useAuth } from "../contexts/AuthContext";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
} from "../lib/utils";
import {
  generateInvoiceFromOrder,
  getInvoiceByOrderId,
} from "../services/invoiceService";
import {
  cancelOrder,
  confirmOrder,
  getOrder,
} from "../services/orderService";
import type { Invoice } from "../types/invoice";
import type {
  SalesOrder,
  SalesOrderStatus,
} from "../types/order";

const STATUS_TONE: Record<
  SalesOrderStatus,
  "neutral" | "success" | "warning"
> = {
  DRAFT: "neutral",
  CONFIRMED: "success",
  CANCELLED: "warning",
};

export default function OrderDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const canManage =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const [order, setOrder] = useState<SalesOrder | null>(null);
  const [linkedInvoice, setLinkedInvoice] = useState<Invoice | null>(
    null
  );
  const [invoiceChecked, setInvoiceChecked] = useState(false);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);
  const [invoiceOpen, setInvoiceOpen] = useState(false);

  const loadOrder = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);
    setInvoiceChecked(false);

    try {
      const orderData = await getOrder(Number(id));

      setOrder(orderData);

      if (orderData.status === "CONFIRMED") {
        try {
          setLinkedInvoice(
            await getInvoiceByOrderId(orderData.id)
          );
        } catch {
          setLinkedInvoice(null);
        }
      } else {
        setLinkedInvoice(null);
      }
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to load order")
      );
    } finally {
      setLoading(false);
      setInvoiceChecked(true);
    }
  }, [id]);

  useEffect(() => {
    void loadOrder();
  }, [loadOrder]);

  const handleConfirm = async () => {
    if (!order) return;

    setSubmitting(true);

    try {
      const updated = await confirmOrder(order.id);

      setOrder(updated);
      setConfirmOpen(false);

      toast.success(
        "Order confirmed and inventory updated"
      );
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Failed to confirm order")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!order) return;

    setSubmitting(true);

    try {
      const updated = await cancelOrder(order.id);

      setOrder(updated);
      setCancelOpen(false);

      toast.success("Order cancelled");
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Failed to cancel order")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleGenerateInvoice = async () => {
    if (!order) return;

    setSubmitting(true);

    try {
      const invoice = await generateInvoiceFromOrder(order.id);

      setLinkedInvoice(invoice);
      setInvoiceOpen(false);

      toast.success("Invoice generated");

      navigate(`/app/invoices/${invoice.id}`);
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Failed to generate invoice")
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingState message="Loading order..." />;
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!order) {
    return <ErrorState message="Order not found" />;
  }

  const isDraft = order.status === "DRAFT";
  const isConfirmed = order.status === "CONFIRMED";

  return (
    <div className="space-y-6">
      {/* Back navigation */}
      <Link
        to="/app/orders"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to orders
      </Link>

      {/* Order header and content */}
      <PageCard
        title={order.orderNumber}
        description={`Customer: ${order.customer.name}`}
        action={
          <div className="flex flex-wrap gap-2">
            <StatusBadge
              label={order.status}
              tone={STATUS_TONE[order.status]}
            />

            {isDraft && canManage ? (
              <>
                <button
                  type="button"
                  onClick={() => setConfirmOpen(true)}
                  className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
                >
                  Confirm Order
                </button>

                <button
                  type="button"
                  onClick={() => setCancelOpen(true)}
                  className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  Cancel Order
                </button>
              </>
            ) : null}

            {isDraft ? (
              <Link
                to={`/app/orders/${order.id}/edit`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <Pencil className="h-4 w-4" />
                Edit
              </Link>
            ) : null}

            {isConfirmed &&
            invoiceChecked &&
            canManage &&
            !linkedInvoice ? (
              <button
                type="button"
                onClick={() => setInvoiceOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <FileText className="h-4 w-4" />
                Generate Invoice
              </button>
            ) : null}

            {isConfirmed && linkedInvoice ? (
              <Link
                to={`/app/invoices/${linkedInvoice.id}`}
                className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                <FileText className="h-4 w-4" />
                View Invoice
              </Link>
            ) : null}
          </div>
        }
      >
        {/* Order overview */}
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <InfoCard
            label="Order date"
            value={formatDate(order.orderDate)}
          />

          <InfoCard
            label="Customer"
            value={order.customer.name}
          />

          <InfoCard
            label="Items"
            value={String(order.items?.length ?? order.itemCount)}
          />
        </div>

        {/* Main content */}
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          {/* Items */}
          <div>
            <div className="mb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Order items
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Products and quantities included in this order.
              </p>
            </div>

            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
              <table className="min-w-[720px] text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                  <tr>
                    <th className="px-4 py-3 font-medium">
                      Product
                    </th>

                    <th className="px-4 py-3 font-medium">
                      SKU
                    </th>

                    <th className="px-4 py-3 text-center font-medium">
                      Qty
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Unit price
                    </th>

                    <th className="px-4 py-3 text-right font-medium">
                      Line total
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {(order.items ?? []).map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {item.productName}
                        </p>
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {item.sku}
                      </td>

                      <td className="px-4 py-3 text-center">
                        <span className="inline-flex min-w-8 items-center justify-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700 dark:bg-slate-800 dark:text-slate-300">
                          {item.quantity}
                        </span>
                      </td>

                      <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                        {formatCurrency(item.unitPrice)}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                        {formatCurrency(item.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Summary */}
          <div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Order summary
              </h3>

              <dl className="mt-5 space-y-4">
                <DetailRow
                  label="Order date"
                  value={formatDate(order.orderDate)}
                />

                <DetailRow
                  label="Subtotal"
                  value={formatCurrency(order.subtotal)}
                />

                <DetailRow
                  label="Tax"
                  value={formatCurrency(order.taxAmount)}
                />

                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <DetailRow
                    label="Total"
                    value={formatCurrency(order.totalAmount)}
                    strong
                  />
                </div>
              </dl>

              {order.notes ? (
                <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4 transition-colors dark:border-slate-800 dark:bg-slate-900">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
                    Notes
                  </p>

                  <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
                    {order.notes}
                  </p>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </PageCard>

      {/* Confirm dialog */}
      <ConfirmDialog
        open={confirmOpen}
        title="Confirm order"
        message="This will validate stock and reduce inventory for all items. Continue?"
        confirmLabel="Confirm"
        loading={submitting}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
      />

      {/* Cancel dialog */}
      <ConfirmDialog
        open={cancelOpen}
        title="Cancel order"
        message="This draft order will be marked as cancelled."
        confirmLabel="Cancel order"
        loading={submitting}
        onClose={() => setCancelOpen(false)}
        onConfirm={handleCancel}
      />

      {/* Invoice dialog */}
      <ConfirmDialog
        open={invoiceOpen}
        title="Generate invoice"
        message="Create an invoice from this confirmed sales order?"
        confirmLabel="Generate invoice"
        loading={submitting}
        onClose={() => setInvoiceOpen(false)}
        onConfirm={handleGenerateInvoice}
      />
    </div>
  );
}

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
        {label}
      </p>

      <p className="mt-1.5 truncate text-sm font-semibold text-slate-900 dark:text-slate-100">
        {value}
      </p>
    </div>
  );
}

function DetailRow({
  label,
  value,
  strong,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-sm text-slate-600 dark:text-slate-400">
        {label}
      </dt>

      <dd
        className={
          strong
            ? "text-lg font-bold text-slate-900 dark:text-white"
            : "text-sm font-medium text-slate-900 dark:text-slate-100"
        }
      >
        {value}
      </dd>
    </div>
  );
}