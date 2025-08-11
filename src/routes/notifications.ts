import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import { getNotifications, markNotificationsAsRead, updateDeviceToken } from '../controllers/notificationController'

const router = Router()

// Get user notifications
router.get('/', verifyToken, getNotifications)

// Mark notifications as read
router.post('/mark-read', verifyToken, markNotificationsAsRead)

// Update device token for push notifications
router.post('/device-token', verifyToken, updateDeviceToken)

export default router
