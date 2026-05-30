import mongoose, { type Document, Schema } from "mongoose";

export type Role =
  | "admin"
  | "sales"
  | "sanction"
  | "disbursement"
  | "collection"
  | "borrower";

export type EmploymentMode = "salaried" | "self-employed" | "unemployed";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: Role;
  // BRE / personal fields (borrowers)
  pan?: string;
  dob?: Date;
  monthlySalary?: number;
  employmentMode?: EmploymentMode;
  // Document
  salarySlipPath?: string;
  salarySlipMime?: string;
  // Stage flags
  breCompleted: boolean;
  uploadCompleted: boolean;
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: [
        "admin",
        "sales",
        "sanction",
        "disbursement",
        "collection",
        "borrower",
      ],
      default: "borrower",
    },
    pan: { type: String, uppercase: true },
    dob: { type: Date },
    monthlySalary: { type: Number },
    employmentMode: {
      type: String,
      enum: ["salaried", "self-employed", "unemployed"],
    },
    salarySlipPath: { type: String },
    salarySlipMime: { type: String },
    breCompleted: { type: Boolean, default: false },
    uploadCompleted: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export const User = mongoose.model<IUser>("User", userSchema);
