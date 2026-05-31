import { Router } from 'express'
import {
  getAllUsers,
  changeUserRole,
} from '../controllers/adminUserController.js'
import { authenticate, authorize } from '../middleware/auth.js'
import { validateBody, validateParams } from '../middleware/validate.js'
import { changeRoleSchema, mongoIdParamSchema } from '../validators/schemas.js'

const router = Router()

router.use(authenticate)

// List borrowers (noLoan=true → Sales view)
router.get('/', authorize('admin', 'sales'), getAllUsers)

// Change role: admin only
router.patch(
  '/:id/role',
  authorize('admin'),
  validateParams(mongoIdParamSchema),
  validateBody(changeRoleSchema),
  changeUserRole
)

export default router
