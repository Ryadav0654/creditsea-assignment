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
  Banknote,
  RefreshCw,
  Send,
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

export default function DisbursementPage() {
  const [loans, setLoans] = useState<Loan[]>([]);
  const [loading, setLoading] = useState(true);
  const [disbursing, setDisbursing] = useState<string | null>(null);

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
      const { data } = await api.get<Loan[]>(
        "/api/admin/loans?status=sanctioned",
      );
      setLoans(data);
      setPage(1);
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
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Disbursement Module
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Release funds for sanctioned loans.
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
        <CardHeader className="px-4 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-lg font-bold text-slate-900">
              Sanctioned Loans
            </CardTitle>
            <CardDescription className="text-slate-500 mt-1 font-medium">
              Ready for disbursement
            </CardDescription>
          </div>
          <Badge
            variant="secondary"
            className="bg-indigo-50 text-indigo-600 border-indigo-200 shadow-sm font-bold px-3 py-1 text-xs uppercase tracking-wider"
          >
            {loans.length} ready
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
                <Banknote className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No pending disbursements
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                There are no sanctioned loans awaiting disbursement at this
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
                      <TableHead className="font-semibold text-slate-600">
                        Sanctioned By
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("sanctionedAt")}
                      >
                        Sanctioned On <SortIcon col="sanctionedAt" />
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
                      const sanctionedBy =
                        typeof loan.sanctionedBy === "object"
                          ? loan.sanctionedBy
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
                          <TableCell className="font-black text-primary">
                            {formatCurrency(loan.amount)}
                          </TableCell>
                          <TableCell className="font-medium text-slate-700">
                            {loan.tenure} days
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">
                            {formatCurrency(loan.totalRepayment)}
                          </TableCell>
                          <TableCell className="text-sm font-semibold text-slate-700">
                            {sanctionedBy?.name ?? "—"}
                          </TableCell>
                          <TableCell className="text-xs font-medium text-slate-500">
                            {loan.sanctionedAt
                              ? formatDate(loan.sanctionedAt)
                              : "—"}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              size="sm"
                              className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20 disabled:opacity-50 transition-colors"
                              onClick={() => handleDisburse(loan._id)}
                              disabled={disbursing === loan._id}
                            >
                              {disbursing === loan._id ? (
                                <span className="flex items-center">
                                  <span className="spinner-sm mr-2" />{" "}
                                  Processing
                                </span>
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
