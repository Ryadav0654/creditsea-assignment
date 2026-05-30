import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { Loan } from "../model/Loan.js";
import mongoose from "mongoose";

export async function getAllLoans(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { status } = req.query as { status?: string };
    const filter: Record<string, unknown> = {};
    if (status) filter["status"] = status;

    const loans = await Loan.find(filter)
      .populate("borrower", "name email")
      .populate("sanctionedBy", "name email")
      .populate("disbursedBy", "name email")
      .sort({ createdAt: -1 });
    res.json(loans);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function getLoanById(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const loan = await Loan.findById(req.params["id"])
      .populate("borrower", "name email")
      .populate("sanctionedBy", "name email")
      .populate("disbursedBy", "name email");
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    res.json(loan);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

export async function sanctionLoan(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { decision, rejectionReason } = req.body as {
      decision: "approve" | "reject";
      rejectionReason?: string;
    };

    const loan = await Loan.findById(req.params["id"]);
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.status !== "pending") {
      res
        .status(400)
        .json({
          message: `Cannot sanction a loan with status: ${loan.status}`,
        });
      return;
    }

    const actorId = new mongoose.Types.ObjectId(req.user!.id);

    if (decision === "approve") {
      loan.status = "sanctioned";
      loan.sanctionedBy = actorId;
      loan.sanctionedAt = new Date();
    } else if (decision === "reject") {
      if (!rejectionReason?.trim()) {
        res.status(400).json({ message: "Rejection reason is required" });
        return;
      }
      loan.status = "rejected";
      loan.rejectionReason = rejectionReason.trim();
      loan.sanctionedBy = actorId;
      loan.sanctionedAt = new Date();
    } else {
      res
        .status(400)
        .json({ message: "decision must be 'approve' or 'reject'" });
      return;
    }

    await loan.save();
    res.json({
      message: decision === "approve" ? "Loan sanctioned" : "Loan rejected",
      loan,
    });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
}

export async function disburseLoan(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const loan = await Loan.findById(req.params["id"]);
    if (!loan) {
      res.status(404).json({ message: "Loan not found" });
      return;
    }
    if (loan.status !== "sanctioned") {
      res
        .status(400)
        .json({
          message: `Cannot disburse a loan with status: ${loan.status}`,
        });
      return;
    }

    loan.status = "active";
    loan.disbursedBy = new mongoose.Types.ObjectId(req.user!.id);
    loan.disbursedAt = new Date();
    await loan.save();

    res.json({ message: "Loan disbursed and marked as active", loan });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: String(err) });
  }
}
