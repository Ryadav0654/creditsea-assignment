"use client";
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Users,
  RefreshCw,
  UserCheck,
  UserX,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import api from "@/lib/api";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";

export default function SalesPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [noLoanUsers, setNoLoanUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("no-loan");

  // Pagination & Sorting state
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;
  const [sortCol, setSortCol] = useState<keyof User | null>(null);
  const [sortDesc, setSortDesc] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        api.get<User[]>("/api/admin/users"),
        api.get<User[]>("/api/admin/users?noLoan=true"),
      ]);
      setAllUsers(a.data);
      setNoLoanUsers(b.data);
      setPage(1); // Reset page on fetch
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Handle tab change
  const handleTabChange = (v: string) => {
    setTab(v);
    setPage(1);
  };

  // Sort and paginate data
  const displayedData = useMemo(() => {
    let data = tab === "no-loan" ? [...noLoanUsers] : [...allUsers];

    if (sortCol) {
      data.sort((a, b) => {
        const valA = String(a[sortCol] || "");
        const valB = String(b[sortCol] || "");
        return sortDesc ? valB.localeCompare(valA) : valA.localeCompare(valB);
      });
    }

    const start = (page - 1) * itemsPerPage;
    const paginated = data.slice(start, start + itemsPerPage);
    return {
      data: paginated,
      total: data.length,
      totalPages: Math.ceil(data.length / itemsPerPage),
    };
  }, [allUsers, noLoanUsers, tab, sortCol, sortDesc, page]);

  const handleSort = (col: keyof User) => {
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

  const SortIcon = ({ col }: { col: keyof User }) => {
    if (sortCol !== col)
      return <ArrowUpDown className="w-3 h-3 ml-1 inline-block opacity-50" />;
    return sortDesc ? (
      <ArrowDown className="w-3 h-3 ml-1 inline-block text-primary" />
    ) : (
      <ArrowUp className="w-3 h-3 ml-1 inline-block text-primary" />
    );
  };

  const stats = [
    {
      label: "Total Borrowers",
      value: allUsers.length,
      icon: Users,
      color: "text-indigo-600",
      bg: "bg-indigo-50",
      border: "border-indigo-100",
    },
    {
      label: "No Application",
      value: noLoanUsers.length,
      icon: UserX,
      color: "text-amber-600",
      bg: "bg-amber-50",
      border: "border-amber-100",
    },
    {
      label: "Applied",
      value: allUsers.length - noLoanUsers.length,
      icon: UserCheck,
      color: "text-emerald-600",
      bg: "bg-emerald-50",
      border: "border-emerald-100",
    },
  ];

  return (
    <div className="p-6 sm:p-10 lg:p-12 space-y-8 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            Sales Module
          </h1>
          <p className="text-slate-500 text-sm mt-1 font-medium">
            Track borrowers who registered but haven&apos;t applied yet.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          id="sales-refresh"
          className="cursor-pointer bg-white hover:bg-slate-50 border-slate-200 text-slate-700 shadow-sm"
          onClick={fetchUsers}
          disabled={loading}
        >
          <RefreshCw
            className={cn("w-4 h-4 mr-2", loading && "animate-spin")}
          />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card
              key={s.label}
              className="bg-white border-slate-200 shadow-sm hover:shadow-md transition-shadow"
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-5">
                  <div
                    className={cn(
                      "w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm",
                      s.bg,
                      s.color,
                      s.border,
                    )}
                  >
                    <Icon className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-3xl font-black text-slate-900 tracking-tight">
                      {loading ? (
                        <span className="skeleton w-12 h-8 inline-block rounded" />
                      ) : (
                        s.value
                      )}
                    </p>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mt-1">
                      {s.label}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Table */}
      <Card className="border-slate-200 bg-white shadow-sm overflow-hidden">
        <CardHeader className="p-6 pb-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold text-slate-900">
                Borrowers Directory
              </CardTitle>
              <CardDescription className="text-slate-500 mt-1 font-medium">
                {loading
                  ? "Loading..."
                  : `${displayedData.total} user${displayedData.total !== 1 ? "s" : ""} found`}
              </CardDescription>
            </div>
            <Tabs
              value={tab}
              onValueChange={handleTabChange}
              className="w-full sm:w-auto"
            >
              <TabsList className="h-11 w-full bg-slate-100 p-1 border border-slate-200">
                <TabsTrigger
                  value="no-loan"
                  id="sales-filter-no-loan"
                  className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  No Application
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  id="sales-filter-all"
                  className="text-xs font-semibold data-[state=active]:bg-white data-[state=active]:text-primary data-[state=active]:shadow-sm"
                >
                  All Users
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="p-6 space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex gap-4">
                  <div className="h-10 w-full skeleton rounded-lg" />
                </div>
              ))}
            </div>
          ) : displayedData.total === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-16 h-16 bg-slate-100 border border-slate-200 rounded-2xl flex items-center justify-center mb-4 shadow-inner">
                <Users className="w-8 h-8 text-slate-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No users found
              </h3>
              <p className="text-slate-500 text-sm max-w-sm">
                There are currently no borrowers matching this filter.
              </p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader className="bg-slate-50/80">
                    <TableRow className="hover:bg-transparent border-slate-100">
                      <TableHead className="w-16 text-center font-semibold text-slate-600">
                        #
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("name")}
                      >
                        Name <SortIcon col="name" />
                      </TableHead>
                      <TableHead
                        className="font-semibold text-slate-600 cursor-pointer hover:text-slate-900 select-none"
                        onClick={() => handleSort("email")}
                      >
                        Email <SortIcon col="email" />
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600 text-center">
                        BRE Status
                      </TableHead>
                      <TableHead className="font-semibold text-slate-600 text-center">
                        Docs Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayedData.data.map((u, i) => {
                      const absoluteIndex = (page - 1) * itemsPerPage + i + 1;
                      return (
                        <TableRow
                          key={u.id}
                          className="hover:bg-slate-50/80 border-slate-100 transition-colors"
                        >
                          <TableCell className="text-slate-400 text-center font-mono text-xs">
                            {absoluteIndex}
                          </TableCell>
                          <TableCell className="font-bold text-slate-900">
                            {u.name}
                          </TableCell>
                          <TableCell className="text-slate-500">
                            {u.email}
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase tracking-wider font-bold shadow-sm",
                                u.breCompleted
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-slate-50 text-slate-500 border-slate-200",
                              )}
                            >
                              {u.breCompleted ? "✓ Passed" : "Pending"}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-center">
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-[10px] uppercase tracking-wider font-bold shadow-sm",
                                u.uploadCompleted
                                  ? "bg-emerald-50 text-emerald-600 border-emerald-200"
                                  : "bg-slate-50 text-slate-500 border-slate-200",
                              )}
                            >
                              {u.uploadCompleted ? "✓ Uploaded" : "Pending"}
                            </Badge>
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
