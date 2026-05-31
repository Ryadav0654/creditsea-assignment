"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  CreditCard,
  LogOut,
  FileText,
  AlertCircle,
  TrendingUp,
  Clock,
  CheckCircle,
  XCircle,
  RefreshCw,
  Banknote,
  Lock,
} from "lucide-react";
import api from "@/lib/api";
import { getUser, clearAuth, formatCurrency, formatDate } from "@/lib/auth";
import type { Loan } from "@/lib/types";
import { cn } from "@/lib/utils";

const STATUS_META: Record<
  string,
  {
    label: string;
    variant: "default" | "secondary" | "destructive" | "outline";
    icon: React.ReactNode;
    colorClass: string;
  }
> = {
  pending: {
    label: "Pending Review",
    variant: "outline",
    icon: <Clock className="w-3.5 h-3.5" />,
    colorClass: "bg-amber-50 text-amber-600 border-amber-200",
  },
  sanctioned: {
    label: "Sanctioned",
    variant: "secondary",
    icon: <CheckCircle className="w-3.5 h-3.5" />,
    colorClass: "bg-indigo-50 text-indigo-600 border-indigo-200",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: <XCircle className="w-3.5 h-3.5" />,
    colorClass: "bg-red-50 text-red-600 border-red-200",
  },
  active: {
    label: "Active",
    variant: "default",
    icon: <Banknote className="w-3.5 h-3.5" />,
    colorClass: "bg-emerald-50 text-emerald-600 border-emerald-200",
  },
  closed: {
    label: "Closed",
    variant: "secondary",
    icon: <Lock className="w-3.5 h-3.5" />,
    colorClass: "bg-slate-100 text-slate-600 border-slate-200",
  },
};

