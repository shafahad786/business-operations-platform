import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  customerSchema,
  type CustomerFormValues,
} from "../../lib/schemas";
import type { Customer } from "../../types/customer";

type CustomerFormProps = {
  initialValues?: Customer | null;
  onSubmit: (values: CustomerFormValues) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
};

export default function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  submitting = false,
}: CustomerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CustomerFormValues>({
    resolver: zodResolver(customerSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      email: initialValues?.email ?? "",
      phone: initialValues?.phone ?? "",
      company: initialValues?.company ?? "",
      address: initialValues?.address ?? "",
    },
  });

  const isEditing = Boolean(initialValues);

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      <div className="rounded-xl border border-blue-100 bg-blue-50/60 px-4 py-3 dark:border-blue-900/50 dark:bg-blue-950/30">
        <p className="text-sm font-medium text-blue-900 dark:text-blue-200">
          {isEditing ? "Update customer information" : "Add a new customer"}
        </p>

        <p className="mt-1 text-xs leading-5 text-blue-700 dark:text-blue-300">
          Keep customer details accurate so orders and invoices remain
          consistent.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          label="Name"
          required
          error={errors.name?.message}
        >
          <input
            {...register("name")}
            type="text"
            autoComplete="name"
            placeholder="Enter customer name"
            className={getInputClass(Boolean(errors.name))}
          />
        </Field>

        <Field
          label="Email"
          error={errors.email?.message}
        >
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="customer@example.com"
            className={getInputClass(Boolean(errors.email))}
          />
        </Field>

        <Field
          label="Phone"
          error={errors.phone?.message}
        >
          <input
            {...register("phone")}
            type="tel"
            autoComplete="tel"
            placeholder="Enter phone number"
            className={getInputClass(Boolean(errors.phone))}
          />
        </Field>

        <Field
          label="Company"
          error={errors.company?.message}
        >
          <input
            {...register("company")}
            type="text"
            autoComplete="organization"
            placeholder="Company name"
            className={getInputClass(Boolean(errors.company))}
          />
        </Field>
      </div>

      <Field
        label="Address"
        error={errors.address?.message}
      >
        <textarea
          {...register("address")}
          rows={4}
          placeholder="Enter customer address"
          className={`${getInputClass(Boolean(errors.address))} resize-none`}
        />
      </Field>

      <div className="flex flex-col-reverse gap-2 border-t border-slate-200 pt-5 dark:border-slate-800 sm:flex-row sm:justify-end">
        <button
          type="button"
          onClick={onCancel}
          disabled={submitting}
          className="inline-flex min-h-10 items-center justify-center rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:border-slate-600 dark:hover:bg-slate-700"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={submitting}
          className="inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-blue-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:bg-blue-800 hover:shadow disabled:cursor-not-allowed disabled:opacity-60 dark:bg-blue-600 dark:hover:bg-blue-500"
        >
          {submitting ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              {isEditing ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>{isEditing ? "Save changes" : "Create customer"}</>
          )}
        </button>
      </div>
    </form>
  );
}

function Field({
  label,
  required = false,
  error,
  children,
}: {
  label: string;
  required?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
        {label}

        {required ? (
          <span
            className="ml-1 text-rose-500"
            aria-label="required"
          >
            *
          </span>
        ) : null}
      </label>

      <div className="mt-1.5">{children}</div>

      {error ? (
        <p
          className="mt-1.5 text-xs font-medium text-rose-600 dark:text-rose-400"
          role="alert"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

function getInputClass(hasError: boolean) {
  return `w-full rounded-lg border bg-white px-3 py-2.5 text-sm text-slate-900 shadow-sm outline-none transition-all placeholder:text-slate-400 hover:border-slate-400 dark:bg-slate-950 dark:text-slate-100 dark:placeholder:text-slate-500 ${
    hasError
      ? "border-rose-400 ring-2 ring-rose-500/10 focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 dark:border-rose-700 dark:focus:border-rose-500"
      : "border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 dark:border-slate-700 dark:focus:border-blue-500"
  }`;
}