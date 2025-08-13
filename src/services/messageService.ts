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
        // Create or update conversation
        let conversation = await Conversation.findOne({
            participants: { $all: [messageData.senderId, messageData.recipientId] }
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [messageData.senderId, messageData.recipientId],
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

export const sendMessageToConversation = async (params: {
    senderId: string
    conversationId: string
    message: string
}) => {
    try {
        const conversation = await Conversation.findById(params.conversationId)
        if (!conversation || !conversation.participants.some(p => p.toString() === params.senderId)) {
            throw new Error('Conversation not found or access denied')
        }

        // Determine recipient as the other participant
        const recipientId = conversation.participants.find(p => p.toString() !== params.senderId)?.toString()
        if (!recipientId) {
            throw new Error('Recipient not found in conversation')
        }

        // Update conversation last message and unread count
        conversation.lastMessage = params.message
        conversation.lastMessageAt = new Date()
        const currentUnread = conversation.unreadCount?.get(recipientId) || 0
        conversation.unreadCount?.set(recipientId, currentUnread + 1)
        await conversation.save()

        // Create message
        const msg = await Message.create({
            conversationId: conversation._id.toString(),
            sender: params.senderId,
            recipient: recipientId,
            message: params.message
        })

        return await Message.findById(msg._id)
            .populate('sender', 'name userType')
            .populate('recipient', 'name userType')
    } catch (error) {
        logger.error('Failed to send message to conversation:', error)
        throw new Error('Failed to send message')
    }
}

export const markConversationAsRead = async (conversationId: string, userId: string) => {
    try {
        const conversation = await Conversation.findOne({ _id: conversationId, participants: userId })
        if (!conversation) {
            throw new Error('Conversation not found or access denied')
        }

        // Reset unread count for this user
        conversation.unreadCount?.set(userId, 0)
        await conversation.save()

        // Mark messages read for this user
        await Message.updateMany(
            { conversationId, recipient: userId, readAt: null },
            { readAt: new Date() }
        )

        return true
    } catch (error) {
        logger.error('Failed to mark conversation as read:', error)
        throw new Error('Failed to mark as read')
    }
}

export const createConversation = async (userId: string, participantId: string, workId?: string) => {
    try {
        let conversation = await Conversation.findOne({
            participants: { $all: [userId, participantId] },
            workId: workId || undefined
        })

        if (!conversation) {
            conversation = await Conversation.create({
                participants: [userId, participantId],
                workId,
                lastMessage: '',
                lastMessageAt: new Date(0)
            })
        }

        await conversation.populate('participants', 'name userType')
        await conversation.populate('workId', 'title')
        return conversation
    } catch (error) {
        logger.error('Failed to create conversation:', error)
        throw new Error('Failed to create conversation')
    }
}
