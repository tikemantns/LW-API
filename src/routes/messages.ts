import { Router } from 'express'
import * as messageController from '../controllers/messageController'
import { verifyToken } from '../middleware/auth'

const router = Router()

// Message routes
router.get('/conversations', verifyToken, messageController.getConversations)
router.post('/conversations', verifyToken, messageController.createConversation)
router.get('/:conversationId', verifyToken, messageController.getConversationMessages)
router.post('/:conversationId', verifyToken, messageController.sendMessageToConversation)
router.put('/:conversationId/read', verifyToken, messageController.markAsRead)

export default router
