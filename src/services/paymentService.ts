import { Payment } from '../models'
import logger from '../utils/logger'

export const getUserEarnings = async (userId: string) => {
    try {
        const earnings = await Payment.aggregate([
            {
                $match: {
                    payeeId: userId,
                    status: 'completed'
                }
            },
            {
                $group: {
                    _id: null,
                    totalEarnings: { $sum: '$amount' },
                    count: { $sum: 1 }
                }
            }
        ])

        return earnings[0] || { totalEarnings: 0, count: 0 }
    } catch (error) {
        logger.error('Error getting user earnings:', error)
        throw new Error('Failed to get earnings')
    }
}

export const initiatePayment = async (paymentData: {
    workId: string
    payerId: string
    payeeId: string
    amount: number
}) => {
    try {
        const payment = new Payment({
            ...paymentData,
            status: 'pending',
            platformFee: paymentData.amount * 0.05 // 5% platform fee
        })

        await payment.save()
        return payment
    } catch (error) {
        logger.error('Error initiating payment:', error)
        throw new Error('Failed to initiate payment')
    }
}

export const getUserPayments = async (userId: string) => {
    try {
        const payments = await Payment.find({
            $or: [
                { payerId: userId },
                { payeeId: userId }
            ]
        })
            .populate('workId', 'title description')
            .populate('payerId', 'name')
            .populate('payeeId', 'name')
            .sort({ createdAt: -1 })

        return payments
    } catch (error) {
        logger.error('Error getting user payments:', error)
        throw new Error('Failed to get payments')
    }
}

export const updatePaymentStatus = async (paymentId: string, status: string, transactionId?: string) => {
    try {
        const updateData: any = { status }
        if (transactionId) {
            updateData.transactionId = transactionId
        }

        const payment = await Payment.findByIdAndUpdate(
            paymentId,
            updateData,
            { new: true }
        )

        return payment
    } catch (error) {
        logger.error('Error updating payment status:', error)
        throw new Error('Failed to update payment status')
    }
}
