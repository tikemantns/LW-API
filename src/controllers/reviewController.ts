import { Request, Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import * as reviewService from '../services/reviewService'
import logger from '../utils/logger'

export const getReviews = async (req: Request, res: Response) => {
    try {
        const { targetType, targetId } = req.query

        if (!targetType || !targetId) {
            return res.status(400).json({
                success: false,
                error: 'targetType and targetId are required'
            })
        }

        if (!['user', 'work'].includes(targetType as string)) {
            return res.status(400).json({
                success: false,
                error: 'targetType must be either "user" or "work"'
            })
        }

        let reviews
        if (targetType === 'user') {
            reviews = await reviewService.getUserReviews(targetId as string)
        } else {
            reviews = await reviewService.getWorkReviews(targetId as string)
        }

        res.json({
            success: true,
            data: reviews
        })
    } catch (error) {
        res.status(500).json({
            success: false,
            error: 'Failed to get reviews'
        })
    }
}

export const createReview = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { workId, revieweeId, rating, comment, reviewType } = req.body

        const review = await reviewService.createReview({
            workId,
            reviewerId: req.user.userId,
            revieweeId,
            rating,
            comment,
            reviewType
        })

        res.status(201).json({
            success: true,
            data: review
        })
    } catch (error) {
        logger.error('Failed to create review:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to create review'
        })
    }
}

export const getUserReviews = async (req: JWTAuthRequest, res: Response) => {
    try {
        const { userId } = req.params
        
        const reviews = await reviewService.getUserReviews(userId)

        res.json({
            success: true,
            data: reviews
        })
    } catch (error) {
        logger.error('Failed to get reviews:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get reviews'
        })
    }
}

export const getWorkReviews = async (req: JWTAuthRequest, res: Response) => {
    try {
        const { workId } = req.params
        
        const reviews = await reviewService.getWorkReviews(workId)

        res.json({
            success: true,
            data: reviews
        })
    } catch (error) {
        logger.error('Failed to get work reviews:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get work reviews'
        })
    }
}
