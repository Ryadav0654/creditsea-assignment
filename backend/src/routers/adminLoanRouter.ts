import { Router } from 'express'
import {
  getAllLoans,
  getLoanById,
  sanctionLoan,
  disburseLoan,
} from '../controllers/adminLoanController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateBody, validateParams } from '../middleware/validate.js'
import {
  sanctionLoanSchema,
  mongoIdParamSchema,
} from '../validators/schemas.js'

const router = Router()

router.use(authenticate)

const OPS_ROLES = [
  'admin',
  'sales',
  'sanction',
  'disbursement',
  'collection',
] as const

// List + detail: all ops roles
router.get('/', authorize(...OPS_ROLES), getAllLoans)
router.get(
  '/:id',
  authorize(...OPS_ROLES),
  validateParams(mongoIdParamSchema),
  getLoanById
)

// Sanction: sanction role + admin
router.patch(
  '/:id/sanction',
  authorize('sanction', 'admin'),
  validateParams(mongoIdParamSchema),
  validateBody(sanctionLoanSchema),
  sanctionLoan
)

// Disburse: disbursement role + admin
router.patch(
  '/:id/disburse',
  authorize('disbursement', 'admin'),
  validateParams(mongoIdParamSchema),
  disburseLoan
)

export default router
