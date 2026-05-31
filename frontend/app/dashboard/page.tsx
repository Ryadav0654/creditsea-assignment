"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "../../lib/auth";

const ROLE_HOME: Record<string, string> = {
  admin:        "/dashboard/sanction",
  sales:        "/dashboard/sales",
  sanction:     "/dashboard/sanction",
  disbursement: "/dashboard/disbursement",
  collection:   "/dashboard/collection",
};

export default function DashboardIndex() {
  const router = useRouter();
  useEffect(() => {
    const user = getUser();
    if (!user) { router.replace("/login"); return; }
    const target = ROLE_HOME[user.role] ?? "/login";
    router.replace(target);
  }, [router]);

  return (
    <div className="flex items-center justify-center h-screen bg-slate-50">
      <div className="flex flex-col items-center gap-3">
        <div className="spinner" />
        <p className="text-sm font-medium text-slate-500">Redirecting to your module...</p>
      </div>
    </div>
  );
}
