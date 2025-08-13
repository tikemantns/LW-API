import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import { createReview, getUserReviews, getWorkReviews, getReviews } from '../controllers/reviewController'

const router = Router()

// Get reviews with filters
router.get('/', getReviews)

// Create review
router.post('/', verifyToken, createReview)

// Get user reviews
router.get('/user/:userId', getUserReviews)

// Get work reviews
router.get('/work/:workId', getWorkReviews)

export default router
