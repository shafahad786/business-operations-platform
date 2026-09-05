import { Clock3 } from "lucide-react";
import { useParams } from "react-router-dom";
import { MODULE_TITLES } from "../lib/navigation";

export default function ComingSoonPage() {
  const { module } = useParams();
  const title = (module && MODULE_TITLES[module]) || "This module";

  return (
    <section className="mx-auto max-w-3xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-50 text-blue-700">
        <Clock3 className="h-6 w-6" />
      </div>
      <h2 className="mt-4 text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-2 text-sm leading-6 text-slate-600 sm:text-base">
        Coming in next phase. This placeholder keeps navigation ready without
        implementing business modules yet.
      </p>
    </section>
  );
}
