import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import { listAuditLogs } from '../controllers/auditController'

const router = Router()

// Protected route (can be restricted to admins later)
router.get('/', verifyToken, listAuditLogs)

export default router
