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
} from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/auth";
import type { Loan } from "@/lib/types";

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

  // Reset form when modal opens with a new loan
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
      <DialogContent className="sm:max-w-137 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-primary" /> Loan Review
          </DialogTitle>
          <DialogDescription>
            Review the application details and make a sanction decision.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 my-4">
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
            { label: "Loan Amount", value: formatCurrency(loan.amount) },
            { label: "Tenure", value: `${loan.tenure} days` },
            {
              label: "Interest (SI)",
              value: formatCurrency(loan.simpleInterest),
            },
            {
              label: "Total Repayment",
              value: formatCurrency(loan.totalRepayment),
            },
          ].map((f) => (
            <div
              key={f.label}
              className="p-3 bg-muted/40 rounded-lg border border-border/50"
            >
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium mb-1">
                {f.label}
              </p>
              <p className="text-sm font-semibold text-foreground">{f.value}</p>
            </div>
          ))}
        </div>

        {loan.salarySlipPath && (
          <div className="mb-4">
            <a
              href={`http://localhost:8080/${loan.salarySlipPath.replace(/\\/g, "/").replace(/^.*uploads/, "uploads")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline underline-offset-4"
            >
              <FileCheck className="w-4 h-4" /> View Salary Slip
            </a>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <Label htmlFor="reject-reason">
            Rejection Reason (required if rejecting)
          </Label>
          <Textarea
            id="reject-reason"
            placeholder="State the reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
          />
        </div>

        <DialogFooter className="flex gap-2 sm:justify-start">
          <Button
            variant="destructive"
            className="flex-1"
            onClick={() => act("reject")}
            disabled={loading}
          >
            {loading ? (
              "Processing..."
            ) : (
              <>
                <XCircle className="w-4 h-4 mr-2" /> Reject
              </>
            )}
          </Button>
          <Button
            variant="default"
            className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            onClick={() => act("approve")}
            disabled={loading}
          >
            {loading ? (
              "Processing..."
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

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Loan[]>("/api/admin/loans?status=pending");
      setLoans(data);
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

  return (
    <div className="p-8 space-y-6">
      <LoanReviewModal
        loan={selected}
        open={!!selected}
        onOpenChange={(open) => !open && setSelected(null)}
        onDecision={handleDecision}
      />

      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            {/* <FileCheck className="w-6 h-6 text-primary" /> */}
            Sanction Module
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review pending loan applications and make approval decisions.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          className="cursor-pointer"
          onClick={fetchLoans}
        >
          <RefreshCw className="w-4 h-4 mr-2 " />
          Refresh
        </Button>
      </div>

      <Card className="border-border/50">
        <CardHeader className="pb-3 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-base">Pending Applications</CardTitle>
            <CardDescription>Applications awaiting your review</CardDescription>
          </div>
          <Badge
            variant="outline"
            className="bg-warning/10  text-warning border-warning/20"
          >
            {loans.length} pending
          </Badge>
        </CardHeader>
        <CardContent className="pt-2">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p>No pending applications. All caught up!</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>PAN</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Total Repayment</TableHead>
                  <TableHead>Applied Date</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const borrower =
                    typeof loan.borrower === "object" ? loan.borrower : null;
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
                      <TableCell className="font-mono text-xs">
                        {loan.pan}
                      </TableCell>
                      <TableCell className="font-bold text-primary">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell>{loan.tenure} days</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(loan.totalRepayment)}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {formatDate(loan.createdAt)}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button size="sm" onClick={() => setSelected(loan)}>
                          Review
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
