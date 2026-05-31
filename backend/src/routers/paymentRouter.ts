import { Router } from 'express'
import {
  recordPayment,
  getPaymentsByLoan,
} from '../controllers/paymentController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateBody, validateParams } from '../middleware/validate.js'
import {
  recordPaymentSchema,
  loanIdParamSchema,
} from '../validators/schemas.js'

const router = Router()

router.use(authenticate)
router.use(authorize('collection', 'admin'))

router.post('/', validateBody(recordPaymentSchema), recordPayment)
router.get(
  '/loan/:loanId',
  validateParams(loanIdParamSchema),
  getPaymentsByLoan
)

export default router
