"use client";
import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, UserPlus, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { saveAuth } from "@/lib/auth";

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    confirm: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = useMemo(() => {
    const p = form.password;
    return {
      length: p.length >= 6,
      match: p.length > 0 && form.confirm.length > 0 && p === form.confirm,
      mismatch: form.confirm.length > 0 && p !== form.confirm,
    };
  }, [form.password, form.confirm]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) {
      setError("Passwords do not match");
      return;
    }
    if (form.password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setLoading(true);
    try {
      const { data } = await api.post("/api/auth/register", {
        name: form.name,
        email: form.email,
        password: form.password,
      });
      saveAuth(data);
      toast.success("Account created! Let's get started.");
      router.push("/apply");
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="pb-8 flex items-center flex-col">
        <h1 className="font-extrabold text-4xl gradient-text mb-2">CreditSea</h1>
        <h2 className="text-xl font-bold text-slate-900">Create account</h2>
        <p className="text-slate-500 mt-1">
          Start your loan application in minutes
        </p>
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
            <Label htmlFor="reg-name" className="text-slate-700 font-medium">Full Name</Label>
            <Input
              id="reg-name"
              type="text"
              placeholder="Ravindra Yadav"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-slate-700 font-medium">Email address</Label>
            <Input
              id="reg-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
              className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor="reg-password" className="text-slate-700 font-medium">Password</Label>
              <Input
                id="reg-password"
                type="password"
                placeholder="Min 6 chars"
                value={form.password}
                onChange={(e) => setForm({ ...form, password: e.target.value })}
                required
                className="h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reg-confirm" className="text-slate-700 font-medium">Confirm</Label>
              <Input
                id="reg-confirm"
                type="password"
                placeholder="Repeat"
                value={form.confirm}
                onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                required
                className={cn(
                  "h-11 bg-slate-50 border-slate-200 focus:bg-white transition-colors",
                  passwordChecks.match && "border-emerald-400 focus:border-emerald-500",
                  passwordChecks.mismatch && "border-red-400 focus:border-red-500",
                )}
              />
            </div>
          </div>

          {/* Inline password feedback */}
          {(form.password.length > 0 || form.confirm.length > 0) && (
            <div className="flex gap-4 text-xs">
              <span className={cn("flex items-center gap-1", passwordChecks.length ? "text-emerald-600" : "text-slate-400")}>
                {passwordChecks.length ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                6+ characters
              </span>
              {form.confirm.length > 0 && (
                <span className={cn("flex items-center gap-1", passwordChecks.match ? "text-emerald-600" : "text-red-500")}>
                  {passwordChecks.match ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  Passwords match
                </span>
              )}
            </div>
          )}

          <Button
            id="reg-submit"
            type="submit"
            variant="default"
            size="lg"
            className="w-full h-12 text-base shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner-sm" />
                Creating account…
              </span>
            ) : (
              <>
                <UserPlus className="w-4 h-4 mr-2" />
                Create account
              </>
            )}
          </Button>
        </form>
      </div>

      <div className="pt-6">
        <p className="text-sm text-slate-500 text-center w-full">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
