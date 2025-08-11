import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
    userId: mongoose.Types.ObjectId
    title: string
    message: string
    type: 'work_application' | 'work_accepted' | 'work_completed' | 'work_started' | 'message' | 'payment' | 'review' | 'system'
    relatedId?: mongoose.Types.ObjectId
    read: boolean
    priority: 'low' | 'medium' | 'high' | 'urgent'
    data?: Record<string, unknown>
    actionRequired?: boolean
    actionUrl?: string  // Deep link for mobile app
    scheduledFor?: Date  // For scheduled notifications
    sent: boolean
    deliveryStatus?: 'pending' | 'sent' | 'delivered' | 'failed'
    createdAt: Date
    updatedAt: Date
}

const NotificationSchema = new Schema<INotification>(
    {
        userId: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        title: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 200
        },
        message: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 1000
        },
        type: { 
            type: String, 
            enum: [
                'work_application', 
                'work_accepted', 
                'work_completed', 
                'work_started',
                'message', 
                'payment', 
                'review',
                'system'
            ], 
            required: true,
            index: true
        },
        relatedId: { 
            type: Schema.Types.ObjectId,
            index: true
        },
        read: { 
            type: Boolean, 
            default: false,
            index: true
        },
        priority: {
            type: String,
            enum: ['low', 'medium', 'high', 'urgent'],
            default: 'medium',
            index: true
        },
        data: { 
            type: Schema.Types.Mixed 
        },
        actionRequired: {
            type: Boolean,
            default: false,
            index: true
        },
        actionUrl: {
            type: String,
            trim: true
        },
        scheduledFor: {
            type: Date,
            index: true
        },
        sent: {
            type: Boolean,
            default: false,
            index: true
        },
        deliveryStatus: {
            type: String,
            enum: ['pending', 'sent', 'delivered', 'failed'],
            default: 'pending',
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'notifications'
    }
)

// Indexes
NotificationSchema.index({ userId: 1, read: 1 })
NotificationSchema.index({ userId: 1, createdAt: -1 })
NotificationSchema.index({ type: 1, createdAt: -1 })
NotificationSchema.index({ scheduledFor: 1, sent: 1 })
NotificationSchema.index({ actionRequired: 1, read: 1 })

// Virtual fields
NotificationSchema.virtual('isUnread').get(function() {
    return !this.read
})

NotificationSchema.virtual('isOverdue').get(function() {
    return this.scheduledFor && this.scheduledFor < new Date() && !this.sent
})

// Methods
NotificationSchema.methods.markAsRead = function() {
    this.read = true
    return this.save()
}

NotificationSchema.methods.markAsSent = function() {
    this.sent = true
    this.deliveryStatus = 'sent'
    return this.save()
}

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema)
