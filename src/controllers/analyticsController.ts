import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import * as analyticsService from '../services/analyticsService'
import logger from '../utils/logger'

export const getDashboard = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const dashboard = await analyticsService.getUserDashboard(req.user.userId)

        res.json({
            success: true,
            data: dashboard
        })
    } catch (error) {
        logger.error('Failed to get dashboard:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get dashboard'
        })
    }
}

export const trackEvent = async (req: JWTAuthRequest, res: Response) => {
    try {
        const { event, workId, data } = req.body

        await analyticsService.trackEvent({
            userId: req.user?.userId,
            event,
            workId,
            data,
            sessionId: req.headers['x-session-id'] as string,
            userAgent: req.headers['user-agent'],
            ipAddress: req.ip
        })

        res.json({
            success: true,
            message: 'Event tracked successfully'
        })
    } catch (error) {
        logger.error('Failed to track event:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to track event'
        })
    }
}

export const getSystemStats = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const stats = await analyticsService.getSystemStats()

        res.json({
            success: true,
            data: stats
        })
    } catch (error) {
        logger.error('Failed to get system stats:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get system stats'
        })
    }
}
