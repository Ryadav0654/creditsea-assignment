import "dotenv/config";
import express from "express";
import type { Express, Request, Response } from "express";
import cors from "cors";
import path from "path";
import { connectDB } from "./config/db.js";
import authRouter from "./routers/authRouter.js";
import loanRouter from "./routers/loanRouter.js";
import adminLoanRouter from "./routers/adminLoanRouter.js";
import paymentRouter from "./routers/paymentRouter.js";
import adminUserRouter from "./routers/adminUserRouter.js";

const app: Express = express();
const PORT = process.env.PORT || 8080;

app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use("/api/auth", authRouter);
app.use("/api/loans", loanRouter);
app.use("/api/admin/loans", adminLoanRouter);
app.use("/api/admin/payments", paymentRouter);
app.use("/api/admin/users", adminUserRouter);

app.get("/", (_req: Request, res: Response) => {
  res
    .status(200)
    .json({ message: "CreditSea LMS API", version: "1.0.0", status: "ok" });
});

connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("Failed to connect to MongoDB:", err);
    process.exit(1);
  });
