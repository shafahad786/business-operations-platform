type StatusBadgeProps = {
  label: string;
  tone?: "success" | "warning" | "danger" | "neutral";
};

const TONES = {
  success:
    "bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:ring-emerald-800/70",

  warning:
    "bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:ring-amber-800/70",

  danger:
    "bg-rose-50 text-rose-700 ring-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:ring-rose-800/70",

  neutral:
    "bg-slate-100 text-slate-700 ring-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:ring-slate-700",
} as const;

export default function StatusBadge({
  label,
  tone = "neutral",
}: StatusBadgeProps) {
  return (
    <span
      className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-semibold leading-none ring-1 ${TONES[tone]}`}
    >
      <span
        className={`mr-1.5 h-1.5 w-1.5 rounded-full ${
          tone === "success"
            ? "bg-emerald-500"
            : tone === "warning"
              ? "bg-amber-500"
              : tone === "danger"
                ? "bg-rose-500"
                : "bg-slate-400 dark:bg-slate-500"
        }`}
      />

      {label}
    </span>
  );
}