export default function BorrowerDashboard() {
  const router = useRouter();
  const user = getUser();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = async () => {
    try {
      const { data } = await api.get<Loan[]>("/api/loans/my");
      setLoans(data);
    } catch (error) {
      clearAuth();
      router.replace("/login");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!user) return;

    if (user.role !== "borrower") {
      router.replace("/login");
      return;
    }

    fetchLoans();
  }, [user?.id]);

  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  const loan = loans[0];
  const meta = loan ? STATUS_META[loan.status] : null;
  const pct = loan
    ? Math.min((loan.totalPaid / loan.totalRepayment) * 100, 100)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/80 backdrop-blur-xl shadow-sm">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center shadow-md shadow-indigo-600/20">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <span className="font-extrabold text-slate-900">CreditSea</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-slate-600 hidden sm:block">
              {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              id="borrower-logout"
              onClick={logout}
              className="border-slate-200 text-slate-600 hover:text-red-600 hover:bg-red-50 hover:border-red-100"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1 text-slate-900">My Loan</h1>
          <p className="text-slate-500 text-sm">
            Track your application and repayment progress.
          </p>
        </div>

        {loading ? (
          <div className="space-y-4">
            <Card className="bg-white border-slate-200 shadow-sm">
              <CardHeader className="pb-3 border-b border-slate-100">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="h-4 w-32 skeleton" />
                    <div className="h-6 w-24 skeleton" />
                  </div>
                  <div className="space-y-2 text-right">
                    <div className="h-3 w-16 skeleton ml-auto" />
                    <div className="h-4 w-20 skeleton ml-auto" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50"
                    >
                      <div className="h-3 w-20 skeleton mb-2" />
                      <div className="h-5 w-24 skeleton" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        ) : !loan ? (
          <Card className="bg-white border-slate-200 shadow-md text-center py-16">
            <CardContent className="space-y-5">
              <div className="w-20 h-20 rounded-2xl bg-indigo-50 border border-indigo-100 mx-auto flex items-center justify-center shadow-sm">
                <FileText className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-slate-900 mb-1.5">
                  No loan application yet
                </h2>
                <p className="text-slate-500 text-sm max-w-sm mx-auto">
                  Complete the 3-step application to check your eligibility and
                  get funds deposited instantly.
                </p>
              </div>
              <Button
                id="borrower-start-apply"
                onClick={() => router.push("/apply")}
                size="lg"
                className="shadow-md shadow-primary/20"
              >
                Start Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {/* Status card */}
            <Card className="bg-white border-slate-200 shadow-md">
              <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50 rounded-t-xl">
                <div className="flex items-start justify-between">
                  <div>
                    <CardDescription className="mb-2 font-medium text-slate-500 uppercase tracking-wider text-[10px]">
                      Application Status
                    </CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge
                        variant="outline"
                        className={cn(
                          "gap-1.5 text-sm px-3 py-1 shadow-sm font-semibold",
                          meta!.colorClass,
                        )}
                      >
                        {meta!.icon}
                        {meta!.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider font-medium text-slate-500 mb-1">
                      Applied
                    </p>
                    <p className="text-sm font-bold text-slate-900">
                      {formatDate(loan.createdAt)}
                    </p>
                  </div>
                </div>
              </CardHeader>

              {loan.status === "rejected" && loan.rejectionReason && (
                <CardContent className="pt-4 pb-0">
                  <Alert
                    variant="destructive"
                    className="bg-red-50 border-red-200 text-red-700"
                  >
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Rejection reason:</strong> {loan.rejectionReason}
                    </AlertDescription>
                  </Alert>
                </CardContent>
              )}

              {/* Loan stats grid */}
              <CardContent className="pt-6">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                  {[
                    {
                      label: "Loan Amount",
                      value: formatCurrency(loan.amount),
                      icon: <Banknote className="w-4 h-4" />,
                      highlight: true,
                    },
                    {
                      label: "Tenure",
                      value: `${loan.tenure} days`,
                      icon: <Clock className="w-4 h-4" />,
                    },
                    {
                      label: "Interest Rate",
                      value: `${loan.interestRate}% p.a.`,
                      icon: <TrendingUp className="w-4 h-4" />,
                    },
                    {
                      label: "Simple Interest",
                      value: formatCurrency(loan.simpleInterest),
                      icon: <TrendingUp className="w-4 h-4" />,
                    },
                    {
                      label: "Total Repayment",
                      value: formatCurrency(loan.totalRepayment),
                      icon: <CreditCard className="w-4 h-4" />,
                      highlight: true,
                    },
                    {
                      label: "Total Paid",
                      value: formatCurrency(loan.totalPaid),
                      icon: <CheckCircle className="w-4 h-4" />,
                      highlight: loan.totalPaid > 0,
                    },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className={cn(
                        "p-4 rounded-xl border transition-colors",
                        item.highlight
                          ? "bg-indigo-50/30 border-indigo-100"
                          : "bg-slate-50 border-slate-100",
                      )}
                    >
                      <p className="text-[11px] text-slate-500 font-bold uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                        <span className="text-slate-400">{item.icon}</span>
                        {item.label}
                      </p>
                      <p
                        className={cn(
                          "text-lg font-extrabold",
                          item.highlight ? "text-primary" : "text-slate-900",
                        )}
                      >
                        {item.value}
                      </p>
                    </div>
                  ))}
                </div>

                {/* Repayment progress */}
                {(loan.status === "active" || loan.status === "closed") && (
                  <div className="mt-8 space-y-3 p-5 rounded-xl border border-slate-200 bg-white shadow-sm">
                    <div className="flex justify-between items-end">
                      <div>
                        <span className="text-[11px] uppercase tracking-wider font-bold text-slate-500 mb-1 block">
                          Repayment Progress
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          Paid:{" "}
                          <span className="text-emerald-600">
                            {formatCurrency(loan.totalPaid)}
                          </span>
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-2xl font-black text-primary block leading-none mb-1">
                          {pct.toFixed(1)}%
                        </span>
                        <span className="text-xs font-semibold text-slate-600">
                          Remaining:{" "}
                          <span className="text-amber-600">
                            {formatCurrency(
                              Math.max(loan.totalRepayment - loan.totalPaid, 0),
                            )}
                          </span>
                        </span>
                      </div>
                    </div>
                    <Progress
                      value={pct}
                      className="h-3 bg-slate-100 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500"
                    />
                  </div>
                )}
              </CardContent>
            </Card>

            {(loan.status === "rejected" || loan.status === "closed") && (
              <Card className="bg-white border-slate-200 shadow-sm text-center py-8">
                <CardContent>
                  <div className="mx-auto w-12 h-12 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-4">
                    <RefreshCw className="w-5 h-5 text-slate-400" />
                  </div>
                  <p className="text-slate-600 font-medium mb-5">
                    {loan.status === "closed"
                      ? "🎉 Loan fully repaid! Apply for a new one."
                      : "You may apply for a new loan."}
                  </p>
                  <Button
                    id="borrower-reapply"
                    onClick={() => router.push("/apply")}
                    className="shadow-sm shadow-primary/20"
                  >
                    Apply for New Loan
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
