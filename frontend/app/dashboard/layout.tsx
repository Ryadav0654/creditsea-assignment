"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  FileCheck,
  Banknote,
  DollarSign,
  LogOut,
  ChevronRight,
  Menu,
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
  const [isSidebarOpen, setSidebarOpen] = useState(true);

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
      <div className="flex items-center justify-center min-h-screen bg-slate-50">
        <div className="flex flex-col items-center gap-3">
          <div className="spinner" />
          <p className="text-sm text-slate-500 font-medium">Loading workspace...</p>
        </div>
      </div>
    );

  const modules = ALL_MODULES.filter((m) => m.roles.includes(user.role));
  const logout = () => {
    clearAuth();
    router.replace("/login");
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden fixed bottom-4 right-4 z-50">
        <Button
          size="icon"
          className="rounded-full shadow-lg w-12 h-12"
          onClick={() => setSidebarOpen(!isSidebarOpen)}
        >
          <Menu className="w-5 h-5" />
        </Button>
      </div>

      {/* Sidebar */}
      <aside 
        className={cn(
          "w-70 shrink-0 border-r border-slate-200 bg-white flex flex-col sticky top-0 h-screen transition-transform duration-300 md:translate-x-0 z-40 fixed md:static",
          !isSidebarOpen && "-translate-x-full"
        )}
      >
        {/* Brand */}
        <div className="p-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div>
              <p className="font-extrabold text-2xl leading-none text-slate-900 tracking-tight">CreditSea</p>
              <p className="text-[10px] text-primary mt-1 font-bold uppercase tracking-widest bg-indigo-50 inline-block px-1.5 py-0.5 rounded">
                Operations
              </p>
            </div>
          </div>
        </div>

        {/* Role badge */}
        <div className="px-5 py-4 border-b border-slate-100">
          <div className="rounded-xl bg-slate-50 border border-slate-100 p-3.5 shadow-sm">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1.5">
              Logged in as
            </p>
            <p className="font-extrabold text-sm capitalize text-slate-900">
              {user.role}
            </p>
            <p className="text-xs text-slate-500 truncate mt-0.5 font-medium">
              {user.name}
            </p>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1.5 overflow-y-auto">
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
                  "flex items-center gap-3 p-3 rounded-xl text-sm font-semibold transition-all group relative",
                  active
                    ? "bg-indigo-50 text-primary"
                    : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 border border-transparent",
                )}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full" />
                )}
                <Icon
                  className={cn(
                    "w-4.5 h-4.5 shrink-0",
                    active
                      ? "text-primary"
                      : "text-slate-400 group-hover:text-slate-600",
                  )}
                />
                <div className="flex-1 min-w-0">
                  <p className="leading-none">{mod.label}</p>
                </div>
                {active && (
                  <ChevronRight className="w-4 h-4 shrink-0 text-primary" />
                )}
              </Link>
            );
          })}
        </nav>

        <Separator className="bg-slate-100" />

        {/* Sign out */}
        <div className="p-4">
          <Button
            id="dash-logout"
            variant="ghost"
            size="sm"
            className="w-full justify-start text-slate-500 font-semibold hover:text-red-600 hover:bg-red-50"
            onClick={logout}
          >
            <LogOut className="w-4 h-4 mr-2" />
            Sign out
          </Button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto bg-slate-50/50">
        <div className="max-w-[1600px] mx-auto w-full">
          {children}
        </div>
      </main>
      
      {/* Mobile overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/20 backdrop-blur-sm z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
