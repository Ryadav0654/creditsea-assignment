"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getUser } from "@/lib/auth";
import { CreditCard, CheckCircle2 } from "lucide-react";
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
                    "bg-emerald-500/15 border-emerald-500 text-emerald-500",
                  active &&
                    "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/30",
                  !done &&
                    !active &&
                    "bg-muted border-border text-muted-foreground",
                )}
              >
                {done ? <CheckCircle2 className="w-4 h-4" /> : i + 1}
              </div>
              <span
                className={cn(
                  "text-[10px] font-semibold whitespace-nowrap uppercase tracking-wide",
                  done && "text-emerald-500",
                  active && "text-primary",
                  !done && !active && "text-muted-foreground",
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 flex-1 mx-2 mb-5 rounded-full transition-all duration-500",
                  done ? "bg-emerald-500" : "bg-border",
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
    <div className="min-h-screen bg-background px-4 py-10">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 mb-1">
         
          <span className="font-bold text-base">CreditSea</span>
        </div>
        <h1 className="text-2xl font-bold gradient-text">Loan Application</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Complete all steps to submit your application
        </p>
      </div>
      <div className="mx-auto max-w-2xl">{children}</div>
    </div>
  );
}
