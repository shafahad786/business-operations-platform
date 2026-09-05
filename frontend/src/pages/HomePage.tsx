import {
  ArrowRight,
  BarChart3,
  Bell,
  Boxes,
  BriefcaseBusiness,
  FileText,
  ShieldCheck,
  ShoppingCart,
  Users,
} from "lucide-react";
import { Link } from "react-router-dom";

const capabilities = [
  {
    icon: Users,
    title: "Customer Management",
    description: "Keep customer profiles, contact details, and business relationships organized.",
  },
  {
    icon: Boxes,
    title: "Inventory Control",
    description: "Track stock levels, movements, and low-stock items from one place.",
  },
  {
    icon: ShoppingCart,
    title: "Sales Orders",
    description: "Create and manage orders with automatic inventory updates when confirmed.",
  },
  {
    icon: FileText,
    title: "Invoices & Payments",
    description: "Manage invoices, payment records, balances, and payment status.",
  },
  {
    icon: BarChart3,
    title: "Business Dashboard",
    description: "Get a clear overview of sales, orders, customers, products, and stock.",
  },
  {
    icon: ShieldCheck,
    title: "Role-Based Access",
    description: "Different access levels for administrators, managers, and staff.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen overflow-hidden bg-slate-50 text-slate-900">
      {/* Header */}
      <header className="border-b border-slate-200/80 bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <div>
              <p className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                Business Operations
              </p>
              <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
                Platform
              </p>
            </div>
          </Link>

          <Link
            to="/login"
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-blue-200 hover:bg-blue-50 hover:text-blue-700"
          >
            Sign in
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </header>

      <main>
        {/* Hero */}
        <section className="relative">
          <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,_rgba(37,99,235,0.10),_transparent_35%),radial-gradient(circle_at_bottom_left,_rgba(14,165,233,0.08),_transparent_30%)]" />

          <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:px-8 lg:py-24">
            <div className="max-w-3xl">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                Business Operations Platform
              </div>

              <h1 className="text-4xl font-bold leading-tight tracking-tight text-slate-950 sm:text-5xl lg:text-6xl">
                Run your business from{" "}
                <span className="text-blue-700">one place.</span>
              </h1>

              <p className="mt-6 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                Manage customers, products, inventory, sales orders, invoices,
                and payments through a single business operations platform
                designed for everyday workflows.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <Link
                  to="/login"
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-700 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-700/20 transition hover:bg-blue-800 hover:shadow-blue-700/30"
                >
                  Open Application
                  <ArrowRight className="h-4 w-4" />
                </Link>

                <a
                  href="#capabilities"
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  Explore Features
                </a>
              </div>

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-emerald-600" />
                  Role-based access
                </span>

                <span className="flex items-center gap-2">
                  <BarChart3 className="h-4 w-4 text-blue-600" />
                  Business insights
                </span>

                <span className="flex items-center gap-2">
                  <Bell className="h-4 w-4 text-amber-600" />
                  Notifications
                </span>
              </div>
            </div>

            {/* Hero preview card */}
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-blue-100/50 blur-2xl" />

              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl shadow-slate-900/10">
                <div className="border-b border-slate-200 bg-slate-50 px-5 py-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-slate-500">
                        Business Overview
                      </p>
                      <p className="mt-1 text-lg font-bold text-slate-900">
                        Dashboard
                      </p>
                    </div>

                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
                      <BarChart3 className="h-5 w-5" />
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 p-5">
                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Customers
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      5
                    </p>
                    <p className="mt-1 text-xs text-emerald-600">
                      Active relationships
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Products
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      7
                    </p>
                    <p className="mt-1 text-xs text-blue-600">
                      Inventory tracked
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-white p-4">
                    <p className="text-xs font-medium text-slate-500">
                      Orders
                    </p>
                    <p className="mt-2 text-2xl font-bold text-slate-900">
                      6
                    </p>
                    <p className="mt-1 text-xs text-slate-500">
                      Sales activity
                    </p>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-blue-50 p-4">
                    <p className="text-xs font-medium text-blue-700">
                      Operations
                    </p>
                    <p className="mt-2 text-2xl font-bold text-blue-900">
                      Live
                    </p>
                    <p className="mt-1 text-xs text-blue-700">
                      Centralized workflow
                    </p>
                  </div>
                </div>

                <div className="mx-5 mb-5 rounded-xl bg-slate-900 p-4 text-white">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-slate-400">
                        Order workflow
                      </p>
                      <p className="mt-1 text-sm font-semibold">
                        Order → Invoice → Payment
                      </p>
                    </div>

                    <ArrowRight className="h-5 w-5 text-blue-400" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Capabilities */}
        <section
          id="capabilities"
          className="border-t border-slate-200 bg-white"
        >
          <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-wider text-blue-700">
                Everything connected
              </p>

              <h2 className="mt-3 text-3xl font-bold tracking-tight text-slate-950 sm:text-4xl">
                Built around your daily business workflow
              </h2>

              <p className="mt-4 text-base leading-7 text-slate-600">
                From the first customer interaction to completed payment, the
                platform keeps your operational data connected and organized.
              </p>
            </div>

            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {capabilities.map((capability) => {
                const Icon = capability.icon;

                return (
                  <div
                    key={capability.title}
                    className="group rounded-2xl border border-slate-200 bg-slate-50 p-6 transition duration-200 hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-lg hover:shadow-slate-900/5"
                  >
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-700 transition group-hover:bg-blue-700 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <h3 className="mt-5 text-base font-bold text-slate-900">
                      {capability.title}
                    </h3>

                    <p className="mt-2 text-sm leading-6 text-slate-600">
                      {capability.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="bg-slate-950">
          <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8 lg:py-16">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-blue-400">
                  Ready to get started?
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-white sm:text-3xl">
                  Bring your business operations together.
                </h2>

                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-400">
                  Access the platform and manage your day-to-day operations
                  through a single workspace.
                </p>
              </div>

              <Link
                to="/login"
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-slate-900 transition hover:bg-slate-100"
              >
                Open Application
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950">
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <p>© 2026 Business Operations Platform</p>
          <p>Customer • Sales • Inventory • Billing</p>
        </div>
      </footer>
    </div>
  );
}