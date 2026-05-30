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
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: "100%" }}>
      <div className="spinner" />
    </div>
  );
}
