type PageCardProps = {
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
};

export default function PageCard({
  title,
  description,
  action,
  className,
  children,
}: PageCardProps) {
  return (
    <section
      className={`overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-200 dark:border-slate-800 dark:bg-slate-900 ${
        className ?? ""
      }`}
    >
      <div className="flex flex-col gap-3 border-b border-slate-200 bg-slate-50/60 px-4 py-4 transition-colors dark:border-slate-800 dark:bg-slate-900/70 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-tight text-slate-900 dark:text-white sm:text-lg">
            {title}
          </h2>

          {description ? (
            <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-500 dark:text-slate-400">
              {description}
            </p>
          ) : null}
        </div>

        {action ? (
          <div className="shrink-0">
            {action}
          </div>
        ) : null}
      </div>

      <div className="p-4 sm:p-6">
        {children}
      </div>
    </section>
  );
}