"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, ArrowRight, ShieldCheck } from "lucide-react";
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
    <Card className="border-none shadow-2xl bg-card/60 backdrop-blur-xl px-6 py-8">
      <CardHeader className="pb-6">
        <StepBar step={1} />
        <div className="flex flex-col items-center">
          <div className="flex flex-col items-center">
            <CardTitle className="text-2xl font-bold tracking-tight">
              Personal Details
            </CardTitle>
            <CardDescription className="text-sm mt-1">
              Verify your eligibility instantly with our smart engine.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {errors.length > 0 && (
          <Alert
            variant="destructive"
            className="bg-destructive/10 border-destructive/20 text-destructive"
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2.5">
            <Label htmlFor="bre-pan" className="text-sm font-medium">
              PAN Number
            </Label>
            <Input
              id="bre-pan"
              placeholder="e.g. ABCDE1234F"
              value={form.pan}
              onChange={(e) =>
                setForm({ ...form, pan: e.target.value.toUpperCase() })
              }
              maxLength={10}
              required
              className="uppercase tracking-widest font-mono h-12 px-4 transition-all focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div className="space-y-2.5">
              <Label htmlFor="bre-dob" className="text-sm font-medium">
                Date of Birth
              </Label>
              <Input
                id="bre-dob"
                type="date"
                value={form.dob}
                onChange={(e) => setForm({ ...form, dob: e.target.value })}
                max={new Date().toISOString().split("T")[0]}
                required
                className="h-12 px-4 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>

            <div className="space-y-2.5">
              <Label htmlFor="bre-salary" className="text-sm font-medium">
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
                className="h-12 px-4 transition-all focus:ring-2 focus:ring-primary/20"
              />
            </div>
          </div>

          <div className="space-y-3 pt-2">
            <Label className="text-sm font-medium">Employment Status</Label>
            <RadioGroup
              value={form.employmentMode}
              onValueChange={(value) =>
                setForm({ ...form, employmentMode: value })
              }
              className="grid grid-cols-3 gap-3"
            >
              {EMPLOYMENT_MODES.map((mode) => (
                <div
                  key={mode.value}
                  className={cn(
                    "flex cursor-pointer items-center gap-3 rounded-lg border p-4 transition-colors",
                    form.employmentMode === mode.value
                      ? "border-primary bg-primary/5"
                      : "border-border hover:bg-muted/40",
                  )}
                >
                  <RadioGroupItem
                    value={mode.value}
                    id={`bre-mode-${mode.value}`}
                  />

                  <Label
                    htmlFor={`bre-mode-${mode.value}`}
                    className="flex cursor-pointer items-center gap-3"
                  >
                    {/* <span className="text-xl">{mode.icon}</span> */}

                    <span className="text-sm font-medium">{mode.label}</span>
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
              className="w-full h-12 text-base shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all cursor-pointer"
              disabled={loading}
            >
              {loading ? (
                "Verifying..."
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
      </CardContent>
    </Card>
  );
}
