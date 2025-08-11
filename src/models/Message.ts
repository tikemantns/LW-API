import mongoose, { Schema, Document } from 'mongoose'

export interface IMessage extends Document {
    conversationId: string
    sender: mongoose.Types.ObjectId
    recipient: mongoose.Types.ObjectId
    message: string
    workId?: mongoose.Types.ObjectId
    readAt?: Date
    messageType: 'text' | 'image' | 'file' | 'location' | 'voice'
    attachments?: Array<{
        type: 'image' | 'file' | 'voice'
        url: string
        fileName?: string
        fileSize?: number
    }>
    replyTo?: mongoose.Types.ObjectId  // For message replies
    isSystemMessage: boolean
    createdAt: Date
    updatedAt: Date
}

const MessageSchema = new Schema<IMessage>(
    {
        conversationId: { 
            type: String, 
            required: true,
            index: true
        },
        sender: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        recipient: { 
            type: Schema.Types.ObjectId, 
            ref: 'User', 
            required: true,
            index: true
        },
        message: { 
            type: String, 
            required: true,
            trim: true,
            maxlength: 2000
        },
        workId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Work',
            index: true
        },
        readAt: { type: Date },
        messageType: { 
            type: String, 
            enum: ['text', 'image', 'file', 'location', 'voice'], 
            default: 'text',
            index: true
        },
        attachments: [{
            type: { 
                type: String, 
                enum: ['image', 'file', 'voice'], 
                required: true 
            },
            url: { type: String, required: true },
            fileName: { type: String },
            fileSize: { type: Number, min: 0 }
        }],
        replyTo: { 
            type: Schema.Types.ObjectId, 
            ref: 'Message' 
        },
        isSystemMessage: { 
            type: Boolean, 
            default: false 
        }
    },
    {
        timestamps: true,
        collection: 'messages'
    }
)

// Indexes
MessageSchema.index({ conversationId: 1, createdAt: -1 })
MessageSchema.index({ sender: 1, createdAt: -1 })
MessageSchema.index({ recipient: 1, readAt: 1 })
MessageSchema.index({ workId: 1 })

// Virtual fields
MessageSchema.virtual('isRead').get(function() {
    return !!this.readAt
})

// Methods
MessageSchema.methods.markAsRead = function() {
    if (!this.readAt) {
        this.readAt = new Date()
        return this.save()
    }
    return Promise.resolve(this)
}

export const Message = mongoose.model<IMessage>('Message', MessageSchema)
