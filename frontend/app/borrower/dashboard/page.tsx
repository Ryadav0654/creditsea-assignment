"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { CreditCard, LogOut, FileText, AlertCircle, TrendingUp, Clock, CheckCircle, XCircle, Banknote, Lock } from "lucide-react";
import api from "@/lib/api";
import { getUser, clearAuth, formatCurrency, formatDate } from "@/lib/auth";
import type { Loan } from "@/lib/types";

const STATUS_META: Record<string, { label: string; variant: "default" | "secondary" | "destructive" | "outline"; icon: React.ReactNode }> = {
  pending:    { label: "Pending Review", variant: "outline",     icon: <Clock className="w-3.5 h-3.5" /> },
  sanctioned: { label: "Sanctioned",     variant: "secondary",   icon: <CheckCircle className="w-3.5 h-3.5" /> },
  rejected:   { label: "Rejected",       variant: "destructive", icon: <XCircle className="w-3.5 h-3.5" /> },
  active:     { label: "Active",         variant: "default",     icon: <Banknote className="w-3.5 h-3.5" /> },
  closed:     { label: "Closed",         variant: "secondary",   icon: <Lock className="w-3.5 h-3.5" /> },
};

export default function BorrowerDashboard() {
  const router = useRouter();
  const user = getUser();
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLoans = useCallback(async () => {
    try { const { data } = await api.get<Loan[]>("/api/loans/my"); setLoans(data); }
    catch { /* interceptor handles 401 */ }
    finally { setLoading(false); }
  }, []);

  useEffect(() => {
    if (!user || user.role !== "borrower") { router.replace("/login"); return; }
    fetchLoans();
  }, [user, router, fetchLoans]);

  const logout = () => { clearAuth(); router.replace("/login"); };
  const loan = loans[0];
  const meta = loan ? STATUS_META[loan.status] : null;
  const pct = loan ? Math.min((loan.totalPaid / loan.totalRepayment) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-background">
      {/* Navbar */}
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="font-bold">CreditSea</span>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-muted-foreground hidden sm:block">
              {user?.name}
            </span>
            <Button variant="outline" size="sm" id="borrower-logout" onClick={logout}>
              <LogOut className="w-4 h-4 mr-2" />Sign out
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-1">My Loan</h1>
          <p className="text-muted-foreground text-sm">Track your application and repayment progress.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><div className="spinner" /></div>
        ) : !loan ? (
          <Card className="border-border/50 shadow-lg text-center py-12">
            <CardContent className="space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-muted mx-auto flex items-center justify-center">
                <FileText className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <h2 className="text-lg font-semibold mb-1">No loan application yet</h2>
                <p className="text-muted-foreground text-sm">Complete the 3-step application to get started.</p>
              </div>
              <Button id="borrower-start-apply" onClick={() => router.push("/apply")}>
                Start Application
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {/* Status card */}
            <Card className="border-border/50 shadow-lg">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardDescription className="mb-1.5">Application Status</CardDescription>
                    <div className="flex items-center gap-2">
                      <Badge variant={meta!.variant} className="gap-1.5 text-sm px-3 py-1">
                        {meta!.icon}{meta!.label}
                      </Badge>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">Applied</p>
                    <p className="text-sm font-semibold">{formatDate(loan.createdAt)}</p>
                  </div>
                </div>
              </CardHeader>

              {loan.status === "rejected" && loan.rejectionReason && (
                <CardContent className="pt-0 pb-4">
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription><strong>Rejection reason:</strong> {loan.rejectionReason}</AlertDescription>
                  </Alert>
                </CardContent>
              )}

              <Separator />

              {/* Loan stats grid */}
              <CardContent className="pt-5">
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {[
                    { label: "Loan Amount", value: formatCurrency(loan.amount), icon: <Banknote className="w-4 h-4" /> },
                    { label: "Tenure", value: `${loan.tenure} days`, icon: <Clock className="w-4 h-4" /> },
                    { label: "Interest Rate", value: `${loan.interestRate}% p.a.`, icon: <TrendingUp className="w-4 h-4" /> },
                    { label: "Simple Interest", value: formatCurrency(loan.simpleInterest), icon: <TrendingUp className="w-4 h-4" /> },
                    { label: "Total Repayment", value: formatCurrency(loan.totalRepayment), icon: <CreditCard className="w-4 h-4" /> },
                    { label: "Total Paid", value: formatCurrency(loan.totalPaid), icon: <CheckCircle className="w-4 h-4" /> },
                  ].map((item) => (
                    <div key={item.label} className="p-3.5 rounded-xl bg-muted/30 border border-border/50">
                      <p className="text-[11px] text-muted-foreground font-medium uppercase tracking-wide mb-1.5">{item.label}</p>
                      <p className="text-base font-bold">{item.value}</p>
                    </div>
                  ))}
                </div>

                {/* Repayment progress */}
                {(loan.status === "active" || loan.status === "closed") && (
                  <div className="mt-5 space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground font-medium">Repayment Progress</span>
                      <span className="font-bold text-primary">{pct.toFixed(1)}%</span>
                    </div>
                    <Progress value={pct} className="h-2.5" />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Paid: {formatCurrency(loan.totalPaid)}</span>
                      <span>Remaining: {formatCurrency(Math.max(loan.totalRepayment - loan.totalPaid, 0))}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {(loan.status === "rejected" || loan.status === "closed") && (
              <Card className="border-border/50 text-center py-6">
                <CardContent>
                  <p className="text-muted-foreground text-sm mb-4">
                    {loan.status === "closed" ? "🎉 Loan fully repaid! Apply for a new one." : "You may apply for a new loan."}
                  </p>
                  <Button id="borrower-reapply" onClick={() => router.push("/apply")}>
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
