import { zodResolver } from "@hookform/resolvers/zod";
import {
  ArrowLeft,
  CalendarDays,
  CreditCard,
  FileText,
  Receipt,
  UserRound,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, useParams } from "react-router-dom";
import { toast } from "sonner";
import Dialog, { ConfirmDialog } from "../components/ui/Dialog";
import PageCard from "../components/ui/PageCard";
import StatusBadge from "../components/ui/StatusBadge";
import {
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import { useAuth } from "../contexts/AuthContext";
import {
  paymentSchema,
  type PaymentFormValues,
} from "../lib/schemas";
import {
  formatCurrency,
  formatDate,
  getErrorMessage,
} from "../lib/utils";
import {
  cancelInvoice,
  getInvoice,
  recordPayment,
} from "../services/invoiceService";
import type {
  Invoice,
  InvoiceStatus,
  PaymentMethod,
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

const PAYMENT_METHODS: PaymentMethod[] = [
  "CASH",
  "CARD",
  "BANK_TRANSFER",
  "UPI",
  "OTHER",
];

export default function InvoiceDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();

  const canManage =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [paymentOpen, setPaymentOpen] = useState(false);
  const [cancelOpen, setCancelOpen] = useState(false);

  const loadInvoice = useCallback(async () => {
    if (!id) return;

    setLoading(true);
    setError(null);

    try {
      const data = await getInvoice(Number(id));
      setInvoice(data);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Failed to load invoice"
        )
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void loadInvoice();
  }, [loadInvoice]);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<PaymentFormValues>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: 0,
      paymentDate: new Date()
        .toISOString()
        .slice(0, 10),
      method: "UPI",
      referenceNumber: "",
      notes: "",
    },
  });

  const watchedAmount = watch("amount");

  const remainingAfterPayment = useMemo(() => {
    if (!invoice) return 0;

    const amount = Number(watchedAmount) || 0;

    return Math.max(
      invoice.balanceDue - amount,
      0
    );
  }, [invoice, watchedAmount]);

  useEffect(() => {
    if (invoice && paymentOpen) {
      reset({
        amount: invoice.balanceDue,
        paymentDate: new Date()
          .toISOString()
          .slice(0, 10),
        method: "UPI",
        referenceNumber: "",
        notes: "",
      });
    }
  }, [invoice, paymentOpen, reset]);

  const handleRecordPayment = async (
    values: PaymentFormValues
  ) => {
    if (!invoice) return;

    if (values.amount > invoice.balanceDue) {
      toast.error(
        "Payment amount cannot exceed the balance due"
      );
      return;
    }

    setSubmitting(true);

    try {
      await recordPayment(invoice.id, {
        amount: values.amount,
        paymentDate: values.paymentDate,
        method: values.method,
        referenceNumber:
          values.referenceNumber || undefined,
        notes: values.notes || undefined,
      });

      setPaymentOpen(false);

      toast.success("Payment recorded");

      await loadInvoice();
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to record payment"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async () => {
    if (!invoice) return;

    setSubmitting(true);

    try {
      const updated = await cancelInvoice(
        invoice.id
      );

      setInvoice(updated);
      setCancelOpen(false);

      toast.success("Invoice cancelled");
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to cancel invoice"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingState message="Loading invoice..." />
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

  if (!invoice) {
    return <ErrorState message="Invoice not found" />;
  }

  const canRecordPayment =
    canManage &&
    invoice.status !== "PAID" &&
    invoice.status !== "CANCELLED" &&
    invoice.balanceDue > 0;

  const canCancelInvoice =
    canManage &&
    invoice.status === "UNPAID" &&
    invoice.amountPaid === 0;

  const paymentProgress =
    invoice.totalAmount > 0
      ? Math.min(
          (invoice.amountPaid /
            invoice.totalAmount) *
            100,
          100
        )
      : 0;

  return (
    <div className="space-y-6">
      {/* Back */}
      <Link
        to="/app/invoices"
        className="inline-flex items-center gap-2 text-sm font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to invoices
      </Link>

      {/* Invoice header */}
      <PageCard
        title={invoice.invoiceNumber}
        description={`Customer: ${invoice.customer.name}`}
        action={
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge
              label={invoice.status.replace(
                "_",
                " "
              )}
              tone={STATUS_TONE[invoice.status]}
            />

            {canRecordPayment ? (
              <button
                type="button"
                onClick={() =>
                  setPaymentOpen(true)
                }
                className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                <CreditCard className="h-4 w-4" />
                Record Payment
              </button>
            ) : null}

            {canCancelInvoice ? (
              <button
                type="button"
                onClick={() =>
                  setCancelOpen(true)
                }
                className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
              >
                Cancel Invoice
              </button>
            ) : null}
          </div>
        }
      >
        {/* Invoice overview cards */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={Receipt}
            label="Invoice total"
            value={formatCurrency(
              invoice.totalAmount
            )}
          />

          <SummaryCard
            icon={CreditCard}
            label="Amount paid"
            value={formatCurrency(
              invoice.amountPaid
            )}
            tone="success"
          />

          <SummaryCard
            icon={CalendarDays}
            label="Balance due"
            value={formatCurrency(
              invoice.balanceDue
            )}
            tone={
              invoice.balanceDue > 0
                ? "warning"
                : "success"
            }
          />

          <SummaryCard
            icon={FileText}
            label="Due date"
            value={formatDate(invoice.dueDate)}
          />
        </div>

        {/* Payment progress */}
        <div className="mb-6 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                Payment progress
              </p>

              <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                {Math.round(paymentProgress)}% of
                the invoice has been paid.
              </p>
            </div>

            <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
              {formatCurrency(
                invoice.amountPaid
              )}
            </span>
          </div>

          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
            <div
              className="h-full rounded-full bg-blue-600 transition-all dark:bg-blue-500"
              style={{
                width: `${paymentProgress}%`,
              }}
            />
          </div>
        </div>

        {/* Customer and invoice details */}
        <div className="grid gap-6 md:grid-cols-2">
          <InfoSection
            icon={UserRound}
            title="Customer"
          >
            <dl className="space-y-3">
              <DetailRow
                label="Name"
                value={invoice.customer.name}
              />

              <DetailRow
                label="Email"
                value={invoice.customer.email}
              />

              <DetailRow
                label="Phone"
                value={invoice.customer.phone}
              />

              <DetailRow
                label="Company"
                value={invoice.customer.company}
              />

              <DetailRow
                label="Address"
                value={invoice.customer.address}
              />
            </dl>
          </InfoSection>

          <InfoSection
            icon={FileText}
            title="Invoice details"
          >
            <dl className="space-y-3">
              <DetailRow
                label="Invoice date"
                value={formatDate(
                  invoice.invoiceDate
                )}
              />

              <DetailRow
                label="Due date"
                value={formatDate(
                  invoice.dueDate
                )}
              />

              <DetailRow
                label="Sales order"
                value={
                  <Link
                    to={`/app/orders/${invoice.salesOrderId}`}
                    className="font-medium text-blue-700 transition-colors hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {invoice.salesOrderNumber}
                  </Link>
                }
              />
            </dl>
          </InfoSection>
        </div>

        {/* Invoice items + totals */}
        <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          <div>
            <div className="mb-3">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Invoice items
              </h3>

              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                Products and quantities included in
                this invoice.
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
                  {(invoice.items ?? []).map(
                    (item) => (
                      <tr
                        key={item.id}
                        className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                      >
                        <td className="px-4 py-3">
                          <span className="font-medium text-slate-900 dark:text-slate-100">
                            {item.productName}
                          </span>
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
                          {formatCurrency(
                            item.unitPrice
                          )}
                        </td>

                        <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                          {formatCurrency(
                            item.lineTotal
                          )}
                        </td>
                      </tr>
                    )
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div>
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                Invoice totals
              </h3>

              <dl className="mt-5 space-y-4">
                <DetailRow
                  label="Subtotal"
                  value={formatCurrency(
                    invoice.subtotal
                  )}
                />

                <DetailRow
                  label="Tax"
                  value={formatCurrency(
                    invoice.taxAmount
                  )}
                />

                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <DetailRow
                    label="Total"
                    value={formatCurrency(
                      invoice.totalAmount
                    )}
                    strong
                  />
                </div>
              </dl>
            </div>

            <div className="mt-4 rounded-2xl border border-blue-100 bg-blue-50 p-5 transition-colors dark:border-blue-900/50 dark:bg-blue-950/30">
              <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
                Payment summary
              </h3>

              <dl className="mt-5 space-y-4">
                <DetailRow
                  label="Amount paid"
                  value={formatCurrency(
                    invoice.amountPaid
                  )}
                />

                <div className="border-t border-blue-200 pt-4 dark:border-blue-900/60">
                  <DetailRow
                    label="Balance due"
                    value={formatCurrency(
                      invoice.balanceDue
                    )}
                    strong
                  />
                </div>
              </dl>
            </div>
          </div>
        </div>

        {/* Notes */}
        {invoice.notes ? (
          <div className="mt-6 rounded-xl border border-slate-200 bg-white p-4 transition-colors dark:border-slate-800 dark:bg-slate-900">
            <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-500">
              Notes
            </p>

            <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-300">
              {invoice.notes}
            </p>
          </div>
        ) : null}
      </PageCard>

      {/* Payment history */}
      <PageCard
        title="Payment history"
        description="Recorded payments for this invoice."
      >
        {(invoice.payments ?? []).length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950">
            <CreditCard className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />

            <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
              No payments recorded
            </p>

            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Payments recorded against this invoice
              will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-[900px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Amount
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Method
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Reference
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Status
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Notes
                  </th>
                </tr>
              </thead>

              <tbody>
                {(invoice.payments ?? []).map(
                  (payment) => (
                    <tr
                      key={payment.id}
                      className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                    >
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {formatDate(
                          payment.paymentDate
                        )}
                      </td>

                      <td className="px-4 py-3 text-right font-semibold text-emerald-700 dark:text-emerald-400">
                        {formatCurrency(
                          payment.amount
                        )}
                      </td>

                      <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                        {payment.method.replace(
                          "_",
                          " "
                        )}
                      </td>

                      <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                        {payment.referenceNumber ||
                          "-"}
                      </td>

                      <td className="px-4 py-3">
                        <StatusBadge
                          label={payment.status}
                          tone={
                            payment.status ===
                            "COMPLETED"
                              ? "success"
                              : "neutral"
                          }
                        />
                      </td>

                      <td className="max-w-xs px-4 py-3 text-slate-600 dark:text-slate-400">
                        <span className="line-clamp-2">
                          {payment.notes || "-"}
                        </span>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </PageCard>

      {/* Record payment dialog */}
      <Dialog
        open={paymentOpen}
        title="Record payment"
        onClose={() =>
          setPaymentOpen(false)
        }
      >
        <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
          <div className="space-y-3">
            <SummaryLine
              label="Invoice total"
              value={formatCurrency(
                invoice.totalAmount
              )}
            />

            <SummaryLine
              label="Already paid"
              value={formatCurrency(
                invoice.amountPaid
              )}
            />

            <div className="border-t border-slate-200 pt-3 dark:border-slate-800">
              <SummaryLine
                label="Balance due"
                value={formatCurrency(
                  invoice.balanceDue
                )}
                strong
              />
            </div>

            <SummaryLine
              label="Remaining after payment"
              value={formatCurrency(
                remainingAfterPayment
              )}
              accent
            />
          </div>
        </div>

        <form
          className="space-y-5"
          onSubmit={handleSubmit(
            handleRecordPayment
          )}
        >
          <Field
            label="Amount"
            error={errors.amount?.message}
          >
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-slate-500">
                ₹
              </span>

              <input
                type="number"
                step="0.01"
                min="0.01"
                max={invoice.balanceDue}
                {...register("amount", {
                  valueAsNumber: true,
                })}
                className={`${inputClass} pl-8`}
              />
            </div>
          </Field>

          <Field
            label="Payment date"
            error={errors.paymentDate?.message}
          >
            <input
              type="date"
              {...register("paymentDate")}
              className={inputClass}
            />
          </Field>

          <Field
            label="Payment method"
            error={errors.method?.message}
          >
            <select
              {...register("method")}
              className={inputClass}
            >
              {PAYMENT_METHODS.map(
                (method) => (
                  <option
                    key={method}
                    value={method}
                  >
                    {method.replace(
                      "_",
                      " "
                    )}
                  </option>
                )
              )}
            </select>
          </Field>

          <Field
            label="Reference number"
            error={
              errors.referenceNumber?.message
            }
          >
            <input
              {...register(
                "referenceNumber"
              )}
              placeholder="e.g. transaction ID"
              className={inputClass}
            />
          </Field>

          <Field
            label="Notes"
            error={errors.notes?.message}
          >
            <textarea
              rows={3}
              {...register("notes")}
              placeholder="Optional payment notes..."
              className={`${inputClass} resize-y`}
            />
          </Field>

          <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() =>
                setPaymentOpen(false)
              }
              disabled={submitting}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
            >
              {submitting
                ? "Saving..."
                : "Record payment"}
            </button>
          </div>
        </form>
      </Dialog>

      {/* Cancel invoice dialog */}
      <ConfirmDialog
        open={cancelOpen}
        title="Cancel invoice"
        message="This unpaid invoice will be marked as cancelled. This action cannot be undone."
        confirmLabel="Cancel invoice"
        loading={submitting}
        onClose={() =>
          setCancelOpen(false)
        }
        onConfirm={handleCancel}
      />
    </div>
  );
}

function SummaryCard({
  icon: Icon,
  label,
  value,
  tone = "default",
}: {
  icon: typeof Receipt;
  label: string;
  value: string;
  tone?: "default" | "success" | "warning";
}) {
  const toneClasses = {
    default:
      "border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900",
    success:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30",
    warning:
      "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30",
  };

  const iconClasses = {
    default:
      "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
    success:
      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
    warning:
      "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  };

  return (
    <div
      className={`rounded-xl border p-4 shadow-sm transition-colors ${toneClasses[tone]}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {label}
          </p>

          <p className="mt-2 text-lg font-bold text-slate-900 dark:text-white">
            {value}
          </p>
        </div>

        <div
          className={`rounded-lg p-2 ${iconClasses[tone]}`}
        >
          <Icon className="h-4 w-4" />
        </div>
      </div>
    </div>
  );
}

function InfoSection({
  icon: Icon,
  title,
  children,
}: {
  icon: typeof UserRound;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 transition-colors dark:border-slate-800 dark:bg-slate-950">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-slate-500 dark:text-slate-400" />

        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>
      </div>

      <div className="mt-4">
        {children}
      </div>
    </div>
  );
}

function DetailRow({
  label,
  value,
  strong,
}: {
  label: string;
  value?: React.ReactNode;
  strong?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-4">
      <dt className="shrink-0 text-sm text-slate-500 dark:text-slate-400">
        {label}
      </dt>

      <dd
        className={
          strong
            ? "text-right text-lg font-bold text-slate-900 dark:text-white"
            : "text-right text-sm font-medium text-slate-900 dark:text-slate-100"
        }
      >
        {value || "-"}
      </dd>
    </div>
  );
}

function SummaryLine({
  label,
  value,
  strong,
  accent,
}: {
  label: string;
  value: string;
  strong?: boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-sm text-slate-600 dark:text-slate-400">
        {label}
      </span>

      <span
        className={
          accent
            ? "text-sm font-semibold text-blue-700 dark:text-blue-400"
            : strong
              ? "text-base font-bold text-slate-900 dark:text-white"
              : "text-sm font-medium text-slate-900 dark:text-slate-100"
        }
      >
        {value}
      </span>
    </div>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      {children}

      {error ? (
        <p className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400">
          {error}
        </p>
      ) : null}
    </div>
  );
}

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500";