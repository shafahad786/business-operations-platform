import {
  ArrowLeft,
  BriefcaseBusiness,
  CheckCircle2,
  Eye,
  EyeOff,
  LoaderCircle,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { type FormEvent, useState } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

type DemoRole = "ADMIN" | "MANAGER" | "STAFF";

const DEMO_ACCOUNTS: Record<
  DemoRole,
  {
    label: string;
    description: string;
    email: string;
    password: string;
  }
> = {
  ADMIN: {
    label: "Administrator",
    description: "Full platform access",
    email: "admin@business.local",
    password: "Admin123!",
  },
  MANAGER: {
    label: "Manager",
    description: "Operations and business oversight",
    email: "manager@business.local",
    password: "Manager123!",
  },
  STAFF: {
    label: "Staff",
    description: "Day-to-day operational access",
    email: "staff@business.local",
    password: "Staff123!",
  },
};

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const redirectPath =
    (location.state as { from?: string } | null)?.from ?? "/app/dashboard";

  if (!isLoading && isAuthenticated) {
    return <Navigate to={redirectPath} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSubmitting(true);

    try {
      await login({ email, password });
      navigate(redirectPath, { replace: true });
    } catch {
      setError("Invalid email or password.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDemoLogin = async (role: DemoRole) => {
    const account = DEMO_ACCOUNTS[role];

    setEmail(account.email);
    setPassword(account.password);
    setError(null);
    setSubmitting(true);

    try {
      await login({
        email: account.email,
        password: account.password,
      });

      navigate(redirectPath, { replace: true });
    } catch {
      setError("Unable to sign in with the demo account.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="group flex items-center gap-3"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-700 text-white shadow-sm transition group-hover:bg-blue-800">
              <BriefcaseBusiness className="h-5 w-5" />
            </div>

            <div className="text-left">
              <p className="text-sm font-bold tracking-tight text-slate-900 sm:text-base">
                Business Operations
              </p>
              <p className="hidden text-[11px] font-medium text-slate-500 sm:block">
                Platform
              </p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="hidden sm:inline">Back to home</span>
          </button>
        </div>
      </header>

      <main className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-7xl items-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="mx-auto grid w-full max-w-5xl overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-900/5 lg:grid-cols-[0.9fr_1.1fr]">
          {/* Left panel */}
          <section className="hidden bg-slate-950 p-8 text-white lg:flex lg:flex-col lg:justify-between xl:p-10">
            <div>
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-blue-600">
                <Sparkles className="h-5 w-5" />
              </div>

              <p className="mt-8 text-sm font-semibold uppercase tracking-wider text-blue-400">
                Business Operations Platform
              </p>

              <h1 className="mt-3 text-3xl font-bold leading-tight">
                Everything your business needs, connected in one workspace.
              </h1>

              <p className="mt-5 text-sm leading-7 text-slate-400">
                Manage customers, inventory, orders, invoices, payments, and
                business insights through a centralized operational platform.
              </p>
            </div>

            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Connected workflows</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Orders, inventory, invoices, and payments work together.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-blue-500/10 text-blue-400">
                  <ShieldCheck className="h-4 w-4" />
                </div>
                <div>
                  <p className="text-sm font-semibold">Role-based security</p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Access is controlled according to each user's role.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Login panel */}
          <section className="p-6 sm:p-8 lg:p-10">
            <div className="mx-auto max-w-md">
              <div>
                <p className="text-sm font-semibold text-blue-700">
                  Welcome back
                </p>

                <h2 className="mt-2 text-2xl font-bold tracking-tight text-slate-950 sm:text-3xl">
                  Sign in to your workspace
                </h2>

                <p className="mt-2 text-sm leading-6 text-slate-600">
                  Use your business account to access the platform.
                </p>
              </div>

              <form className="mt-7 space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <input
                    id="email"
                    type="email"
                    autoComplete="username"
                    required
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="mt-2 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                    placeholder="you@company.com"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-slate-700"
                    >
                      Password
                    </label>
                  </div>

                  <div className="relative mt-2">
                    <input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-3 pr-11 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                      placeholder="Enter your password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword((current) => !current)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 rounded-md p-1 text-slate-400 transition hover:text-slate-700"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {error ? (
                  <div
                    role="alert"
                    className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
                  >
                    {error}
                  </div>
                ) : null}

                <button
                  type="submit"
                  disabled={submitting}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-blue-700 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-800 hover:shadow-md disabled:cursor-not-allowed disabled:opacity-70"
                >
                  {submitting ? (
                    <LoaderCircle className="h-4 w-4 animate-spin" />
                  ) : null}
                  {submitting ? "Signing in..." : "Sign in"}
                </button>
              </form>

              {/* Demo access */}
              <div className="mt-7 border-t border-slate-200 pt-6">
                <div className="mb-4">
                  <p className="text-sm font-semibold text-slate-900">
                    Try the demo
                  </p>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Choose a role to enter the platform with a preconfigured
                    demo account.
                  </p>
                </div>

                <div className="space-y-2">
                  {(Object.keys(DEMO_ACCOUNTS) as DemoRole[]).map((role) => {
                    const account = DEMO_ACCOUNTS[role];

                    return (
                      <button
                        key={role}
                        type="button"
                        disabled={submitting}
                        onClick={() => void handleDemoLogin(role)}
                        className="group flex w-full items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 text-left transition hover:border-blue-200 hover:bg-blue-50/50 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {account.label}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-500">
                            {account.description}
                          </p>
                        </div>

                        <span className="rounded-lg bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-600 transition group-hover:bg-blue-100 group-hover:text-blue-700">
                          Try Demo
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <p className="mt-6 text-center text-xs leading-5 text-slate-400">
                Demo access is provided for application evaluation.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}