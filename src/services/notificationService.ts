import { Notification, User } from '../models'
import logger from '../utils/logger'

export const getUserNotifications = async (userId: string) => {
    try {
        const notifications = await Notification.find({ userId })
            .sort({ createdAt: -1 })
            .limit(50)

        return notifications
    } catch (error) {
        logger.error('Error getting user notifications:', error)
        throw new Error('Failed to get notifications')
    }
}

export const markNotificationsAsRead = async (userId: string, notificationIds: string[]) => {
    try {
        await Notification.updateMany(
            { _id: { $in: notificationIds }, userId },
            { read: true }
        )

        return true
    } catch (error) {
        logger.error('Error marking notifications as read:', error)
        throw new Error('Failed to update notifications')
    }
}

export const updateDeviceToken = async (userId: string, deviceToken: string, platform: string) => {
    try {
        await User.findByIdAndUpdate(
            userId,
            {
                $addToSet: {
                    deviceTokens: { token: deviceToken, platform }
                }
            }
        )

        return true
    } catch (error) {
        logger.error('Error updating device token:', error)
        throw new Error('Failed to update device token')
    }
}

export const createNotification = async (notificationData: {
    userId: string
    title: string
    message: string
    type: string
    relatedId?: string
    data?: any
}) => {
    try {
        const notification = new Notification(notificationData)
        await notification.save()

        return notification
    } catch (error) {
        logger.error('Error creating notification:', error)
        throw new Error('Failed to create notification')
    }
}
