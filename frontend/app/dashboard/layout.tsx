"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  CreditCard,
  Users,
  FileCheck,
  Banknote,
  DollarSign,
  LogOut,
  ChevronRight,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getUser, clearAuth } from "@/lib/auth";
import type { User } from "@/lib/types";

const ALL_MODULES = [
  {
    path: "/dashboard/sales",
    label: "Sales",
    icon: Users,
    roles: ["admin", "sales"],
  },
  {
    path: "/dashboard/sanction",
    label: "Sanction",
    icon: FileCheck,
    roles: ["admin", "sanction"],
  },
  {
    path: "/dashboard/disbursement",
    label: "Disbursement",
    icon: Banknote,
    roles: ["admin", "disbursement"],
  },
  {
    path: "/dashboard/collection",
    label: "Collection",
    icon: DollarSign,
    roles: ["admin", "collection"],
  },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const u = getUser();
    if (!u) {
      router.replace("/login");
      return;
    }
    if (u.role === "borrower") {
      router.replace("/borrower/dashboard");
      return;
    }
    setUser(u);
  }, [router]);

  if (!user)
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="spinner" />
      </div>
    );

  const modules = ALL_MODULES.filter((m) => m.roles.includes(user.role));
  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-background">
      {/* Sidebar */}
      <aside className="w-70 shrink-0 border-r border-border/50 bg-card flex flex-col sticky top-0 h-screen">
        {/* Brand */}
        <div className="p-4 border-b border-border/50">
          <div className="flex items-center gap-2.5">
            {/* <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <CreditCard className="w-4 h-4 text-primary-foreground" />
            </div> */}
            <div>
              <p className="font-bold text-2xl leading-none">CreditSea</p>
              <p className="text-[10px] text-muted-foreground mt-0.5 uppercase tracking-widest">
                Operations
              </p>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-4 py-3 border-b border-border/50">
          <div className="rounded-lg bg-muted/50 p-3">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium mb-1">
              Logged in as
            </p>
            <p className="font-semibold text-sm capitalize text-primary">
              {user.role}
            </p>
            <p className="text-xs text-muted-foreground truncate">
              {user.name}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {modules.map((mod) => {
            const Icon = mod.icon;
            const active =
              pathname === mod.path || pathname.startsWith(mod.path + "/");
            return (
              <Link
                key={mod.path}
                href={mod.path}
                id={`nav-${mod.label.toLowerCase()}`}
                className={cn(
                  "flex items-center gap-3  p-3 rounded-lg text-sm font-medium transition-all group",
                  active
                    ? "bg-primary/10 text-primary "
                    : "text-muted-foreground hover:bg-muted/50 hover:text-foreground border border-transparent",
                )}
              >
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 shrink-0",
                    active
                      ? "text-primary"
                      : "text-muted-foreground group-hover:text-foreground",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="leading-none">{mod.label}</p>
                </div>
                {active && (
                  <ChevronRight className="w-3.5 h-3.5 shrink-0 text-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <Separator />

        {/* Sign out */}
        <div className="p-3">
          <Button
            id="dash-logout"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-muted-foreground hover:text-destructive hover:bg-destructive/10"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">{children}</main>
    </div>
  );
}
