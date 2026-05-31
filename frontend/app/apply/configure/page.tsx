"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Send } from "lucide-react";
import api from "@/lib/api";
import { formatCurrency } from "@/lib/auth";
import { StepBar } from "../layout";
import { cn } from "@/lib/utils";

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
    <div className="w-full relative">
      <div className="pb-8">
        <StepBar step={3} />
        <div className="flex items-center mt-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Loan Setup
            </h2>
            <p className="text-sm mt-1 text-slate-500">
              Select your required amount and tenure. Interest is {RATE}% p.a.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
          
          {/* Sliders Container */}
          <div className="space-y-8">
            {/* Amount slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
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
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>₹50,000</span>
                <span>₹5,00,000</span>
              </div>
            </div>

            {/* Tenure slider */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-700">
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
              <div className="flex justify-between text-xs font-semibold text-slate-400">
                <span>30 days</span>
                <span>365 days</span>
              </div>
            </div>
          </div>

          {/* Sticky Summary Card */}
          <div className="md:sticky md:top-6 self-start">
            <div className="rounded-2xl bg-indigo-50/50 border border-indigo-100 p-5 space-y-4 shadow-sm">
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-primary/60"></span>
                Repayment Summary
              </p>
              
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                  <span>Principal</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(amount)}</span>
                </div>
                <div className="flex justify-between items-center text-sm font-medium text-slate-600">
                  <span>Total Interest ({RATE}% p.a.)</span>
                  <span className="font-semibold text-slate-900">{formatCurrency(si)}</span>
                </div>
                <Separator className="bg-slate-200" />
                <div className="flex justify-between items-center">
                  <span className="text-sm font-semibold text-slate-700">Total Due</span>
                  <span className="text-2xl font-extrabold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
              
              <p className="text-[11px] text-slate-400 text-center font-medium pt-2">
                Calculated as Simple Interest: (P × {RATE} × T) / 36500
              </p>
            </div>
          </div>

        </div>

        <Separator className="bg-slate-100" />

        <div className="flex gap-4">
          <Button
            variant="outline"
            size="lg"
            className="h-14 px-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
            id="configure-back"
            onClick={() => router.push("/apply/upload")}
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back
          </Button>
          <Button
            id="configure-apply"
            size="lg"
            className="flex-1 h-14 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleApply}
            disabled={loading}
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <span className="spinner-sm" />
                Submitting…
              </span>
            ) : (
              <>
                <Send className="w-5 h-5 mr-2" />
                Submit Application
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
