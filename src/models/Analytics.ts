import mongoose, { Schema, Document } from 'mongoose'

export interface IAnalytics extends Document {
    userId?: mongoose.Types.ObjectId
    event: string
    workId?: mongoose.Types.ObjectId
    data?: Record<string, unknown>
    sessionId?: string
    userAgent?: string
    ipAddress?: string
    appVersion?: string
    platform?: 'android' | 'ios' | 'web'
    location?: {
        latitude?: number
        longitude?: number
        city?: string
        state?: string
        country?: string
    }
    referrer?: string
    duration?: number  // For time-based events (in seconds)
    createdAt: Date
    updatedAt: Date
}

const AnalyticsSchema = new Schema<IAnalytics>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            index: true
        },
        event: { 
            type: String, 
            required: true,
            trim: true,
            index: true
        },
        workId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Work',
            index: true
        },
        data: { 
            type: Schema.Types.Mixed 
        },
        sessionId: { 
            type: String,
            trim: true,
            index: true
        },
        userAgent: { 
            type: String,
            trim: true
        },
        ipAddress: { 
            type: String,
            trim: true
        },
        appVersion: {
            type: String,
            trim: true,
            index: true
        },
        platform: {
            type: String,
            enum: ['android', 'ios', 'web'],
            index: true
        },
        location: {
            latitude: { type: Number, min: -90, max: 90 },
            longitude: { type: Number, min: -180, max: 180 },
            city: { type: String, trim: true },
            state: { type: String, trim: true },
            country: { type: String, trim: true, index: true }
        },
        referrer: {
            type: String,
            trim: true
        },
        duration: {
            type: Number,
            min: 0
        }
    },
    {
        timestamps: true,
        collection: 'analytics'
    }
)

// Indexes for better performance
AnalyticsSchema.index({ userId: 1, event: 1 })
AnalyticsSchema.index({ event: 1, createdAt: -1 })
AnalyticsSchema.index({ workId: 1, event: 1 })
AnalyticsSchema.index({ sessionId: 1, createdAt: 1 })
AnalyticsSchema.index({ platform: 1, appVersion: 1 })
AnalyticsSchema.index({ createdAt: -1 })

// TTL index - automatically delete old analytics data after 2 years
AnalyticsSchema.index({ createdAt: 1 }, { expireAfterSeconds: 63072000 }) // 2 years

export const Analytics = mongoose.model<IAnalytics>('Analytics', AnalyticsSchema)
