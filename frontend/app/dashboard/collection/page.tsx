"use client";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import {
  DollarSign,
  RefreshCw,
  Plus,
  Calendar,
  Hash,
  Banknote,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/auth";
import type { Loan, Payment } from "@/lib/types";

function PaymentModal({
  loan,
  payments,
  open,
  onOpenChange,
  onRecord,
}: {
  loan: Loan | null;
  payments: Payment[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onRecord: (data: {
    loanId: string;
    utrNumber: string;
    amount: number;
    paymentDate: string;
  }) => Promise<void>;
}) {
  const [form, setForm] = useState({
    utrNumber: "",
    amount: "",
    paymentDate: new Date().toISOString().split("T")[0],
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open)
      setForm({
        utrNumber: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
      });
  }, [open]);

  if (!loan) return null;

  const remaining = Math.max(loan.totalRepayment - loan.totalPaid, 0);
  const borrower = typeof loan.borrower === "object" ? loan.borrower : null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.utrNumber.trim()) {
      toast.error("UTR number is required");
      return;
    }
    if (!form.amount || Number(form.amount) <= 0) {
      toast.error("Enter a valid amount");
      return;
    }
    setLoading(true);
    try {
      await onRecord({
        loanId: loan._id,
        utrNumber: form.utrNumber,
        amount: Number(form.amount),
        paymentDate: form.paymentDate,
      });
      toast.success("Payment recorded successfully!");
      setForm({
        utrNumber: "",
        amount: "",
        paymentDate: new Date().toISOString().split("T")[0],
      });
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || "Failed to record payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-150 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-primary" />
            Record Payment
          </DialogTitle>
          <DialogDescription>
            Record a new repayment. Loans will auto-close when fully paid.
          </DialogDescription>
        </DialogHeader>

        {/* Loan summary card inside modal */}
        <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 my-2">
          <div className="grid grid-cols-3 gap-3 mb-3">
            {[
              {
                label: "Borrower",
                value: borrower?.name ?? "—",
                highlight: false,
              },
              {
                label: "Total Repayment",
                value: formatCurrency(loan.totalRepayment),
                highlight: false,
              },
              {
                label: "Already Paid",
                value: formatCurrency(loan.totalPaid),
                highlight: false,
              },
              {
                label: "Remaining",
                value: formatCurrency(remaining),
                highlight: true,
              },
            ].map((f) => (
              <div key={f.label}>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1">
                  {f.label}
                </p>
                <p
                  className={`text-sm font-bold ${f.highlight ? "text-warning" : "text-foreground"}`}
                >
                  {f.value}
                </p>
              </div>
            ))}
          </div>
          <Progress
            value={Math.min((loan.totalPaid / loan.totalRepayment) * 100, 100)}
            className="h-1.5"
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 my-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="payment-utr">UTR Number</Label>
              <div className="relative">
                <Hash className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment-utr"
                  className="pl-8 uppercase"
                  placeholder="e.g. UTR123456"
                  value={form.utrNumber}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      utrNumber: e.target.value.toUpperCase(),
                    })
                  }
                  required
                />
              </div>
              <p className="text-[10px] text-muted-foreground">
                Must be unique
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="payment-amount">Amount (₹)</Label>
              <div className="relative">
                <Banknote className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  id="payment-amount"
                  type="number"
                  min={1}
                  max={remaining || undefined}
                  className="pl-8"
                  placeholder={`Max: ${remaining}`}
                  value={form.amount}
                  onChange={(e) => setForm({ ...form, amount: e.target.value })}
                  required
                />
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="payment-date">Payment Date</Label>
            <div className="relative">
              <Calendar className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="payment-date"
                type="date"
                className="pl-8"
                value={form.paymentDate}
                onChange={(e) =>
                  setForm({ ...form, paymentDate: e.target.value })
                }
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full"
            disabled={loading || remaining <= 0}
          >
            {loading
              ? "Recording..."
              : remaining <= 0
                ? "Fully Paid"
                : "Record Payment"}
          </Button>
        </form>

        {payments.length > 0 && (
          <div className="mt-4 border-t border-border/50 pt-4">
            <h4 className="text-sm font-semibold mb-3">Payment History</h4>
            <div className="space-y-2">
              {payments.map((p) => (
                <div
                  key={p._id}
                  className="flex justify-between items-center p-3 bg-muted/30 rounded-lg border border-border/50 text-sm"
                >
                  <span className="font-mono text-muted-foreground text-xs">
                    {p.utrNumber}
                  </span>
                  <span className="font-bold text-emerald-500">
                    {formatCurrency(p.amount)}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(p.paymentDate)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Loan[]>("/api/admin/loans?status=active");
      setLoans(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const openLoan = async (loan: Loan) => {
    setSelected(loan);
    const { data } = await api.get<Payment[]>(
      `/api/admin/payments/loan/${loan._id}`,
    );
    setPayments(data);
  };

  const handleRecord = async (form: {
    loanId: string;
    utrNumber: string;
    amount: number;
    paymentDate: string;
  }) => {
    await api.post("/api/admin/payments", form);
    // Refresh loans and payments
    const [loansRes, paymentsRes] = await Promise.all([
      api.get<Loan[]>("/api/admin/loans?status=active"),
      api.get<Payment[]>(`/api/admin/payments/loan/${form.loanId}`),
    ]);
    setLoans(loansRes.data);
    setPayments(paymentsRes.data);

    // Check if loan was auto-closed
    const updatedLoan = loansRes.data.find((l) => l._id === form.loanId);
    if (updatedLoan) {
      setSelected(updatedLoan);
    } else {
      const closedRes = await api.get<Loan[]>("/api/admin/loans?status=closed");
      const closed = closedRes.data.find((l) => l._id === form.loanId);
      if (closed) setSelected(closed);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <PaymentModal
        loan={selected}
        payments={payments}
        open={!!selected}
        onOpenChange={(open) => {
          if (!open) {
            setSelected(null);
            fetchLoans();
          }
        }}
        onRecord={handleRecord}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Collection Module
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Record borrower repayments. Loans auto-close when fully paid.
          </p>
        </div>
        <Button variant="outline" size="lg" onClick={fetchLoans}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Active Loans</CardTitle>
            <CardDescription>
              Loans currently in repayment phase
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20"
          >
            {loans.length} active
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <DollarSign className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p>No active loans found. All loans are settled!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Total Repayment</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Remaining</TableHead>
                  <TableHead className="w-37">Progress</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const borrower =
                    typeof loan.borrower === "object" ? loan.borrower : null;
                  const pct = (loan.totalPaid / loan.totalRepayment) * 100;
                  const remaining = loan.totalRepayment - loan.totalPaid;

                  return (
                    <TableRow key={loan._id}>
                      <TableCell>
                        <div className="font-semibold text-foreground">
                          {borrower?.name ?? "—"}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {borrower?.email ?? "—"}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">
                        {formatCurrency(loan.totalRepayment)}
                      </TableCell>
                      <TableCell className="font-bold text-emerald-500">
                        {formatCurrency(loan.totalPaid)}
                      </TableCell>
                      <TableCell className="font-bold text-warning">
                        {formatCurrency(remaining)}
                      </TableCell>
                      <TableCell>
                        <Progress value={pct} className="h-1.5 mb-1" />
                        <div className="text-[10px] text-muted-foreground text-right">
                          {pct.toFixed(1)}%
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => openLoan(loan)}>
                          <Plus className="w-3 h-3 mr-1" /> Payment
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
