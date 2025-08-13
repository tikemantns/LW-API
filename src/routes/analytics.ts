import { Router } from 'express'
import { verifyToken, optionalAuth } from '../middleware/auth'
import {
    getDashboard,
    trackEvent,
    getSystemStats
} from '../controllers/analyticsController'

const router = Router()

// Analytics routes
router.get('/dashboard', optionalAuth, getDashboard)
router.post('/track', trackEvent)
router.get('/stats', verifyToken, getSystemStats)

export default router