import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import { createReview, getUserReviews, getWorkReviews } from '../controllers/reviewController'

const router = Router()

// Create review
router.post('/', verifyToken, createReview)

// Get user reviews
router.get('/user/:userId', getUserReviews)

// Get work reviews
router.get('/work/:workId', getWorkReviews)

export default router
