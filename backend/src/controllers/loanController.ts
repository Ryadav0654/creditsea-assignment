import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { User } from '../model/User.js'
import { Loan } from '../model/Loan.js'

function runBRE(data: {
  dob: Date
  monthlySalary: number
  pan: string
  employmentMode: string
}): string[] {
  const errors: string[] = []

  const ageMs = Date.now() - data.dob.getTime()
  const age = Math.floor(ageMs / (365.25 * 24 * 3600 * 1000))
  if (age < 23 || age > 50) {
    errors.push(`Age must be between 23 and 50 years (your age: ${age})`)
  }

  if (data.monthlySalary < 25000) {
    errors.push('Monthly salary must be at least ₹25,000')
  }

  const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/
  if (!panRegex.test(data.pan.toUpperCase())) {
    errors.push('PAN must be in valid format (e.g. ABCDE1234F)')
  }

  if (data.employmentMode === 'unemployed') {
    errors.push('Unemployed applicants are not eligible for a loan')
  }

  return errors
}

export async function submitBRE(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { pan, dob, monthlySalary, employmentMode } = req.body

    const dobDate = new Date(dob)

    const errors = runBRE({
      dob: dobDate,
      monthlySalary,
      pan,
      employmentMode,
    })

    if (errors.length > 0) {
      res.status(422).json({ message: 'BRE check failed', errors })
      return
    }

    await User.findByIdAndUpdate(req.user!.id, {
      pan: pan.toUpperCase(),
      dob: dobDate,
      monthlySalary,
      employmentMode,
      breCompleted: true,
    })

    res.json({ message: 'BRE passed. Proceed to document upload.' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) })
  }
}

export async function uploadDocument(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    if (!req.file) {
      res.status(400).json({ message: 'No file uploaded' })
      return
    }
    const user = await User.findById(req.user!.id)
    if (!user?.breCompleted) {
      res.status(400).json({ message: 'Complete BRE step first' })
      return
    }
    await User.findByIdAndUpdate(req.user!.id, {
      salarySlipPath: req.file.path,
      salarySlipMime: req.file.mimetype,
      uploadCompleted: true,
    })
    res.json({ message: 'Salary slip uploaded successfully' })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) })
  }
}

export async function applyLoan(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { amount, tenure } = req.body

    const user = await User.findById(req.user!.id)
    if (!user) {
      res.status(404).json({ message: 'User not found' })
      return
    }
    if (!user.breCompleted || !user.uploadCompleted) {
      res.status(400).json({
        message: 'Complete personal details and document upload first',
      })
      return
    }

    const existing = await Loan.findOne({
      borrower: user._id,
      status: { $in: ['pending', 'sanctioned', 'active'] },
    })
    if (existing) {
      res.status(409).json({
        message: 'You already have an active loan application',
      })
      return
    }

    // SI = (P × R × T) / (365 × 100)
    const interestRate = 12
    const simpleInterest = (amount * interestRate * tenure) / (365 * 100)
    const totalRepayment = amount + simpleInterest

    const loan = await Loan.create({
      borrower: user._id,
      status: 'pending',
      pan: user.pan!,
      dob: user.dob!,
      monthlySalary: user.monthlySalary!,
      employmentMode: user.employmentMode!,
      salarySlipPath: user.salarySlipPath!,
      salarySlipMime: user.salarySlipMime!,
      amount,
      tenure,
      interestRate,
      simpleInterest: Math.round(simpleInterest * 100) / 100,
      totalRepayment: Math.round(totalRepayment * 100) / 100,
      totalPaid: 0,
    })

    res.status(201).json({
      message: 'Loan application submitted successfully',
      loan,
    })
  } catch (err) {
    res.status(500).json({ message: 'Server error', error: String(err) })
  }
}

export async function getMyLoans(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const loans = await Loan.find({ borrower: req.user!.id }).sort({
      createdAt: -1,
    })
    res.json(loans)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}
