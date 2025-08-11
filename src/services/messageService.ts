import { Message, Conversation } from '../models'
import logger from '../utils/logger'

export const getUserConversations = async (userId: string) => {
    try {
        const conversations = await Conversation.find({
            participants: userId
        })
            .populate('participants', 'name userType')
            .populate('workId', 'title')
            .sort({ lastMessageAt: -1 })

        return conversations
    } catch (error) {
        logger.error('Failed to get user conversations:', error)
        throw new Error('Failed to get conversations')
    }
}

export const getConversationMessages = async (conversationId: string, userId: string) => {
    try {
        // Verify user is part of the conversation
        const conversation = await Conversation.findOne({
            _id: conversationId,
            participants: userId
        })

        if (!conversation) {
            throw new Error('Conversation not found or access denied')
        }

        const messages = await Message.find({ conversationId })
            .populate('sender', 'name userType')
            .populate('recipient', 'name userType')
            .sort({ createdAt: 1 })

        // Mark messages as read
        await Message.updateMany(
            { conversationId, recipient: userId, readAt: null },
            { readAt: new Date() }
        )

        return messages
    } catch (error) {
        logger.error('Failed to get conversation messages:', error)
        throw error
    }
}

export const sendMessage = async (messageData: {
    senderId: string
    recipientId: string
    message: string
    workId?: string
}) => {
    try {
        // Generate conversation ID
        const participants = [messageData.senderId, messageData.recipientId].sort()
        const conversationId = participants.join('-')

        // Create or update conversation
        let conversation = await Conversation.findOne({
            participants: { $all: participants }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants,
                workId: messageData.workId,
                lastMessage: messageData.message,
                lastMessageAt: new Date(),
                unreadCount: new Map([[messageData.recipientId, 1]])
            })
        } else {
            conversation.lastMessage = messageData.message
            conversation.lastMessageAt = new Date()
            
            const currentUnread = conversation.unreadCount?.get(messageData.recipientId) || 0
            conversation.unreadCount?.set(messageData.recipientId, currentUnread + 1)
            
            await conversation.save()
        }

        // Create message
        const message = await Message.create({
            conversationId: conversation._id.toString(),
            sender: messageData.senderId,
            recipient: messageData.recipientId,
            message: messageData.message,
            workId: messageData.workId
        })

        return await Message.findById(message._id)
            .populate('sender', 'name userType')
            .populate('recipient', 'name userType')
    } catch (error) {
        logger.error('Failed to send message:', error)
        throw new Error('Failed to send message')
    }
}
