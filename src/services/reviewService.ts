import { Review } from '../models'
import logger from '../utils/logger'

export const createReview = async (reviewData: {
    workId: string
    reviewerId: string
    revieweeId: string
    rating: number
    comment?: string
    reviewType: 'worker_review' | 'employer_review'
}) => {
    try {
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
        const stats = await Review.aggregate([
            { $match: { revieweeId: userId } },
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
