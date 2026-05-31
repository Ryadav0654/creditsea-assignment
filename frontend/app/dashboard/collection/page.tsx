"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
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
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/auth";
import type { Loan, Payment } from "@/lib/types";
import { cn } from "@/lib/utils";

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
      <DialogContent className="sm:max-w-150 max-h-[90vh] flex flex-col bg-white border-slate-200 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center border border-emerald-100">
              <DollarSign className="w-4 h-4 text-emerald-600" />
            </div>
            Record Payment
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Record a new repayment. Loans will auto-close when fully paid.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 py-4 space-y-6 overflow-y-auto flex-1">
          {/* Loan summary card inside modal */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              {[
                {
                  label: "Borrower",
                  value: borrower?.name ?? "—",
                  highlight: false,
                },
                {
                  label: "Total Due",
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
                  <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                    {f.label}
                  </p>
                  <p
                    className={cn(
                      "text-sm font-bold",
                      f.highlight ? "text-amber-600" : "text-slate-900",
                    )}
                  >
                    {f.value}
                  </p>
                </div>
              ))}
            </div>
            <Progress
              value={Math.min(
                (loan.totalPaid / loan.totalRepayment) * 100,
                100,
              )}
              className="h-2 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500"
            />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label
                  htmlFor="payment-utr"
                  className="text-slate-700 font-semibold"
                >
                  UTR Number
                </Label>
                <div className="relative">
                  <Hash className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="payment-utr"
                    className="pl-9 uppercase h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
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
                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
                  Must be unique
                </p>
              </div>
              <div className="space-y-2">
                <Label
                  htmlFor="payment-amount"
                  className="text-slate-700 font-semibold"
                >
                  Amount (₹)
                </Label>
                <div className="relative">
                  <Banknote className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                  <Input
                    id="payment-amount"
                    type="number"
                    min={1}
                    max={remaining || undefined}
                    className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
                    placeholder={`Max: ${remaining}`}
                    value={form.amount}
                    onChange={(e) =>
                      setForm({ ...form, amount: e.target.value })
                    }
                    required
                  />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="payment-date"
                className="text-slate-700 font-semibold"
              >
                Payment Date
              </Label>
              <div className="relative">
                <Calendar className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
                <Input
                  id="payment-date"
                  type="date"
                  className="pl-9 h-10 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
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
              className="w-full h-12 shadow-sm text-base disabled:opacity-50"
              disabled={loading || remaining <= 0}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner-sm" /> Recording...
                </span>
              ) : remaining <= 0 ? (
                "Fully Paid"
              ) : (
                "Record Payment"
              )}
            </Button>
          </form>

          {payments.length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-100">
              <h4 className="text-sm font-bold text-slate-900 mb-3">
                Payment History
              </h4>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {payments.map((p) => (
                  <div
                    key={p._id}
                    className="flex justify-between items-center p-3.5 bg-slate-50 rounded-xl border border-slate-100 text-sm"
                  >
                    <span className="font-mono text-slate-600 font-semibold text-xs">
                      {p.utrNumber}
                    </span>
                    <span className="font-black text-emerald-600">
                      {formatCurrency(p.amount)}
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      {formatDate(p.paymentDate)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function CollectionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Loan | null>(null);
  const [payments, setPayments] = useState<Payment[]>([]);

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [sortCol, setSortCol] = useState<
    keyof Loan | "borrowerName" | "remaining" | "progress" | null
  >(null);
  const [sortDesc, setSortDesc] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Loan[]>("/api/admin/loans?status=active");
      setLoans(data);
      setPage(1);
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

  // Sort and paginate data
  const displayedData = useMemo(() => {
    let data = [...loans];

    if (sortCol) {
      data.sort((a, b) => {
        let valA: any = a[sortCol as keyof Loan];
        let valB: any = b[sortCol as keyof Loan];

        if (sortCol === "borrowerName") {
          valA = typeof a.borrower === "object" ? a.borrower.name : "";
          valB = typeof b.borrower === "object" ? b.borrower.name : "";
          return sortDesc
            ? String(valB).localeCompare(String(valA))
            : String(valA).localeCompare(String(valB));
        }

        if (sortCol === "remaining") {
          valA = a.totalRepayment - a.totalPaid;
          valB = b.totalRepayment - b.totalPaid;
          return sortDesc ? valB - valA : valA - valB;
        }

        if (sortCol === "progress") {
          valA = a.totalPaid / a.totalRepayment;
          valB = b.totalPaid / b.totalRepayment;
          return sortDesc ? valB - valA : valA - valB;
        }

        if (typeof valA === "number" && typeof valB === "number") {
          return sortDesc ? valB - valA : valA - valB;
        }

        return sortDesc
          ? String(valB).localeCompare(String(valA))
          : String(valA).localeCompare(String(valB));
      });
    }

    const start = (page - 1) * itemsPerPage;
    const paginated = data.slice(start, start + itemsPerPage);
    return {
      data: paginated,
      total: data.length,
      totalPages: Math.ceil(data.length / itemsPerPage),
    };
  }, [loans, sortCol, sortDesc, page]);

  const handleSort = (
    col: keyof Loan | "borrowerName" | "remaining" | "progress",
  ) => {
    if (sortCol === col) {
      if (sortDesc) {
        setSortCol(null);
        setSortDesc(false);
      } else {
        setSortDesc(true);
      }
    } else {
      setSortCol(col);
      setSortDesc(false);
    }
  };

  const SortIcon = ({
    col,
  }: {
    col: keyof Loan | "borrowerName" | "remaining" | "progress";
  }) => {
    if (sortCol !== col)
      return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-50" />;
    return sortDesc ? (
      <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary" />
    ) : (
      <ArrowUp className="w-3 h-3 ml-1 inline-block text-primary" />
    );
  };

  return (
    <div className="p-6 sm:p-10 lg:p-12 space-y-8 max-w-7xl mx-auto">
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

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Collection Module
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Record borrower repayments. Loans auto-close when fully paid.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          onClick={fetchLoans}
          className="cursor-pointer bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
          disabled={loading}
        >
          <RefreshCw
            className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Active Loans
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1 font-medium">
              Loans currently in repayment phase
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-emerald-50 text-emerald-600 border-emerald-200 shadow-sm font-bold px-3 py-1 text-xs uppercase tracking-wider"
          >
            {loans.length} active
          </Badge>
        </CardHeader>
        <CardContent className="p-4">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-12 w-full skeleton rounded-lg" />
                </div>
              ))}
            </div>
          ) : loans.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <DollarSign className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                All settled!
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                No active loans found. All recorded loans have been fully
                repaid.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("borrowerName")}
                      >
                        Borrower <SortIcon col="borrowerName" />
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("totalRepayment")}
                      >
                        Total Repayment <SortIcon col="totalRepayment" />
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("totalPaid")}
                      >
                        Paid <SortIcon col="totalPaid" />
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("remaining")}
                      >
                        Remaining <SortIcon col="remaining" />
                      </TableHead>
                      <TableHead
                        className="w-37 font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("progress")}
                      >
                        Progress <SortIcon col="progress" />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600 text-right">
                        Action
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedData.data.map((loan) => {
                      const borrower =
                        typeof loan.borrower === "object"
                          ? loan.borrower
                          : null;
                      const pct = (loan.totalPaid / loan.totalRepayment) * 100;
                      const remaining = loan.totalRepayment - loan.totalPaid;

                      return (
                        <TableRow
                          key={loan._id}
                          className="hover:bg-slate-50/80 border-slate-100 transition-colors"
                        >
                          <TableCell>
                            <div className="font-bold text-slate-900">
                              {borrower?.name ?? "—"}
                            </div>
                            <div className="text-xs font-medium text-slate-500">
                              {borrower?.email ?? "—"}
                            </div>
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">
                            {formatCurrency(loan.totalRepayment)}
                          </TableCell>
                          <TableCell className="font-black text-emerald-600">
                            {formatCurrency(loan.totalPaid)}
                          </TableCell>
                          <TableCell className="font-black text-amber-600">
                            {formatCurrency(remaining)}
                          </TableCell>
                          <TableCell>
                            <Progress
                              value={pct}
                              className="h-2 mb-1.5 bg-slate-200 [&>div]:bg-gradient-to-r [&>div]:from-emerald-400 [&>div]:to-emerald-500"
                            />
                            <div className="text-[10px] font-bold text-slate-500 text-right uppercase tracking-wider">
                              {pct.toFixed(1)}%
                            </div>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => openLoan(loan)}
                              className="bg-white text-primary border border-primary/20 hover:bg-indigo-50 shadow-sm"
                            >
                              <Plus className="w-3 h-3 mr-1" /> Payment
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {displayedData.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 bg-slate-50/50">
                  <p className="text-xs text-slate-500 font-medium">
                    Showing{" "}
                    <span className="font-bold text-slate-900">
                      {(page - 1) * itemsPerPage + 1}
                    </span>{" "}
                    to{" "}
                    <span className="font-bold text-slate-900">
                      {Math.min(page * itemsPerPage, displayedData.total)}
                    </span>{" "}
                    of{" "}
                    <span className="font-bold text-slate-900">
                      {displayedData.total}
                    </span>{" "}
                    entries
                  </p>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                      className="h-8 border-slate-200 shadow-sm"
                    >
                      <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                    </Button>
                    <div className="flex items-center gap-1 px-2 text-sm font-semibold text-slate-700">
                      {page} / {displayedData.totalPages}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setPage((p) =>
                          Math.min(displayedData.totalPages, p + 1),
                        )
                      }
                      disabled={page === displayedData.totalPages}
                      className="h-8 border-slate-200 shadow-sm"
                    >
                      Next <ChevronRight className="w-4 h-4 ml-1" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
