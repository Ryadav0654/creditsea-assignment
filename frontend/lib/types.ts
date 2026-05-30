export interface User {
  id: string;
  name: string;
  email: string;
  role: "admin" | "sales" | "sanction" | "disbursement" | "collection" | "borrower";
  breCompleted?: boolean;
  uploadCompleted?: boolean;
  pan?: string;
  dob?: string;
  monthlySalary?: number;
  employmentMode?: string;
}

export interface Loan {
  _id: string;
  borrower: { _id: string; name: string; email: string } | string;
  status: "pending" | "sanctioned" | "rejected" | "active" | "closed";
  pan: string;
  dob: string;
  monthlySalary: number;
  employmentMode: string;
  salarySlipPath: string;
  amount: number;
  tenure: number;
  interestRate: number;
  simpleInterest: number;
  totalRepayment: number;
  totalPaid: number;
  sanctionedBy?: { name: string; email: string } | string;
  sanctionedAt?: string;
  rejectionReason?: string;
  disbursedBy?: { name: string; email: string } | string;
  disbursedAt?: string;
  closedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Payment {
  _id: string;
  loan: string;
  collectedBy: { name: string; email: string } | string;
  utrNumber: string;
  amount: number;
  paymentDate: string;
  createdAt: string;
}

export interface AuthState {
  token: string;
  user: User;
}
