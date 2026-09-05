import { ArrowLeft, PackagePlus, Plus, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import PageCard from "../components/ui/PageCard";
import { ErrorState, LoadingState } from "../components/ui/StateBlocks";
import { formatCurrency, getErrorMessage } from "../lib/utils";
import { getCustomers } from "../services/customerService";
import { createOrder } from "../services/orderService";
import { getProducts } from "../services/productService";
import type { Customer } from "../types/customer";
import type { OrderLineDraft } from "../types/order";
import type { Product } from "../types/product";

export default function CreateOrderPage() {
  const navigate = useNavigate();

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [taxAmount, setTaxAmount] = useState("0");
  const [notes, setNotes] = useState("");

  const [lines, setLines] = useState<OrderLineDraft[]>([]);
  const [selectedProductId, setSelectedProductId] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);

      try {
        const [customerResponse, productResponse] = await Promise.all([
          getCustomers({ page: 0, size: 100 }),
          getProducts({
            page: 0,
            size: 100,
            active: true,
          }),
        ]);

        setCustomers(customerResponse.content);
        setProducts(productResponse.content);
      } catch (err) {
        setError(
          getErrorMessage(
            err,
            "Failed to load order form data"
          )
        );
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, []);

  const availableProducts = useMemo(
    () =>
      products.filter(
        (product) =>
          !lines.some(
            (line) => line.productId === product.id
          )
      ),
    [products, lines]
  );

  const subtotal = useMemo(
    () =>
      lines.reduce(
        (sum, line) =>
          sum + line.unitPrice * line.quantity,
        0
      ),
    [lines]
  );

  const tax = Number(taxAmount) || 0;
  const total = subtotal + tax;

  const addLine = () => {
    const product = products.find(
      (item) => item.id === Number(selectedProductId)
    );

    if (!product) return;

    if (
      lines.some(
        (line) => line.productId === product.id
      )
    ) {
      toast.error(
        "Product already added to this order"
      );
      return;
    }

    setLines((current) => [
      ...current,
      {
        productId: product.id,
        productName: product.name,
        sku: product.sku,
        unitPrice: product.sellingPrice,
        stockQuantity: product.stockQuantity,
        quantity: 1,
      },
    ]);

    setSelectedProductId("");
  };

  const updateQuantity = (
    productId: number,
    quantity: number
  ) => {
    setLines((current) =>
      current.map((line) =>
        line.productId === productId
          ? {
              ...line,
              quantity: Math.max(1, quantity),
            }
          : line
      )
    );
  };

  const removeLine = (productId: number) => {
    setLines((current) =>
      current.filter(
        (line) => line.productId !== productId
      )
    );
  };

  const handleSubmit = async () => {
    if (!customerId) {
      toast.error("Select a customer");
      return;
    }

    if (lines.length === 0) {
      toast.error("Add at least one product");
      return;
    }

    if (tax < 0) {
      toast.error("Tax cannot be negative");
      return;
    }

    setSubmitting(true);

    try {
      const order = await createOrder({
        customerId: Number(customerId),
        taxAmount: tax,
        notes: notes.trim() || undefined,
        items: lines.map((line) => ({
          productId: line.productId,
          quantity: line.quantity,
        })),
      });

      toast.success("Order saved as draft");

      navigate(`/app/orders/${order.id}`);
    } catch (err) {
      toast.error(
        getErrorMessage(
          err,
          "Failed to create order"
        )
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <LoadingState message="Loading order form..." />
    );
  }

  if (error) {
    return <ErrorState message={error} />;
  }

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

      <PageCard
        title="Create Sales Order"
        description="Build a draft order before confirmation."
      >
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1.5fr)_360px]">
          {/* Main form */}
          <div className="space-y-6">
            {/* Customer */}
            <section>
              <div className="mb-3">
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Customer
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Select the customer associated with this
                  order.
                </p>
              </div>

              <Field label="Customer">
                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(event.target.value)
                  }
                  className={inputClass}
                >
                  <option value="">
                    Select customer
                  </option>

                  {customers.map((customer) => (
                    <option
                      key={customer.id}
                      value={customer.id}
                    >
                      {customer.name}
                    </option>
                  ))}
                </select>
              </Field>
            </section>

            {/* Products */}
            <section className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <div className="mb-3 flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400">
                  <PackagePlus className="h-4 w-4" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                    Products
                  </h3>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Add products and specify the required
                    quantities.
                  </p>
                </div>
              </div>

              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 dark:border-slate-800 dark:bg-slate-950/60">
                <div className="flex flex-col gap-3 sm:flex-row">
                  <select
                    value={selectedProductId}
                    onChange={(event) =>
                      setSelectedProductId(
                        event.target.value
                      )
                    }
                    className={inputClass}
                  >
                    <option value="">
                      Select product
                    </option>

                    {availableProducts.map((product) => (
                      <option
                        key={product.id}
                        value={product.id}
                      >
                        {product.name} ({product.sku}) —
                        Stock: {product.stockQuantity}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    onClick={addLine}
                    disabled={!selectedProductId}
                    className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-50 dark:bg-blue-600 dark:hover:bg-blue-500"
                  >
                    <Plus className="h-4 w-4" />
                    Add item
                  </button>
                </div>
              </div>
            </section>

            {/* Order items */}
            <section>
              {lines.length > 0 ? (
                <>
                  <div className="mb-3 flex items-center justify-between">
                    <div>
                      <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                        Order items
                      </h3>

                      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {lines.length}{" "}
                        {lines.length === 1
                          ? "product"
                          : "products"}{" "}
                        added
                      </p>
                    </div>
                  </div>

                  <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
                    <table className="min-w-[850px] text-left text-sm">
                      <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                        <tr>
                          <th className="px-4 py-3 font-medium">
                            Product
                          </th>

                          <th className="px-4 py-3 text-right font-medium">
                            Unit price
                          </th>

                          <th className="px-4 py-3 text-center font-medium">
                            Stock
                          </th>

                          <th className="px-4 py-3 text-center font-medium">
                            Quantity
                          </th>

                          <th className="px-4 py-3 text-right font-medium">
                            Line total
                          </th>

                          <th className="px-4 py-3" />
                        </tr>
                      </thead>

                      <tbody>
                        {lines.map((line) => (
                          <tr
                            key={line.productId}
                            className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                          >
                            <td className="px-4 py-3">
                              <p className="font-medium text-slate-900 dark:text-slate-100">
                                {line.productName}
                              </p>

                              <p className="mt-0.5 font-mono text-xs text-slate-500 dark:text-slate-500">
                                {line.sku}
                              </p>
                            </td>

                            <td className="px-4 py-3 text-right text-slate-700 dark:text-slate-300">
                              {formatCurrency(
                                line.unitPrice
                              )}
                            </td>

                            <td className="px-4 py-3 text-center">
                              <span
                                className={`inline-flex min-w-10 items-center justify-center rounded-full px-2 py-1 text-xs font-medium ${
                                  line.stockQuantity > 0
                                    ? "bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300"
                                    : "bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300"
                                }`}
                              >
                                {line.stockQuantity}
                              </span>
                            </td>

                            <td className="px-4 py-3 text-center">
                              <input
                                type="number"
                                min={1}
                                value={line.quantity}
                                onChange={(event) =>
                                  updateQuantity(
                                    line.productId,
                                    Number(
                                      event.target.value
                                    )
                                  )
                                }
                                className="w-20 rounded-lg border border-slate-300 bg-white px-2.5 py-2 text-center text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
                              />
                            </td>

                            <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-white">
                              {formatCurrency(
                                line.unitPrice *
                                  line.quantity
                              )}
                            </td>

                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={() =>
                                  removeLine(
                                    line.productId
                                  )
                                }
                                className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                                aria-label={`Remove ${line.productName}`}
                                title="Remove item"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              ) : (
                <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 px-6 py-10 text-center dark:border-slate-700 dark:bg-slate-950">
                  <PackagePlus className="mx-auto h-8 w-8 text-slate-400 dark:text-slate-500" />

                  <p className="mt-3 text-sm font-medium text-slate-900 dark:text-slate-100">
                    No products added yet
                  </p>

                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Select a product above to start building
                    the order.
                  </p>
                </div>
              )}
            </section>

            {/* Notes */}
            <section className="border-t border-slate-200 pt-6 dark:border-slate-800">
              <Field label="Notes">
                <textarea
                  value={notes}
                  onChange={(event) =>
                    setNotes(event.target.value)
                  }
                  rows={4}
                  placeholder="Add any notes or special instructions for this order..."
                  className={`${inputClass} resize-y`}
                />
              </Field>
            </section>
          </div>

          {/* Summary */}
          <aside>
            <div className="sticky top-6 rounded-2xl border border-slate-200 bg-slate-50 p-5 transition-colors dark:border-slate-800 dark:bg-slate-950">
              <div>
                <h3 className="text-base font-semibold text-slate-900 dark:text-white">
                  Order summary
                </h3>

                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Review the order total before saving
                  the draft.
                </p>
              </div>

              <dl className="mt-6 space-y-4">
                <SummaryRow
                  label="Items"
                  value={String(lines.length)}
                />

                <SummaryRow
                  label="Subtotal"
                  value={formatCurrency(subtotal)}
                />

                <div>
                  <dt className="text-sm text-slate-600 dark:text-slate-400">
                    Tax
                  </dt>

                  <dd className="mt-2">
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-slate-400 dark:text-slate-500">
                        ₹
                      </span>

                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        value={taxAmount}
                        onChange={(event) =>
                          setTaxAmount(
                            event.target.value
                          )
                        }
                        className={`${inputClass} pl-8`}
                      />
                    </div>
                  </dd>
                </div>

                <div className="border-t border-slate-200 pt-4 dark:border-slate-800">
                  <SummaryRow
                    label="Total"
                    value={formatCurrency(total)}
                    strong
                  />
                </div>
              </dl>

              <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50 p-3 dark:border-blue-900/50 dark:bg-blue-950/30">
                <p className="text-xs leading-5 text-blue-700 dark:text-blue-300">
                  Saving this order creates a{" "}
                  <strong>Draft</strong>. Inventory will
                  only be reduced when the order is
                  confirmed.
                </p>
              </div>

              <button
                type="button"
                disabled={submitting}
                onClick={handleSubmit}
                className="mt-5 w-full rounded-lg bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
              >
                {submitting
                  ? "Saving order..."
                  : "Save as Draft"}
              </button>

              <Link
                to="/app/orders"
                className="mt-2 flex w-full items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Cancel
              </Link>
            </div>
          </aside>
        </div>
      </PageCard>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
        {label}
      </label>

      <div className="mt-1.5">{children}</div>
    </div>
  );
}

function SummaryRow({
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

const inputClass =
  "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition-colors placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500";