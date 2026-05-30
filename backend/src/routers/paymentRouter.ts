import { Router } from "express";
import { recordPayment, getPaymentsByLoan } from "../controllers/paymentController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);
router.use(authorize("collection", "admin"));

router.post("/", recordPayment);
router.get("/loan/:loanId", getPaymentsByLoan);

export default router;
