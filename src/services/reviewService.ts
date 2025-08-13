import { Review } from '../models'
import { Types } from 'mongoose'
import logger from '../utils/logger'

const isValidObjectId = (id: string): boolean => {
    return Types.ObjectId.isValid(id) && (String(new Types.ObjectId(id)) === id)
}

export const createReview = async (reviewData: {
    workId: string
    reviewerId: string
    revieweeId: string
    rating: number
    comment?: string
    reviewType: 'worker_review' | 'employer_review'
}) => {
    try {
        // Validate ObjectIds
        if (!isValidObjectId(reviewData.workId) || 
            !isValidObjectId(reviewData.reviewerId) || 
            !isValidObjectId(reviewData.revieweeId)) {
            throw new Error('Invalid ID format provided')
        }

        // Check if review already exists
        const existingReview = await Review.findOne({
            workId: reviewData.workId,
            reviewerId: reviewData.reviewerId,
            revieweeId: reviewData.revieweeId
        })

        if (existingReview) {
            throw new Error('Review already exists for this work')
        }

        const review = new Review(reviewData)
        await review.save()

        return review
    } catch (error) {
        logger.error('Error creating review:', error)
        throw error
    }
}

export const getUserReviews = async (userId: string) => {
    try {
        // Validate ObjectId
        if (!isValidObjectId(userId)) {
            // Return empty array for invalid IDs instead of throwing error
            return []
        }

        const reviews = await Review.find({ revieweeId: userId })
            .populate('reviewerId', 'name profilePhoto')
            .populate('workId', 'title category')
            .sort({ createdAt: -1 })

        return reviews
    } catch (error) {
        logger.error('Error getting user reviews:', error)
        throw new Error('Failed to get reviews')
    }
}

export const getWorkReviews = async (workId: string) => {
    try {
        // Validate ObjectId
        if (!isValidObjectId(workId)) {
            // Return empty array for invalid IDs instead of throwing error
            return []
        }

        const reviews = await Review.find({ workId })
            .populate('reviewerId', 'name profilePhoto')
            .populate('revieweeId', 'name profilePhoto')
            .sort({ createdAt: -1 })

        return reviews
    } catch (error) {
        logger.error('Error getting work reviews:', error)
        throw new Error('Failed to get work reviews')
    }
}

export const getUserRatingStats = async (userId: string) => {
    try {
        // Validate ObjectId
        if (!isValidObjectId(userId)) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingBreakdown: []
            }
        }

        const stats = await Review.aggregate([
            { $match: { revieweeId: new Types.ObjectId(userId) } },
            {
                $group: {
                    _id: null,
                    averageRating: { $avg: '$rating' },
                    totalReviews: { $sum: 1 },
                    ratingBreakdown: {
                        $push: '$rating'
                    }
                }
            }
        ])

        if (stats.length === 0) {
            return {
                averageRating: 0,
                totalReviews: 0,
                ratingBreakdown: []
            }
        }

        return stats[0]
    } catch (error) {
        logger.error('Error getting user rating stats:', error)
        throw new Error('Failed to get rating stats')
    }
}
