import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import {
    getDashboard,
    trackEvent,
    getSystemStats
} from '../controllers/analyticsController'

const router = Router()

// Analytics routes
router.get('/dashboard', verifyToken, getDashboard)
router.post('/track', trackEvent)
router.get('/stats', verifyToken, getSystemStats)

export default router