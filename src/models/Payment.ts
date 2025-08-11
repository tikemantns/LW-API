import mongoose, { Schema, Document } from 'mongoose'

export interface IPayment extends Document {
    workId: mongoose.Types.ObjectId
    payerId: mongoose.Types.ObjectId  // Who is paying
    payeeId: mongoose.Types.ObjectId  // Who is receiving payment
    amount: number
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded' | 'cancelled'
    paymentMethod: 'card' | 'upi' | 'bank_transfer' | 'wallet' | 'cash'
    transactionId?: string
    platformFee: number
    taxes: number
    finalAmount: number  // Amount after fees and taxes
    paymentGateway?: 'razorpay' | 'stripe' | 'payu' | 'phonepe'
    gatewayTransactionId?: string
    gatewayResponse?: Record<string, unknown>
    escrowReleased: boolean  // For escrow payments
    releaseDate?: Date
    refundAmount?: number
    refundReason?: string
    paymentDate?: Date
    dueDate?: Date
    createdAt: Date
    updatedAt: Date
}

const PaymentSchema = new Schema<IPayment>(
    {
        workId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Work', 
            required: true,
            index: true
        },
        payerId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        payeeId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        amount: { 
            type: Number, 
            required: true,
            min: 0
        },
        status: { 
            type: String, 
            enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'cancelled'], 
            default: 'pending',
            index: true
        },
        paymentMethod: {
            type: String,
            enum: ['card', 'upi', 'bank_transfer', 'wallet', 'cash'],
            required: true,
            index: true
        },
        transactionId: { 
            type: String,
            unique: true,
            sparse: true,
            index: true
        },
        platformFee: { 
            type: Number, 
            default: 0,
            min: 0
        },
        taxes: {
            type: Number,
            default: 0,
            min: 0
        },
        finalAmount: {
            type: Number,
            required: true,
            min: 0
        },
        paymentGateway: {
            type: String,
            enum: ['razorpay', 'stripe', 'payu', 'phonepe']
        },
        gatewayTransactionId: {
            type: String,
            index: true
        },
        gatewayResponse: {
            type: Schema.Types.Mixed
        },
        escrowReleased: {
            type: Boolean,
            default: false,
            index: true
        },
        releaseDate: {
            type: Date
        },
        refundAmount: {
            type: Number,
            min: 0
        },
        refundReason: {
            type: String,
            trim: true,
            maxlength: 500
        },
        paymentDate: {
            type: Date
        },
        dueDate: {
            type: Date,
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'payments'
    }
)

// Indexes
PaymentSchema.index({ workId: 1, status: 1 })
PaymentSchema.index({ payerId: 1, status: 1 })
PaymentSchema.index({ payeeId: 1, status: 1 })
PaymentSchema.index({ status: 1, dueDate: 1 })
PaymentSchema.index({ transactionId: 1 })
PaymentSchema.index({ createdAt: -1 })

// Virtual fields
PaymentSchema.virtual('isCompleted').get(function() {
    return this.status === 'completed'
})

PaymentSchema.virtual('isPending').get(function() {
    return this.status === 'pending'
})

PaymentSchema.virtual('isOverdue').get(function() {
    return this.dueDate && this.dueDate < new Date() && this.status === 'pending'
})

// Methods
PaymentSchema.methods.updateStatus = function(status: string, transactionId?: string) {
    this.status = status
    if (transactionId) {
        this.transactionId = transactionId
    }
    if (status === 'completed') {
        this.paymentDate = new Date()
    }
    return this.save()
}

PaymentSchema.methods.calculateFinalAmount = function() {
    this.finalAmount = this.amount + this.platformFee + this.taxes
    return this.save()
}

export const Payment = mongoose.model<IPayment>('Payment', PaymentSchema)
