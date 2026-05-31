"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogIn } from "lucide-react";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

const TEST_ACCOUNTS = [
  { role: "Admin", email: "admin@lms.com", password: "Admin@123" },
  { role: "Sanction", email: "sanction@lms.com", password: "Sanction@123" },
  { role: "Disburse", email: "disburse@lms.com", password: "Disburse@123" },
  { role: "Collection", email: "collection@lms.com", password: "Collect@123" },
  { role: "Borrower", email: "borrower@lms.com", password: "Borrower@123" },
];

export default function LoginPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/login", form);
      saveAuth(data);
      toast.success(`Welcome back, ${data.user.name}!`);
      if (data.user.role === "borrower") router.push("/borrower/dashboard");
      else router.push("/dashboard");
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(
        e.response?.data?.message ||
          "Login failed. Please check your credentials.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="pb-8 flex items-center flex-col">
        <h1 className="font-extrabold text-4xl gradient-text mb-2">CreditSea</h1>
        <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
        <p className="text-slate-500 mt-1">Sign in to your account to continue</p>
      </div>

      <div className="space-y-6">
        {error && (
          <Alert variant="destructive" className="bg-red-50 border-red-200 text-red-700">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-slate-700 font-medium">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password" className="text-slate-700 font-medium">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          <Button
            id="login-submit"
            type="submit"
            variant="default"
            size="lg"
            className="w-full h-12 cursor-pointer text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner-sm" />
                Signing in…
              </span>
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign in
              </>
            )}
          </Button>
        </form>

        {/* Quick-fill test accounts */}
        <div className="pt-3">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Demo accounts
          </p>
          <div className="bg-slate-50 rounded-xl border border-slate-100 divide-y divide-slate-100">
            {TEST_ACCOUNTS.map((a) => (
              <button
                key={a.role}
                type="button"
                onClick={() =>
                  setForm({ email: a.email, password: a.password })
                }
                className="flex items-center justify-between w-full px-3.5 py-2.5 text-xs text-left hover:bg-indigo-50/50 transition-colors cursor-pointer first:rounded-t-xl last:rounded-b-xl"
              >
                <span className="font-bold text-primary">
                  {a.role}
                </span>
                <span className="text-slate-400 font-mono text-[11px]">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="pt-6">
        <p className="text-sm text-slate-500 text-center w-full">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
