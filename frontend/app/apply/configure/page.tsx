"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Calculator, Send } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/auth";
import { StepBar } from "../layout";

const RATE = 12;

function calcSI(p: number, t: number) {
  const si = (p * RATE * t) / (365 * 100);
  return {
    si: Math.round(si * 100) / 100,
    total: Math.round((p + si) * 100) / 100,
  };
}

export default function ApplyStep3() {
  const router = useRouter();
  const [amount, setAmount] = useState(150000);
  const [tenure, setTenure] = useState(90);
  const [loading, setLoading] = useState(false);
  const { si, total } = calcSI(amount, tenure);

  const handleApply = async () => {
    setLoading(true);
    try {
      await api.post("/api/loans/apply", { amount, tenure });
      toast.success("Loan application submitted! We'll review it shortly.");
      router.push("/borrower/dashboard");
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      toast.error(e.response?.data?.message || "Application failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl px-6 py-8">
      <CardHeader className="pb-4">
        <StepBar step={3} />
        <div className="flex items-center">
          {/* <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Calculator className="w-6 h-6" />
          </div> */}
          <div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              Loan Setup
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Select your required amount and tenure. Interest is {RATE}% p.a.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-8">
        {/* Amount slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Loan Amount
            </span>
            <span className="text-2xl font-extrabold text-primary">
              {formatCurrency(amount)}
            </span>
          </div>
          <Slider
            id="slider-amount"
            min={50000}
            max={500000}
            step={5000}
            value={[amount]}
            onValueChange={([v]) => setAmount(v!)}
            className="cursor-pointer py-2"
          />
          <div className="flex justify-between text-xs font-semibold text-muted-foreground/60">
            <span>₹50,000</span>
            <span>₹5,00,000</span>
          </div>
        </div>

        {/* Tenure slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">
              Tenure
            </span>
            <span className="text-2xl font-extrabold text-primary">
              {tenure} days
            </span>
          </div>
          <Slider
            id="slider-tenure"
            min={30}
            max={365}
            step={5}
            value={[tenure]}
            onValueChange={([v]) => setTenure(v!)}
            className="cursor-pointer py-2"
          />
          <div className="flex justify-between text-xs font-semibold text-muted-foreground/60">
            <span>30 days</span>
            <span>365 days</span>
          </div>
        </div>

        <Separator className="bg-border/60" />

        {/* Live repayment panel */}
        <div className="space-y-4 shadow-sm">
          <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
            Repayment Summary
          </p>
          <div className="grid grid-cols-3 gap-4">
            {[
              {
                label: "Principal",
                value: formatCurrency(amount),
                highlight: false,
              },
              {
                label: "Interest",
                value: formatCurrency(si),
                highlight: false,
              },
              {
                label: "Total Due",
                value: formatCurrency(total),
                highlight: true,
              },
            ].map((item) => (
              <div
                key={item.label}
                className={`rounded-xl p-3 text-center border transition-colors ${
                  item.highlight
                    ? "bg-primary/5 border-primary/20 shadow-sm shadow-primary/5"
                    : "bg-background/50 border-border/40"
                }`}
              >
                <p className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider mb-1.5">
                  {item.label}
                </p>
                <p
                  className={`text-lg font-extrabold tracking-tight ${item.highlight ? "text-primary" : "text-foreground"}`}
                >
                  {item.value}
                </p>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-muted-foreground/80 text-center font-medium">
            Calculated as Simple Interest: (P × {RATE} × T) / 36500
          </p>
        </div>

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-6 rounded-xl hover:bg-muted"
            id="configure-back"
            onClick={() => router.push("/apply/upload")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            id="configure-apply"
            size="lg"
            className="flex-1 h-14 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all text-base"
            onClick={handleApply}
            disabled={loading}
          >
            {loading ? (
              "Submitting…"
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
