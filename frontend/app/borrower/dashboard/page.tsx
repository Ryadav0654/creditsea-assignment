"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
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
  Wallet,
  CalendarCheck,
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
    icon: <Clock className="w-4 h-4" />,
    colorClass: "bg-amber-100 text-amber-700 border-amber-200",
  },
  sanctioned: {
    label: "Sanctioned",
    variant: "secondary",
    icon: <CheckCircle className="w-4 h-4" />,
    colorClass: "bg-indigo-100 text-indigo-700 border-indigo-200",
  },
  rejected: {
    label: "Rejected",
    variant: "destructive",
    icon: <XCircle className="w-4 h-4" />,
    colorClass: "bg-red-100 text-red-700 border-red-200",
  },
  active: {
    label: "Active",
    variant: "default",
    icon: <Banknote className="w-4 h-4" />,
    colorClass: "bg-emerald-100 text-emerald-700 border-emerald-200",
  },
  closed: {
    label: "Closed",
    variant: "secondary",
    icon: <Lock className="w-4 h-4" />,
    colorClass: "bg-slate-200 text-slate-700 border-slate-300",
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
  const remaining = loan
    ? Math.max(loan.totalRepayment - loan.totalPaid, 0)
    : 0;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-slate-200 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-extrabold text-xl tracking-tight text-slate-900">
              CreditSea
            </h1>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-sm font-bold text-slate-900">
                {user?.name}
              </span>
              <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
                {user?.pan}
              </span>
            </div>
            <Button
              variant="outline"
              size="default"
              id="borrower-logout"
              onClick={logout}
              className="border-slate-200 text-slate-600 font-semibold hover:text-red-600 hover:bg-red-50 hover:border-red-100 rounded-xl px-5 h-10"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-6xl mx-auto px-6 lg:px-8 py-10 lg:py-16">
        {loading ? (
          <div className="space-y-12">
            <div className="flex justify-between items-end">
              <div className="space-y-3">
                <div className="h-10 w-48 skeleton rounded-xl" />
                <div className="h-5 w-64 skeleton rounded-md" />
              </div>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="h-64 skeleton rounded-3xl" />
              <div className="lg:col-span-2 h-64 skeleton rounded-3xl" />
            </div>
          </div>
        ) : !loan ? (
          <div className="max-w-2xl mx-auto text-center py-24 px-6 bg-white rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50">
            <div className="w-28 h-28 rounded-full bg-indigo-50 flex items-center justify-center mx-auto mb-8 border-8 border-white shadow-lg">
              <Wallet className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 mb-3 tracking-tight">
              Unlock Your Financial Potential
            </h2>
            <p className="text-slate-500 text-lg mb-10 max-w-lg mx-auto leading-relaxed">
              Experience lightning-fast approvals and transparent terms.
              Complete our 3-step application to check your eligibility and get
              funds deposited instantly.
            </p>
            <Button
              id="borrower-start-apply"
              onClick={() => router.push("/apply")}
              size="lg"
              className="h-14 px-10 text-lg rounded-2xl shadow-xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all"
            >
              Start Loan Application
            </Button>
          </div>
        ) : (
          <div className="space-y-10">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
              <div>
                <h1 className="text-4xl font-extrabold text-slate-900 tracking-tight mb-2">
                  Loan Overview
                </h1>
                <p className="text-slate-500 text-base font-medium">
                  Applied on {formatDate(loan.createdAt)}
                </p>
              </div>
              <div className="flex flex-col md:items-end">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">
                  Current Status
                </span>
                <Badge
                  variant="outline"
                  className={cn(
                    "px-4 py-1.5 text-sm font-bold rounded-xl shadow-sm gap-2 border-2",
                    meta!.colorClass,
                  )}
                >
                  {meta!.icon}
                  {meta!.label}
                </Badge>
              </div>
            </div>

            {loan.status === "rejected" && loan.rejectionReason && (
              <Alert
                variant="destructive"
                className="bg-red-50 border-red-200 text-red-700 rounded-2xl p-6"
              >
                <AlertCircle className="h-6 w-6" />
                <AlertDescription className="ml-4 text-base">
                  <strong className="font-bold block mb-1">
                    Application declined
                  </strong>
                  {loan.rejectionReason}
                </AlertDescription>
              </Alert>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-1 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-3xl p-8 text-white shadow-2xl shadow-indigo-600/30 relative overflow-hidden group">
                <div className="absolute -top-10 -right-10 w-48 h-48 bg-white/10 rounded-full blur-2xl group-hover:bg-white/20 transition-all duration-700" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  <div>
                    <p className="text-indigo-100 font-semibold uppercase tracking-wider text-xs mb-2">
                      Principal Amount
                    </p>
                    <p className="text-4xl font-black tracking-tight">
                      {formatCurrency(loan.amount)}
                    </p>
                  </div>
                  <div className="mt-12 flex justify-between items-end border-t border-indigo-400/30 pt-6">
                    <div>
                      <p className="text-xs text-indigo-200 font-medium mb-1">
                        Interest Rate
                      </p>
                      <p className="text-xl font-bold">
                        {loan.interestRate}% p.a.
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-indigo-200 font-medium mb-1">
                        Tenure
                      </p>
                      <p className="text-xl font-bold">{loan.tenure} days</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Repayment Card */}
              <div className="lg:col-span-2 bg-white rounded-3xl p-8 border border-slate-200 shadow-xl shadow-slate-200/50 flex flex-col justify-between">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 mb-10">
                  <div>
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-2">
                      Total Repayment
                    </p>
                    <p className="text-4xl font-extrabold text-slate-900 tracking-tight">
                      {formatCurrency(loan.totalRepayment)}
                    </p>
                  </div>
                  {(loan.status === "active" || loan.status === "closed") && (
                    <div className="sm:text-right bg-slate-50 p-4 rounded-2xl border border-slate-100">
                      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Remaining Balance
                      </p>
                      <p className="text-2xl font-black text-amber-600">
                        {formatCurrency(remaining)}
                      </p>
                    </div>
                  )}
                </div>

                {loan.status === "active" || loan.status === "closed" ? (
                  <div className="space-y-4">
                    <div className="flex justify-between items-end">
                      <span className="text-sm font-bold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-lg">
                        Paid: {formatCurrency(loan.totalPaid)}
                      </span>
                      <span className="text-lg font-black text-slate-900">
                        {pct.toFixed(1)}%
                      </span>
                    </div>
                    <Progress
                      value={pct}
                      className="h-4 bg-slate-100 rounded-full overflow-hidden [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500"
                    />
                  </div>
                ) : (
                  <div className="bg-slate-50 rounded-2xl p-6 border border-slate-100 flex items-center justify-center h-full min-h-[100px]">
                    <p className="text-slate-500 font-medium flex items-center gap-2">
                      <Clock className="w-5 h-5 text-amber-500" />
                      Repayment tracking will begin once the loan is disbursed.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Breakdown */}
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 mb-5 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-600" /> Application
                Details
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Date of Birth",
                    value: formatDate(loan.dob),
                    icon: <CalendarCheck className="w-4 h-4" />,
                  },
                  {
                    label: "Employment",
                    value: loan.employmentMode,
                    icon: <Wallet className="w-4 h-4" />,
                    capitalize: true,
                  },
                  {
                    label: "Monthly Salary",
                    value: formatCurrency(loan.monthlySalary),
                    icon: <Banknote className="w-4 h-4" />,
                  },
                  {
                    label: "Simple Interest",
                    value: formatCurrency(loan.simpleInterest),
                    icon: <TrendingUp className="w-4 h-4" />,
                  },
                ].map((item, idx) => (
                  <div
                    key={idx}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                      {item.icon} {item.label}
                    </p>
                    <p
                      className={cn(
                        "text-base font-bold text-slate-900",
                        item.capitalize && "capitalize",
                      )}
                    >
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Reapply Action */}
            {(loan.status === "rejected" || loan.status === "closed") && (
              <div className="mt-12 bg-indigo-50 border border-indigo-100 rounded-3xl p-10 text-center shadow-inner">
                <div className="mx-auto w-16 h-16 rounded-2xl bg-white shadow-md flex items-center justify-center mb-6">
                  <RefreshCw className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">
                  {loan.status === "closed"
                    ? "Loan Successfully Repaid! 🎉"
                    : "Ready to try again?"}
                </h3>
                <p className="text-slate-600 text-lg mb-8 max-w-md mx-auto">
                  {loan.status === "closed"
                    ? "You are eligible to apply for a new loan with even better terms."
                    : "You may submit a new application. Please ensure all details are accurate."}
                </p>
                <Button
                  id="borrower-reapply"
                  onClick={() => router.push("/apply")}
                  size="lg"
                  className="h-14 px-8 text-base rounded-xl shadow-lg shadow-primary/20 hover:-translate-y-0.5 transition-all"
                >
                  Apply for a New Loan
                </Button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
