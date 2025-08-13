import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import { ApiResponse } from '../types'
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

        const response: ApiResponse = {
            success: true,
            data: notifications
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get notifications:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get notifications'
        })
    }
}

export const markAsRead = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { notificationIds } = req.body

        if (!notificationIds || !Array.isArray(notificationIds)) {
            return res.status(400).json({
                success: false,
                error: 'Notification IDs are required'
            })
        }

        await notificationService.markNotificationsAsRead(req.user.userId, notificationIds)

        const response: ApiResponse = {
            success: true,
            message: 'Notifications marked as read'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to mark notifications as read:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update notifications'
        })
    }
}

export const markOneAsRead = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { id } = req.params

        await notificationService.markOneAsRead(req.user.userId, id)

        const response: ApiResponse = {
            success: true,
            message: 'Notification marked as read'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to mark notification as read:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update notification'
        })
    }
}

export const markAllAsRead = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        await notificationService.markAllAsRead(req.user.userId)

        const response: ApiResponse = {
            success: true,
            message: 'All notifications marked as read'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to mark all notifications as read:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update notifications'
        })
    }
}

export const getUnreadCount = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const count = await notificationService.getUnreadCount(req.user.userId)

        const response: ApiResponse = {
            success: true,
            data: { unreadCount: count }
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get unread count:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get unread count'
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

        const { token, platform } = req.body

        if (!token || !platform) {
            return res.status(400).json({
                success: false,
                error: 'Device token and platform are required'
            })
        }

        await notificationService.updateDeviceToken(req.user.userId, token, platform)

        const response: ApiResponse = {
            success: true,
            message: 'Device token updated successfully'
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to update device token:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to update device token'
        })
    }
}
