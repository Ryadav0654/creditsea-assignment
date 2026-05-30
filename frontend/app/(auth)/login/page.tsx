"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, LogIn, CreditCard } from "lucide-react";
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
    <Card className="border-border/50 shadow-2xl">
      <CardHeader className="pb-4 flex items-center flex-col">
        <h1 className="font-extrabold text-4xl">CreditSea</h1>
        <CardTitle className="text-xl font-bold">Welcome back</CardTitle>
        <CardDescription>Sign in to your account to continue</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="login-email">Email</Label>
            <Input
              id="login-email"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-password">Password</Label>
            <Input
              id="login-password"
              type="password"
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
            />
          </div>
          <Button
            id="login-submit"
            type="submit"
            variant="default"
            size="lg"
            className="w-full py-4 cursor-pointer"
            disabled={loading}
          >
            {loading ? (
              "Signing in…"
            ) : (
              <>
                <LogIn className="w-4 h-4 mr-2" />
                Sign in
              </>
            )}
          </Button>
        </form>

        {/* Quick-fill test accounts */}
        <div className="pt-2">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            Test accounts
          </p>
          <div className="grid grid-cols-1 gap-1">
            {TEST_ACCOUNTS.map((a) => (
              <button
                key={a.role}
                type="button"
                onClick={() =>
                  setForm({ email: a.email, password: a.password })
                }
                className="flex items-center justify-between px-3 py-1.5 rounded-md text-xs text-left hover:bg-muted/50 transition-colors cursor-pointer group"
              >
                <span className="font-semibold text-primary group-hover:text-primary/80">
                  {a.role}
                </span>
                <span className="text-muted-foreground">{a.email}</span>
              </button>
            ))}
          </div>
        </div>
      </CardContent>

      <CardFooter className="pt-3">
        <p className="text-sm text-muted-foreground text-center w-full">
          Don&apos;t have an account?{" "}
          <Link
            href="/register"
            className="font-semibold text-primary hover:underline underline-offset-4"
          >
            Register here
          </Link>
        </p>
      </CardFooter>
    </Card>
  );
}
