"use client";
import { useEffect, useState, useCallback } from "react";
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
import { Users, RefreshCw, UserCheck, UserX } from "lucide-react";
import api from "@/lib/api";
import type { User } from "@/lib/types";

export default function SalesPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [noLoanUsers, setNoLoanUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("no-loan");

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const [a, b] = await Promise.all([
        api.get<User[]>("/api/admin/users"),
        api.get<User[]>("/api/admin/users?noLoan=true"),
      ]);
      setAllUsers(a.data);
      setNoLoanUsers(b.data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const displayed = tab === "no-loan" ? noLoanUsers : allUsers;

  const stats = [
    { label: "Total Borrowers", value: allUsers.length, icon: Users },
    { label: "No Application", value: noLoanUsers.length, icon: UserX },
    {
      label: "Applied",
      value: allUsers.length - noLoanUsers.length,
      icon: UserCheck,
    },
  ];

  return (
    <div className="p-8 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            Sales Module
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Track borrowers who registered but haven&apos;t applied yet.
          </p>
        </div>
        <Button
          variant="outline"
          size="lg"
          id="sales-refresh"
          className="cursor-pointer"
          onClick={fetchUsers}
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Card key={s.label} className="">
              <CardContent className="pt-5 pb-4">
                <div className="flex items-center gap-8">
                  <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Icon className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-3xl font-extrabold leading-none">
                      {s.value}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
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
      <Card className="border-border/50 p-6">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Borrowers</CardTitle>
            <Tabs value={tab} onValueChange={setTab}>
              <TabsList className="h-12 w-full">
                <TabsTrigger
                  value="no-loan"
                  id="sales-filter-no-loan"
                  className="text-xs"
                >
                  No Application
                </TabsTrigger>
                <TabsTrigger
                  value="all"
                  id="sales-filter-all"
                  className="text-xs"
                >
                  All
                </TabsTrigger>
              </TabsList>
            </Tabs>
          </div>
          <CardDescription>
            {displayed.length} user{displayed.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="spinner" />
            </div>
          ) : displayed.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No users found.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>#</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>BRE Done</TableHead>
                  <TableHead>Doc Uploaded</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayed.map((u, i) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-muted-foreground w-12">
                      {i + 1}
                    </TableCell>
                    <TableCell className="font-semibold">{u.name}</TableCell>
                    <TableCell className="text-muted-foreground">
                      {u.email}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.breCompleted ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {u.breCompleted ? "✓ Done" : "✗ Pending"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={u.uploadCompleted ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {u.uploadCompleted ? "✓ Done" : "✗ Pending"}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
