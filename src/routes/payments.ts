import { Router } from 'express'
import { verifyToken } from '../middleware/auth'
import { getUserEarnings, initiatePayment, getPaymentHistory } from '../controllers/paymentController'

const router = Router()

// Get user earnings
router.get('/earnings', verifyToken, getUserEarnings)

// Initiate payment
router.post('/initiate', verifyToken, initiatePayment)

// Get payment history
router.get('/history', verifyToken, getPaymentHistory)

export default router
