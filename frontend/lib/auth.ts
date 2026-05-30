import type { User, AuthState } from "./types";

export function saveAuth(auth: AuthState): void {
  localStorage.setItem("lms_token", auth.token);
  localStorage.setItem("lms_user", JSON.stringify(auth.user));
}

export function clearAuth(): void {
  localStorage.removeItem("lms_token");
  localStorage.removeItem("lms_user");
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("lms_token");
}

export function getUser(): User | null {
  if (typeof window === "undefined") return null;
  const raw = localStorage.getItem("lms_user");
  if (!raw) return null;
  try { 
    return JSON.parse(raw) as User; 
  } catch { 
    return null; 
  }
}

export function isAuthenticated(): boolean {
  return !!getToken();
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
