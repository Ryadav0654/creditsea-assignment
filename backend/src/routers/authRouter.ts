import { Router } from 'express'
import { register, login, getMe } from '../controllers/authController.js'
import { authenticate } from '../middleware/auth.js'
import { validateBody } from '../middleware/validate.js'
import { registerSchema, loginSchema } from '../validators/schemas.js'

const router: Router = Router()

router.post('/register', validateBody(registerSchema), register)
router.post('/login', validateBody(loginSchema), login)
router.get('/me', authenticate, getMe)

export default router
