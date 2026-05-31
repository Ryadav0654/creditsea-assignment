# CreditSea — Loan Management System

A full-stack **Loan Management System (LMS)** with a borrower portal and an internal operations dashboard, built as part of the CreditSea assignment.

## Demo Video

[Watch Demo](https://drive.google.com/file/d/1rS273fmgVVCCKifsi7FGjORjFq32-9LA/view?usp=sharing)

## Tech Stack

| Layer            | Technology                                           |
| ---------------- | ---------------------------------------------------- |
| Frontend         | Next.js 16 (App Router), TypeScript, Tailwind CSS v4 |
| Backend          | Node.js, Express 5, TypeScript, Bun runtime          |
| Database         | MongoDB 7 via Mongoose                               |
| Auth             | JWT (jsonwebtoken) + bcrypt                          |
| File Uploads     | Multer (local `uploads/` folder)                     |
| Containerisation | Docker + Docker Compose                              |

---

## Project Structure

```
creditsea-assignment/
├── docker-compose.yml          # MongoDB + Backend + Frontend services
│
├── backend/
│   ├── .env.example            # ← copy to .env and fill in
│   ├── Dockerfile
│   ├── src/
│   │   ├── index.ts            # Express entry point
│   │   ├── seed.ts             # Seed script (6 role users)
│   │   ├── config/db.ts        # Mongoose connect
│   │   ├── middleware/
│   │   │   ├── auth.ts         # authenticate + authorize(roles)
│   │   │   └── upload.ts       # Multer PDF/JPG/PNG ≤5 MB
│   │   ├── model/
│   │   │   ├── User.ts         # Users (all roles) + BRE fields
│   │   │   ├── Loan.ts         # Loan state machine
│   │   │   └── Payment.ts      # UTR-indexed payments
│   │   ├── controllers/        # Business logic (5 controllers)
│   │   └── routers/            # Express routers (5 routers)
│   └── uploads/                # Runtime — gitignored
│
└── frontend/
    ├── .env.example            # ← copy to .env.local and fill in
    ├── Dockerfile
    ├── lib/
    │   ├── api.ts              # Axios instance + JWT interceptor
    │   ├── auth.ts             # localStorage helpers + formatters
    │   └── types.ts            # Shared TypeScript interfaces
    └── app/
        ├── (auth)/             # Login + Register pages
        ├── apply/              # 3-step borrower application
        │   ├── page.tsx        # Step 1: Personal details + BRE
        │   ├── upload/         # Step 2: Salary slip upload
        │   └── configure/      # Step 3: Loan sliders + apply
        ├── borrower/dashboard/ # Borrower loan status view
        └── dashboard/          # Ops panel (role-gated)
            ├── sales/          # Pre-applicant tracking
            ├── sanction/       # Approve / Reject loans
            ├── disbursement/   # Release funds
            └── collection/     # Record payments + auto-close
```

---

## Loan Status State Machine

```
[pending] ──── approve ──→ [sanctioned] ──── disburse ──→ [active] ──── fully repaid ──→ [closed]
    └───────── reject ───→ [rejected]
```

| Transition           | Triggered by                               | Role                     |
| -------------------- | ------------------------------------------ | ------------------------ |
| pending → sanctioned | Sanction officer                           | `sanction` / `admin`     |
| pending → rejected   | Sanction officer (reason required)         | `sanction` / `admin`     |
| sanctioned → active  | Disbursement officer                       | `disbursement` / `admin` |
| active → closed      | **Auto** when `totalPaid ≥ totalRepayment` | `collection` / `admin`   |

---

## RBAC — Role Permissions

| Module              | borrower | sales | sanction | disbursement | collection | admin |
| ------------------- | :------: | :---: | :------: | :----------: | :--------: | :---: |
| Borrower portal     |    ✅    |   —   |    —     |      —       |     —      |   —   |
| Sales module        |    —     |  ✅   |    —     |      —       |     —      |  ✅   |
| Sanction module     |    —     |   —   |    ✅    |      —       |     —      |  ✅   |
| Disbursement module |    —     |   —   |    —     |      ✅      |     —      |  ✅   |
| Collection module   |    —     |   —   |    —     |      —       |     ✅     |  ✅   |

---

## REST API Reference

### Auth — `/api/auth`

| Method | Route       | Auth | Description                |
| ------ | ----------- | ---- | -------------------------- |
| `POST` | `/register` | None | Borrower self-registration |
| `POST` | `/login`    | None | Returns JWT                |
| `GET`  | `/me`       | JWT  | Current user profile       |

### Borrower Loans — `/api/loans`

| Method | Route     | Auth     | Description                                          |
| ------ | --------- | -------- | ---------------------------------------------------- |
| `POST` | `/bre`    | borrower | Submit personal details; BRE runs server-side        |
| `POST` | `/upload` | borrower | Upload salary slip (multipart, field: `salary_slip`) |
| `POST` | `/apply`  | borrower | Final apply with `amount` + `tenure`                 |
| `GET`  | `/my`     | borrower | Get own loans                                        |

### Operations Loans — `/api/admin/loans`

| Method  | Route           | Roles               | Description                                               |
| ------- | --------------- | ------------------- | --------------------------------------------------------- |
| `GET`   | `/`             | all-ops             | List loans; `?status=pending\|sanctioned\|active\|closed` |
| `GET`   | `/:id`          | all-ops             | Loan detail                                               |
| `PATCH` | `/:id/sanction` | sanction, admin     | Body: `{ decision, rejectionReason }`                     |
| `PATCH` | `/:id/disburse` | disbursement, admin | Mark loan active                                          |

### Payments — `/api/admin/payments`

| Method | Route           | Roles             | Description                                        |
| ------ | --------------- | ----------------- | -------------------------------------------------- |
| `POST` | `/`             | collection, admin | Body: `{ loanId, utrNumber, amount, paymentDate }` |
| `GET`  | `/loan/:loanId` | collection, admin | All payments for a loan                            |

### Admin Users — `/api/admin/users`

| Method  | Route       | Roles        | Description                                 |
| ------- | ----------- | ------------ | ------------------------------------------- |
| `GET`   | `/`         | admin, sales | List borrowers; `?noLoan=true` = Sales view |
| `PATCH` | `/:id/role` | admin        | Change user role                            |

---

## Business Rule Engine (BRE)

The server-side BRE runs on `POST /api/loans/bre` and rejects applicants if **any** rule fails:

| Rule           | Condition                                                 |
| -------------- | --------------------------------------------------------- |
| Age            | Must be **23–50 years** old                               |
| Monthly Salary | Must be ≥ **₹25,000**                                     |
| PAN Format     | Must match `[A-Z]{5}[0-9]{4}[A-Z]{1}` (e.g. `ABCDE1234F`) |
| Employment     | Must **not** be Unemployed                                |

All failing rules are returned together in a single response.

---

## Interest Calculation

```
SI = (P × R × T) / (365 × 100)
Total Repayment = P + SI
```

- **P** — Principal (loan amount in ₹)
- **R** — 12% per annum (fixed)
- **T** — Tenure in days (30–365)

---

## Setup & Running

### Prerequisites

- [Docker](https://docs.docker.com/get-docker/) + Docker Compose
- [Bun](https://bun.sh/) ≥ 1.0 (for backend local dev)
- [Node.js](https://nodejs.org/) ≥ 20 (for frontend local dev)

---

### Option A — Fully Dockerised (Recommended)

```bash
# 1. Clone the repo
git clone <repo-url>
cd creditsea-assignment

# 2. Set up environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env.local

# 3. Build and start all services
docker compose up --build -d

# 4. Seed the database (first time only)
docker exec lms_backend bun run src/seed.ts

# 5. Open the app
#    Frontend → http://localhost:3000
#    Backend  → http://localhost:8080
```

---

### Option B — Local Dev (MongoDB via Docker)

```bash
# 1. Clone and install
git clone <repo-url>
cd creditsea-assignment

# 2. Start MongoDB only
docker compose up mongo -d

# 3. Backend setup
cd backend
cp .env.example .env          # edit JWT_SECRET if desired
bun install
bun run seed                   # seed 6 role users
bun run dev                    # starts on http://localhost:8080

# 4. Frontend setup (new terminal)
cd frontend
cp .env.example .env.local
npm install
npm run dev                    # starts on http://localhost:3000
```

---

## Seed Accounts

Run `bun run seed` (backend) to create these accounts:

| Role         | Email              | Password     |
| ------------ | ------------------ | ------------ |
| Admin        | admin@lms.com      | Admin@123    |
| Sales        | sales@lms.com      | Sales@123    |
| Sanction     | sanction@lms.com   | Sanction@123 |
| Disbursement | disburse@lms.com   | Disburse@123 |
| Collection   | collection@lms.com | Collect@123  |
| Borrower     | borrower@lms.com   | Borrower@123 |

The seed is **idempotent** — safe to run multiple times; existing accounts are skipped.
