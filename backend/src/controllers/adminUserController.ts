import type { Response } from "express";
import type { AuthRequest } from "../middleware/auth.js";
import { User } from "../model/User.js";
import { Loan } from "../model/Loan.js";

// GET /api/admin/users — list all users; ?noLoan=true filters to users with no loan (Sales view)
export async function getAllUsers(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { noLoan } = req.query as { noLoan?: string };
    const users = await User.find({ role: "borrower" })
      .select("-password")
      .sort({ createdAt: -1 });

    if (noLoan === "true") {
      // Find borrowers who have no loans at all
      const usersWithLoan = await Loan.distinct("borrower");
      const filtered = users.filter(
        (u) => !usersWithLoan.some((id) => id.toString() === u._id.toString()),
      );
      res.json(filtered);
      return;
    }

    res.json(users);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}

// PATCH /api/admin/users/:id/role — change a user's role (admin only)
export async function changeUserRole(
  req: AuthRequest,
  res: Response,
): Promise<void> {
  try {
    const { role } = req.body as { role: string };
    const validRoles = [
      "admin",
      "sales",
      "sanction",
      "disbursement",
      "collection",
      "borrower",
    ];
    if (!role || !validRoles.includes(role)) {
      res.status(400).json({ message: "Invalid role" });
      return;
    }
    const user = await User.findByIdAndUpdate(
      req.params["id"],
      { role },
      { new: true },
    ).select("-password");
    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }
    res.json({ message: "Role updated", user });
  } catch {
    res.status(500).json({ message: "Server error" });
  }
}
