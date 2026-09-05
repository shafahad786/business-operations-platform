import { Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { toast } from "sonner";
import CustomerForm from "../components/customers/CustomerForm";
import Dialog, { ConfirmDialog } from "../components/ui/Dialog";
import PageCard from "../components/ui/PageCard";
import Pagination from "../components/ui/Pagination";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "../components/ui/StateBlocks";
import { useAuth } from "../contexts/AuthContext";
import type { CustomerFormValues } from "../lib/schemas";
import { formatDate, getErrorMessage } from "../lib/utils";
import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../services/customerService";
import type { Customer } from "../types/customer";

export default function CustomersPage() {
  const { user } = useAuth();
  const canDelete = user?.role === "ADMIN" || user?.role === "MANAGER";

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(
    null
  );
  const [deleteTarget, setDeleteTarget] = useState<Customer | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const loadCustomers = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getCustomers({
        page,
        size: 10,
        search: query || undefined,
      });

      setCustomers(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      setError(getErrorMessage(err, "Failed to load customers"));
    } finally {
      setLoading(false);
    }
  }, [page, query]);

  useEffect(() => {
    void loadCustomers();
  }, [loadCustomers]);

  const handleSubmit = async (values: CustomerFormValues) => {
    setSubmitting(true);

    try {
      if (editingCustomer) {
        await updateCustomer(editingCustomer.id, values);
        toast.success("Customer updated successfully");
      } else {
        await createCustomer(values);
        toast.success("Customer created successfully");
      }

      setFormOpen(false);
      setEditingCustomer(null);
      await loadCustomers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to save customer"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;

    setSubmitting(true);

    try {
      await deleteCustomer(deleteTarget.id);
      toast.success("Customer deleted");
      setDeleteTarget(null);
      await loadCustomers();
    } catch (err) {
      toast.error(getErrorMessage(err, "Failed to delete customer"));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PageCard
      title="Customers"
      description="Manage customer records for sales and billing."
      action={
        <button
          type="button"
          onClick={() => {
            setEditingCustomer(null);
            setFormOpen(true);
          }}
          className="inline-flex items-center gap-2 rounded-lg bg-blue-700 px-4 py-2 text-sm font-medium text-white shadow-sm transition hover:bg-blue-800 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          <Plus className="h-4 w-4" />
          Add Customer
        </button>
      }
    >
      <form
        className="mb-5 flex flex-col gap-3 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          setPage(0);
          setQuery(search.trim());
        }}
      >
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500" />

          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name, email, company, or phone"
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-10 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 dark:focus:border-blue-500"
          />
        </div>

        <button
          type="submit"
          className="rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
        >
          Search
        </button>
      </form>

      {loading ? <LoadingState message="Loading customers..." /> : null}

      {error ? <ErrorState message={error} /> : null}

      {!loading && !error && customers.length === 0 ? (
        <EmptyState
          title="No customers found"
          description="Create your first customer to get started."
        />
      ) : null}

      {!loading && !error && customers.length > 0 ? (
        <>
          <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800">
            <table className="min-w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50 text-slate-500 dark:border-slate-800 dark:bg-slate-950 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Company</th>
                  <th className="px-4 py-3 font-medium">Email</th>
                  <th className="px-4 py-3 font-medium">Phone</th>
                  <th className="px-4 py-3 font-medium">Created</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody>
                {customers.map((customer) => (
                  <tr
                    key={customer.id}
                    className="border-b border-slate-100 last:border-0 transition-colors hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
                  >
                    <td className="px-4 py-3 font-medium text-slate-900 dark:text-slate-100">
                      {customer.name}
                    </td>

                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {customer.company || "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {customer.email || "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-700 dark:text-slate-300">
                      {customer.phone || "-"}
                    </td>

                    <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                      {formatDate(customer.createdAt)}
                    </td>

                    <td className="px-4 py-3">
                      <div className="flex gap-1">
                        <Link
                          to={`/app/customers/${customer.id}`}
                          className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                          aria-label="View customer"
                          title="View customer"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            setEditingCustomer(customer);
                            setFormOpen(true);
                          }}
                          className="rounded-md p-2 text-slate-600 transition hover:bg-slate-100 hover:text-blue-600 dark:text-slate-400 dark:hover:bg-slate-700 dark:hover:text-blue-400"
                          aria-label="Edit customer"
                          title="Edit customer"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {canDelete ? (
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(customer)}
                            className="rounded-md p-2 text-rose-600 transition hover:bg-rose-50 dark:text-rose-400 dark:hover:bg-rose-950/50"
                            aria-label="Delete customer"
                            title="Delete customer"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
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

      <Dialog
        open={formOpen}
        title={editingCustomer ? "Edit Customer" : "Add Customer"}
        onClose={() => {
          setFormOpen(false);
          setEditingCustomer(null);
        }}
      >
        <CustomerForm
          initialValues={editingCustomer}
          submitting={submitting}
          onCancel={() => {
            setFormOpen(false);
            setEditingCustomer(null);
          }}
          onSubmit={handleSubmit}
        />
      </Dialog>

      <ConfirmDialog
        open={Boolean(deleteTarget)}
        title="Delete customer"
        message={`Are you sure you want to delete ${deleteTarget?.name}?`}
        confirmLabel="Delete"
        loading={submitting}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
      />
    </PageCard>
  );
}