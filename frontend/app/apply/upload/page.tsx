"use client";
import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import type { AxiosError } from "axios";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Upload,
  FileCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/lib/api";
import { StepBar } from "../layout";

export default function ApplyStep2() {
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    const allowed = ["application/pdf", "image/jpeg", "image/png"];
    if (!allowed.includes(f.type)) {
      setError("Only PDF, JPG, or PNG files are allowed");
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      setError("File must be under 5 MB");
      return;
    }
    setError("");
    setFile(f);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      setError("Please select a file");
      return;
    }
    setError("");
    setLoading(true);
    const formData = new FormData();
    formData.append("salary_slip", file);
    try {
      await api.post("/api/loans/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("Document uploaded successfully!");
      router.push("/apply/configure");
    } catch (err) {
      const e = err as AxiosError<{ message: string }>;
      setError(e.response?.data?.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="pb-8">
        <StepBar step={2} />
        <div className="flex items-center gap-3 mt-4">
          <div className="p-2.5 rounded-xl bg-indigo-50 text-primary border border-indigo-100">
            <Upload className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900">
              Income Verification
            </h2>
            <p className="text-sm mt-1 text-slate-500">
              Upload your latest salary slip to verify income.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-6 max-w-2xl mx-auto">
        {error && (
          <Alert
            variant="destructive"
            className="bg-red-50 border-red-200 text-red-700"
          >
            <AlertCircle className="h-5 w-5" />
            <AlertDescription className="ml-2 font-medium">
              {error}
            </AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Drop zone */}
          <div
            id="upload-dropzone"
            onClick={() => fileRef.current?.click()}
            onDragOver={(e) => {
              e.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragging(false);
              const f = e.dataTransfer.files[0];
              if (f) handleFile(f);
            }}
            className={cn(
              "border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 select-none group bg-slate-50",
              dragging
                ? "border-primary bg-indigo-50/50 scale-[1.02] shadow-xl shadow-primary/10"
                : "border-slate-300 hover:border-primary/50 hover:bg-white",
              file &&
                !dragging &&
                "border-emerald-400 bg-emerald-50 hover:border-emerald-500",
            )}
          >
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "w-16 h-16 rounded-full flex items-center justify-center mb-2 transition-transform duration-300 group-hover:scale-110 shadow-sm",
                  file
                    ? "bg-emerald-100 text-emerald-600"
                    : "bg-white text-slate-400 group-hover:text-primary group-hover:bg-indigo-50 border border-slate-100",
                )}
              >
                {file ? (
                  <FileCheck className="w-8 h-8" />
                ) : (
                  <Upload className="w-8 h-8" />
                )}
              </div>

              <div>
                <p
                  className={cn(
                    "text-lg font-semibold tracking-tight",
                    file ? "text-emerald-700" : "text-slate-700",
                  )}
                >
                  {file ? file.name : "Click or drag to upload"}
                </p>
                <p className="text-sm mt-1.5 font-medium text-slate-500">
                  {file
                    ? `${(file.size / 1024).toFixed(0)} KB · ${file.type.split("/")[1].toUpperCase()}`
                    : "PDF, JPG, or PNG (max. 5MB)"}
                </p>
              </div>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              id="upload-file-input"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFile(f);
              }}
            />
          </div>

          {file && (
            <div className="flex justify-center -mt-2">
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-full px-4"
                id="upload-remove"
                onClick={() => setFile(null)}
              >
                <X className="w-4 h-4 mr-1.5" /> Remove file
              </Button>
            </div>
          )}

          <div className="flex gap-4 pt-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-14 px-6 rounded-xl border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
              id="upload-back"
              onClick={() => router.push("/apply")}
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back
            </Button>
            <Button
              type="submit"
              size="lg"
              id="upload-submit"
              className="flex-1 h-14 rounded-xl shadow-md shadow-primary/20 hover:shadow-lg hover:shadow-primary/25 transition-all text-base disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading || !file}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <span className="spinner-sm" />
                  Uploading…
                </span>
              ) : (
                <>
                  <Upload className="w-5 h-5 mr-2" />
                  Upload & Continue
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
