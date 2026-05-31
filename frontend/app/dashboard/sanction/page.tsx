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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  FileCheck,
  RefreshCw,
  FileText,
  XCircle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/auth";
import type { Loan } from "@/lib/types";
import { cn } from "@/lib/utils";

function LoanReviewModal({
  loan,
  open,
  onOpenChange,
  onDecision,
}: {
  loan: Loan | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onDecision: (
    id: string,
    decision: "approve" | "reject",
    reason?: string,
  ) => Promise<void>;
}) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setReason("");
  }, [open, loan]);

  if (!loan) return null;

  const borrower = typeof loan.borrower === "object" ? loan.borrower : null;

  const act = async (decision: "approve" | "reject") => {
    if (decision === "reject" && !reason.trim()) {
      toast.error("Please enter a rejection reason");
      return;
    }
    setLoading(true);
    try {
      await onDecision(loan._id, decision, reason);
      toast.success(
        decision === "approve"
          ? "Loan approved successfully!"
          : "Loan rejected.",
      );
      onOpenChange(false);
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || "Action failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-137 max-h-[90vh] flex flex-col bg-white border-slate-200 p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold text-slate-900">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center border border-indigo-100">
              <FileText className="w-4 h-4 text-primary" />
            </div>
            Loan Review
          </DialogTitle>
          <DialogDescription className="text-slate-500 font-medium">
            Review the application details and make a sanction decision.
          </DialogDescription>
        </DialogHeader>

        <div className="p-6 py-4 overflow-y-auto flex-1">
          <div className="grid grid-cols-2 gap-3 mb-5">
            {[
              { label: "Borrower", value: borrower?.name ?? "—" },
              { label: "Email", value: borrower?.email ?? "—" },
              { label: "PAN", value: loan.pan },
              { label: "DOB", value: formatDate(loan.dob) },
              {
                label: "Monthly Salary",
                value: formatCurrency(loan.monthlySalary),
              },
              { label: "Employment", value: loan.employmentMode },
              {
                label: "Loan Amount",
                value: formatCurrency(loan.amount),
                highlight: true,
              },
              { label: "Tenure", value: `${loan.tenure} days` },
              {
                label: "Interest (SI)",
                value: formatCurrency(loan.simpleInterest),
              },
              {
                label: "Total Repayment",
                value: formatCurrency(loan.totalRepayment),
                highlight: true,
              },
            ].map((f) => (
              <div
                key={f.label}
                className={cn(
                  "p-3 rounded-xl border",
                  f.highlight
                    ? "bg-indigo-50/30 border-indigo-100"
                    : "bg-slate-50 border-slate-100",
                )}
              >
                <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-1">
                  {f.label}
                </p>
                <p
                  className={cn(
                    "text-sm font-bold",
                    f.highlight ? "text-primary" : "text-slate-900",
                  )}
                >
                  {f.value}
                </p>
              </div>
            ))}
          </div>

          {loan.salarySlipPath && (
            <div className="mb-5 p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                  <FileCheck className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <p className="font-bold text-sm text-slate-900">
                    Income Proof
                  </p>
                  <p className="text-xs font-medium text-slate-500">
                    Verified uploaded document
                  </p>
                </div>
              </div>
              <a
                href={`http://localhost:8080/${loan.salarySlipPath.replace(/\\/g, "/").replace(/^.*uploads/, "uploads")}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-xs font-bold bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-slate-700 hover:text-primary hover:border-primary/30 transition-colors shadow-sm"
              >
                View File
              </a>
            </div>
          )}

          <div className="space-y-2 mb-2">
            <Label
              htmlFor="reject-reason"
              className="text-slate-700 font-semibold"
            >
              Rejection Reason{" "}
              <span className="text-slate-400 font-normal">
                (required if rejecting)
              </span>
            </Label>
            <Textarea
              id="reject-reason"
              placeholder="State the reason for rejection..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              className="resize-none bg-slate-50 border-slate-200 focus:bg-white transition-colors"
            />
          </div>
        </div>

        <DialogFooter className="flex gap-3 sm:justify-start p-6 pt-4 border-t border-slate-100 bg-slate-50/50 flex-shrink-0">
          <Button
            variant="outline"
            className="flex-1 h-12 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 hover:border-red-300 transition-colors bg-white shadow-sm disabled:opacity-50"
            onClick={() => act("reject")}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-sm" />
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </>
            )}
          </Button>
          <Button
            variant="default"
            className="flex-1 h-12 bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all disabled:opacity-50"
            onClick={() => act("approve")}
            disabled={loading}
          >
            {loading ? (
              <span className="spinner-sm" />
            ) : (
              <>
                <CheckCircle className="w-4 h-4 mr-2" /> Approve
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function SanctionPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Loan | null>(null);

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [sortCol, setSortCol] = useState<keyof Loan | "borrowerName" | null>(
    null,
  );
  const [sortDesc, setSortDesc] = useState(false);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Loan[]>("/api/admin/loans?status=pending");
      setLoans(data);
      setPage(1);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleDecision = async (
    id: string,
    decision: "approve" | "reject",
    reason?: string,
  ) => {
    await api.patch(`/api/admin/loans/${id}/sanction`, {
      decision,
      rejectionReason: reason,
    });
    await fetchLoans();
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

  const handleSort = (col: keyof Loan | "borrowerName") => {
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

  const SortIcon = ({ col }: { col: keyof Loan | "borrowerName" }) => {
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
      <LoanReviewModal
        loan={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onDecision={handleDecision}
      />

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Sanction Module
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Review pending loan applications and make approval decisions.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="cursor-pointer bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
          onClick={fetchLoans}
          disabled={loading}
        >
          <RefreshCw
            className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="px-4 pb-4 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Pending Applications
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1 font-medium">
              Applications awaiting your review
            </CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-amber-50 text-amber-600 border-amber-200 shadow-sm font-bold px-3 py-1 text-xs uppercase tracking-wider"
          >
            {loans.length} pending
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
              <div className="w-16 h-16 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <CheckCircle className="w-8 h-8 text-emerald-500" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                All caught up!
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                There are no pending applications requiring your review at this
                time.
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
                      <TableHead className="font-semibold text-slate-600">
                        PAN
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("amount")}
                      >
                        Amount <SortIcon col="amount" />
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("tenure")}
                      >
                        Tenure <SortIcon col="tenure" />
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("totalRepayment")}
                      >
                        Total Repayment <SortIcon col="totalRepayment" />
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("createdAt")}
                      >
                        Applied Date <SortIcon col="createdAt" />
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
                          <TableCell className="font-mono text-xs font-semibold text-slate-600">
                            {loan.pan}
                          </TableCell>
                          <TableCell className="font-black text-primary">
                            {formatCurrency(loan.amount)}
                          </TableCell>
                          <TableCell className="font-medium text-slate-700">
                            {loan.tenure} days
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">
                            {formatCurrency(loan.totalRepayment)}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-500">
                            {formatDate(loan.createdAt)}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              onClick={() => setSelected(loan)}
                              className="bg-white text-primary border border-primary/20 hover:bg-indigo-50 shadow-sm"
                            >
                              Review
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
