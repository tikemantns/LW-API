import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import * as reviewService from '../services/reviewService'
import logger from '../utils/logger'

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
