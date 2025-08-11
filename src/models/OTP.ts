import mongoose, { Schema, Document } from 'mongoose'

export interface IOTP extends Document {
    phoneNumber: string
    otp: string
    expiresAt: Date
    verified: boolean
    attempts: number
    createdAt: Date
    updatedAt: Date
}

const OTPSchema = new Schema<IOTP>(
    {
        phoneNumber: { 
            type: String, 
            required: true,
            trim: true,
            index: true
        },
        otp: { 
            type: String, 
            required: true,
            minlength: 4,
            maxlength: 6
        },
        expiresAt: { 
            type: Date, 
            required: true,
            index: { expireAfterSeconds: 0 }  // Auto-delete expired documents
        },
        verified: { 
            type: Boolean, 
            default: false,
            index: true
        },
        attempts: { 
            type: Number, 
            default: 0,
            max: 5  // Maximum 5 attempts
        }
    },
    {
        timestamps: true,
        collection: 'otps'
    }
)

// Indexes
OTPSchema.index({ phoneNumber: 1, verified: 1 })
OTPSchema.index({ expiresAt: 1 })

// Methods
OTPSchema.methods.isExpired = function(): boolean {
    return new Date() > this.expiresAt
}

OTPSchema.methods.incrementAttempts = function() {
    this.attempts += 1
    return this.save()
}

export const OTP = mongoose.model<IOTP>('OTP', OTPSchema)
