"use client";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, ShieldCheck, Check, X } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { getUser } from "@/lib/auth";
import { StepBar } from "./layout";

const EMPLOYMENT_MODES = [
  { value: "salaried", label: "Salaried", icon: "🏢" },
  { value: "self-employed", label: "Self-Employed", icon: "💼" },
  { value: "unemployed", label: "Unemployed", icon: "🔍" },
];

export default function ApplyStep1() {
  const router = useRouter();
  const [form, setForm] = useState({
    pan: "",
    dob: "",
    monthlySalary: "",
    employmentMode: "salaried",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const user = getUser();
    if (user?.pan) setForm((f) => ({ ...f, pan: user.pan || "" }));
  }, []);

  const panValid = useMemo(() => {
    return /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.pan);
  }, [form.pan]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors([]);
    setLoading(true);
    try {
      await api.post("/api/loans/bre", {
        pan: form.pan,
        dob: form.dob,
        monthlySalary: Number(form.monthlySalary),
        employmentMode: form.employmentMode,
      });
      toast.success("Eligibility check passed!");
      router.push("/apply/upload");
    } catch (err) {
      const e = err as AxiosError<{ message: string; errors?: string[] }>;
      if (e.response?.data?.errors) setErrors(e.response.data.errors);
      else setErrors([e.response?.data?.message || "Submission failed"]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="pb-8">
        <StepBar step={1} />
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Personal Details
            </h2>
            <p className="text-sm mt-1 text-slate-500">
              Verify your eligibility instantly with our smart engine.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {errors.length > 0 && (
          <Alert
            variant="destructive"
            className="bg-red-50 border-red-200 text-red-700"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2">
              <p className="font-semibold mb-1">Eligibility check failed:</p>
              <ul className="list-disc list-inside space-y-1 text-sm opacity-90">
                {errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2.5">
            <div className="flex justify-between items-end">
              <Label htmlFor="bre-pan" className="text-slate-700 font-medium">
                PAN Number
              </Label>
              {form.pan.length > 0 && (
                <span className={cn("text-[10px] font-semibold flex items-center gap-1 uppercase tracking-wider", panValid ? "text-emerald-600" : "text-red-500")}>
                  {panValid ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                  {panValid ? "Valid format" : "Invalid format"}
                </span>
              )}
            </div>
            <Input
              id="bre-pan"
              placeholder="e.g. ABCDE1234F"
              value={form.pan}
              onChange={(e) =>
                setForm({ ...form, pan: e.target.value.toUpperCase() })
              }
              maxLength={10}
              required
              className={cn(
                "uppercase tracking-widest font-mono h-12 px-4 bg-slate-50 border-slate-200 focus:bg-white transition-colors",
                form.pan.length === 10 && panValid && "border-emerald-400 focus:border-emerald-500",
                form.pan.length === 10 && !panValid && "border-red-400 focus:border-red-500",
              )}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label htmlFor="bre-dob" className="text-slate-700 font-medium">
                Date of Birth
              </Label>
              <Input
                id="bre-dob"
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
                className="h-12 px-4 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="bre-salary" className="text-slate-700 font-medium">
                Monthly Salary (₹)
              </Label>
              <Input
                id="bre-salary"
                type="number"
                placeholder="50000"
                value={form.monthlySalary}
                onChange={(e) =>
                  setForm({ ...form, monthlySalary: e.target.value })
                }
                min={0}
                required
                className="h-12 px-4 bg-slate-50 border-slate-200 focus:bg-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-slate-700 font-medium">Employment Status</Label>
            <RadioGroup
              value={form.employmentMode}
              onValueChange={(value) =>
                setForm({ ...form, employmentMode: value })
              }
              className="grid grid-cols-1 sm:grid-cols-3 gap-3"
            >
              {EMPLOYMENT_MODES.map((mode) => (
                <div
                  key={mode.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                    form.employmentMode === mode.value
                      ? "border-primary bg-indigo-50/50"
                      : "border-slate-200 hover:bg-slate-50",
                  )}
                >
                  <RadioGroupItem
                    value={mode.value}
                    id={`bre-mode-${mode.value}`}
                  />

                  <Label
                    htmlFor={`bre-mode-${mode.value}`}
                    className="flex cursor-pointer items-center gap-3 w-full"
                  >
                    <span className="text-sm font-semibold text-slate-700">{mode.label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          <div className="pt-4">
            <Button
              id="bre-submit"
              type="submit"
              size="lg"
              className="w-full h-14 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || (form.pan.length > 0 && !panValid)}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner-sm" />
                  Verifying...
                </span>
              ) : (
                <>
                  <ShieldCheck className="w-5 h-5 mr-2" />
                  Verify & Continue
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
