import { Router } from "express";
import { submitBRE, uploadDocument, applyLoan, getMyLoans } from "../controllers/loanController.js";
import { authenticate, authorize } from "../middleware/auth.js";
import { uploadMiddleware } from "../middleware/upload.js";
import type { Request, Response, NextFunction } from "express";

const router = Router();

// All borrower loan routes require authentication + borrower role
router.use(authenticate);
router.use(authorize("borrower"));

router.post("/bre", submitBRE);

router.post("/upload", (req: Request, res: Response, next: NextFunction) => {
  uploadMiddleware(req, res, (err) => {
    if (err) {
      res.status(400).json({ message: err.message });
      return;
    }
    next();
  });
}, uploadDocument);

router.post("/apply", applyLoan);
router.get("/my", getMyLoans);

export default router;
