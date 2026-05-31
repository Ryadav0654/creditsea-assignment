import type { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import type { Role } from '../model/User.js'

export interface AuthRequest extends Request {
  user?: { id: string; role: Role; email: string }
}

const JWT_SECRET =
  process.env.JWT_SECRET || 'super_secret_dev_key_change_in_prod'

export function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): void {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    res.status(401).json({ message: 'No token provided' })
    return
  }
  const token = authHeader.split(' ')[1]!
  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      id: string
      role: Role
      email: string
    }
    req.user = payload
    next()
  } catch {
    res.status(401).json({ message: 'Invalid or expired token' })
  }
}

export function authorize(...roles: Role[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user || !roles.includes(req.user.role)) {
      res.status(403).json({
        message: 'Forbidden: insufficient permissions',
      })
      return
    }
    next()
  }
}
