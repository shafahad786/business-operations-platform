import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import ProductForm from "../components/products/ProductForm";
import Dialog, { ConfirmDialog } from "../components/ui/Dialog";
import PageCard from "../components/ui/PageCard";
import Pagination from "../components/ui/Pagination";
import StatusBadge from "../components/ui/StatusBadge";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import { useAuth } from "../contexts/AuthContext";
import type { ProductFormValues } from "../lib/schemas";
import { formatCurrency, getErrorMessage } from "../lib/utils";
import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/productService";
import type { Product } from "../types/product";

export default function ProductsPage() {
  const { user } = useAuth();

  const canModify =
    user?.role === "ADMIN" || user?.role === "MANAGER";

  const [products, setProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");

  const [category, setCategory] = useState("");
  const [activeFilter, setActiveFilter] = useState<
    "" | "true" | "false"
  >("");

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [viewProduct, setViewProduct] = useState<Product | null>(null);

  const [submitting, setSubmitting] = useState(false);

  const loadProducts = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getProducts({
        page,
        size: 10,
        search: query || undefined,
        category: category || undefined,
        active:
          activeFilter === ""
            ? undefined
            : activeFilter === "true",
      });

      setProducts(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load products"));
    } finally {
      setLoading(false);
    }
  }, [page, query, category, activeFilter]);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const categories = useMemo(
    () =>
      [
        ...new Set(
          products
            .map((product) => product.category)
            .filter(Boolean)
        ),
      ] as string[],
    [products]
  );

  const handleSubmit = async (values: ProductFormValues) => {
    setSubmitting(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, values);
        toast.success("Product updated successfully");
      } else {
        await createProduct(values);
        toast.success("Product created successfully");
      }

      setFormOpen(false);
      setEditingProduct(null);

      await loadProducts();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save product"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);

    try {
      await deleteProduct(deleteTarget.id);

      toast.success("Product removed or deactivated");

      setDeleteTarget(null);

      await loadProducts();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete product"));
    } finally {
      setSubmitting(false);
    }
  };

  const openAddProduct = () => {
    setEditingProduct(null);
    setFormOpen(true);
  };

  const openEditProduct = (product: Product) => {
    setEditingProduct(product);
    setFormOpen(true);
  };

  const closeProductForm = () => {
    setFormOpen(false);
    setEditingProduct(null);
  };

  return (
    <PageCard
      title="Products"
      description="Manage your product catalog, pricing, and stock thresholds."
      action={
        canModify ? (
          <button
            type="button"
            onClick={openAddProduct}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow-md dark:bg-blue-600 dark:hover:bg-blue-500"
          >
            <Plus className="h-4 w-4" />
            Add Product
          </button>
        ) : null
      }
    >
      {/* Filters */}
      <div className="mb-5 rounded-xl border border-slate-200 bg-slate-50/70 p-3 transition-colors dark:border-slate-800 dark:bg-slate-950/60">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_180px_auto]">
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
              placeholder="Search by product name or SKU"
              className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
            />
          </form>

          <select
            value={category}
            onChange={(event) => {
              setCategory(event.target.value);
              setPage(0);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
          >
            <option value="">All categories</option>

            {categories.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <select
            value={activeFilter}
            onChange={(event) => {
              setActiveFilter(
                event.target.value as "" | "true" | "false"
              );
              setPage(0);
            }}
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:focus:border-blue-500"
          >
            <option value="">All statuses</option>
            <option value="true">Active</option>
            <option value="false">Inactive</option>
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

      {/* Loading */}
      {loading ? (
        <LoadingState message="Loading products..." />
      ) : null}

      {/* Error */}
      {error ? <ErrorState message={error} /> : null}

      {/* Empty */}
      {!loading && !error && products.length === 0 ? (
        <EmptyState
          title="No products found"
          description="Add products to start managing your catalog and inventory."
        />
      ) : null}

      {/* Product table */}
      {!loading && !error && products.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-[1000px] text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">
                    Product
                  </th>

                  <th className="px-4 py-3 font-medium">
                    SKU
                  </th>

                  <th className="px-4 py-3 font-medium">
                    Category
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Selling Price
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Stock
                  </th>

                  <th className="px-4 py-3 text-right font-medium">
                    Minimum Stock
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
                {products.map((product) => (
                  <tr
                    key={product.id}
                    className="border-b border-slate-100 transition-colors last:border-0 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3">
                      <div className="min-w-0">
                        <p className="font-medium text-slate-900 dark:text-slate-100">
                          {product.name}
                        </p>

                        {product.description ? (
                          <p className="mt-0.5 max-w-xs truncate text-xs text-slate-500 dark:text-slate-500">
                            {product.description}
                          </p>
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-600 dark:text-slate-400">
                      {product.sku}
                    </td>

                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {product.category || "-"}
                    </td>

                    <td className="px-4 py-3 text-right font-semibold text-slate-900 dark:text-slate-100">
                      {formatCurrency(product.sellingPrice)}
                    </td>

                    <td className="px-4 py-3 text-right font-medium text-slate-800 dark:text-slate-200">
                      {product.stockQuantity}
                    </td>

                    <td className="px-4 py-3 text-right text-slate-600 dark:text-slate-400">
                      {product.minimumStockLevel}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <StatusBadge
                          label={
                            product.active
                              ? "Active"
                              : "Inactive"
                          }
                          tone={
                            product.active
                              ? "success"
                              : "neutral"
                          }
                        />

                        {product.lowStock ? (
                          <StatusBadge
                            label="Low stock"
                            tone="warning"
                          />
                        ) : null}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() =>
                            setViewProduct(product)
                          }
                          className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                          aria-label="View product"
                          title="View product"
                        >
                          <Eye className="h-4 w-4" />
                        </button>

                        {canModify ? (
                          <>
                            <button
                              type="button"
                              onClick={() =>
                                openEditProduct(product)
                              }
                              className="rounded-lg p-2 text-slate-500 transition-colors hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                              aria-label="Edit product"
                              title="Edit product"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() =>
                                setDeleteTarget(product)
                              }
                              className="rounded-lg p-2 text-rose-600 transition-colors hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                              aria-label="Delete product"
                              title="Delete product"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </>
                        ) : null}
                      </div>
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

      {/* Add/Edit Product */}
      <Dialog
        open={formOpen}
        title={
          editingProduct
            ? "Edit Product"
            : "Add Product"
        }
        onClose={closeProductForm}
      >
        <ProductForm
          initialValues={editingProduct}
          isEdit={Boolean(editingProduct)}
          submitting={submitting}
          onCancel={closeProductForm}
          onSubmit={handleSubmit}
        />
      </Dialog>

      {/* Delete confirmation */}
      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete or deactivate product"
        message={`Remove ${deleteTarget?.name}? Products with inventory history will be deactivated instead of deleted.`}
        confirmLabel="Confirm"
        loading={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />

      {/* Product details */}
      <Dialog
        open={Boolean(viewProduct)}
        title="Product details"
        onClose={() => setViewProduct(null)}
      >
        {viewProduct ? (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailItem
                label="Name"
                value={viewProduct.name}
              />

              <DetailItem
                label="SKU"
                value={viewProduct.sku}
                mono
              />

              <DetailItem
                label="Category"
                value={viewProduct.category || "-"}
              />

              <DetailItem
                label="Status"
                value={
                  viewProduct.active
                    ? "Active"
                    : "Inactive"
                }
              />

              <DetailItem
                label="Selling price"
                value={formatCurrency(
                  viewProduct.sellingPrice
                )}
              />

              <DetailItem
                label="Cost price"
                value={formatCurrency(
                  viewProduct.costPrice
                )}
              />

              <DetailItem
                label="Stock"
                value={String(
                  viewProduct.stockQuantity
                )}
              />

              <DetailItem
                label="Minimum stock"
                value={String(
                  viewProduct.minimumStockLevel
                )}
              />
            </div>

            <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-slate-800 dark:bg-slate-950">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
                Description
              </p>

              <p className="mt-2 whitespace-pre-wrap break-words text-sm leading-6 text-slate-700 dark:text-slate-300">
                {viewProduct.description || "-"}
              </p>
            </div>
          </div>
        ) : null}
      </Dialog>
    </PageCard>
  );
}

function DetailItem({
  label,
  value,
  mono = false,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors dark:border-slate-800 dark:bg-slate-950">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-500">
        {label}
      </p>

      <p
        className={`mt-1.5 text-sm font-semibold text-slate-900 dark:text-slate-100 ${
          mono ? "font-mono text-xs" : ""
        }`}
      >
        {value}
      </p>
    </div>
  );
}