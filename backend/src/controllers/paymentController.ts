import type { Response } from 'express'
import type { AuthRequest } from '../middleware/auth.js'
import { Payment } from '../model/Payment.js'
import { Loan } from '../model/Loan.js'
import mongoose from 'mongoose'

export async function recordPayment(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const { loanId, utrNumber, amount, paymentDate } = req.body as {
      loanId: string
      utrNumber: string
      amount: number
      paymentDate: string
    }

    const loan = await Loan.findById(loanId)
    if (!loan) {
      res.status(404).json({ message: 'Loan not found' })
      return
    }
    if (loan.status !== 'active') {
      res.status(400).json({
        message: `Cannot record payment for loan with status: ${loan.status}`,
      })
      return
    }

    const parsedDate = new Date(paymentDate)

    // Check UTR uniqueness
    const duplicate = await Payment.findOne({
      utrNumber: utrNumber.toUpperCase(),
    })
    if (duplicate) {
      res.status(409).json({ message: 'UTR number already used' })
      return
    }

    const payment = await Payment.create({
      loan: new mongoose.Types.ObjectId(loanId),
      collectedBy: new mongoose.Types.ObjectId(req.user!.id),
      utrNumber: utrNumber.toUpperCase(),
      amount,
      paymentDate: parsedDate,
    })

    // Update loan totalPaid and auto-close if fully repaid
    loan.totalPaid = Math.round((loan.totalPaid + amount) * 100) / 100
    if (loan.totalPaid >= loan.totalRepayment) {
      loan.status = 'closed'
      loan.closedAt = new Date()
    }
    await loan.save()

    res.status(201).json({
      message:
        loan.status === 'closed'
          ? 'Payment recorded. Loan auto-closed!'
          : 'Payment recorded',
      payment,
      loanStatus: loan.status,
      totalPaid: loan.totalPaid,
      totalRepayment: loan.totalRepayment,
    })
  } catch (err) {
    const errStr = String(err)
    if (errStr.includes('duplicate key') || errStr.includes('E11000')) {
      res.status(409).json({ message: 'UTR number already used' })
    } else {
      res.status(500).json({ message: 'Server error', error: errStr })
    }
  }
}

export async function getPaymentsByLoan(
  req: AuthRequest,
  res: Response
): Promise<void> {
  try {
    const payments = await Payment.find({ loan: req.params['loanId'] })
      .populate('collectedBy', 'name email')
      .sort({ paymentDate: -1 })
    res.json(payments)
  } catch {
    res.status(500).json({ message: 'Server error' })
  }
}
