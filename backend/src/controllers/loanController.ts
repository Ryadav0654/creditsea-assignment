import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../model/User.js";
import { Loan } from "../model/Loan.js";

function runBRE(data: {
  dob: Date;
  monthlySalary: number;
  pan: string;
  employmentMode: string;
}): string[] {
  const errors: string[] = [];

  // Age: 23–50
  const ageMs = Date.now() - data.dob.getTime();
  const age = Math.floor(ageMs / (365.25 * 24 * 3600 * 1000));
  if (age < 23 || age > 50) {
    errors.push(`Age must be between 23 and 50 years (your age: ${age})`);
  }

  // Salary: ≥ 25,000
  if (data.monthlySalary < 25000) {
    errors.push("Monthly salary must be at least ₹25,000");
  }

  // PAN: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F)
  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
  if (!panRegex.test(data.pan.toUpperCase())) {
    errors.push("PAN must be in valid format (e.g. ABCDE1234F)");
  }

  // Employment: not unemployed
  if (data.employmentMode === "unemployed") {
    errors.push("Unemployed applicants are not eligible for a loan");
  }

  return errors;
}

export async function submitBRE(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { pan, dob, monthlySalary, employmentMode } = req.body as {
      pan: string;
      dob: string;
      monthlySalary: string | number;
      employmentMode: string;
    };

    if (!pan || !dob || !monthlySalary || !employmentMode) {
      res.status(400).json({ message: "All fields are required" });
      return;
    }

    const dobDate = new Date(dob);
    if (isNaN(dobDate.getTime())) {
      res.status(400).json({ message: "Invalid date of birth" });
      return;
    }

    const errors = runBRE({
      dob: dobDate,
      monthlySalary: Number(monthlySalary),
      pan,
      employmentMode,
    });

    if (errors.length > 0) {
      res.status(422).json({ message: "BRE check failed", errors });
      return;
    }

    await User.findByIdAndUpdate(req.user!.id, {
      pan: pan.toUpperCase(),
      dob: dobDate,
      monthlySalary: Number(monthlySalary),
      employmentMode,
      breCompleted: true,
    });

    res.json({ message: "BRE passed. Proceed to document upload." });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
}

export async function uploadDocument(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: "No file uploaded" });
      return;
    }
    const user = await User.findById(req.user!.id);
    if (!user?.breCompleted) {
      res.status(400).json({ message: "Complete BRE step first" });
      return;
    }
    await User.findByIdAndUpdate(req.user!.id, {
      salarySlipPath: req.file.path,
      salarySlipMime: req.file.mimetype,
      uploadCompleted: true,
    });
    res.json({ message: "Salary slip uploaded successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
}

export async function applyLoan(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { amount, tenure } = req.body as {
      amount: string | number;
      tenure: string | number;
    };
    if (!amount || !tenure) {
      res.status(400).json({ message: "Amount and tenure are required" });
      return;
    }

    const amt = Number(amount);
    const ten = Number(tenure);

    if (amt < 50000 || amt > 500000) {
      res
        .status(400)
        .json({ message: "Loan amount must be between ₹50,000 and ₹5,00,000" });
      return;
    }
    if (ten < 30 || ten > 365) {
      res
        .status(400)
        .json({ message: "Tenure must be between 30 and 365 days" });
      return;
    }

    const user = await User.findById(req.user!.id);
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    if (!user.breCompleted || !user.uploadCompleted) {
      res.status(400).json({
        message: "Complete personal details and document upload first",
      });
      return;
    }

    const existing = await Loan.findOne({
      borrower: user._id,
      status: { $in: ["pending", "sanctioned", "active"] },
    });
    if (existing) {
      res
        .status(409)
        .json({ message: "You already have an active loan application" });
      return;
    }

    // SI = (P × R × T) / (365 × 100)
    const interestRate = 12;
    const simpleInterest = (amt * interestRate * ten) / (365 * 100);
    const totalRepayment = amt + simpleInterest;

    const loan = await Loan.create({
      borrower: user._id,
      status: "pending",
      pan: user.pan!,
      dob: user.dob!,
      monthlySalary: user.monthlySalary!,
      employmentMode: user.employmentMode!,
      salarySlipPath: user.salarySlipPath!,
      salarySlipMime: user.salarySlipMime!,
      amount: amt,
      tenure: ten,
      interestRate,
      simpleInterest: Math.round(simpleInterest * 100) / 100,
      totalRepayment: Math.round(totalRepayment * 100) / 100,
      totalPaid: 0,
    });

    res
      .status(201)
      .json({ message: "Loan application submitted successfully", loan });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
}

export async function getMyLoans(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const loans = await Loan.find({ borrower: req.user!.id }).sort({
      createdAt: -1,
    });
    res.json(loans);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
