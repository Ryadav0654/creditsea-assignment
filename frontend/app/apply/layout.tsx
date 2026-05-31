"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
  { label: "Personal Details", path: "/apply" },
  { label: "Document Upload", path: "/apply/upload" },
  { label: "Loan Setup", path: "/apply/configure" },
];

export function StepBar({ step }: { step: number }) {
  return (
    <div className="flex items-center gap-0 mb-8">
      {STEPS.map((s, i) => {
        const done = i + 1 < step;
        const active = i + 1 === step;
        return (
          <div
            key={i}
            className={cn(
              "flex items-center",
              i < STEPS.length - 1 && "flex-1",
            )}
          >
            <div className="flex flex-col items-center gap-1.5">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all duration-300",
                  done &&
                    "bg-emerald-50 border-emerald-500 text-emerald-600",
                  active &&
                    "bg-primary border-primary text-white shadow-lg shadow-primary/30",
                  !done &&
                    !active &&
                    "bg-slate-100 border-slate-200 text-slate-400",
                )}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold whitespace-nowrap uppercase tracking-wide",
                  done && "text-emerald-600",
                  active && "text-primary",
                  !done && !active && "text-slate-400",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 mb-5 rounded-full transition-all duration-500",
                  done ? "bg-emerald-500" : "bg-slate-200",
                )}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export default function ApplyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  useEffect(() => {
    const user = getUser();
    if (!user) {
      router.replace("/login");
      return;
    }
    if (user.role !== "borrower") router.replace("/dashboard");
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50/40 px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-1">
          <span className="font-extrabold text-base gradient-text">CreditSea</span>
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mt-2">Loan Application</h1>
        <p className="text-sm text-slate-500 mt-1">
          Complete all steps to submit your application
        </p>
      </div>
      <div className="mx-auto max-w-4xl">{children}</div>
    </div>
  );
}
