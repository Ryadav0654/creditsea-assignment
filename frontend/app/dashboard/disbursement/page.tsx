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
import { Banknote, RefreshCw, Send } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency, formatDate } from "@/lib/auth";
import type { Loan } from "@/lib/types";

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [disbursing, setDisbursing] = useState<string | null>(null);

  const fetchLoans = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get<Loan[]>(
        "/api/admin/loans?status=sanctioned",
      );
      setLoans(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLoans();
  }, [fetchLoans]);

  const handleDisburse = async (id: string) => {
    setDisbursing(id);
    try {
      await api.patch(`/api/admin/loans/${id}/disburse`);
      toast.success("Loan disbursed successfully!");
      await fetchLoans();
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || "Disbursement failed");
    } finally {
      setDisbursing(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Disbursement Module
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Release funds for sanctioned loans.
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
            <CardTitle className="text-base">Sanctioned Loans</CardTitle>
            <CardDescription>Ready for disbursement</CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-primary/10 text-primary border-primary/20"
          >
            {loans.length} ready
          </Badge>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : loans.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Banknote className="w-12 h-12 mx-auto mb-3 text-muted" />
              <p>No sanctioned loans awaiting disbursement.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Borrower</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Tenure</TableHead>
                  <TableHead>Total Repayment</TableHead>
                  <TableHead>Sanctioned By</TableHead>
                  <TableHead>Sanctioned On</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loans.map((loan) => {
                  const borrower =
                    typeof loan.borrower === "object" ? loan.borrower : null;
                  const sanctionedBy =
                    typeof loan.sanctionedBy === "object"
                      ? loan.sanctionedBy
                      : null;
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
                      <TableCell className="font-bold text-primary">
                        {formatCurrency(loan.amount)}
                      </TableCell>
                      <TableCell>{loan.tenure} days</TableCell>
                      <TableCell className="font-semibold">
                        {formatCurrency(loan.totalRepayment)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {sanctionedBy?.name ?? "—"}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">
                        {loan.sanctionedAt
                          ? formatDate(loan.sanctionedAt)
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => handleDisburse(loan._id)}
                          disabled={disbursing === loan._id}
                        >
                          {disbursing === loan._id ? (
                            "Processing..."
                          ) : (
                            <>
                              <Send className="w-3 h-3 mr-2" /> Disburse
                            </>
                          )}
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
