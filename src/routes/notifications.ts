import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import * as notificationController from '../controllers/notificationController'

const router = Router()

// Get user notifications
router.get('/', verifyToken, notificationController.getNotifications)

// Mark notifications as read (batch)
router.post('/mark-read', verifyToken, notificationController.markAsRead)

// Mark single notification as read
router.put('/:id/read', verifyToken, notificationController.markOneAsRead)

// Mark all notifications as read
router.put('/read/all', verifyToken, notificationController.markAllAsRead)

// Get unread count
router.get('/unread-count', verifyToken, notificationController.getUnreadCount)

// Update device token
router.post('/device-token', verifyToken, notificationController.updateDeviceToken)

export default router
