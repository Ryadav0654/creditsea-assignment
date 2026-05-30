import { Router } from "express";
import {
  getAllLoans,
  getLoanById,
  sanctionLoan,
  disburseLoan,
} from "../controllers/adminLoanController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

const OPS_ROLES = [
  "admin",
  "sales",
  "sanction",
  "disbursement",
  "collection",
] as const;

// List + detail: all ops roles
router.get("/", authorize(...OPS_ROLES), getAllLoans);
router.get("/:id", authorize(...OPS_ROLES), getLoanById);

// Sanction: sanction role + admin
router.patch("/:id/sanction", authorize("sanction", "admin"), sanctionLoan);

// Disburse: disbursement role + admin
router.patch("/:id/disburse", authorize("disbursement", "admin"), disburseLoan);

export default router;
