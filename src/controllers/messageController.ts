import { Response } from 'express'
import { JWTAuthRequest } from '../middleware/auth'
import { ApiResponse } from '../types'
import * as messageService from '../services/messageService'
import logger from '../utils/logger'

export const getConversations = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const conversations = await messageService.getUserConversations(req.user.userId)

        const response: ApiResponse = {
            success: true,
            data: conversations
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get conversations:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get conversations'
        })
    }
}

export const getConversationMessages = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { conversationId } = req.params
        const messages = await messageService.getConversationMessages(conversationId, req.user.userId)

        const response: ApiResponse = {
            success: true,
            data: messages
        }

        res.status(200).json(response)
    } catch (error) {
        logger.error('Failed to get conversation messages:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to get conversation messages'
        })
    }
}

export const sendMessage = async (req: JWTAuthRequest, res: Response) => {
    try {
        if (!req.user?.userId) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required'
            })
        }

        const { recipientId, message, workId } = req.body

        if (!recipientId || !message) {
            return res.status(400).json({
                success: false,
                error: 'Recipient ID and message are required'
            })
        }

        const sentMessage = await messageService.sendMessage({
            senderId: req.user.userId,
            recipientId,
            message,
            workId
        })

        const response: ApiResponse = {
            success: true,
            data: sentMessage,
            message: 'Message sent successfully'
        }

        res.status(201).json(response)
    } catch (error) {
        logger.error('Failed to send message:', error)
        res.status(500).json({
            success: false,
            error: 'Failed to send message'
        })
    }
}
