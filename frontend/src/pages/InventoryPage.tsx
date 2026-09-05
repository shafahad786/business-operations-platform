import { History, Minus, Plus, SlidersHorizontal } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import Dialog from "../components/ui/Dialog";
import PageCard from "../components/ui/PageCard";
import StatusBadge from "../components/ui/StatusBadge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import { useAuth } from "../contexts/AuthContext";
import {
  stockAdjustSchema,
  stockChangeSchema,
  type StockAdjustFormValues,
  type StockChangeFormValues,
} from "../lib/schemas";
import { formatDate, getErrorMessage } from "../lib/utils";
import {
  addStock,
  adjustStock,
  getInventory,
  getInventoryMovements,
  removeStock,
} from "../services/inventoryService";
import type {
  InventoryItem,
  InventoryMovement,
} from "../types/inventory";

type StockAction = "add" | "remove" | "adjust" | "history";

export default function InventoryPage() {
  const { user } = useAuth();

  const canModify =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedItem, setSelectedItem] =
    useState<InventoryItem | null>(null);

  const [action, setAction] =
    useState<StockAction | null>(null);

  const [movements, setMovements] =
    useState<InventoryMovement[]>([]);

  const [submitting, setSubmitting] = useState(false);

  const loadInventory = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      setItems(await getInventory());
    } catch (err) {
      setError(
        getErrorMessage(err, "Failed to load inventory")
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadInventory();
  }, [loadInventory]);

  const openAction = async (
    item: InventoryItem,
    nextAction: StockAction
  ) => {
    setSelectedItem(item);
    setAction(nextAction);

    if (nextAction === "history") {
      try {
        setMovements(
          await getInventoryMovements(item.productId)
        );
      } catch (err) {
        toast.error(
          getErrorMessage(
            err,
            "Failed to load movement history"
          )
        );
      }
    }
  };

  const closeDialog = () => {
    setSelectedItem(null);
    setAction(null);
    setMovements([]);
  };

  const handleStockChange = async (
    values: StockChangeFormValues
  ) => {
    if (
      !selectedItem ||
      !action ||
      action === "history" ||
      action === "adjust"
    ) {
      return;
    }

    setSubmitting(true);

    try {
      if (action === "add") {
        await addStock(
          selectedItem.productId,
          values
        );

        toast.success("Stock added successfully");
      } else {
        await removeStock(
          selectedItem.productId,
          values
        );

        toast.success("Stock removed successfully");
      }

      closeDialog();
      await loadInventory();
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Stock operation failed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdjust = async (
    values: StockAdjustFormValues
  ) => {
    if (!selectedItem) return;

    setSubmitting(true);

    try {
      await adjustStock(
        selectedItem.productId,
        values
      );

      toast.success("Stock adjusted successfully");

      closeDialog();
      await loadInventory();
    } catch (err) {
      toast.error(
        getErrorMessage(err, "Stock adjustment failed")
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageCard
      title="Inventory"
      description="Monitor stock levels, manage inventory, and review stock movements."
    >
      {/* Inventory summary */}
      {!loading && !error && items.length > 0 ? (
        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          <SummaryCard
            label="Total products"
            value={items.length}
          />

          <SummaryCard
            label="Low stock"
            value={
              items.filter((item) => item.lowStock).length
            }
            tone={
              items.some((item) => item.lowStock)
                ? "warning"
                : "default"
            }
          />

          <SummaryCard
            label="Healthy stock"
            value={
              items.filter((item) => !item.lowStock).length
            }
            tone="success"
          />
        </div>
      ) : null}

      {/* States */}
      {loading ? (
        <LoadingState message="Loading inventory..." />
      ) : null}

      {error ? <ErrorState message={error} /> : null}

      {!loading && !error && items.length === 0 ? (
        <EmptyState
          title="No inventory records"
          description="Create products to initialize inventory."
        />
      ) : null}

      {/* Inventory table */}
      {!loading && !error && items.length > 0 ? (
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
          <table className="min-w-[950px] text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
              <tr>
                <th className="px-4 py-3 font-medium">
                  Product
                </th>

                <th className="px-4 py-3 font-medium">
                  SKU
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Current stock
                </th>

                <th className="px-4 py-3 text-right font-medium">
                  Minimum stock
                </th>

                <th className="px-4 py-3 font-medium">
                  Status
                </th>

                <th className="px-4 py-3 font-medium">
                  Last updated
                </th>

                <th className="px-4 py-3 font-medium">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                >
                  <td className="px-4 py-4">
                    <p className="font-medium text-slate-900 dark:text-slate-100">
                      {item.productName}
                    </p>

                    <div className="mt-1 h-1.5 w-28 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
                      <div
                        className={`h-full rounded-full transition-all ${
                          item.lowStock
                            ? "bg-amber-500"
                            : "bg-emerald-500"
                        }`}
                        style={{
                          width: `${getStockPercentage(
                            item.quantity,
                            item.minimumStockLevel
                          )}%`,
                        }}
                      />
                    </div>
                  </td>

                  <td className="px-4 py-4 font-mono text-xs text-slate-600 dark:text-slate-400">
                    {item.sku}
                  </td>

                  <td className="px-4 py-4 text-right">
                    <span
                      className={`text-base font-semibold ${
                        item.lowStock
                          ? "text-amber-700 dark:text-amber-400"
                          : "text-slate-900 dark:text-slate-100"
                      }`}
                    >
                      {item.quantity}
                    </span>
                  </td>

                  <td className="px-4 py-4 text-right text-slate-600 dark:text-slate-400">
                    {item.minimumStockLevel}
                  </td>

                  <td className="px-4 py-4">
                    <StatusBadge
                      label={
                        item.lowStock
                          ? "Low stock"
                          : "In stock"
                      }
                      tone={
                        item.lowStock
                          ? "warning"
                          : "success"
                      }
                    />
                  </td>

                  <td className="px-4 py-4 text-slate-600 dark:text-slate-400">
                    {formatDate(item.updatedAt)}
                  </td>

                  <td className="px-4 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {canModify ? (
                        <>
                          <ActionButton
                            label="Add stock"
                            tone="success"
                            onClick={() =>
                              openAction(item, "add")
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </ActionButton>

                          <ActionButton
                            label="Remove stock"
                            tone="danger"
                            onClick={() =>
                              openAction(item, "remove")
                            }
                          >
                            <Minus className="h-4 w-4" />
                          </ActionButton>

                          <ActionButton
                            label="Adjust stock"
                            tone="neutral"
                            onClick={() =>
                              openAction(item, "adjust")
                            }
                          >
                            <SlidersHorizontal className="h-4 w-4" />
                          </ActionButton>
                        </>
                      ) : null}

                      <ActionButton
                        label="View history"
                        tone="neutral"
                        onClick={() =>
                          openAction(item, "history")
                        }
                      >
                        <History className="h-4 w-4" />
                      </ActionButton>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}

      {/* Add / Remove stock */}
      <Dialog
        open={Boolean(
          selectedItem &&
            (action === "add" || action === "remove")
        )}
        title={
          action === "add"
            ? "Add Stock"
            : "Remove Stock"
        }
        onClose={closeDialog}
      >
        {selectedItem ? (
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
              Product
            </p>

            <p className="mt-1 font-semibold text-slate-900 dark:text-slate-100">
              {selectedItem.productName}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Current stock:{" "}
              <span className="font-semibold">
                {selectedItem.quantity}
              </span>
            </p>
          </div>
        ) : null}

        <StockChangeForm
          submitting={submitting}
          onCancel={closeDialog}
          onSubmit={handleStockChange}
        />
      </Dialog>

      {/* Adjust stock */}
      <Dialog
        open={Boolean(
          selectedItem && action === "adjust"
        )}
        title="Adjust Stock"
        onClose={closeDialog}
      >
        {selectedItem ? (
          <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
              Current quantity
            </p>

            <p className="mt-1 text-2xl font-semibold text-slate-900 dark:text-slate-100">
              {selectedItem.quantity}
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {selectedItem.productName}
            </p>
          </div>
        ) : null}

        <StockAdjustForm
          submitting={submitting}
          onCancel={closeDialog}
          onSubmit={handleAdjust}
        />
      </Dialog>

      {/* Movement history */}
      <Dialog
        open={Boolean(
          selectedItem && action === "history"
        )}
        title={`Movement History — ${
          selectedItem?.productName ?? ""
        }`}
        onClose={closeDialog}
      >
        {movements.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950">
            <History className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />

            <p className="mt-3 text-sm font-medium text-slate-700 dark:text-slate-300">
              No movement history yet
            </p>

            <p className="mt-1 text-xs text-slate-500 dark:text-slate-500">
              Stock changes will appear here.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-[700px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-3 py-3 font-medium">
                    Date
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Type
                  </th>

                  <th className="px-3 py-3 text-right font-medium">
                    Quantity
                  </th>

                  <th className="px-3 py-3 text-right font-medium">
                    Previous
                  </th>

                  <th className="px-3 py-3 text-right font-medium">
                    New
                  </th>

                  <th className="px-3 py-3 font-medium">
                    Reason
                  </th>
                </tr>
              </thead>

              <tbody>
                {movements.map((movement) => (
                  <tr
                    key={movement.id}
                    className="border-b border-slate-100 last:border-0 dark:border-slate-800"
                  >
                    <td className="px-3 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(movement.createdAt)}
                    </td>

                    <td className="px-3 py-3">
                      <StatusBadge
                        label={movement.type}
                        tone={getMovementTone(
                          movement.type
                        )}
                      />
                    </td>

                    <td
                      className={`px-3 py-3 text-right font-semibold ${
                        movement.quantity > 0
                          ? "text-emerald-700 dark:text-emerald-400"
                          : "text-rose-700 dark:text-rose-400"
                      }`}
                    >
                      {movement.quantity > 0
                        ? `+${movement.quantity}`
                        : movement.quantity}
                    </td>

                    <td className="px-3 py-3 text-right text-slate-600 dark:text-slate-400">
                      {movement.previousQuantity}
                    </td>

                    <td className="px-3 py-3 text-right font-medium text-slate-900 dark:text-slate-100">
                      {movement.newQuantity}
                    </td>

                    <td className="max-w-xs px-3 py-3 text-slate-600 dark:text-slate-400">
                      {movement.reason || "-"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Dialog>
    </PageCard>
  );
}

function SummaryCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: number;
  tone?: "default" | "warning" | "success";
}) {
  const classes = {
    default:
      "border-slate-200 bg-slate-50 dark:border-slate-800 dark:bg-slate-950",
    warning:
      "border-amber-200 bg-amber-50 dark:border-amber-900/60 dark:bg-amber-950/30",
    success:
      "border-emerald-200 bg-emerald-50 dark:border-emerald-900/60 dark:bg-emerald-950/30",
  };

  const valueClasses = {
    default: "text-slate-900 dark:text-slate-100",
    warning: "text-amber-700 dark:text-amber-400",
    success: "text-emerald-700 dark:text-emerald-400",
  };

  return (
    <div
      className={`rounded-xl border p-4 transition-colors ${classes[tone]}`}
    >
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1 text-2xl font-semibold ${valueClasses[tone]}`}
      >
        {value}
      </p>
    </div>
  );
}

function getStockPercentage(
  quantity: number,
  minimumStockLevel: number
): number {
  if (minimumStockLevel <= 0) {
    return quantity > 0 ? 100 : 0;
  }

  return Math.min(
    100,
    Math.max(
      8,
      (quantity / minimumStockLevel) * 100
    )
  );
}

function getMovementTone(
  type: string
): "success" | "warning" | "danger" | "neutral" {
  if (type.includes("IN")) return "success";
  if (type.includes("OUT")) return "danger";
  if (type.includes("ADJUST")) return "warning";

  return "neutral";
}

function ActionButton({
  label,
  onClick,
  children,
  tone = "neutral",
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
  tone?: "success" | "danger" | "neutral";
}) {
  const toneClasses = {
    success:
      "text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700 dark:text-emerald-400 dark:hover:bg-emerald-950/50 dark:hover:text-emerald-300",
    danger:
      "text-rose-600 hover:bg-rose-50 hover:text-rose-700 dark:text-rose-400 dark:hover:bg-rose-950/50 dark:hover:text-rose-300",
    neutral:
      "text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-slate-100",
  };

  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={`rounded-lg border border-slate-200 p-2 transition-colors dark:border-slate-700 ${toneClasses[tone]}`}
    >
      {children}
    </button>
  );
}

function StockChangeForm({
  submitting,
  onCancel,
  onSubmit,
}: {
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (
    values: StockChangeFormValues
  ) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StockChangeFormValues>({
    resolver: zodResolver(stockChangeSchema),
    defaultValues: {
      quantity: 1,
      reason: "",
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Field
        label="Quantity"
        error={errors.quantity?.message}
      >
        <input
          {...register("quantity", {
            valueAsNumber: true,
          })}
          type="number"
          min="1"
          placeholder="Enter quantity"
          className={inputClass}
        />
      </Field>

      <Field
        label="Reason"
        error={errors.reason?.message}
      >
        <input
          {...register("reason")}
          placeholder="e.g. New stock received"
          className={inputClass}
        />
      </Field>

      <FormActions
        submitting={submitting}
        submitLabel="Save"
        onCancel={onCancel}
      />
    </form>
  );
}

function StockAdjustForm({
  submitting,
  onCancel,
  onSubmit,
}: {
  submitting?: boolean;
  onCancel: () => void;
  onSubmit: (
    values: StockAdjustFormValues
  ) => Promise<void>;
}) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<StockAdjustFormValues>({
    resolver: zodResolver(stockAdjustSchema),
    defaultValues: {
      quantity: 0,
      reason: "",
    },
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
    >
      <Field
        label="New quantity"
        error={errors.quantity?.message}
      >
        <input
          {...register("quantity", {
            valueAsNumber: true,
          })}
          type="number"
          min="0"
          placeholder="Enter new stock quantity"
          className={inputClass}
        />
      </Field>

      <Field
        label="Reason"
        error={errors.reason?.message}
      >
        <input
          {...register("reason")}
          placeholder="e.g. Physical stock count correction"
          className={inputClass}
        />
      </Field>

      <FormActions
        submitting={submitting}
        submitLabel="Adjust"
        onCancel={onCancel}
      />
    </form>
  );
}

function FormActions({
  submitting,
  submitLabel,
  onCancel,
}: {
  submitting?: boolean;
  submitLabel: string;
  onCancel: () => void;
}) {
  return (
    <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
      <button
        type="button"
        onClick={onCancel}
        disabled={submitting}
        className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
      >
        Cancel
      </button>

      <button
        type="submit"
        disabled={submitting}
        className="rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
      >
        {submitting ? "Saving..." : submitLabel}
      </button>
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
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="mt-1.5">
        {children}
      </div>

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