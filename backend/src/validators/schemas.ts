import { z } from 'zod'

// Auth Schemas
export const registerSchema = z.object({
  name: z
    .string({ error: 'Name is required' })
    .trim()
    .min(1, { error: 'Name cannot be empty' })
    .max(100, { error: 'Name must be at most 100 characters' }),
  email: z
    .email({ error: 'Invalid email format' })
    .trim()
    .max(255, { error: 'Email must be at most 255 characters' }),
  password: z
    .string({ error: 'Password is required' })
    .min(6, { error: 'Password must be at least 6 characters' })
    .max(128, { error: 'Password must be at most 128 characters' }),
})

export const loginSchema = z.object({
  email: z.email({ error: 'Invalid email format' }).trim(),
  password: z
    .string({ error: 'Password is required' })
    .min(1, { error: 'Password cannot be empty' }),
})

// Loan / BRE Schemas
export const breSchema = z.object({
  pan: z
    .string({ error: 'PAN is required' })
    .trim()
    .regex(/^[A-Za-z]{5}[0-9]{4}[A-Za-z]{1}$/, {
      error: 'PAN must be in valid format (e.g. ABCDE1234F)',
    }),
  dob: z
    .string({ error: 'Date of birth is required' })
    .refine((val) => !isNaN(new Date(val).getTime()), {
      error: 'Invalid date of birth',
    }),
  monthlySalary: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ error: 'Monthly salary must be a valid number' })
        .min(1, { error: 'Monthly salary must be a positive number' })
    ),
  employmentMode: z.enum(['salaried', 'self-employed', 'unemployed'], {
    error:
      'Employment mode must be one of: salaried, self-employed, unemployed',
  }),
})

export const applyLoanSchema = z.object({
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ error: 'Loan amount must be a valid number' })
        .min(50000, { error: 'Loan amount must be at least ₹50,000' })
        .max(500000, { error: 'Loan amount must be at most ₹5,00,000' })
    ),
  tenure: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(
      z
        .int({ error: 'Tenure must be a whole number' })
        .min(30, { error: 'Tenure must be at least 30 days' })
        .max(365, { error: 'Tenure must be at most 365 days' })
    ),
})

// Admin Schemas

export const sanctionLoanSchema = z
  .object({
    decision: z.enum(['approve', 'reject'], {
      error: "Decision must be 'approve' or 'reject'",
    }),
    rejectionReason: z.string().trim().optional(),
  })
  .refine(
    (data) => {
      if (data.decision === 'reject') {
        return !!data.rejectionReason && data.rejectionReason.length > 0
      }
      return true
    },
    {
      error: 'Rejection reason is required when rejecting a loan',
      path: ['rejectionReason'],
    }
  )

export const changeRoleSchema = z.object({
  role: z.enum(
    ['admin', 'sales', 'sanction', 'disbursement', 'collection', 'borrower'],
    {
      error:
        'Role must be one of: admin, sales, sanction, disbursement, collection, borrower',
    }
  ),
})

// Payment Schemas

export const recordPaymentSchema = z.object({
  loanId: z
    .string({ error: 'Loan ID is required' })
    .trim()
    .min(1, { error: 'Loan ID cannot be empty' }),
  utrNumber: z
    .string({ error: 'UTR number is required' })
    .trim()
    .min(1, { error: 'UTR number cannot be empty' }),
  amount: z
    .union([z.string(), z.number()])
    .transform((val) => Number(val))
    .pipe(
      z
        .number({ error: 'Amount must be a valid number' })
        .positive({ error: 'Amount must be a positive number' })
    ),
  paymentDate: z
    .string({ error: 'Payment date is required' })
    .refine((val) => !isNaN(new Date(val).getTime()), {
      error: 'Invalid payment date',
    }),
})

// Params Schemas
export const mongoIdParamSchema = z.object({
  id: z.string().regex(/^[0-9a-fA-F]{24}$/, { error: 'Invalid ID format' }),
})

export const loanIdParamSchema = z.object({
  loanId: z
    .string()
    .regex(/^[0-9a-fA-F]{24}$/, { error: 'Invalid loan ID format' }),
})
