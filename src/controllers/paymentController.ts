import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import * as paymentService from '../services/paymentService'
import logger from '../utils/logger'

export const getUserEarnings = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const earnings = await paymentService.getUserEarnings(req.user.userId)

        res.json({
            success: true,
            data: earnings
        })
    } catch (error) {
        logger.error('Failed to get earnings:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get earnings'
        })
    }
}

export const initiatePayment = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { workId, amount, payeeId } = req.body

        const payment = await paymentService.initiatePayment({
            workId,
            payerId: req.user.userId,
            payeeId,
            amount
        })

        res.json({
            success: true,
            data: payment
        })
    } catch (error) {
        logger.error('Failed to initiate payment:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to initiate payment'
        })
    }
}

export const getPaymentHistory = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const payments = await paymentService.getUserPayments(req.user.userId)

        res.json({
            success: true,
            data: payments
        })
    } catch (error) {
        logger.error('Failed to get payment history:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get payment history'
        })
    }
}
