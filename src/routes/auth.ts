import { Router } from 'express'
import * as authController from '../controllers/authController'

const router = Router()

// Authentication routes for Local Work app
router.post('/send-otp', authController.sendOTP)
router.post('/resend-otp', authController.resendOTP)
router.post('/verify-otp', authController.verifyOTP)
router.post('/register', authController.register)
router.post('/logout', authController.logout)

export default router
