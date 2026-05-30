import { Router } from "express";
import {
  getAllUsers,
  changeUserRole,
} from "../controllers/adminUserController.js";
import { authenticate, authorize } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// List borrowers (noLoan=true → Sales view)
router.get("/", authorize("admin", "sales"), getAllUsers);
// Change role: admin only
router.patch("/:id/role", authorize("admin"), changeUserRole);

export default router;
