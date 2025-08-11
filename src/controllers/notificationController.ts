import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import * as notificationService from '../services/notificationService'
import logger from '../utils/logger'

export const getNotifications = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const notifications = await notificationService.getUserNotifications(req.user.userId)

        res.json({
            success: true,
            data: notifications
        })
    } catch (error) {
        logger.error('Failed to get notifications:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get notifications'
        })
    }
}

export const markNotificationsAsRead = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { notificationIds } = req.body

        await notificationService.markNotificationsAsRead(req.user.userId, notificationIds)

        res.json({
            success: true,
            message: 'Notifications marked as read'
        })
    } catch (error) {
        logger.error('Failed to mark notifications as read:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update notifications'
        })
    }
}

export const updateDeviceToken = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { deviceToken, platform } = req.body

        await notificationService.updateDeviceToken(req.user.userId, deviceToken, platform)

        res.json({
            success: true,
            message: 'Device token updated successfully'
        })
    } catch (error) {
        logger.error('Failed to update device token:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update device token'
        })
    }
}
