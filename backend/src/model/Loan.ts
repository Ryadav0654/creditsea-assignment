import mongoose, { type Document, Schema } from 'mongoose'

export type LoanStatus =
  | 'pending'
  | 'sanctioned'
  | 'rejected'
  | 'active'
  | 'closed'

export interface ILoan extends Document {
  borrower: mongoose.Types.ObjectId
  status: LoanStatus
  // BRE audit data
  pan: string
  dob: Date
  monthlySalary: number
  employmentMode: string
  // Document
  salarySlipPath: string
  salarySlipMime: string
  // Loan config
  amount: number
  tenure: number // days
  interestRate: number // 12% p.a.
  simpleInterest: number
  totalRepayment: number
  // Sanction
  sanctionedBy?: mongoose.Types.ObjectId
  sanctionedAt?: Date
  rejectionReason?: string
  // Disbursement
  disbursedBy?: mongoose.Types.ObjectId
  disbursedAt?: Date
  // Repayment tracking
  totalPaid: number
  closedAt?: Date
}

const loanSchema = new Schema<ILoan>(
  {
    borrower: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: ['pending', 'sanctioned', 'rejected', 'active', 'closed'],
      default: 'pending',
    },
    pan: { type: String, required: true },
    dob: { type: Date, required: true },
    monthlySalary: { type: Number, required: true },
    employmentMode: { type: String, required: true },
    salarySlipPath: { type: String, required: true },
    salarySlipMime: { type: String, required: true },
    amount: { type: Number, required: true },
    tenure: { type: Number, required: true },
    interestRate: { type: Number, default: 12 },
    simpleInterest: { type: Number, required: true },
    totalRepayment: { type: Number, required: true },
    sanctionedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    sanctionedAt: { type: Date },
    rejectionReason: { type: String },
    disbursedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    disbursedAt: { type: Date },
    totalPaid: { type: Number, default: 0 },
    closedAt: { type: Date },
  },
  { timestamps: true }
)

export const Loan = mongoose.model<ILoan>('Loan', loanSchema)
