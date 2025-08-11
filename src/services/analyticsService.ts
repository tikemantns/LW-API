import { Analytics, Work, User, Payment } from '../models'
import logger from '../utils/logger'

export const trackEvent = async (eventData: {
    userId?: string
    event: string
    workId?: string
    data?: Record<string, any>
    sessionId?: string
    userAgent?: string
    ipAddress?: string
}) => {
    try {
        const analytics = new Analytics(eventData)
        await analytics.save()

        return analytics
    } catch (error) {
        logger.error('Error tracking event:', error)
        throw new Error('Failed to track event')
    }
}

export const getUserDashboard = async (userId: string) => {
    try {
        const [
            totalWorks,
            activeWorks,
            completedWorks,
            totalEarnings,
            recentActivity
        ] = await Promise.all([
            Work.countDocuments({ postedBy: userId }),
            Work.countDocuments({ postedBy: userId, status: 'active' }),
            Work.countDocuments({ postedBy: userId, status: 'completed' }),
            Payment.aggregate([
                { $match: { payeeId: userId, status: 'completed' } },
                { $group: { _id: null, total: { $sum: '$amount' } } }
            ]),
            Analytics.find({ userId })
                .sort({ createdAt: -1 })
                .limit(10)
        ])

        return {
            works: {
                total: totalWorks,
                active: activeWorks,
                completed: completedWorks
            },
            earnings: totalEarnings[0]?.total || 0,
            recentActivity
        }
    } catch (error) {
        logger.error('Error getting user dashboard:', error)
        throw new Error('Failed to get dashboard')
    }
}

export const getSystemStats = async () => {
    try {
        const [
            totalUsers,
            totalWorks,
            activeWorks,
            totalPayments,
            recentSignups
        ] = await Promise.all([
            User.countDocuments(),
            Work.countDocuments(),
            Work.countDocuments({ status: 'active' }),
            Payment.countDocuments({ status: 'completed' }),
            User.countDocuments({
                createdAt: { $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) }
            })
        ])

        return {
            users: {
                total: totalUsers,
                recentSignups
            },
            works: {
                total: totalWorks,
                active: activeWorks
            },
            payments: {
                total: totalPayments
            }
        }
    } catch (error) {
        logger.error('Error getting system stats:', error)
        throw new Error('Failed to get system stats')
    }
}

export const getPopularCategories = async () => {
    try {
        const categories = await Work.aggregate([
            { $group: { _id: '$category', count: { $sum: 1 } } },
            { $sort: { count: -1 } },
            { $limit: 10 }
        ])

        return categories
    } catch (error) {
        logger.error('Error getting popular categories:', error)
        throw new Error('Failed to get popular categories')
    }
}
