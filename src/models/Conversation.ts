import mongoose, { Schema, Document } from 'mongoose'

export interface IConversation extends Document {
    participants: mongoose.Types.ObjectId[]
    workId?: mongoose.Types.ObjectId
    lastMessage?: string
    lastMessageAt?: Date
    unreadCount: Map<string, number>
    conversationType: 'work_chat' | 'general_chat'
    isActive: boolean
    createdAt: Date
    updatedAt: Date
}

const ConversationSchema = new Schema<IConversation>(
    {
        participants: [{ 
            type: Schema.Types.ObjectId, 
            ref: 'User',
            required: true
        }],
        workId: { 
            type: Schema.Types.ObjectId, 
            ref: 'Work',
            index: true
        },
        lastMessage: { 
            type: String,
            trim: true,
            maxlength: 500
        },
        lastMessageAt: { 
            type: Date,
            index: true
        },
        unreadCount: { 
            type: Map, 
            of: Number,
            default: new Map()
        },
        conversationType: {
            type: String,
            enum: ['work_chat', 'general_chat'],
            default: 'work_chat',
            index: true
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true
        }
    },
    {
        timestamps: true,
        collection: 'conversations'
    }
)

// Indexes
ConversationSchema.index({ participants: 1 })
ConversationSchema.index({ workId: 1, isActive: 1 })
ConversationSchema.index({ lastMessageAt: -1 })
ConversationSchema.index({ isActive: 1, lastMessageAt: -1 })

// Methods
ConversationSchema.methods.updateLastMessage = function(message: string) {
    this.lastMessage = message
    this.lastMessageAt = new Date()
    return this.save()
}

ConversationSchema.methods.incrementUnreadCount = function(userId: string) {
    const currentCount = this.unreadCount.get(userId) || 0
    this.unreadCount.set(userId, currentCount + 1)
    return this.save()
}

ConversationSchema.methods.resetUnreadCount = function(userId: string) {
    this.unreadCount.set(userId, 0)
    return this.save()
}

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema)
