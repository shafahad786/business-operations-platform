import { LoaderCircle } from "lucide-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  productSchema,
  type ProductFormValues,
} from "../../lib/schemas";
import type { Product } from "../../types/product";

type ProductFormProps = {
  initialValues?: Product | null;
  isEdit?: boolean;
  onSubmit: (values: ProductFormValues) => Promise<void>;
  onCancel: () => void;
  submitting?: boolean;
};

export default function ProductForm({
  initialValues,
  isEdit = false,
  onSubmit,
  onCancel,
  submitting = false,
}: ProductFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      sku: initialValues?.sku ?? "",
      category: initialValues?.category ?? "",
      description: initialValues?.description ?? "",
      sellingPrice: initialValues?.sellingPrice ?? 0,
      costPrice: initialValues?.costPrice ?? 0,
      minimumStockLevel: initialValues?.minimumStockLevel ?? 0,
      active: initialValues?.active ?? true,
      initialStock: initialValues ? undefined : 0,
    },
  });

  return (
    <form
      className="space-y-6"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
    >
      {/* Product information */}
      <FormSection
        title="Product information"
        description="Enter the basic details used to identify and manage this product."
      >
        <div className="space-y-5">
          <Field
            label="Product name"
            required
            error={errors.name?.message}
          >
            <input
              {...register("name")}
              type="text"
              placeholder="e.g. Business Laptop"
              autoComplete="off"
              className={getInputClass(Boolean(errors.name))}
            />
          </Field>

          <div className="grid gap-5 sm:grid-cols-2">
            <Field
              label="SKU"
              required
              error={errors.sku?.message}
            >
              <input
                {...register("sku")}
                type="text"
                placeholder="e.g. LAP-001"
                autoComplete="off"
                className={getInputClass(Boolean(errors.sku))}
              />
            </Field>

            <Field
              label="Category"
              error={errors.category?.message}
            >
              <input
                {...register("category")}
                type="text"
                placeholder="e.g. Electronics"
                autoComplete="off"
                className={getInputClass(Boolean(errors.category))}
              />
            </Field>
          </div>

          <Field
            label="Description"
            error={errors.description?.message}
          >
            <textarea
              {...register("description")}
              rows={4}
              placeholder="Add a short description of the product..."
              className={`${getInputClass(
                Boolean(errors.description)
              )} resize-none`}
            />
          </Field>
        </div>
      </FormSection>

      {/* Pricing */}
      <FormSection
        title="Pricing"
        description="Set the selling and internal cost price for this product."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Selling price"
            required
            error={errors.sellingPrice?.message}
          >
            <MoneyInput
              name="sellingPrice"
              register={register}
              hasError={Boolean(errors.sellingPrice)}
              placeholder="0.00"
            />
          </Field>

          <Field
            label="Cost price"
            required
            error={errors.costPrice?.message}
          >
            <MoneyInput
              name="costPrice"
              register={register}
              hasError={Boolean(errors.costPrice)}
              placeholder="0.00"
            />
          </Field>
        </div>
      </FormSection>

      {/* Inventory */}
      <FormSection
        title="Inventory"
        description="Configure stock thresholds and initial inventory."
      >
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            label="Minimum stock level"
            error={errors.minimumStockLevel?.message}
          >
            <input
              {...register("minimumStockLevel", {
                valueAsNumber: true,
              })}
              type="number"
              min="0"
              placeholder="0"
              className={getInputClass(
                Boolean(errors.minimumStockLevel)
              )}
            />
          </Field>

          {!isEdit ? (
            <Field
              label="Initial stock"
              error={errors.initialStock?.message}
            >
              <input
                {...register("initialStock", {
                  valueAsNumber: true,
                })}
                type="number"
                min="0"
                placeholder="0"
                className={getInputClass(
                  Boolean(errors.initialStock)
                )}
              />
            </Field>
          ) : null}
        </div>

        {!isEdit ? (
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 px-3.5 py-3 dark:border-slate-800 dark:bg-slate-950">
            <p className="text-xs leading-5 text-slate-500 dark:text-slate-400">
              Initial stock is added when the product is created. Future
              stock changes should be recorded through Inventory.
            </p>
          </div>
        ) : (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-3.5 py-3 dark:border-amber-900/60 dark:bg-amber-950/30">
            <p className="text-xs leading-5 text-amber-700 dark:text-amber-300">
              Editing a product does not change its current stock. Use
              Inventory to record stock movements.
            </p>
          </div>
        )}
      </FormSection>

      {/* Active status */}
      <FormSection
        title="Product status"
        description="Control whether this product can be used in normal operations."
      >
        <label className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-200 bg-slate-50 p-4 transition-colors hover:border-slate-300 hover:bg-slate-100 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-slate-700 dark:hover:bg-slate-900">
          <input
            type="checkbox"
            {...register("active")}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-2 focus:ring-blue-500/30 dark:border-slate-600 dark:bg-slate-800"
          />

          <span className="min-w-0">
            <span className="block text-sm font-semibold text-slate-900 dark:text-slate-100">
              Active product
            </span>

            <span className="mt-1 block text-xs leading-5 text-slate-500 dark:text-slate-400">
              Active products can be used in sales orders and inventory
              operations.
            </span>
          </span>
        </label>
      </FormSection>

      {/* Actions */}
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
              {isEdit ? "Saving..." : "Creating..."}
            </>
          ) : (
            <>{isEdit ? "Save changes" : "Create product"}</>
          )}
        </button>
      </div>
    </form>
  );
}

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border-b border-slate-200 pb-6 last:border-b-0 last:pb-0 dark:border-slate-800">
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100">
          {title}
        </h3>

        <p className="mt-1 text-xs leading-5 text-slate-500 dark:text-slate-400">
          {description}
        </p>
      </div>

      {children}
    </section>
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

function MoneyInput({
  name,
  register,
  hasError,
  placeholder,
}: {
  name: "sellingPrice" | "costPrice";
  register: ReturnType<typeof useForm<ProductFormValues>>["register"];
  hasError: boolean;
  placeholder: string;
}) {
  return (
    <div className="relative">
      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-semibold text-slate-400 dark:text-slate-500">
        ₹
      </span>

      <input
        {...register(name, {
          valueAsNumber: true,
        })}
        type="number"
        step="0.01"
        min="0"
        placeholder={placeholder}
        className={`${getInputClass(hasError)} pl-8`}
      />
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